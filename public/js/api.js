// API 调用封装
const API = {
  token: localStorage.getItem('token') || null,

  async request(method, url, data) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (this.token) opts.headers['Authorization'] = 'Bearer ' + this.token;
    if (data) opts.body = JSON.stringify(data);

    try {
      const resp = await fetch(url, opts);
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || '请求失败');
      return json;
    } catch (e) {
      if (e.message.includes('401') || e.message.includes('未登录')) {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
      }
      throw e;
    }
  },

  get(url) { return this.request('GET', url); },
  post(url, data) { return this.request('POST', url, data); },
  del(url) { return this.request('DELETE', url); },

  // 认证
  login(username, password) { return this.post('/api/login', { username, password }); },
  register(username, password) { return this.post('/api/register', { username, password }); },

  // 食物
  getFoods(category, search) {
    let url = '/api/foods';
    const params = [];
    if (category && category !== '全部') params.push('category=' + encodeURIComponent(category));
    if (search) params.push('search=' + encodeURIComponent(search));
    if (params.length) url += '?' + params.join('&');
    return this.get(url);
  },
  getCategories() { return this.get('/api/foods/categories'); },
  addCustomFood(food) { return this.post('/api/foods/custom', food); },

  // 档案
  getProfile() { return this.get('/api/profile'); },
  saveProfile(data) { return this.post('/api/profile', data); },

  // 饮食
  getDiet(date) { return this.get('/api/diet/' + date); },
  addDiet(data) { return this.post('/api/diet', data); },
  deleteDiet(id) { return this.del('/api/diet/' + id); },
  getDietRange(start, end) { return this.get('/api/diet-range?start=' + start + '&end=' + end); },

  // 用药
  getMedications() { return this.get('/api/medications'); },
  saveMedication(data) { return this.post('/api/medications', data); },
  deleteMedication(id) { return this.del('/api/medications/' + id); },
  addMedicationLog(data) { return this.post('/api/medication-logs', data); },
  getMedicationLogs(date) { return this.get('/api/medication-logs/' + date); },

  // 检查
  getTestPanel() { return this.get('/api/test-panel'); },
  getTests() { return this.get('/api/tests'); },
  addTest(data) { return this.post('/api/tests', data); },
  deleteTest(id) { return this.del('/api/tests/' + id); },
  getTestSummary() { return this.get('/api/tests/summary'); },
  getTestTrend(key) { return this.get('/api/tests/trend/' + key); },

  // 症状
  addSymptom(data) { return this.post('/api/symptoms', data); },
  getSymptoms(start, end) { return this.get('/api/symptoms?start=' + start + '&end=' + end); },

  // 营养
  getNutrition(date) { return this.get('/api/nutrition/' + date); },
  getTargets() { return this.get('/api/nutrition/targets'); },

  // 评估
  getEvaluation() { return this.get('/api/evaluation'); },

  // 预警
  getDailyAlerts() { return this.get('/api/alerts/daily'); },

  // 导出
  exportData() { return this.get('/api/export'); }
};