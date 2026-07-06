const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = process.env.DATABASE_URL
  ? require('./database-pg')
  : require('./database');
const { FOOD_DATABASE } = require('./data/foods');
const { analyzeDailyDiet, calculateCopperForMeal } = require('./nutrition/analyzer');
const { getTargets } = require('./nutrition/targets');
const { generateAdvice, EMERGENCY_ADVICE } = require('./nutrition/recommendations');
const { TEST_PANEL, checkAbnormal, getAllTestItems } = require('./tests/testPanel');
const { analyzeTrend, generateTestSummary } = require('./tests/trendAnalyzer');
const { evaluateTreatment } = require('./evaluation/treatmentEval');
const { generateMedicationAdvice } = require('./evaluation/medicationAdvice');
const { recommendBySymptoms, recommendByTestResults, getAllRegions, getDoctorsByRegion, DOCTOR_DATABASE } = require('./data/doctorDatabase');
const { DRUG_DATABASE, findDrug, searchDrugs, getAllDrugCategories } = require('./data/drugDatabase');

const app = express();
const JWT_SECRET = 'wilson-health-manager-secret-key-2024';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// JWT中间件
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: '登录已过期' });
  }
}

// 获取用户年龄的辅助函数
function getUserAge(userId) {
  const profile = db.getProfile(userId);
  if (profile && profile.birthDate) {
    const birth = new Date(profile.birthDate);
    const today = new Date();
    return today.getFullYear() - birth.getFullYear();
  }
  return 5; // 默认5岁
}

// ========== 认证 ==========
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, securityQuestion, securityAnswer } = req.body;
    if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
    if (!securityQuestion || !securityAnswer) return res.status(400).json({ error: '请设置安全问题' });
    const existing = await db.findUserByUsername(username);
    if (existing) return res.status(400).json({ error: '用户名已存在' });
    const hash = bcrypt.hashSync(password, 10);
    const user = await db.createUser(username, hash);
    if (!user) return res.status(500).json({ error: '创建失败' });
    await db.setSecurityQuestion(username, securityQuestion, securityAnswer);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, username: user.username });
  } catch (e) {
    console.error('注册失败:', e);
    res.status(500).json({ error: '注册失败' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.findUserByUsername(username);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, username: user.username });
  } catch (e) {
    console.error('登录失败:', e);
    res.status(500).json({ error: '登录失败' });
  }
});

// ========== 忘记密码 ==========
app.post('/api/forgot-password/question', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: '请输入用户名' });
    const user = await db.findUserByUsername(username);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    if (!user.securityQuestion) return res.status(400).json({ error: '该用户未设置安全问题，无法找回密码' });
    res.json({ question: user.securityQuestion });
  } catch (e) {
    res.status(500).json({ error: '查询失败' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { username, securityAnswer, newPassword } = req.body;
    if (!username || !securityAnswer || !newPassword) return res.status(400).json({ error: '请填写完整' });
    if (newPassword.length < 6) return res.status(400).json({ error: '密码至少6位' });
    const user = await db.findUserByUsername(username);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    if (user.securityAnswer !== securityAnswer) return res.status(403).json({ error: '安全问题答案错误' });
    const hash = bcrypt.hashSync(newPassword, 10);
    await db.updatePassword(username, hash);
    res.json({ success: true, message: '密码已重置，请重新登录' });
  } catch (e) {
    res.status(500).json({ error: '重置失败' });
  }
});

// 已登录用户设置/修改安全问题
app.post('/api/profile/security-question', authMiddleware, async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) return res.status(400).json({ error: '请填写完整' });
    const user = await db.findUserById(req.userId);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    await db.setSecurityQuestion(user.username, question, answer);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: '设置失败' });
  }
});

// ========== 食物数据库 ==========
app.get('/api/foods', (req, res) => {
  const { category, search } = req.query;
  let result = [...FOOD_DATABASE];
  if (category && category !== '全部') result = result.filter(f => f.category === category);
  if (search) result = result.filter(f => f.name.includes(search));
  res.json(result);
});

app.get('/api/foods/categories', (req, res) => {
  const cats = [...new Set(FOOD_DATABASE.map(f => f.category))];
  res.json(cats);
});

// 自定义食物
app.post('/api/foods/custom', authMiddleware, async (req, res) => {
  try {
    const food = { ...req.body, userId: req.userId };
    res.json(await db.addCustomFood(food));
  } catch (e) { res.status(500).json({ error: '添加失败' }); }
});

app.get('/api/foods/custom', authMiddleware, async (req, res) => {
  try { res.json(await db.getCustomFoods(req.userId)); }
  catch (e) { res.status(500).json({ error: '查询失败' }); }
});

// ========== 宝宝档案 ==========
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await db.getProfile(req.userId);
    res.json(profile || {});
  } catch (e) { res.status(500).json({ error: '查询失败' }); }
});

app.post('/api/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await db.saveProfile(req.userId, req.body);
    res.json(profile);
  } catch (e) { res.status(500).json({ error: '保存失败' }); }
});

// ========== 饮食记录 ==========
app.post('/api/diet', authMiddleware, async (req, res) => {
  try {
    const record = { ...req.body, userId: req.userId };
    // 计算各营养素
    if (record.foods) {
      let totals = { copper: 0, calcium: 0, protein: 0, vitaminB6: 0, zinc: 0, iron: 0 };
      const customFoods = await db.getCustomFoods(req.userId);
      for (const food of record.foods) {
        const dbFood = FOOD_DATABASE.find(f => f.id === food.foodId) ||
                       customFoods.find(f => f.id === food.foodId);
        if (dbFood) {
          const ratio = (food.amount || 100) / 100;
          food.copperMg = Math.round((dbFood.copper || 0) * ratio * 100) / 100;
        food.calciumMg = Math.round((dbFood.calcium || 0) * ratio * 100) / 100;
        food.proteinG = Math.round((dbFood.protein || 0) * ratio * 100) / 100;
        food.b6Mg = Math.round((dbFood.vitaminB6 || 0) * ratio * 100) / 100;
        food.zincMg = Math.round((dbFood.zinc || 0) * ratio * 100) / 100;
        food.ironMg = Math.round((dbFood.iron || 0) * ratio * 100) / 100;
        food.rating = dbFood.rating || '未知';
        totals.copper += food.copperMg;
        totals.calcium += food.calciumMg;
        totals.protein += food.proteinG;
        totals.vitaminB6 += food.b6Mg;
        totals.zinc += food.zincMg;
        totals.iron += food.ironMg;
      }
    }
    for (const k of Object.keys(totals)) totals[k] = Math.round(totals[k] * 100) / 100;
    record.totals = totals;

    // 预警级别
    if (totals.copper >= 1.0) record.alertLevel = 'danger';
    else if (totals.copper >= 0.8) record.alertLevel = 'warning';
    else if (totals.copper >= 0.3) record.alertLevel = 'caution';
    else record.alertLevel = 'normal';
  }
  const result = await db.addDietRecord(record);
  res.json(result);
  } catch (e) { res.status(500).json({ error: '保存失败', message: e.message }); }
});

app.get('/api/diet/:date', authMiddleware, async (req, res) => {
  try {
    res.json(await db.getDietRecords(req.userId, req.params.date));
  } catch (e) { res.status(500).json({ error: '查询失败' }); }
});

app.get('/api/diet-range', authMiddleware, async (req, res) => {
  try {
    const { start, end } = req.query;
    res.json(await db.getDietRecordsRange(req.userId, start, end));
  } catch (e) { res.status(500).json({ error: '查询失败' }); }
});

app.delete('/api/diet/:id', authMiddleware, async (req, res) => {
  try { res.json({ success: await db.deleteDietRecord(req.params.id) }); }
  catch (e) { res.status(500).json({ error: '操作失败' }); }
});

// ========== 用药管理 ==========
app.get('/api/medications', authMiddleware, async (req, res) => {
  try { res.json(await db.getMedications(req.userId)); }
  catch (e) { res.status(500).json({ error: '查询失败' }); }
});

app.post('/api/medications', authMiddleware, async (req, res) => {
  try { res.json(await db.saveMedication(req.userId, req.body)); }
  catch (e) { res.status(500).json({ error: '保存失败' }); }
});

app.delete('/api/medications/:id', authMiddleware, async (req, res) => {
  try { res.json({ success: await db.deleteMedication(req.userId, req.params.id) }); }
  catch (e) { res.status(500).json({ error: '操作失败' }); }
});

app.post('/api/medication-logs', authMiddleware, async (req, res) => {
  try { res.json(await db.addMedicationLog({ ...req.body, userId: req.userId })); }
  catch (e) { res.status(500).json({ error: '操作失败' }); }
});

app.get('/api/medication-logs/:date', authMiddleware, async (req, res) => {
  try { res.json(await db.getMedicationLogs(req.userId, req.params.date)); }
  catch (e) { res.status(500).json({ error: '操作失败' }); }
});

// ========== 检查数据 ==========
app.get('/api/test-panel', (req, res) => {
  res.json(TEST_PANEL);
});

app.post('/api/tests', authMiddleware, async (req, res) => {
  try {
    const record = { ...req.body, userId: req.userId };
    const abnormals = [];
    const items = getAllTestItems();
    for (const item of items) {
      const val = record[item.key];
      if (val !== null && val !== undefined && val !== '' && !item.isQualitative && !item.isText) {
        if (checkAbnormal(item.key, val)) {
          abnormals.push({ key: item.key, label: item.label, value: val, normalRange: `${item.normalLow}-${item.normalHigh} ${item.unit}` });
        }
      }
    }
    record.abnormals = abnormals;
    res.json(await db.addTestRecord(record));
  } catch (e) { res.status(500).json({ error: '保存失败' }); }
});

app.get('/api/tests', authMiddleware, async (req, res) => {
  try { res.json(await db.getTestRecords(req.userId)); }
  catch (e) { res.status(500).json({ error: '查询失败' }); }
});

app.delete('/api/tests/:id', authMiddleware, async (req, res) => {
  try { res.json({ success: await db.deleteTestRecord(req.params.id) }); }
  catch (e) { res.status(500).json({ error: '操作失败' }); }
});

app.get('/api/tests/summary', authMiddleware, async (req, res) => {
  try {
    const records = await db.getTestRecords(req.userId);
    res.json(generateTestSummary(records));
  } catch (e) { res.status(500).json({ error: '查询失败' }); }
});

app.get('/api/tests/trend/:key', authMiddleware, async (req, res) => {
  try {
    const records = await db.getTestRecords(req.userId);
    const trend = analyzeTrend(records, req.params.key);
    const data = records.map(r => ({ date: r.date, value: r[req.params.key] })).filter(d => d.value !== null && d.value !== undefined);
    res.json({ trend, data });
  } catch (e) { res.status(500).json({ error: '查询失败' }); }
});

// ========== 症状记录 ==========
app.post('/api/symptoms', authMiddleware, async (req, res) => {
  try { res.json(await db.addSymptomRecord({ ...req.body, userId: req.userId })); }
  catch (e) { res.status(500).json({ error: '保存失败' }); }
});

app.get('/api/symptoms', authMiddleware, async (req, res) => {
  try {
    const { start, end } = req.query;
    res.json(await db.getSymptomRecords(req.userId, start, end));
  } catch (e) { res.status(500).json({ error: '查询失败' }); }
});

// ========== 营养分析 ==========
app.get('/api/nutrition/:date', authMiddleware, async (req, res) => {
  try {
    const [records, profile] = await Promise.all([
      db.getDietRecords(req.userId, req.params.date),
      db.getProfile(req.userId)
    ]);
    res.json(analyzeDailyDiet(records, profile));
  } catch (e) { res.status(500).json({ error: '分析失败' }); }
});

app.get('/api/nutrition/targets', authMiddleware, async (req, res) => {
  try {
    const profile = await db.getProfile(req.userId);
    const age = (profile && profile.birthDate) ? getUserAge(req.userId) : 5;
    const weight = (profile && profile.weight) || 20;
    res.json(getTargets(age, weight));
  } catch (e) { res.status(500).json({ error: '查询失败' }); }
});

// ========== 控铜成效评估 ==========
app.get('/api/evaluation', authMiddleware, async (req, res) => {
  try {
    const [testRecords, profile] = await Promise.all([
      db.getTestRecords(req.userId),
      db.getProfile(req.userId)
    ]);
    const endDate = new Date().toISOString().slice(0, 10);
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const [dietRecords, medLogs] = await Promise.all([
      db.getDietRecordsRange(req.userId, startDate, endDate),
      db.getMedicationLogsRange(req.userId, startDate, endDate)
    ]);
    const evaluation = evaluateTreatment(testRecords, dietRecords, medLogs, profile);
    const medAdvice = generateMedicationAdvice(testRecords, profile);
    res.json({ ...evaluation, medAdvice });
  } catch (e) { res.status(500).json({ error: '评估失败' }); }
});

// ========== 用药调整建议 ==========
app.get('/api/medication-advice', authMiddleware, async (req, res) => {
  try {
    const [testRecords, profile] = await Promise.all([
      db.getTestRecords(req.userId),
      db.getProfile(req.userId)
    ]);
    res.json(generateMedicationAdvice(testRecords, profile));
  } catch (e) { res.status(500).json({ error: '查询失败' }); }
});

// ========== 预警信息 ==========
app.get('/api/alerts/daily', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [dietRecords, profile, testRecords] = await Promise.all([
      db.getDietRecords(req.userId, today),
      db.getProfile(req.userId),
      db.getTestRecords(req.userId)
    ]);
    const analysis = analyzeDailyDiet(dietRecords, profile);
    const alerts = [];

    // 铜预警
    if (analysis.copperPercent > 100) {
      alerts.push({ level: 'danger', title: '🔴 铜摄入超标', message: `今日铜摄入${analysis.totals.copper.toFixed(2)}mg，超过推荐量1.0mg`, emergency: EMERGENCY_ADVICE });
    } else if (analysis.copperPercent > 80) {
      alerts.push({ level: 'warning', title: '⚠️ 铜摄入接近限值', message: `今日铜摄入${analysis.totals.copper.toFixed(2)}mg，已达限值的${analysis.copperPercent}%` });
    }

    // 营养预警
    if (analysis.calciumPercent < 80) alerts.push({ level: 'info', title: '🥛 钙摄入不足', message: `今日钙摄入${Math.round(analysis.totals.calcium)}mg，达标${analysis.calciumPercent}%` });
    if (analysis.proteinPercent < 80) alerts.push({ level: 'info', title: '🥩 蛋白质摄入偏低', message: `今日蛋白质${Math.round(analysis.totals.protein)}g，达标${analysis.proteinPercent}%` });
    if (analysis.b6Percent < 80) alerts.push({ level: 'info', title: '🥬 维生素B6偏低', message: `今日B6摄入${analysis.totals.vitaminB6.toFixed(2)}mg，达标${analysis.b6Percent}%` });

    // 检查异常预警
    if (testRecords.length > 0) {
      const latest = testRecords[testRecords.length - 1];
      const abnormals = [];
      const items = getAllTestItems();
      for (const item of items) {
        const val = latest[item.key];
        if (val !== null && val !== undefined && val !== '' && !item.isQualitative && !item.isText) {
          if (checkAbnormal(item.key, val)) {
            abnormals.push(item);
          }
        }
      }
      if (abnormals.length > 0) {
        alerts.push({ level: 'danger', title: `🔴 ${abnormals.length}项检查指标异常`, message: `最新检查(${latest.date})中存在${abnormals.length}项异常，请关注`, abnormals });
      }
    }

    res.json({ alerts, analysis });
  } catch (e) { res.status(500).json({ error: '查询失败' }); }
});

// ========== 数据导出 ==========
app.get('/api/export', authMiddleware, async (req, res) => {
  try { res.json(await db.exportAllData(req.userId)); }
  catch (e) { res.status(500).json({ error: '导出失败' }); }
});

// ========== 智能导诊 ==========
app.get('/api/referral/symptoms', (req, res) => {
  const { SYMPTOM_DEPT_MAP } = require('./data/doctorDatabase');
  res.json({ symptoms: SYMPTOM_DEPT_MAP.map(s => s.symptoms).flat() });
});

app.post('/api/referral/recommend', authMiddleware, async (req, res) => {
  try {
    const { symptoms } = req.body;
    const matches = recommendBySymptoms(symptoms || []);
    const records = await db.getTestRecords(req.userId);
    const latest = records.length > 0 ? records[records.length - 1] : null;
    const testMatches = recommendByTestResults(latest);
    res.json({ matches, testMatches });
  } catch (e) { res.status(500).json({ error: '查询失败' }); }
});

app.get('/api/referral/regions', (req, res) => {
  res.json(getAllRegions());
});

app.get('/api/referral/doctors', (req, res) => {
  const { region, dept } = req.query;
  if (region) {
    const data = getDoctorsByRegion(region);
    return res.json(data || { hospitals: [] });
  }
  if (dept) {
    const { recommendDoctors } = require('./data/doctorDatabase');
    return res.json(recommendDoctors(dept));
  }
  res.json({ regions: getAllRegions() });
});

// ========== 用药安全评估 ==========
app.get('/api/drugs/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  res.json(searchDrugs(q));
});

app.get('/api/drugs/categories', (req, res) => {
  res.json(getAllDrugCategories());
});

app.get('/api/drugs/all', (req, res) => {
  res.json(DRUG_DATABASE.map(d => ({
    name: d.name, category: d.category, commonBrands: d.commonBrands,
    wilsonAdvice: d.wilsonAdvice, interactions: d.interactions, note: d.note,
    hepaticWarning: d.hepaticWarning, renalWarning: d.renalWarning
  })));
});

// ========== 启动 ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`  肝豆健康管家系统已启动`);
  console.log(`  本地访问: http://localhost:${PORT}`);
  console.log(`  手机访问: http://<本机IP>:${PORT}`);
  console.log(`=================================`);
});