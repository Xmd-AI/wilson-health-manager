const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
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
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
  const existing = db.findUserByUsername(username);
  if (existing) return res.status(400).json({ error: '用户名已存在' });
  const hash = bcrypt.hashSync(password, 10);
  const user = db.createUser(username, hash);
  if (!user) return res.status(500).json({ error: '创建失败' });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, username: user.username });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.findUserByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, username: user.username });
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
app.post('/api/foods/custom', authMiddleware, (req, res) => {
  const food = { ...req.body, userId: req.userId };
  const result = db.addCustomFood(food);
  res.json(result);
});

app.get('/api/foods/custom', authMiddleware, (req, res) => {
  res.json(db.getCustomFoods(req.userId));
});

// ========== 宝宝档案 ==========
app.get('/api/profile', authMiddleware, (req, res) => {
  const profile = db.getProfile(req.userId);
  res.json(profile || {});
});

app.post('/api/profile', authMiddleware, (req, res) => {
  const profile = db.saveProfile(req.userId, req.body);
  res.json(profile);
});

// ========== 饮食记录 ==========
app.post('/api/diet', authMiddleware, (req, res) => {
  const record = { ...req.body, userId: req.userId };
  // 计算各营养素
  if (record.foods) {
    let totals = { copper: 0, calcium: 0, protein: 0, vitaminB6: 0, zinc: 0, iron: 0 };
    for (const food of record.foods) {
      const dbFood = FOOD_DATABASE.find(f => f.id === food.foodId) ||
                     db.getCustomFoods(req.userId).find(f => f.id === food.foodId);
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
  const result = db.addDietRecord(record);
  res.json(result);
});

app.get('/api/diet/:date', authMiddleware, (req, res) => {
  const records = db.getDietRecords(req.userId, req.params.date);
  res.json(records);
});

app.get('/api/diet-range', authMiddleware, (req, res) => {
  const { start, end } = req.query;
  const records = db.getDietRecordsRange(req.userId, start, end);
  res.json(records);
});

app.delete('/api/diet/:id', authMiddleware, (req, res) => {
  res.json({ success: db.deleteDietRecord(req.params.id) });
});

// ========== 用药管理 ==========
app.get('/api/medications', authMiddleware, (req, res) => {
  res.json(db.getMedications(req.userId));
});

app.post('/api/medications', authMiddleware, (req, res) => {
  const med = db.saveMedication(req.userId, req.body);
  res.json(med);
});

app.delete('/api/medications/:id', authMiddleware, (req, res) => {
  res.json({ success: db.deleteMedication(req.userId, req.params.id) });
});

app.post('/api/medication-logs', authMiddleware, (req, res) => {
  const log = db.addMedicationLog({ ...req.body, userId: req.userId });
  res.json(log);
});

app.get('/api/medication-logs/:date', authMiddleware, (req, res) => {
  res.json(db.getMedicationLogs(req.userId, req.params.date));
});

// ========== 检查数据 ==========
app.get('/api/test-panel', (req, res) => {
  res.json(TEST_PANEL);
});

app.post('/api/tests', authMiddleware, (req, res) => {
  const record = { ...req.body, userId: req.userId };
  // 检查异常项
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
  const result = db.addTestRecord(record);
  res.json(result);
});

app.get('/api/tests', authMiddleware, (req, res) => {
  const records = db.getTestRecords(req.userId);
  res.json(records);
});

app.delete('/api/tests/:id', authMiddleware, (req, res) => {
  res.json({ success: db.deleteTestRecord(req.params.id) });
});

app.get('/api/tests/summary', authMiddleware, (req, res) => {
  const records = db.getTestRecords(req.userId);
  const summary = generateTestSummary(records);
  res.json(summary);
});

app.get('/api/tests/trend/:key', authMiddleware, (req, res) => {
  const records = db.getTestRecords(req.userId);
  const trend = analyzeTrend(records, req.params.key);
  const data = records.map(r => ({ date: r.date, value: r[req.params.key] })).filter(d => d.value !== null && d.value !== undefined);
  res.json({ trend, data });
});

// ========== 症状记录 ==========
app.post('/api/symptoms', authMiddleware, (req, res) => {
  const result = db.addSymptomRecord({ ...req.body, userId: req.userId });
  res.json(result);
});

app.get('/api/symptoms', authMiddleware, (req, res) => {
  const { start, end } = req.query;
  const records = db.getSymptomRecords(req.userId, start, end);
  res.json(records);
});

// ========== 营养分析 ==========
app.get('/api/nutrition/:date', authMiddleware, (req, res) => {
  const records = db.getDietRecords(req.userId, req.params.date);
  const profile = db.getProfile(req.userId);
  const analysis = analyzeDailyDiet(records, profile);
  res.json(analysis);
});

app.get('/api/nutrition/targets', authMiddleware, (req, res) => {
  const profile = db.getProfile(req.userId);
  const age = (profile && profile.birthDate) ? getUserAge(req.userId) : 5;
  const weight = (profile && profile.weight) || 20;
  res.json(getTargets(age, weight));
});

// ========== 控铜成效评估 ==========
app.get('/api/evaluation', authMiddleware, (req, res) => {
  const testRecords = db.getTestRecords(req.userId);
  const profile = db.getProfile(req.userId);
  const endDate = new Date().toISOString().slice(0, 10);
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const dietRecords = db.getDietRecordsRange(req.userId, startDate, endDate);
  const medLogs = db.getMedicationLogsRange(req.userId, startDate, endDate);
  const evaluation = evaluateTreatment(testRecords, dietRecords, medLogs, profile);
  // 同时返回用药调整建议
  const medAdvice = generateMedicationAdvice(testRecords, profile);
  res.json({ ...evaluation, medAdvice });
});

// ========== 用药调整建议 ==========
app.get('/api/medication-advice', authMiddleware, (req, res) => {
  const testRecords = db.getTestRecords(req.userId);
  const profile = db.getProfile(req.userId);
  const advice = generateMedicationAdvice(testRecords, profile);
  res.json(advice);
});

// ========== 预警信息 ==========
app.get('/api/alerts/daily', authMiddleware, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const dietRecords = db.getDietRecords(req.userId, today);
  const profile = db.getProfile(req.userId);
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
  const testRecords = db.getTestRecords(req.userId);
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
});

// ========== 数据导出 ==========
app.get('/api/export', authMiddleware, (req, res) => {
  const data = db.exportAllData(req.userId);
  res.json(data);
});

// ========== 智能导诊 ==========
app.get('/api/referral/symptoms', (req, res) => {
  const { recommendBySymptoms } = require('./data/doctorDatabase');
  const { SYMPTOM_DEPT_MAP } = require('./data/doctorDatabase');
  res.json({ symptoms: SYMPTOM_DEPT_MAP.map(s => s.symptoms).flat() });
});

app.post('/api/referral/recommend', authMiddleware, (req, res) => {
  const { symptoms } = req.body;
  const matches = recommendBySymptoms(symptoms || []);
  // 同时从最近检查中分析异常指标
  const records = db.getTestRecords(req.userId);
  const latest = records.length > 0 ? records[records.length - 1] : null;
  const testMatches = recommendByTestResults(latest);
  res.json({ matches, testMatches });
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