// 肝豆状核变性 全国知名医院及专家数据库
// 数据来源：公开医疗信息整理，仅供参考

const DOCTOR_DATABASE = {
  // 按地区分类
  beijing: {
    region: '北京',
    hospitals: [
      {
        name: '北京大学第一医院',
        department: '小儿神经内科',
        doctors: [
          { name: '包新华', title: '主任医师', expertise: '小儿神经系统疾病、肝豆状核变性', rating: 4.9 },
          { name: '熊晖', title: '主任医师', expertise: '小儿神经遗传病、肌肉病' }
        ]
      },
      {
        name: '首都医科大学附属北京儿童医院',
        department: '神经内科/肝病中心',
        doctors: [
          { name: '方方', title: '主任医师', expertise: '小儿神经系统疾病、遗传代谢病' }
        ]
      },
      {
        name: '首都医科大学附属北京地坛医院',
        department: '肝病中心',
        doctors: [
          { name: '陈煜', title: '主任医师', expertise: '肝病、肝豆状核变性、遗传代谢性肝病' }
        ]
      },
      {
        name: '北京协和医院',
        department: '肝病科/神经内科',
        doctors: [
          { name: '李骥', title: '主任医师', expertise: '遗传代谢性肝病' }
        ]
      }
    ]
  },
  shanghai: {
    region: '上海',
    hospitals: [
      {
        name: '复旦大学附属华山医院',
        department: '神经内科/感染科',
        doctors: [
          { name: '王坚', title: '主任医师', expertise: '帕金森、肝豆状核变性、运动障碍疾病' },
          { name: '吴志英', title: '主任医师', expertise: '神经遗传病、肝豆状核变性、运动障碍' }
        ]
      },
      {
        name: '复旦大学附属儿科医院',
        department: '肝病科/神经内科',
        doctors: [
          { name: '王建设', title: '主任医师', expertise: '儿童肝病、遗传代谢性肝病、肝豆状核变性' },
          { name: '方微园', title: '副主任医师', expertise: '儿童肝病、肝豆状核变性、遗传代谢性肝病' }
        ]
      },
      {
        name: '上海交通大学医学院附属新华医院',
        department: '小儿神经内科/小儿消化营养科',
        doctors: [
          { name: '张建明', title: '主任医师', expertise: '小儿神经遗传病' }
        ]
      }
    ]
  },
  guangzhou: {
    region: '广州',
    hospitals: [
      {
        name: '中山大学附属第一医院',
        department: '神经内科/消化内科',
        doctors: [
          { name: '陈玲', title: '主任医师', expertise: '肝豆状核变性、运动障碍疾病' }
        ]
      },
      {
        name: '广州市妇女儿童医疗中心',
        department: '消化科/神经内科',
        doctors: [
          { name: '龚四堂', title: '主任医师', expertise: '儿童消化系统疾病、肝病' }
        ]
      }
    ]
  },
  changsha: {
    region: '长沙',
    hospitals: [
      {
        name: '中南大学湘雅医院',
        department: '感染病科/神经内科',
        doctors: [
          { name: '胡国龄', title: '主任医师', expertise: '感染病、肝病' },
          { name: '杨晓苏', title: '主任医师', expertise: '神经内科、运动障碍疾病' }
        ]
      },
      {
        name: '中南大学湘雅二医院',
        department: '神经内科/小儿科',
        doctors: [
          { name: '张洁', title: '主任医师', expertise: '小儿神经病、肝豆状核变性' }
        ]
      },
      {
        name: '湖南省儿童医院',
        department: '肝病中心/神经内科',
        doctors: [
          { name: '李双杰', title: '主任医师', expertise: '儿童肝病、遗传代谢性肝病' }
        ]
      }
    ]
  },
  hangzhou: {
    region: '杭州',
    hospitals: [
      {
        name: '浙江大学医学院附属第一医院',
        department: '感染病科/神经内科',
        doctors: [
          { name: '盛吉芳', title: '主任医师', expertise: '感染病、肝病' }
        ]
      },
      {
        name: '浙江大学医学院附属儿童医院',
        department: '消化内科/神经内科',
        doctors: [
          { name: '陈洁', title: '主任医师', expertise: '儿童消化系统疾病、肝病' }
        ]
      }
    ]
  },
  chengdu: {
    region: '成都',
    hospitals: [
      {
        name: '四川大学华西医院',
        department: '神经内科/消化内科',
        doctors: [
          { name: '商慧芳', title: '主任医师', expertise: '运动障碍、神经遗传病' }
        ]
      }
    ]
  },
  wuhan: {
    region: '武汉',
    hospitals: [
      {
        name: '华中科技大学同济医学院附属同济医院',
        department: '神经内科/儿科',
        doctors: [
          { name: '张旻', title: '主任医师', expertise: '神经遗传病、肝豆状核变性' }
        ]
      },
      {
        name: '武汉大学人民医院',
        department: '神经内科/消化内科',
        doctors: [
          { name: '张兆辉', title: '主任医师', expertise: '神经内科疾病' }
        ]
      }
    ]
  }
};

// 症状-科室映射
const SYMPTOM_DEPT_MAP = [
  { symptoms: ['肝功能异常', '转氨酶升高', '黄疸', '肝大', '腹水', '肝硬化', '肝区不适', '乏力', '食欲不振'],
    departments: ['肝病科/消化内科', '感染科'],
    description: '以肝脏损害为主要表现，建议优先挂肝病科或消化内科' },
  { symptoms: ['手抖', '震颤', '走路不稳', '说话不清', '吞咽困难', '流口水', '肌张力高', '舞蹈样动作', '面部表情少'],
    departments: ['神经内科'],
    description: '以神经系统症状为主要表现，建议挂神经内科' },
  { symptoms: ['情绪异常', '性格改变', '易怒', '抑郁', '学习下降', '注意力不集中', '行为异常'],
    departments: ['神经内科', '心理科/精神科'],
    description: '以精神症状为主要表现，建议先挂神经内科排查' },
  { symptoms: ['眼睛发黄', '视力下降', '角膜K-F环'],
    departments: ['眼科', '肝病科'],
    description: '眼部症状需眼科检查K-F环，同时挂肝病科' },
  { symptoms: ['关节痛', '骨骼疼痛', '骨质疏松'],
    departments: ['骨科/风湿免疫科', '肝病科'],
    description: '骨骼症状需排查Wilson病相关的骨关节病变' },
  { symptoms: ['皮肤过敏', '湿疹', '皮疹', '瘙痒'],
    departments: ['皮肤科', '变态反应科'],
    description: '皮肤症状可挂皮肤科，但需告知医生有肝豆病史' },
  { symptoms: ['肾功能异常', '蛋白尿', '血尿', '浮肿'],
    departments: ['肾内科', '肝病科'],
    description: '需排查是否为药物（青霉胺）引起的肾损害' },
  { symptoms: ['贫血', '血小板减少', '白细胞减少', '出血倾向'],
    departments: ['血液科', '肝病科'],
    description: '需排查是否为药物引起的骨髓抑制' },
];

// 检查指标-科室映射
const TEST_DEPT_MAP = [
  { test: 'urinaryCopper24h', high: true, dept: '肝病科/神经内科', note: '24h尿铜升高提示体内铜负荷过高' },
  { test: 'ceruloplasmin', low: true, dept: '肝病科', note: '铜蓝蛋白降低是Wilson病的典型表现' },
  { test: 'alt', high: true, dept: '肝病科', note: 'ALT升高提示肝功能受损' },
  { test: 'ast', high: true, dept: '肝病科', note: 'AST升高提示肝功能受损' },
  { test: 'tbil', high: true, dept: '肝病科', note: '胆红素升高提示黄疸' },
  { test: 'creatinine', high: true, dept: '肾内科', note: '肌酐升高需排查肾功能受损' },
  { test: 'wbc', low: true, dept: '血液科', note: '白细胞减少需排查药物引起的骨髓抑制' },
  { test: 'hemoglobin', low: true, dept: '血液科', note: '贫血需排查药物影响或营养问题' },
  { test: 'serumCalcium', low: true, dept: '肝病科/营养科', note: '血钙偏低需补钙，注意青霉胺影响钙代谢' },
  { test: 'vitaminB6', low: true, dept: '肝病科/营养科', note: 'B6偏低需补充，青霉胺会增加B6消耗' },
  { test: 'serumZinc', low: true, dept: '肝病科', note: '血锌偏低需补充，锌剂可辅助排铜' },
];

function recommendBySymptoms(symptomList) {
  if (!symptomList || symptomList.length === 0) return [];
  const matched = new Set();
  for (const symptom of symptomList) {
    for (const map of SYMPTOM_DEPT_MAP) {
      if (map.symptoms.some(s => symptom.includes(s) || s.includes(symptom))) {
        matched.add(map);
      }
    }
  }
  return Array.from(matched);
}

function recommendByTestResults(record) {
  if (!record) return [];
  const results = [];
  for (const map of TEST_DEPT_MAP) {
    const val = record[map.test];
    if (val === null || val === undefined || val === '') continue;
    if (map.high && val > 0) {
      // 检查是否超出正常上限
      const { getAllTestItems } = require('./testPanel');
      const items = getAllTestItems();
      const item = items.find(i => i.key === map.test);
      if (item && val > item.normalHigh) {
        results.push(map);
      }
    }
    if (map.low && val > 0) {
      const { getAllTestItems } = require('./testPanel');
      const items = getAllTestItems();
      const item = items.find(i => i.key === map.test);
      if (item && val < item.normalLow) {
        results.push(map);
      }
    }
  }
  return results;
}

function getAllRegions() {
  return Object.values(DOCTOR_DATABASE).map(r => ({
    region: r.region,
    hospitalCount: r.hospitals.length,
    doctorCount: r.hospitals.reduce((s, h) => s + h.doctors.length, 0)
  }));
}

function getDoctorsByRegion(region) {
  return Object.values(DOCTOR_DATABASE).find(r => r.region === region) || null;
}

function recommendDoctors(deptName) {
  const results = [];
  for (const region of Object.values(DOCTOR_DATABASE)) {
    for (const hospital of region.hospitals) {
      if (hospital.department.includes(deptName) || deptName.includes(hospital.department)) {
        for (const doc of hospital.doctors) {
          results.push({ ...doc, hospital: hospital.name, department: hospital.department, region: region.region });
        }
      }
    }
  }
  return results;
}

module.exports = {
  DOCTOR_DATABASE, SYMPTOM_DEPT_MAP, TEST_DEPT_MAP,
  recommendBySymptoms, recommendByTestResults,
  getAllRegions, getDoctorsByRegion, recommendDoctors
};