// ===== 肝豆健康管家 - 主应用 =====
const App = {
  currentView: null,
  today() { return new Date().toISOString().slice(0, 10); },

  init() {
    this.setupRouter();
    window.addEventListener('hashchange', () => this.route());
    this.checkLogin();
    this.route();
  },

  checkLogin() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token) {
      API.token = token;
      document.getElementById('headerUsername').textContent = username || '用户';
      document.getElementById('headerUsername').style.display = 'inline';
      document.getElementById('logoutBtn').style.display = 'inline';
      document.getElementById('bottomNav').style.display = 'flex';
    } else {
      API.token = null;
      document.getElementById('headerUsername').style.display = 'none';
      document.getElementById('logoutBtn').style.display = 'none';
      document.getElementById('bottomNav').style.display = 'none';
    }
  },

  setupRouter() {
    this.routes = {
      '/login': { render: () => this.renderLogin(), title: '登录' },
      '/register': { render: () => this.renderRegister(), title: '注册' },
      '/forgot-password': { render: () => this.renderForgotPassword(), title: '找回密码' },
      '/dashboard': { render: () => this.renderDashboard(), title: '首页' },
      '/diet': { render: () => this.renderDiet(), title: '饮食管理' },
      '/add-diet': { render: () => this.renderAddDiet(), title: '记录饮食' },
      '/medication': { render: () => this.renderMedication(), title: '用药管理' },
      '/tests': { render: () => this.renderTests(), title: '检查数据' },
      '/add-test': { render: () => this.renderAddTest(), title: '录入检查' },
      '/nutrition': { render: () => this.renderNutrition(), title: '营养分析' },
      '/evaluation': { render: () => this.renderEvaluation(), title: '控铜评估' },
      '/profile': { render: () => this.renderProfile(), title: '宝宝档案' },
      '/alerts': { render: () => this.renderAlerts(), title: '预警中心' },
      '/referral': { render: () => this.renderReferral(), title: '智能导诊' },
      '/drug-check': { render: () => this.renderDrugCheck(), title: '用药评估' },
      '/med-adjust': { render: () => this.renderMedAdjust(), title: '用药调整建议' },
    };
  },

  route() {
    const hash = window.location.hash.slice(1) || '/dashboard';
    const route = this.routes[hash];
    if (!route) { window.location.hash = '#/dashboard'; return; }

    document.getElementById('pageTitle').textContent = route.title;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.route === hash);
    });

    const content = document.getElementById('content');
    content.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">加载中...</div>';

    try {
      const result = route.render();
      if (result && result.then) {
        result.then(html => {
          content.innerHTML = html;
          if (hash === '/tests') setTimeout(() => this.loadCharts(), 300);
        }).catch(e => { content.innerHTML = `<div class="alert alert-danger">${e.message}</div>`; });
      } else {
        content.innerHTML = result || '';
        if (hash === '/tests') setTimeout(() => this.loadCharts(), 300);
      }
    } catch(e) {
      content.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    }
    this.currentView = hash;
  },

  go(path) { window.location.hash = '#' + path; },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.checkLogin();
    window.location.hash = '#/login';
  },

  // ===== 登录/注册 =====
  renderLogin() {
    return `
      <div style="padding:60px 20px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">🏥</div>
        <h2 style="margin-bottom:4px;">肝豆健康管家</h2>
        <p style="color:#888;margin-bottom:24px;font-size:13px;">登录管理宝宝的健康数据</p>
        <div class="card" style="text-align:left;">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input class="form-input" id="loginUsername" placeholder="请输入用户名">
          </div>
          <div class="form-group">
            <label class="form-label">密码</label>
            <input class="form-input" id="loginPassword" type="password" placeholder="请输入密码">
          </div>
          <div id="loginError" style="color:var(--red);font-size:13px;margin-bottom:8px;display:none;"></div>
          <button class="btn btn-primary btn-block" onclick="App.doLogin()">登 录</button>
          <div style="text-align:center;margin-top:12px;font-size:13px;">
            <a href="#/forgot-password" style="color:#888;">忘记密码？</a>
            <span style="color:#ddd;margin:0 6px;">|</span>
            <a href="#/register" style="color:#667eea;">立即注册</a>
          </div>
        </div>
      </div>
    `;
  },

  renderRegister() {
    return `
      <div style="padding:60px 20px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">📋</div>
        <h2 style="margin-bottom:4px;">注册账号</h2>
        <p style="color:#888;margin-bottom:24px;font-size:13px;">创建账号管理宝宝的健康</p>
        <div class="card" style="text-align:left;">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input class="form-input" id="regUsername" placeholder="请输入用户名">
          </div>
          <div class="form-group">
            <label class="form-label">密码</label>
            <input class="form-input" id="regPassword" type="password" placeholder="至少6位">
          </div>
          <div class="form-group">
            <label class="form-label">确认密码</label>
            <input class="form-input" id="regConfirm" type="password">
          </div>
          <div class="form-group">
            <label class="form-label">安全问题（找回密码用）</label>
            <select class="form-select" id="regSecurityQuestion">
              <option value="您的出生地是？">您的出生地是？</option>
              <option value="您母亲的姓名是？">您母亲的姓名是？</option>
              <option value="您父亲的姓名是？">您父亲的姓名是？</option>
              <option value="您的小学名称是？">您的小学名称是？</option>
              <option value="您宠物的名字是？">您宠物的名字是？</option>
              <option value="您最喜爱的城市是？">您最喜爱的城市是？</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">安全问题答案</label>
            <input class="form-input" id="regSecurityAnswer" placeholder="请牢记您的答案">
          </div>
          <div id="regError" style="color:var(--red);font-size:13px;margin-bottom:8px;display:none;"></div>
          <button class="btn btn-primary btn-block" onclick="App.doRegister()">注 册</button>
          <div style="text-align:center;margin-top:12px;font-size:13px;">已有账号？<a href="#/login" style="color:#667eea;">立即登录</a></div>
        </div>
      </div>
    `;
  },

  async doLogin() {
    const u = document.getElementById('loginUsername').value.trim();
    const p = document.getElementById('loginPassword').value;
    const err = document.getElementById('loginError');
    if (!u || !p) { err.textContent = '请填写完整'; err.style.display = 'block'; return; }
    try {
      const res = await API.login(u, p);
      localStorage.setItem('token', res.token);
      localStorage.setItem('username', res.username);
      API.token = res.token;
      this.checkLogin();
      this.route();
    } catch(e) { err.textContent = e.message; err.style.display = 'block'; }
  },

  async doRegister() {
    const u = document.getElementById('regUsername').value.trim();
    const p = document.getElementById('regPassword').value;
    const c = document.getElementById('regConfirm').value;
    const sq = document.getElementById('regSecurityQuestion')?.value || '您的出生地是？';
    const sa = document.getElementById('regSecurityAnswer')?.value.trim() || '';
    const err = document.getElementById('regError');
    if (!u || !p) { err.textContent = '请填写完整'; err.style.display = 'block'; return; }
    if (p.length < 6) { err.textContent = '密码至少6位'; err.style.display = 'block'; return; }
    if (p !== c) { err.textContent = '两次密码不一致'; err.style.display = 'block'; return; }
    if (!sa) { err.textContent = '请设置安全问题答案'; err.style.display = 'block'; return; }
    try {
      const res = await API.register(u, p, sq, sa);
      localStorage.setItem('token', res.token);
      localStorage.setItem('username', res.username);
      API.token = res.token;
      this.checkLogin();
      this.route();
    } catch(e) { err.textContent = e.message; err.style.display = 'block'; }
  },

  // ===== 找回密码 =====
  renderForgotPassword() {
    return `
      <div style="padding:60px 20px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">🔑</div>
        <h2 style="margin-bottom:4px;">找回密码</h2>
        <p style="color:#888;margin-bottom:24px;font-size:13px;">通过安全问题重置密码</p>
        <div class="card" style="text-align:left;">
          <div id="forgotStep1">
            <div class="form-group">
              <label class="form-label">用户名</label>
              <input class="form-input" id="forgotUsername" placeholder="请输入注册时的用户名">
            </div>
            <div id="forgotError" style="color:var(--red);font-size:13px;margin-bottom:8px;display:none;"></div>
            <button class="btn btn-primary btn-block" onclick="App.forgotGetQuestion()">下一步</button>
          </div>
          <div id="forgotStep2" style="display:none;">
            <div id="forgotQuestion" style="font-size:14px;font-weight:600;padding:10px;background:#f8f9ff;border-radius:6px;margin-bottom:10px;"></div>
            <div class="form-group">
              <label class="form-label">安全问题答案</label>
              <input class="form-input" id="forgotSecurityAnswer" placeholder="请输入您的答案">
            </div>
            <div class="form-group">
              <label class="form-label">新密码（至少6位）</label>
              <input class="form-input" id="forgotNewPassword" type="password" placeholder="输入新密码">
            </div>
            <div class="form-group">
              <label class="form-label">确认新密码</label>
              <input class="form-input" id="forgotConfirmPassword" type="password" placeholder="再次输入新密码">
            </div>
            <div id="forgotError2" style="color:var(--red);font-size:13px;margin-bottom:8px;display:none;"></div>
            <button class="btn btn-primary btn-block" onclick="App.forgotResetPassword()">重置密码</button>
          </div>
          <div style="text-align:center;margin-top:12px;font-size:13px;"><a href="#/login" style="color:#667eea;">返回登录</a></div>
        </div>
      </div>
    `;
  },

  async forgotGetQuestion() {
    const username = document.getElementById('forgotUsername').value.trim();
    const err = document.getElementById('forgotError');
    if (!username) { err.textContent = '请输入用户名'; err.style.display = 'block'; return; }
    try {
      const res = await API.getSecurityQuestion(username);
      err.style.display = 'none';
      document.getElementById('forgotStep1').style.display = 'none';
      document.getElementById('forgotStep2').style.display = 'block';
      document.getElementById('forgotQuestion').textContent = '❓ ' + res.question;
    } catch(e) { err.textContent = e.message; err.style.display = 'block'; }
  },

  async forgotResetPassword() {
    const username = document.getElementById('forgotUsername').value.trim();
    const answer = document.getElementById('forgotSecurityAnswer').value.trim();
    const np = document.getElementById('forgotNewPassword').value;
    const cp = document.getElementById('forgotConfirmPassword').value;
    const err = document.getElementById('forgotError2');
    if (!answer) { err.textContent = '请输入安全问题答案'; err.style.display = 'block'; return; }
    if (np.length < 6) { err.textContent = '密码至少6位'; err.style.display = 'block'; return; }
    if (np !== cp) { err.textContent = '两次密码不一致'; err.style.display = 'block'; return; }
    try {
      await API.resetPassword(username, answer, np);
      alert('✅ 密码已重置成功，请用新密码登录！');
      window.location.hash = '#/login';
    } catch(e) { err.textContent = e.message; err.style.display = 'block'; }
  },

  // ===== 首页仪表盘 =====
  async renderDashboard() {
    try {
      const today = this.today();
      const [alertsData, records, profile] = await Promise.all([
        API.getDailyAlerts(),
        API.getDiet(today),
        API.getProfile()
      ]);
      const { alerts, analysis } = alertsData;
      const copperPct = analysis ? analysis.copperPercent : 0;
      const barClass = copperPct > 100 ? 'red' : copperPct > 80 ? 'yellow' : 'green';

      let alertsHtml = '';
      if (alerts && alerts.length > 0) {
        alertsHtml = alerts.slice(0, 3).map((a, idx) => {
          const lvl = a.level === 'danger' ? 'danger' : a.level === 'warning' ? 'warning' : a.level === 'info' ? 'info' : 'success';
          return `<div class="alert alert-${lvl}" style="cursor:pointer;" onclick="App.showAlertDetail(${idx})"><strong>${a.title}</strong><br>${a.message}</div>`;
        }).join('');
      } else {
        alertsHtml = '<div class="alert alert-success">✅ 当前无预警</div>';
      }

      return `
        <div class="card">
          <div class="card-title">📊 今日概览</div>
          <div class="grid-3">
            <div class="stat-box"><div class="stat-value" style="color:${copperPct > 100 ? 'var(--red)' : 'var(--green)'}">${analysis ? analysis.totals.copper.toFixed(2) : '0.00'}</div><div class="stat-label">铜摄入(mg)</div></div>
            <div class="stat-box"><div class="stat-value">${analysis ? Math.round(analysis.totals.calcium) : 0}</div><div class="stat-label">钙(mg)</div></div>
            <div class="stat-box"><div class="stat-value">${analysis ? Math.round(analysis.totals.protein) : 0}</div><div class="stat-label">蛋白质(g)</div></div>
          </div>
          <div class="progress-bar"><div class="progress-fill ${barClass}" style="width:${Math.min(copperPct, 100)}%"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;"><span>铜摄入 ${copperPct}%</span><span>目标 <1mg/日</span></div>
        </div>
        <div class="card"><div class="card-title">🔔 健康提醒</div>${alertsHtml}</div>
        <div class="card">
          <div class="card-title">👶 ${profile && profile.name ? profile.name : '宝宝'}的健康</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="App.go('/add-diet')">🍚 记录饮食</button>
            <button class="btn btn-success btn-sm" onclick="App.go('/medication')">💊 用药记录</button>
            <button class="btn btn-warning btn-sm" onclick="App.go('/tests')">📊 检查数据</button>
            <button class="btn btn-outline btn-sm" onclick="App.go('/evaluation')">📈 控铜评估</button>
          </div>
        </div>
      `;
    } catch(e) { return `<div class="alert alert-danger">加载失败: ${e.message}</div>`; }
  },

  // ===== 饮食管理 =====
  async renderDiet() {
    try {
      const today = this.today();
      const [records, analysis, categories] = await Promise.all([
        API.getDiet(today),
        API.getNutrition(today),
        API.getCategories()
      ]);
      const meals = { 早餐: [], 午餐: [], 晚餐: [], 加餐: [] };
      if (records) for (const r of records) {
        if (meals[r.mealType]) meals[r.mealType].push(r); else meals['加餐'].push(r);
      }
      let mealHtml = '';
      let totalCopper = 0;
      for (const [type, items] of Object.entries(meals)) {
        if (!items.length) continue;
        const tc = items.reduce((s, r) => s + (r.totals ? r.totals.copper : 0), 0);
        totalCopper += tc;
        const color = tc > 0.3 ? 'var(--red)' : tc > 0.15 ? 'var(--yellow)' : 'var(--green)';
        mealHtml += `<div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;font-weight:600;font-size:14px;"><span>${type}</span><span style="color:${color}">${tc.toFixed(2)}mg Cu</span></div>`;
        items.forEach(r => {
          mealHtml += `<div style="background:#f8f9ff;border-radius:6px;padding:8px;margin-bottom:4px;">`;
          if (r.foods) r.foods.forEach(f => {
            const dotClass = f.rating === '可食' ? 'green' : f.rating === '少食' ? 'yellow' : 'red';
            mealHtml += `<div style="font-size:12px;display:flex;justify-content:space-between;padding:2px 0;"><span><span class="rating-dot rating-${dotClass}"></span>${f.name}</span><span>${f.amount || 0}g / ${f.copperMg ? f.copperMg.toFixed(2) : '?'}mg</span></div>`;
          });
          mealHtml += `<div style="text-align:right;"><span style="font-size:11px;color:var(--red);cursor:pointer;" onclick="App.deleteDietItem('${r.id}')">删除</span></div></div>`;
        });
        mealHtml += '</div>';
      }
      const copperPct = analysis ? analysis.copperPercent : 0;
      const barClass = copperPct > 100 ? 'red' : copperPct > 80 ? 'yellow' : 'green';
      return `
        <div class="card">
          <div class="card-title">🍚 今日饮食 ${today}</div>
          <div style="margin-bottom:8px;"><button class="btn btn-primary btn-sm" onclick="App.go('/add-diet')">➕ 记录饮食</button></div>
          <div class="progress-bar"><div class="progress-fill ${barClass}" style="width:${Math.min(copperPct, 100)}%"></div></div>
          <div style="font-size:12px;color:#888;">铜摄入 ${analysis ? analysis.totals.copper.toFixed(2) : '0.00'}mg / 目标<1mg (${copperPct}%)</div>
          ${mealHtml || '<div class="empty-state"><div class="empty-icon">🍽️</div><div>今日暂无记录</div></div>'}
        </div>
        <div class="card">
          <div class="card-title">🔍 查询食物铜含量</div>
          <input class="form-input" id="foodSearchInput" placeholder="输入食物名称搜索..." oninput="App.searchFoods()" style="margin-bottom:8px;">
          <div id="foodSearchResults" style="max-height:300px;overflow-y:auto;"></div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">
            ${Array.isArray(categories) ? categories.slice(0, 8).map(c => `<span class="tag tag-green" style="cursor:pointer;" onclick="App.filterFoods('${c}')">${c}</span>`).join('') : ''}
          </div>
        </div>
        <div class="card">
          <div class="card-title">🥬 饮食红绿灯</div>
          <p><span class="rating-dot rating-green"></span><strong>可食</strong> 铜≤0.10mg/100g</p>
          <p><span class="rating-dot rating-yellow"></span><strong>少食</strong> 铜0.10~0.30mg/100g</p>
          <p><span class="rating-dot rating-red"></span><strong>禁食</strong> 铜>0.30mg/100g</p>
        </div>
      `;
    } catch(e) { return `<div class="alert alert-danger">加载失败: ${e.message}</div>`; }
  },

  async deleteDietItem(id) { if (!confirm('删除？')) return; await API.deleteDiet(id); this.route(); },

  async searchFoods() {
    const q = document.getElementById('foodSearchInput').value.trim();
    const c = document.getElementById('foodSearchResults');
    if (!q) { c.innerHTML = ''; return; }
    try {
      const foods = await API.getFoods('', q);
      if (!foods || !foods.length) { c.innerHTML = '<div style="font-size:13px;color:#888;padding:8px;">未找到，可<a href="#/diet" onclick="App.showAddFood()">自定义添加</a></div>'; return; }
      c.innerHTML = foods.slice(0, 30).map(f =>
        `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;">
          <span><span class="rating-dot rating-${f.rating === '可食' ? 'green' : f.rating === '少食' ? 'yellow' : 'red'}"></span>${f.name}</span>
          <span><strong>${f.copper}</strong> mg/100g <span class="tag tag-${f.rating === '可食' ? 'green' : f.rating === '少食' ? 'yellow' : 'red'}">${f.rating}</span></span>
        </div>`
      ).join('');
    } catch(e) {}
  },
  filterFoods(cat) { document.getElementById('foodSearchInput').value = cat; this.searchFoods(); },

  showAddFood() {
    const d = document.createElement('div'); d.className = 'modal-overlay'; d.id = 'foodModal';
    d.innerHTML = `<div class="modal-content"><div class="modal-title">自定义添加食物</div>
      <div class="form-group"><label class="form-label">食物名称</label><input class="form-input" id="cfName"></div>
      <div class="form-group"><label class="form-label">铜含量(mg/100g)</label><input class="form-input" id="cfCopper" type="number" step="0.01"></div>
      <button class="btn btn-primary btn-block" onclick="App.saveCustomFood()">保存</button></div>`;
    d.onclick = function(e) { if (e.target === this) this.remove(); };
    document.body.appendChild(d);
  },
  async saveCustomFood() {
    const name = document.getElementById('cfName').value.trim();
    if (!name) { alert('请输入食物名'); return; }
    await API.addCustomFood({ name, copper: parseFloat(document.getElementById('cfCopper').value) || 0, category: '自定义' });
    document.getElementById('foodModal')?.remove(); alert('已添加！');
  },

  // ===== 添加饮食记录 =====
  async renderAddDiet() {
    try {
      const cats = await API.getCategories();
      return `<div style="padding:10px 0;">
        <button class="btn btn-outline btn-sm" onclick="App.go('/diet')">← 返回</button>
        <div class="card">
          <div class="form-group"><label class="form-label">餐次</label><select class="form-select" id="dietMealType"><option>早餐</option><option>午餐</option><option>晚餐</option><option>加餐</option></select></div>
          <div class="form-group"><label class="form-label">日期</label><input class="form-input" id="dietDate" type="date" value="${this.today()}"></div>
          <div class="form-group"><label class="form-label">时间</label><input class="form-input" id="dietTime" type="time" value="${new Date().toTimeString().slice(0,5)}"></div>
        </div>
        <div class="card">
          <div class="card-title">选择食物</div>
          <select class="form-select" id="foodCategorySelect" onchange="App.loadFoods()">
            <option value="全部">全部类别</option>
            ${cats.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
          <input class="form-input" id="foodSearch" placeholder="搜索..." style="margin-top:6px;" oninput="App.loadFoods()">
          <div id="foodList" style="max-height:300px;overflow-y:auto;margin-top:6px;"></div>
        </div>
        <div class="card">
          <div class="card-title">已选食物</div>
          <div id="selectedFoodsList"></div>
          <div style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px;font-weight:600;">预估铜：<span id="totalCopperEstimate">0.00</span> mg</div>
        </div>
        <button class="btn btn-primary btn-block" onclick="App.saveDiet()">💾 保存</button>
      </div>`;
    } catch(e) { return `<div class="alert alert-danger">${e.message}</div>`; }
  },

  dietSelections: [],

  async loadFoods() {
    const cat = document.getElementById('foodCategorySelect').value;
    const q = document.getElementById('foodSearch').value.trim();
    try {
      const foods = await API.getFoods(cat, q);
      document.getElementById('foodList').innerHTML = foods.slice(0, 50).map(f => {
        const sel = this.dietSelections.find(s => s.foodId === f.id);
        const dotClass = f.rating === '可食' ? 'green' : f.rating === '少食' ? 'yellow' : 'red';
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:13px;"><span class="rating-dot rating-${dotClass}"></span>${f.name} <span style="color:#888;">${f.copper}mg</span></span>
          ${sel ? `<span style="font-size:12px;color:#667eea;">${sel.amount}g <span style="color:var(--red);cursor:pointer;" onclick="App.removeFood('${f.id}')">✕</span></span>`
                : `<button class="btn btn-sm btn-primary" onclick="App.addFood('${f.id}','${f.name}',${f.copper},'${f.rating}')">+</button>`}
        </div>`;
      }).join('');
    } catch(e) {}
  },

  addFood(foodId, name, cu, rating) {
    const a = prompt(`${name} 食用量(克)：`, '100');
    if (!a || isNaN(a) || a <= 0) return;
    this.dietSelections.push({ foodId, name, amount: parseFloat(a), copperPer100g: cu, rating });
    this.updateSelFoods();
  },
  removeFood(foodId) { this.dietSelections = this.dietSelections.filter(s => s.foodId !== foodId); this.updateSelFoods(); },
  updateSelFoods() {
    const el = document.getElementById('selectedFoodsList');
    const totalEl = document.getElementById('totalCopperEstimate');
    if (!el) return;
    let t = 0;
    el.innerHTML = this.dietSelections.map(s => { const c = (s.copperPer100g * s.amount) / 100; t += c; return `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;border-bottom:1px solid #f0f0f0;"><span>${s.name}</span><span>${s.amount}g → ${c.toFixed(2)}mg <span style="color:var(--red);cursor:pointer;" onclick="App.removeFood('${s.foodId}')">✕</span></span></div>`; }).join('');
    if (totalEl) totalEl.textContent = t.toFixed(2);
    this.loadFoods();
  },

  async saveDiet() {
    if (!this.dietSelections.length) { alert('请选择食物'); return; }
    await API.addDiet({ date: document.getElementById('dietDate').value, time: document.getElementById('dietTime').value, mealType: document.getElementById('dietMealType').value, foods: this.dietSelections });
    this.dietSelections = []; alert('✅ 保存成功！'); this.go('/diet');
  },

  // ===== 用药管理 =====
  async renderMedication() {
    try {
      const [meds, logs] = await Promise.all([API.getMedications(), API.getMedicationLogs(this.today())]);
      const taken = new Set((logs || []).filter(l => l.taken).map(l => l.medicationId));
      return `
        <div class="card">
          <div class="card-title">💊 用药方案 <button class="btn btn-primary btn-sm" onclick="App.showAddMed()">+添加</button></div>
          ${meds && meds.length ? meds.map(m => `<div class="med-card">
            <div style="display:flex;justify-content:space-between;"><span class="med-name">${m.name}</span><span style="font-size:11px;color:var(--red);cursor:pointer;" onclick="App.deleteMed('${m.id}')">删除</span></div>
            <div class="med-info">${m.dosage} ${m.unit} · ${m.times ? m.times.join(', ') : ''}</div>
            ${m.intervalNote ? `<div class="med-info" style="color:var(--yellow);">⏰ ${m.intervalNote}</div>` : ''}
            ${m.nutritionNote ? `<div class="med-note">💡 ${m.nutritionNote}</div>` : ''}
            <div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;">
              ${m.times ? m.times.map(t => `<button class="btn btn-sm ${taken.has(m.id+t) ? 'btn-success' : 'btn-outline'}" onclick="App.toggleMed('${m.id}','${m.name}','${m.dosage}','${t}')">${t} ${taken.has(m.id+t) ? '✅' : '💊'}</button>`).join('') : ''}
            </div>
          </div>`).join('') : '<div style="text-align:center;padding:20px;color:#888;">尚未添加药品</div>'}
        </div>
        <div class="card"><div class="card-title">💡 药物提示</div><div style="font-size:13px;">
          🔹 青霉胺→影响钙/B6吸收，需补充<br>
          🔹 锌制剂→抑制铜吸收，监测血锌<br>
          🔹 青霉胺与锌剂须间隔<b>2-4小时</b></div>
        </div>`;
    } catch(e) { return `<div class="alert alert-danger">${e.message}</div>`; }
  },

  showAddMed() {
    const d = document.createElement('div'); d.className = 'modal-overlay'; d.id = 'medModal';
    d.innerHTML = `<div class="modal-content">
      <div class="modal-title">添加药品</div>
      <div class="form-group"><label class="form-label">药品名</label><input class="form-input" id="medName" placeholder="如：青霉胺片"></div>
      <div class="form-group"><label class="form-label">剂量</label><input class="form-input" id="medDosage" type="number" step="0.1"></div>
      <div class="form-group"><label class="form-label">单位</label><select class="form-select" id="medUnit"><option>mg</option><option>g</option><option>粒</option></select></div>
      <div class="form-group"><label class="form-label">服用时间</label><input class="form-input" id="medTimes" placeholder="08:00, 20:00"></div>
      <div class="form-group"><label class="form-label">间隔提示</label><input class="form-input" id="medInterval" placeholder="与锌剂间隔2小时"></div>
      <div class="form-group"><label class="form-label">营养提示</label><input class="form-input" id="medNutrition" placeholder="需补钙和B6"></div>
      <button class="btn btn-primary btn-block" onclick="App.saveMed()">保存</button></div>`;
    d.onclick = function(e) { if (e.target === this) this.remove(); };
    document.body.appendChild(d);
  },
  async saveMed() {
    const n = document.getElementById('medName').value.trim();
    if (!n) { alert('请输入药品名'); return; }
    await API.saveMedication({ name: n, dosage: document.getElementById('medDosage').value || '', unit: document.getElementById('medUnit').value, times: document.getElementById('medTimes').value.split(',').map(t=>t.trim()).filter(Boolean), intervalNote: document.getElementById('medInterval').value, nutritionNote: document.getElementById('medNutrition').value });
    document.getElementById('medModal')?.remove(); this.route();
  },
  async deleteMed(id) { if (!confirm('删除？')) return; await API.deleteMedication(id); this.route(); },
  async toggleMed(id, name, dosage, time) {
    await API.addMedicationLog({ medicationId: id + time, date: this.today(), time, medicationName: name, dosage, taken: true });
    this.route();
  },

  // ===== 检查数据 =====
  async renderTests() {
    try {
      const records = await API.getTests();
      const sorted = records ? [...records].sort((a,b) => b.date.localeCompare(a.date)) : [];
      return `
        <div class="card">
          <div class="card-title">📊 检查数据 <button class="btn btn-primary btn-sm" onclick="App.go('/add-test')">+录入</button></div>
          <div style="font-size:13px;color:#888;">共 ${sorted.length} 次记录 · 点击详情查看全部指标</div>
          ${sorted.length ? sorted.map(r => {
            // 收集有值的指标
            const values = [];
            if (r.urinaryCopper24h) values.push(`24h尿铜:${r.urinaryCopper24h}`);
            if (r.ceruloplasmin) values.push(`铜蓝蛋白:${r.ceruloplasmin}`);
            if (r.alt) values.push(`ALT:${r.alt}`);
            if (r.ast) values.push(`AST:${r.ast}`);
            if (r.serumCalcium) values.push(`血钙:${r.serumCalcium}`);
            if (r.wbc) values.push(`WBC:${r.wbc}`);
            if (r.hemoglobin) values.push(`HGB:${r.hemoglobin}`);
            if (r.tbil) values.push(`TBIL:${r.tbil}`);
            if (r.serumZinc) values.push(`血锌:${r.serumZinc}`);
            const ab = r.abnormals && r.abnormals.length ? r.abnormals.length : 0;
            return `<div style="padding:8px 0;border-bottom:1px solid #f0f0f0;cursor:pointer;" onclick="App.viewTestDetail('${r.id}')">
              <div style="display:flex;justify-content:space-between;font-size:13px;">
                <strong>${r.date}</strong> <span style="color:var(--text-light);">${r.hospital||''} ${ab>0?`<span class="tag tag-red">${ab}项异常</span>`:''}</span>
              </div>
              <div style="font-size:12px;color:#666;margin-top:2px;">${values.slice(0,5).join(' · ')}${values.length>5?` · +${values.length-5}项`:''}</div>
            </div>`;
          }).join('') : '<div class="empty-state"><div class="empty-icon">📋</div><div>暂无检查记录</div></div>'}
        </div>
        ${sorted.length > 0 ? `
        <div class="card"><div class="card-title">📈 24h尿铜趋势</div><div style="height:160px;"><canvas id="chart_uc"></canvas></div></div>
        <div class="card"><div class="card-title">📈 铜蓝蛋白趋势</div><div style="height:160px;"><canvas id="chart_cp"></canvas></div></div>
        <div class="card"><div class="card-title">📈 ALT趋势</div><div style="height:160px;"><canvas id="chart_alt"></canvas></div></div>` : ''}
      `;
    } catch(e) { return `<div class="alert alert-danger">${e.message}</div>`; }
  },

  async viewTestDetail(id) {
    try {
      const records = await API.getTests();
      const r = records.find(x => x.id === id);
      if (!r) return;
      const panel = await API.getTestPanel();
      const d = document.createElement('div'); d.className = 'modal-overlay';
      let html = `<div class="modal-content" style="max-width:600px;"><div class="modal-title">📋 ${r.date} 检查详情 ${r.hospital?'('+r.hospital+')':''}</div>`;
      let hasData = false;
      for (const [gk, g] of Object.entries(panel)) {
        let groupHtml = '';
        for (const item of g.items) {
          const val = r[item.key];
          if (val === null || val === undefined || val === '') continue;
          hasData = true;
          const isAbnormal = item.normalLow !== null && item.normalHigh !== null && !item.isText && !item.isQualitative && (val < item.normalLow || val > item.normalHigh);
          const color = isAbnormal ? 'var(--red)' : 'var(--green)';
          const mark = isAbnormal ? ' 🔴' : '';
          groupHtml += `<div class="test-item"><span class="test-name">${item.label}${mark}</span><span class="test-value" style="color:${color}">${val}</span><span class="test-unit">${item.unit||''}</span></div>`;
        }
        if (groupHtml) {
          html += `<div style="margin-bottom:8px;"><div style="font-size:13px;font-weight:600;padding:4px 0;background:#f8f9ff;border-radius:4px;padding:4px 8px;">${g.label}</div>${groupHtml}</div>`;
        }
      }
      if (!hasData) html += '<div style="text-align:center;padding:20px;color:#888;">该次检查未录入具体指标数据</div>';
      html += `<button class="btn btn-outline btn-block" onclick="this.closest('.modal-overlay').remove()">关闭</button></div>`;
      d.innerHTML = html;
      d.onclick = function(e) { if (e.target === this) this.remove(); };
      document.body.appendChild(d);
    } catch(e) { alert('获取详情失败'); }
  },

  async loadCharts() {
    if (typeof Chart === 'undefined') return;
    const charts = [
      { id: 'chart_uc', key: 'urinaryCopper24h', label: '24h尿铜', color: '#667eea', target: 100 },
      { id: 'chart_cp', key: 'ceruloplasmin', label: '铜蓝蛋白', color: '#4CAF50', target: 0.2 },
      { id: 'chart_alt', key: 'alt', label: 'ALT', color: '#FF9800', target: 40 },
    ];
    for (const ch of charts) {
      try {
        const canvas = document.getElementById(ch.id);
        if (!canvas) continue;
        const { data } = await API.getTestTrend(ch.key);
        if (!data || data.length === 0) {
          canvas.parentNode.innerHTML += '<div style="text-align:center;padding:20px;color:#888;font-size:13px;">暂无数据，请先录入检查结果</div>';
          continue;
        }
        if (data.length === 1) {
          canvas.parentNode.innerHTML += '<div style="text-align:center;padding:20px;color:#888;font-size:13px;">只有1次记录，录入更多数据后将显示趋势图</div>';
          continue;
        }
        new Chart(canvas, {
          type: 'line',
          data: { labels: data.map(d => d.date.slice(5)), datasets: [{ label: ch.label, data: data.map(d => d.value), borderColor: ch.color, tension: 0.3, fill: true, backgroundColor: ch.color + '22' }] },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
      } catch(e) {}
    }
  },
  async deleteTestRecord(id) { if (!confirm('删除？')) return; await API.deleteTest(id); this.route(); },

  // ===== 添加检查记录 =====
  async renderAddTest() {
    try {
      const panel = await API.getTestPanel();
      let html = `<div><button class="btn btn-outline btn-sm" onclick="App.go('/tests')">← 返回</button>
        <div class="card">
          <div class="form-group"><label class="form-label">日期</label><input class="form-input" id="testDate" type="date" value="${this.today()}"></div>
          <div class="form-group"><label class="form-label">医院</label><input class="form-input" id="testHospital"></div>
        </div>`;
      for (const [gk, g] of Object.entries(panel)) {
        html += `<div class="card"><div class="card-title">${g.label}</div>`;
        g.items.forEach(item => {
          if (item.isText) {
            html += `<div class="form-group"><label class="form-label">${item.label}</label><input class="form-input" id="test_${item.key}"></div>`;
          } else {
            html += `<div class="form-group"><label class="form-label">${item.label} (${item.unit}) <span style="font-weight:400;color:#888;">正常 ${item.normalLow||''}-${item.normalHigh||''}</span></label>
              <input class="form-input" id="test_${item.key}" type="number" step="0.01"></div>`;
          }
        });
        html += '</div>';
      }
      html += `<button class="btn btn-primary btn-block" onclick="App.saveTest()">💾 保存</button></div>`;
      return html;
    } catch(e) { return `<div class="alert alert-danger">${e.message}</div>`; }
  },
  async saveTest() {
    const panel = await API.getTestPanel();
    const record = { date: document.getElementById('testDate').value, hospital: document.getElementById('testHospital').value || '' };
    for (const g of Object.values(panel)) for (const item of g.items) {
      const el = document.getElementById('test_' + item.key);
      if (el) record[item.key] = item.isText ? el.value.trim() : (el.value ? parseFloat(el.value) : null);
    }
    await API.addTest(record);
    alert('✅ 保存成功！'); this.go('/tests');
  },

  // ===== 营养分析 =====
  async renderNutrition() {
    try {
      const today = this.today();
      const analysis = await API.getNutrition(today);
      if (!analysis || analysis.foodCount === 0) {
        return `<div class="card"><div class="card-title">🥬 营养分析</div><div class="empty-state"><div class="empty-icon">📊</div><div>今天暂无饮食记录</div><button class="btn btn-primary btn-sm" onclick="App.go('/add-diet')">去记录</button></div></div>`;
      }
      const scoreClass = analysis.score >= 80 ? 'excellent' : analysis.score >= 60 ? 'good' : analysis.score >= 40 ? 'fair' : 'poor';
      let adviceHtml = '';
      if (analysis.advice) adviceHtml = analysis.advice.map(a => `<div class="alert alert-${a.type === 'good' ? 'success' : 'warning'}">${a.message}</div>`).join('');
      return `
        <div class="card">
          <div class="card-title">🥬 ${today} 营养分析</div>
          <div style="text-align:center;"><div class="score-circle ${scoreClass}">${analysis.score}</div><div style="font-size:13px;color:#888;">综合评分</div></div>
          <div class="grid-2">
            <div class="stat-box"><div class="stat-value" style="color:${analysis.copperPercent > 100 ? 'var(--red)' : 'var(--green)'}">${analysis.totals.copper.toFixed(2)}mg</div><div class="stat-label">铜/${analysis.targets.copper}mg</div></div>
            <div class="stat-box"><div class="stat-value" style="color:${analysis.calciumPercent < 80 ? 'var(--yellow)' : 'var(--green)'}">${Math.round(analysis.totals.calcium)}mg</div><div class="stat-label">钙/${analysis.targets.calcium}mg</div></div>
            <div class="stat-box"><div class="stat-value" style="color:${analysis.proteinPercent < 80 ? 'var(--yellow)' : 'var(--green)'}">${Math.round(analysis.totals.protein)}g</div><div class="stat-label">蛋白/${analysis.targets.protein}g</div></div>
            <div class="stat-box"><div class="stat-value" style="color:${analysis.b6Percent < 80 ? 'var(--yellow)' : 'var(--green)'}">${analysis.totals.vitaminB6.toFixed(2)}mg</div><div class="stat-label">B6/${analysis.targets.vitaminB6}mg</div></div>
          </div>
        </div>
        <div class="card"><div class="card-title">💡 建议</div>${adviceHtml}</div>`;
    } catch(e) { return `<div class="alert alert-danger">${e.message}</div>`; }
  },

  // ===== 控铜评估 =====
  async renderEvaluation() {
    try {
      const ev = await API.getEvaluation();
      if (!ev || ev.score === 0) return `<div class="card"><div class="card-title">📈 控铜评估</div><div class="empty-state"><div class="empty-icon">📋</div><div>需要检查数据</div><button class="btn btn-primary btn-sm" onclick="App.go('/add-test')">录入</button></div></div>`;
      const lc = ev.level === '优秀' ? 'excellent' : ev.level === '良好' ? 'good' : ev.level === '一般' ? 'fair' : 'poor';
      return `
        <div class="card">
          <div class="card-title">📈 控铜成效评估</div>
          <div style="text-align:center;"><div class="score-circle ${lc}">${ev.score}</div><div style="font-weight:600;">${ev.level}</div><div style="font-size:13px;margin-top:4px;">${ev.conclusion}</div></div>
          <div class="grid-2">
            <div class="stat-box"><div style="font-size:16px;font-weight:700;">${ev.details.copperScore.score}/${ev.details.copperScore.max}</div><div class="stat-label">尿铜控制</div></div>
            <div class="stat-box"><div style="font-size:16px;font-weight:700;">${ev.details.cpScore.score}/${ev.details.cpScore.max}</div><div class="stat-label">铜蓝蛋白</div></div>
            <div class="stat-box"><div style="font-size:16px;font-weight:700;">${ev.details.liverScore.score}/${ev.details.liverScore.max}</div><div class="stat-label">肝功能</div></div>
            <div class="stat-box"><div style="font-size:16px;font-weight:700;">${ev.details.dietScore.score}/${ev.details.dietScore.max}</div><div class="stat-label">饮食控制</div></div>
          </div>
        </div>
        <div class="card"><div class="card-title">💡 改善建议</div>${ev.suggestions.map(s => `<div class="alert alert-info">${s}</div>`).join('')}</div>`;
    } catch(e) { return `<div class="alert alert-danger">${e.message}</div>`; }
  },

  // ===== 用药调整建议 =====
  async renderMedAdjust() {
    try {
      const advice = await API.get('/api/medication-advice');
      if (!advice || !advice.details || !advice.details.length) {
        return `<div class="card"><div class="card-title">📋 用药调整建议</div><div class="empty-state"><div class="empty-icon">📊</div><div>暂无检查数据，请先录入检查结果</div><button class="btn btn-primary btn-sm" onclick="App.go('/add-test')">录入检查</button></div></div>`;
      }
      return `
        <div class="card">
          <div class="card-title">📋 用药调整建议</div>
          <div class="alert alert-${advice.level === 'danger' ? 'danger' : advice.level === 'warning' ? 'warning' : 'success'}">${advice.summary}</div>
          <div style="font-size:12px;color:#888;margin-bottom:8px;">基于 ${advice.testDate} 的检查结果分析</div>
          ${advice.details.map(d => `
            <div style="padding:8px;margin-bottom:6px;background:${d.level === 'danger' ? '#ffebee' : d.level === 'warning' ? '#fff3e0' : d.level === 'good' ? '#e8f5e9' : '#e3f2fd'};border-radius:6px;">
              <div style="display:flex;justify-content:space-between;font-size:13px;">
                <strong>${d.indicator}</strong>
                <span>${d.value} · <span style="color:${d.level === 'danger' ? 'var(--red)' : d.level === 'warning' ? 'var(--yellow)' : 'var(--green)'}">${d.status}</span></span>
              </div>
              <div style="font-size:12px;margin-top:4px;">${d.suggestion}</div>
            </div>
          `).join('')}
        </div>
        <div class="card">
          <div class="card-title">🥗 营养补充建议</div>
          ${advice.nutritionTips.map(t => `<div class="alert alert-info" style="font-size:12px;">${t}</div>`).join('')}
          <div class="alert alert-warning" style="font-size:12px;margin-top:6px;">
            ⚠️ 以上建议不能替代医生诊断。药物调整必须在主治医生指导下进行！
          </div>
        </div>
        <button class="btn btn-primary" onclick="App.go('/add-test')" style="width:100%;">📝 录入新的检查结果</button>
      `;
    } catch(e) { return `<div class="alert alert-danger">${e.message}</div>`; }
  },

  // ===== 预警中心 =====
  async renderAlerts() {
    try {
      const { alerts } = await API.getDailyAlerts();
      let h = '';
      if (alerts && alerts.length) {
        h = alerts.map((a, idx) => {
          const l = a.level === 'danger' ? 'danger' : a.level === 'warning' ? 'warning' : 'info';
          return `<div class="alert alert-${l}" style="cursor:pointer;" onclick="App.showAlertDetail('${idx}')">
            <strong>${a.title}</strong><p>${a.message}</p>
            ${a.emergency ? a.emergency.slice(0,2).map(s => `<div style="font-size:12px;">${s.icon} ${s.action}</div>`).join('') : ''}
            ${a.abnormals ? `<div style="font-size:11px;color:var(--red);margin-top:2px;">点击查看${a.abnormals.length}项异常详情</div>` : ''}
          </div>`;
        }).join('');
      } else h = '<div class="alert alert-success">✅ 无预警</div>';
      return `<div class="card"><div class="card-title">🔔 今日预警</div>${h}</div>`;
    } catch(e) { return `<div class="alert alert-danger">${e.message}</div>`; }
  },

  async showAlertDetail(idx) {
    try {
      const { alerts } = await API.getDailyAlerts();
      const a = alerts[idx];
      if (!a) return;
      const d = document.createElement('div'); d.className = 'modal-overlay';
      let html = `<div class="modal-content"><div class="modal-title">${a.title}</div><div class="alert alert-${a.level === 'danger' ? 'danger' : 'warning'}">${a.message}</div>`;
      if (a.emergency) {
        html += `<div style="font-size:13px;font-weight:600;margin:6px 0;">应急处理步骤：</div>`;
        html += a.emergency.map(s => `<div style="padding:4px 0;font-size:12px;">${s.icon} ${s.action}</div>`).join('');
      }
      if (a.abnormals) {
        html += `<div style="font-size:13px;font-weight:600;margin:6px 0;">异常指标详情：</div>`;
        html += a.abnormals.map(ab => `<div class="alert alert-danger" style="font-size:12px;">${ab.label}：${ab.value}（正常范围：${ab.normalRange}）</div>`).join('');
      }
      html += `<button class="btn btn-outline btn-block" onclick="this.closest('.modal-overlay').remove()">关闭</button></div>`;
      d.innerHTML = html;
      d.onclick = function(e) { if (e.target === this) this.remove(); };
      document.body.appendChild(d);
    } catch(e) {}
  },

  // ===== 宝宝档案 =====
  async renderProfile() {
    try {
      const p = await API.getProfile() || {};
      if (p && p.name) {
        return `<div class="card">
          <div style="text-align:center;font-size:36px;">👶</div>
          <div style="text-align:center;font-size:20px;font-weight:600;">${p.name}</div>
          ${p.age ? `<div style="text-align:center;font-size:13px;color:#888;">${p.age}岁 ${p.weight ? '· '+p.weight+'kg' : ''}</div>` : ''}
          <div style="font-size:13px;margin-top:8px;line-height:1.8;">
            ${p.birthDate ? '<p>📅 出生：'+p.birthDate+'</p>' : ''}
            ${p.diagnosisDate ? '<p>🏥 确诊：'+p.diagnosisDate+'</p>' : ''}
            ${p.genotype ? '<p>🧬 基因型：'+p.genotype+'</p>' : ''}
            ${p.doctorName ? '<p>👨‍⚕️ 医生：'+p.doctorName+'</p>' : ''}
            ${p.hospital ? '<p>🏪 医院：'+p.hospital+'</p>' : ''}
          </div>
          <button class="btn btn-primary btn-block" onclick="App.showEditProfile()">✏️ 编辑</button>
        </div>
        <div class="card">
          <button class="btn btn-outline btn-block" onclick="App.showSecurityQuestion()">🔑 设置安全问题（找回密码用）</button>
          <button class="btn btn-outline btn-block" onclick="App.exportData()">📤 导出数据</button>
          <button class="btn btn-outline btn-block" style="margin-top:8px;" onclick="App.logout()">🚪 退出</button>
        </div>`;
      } else {
        return `<div class="card"><div class="empty-state"><div class="empty-icon">👶</div><div>填写宝宝档案</div><button class="btn btn-primary btn-sm" onclick="App.showEditProfile()">立即填写</button></div></div>
        <div class="card"><button class="btn btn-outline btn-block" onclick="App.logout()">🚪 退出</button></div>`;
      }
    } catch(e) { return `<div class="alert alert-danger">${e.message}</div>`; }
  },

  showEditProfile() {
    API.getProfile().then(p => {
      const d = document.createElement('div'); d.className = 'modal-overlay'; d.id = 'profModal';
      d.innerHTML = `<div class="modal-content"><div class="modal-title">${p && p.name ? '编辑' : '填写'}档案</div>
        <div class="form-group"><label class="form-label">名字</label><input class="form-input" id="pfName" value="${(p&&p.name)||''}"></div>
        <div class="form-group"><label class="form-label">年龄(岁)</label><input class="form-input" id="pfAge" type="number" value="${(p&&p.age)||''}"></div>
        <div class="form-group"><label class="form-label">体重(kg)</label><input class="form-input" id="pfWeight" type="number" step="0.5" value="${(p&&p.weight)||''}"></div>
        <div class="form-group"><label class="form-label">确诊日期</label><input class="form-input" id="pfDiagnosis" type="date" value="${(p&&p.diagnosisDate)||''}"></div>
        <div class="form-group"><label class="form-label">主治医生</label><input class="form-input" id="pfDoctor" value="${(p&&p.doctorName)||''}"></div>
        <div class="form-group"><label class="form-label">医院</label><input class="form-input" id="pfHospital" value="${(p&&p.hospital)||''}"></div>
        <button class="btn btn-primary btn-block" onclick="App.saveProfile()">保存</button></div>`;
      d.onclick = function(e) { if(e.target===this) this.remove(); };
      document.body.appendChild(d);
    });
  },
  async saveProfile() {
    const name = document.getElementById('pfName').value.trim();
    if (!name) { alert('请输入名字'); return; }
    await API.saveProfile({ name, age: parseInt(document.getElementById('pfAge').value)||0, weight: parseFloat(document.getElementById('pfWeight').value)||0, diagnosisDate: document.getElementById('pfDiagnosis').value, doctorName: document.getElementById('pfDoctor').value.trim(), hospital: document.getElementById('pfHospital').value.trim() });
    document.getElementById('profModal')?.remove(); this.route();
  },

  async exportData() {
    try {
      const data = await API.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `肝豆健康数据_${this.today()}.json`; a.click();
      alert('✅ 已导出');
    } catch(e) { alert('导出失败'); }
  },

  showSecurityQuestion() {
    const d = document.createElement('div'); d.className = 'modal-overlay'; d.id = 'secQModal';
    d.innerHTML = `<div class="modal-content"><div class="modal-title">🔑 设置安全问题</div>
      <p style="font-size:13px;color:#888;margin-bottom:10px;">设置安全问题后，可用于找回密码</p>
      <div class="form-group"><label class="form-label">安全问题</label>
        <select class="form-select" id="sqQuestion">
          <option value="您的出生地是？">您的出生地是？</option>
          <option value="您母亲的姓名是？">您母亲的姓名是？</option>
          <option value="您父亲的姓名是？">您父亲的姓名是？</option>
          <option value="您的小学名称是？">您的小学名称是？</option>
          <option value="您宠物的名字是？">您宠物的名字是？</option>
          <option value="您最喜爱的城市是？">您最喜爱的城市是？</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">答案</label><input class="form-input" id="sqAnswer" placeholder="请牢记您的答案"></div>
      <button class="btn btn-primary btn-block" onclick="App.saveSecurityQuestion()">保存</button>
      <button class="btn btn-outline btn-block" style="margin-top:6px;" onclick="this.closest('.modal-overlay').remove()">取消</button>
    </div>`;
    d.onclick = function(e) { if (e.target === this) this.remove(); };
    document.body.appendChild(d);
  },

  async saveSecurityQuestion() {
    const q = document.getElementById('sqQuestion')?.value;
    const a = document.getElementById('sqAnswer')?.value.trim();
    if (!a) { alert('请输入答案'); return; }
    try {
      await API.setSecurityQuestion(q, a);
      document.getElementById('secQModal')?.remove();
      alert('✅ 安全问题设置成功！');
    } catch(e) { alert('设置失败：' + e.message); }
  },

  showMoreMenu() {
    const d = document.createElement('div'); d.className = 'modal-overlay';
    d.innerHTML = `<div class="modal-content" style="max-width:280px;"><div class="modal-title">📋 功能</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <button class="btn btn-outline" onclick="App.go('/nutrition');d.closest('.modal-overlay').remove();" style="flex-direction:column;padding:14px;"><div style="font-size:28px;">🥬</div><div style="font-size:12px;">营养分析</div></button>
        <button class="btn btn-outline" onclick="App.go('/evaluation');d.closest('.modal-overlay').remove();" style="flex-direction:column;padding:14px;"><div style="font-size:28px;">📈</div><div style="font-size:12px;">控铜评估</div></button>
        <button class="btn btn-outline" onclick="App.go('/alerts');d.closest('.modal-overlay').remove();" style="flex-direction:column;padding:14px;"><div style="font-size:28px;">🔔</div><div style="font-size:12px;">预警中心</div></button>
        <button class="btn btn-outline" onclick="App.go('/referral');d.closest('.modal-overlay').remove();" style="flex-direction:column;padding:14px;"><div style="font-size:28px;">🏥</div><div style="font-size:12px;">智能导诊</div></button>
        <button class="btn btn-outline" onclick="App.go('/drug-check');d.closest('.modal-overlay').remove();" style="flex-direction:column;padding:14px;"><div style="font-size:28px;">💊</div><div style="font-size:12px;">用药评估</div></button>
        <button class="btn btn-outline" onclick="App.go('/med-adjust');d.closest('.modal-overlay').remove();" style="flex-direction:column;padding:14px;"><div style="font-size:28px;">📋</div><div style="font-size:12px;">用药调整</div></button>
        <button class="btn btn-outline" onclick="App.go('/profile');d.closest('.modal-overlay').remove();" style="flex-direction:column;padding:14px;"><div style="font-size:28px;">👶</div><div style="font-size:12px;">宝宝档案</div></button>
      </div>
      <button class="btn btn-outline btn-block" style="margin-top:10px;" onclick="this.closest('.modal-overlay').remove()">关闭</button></div>`;
    d.onclick = function(e) { if (e.target === this) this.remove(); };
    document.body.appendChild(d);
  },

  // ===== 智能导诊 =====
  async renderReferral() {
    try {
      const records = await API.getTests();
      const latest = records && records.length ? records[records.length - 1] : null;
      const regions = await API.get('/api/referral/regions');
      return `
        <div class="card">
          <div class="card-title">🏥 智能导诊</div>
          <div style="font-size:13px;color:#888;margin-bottom:10px;">根据宝宝的症状和检查结果，推荐合适的科室和医生</div>
          <div class="form-group">
            <label class="form-label">当前症状（多选）</label>
          </div>
          <div id="symptomCheckboxes" style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px;">
            ${['肝功能异常','转氨酶升高','黄疸','手抖/震颤','走路不稳','说话不清','情绪异常','皮肤过敏','皮疹','乏力','食欲不振','贫血'].map(s =>
              `<label style="font-size:13px;display:flex;align-items:center;gap:4px;padding:4px;"><input type="checkbox" class="symptom-cb" value="${s}">${s}</label>`
            ).join('')}
          </div>
          <button class="btn btn-primary btn-sm" onclick="App.doReferral()">🔍 推荐科室</button>
          <div id="referralResult" style="margin-top:10px;"></div>
        </div>

        <div class="card">
          <div class="card-title">📋 最新检查异常提示</div>
          ${latest ? `
            <div style="font-size:13px;">
              <p>检查日期：${latest.date}</p>
              ${latest.urinaryCopper24h ? `<p>24h尿铜：${latest.urinaryCopper24h} μg/24h</p>` : ''}
              ${latest.alt ? `<p>ALT：${latest.alt} U/L</p>` : ''}
              ${latest.ceruloplasmin ? `<p>铜蓝蛋白：${latest.ceruloplasmin} g/L</p>` : ''}
              ${latest.serumCalcium ? `<p>血钙：${latest.serumCalcium} mmol/L</p>` : ''}
              ${latest.wbc ? `<p>白细胞：${latest.wbc} ×10⁹/L</p>` : ''}
            </div>
            <button class="btn btn-outline btn-sm" onclick="App.doReferralByTest()" style="margin-top:6px;">📊 根据检查结果导诊</button>
            <div id="testReferralResult" style="margin-top:6px;"></div>
          ` : '<div style="font-size:13px;color:#888;">暂无检查数据</div>'}
        </div>

        <div class="card">
          <div class="card-title">🏪 全国肝豆专家推荐</div>
          <div class="form-group">
            <select class="form-select" id="regionSelect" onchange="App.loadDoctorsByRegion()">
              <option value="">选择地区</option>
              ${Array.isArray(regions) ? regions.map(r => `<option value="${r.region}">${r.region}（${r.hospitalCount}家医院）</option>`).join('') : ''}
            </select>
          </div>
          <div id="doctorList" style="font-size:13px;"></div>
        </div>
      `;
    } catch(e) { return `<div class="alert alert-danger">${e.message}</div>`; }
  },

  async doReferral() {
    const checked = [...document.querySelectorAll('.symptom-cb:checked')].map(el => el.value);
    if (!checked.length) { document.getElementById('referralResult').innerHTML = '<div class="alert alert-warning">请选择症状</div>'; return; }
    try {
      const res = await API.post('/api/referral/recommend', { symptoms: checked });
      const container = document.getElementById('referralResult');
      if (!res.matches || !res.matches.length) {
        container.innerHTML = '<div class="alert alert-info">未匹配到特定科室，建议先挂肝病科或神经内科进行排查</div>'; return;
      }
      container.innerHTML = res.matches.map(m => `
        <div class="alert alert-info">
          <strong>推荐科室：${m.departments.join('、')}</strong><br>
          ${m.description}
        </div>
      `).join('');
    } catch(e) {}
  },

  async doReferralByTest() {
    try {
      const res = await API.post('/api/referral/recommend', { symptoms: [] });
      const container = document.getElementById('testReferralResult');
      if (!res.testMatches || !res.testMatches.length) {
        container.innerHTML = '<div class="alert alert-success">暂无异常指标</div>'; return;
      }
      container.innerHTML = res.testMatches.map(m => `
        <div class="alert alert-warning">
          <strong>${m.dept}</strong><br>${m.note}
        </div>
      `).join('');
    } catch(e) {}
  },

  async loadDoctorsByRegion() {
    const region = document.getElementById('regionSelect').value;
    if (!region) { document.getElementById('doctorList').innerHTML = ''; return; }
    try {
      const data = await API.get('/api/referral/doctors?region=' + encodeURIComponent(region));
      const container = document.getElementById('doctorList');
      if (!data || !data.hospitals) { container.innerHTML = '<div class="alert alert-warning">暂无数据</div>'; return; }
      container.innerHTML = data.hospitals.map(h => `
        <div style="margin-bottom:10px;padding:8px;background:#f8f9ff;border-radius:6px;">
          <div style="font-weight:600;font-size:14px;">${h.name}</div>
          <div style="font-size:12px;color:#888;">${h.department}</div>
          ${h.doctors.map(d => `<div style="font-size:12px;padding:2px 0;">👨‍⚕️ ${d.name} ${d.title} — ${d.expertise}</div>`).join('')}
        </div>
      `).join('');
    } catch(e) {}
  },

  // ===== 用药安全评估 =====
  async renderDrugCheck() {
    try {
      const drugs = await API.get('/api/drugs/all');
      return `
        <div class="card">
          <div class="card-title">💊 用药安全评估</div>
          <div style="font-size:13px;color:#888;margin-bottom:10px;">查询药物与肝豆治疗方案的相互作用，确保用药安全</div>
          <div class="form-group">
            <input class="form-input" id="drugSearchInput" placeholder="搜索药品名称或品牌名..." oninput="App.searchDrugs()">
          </div>
          <div id="drugSearchResults" style="max-height:400px;overflow-y:auto;"></div>
        </div>
        <div class="card">
          <div class="card-title">📋 常用药物速查</div>
          <div id="drugQuickList" style="font-size:13px;">
            ${Array.isArray(drugs) ? drugs.slice(0, 6).map(d => `
              <div style="padding:8px;border-bottom:1px solid #f0f0f0;cursor:pointer;" onclick="App.showDrugDetail('${d.name}')">
                <div style="font-weight:600;">${d.name}</div>
                <div style="font-size:12px;color:#888;">${d.category} · ${d.commonBrands?.[0] || ''}</div>
                <div style="font-size:12px;margin-top:2px;">${d.wilsonAdvice ? d.wilsonAdvice.slice(0, 60) + '...' : ''}</div>
              </div>
            `).join('') : ''}
          </div>
        </div>
        <div class="card">
          <div class="card-title">⚠️ 重要提醒</div>
          <div style="font-size:13px;line-height:1.8;">
            <p>🔹 任何用药调整都应在医生指导下进行</p>
            <p>🔹 青霉胺与锌剂须间隔<b>2-4小时</b>服用</p>
            <p>🔹 青霉胺会增加维生素B6排泄，需常规补充</p>
            <p>🔹 青霉胺可能影响钙代谢，建议补钙+维生素D</p>
            <p>🔹 抗组胺药（西替利嗪/氯雷他定）与肝豆药物<b>无直接相互作用</b>，可用</p>
            <p>🔹 退热首选对乙酰氨基酚，但需控制剂量</p>
          </div>
        </div>
      `;
    } catch(e) { return `<div class="alert alert-danger">${e.message}</div>`; }
  },

  async searchDrugs() {
    const q = document.getElementById('drugSearchInput').value.trim();
    const c = document.getElementById('drugSearchResults');
    if (!q) { c.innerHTML = ''; return; }
    try {
      const drugs = await API.get('/api/drugs/search?q=' + encodeURIComponent(q));
      if (!drugs || !drugs.length) { c.innerHTML = '<div style="padding:10px;font-size:13px;color:#888;">未找到，请检查药品名称</div>'; return; }
      c.innerHTML = drugs.map(d => `
        <div style="padding:10px;border-bottom:1px solid #f0f0f0;cursor:pointer;" onclick="App.showDrugDetail('${d.name}')">
          <div style="font-weight:600;font-size:14px;">${d.name}</div>
          <div style="font-size:12px;color:#888;">${d.category} · ${d.commonBrands?.join('、') || ''}</div>
          <div style="font-size:12px;margin-top:4px;">${d.wilsonAdvice || ''}</div>
        </div>
      `).join('');
    } catch(e) {}
  },

  async showDrugDetail(name) {
    try {
      const drugs = await API.get('/api/drugs/all');
      const d = drugs.find(dd => dd.name === name);
      if (!d) return;
      const overlay = document.createElement('div'); overlay.className = 'modal-overlay';
      overlay.innerHTML = `<div class="modal-content">
        <div class="modal-title">💊 ${d.name}</div>
        <div style="font-size:13px;margin-bottom:8px;color:#888;">${d.category} · ${d.commonBrands?.join('、') || ''}</div>
        <div style="font-size:13px;margin-bottom:8px;padding:8px;background:#e8f5e9;border-radius:6px;">${d.wilsonAdvice || '暂无肝豆相关建议'}</div>
        ${d.hepaticWarning ? `<div style="font-size:12px;margin-bottom:4px;"><strong>⚠️ 肝功能：</strong>${d.hepaticWarning}</div>` : ''}
        ${d.renalWarning ? `<div style="font-size:12px;margin-bottom:4px;"><strong>⚠️ 肾功能：</strong>${d.renalWarning}</div>` : ''}
        ${d.interactions && d.interactions.length ? `<div style="font-size:12px;margin-top:6px;"><strong>药物相互作用：</strong>${d.interactions.map(i => `<div style="padding:2px 0;">• ${i.with}：${i.level} — ${i.note}</div>`).join('')}</div>` : ''}
        ${d.note ? `<div style="font-size:12px;color:#888;margin-top:6px;padding-top:6px;border-top:1px solid #eee;">${d.note}</div>` : ''}
        <button class="btn btn-outline btn-block" style="margin-top:10px;" onclick="this.closest('.modal-overlay').remove()">关闭</button>
      </div>`;
      overlay.onclick = function(e) { if (e.target === this) this.remove(); };
      document.body.appendChild(overlay);
    } catch(e) {}
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());