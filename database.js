// 简单JSON文件数据库存储
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// 默认数据库结构
const DEFAULT_DB = {
  users: [],
  profiles: {},
  dietRecords: [],
  medications: {},
  medicationLogs: [],
  testRecords: [],
  symptomRecords: [],
  customFoods: [],
  nutritionReports: [],
  evaluations: []
};

let db = null;

function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
    } else {
      db = JSON.parse(JSON.stringify(DEFAULT_DB));
      save();
    }
  } catch (e) {
    console.error('数据库加载失败，使用默认结构:', e.message);
    db = JSON.parse(JSON.stringify(DEFAULT_DB));
    save();
  }
  return db;
}

function save() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function getCollection(name) {
  if (!db) load();
  if (!db[name]) db[name] = [];
  return db[name];
}

// 用户相关
function createUser(username, passwordHash) {
  const users = getCollection('users');
  const existing = users.find(u => u.username === username);
  if (existing) return null;
  const { v4: uuidv4 } = require('uuid');
  const user = { id: uuidv4(), username, passwordHash, createdAt: new Date().toISOString() };
  users.push(user);
  save();
  return user;
}

function findUserByUsername(username) {
  const users = getCollection('users');
  return users.find(u => u.username === username) || null;
}

function findUserById(id) {
  const users = getCollection('users');
  return users.find(u => u.id === id) || null;
}

// 档案相关
function getProfile(userId) {
  const profiles = getCollection('profiles');
  if (!profiles[userId]) {
    profiles[userId] = null;
    save();
  }
  return profiles[userId];
}

function saveProfile(userId, data) {
  const profiles = getCollection('profiles');
  profiles[userId] = { ...data, updatedAt: new Date().toISOString() };
  save();
  return profiles[userId];
}

// 饮食记录
function addDietRecord(record) {
  const records = getCollection('dietRecords');
  const { v4: uuidv4 } = require('uuid');
  const newRecord = { id: uuidv4(), createdAt: new Date().toISOString(), ...record };
  records.push(newRecord);
  save();
  return newRecord;
}

function getDietRecords(userId, date) {
  const records = getCollection('dietRecords');
  return records.filter(r => r.userId === userId && r.date === date);
}

function getDietRecordsRange(userId, startDate, endDate) {
  const records = getCollection('dietRecords');
  return records.filter(r => r.userId === userId && r.date >= startDate && r.date <= endDate);
}

function deleteDietRecord(id) {
  const records = getCollection('dietRecords');
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return false;
  records.splice(idx, 1);
  save();
  return true;
}

// 用药方案
function getMedications(userId) {
  const meds = getCollection('medications');
  if (!meds[userId]) { meds[userId] = []; save(); }
  return meds[userId];
}

function saveMedication(userId, med) {
  const meds = getCollection('medications');
  if (!meds[userId]) meds[userId] = [];
  if (med.id) {
    const idx = meds[userId].findIndex(m => m.id === med.id);
    if (idx !== -1) { meds[userId][idx] = med; save(); return med; }
  }
  const { v4: uuidv4 } = require('uuid');
  med.id = uuidv4();
  meds[userId].push(med);
  save();
  return med;
}

function deleteMedication(userId, medId) {
  const meds = getCollection('medications');
  if (!meds[userId]) return false;
  const idx = meds[userId].findIndex(m => m.id === medId);
  if (idx === -1) return false;
  meds[userId].splice(idx, 1);
  save();
  return true;
}

// 服药记录
function addMedicationLog(log) {
  const logs = getCollection('medicationLogs');
  const { v4: uuidv4 } = require('uuid');
  const newLog = { id: uuidv4(), createdAt: new Date().toISOString(), ...log };
  logs.push(newLog);
  save();
  return newLog;
}

function getMedicationLogs(userId, date) {
  const logs = getCollection('medicationLogs');
  return logs.filter(l => l.userId === userId && l.date === date);
}

function getMedicationLogsRange(userId, startDate, endDate) {
  const logs = getCollection('medicationLogs');
  return logs.filter(l => l.userId === userId && l.date >= startDate && l.date <= endDate);
}

// 检查记录
function addTestRecord(record) {
  const records = getCollection('testRecords');
  const { v4: uuidv4 } = require('uuid');
  const newRecord = { id: uuidv4(), createdAt: new Date().toISOString(), ...record };
  records.push(newRecord);
  save();
  return newRecord;
}

function getTestRecords(userId) {
  const records = getCollection('testRecords');
  return records.filter(r => r.userId === userId).sort((a, b) => a.date.localeCompare(b.date));
}

function deleteTestRecord(id) {
  const records = getCollection('testRecords');
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return false;
  records.splice(idx, 1);
  save();
  return true;
}

// 症状记录
function addSymptomRecord(record) {
  const records = getCollection('symptomRecords');
  const { v4: uuidv4 } = require('uuid');
  const newRecord = { id: uuidv4(), createdAt: new Date().toISOString(), ...record };
  records.push(newRecord);
  save();
  return newRecord;
}

function getSymptomRecords(userId, startDate, endDate) {
  const records = getCollection('symptomRecords');
  return records.filter(r => r.userId === userId && r.date >= startDate && r.date <= endDate);
}

// 自定义食物
function addCustomFood(food) {
  const foods = getCollection('customFoods');
  const { v4: uuidv4 } = require('uuid');
  const newFood = { id: 'c' + uuidv4().slice(0, 8), source: '用户贡献', ...food };
  foods.push(newFood);
  save();
  return newFood;
}

function getCustomFoods(userId) {
  const foods = getCollection('customFoods');
  return foods.filter(f => f.userId === userId);
}

// 导出/导入
function exportAllData(userId) {
  if (!db) load();
  return {
    profile: getProfile(userId),
    dietRecords: getCollection('dietRecords').filter(r => r.userId === userId),
    medications: getMedications(userId),
    medicationLogs: getCollection('medicationLogs').filter(l => l.userId === userId),
    testRecords: getCollection('testRecords').filter(r => r.userId === userId),
    symptomRecords: getCollection('symptomRecords').filter(r => r.userId === userId),
    customFoods: getCustomFoods(userId),
    exportedAt: new Date().toISOString()
  };
}

// 初始化
load();

module.exports = {
  createUser, findUserByUsername, findUserById,
  getProfile, saveProfile,
  addDietRecord, getDietRecords, getDietRecordsRange, deleteDietRecord,
  getMedications, saveMedication, deleteMedication,
  addMedicationLog, getMedicationLogs, getMedicationLogsRange,
  addTestRecord, getTestRecords, deleteTestRecord,
  addSymptomRecord, getSymptomRecords,
  addCustomFood, getCustomFoods,
  exportAllData, save, load
};