// 药物相互作用数据库 - 针对肝豆患者用药安全评估
// 重点关注与青霉胺、锌剂、曲恩汀的相互作用

const DRUG_DATABASE = [
  // ===== 抗过敏药（抗组胺药） =====
  {
    name: '西替利嗪(仙特明/Zyrtec)',
    category: '抗组胺药',
    commonBrands: ['仙特明', '西替利嗪滴剂', '盐酸西替利嗪片'],
    interactions: [
      { with: '青霉胺', level: '低风险', note: '无明显直接相互作用，但西替利嗪主要经肾排泄，青霉胺有肾毒性可能，肾功能不全者需调整剂量' },
      { with: '锌剂', level: '安全', note: '无已知相互作用' },
      { with: '曲恩汀', level: '低风险', note: '无直接相互作用' }
    ],
    wilsonAdvice: '✅ 可用于肝豆患者。西替利嗪与青霉胺无直接相互作用，但青霉胺可能影响肾功能，长期使用西替利嗪的肝豆患者建议监测肾功能。儿童可用滴剂，按体重调整剂量。',
    hepaticWarning: '肝功能轻中度受损一般无需调整剂量',
    renalWarning: '肾功能不全（肌酐清除率<30ml/min）需减量或延长间隔',
    note: '第二代抗组胺药，嗜睡副作用较轻'
  },
  {
    name: '氯雷他定(开瑞坦/Clarityne)',
    category: '抗组胺药',
    commonBrands: ['开瑞坦', '氯雷他定片', '氯雷他定糖浆'],
    interactions: [
      { with: '青霉胺', level: '低风险', note: '无直接相互作用。氯雷他定经肝脏CYP3A4代谢，青霉胺不抑制此酶' },
      { with: '锌剂', level: '安全', note: '无已知相互作用' },
      { with: '曲恩汀', level: '低风险', note: '无直接相互作用' }
    ],
    wilsonAdvice: '✅ 可用于肝豆患者。氯雷他定与青霉胺无相互作用，是肝豆患者抗过敏的较好选择。注意：如肝功能严重受损（child C级），需减量使用。',
    hepaticWarning: '严重肝功能不全（Child-Pugh C）需减量或慎用',
    renalWarning: '肾功能不全一般无需调整剂量',
    note: '第二代抗组胺药，嗜睡副作用更轻，适合白天使用'
  },
  {
    name: '地氯雷他定(恩理思/Aerius)',
    category: '抗组胺药',
    commonBrands: ['恩理思', '地氯雷他定片'],
    interactions: [
      { with: '青霉胺', level: '安全', note: '无已知相互作用' },
      { with: '锌剂', level: '安全', note: '无已知相互作用' }
    ],
    wilsonAdvice: '✅ 可用。是氯雷他定的活性代谢产物，不依赖肝脏代谢，对肝功能不全患者更安全。',
    hepaticWarning: '肝功能不全一般无需调整',
    renalWarning: '严重肾功能不全需慎用',
    note: '第三代抗组胺药，起效快，嗜睡副作用极少'
  },
  {
    name: '苯海拉明(苯那君/Benadryl)',
    category: '抗组胺药(第一代)',
    commonBrands: ['苯海拉明片'],
    interactions: [
      { with: '青霉胺', level: '低风险', note: '无直接相互作用' },
      { with: '锌剂', level: '安全', note: '无已知相互作用' }
    ],
    wilsonAdvice: '⚠️ 可用但非首选。第一代抗组胺药，嗜睡作用强，可能掩盖神经系统症状。建议优先选第二、三代抗组胺药。',
    note: '第一代抗组胺药，嗜睡作用强'
  },

  // ===== 解热镇痛药 =====
  {
    name: '对乙酰氨基酚(扑热息痛/Tylenol)',
    category: '解热镇痛药',
    commonBrands: ['泰诺林', '百服宁'],
    interactions: [
      { with: '青霉胺', level: '中等风险', note: '两者均有潜在肝毒性风险，联合使用可能增加肝脏负担；对乙酰氨基酚过量使用会消耗谷胱甘肽' }
    ],
    wilsonAdvice: '⚠️ 可用于肝豆患者，但必须严格控制剂量（不超过推荐剂量）。肝功能异常者更需谨慎，单次不超过10mg/kg。避免与含有对乙酰氨基酚的复方感冒药同服。',
    hepaticWarning: '肝功能受损者需减量，严重肝病者慎用',
    note: '肝豆患者首选的退热止痛药，但需注意剂量，切勿超量'
  },
  {
    name: '布洛芬(美林/芬必得)',
    category: '解热镇痛药(NSAIDs)',
    commonBrands: ['美林', '芬必得', '布洛芬混悬液'],
    interactions: [
      { with: '青霉胺', level: '中等风险', note: '布洛芬可能影响肾功能，与青霉胺的肾毒性叠加。同时使用可能增加肾损伤风险' }
    ],
    wilsonAdvice: '⚠️ 尽量少用。如需使用，短期低剂量（不超过3天）。多喝水保护肾脏。有肾功能异常的患者避免使用。',
    hepaticWarning: '肝功能不全者慎用',
    renalWarning: '肾功能不全者禁用',
    note: '非甾体抗炎药，有肾损伤风险'
  },

  // ===== 抗生素 =====
  {
    name: '阿莫西林(阿莫仙)',
    category: '抗生素(青霉素类)',
    commonBrands: ['阿莫仙', '阿莫西林颗粒'],
    interactions: [
      { with: '青霉胺', level: '注意', note: '两者均为青霉素衍生物，理论上存在交叉过敏风险。青霉胺治疗前需做青霉素皮试' }
    ],
    wilsonAdvice: '⚠️ 青霉胺是一种青霉素衍生物，青霉素过敏者禁用青霉胺。使用阿莫西林前需确认无青霉素过敏史。如果孩子对青霉素过敏，需告知主治医生。',
    note: '对青霉素过敏者禁用'
  },
  {
    name: '头孢克肟(世福素)',
    category: '抗生素(头孢类)',
    commonBrands: ['世福素', '头孢克肟颗粒'],
    interactions: [
      { with: '青霉胺', level: '低风险', note: '无已知直接相互作用' }
    ],
    wilsonAdvice: '✅ 可用。与青霉胺无明显相互作用，细菌感染时可作为抗生素选择之一。',
    note: '与青霉素类无交叉过敏'
  },

  // ===== 激素类 =====
  {
    name: '泼尼松(强的松)',
    category: '糖皮质激素',
    commonBrands: ['强的松', '醋酸泼尼松片'],
    interactions: [
      { with: '青霉胺', level: '注意', note: '糖皮质激素可能增加胃肠道溃疡风险，与青霉胺联用时需注意' }
    ],
    wilsonAdvice: '⚠️ 肝豆患者可短期使用，但需在医生指导下。长期使用可能影响骨代谢，需监测骨密度和血钙。',
    hepaticWarning: '肝功能不全者可用的选择'
  },

  // ===== 其他常见药 =====
  {
    name: '益生菌(妈咪爱/培菲康)',
    category: '消化系统',
    commonBrands: ['妈咪爱', '培菲康', '合生元'],
    interactions: [],
    wilsonAdvice: '✅ 完全安全。可与所有肝豆药物同时使用，有助于改善肠道健康和铜排泄。',
    note: '安全，推荐肝豆患者常规补充'
  },
  {
    name: '维生素B6(吡哆醇)',
    category: '维生素',
    commonBrands: ['维生素B6片'],
    interactions: [
      { with: '青霉胺', level: '须知', note: '青霉胺会增加维生素B6的排泄，长期使用青霉胺可能导致B6缺乏' }
    ],
    wilsonAdvice: '✅ 推荐补充。青霉胺治疗期间应常规补充维生素B6（每日10-25mg），可预防青霉胺引起的B6缺乏。食物来源：土豆、香蕉、鸡胸肉。',
    note: '青霉胺治疗期间推荐常规补充'
  },
  {
    name: '钙剂(碳酸钙/葡萄糖酸钙)',
    category: '矿物质补充剂',
    commonBrands: ['迪巧', '钙尔奇', '葡萄糖酸钙口服液'],
    interactions: [
      { with: '锌剂', level: '注意', note: '高剂量钙可能影响锌的吸收，建议间隔2-3小时服用' }
    ],
    wilsonAdvice: '✅ 推荐补充。青霉胺可影响钙代谢，长期使用需补钙。但需注意：钙与锌剂建议间隔服用。低铜高钙食物首选牛奶、酸奶。',
    note: '与锌剂建议间隔2-3小时服用'
  },
  {
    name: '维生素D',
    category: '维生素',
    commonBrands: ['伊可新', '维生素D滴剂'],
    interactions: [],
    wilsonAdvice: '✅ 推荐补充。促进钙吸收，对骨健康重要。青霉胺影响钙代谢，同时补钙和维生素D效果更好。',
    note: '与钙剂同服效果更佳'
  },
  {
    name: '蒙脱石散(思密达)',
    category: '消化系统(止泻)',
    commonBrands: ['思密达', '蒙脱石散'],
    interactions: [
      { with: '青霉胺', level: '注意', note: '蒙脱石散有吸附作用，可能吸附青霉胺，影响吸收' },
      { with: '锌剂', level: '注意', note: '可能吸附锌剂，影响吸收' }
    ],
    wilsonAdvice: '⚠️ 可使用，但必须与青霉胺/锌剂间隔至少2小时服用。建议顺序：早上空腹青霉胺→中午蒙脱石散→晚上锌剂。',
    note: '需与青霉胺和锌剂间隔>2小时'
  },
  {
    name: '铁剂(硫酸亚铁/富马酸亚铁)',
    category: '矿物质补充剂',
    commonBrands: ['力蜚能', '富马酸亚铁'],
    interactions: [
      { with: '青霉胺', level: '注意', note: '铁剂会降低青霉胺的吸收，应间隔2-3小时' },
      { with: '锌剂', level: '注意', note: '铁和锌互相竞争吸收，建议间隔服用' }
    ],
    wilsonAdvice: '⚠️ 如贫血需补铁，需与青霉胺间隔至少2小时服用。建议：青霉胺（早晚餐前）→铁剂（餐后）。',
    note: '与青霉胺、锌剂均需间隔2-3小时'
  }
];

function findDrug(name) {
  const query = name.toLowerCase().trim();
  return DRUG_DATABASE.find(d =>
    d.name.toLowerCase().includes(query) ||
    d.commonBrands.some(b => b.toLowerCase().includes(query))
  );
}

function searchDrugs(query) {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().trim();
  return DRUG_DATABASE.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.category.toLowerCase().includes(q) ||
    d.commonBrands.some(b => b.toLowerCase().includes(q))
  );
}

function getAllDrugCategories() {
  return [...new Set(DRUG_DATABASE.map(d => d.category))];
}

module.exports = { DRUG_DATABASE, findDrug, searchDrugs, getAllDrugCategories };