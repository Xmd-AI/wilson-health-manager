// PostgreSQL 数据库适配器（用于 Railway 云端部署）
// 与 database.js 保持完全相同的 API 接口，但使用 PostgreSQL 持久化存储
const { v4: uuidv4 } = require('uuid');

let pool = null;
let initialized = false;

function getPool() {
  if (!pool) {
    const { Pool } = require('pg');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000
    });
    console.log('✅ PostgreSQL 连接池已创建');
  }
  return pool;
}

async function init() {
  if (initialized) return;
  const p = getPool();
  try {
    // 创建所有表
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "securityQuestion" TEXT DEFAULT '',
        "securityAnswer" TEXT DEFAULT '',
        "createdAt" TEXT NOT NULL
      )
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        "userId" TEXT PRIMARY KEY REFERENCES users(id),
        data JSONB DEFAULT '{}'
      )
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS diet_records (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES users(id),
        date TEXT NOT NULL,
        time TEXT DEFAULT '',
        "mealType" TEXT DEFAULT '',
        foods JSONB DEFAULT '[]',
        totals JSONB DEFAULT '{}',
        "alertLevel" TEXT DEFAULT 'normal',
        "createdAt" TEXT NOT NULL
      )
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS medications (
        id TEXT NOT NULL,
        "userId" TEXT NOT NULL REFERENCES users(id),
        data JSONB DEFAULT '{}',
        PRIMARY KEY (id, "userId")
      )
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS medication_logs (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES users(id),
        "medicationId" TEXT DEFAULT '',
        date TEXT DEFAULT '',
        time TEXT DEFAULT '',
        "medicationName" TEXT DEFAULT '',
        dosage TEXT DEFAULT '',
        taken BOOLEAN DEFAULT false,
        "createdAt" TEXT NOT NULL
      )
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS test_records (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES users(id),
        date TEXT NOT NULL,
        hospital TEXT DEFAULT '',
        abnormals JSONB DEFAULT '[]',
        data JSONB DEFAULT '{}',
        "createdAt" TEXT NOT NULL
      )
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS symptom_records (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES users(id),
        date TEXT DEFAULT '',
        symptoms TEXT DEFAULT '',
        severity INTEGER DEFAULT 0,
        notes TEXT DEFAULT '',
        "createdAt" TEXT NOT NULL
      )
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS custom_foods (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES users(id),
        name TEXT DEFAULT '',
        copper REAL DEFAULT 0,
        category TEXT DEFAULT '',
        source TEXT DEFAULT '用户贡献',
        calcium REAL DEFAULT 0,
        protein REAL DEFAULT 0,
        "vitaminB6" REAL DEFAULT 0,
        zinc REAL DEFAULT 0,
        iron REAL DEFAULT 0,
        rating TEXT DEFAULT '',
        "createdAt" TEXT NOT NULL
      )
    `);
    // 创建索引
    await p.query('CREATE INDEX IF NOT EXISTS idx_diet_user_date ON diet_records("userId", date)');
    await p.query('CREATE INDEX IF NOT EXISTS idx_test_user ON test_records("userId")');
    await p.query('CREATE INDEX IF NOT EXISTS idx_medlog_user_date ON medication_logs("userId", date)');
    await p.query('CREATE INDEX IF NOT EXISTS idx_symptom_user ON symptom_records("userId")');
    initialized = true;
    console.log('✅ PostgreSQL 数据库表已就绪');
  } catch (e) {
    console.error('❌ PostgreSQL 初始化失败:', e.message);
    throw e;
  }
}

// ===== 用户 =====
async function createUser(username, passwordHash) {
  await init();
  const existing = await findUserByUsername(username);
  if (existing) return null;
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const { rows } = await pool.query(
    'INSERT INTO users (id, username, "passwordHash", "createdAt") VALUES ($1,$2,$3,$4) RETURNING id, username, "createdAt"',
    [id, username, passwordHash, createdAt]
  );
  return rows[0];
}

async function findUserByUsername(username) {
  await init();
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return rows[0] || null;
}

async function findUserById(id) {
  await init();
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function updatePassword(username, newPasswordHash) {
  await init();
  const { rowCount } = await pool.query('UPDATE users SET "passwordHash" = $1 WHERE username = $2', [newPasswordHash, username]);
  return rowCount > 0;
}

async function setSecurityQuestion(username, question, answer) {
  await init();
  const { rowCount } = await pool.query(
    'UPDATE users SET "securityQuestion" = $1, "securityAnswer" = $2 WHERE username = $3',
    [question, answer, username]
  );
  return rowCount > 0;
}

// ===== 档案 =====
async function getProfile(userId) {
  await init();
  const { rows } = await pool.query('SELECT data FROM profiles WHERE "userId" = $1', [userId]);
  return rows.length > 0 ? rows[0].data : null;
}

async function saveProfile(userId, data) {
  await init();
  const record = { ...data, updatedAt: new Date().toISOString() };
  await pool.query(
    `INSERT INTO profiles ("userId", data) VALUES ($1, $2::jsonb)
     ON CONFLICT ("userId") DO UPDATE SET data = $2::jsonb`,
    [userId, JSON.stringify(record)]
  );
  return record;
}

// ===== 饮食记录 =====
async function addDietRecord(record) {
  await init();
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const { rows } = await pool.query(
    `INSERT INTO diet_records (id, "userId", date, time, "mealType", foods, totals, "alertLevel", "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8,$9) RETURNING *`,
    [id, record.userId, record.date, record.time || '', record.mealType || '',
     JSON.stringify(record.foods || []), JSON.stringify(record.totals || {}),
     record.alertLevel || 'normal', createdAt]
  );
  return { id, ...record, createdAt };
}

async function getDietRecords(userId, date) {
  await init();
  const { rows } = await pool.query(
    'SELECT * FROM diet_records WHERE "userId" = $1 AND date = $2 ORDER BY time',
    [userId, date]
  );
  return rows.map(r => ({ ...r, foods: r.foods || [], totals: r.totals || {} }));
}

async function getDietRecordsRange(userId, startDate, endDate) {
  await init();
  const { rows } = await pool.query(
    'SELECT * FROM diet_records WHERE "userId" = $1 AND date >= $2 AND date <= $3 ORDER BY date, time',
    [userId, startDate, endDate]
  );
  return rows.map(r => ({ ...r, foods: r.foods || [], totals: r.totals || {} }));
}

async function deleteDietRecord(id) {
  await init();
  const { rowCount } = await pool.query('DELETE FROM diet_records WHERE id = $1', [id]);
  return rowCount > 0;
}

// ===== 用药方案 =====
async function getMedications(userId) {
  await init();
  const { rows } = await pool.query('SELECT * FROM medications WHERE "userId" = $1', [userId]);
  return rows.map(r => r.data);
}

async function saveMedication(userId, med) {
  await init();
  if (med.id) {
    const existing = (await pool.query('SELECT * FROM medications WHERE id = $1 AND "userId" = $2', [med.id, userId])).rows;
    if (existing.length > 0) {
      await pool.query(
        'UPDATE medications SET data = $1::jsonb WHERE id = $2 AND "userId" = $3',
        [JSON.stringify(med), med.id, userId]
      );
      return med;
    }
  }
  if (!med.id) med.id = uuidv4();
  await pool.query(
    'INSERT INTO medications (id, "userId", data) VALUES ($1,$2,$3::jsonb) ON CONFLICT (id, "userId") DO UPDATE SET data = $3::jsonb',
    [med.id, userId, JSON.stringify(med)]
  );
  return med;
}

async function deleteMedication(userId, medId) {
  await init();
  const { rowCount } = await pool.query('DELETE FROM medications WHERE id = $1 AND "userId" = $2', [medId, userId]);
  return rowCount > 0;
}

// ===== 服药记录 =====
async function addMedicationLog(log) {
  await init();
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  await pool.query(
    `INSERT INTO medication_logs (id, "userId", "medicationId", date, time, "medicationName", dosage, taken, "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, log.userId, log.medicationId || '', log.date || '', log.time || '',
     log.medicationName || '', log.dosage || '', log.taken || false, createdAt]
  );
  return { id, ...log, createdAt };
}

async function getMedicationLogs(userId, date) {
  await init();
  const { rows } = await pool.query(
    'SELECT * FROM medication_logs WHERE "userId" = $1 AND date = $2 ORDER BY time',
    [userId, date]
  );
  return rows;
}

async function getMedicationLogsRange(userId, startDate, endDate) {
  await init();
  const { rows } = await pool.query(
    'SELECT * FROM medication_logs WHERE "userId" = $1 AND date >= $2 AND date <= $3 ORDER BY date',
    [userId, startDate, endDate]
  );
  return rows;
}

// ===== 检查记录 =====
async function addTestRecord(record) {
  await init();
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const { abnormals, ...rest } = record;
  await pool.query(
    `INSERT INTO test_records (id, "userId", date, hospital, abnormals, data, "createdAt")
     VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7)`,
    [id, record.userId, record.date, record.hospital || '',
     JSON.stringify(record.abnormals || []), JSON.stringify(rest), createdAt]
  );
  return { id, ...record, createdAt };
}

async function getTestRecords(userId) {
  await init();
  const { rows } = await pool.query(
    'SELECT * FROM test_records WHERE "userId" = $1 ORDER BY date',
    [userId]
  );
  return rows.map(r => ({ ...r.data, id: r.id, userId: r.userId, date: r.date, hospital: r.hospital, abnormals: r.abnormals, createdAt: r.createdAt }));
}

async function deleteTestRecord(id) {
  await init();
  const { rowCount } = await pool.query('DELETE FROM test_records WHERE id = $1', [id]);
  return rowCount > 0;
}

// ===== 症状记录 =====
async function addSymptomRecord(record) {
  await init();
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  await pool.query(
    `INSERT INTO symptom_records (id, "userId", date, symptoms, severity, notes, "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, record.userId, record.date || '', record.symptoms || '', record.severity || 0, record.notes || '', createdAt]
  );
  return { id, ...record, createdAt };
}

async function getSymptomRecords(userId, startDate, endDate) {
  await init();
  const { rows } = await pool.query(
    'SELECT * FROM symptom_records WHERE "userId" = $1 AND date >= $2 AND date <= $3 ORDER BY date',
    [userId, startDate, endDate]
  );
  return rows;
}

// ===== 自定义食物 =====
async function addCustomFood(food) {
  await init();
  const id = 'c' + uuidv4().slice(0, 8);
  const createdAt = new Date().toISOString();
  await pool.query(
    `INSERT INTO custom_foods (id, "userId", name, copper, category, source, calcium, protein, "vitaminB6", zinc, iron, rating, "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [id, food.userId, food.name || '', food.copper || 0, food.category || '', food.source || '用户贡献',
     food.calcium || 0, food.protein || 0, food.vitaminB6 || 0, food.zinc || 0, food.iron || 0,
     food.rating || '', createdAt]
  );
  return { id, ...food, createdAt };
}

async function getCustomFoods(userId) {
  await init();
  const { rows } = await pool.query('SELECT * FROM custom_foods WHERE "userId" = $1', [userId]);
  return rows;
}

// ===== 导出 =====
async function exportAllData(userId) {
  await init();
  const [profile, dietRecords, medications, medicationLogs, testRecords, symptomRecords, customFoods] = await Promise.all([
    getProfile(userId),
    getDietRecordsRange(userId, '1970-01-01', '2099-12-31'),
    getMedications(userId),
    getMedicationLogsRange(userId, '1970-01-01', '2099-12-31'),
    getTestRecords(userId),
    getSymptomRecords(userId, '1970-01-01', '2099-12-31'),
    getCustomFoods(userId)
  ]);
  return {
    profile,
    dietRecords: Array.isArray(dietRecords) ? dietRecords : [],
    medications: Array.isArray(medications) ? medications : [],
    medicationLogs: Array.isArray(medicationLogs) ? medicationLogs : [],
    testRecords: Array.isArray(testRecords) ? testRecords : [],
    symptomRecords: Array.isArray(symptomRecords) ? symptomRecords : [],
    customFoods: Array.isArray(customFoods) ? customFoods : [],
    exportedAt: new Date().toISOString()
  };
}

// 空函数（兼容 JSON 文件接口）
function save() { /* PostgreSQL 自动持久化 */ }
function load() { /* PostgreSQL 自动加载 */ }

// 启动时自动初始化
if (process.env.DATABASE_URL) {
  init().catch(e => {
    console.error('❌ PostgreSQL 启动初始化失败:', e.message);
    process.exit(1);
  });
}

module.exports = {
  createUser, findUserByUsername, findUserById,
  updatePassword, setSecurityQuestion,
  getProfile, saveProfile,
  addDietRecord, getDietRecords, getDietRecordsRange, deleteDietRecord,
  getMedications, saveMedication, deleteMedication,
  addMedicationLog, getMedicationLogs, getMedicationLogsRange,
  addTestRecord, getTestRecords, deleteTestRecord,
  addSymptomRecord, getSymptomRecords,
  addCustomFood, getCustomFoods,
  exportAllData, save, load, init
};