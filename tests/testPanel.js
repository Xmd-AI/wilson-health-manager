// 肝豆状核变性全套检查项目模板（完整版）
const TEST_PANEL = {
  copperMetabolism: {
    label: '铜代谢核心指标',
    items: [
      { key: 'ceruloplasmin', label: '血清铜蓝蛋白', unit: 'g/L', normalLow: 0.20, normalHigh: 0.60, precision: 2 },
      { key: 'serumCopper', label: '血清总铜', unit: 'μg/mL', normalLow: 0.8, normalHigh: 1.2, precision: 1 },
      { key: 'freeCopper', label: '血清游离铜(NCC)', unit: 'μg/dL', normalLow: 0, normalHigh: 10, precision: 1 },
    ]
  },
  urine24h: {
    label: '24小时尿液指标',
    items: [
      { key: 'urineVolume24h', label: '24小时尿量', unit: 'mL/24h', normalLow: 800, normalHigh: 2000, precision: 0 },
      { key: 'urinaryCopper24h', label: '24小时尿铜', unit: 'μg/24h', normalLow: 0, normalHigh: 100, precision: 0 },
      { key: 'urinaryZinc24h', label: '24小时尿锌', unit: 'μg/24h', normalLow: 200, normalHigh: 600, precision: 0 },
      { key: 'urineProtein24h', label: '24小时尿蛋白', unit: 'mg/24h', normalLow: 0, normalHigh: 150, precision: 0 },
    ]
  },
  liverFunction: {
    label: '肝功能',
    items: [
      { key: 'alt', label: 'ALT(谷丙转氨酶)', unit: 'U/L', normalLow: 0, normalHigh: 40, precision: 0 },
      { key: 'ast', label: 'AST(谷草转氨酶)', unit: 'U/L', normalLow: 0, normalHigh: 40, precision: 0 },
      { key: 'ggt', label: 'GGT(γ-谷氨酰转肽酶)', unit: 'U/L', normalLow: 0, normalHigh: 45, precision: 0 },
      { key: 'alp', label: 'ALP(碱性磷酸酶)', unit: 'U/L', normalLow: 0, normalHigh: 500, precision: 0 },
      { key: 'tbil', label: '总胆红素(TBIL)', unit: 'μmol/L', normalLow: 0, normalHigh: 21, precision: 1 },
      { key: 'dbil', label: '直接胆红素(DBIL)', unit: 'μmol/L', normalLow: 0, normalHigh: 7, precision: 1 },
      { key: 'tp', label: '总蛋白(TP)', unit: 'g/L', normalLow: 65, normalHigh: 85, precision: 1 },
      { key: 'alb', label: '白蛋白(ALB)', unit: 'g/L', normalLow: 35, normalHigh: 55, precision: 1 },
      { key: 'globulin', label: '球蛋白(GLOB)', unit: 'g/L', normalLow: 20, normalHigh: 35, precision: 1 },
      { key: 'agRatio', label: '白球比(A/G)', unit: '', normalLow: 1.2, normalHigh: 2.5, precision: 2 },
      { key: 'tba', label: '总胆汁酸(TBA)', unit: 'μmol/L', normalLow: 0, normalHigh: 10, precision: 1 },
    ]
  },
  renalFunction: {
    label: '肾功能',
    items: [
      { key: 'creatinine', label: '肌酐(Cr)', unit: 'μmol/L', normalLow: 18, normalHigh: 70, precision: 0 },
      { key: 'bun', label: '尿素氮(BUN)', unit: 'mmol/L', normalLow: 2.5, normalHigh: 7.1, precision: 1 },
      { key: 'ua', label: '尿酸(UA)', unit: 'μmol/L', normalLow: 150, normalHigh: 420, precision: 0 },
      { key: 'cystatinC', label: '胱抑素C(CysC)', unit: 'mg/L', normalLow: 0.5, normalHigh: 1.2, precision: 2 },
      { key: 'beta2Mg', label: 'β2微球蛋白', unit: 'mg/L', normalLow: 0, normalHigh: 3.0, precision: 1 },
    ]
  },
  bloodRoutine: {
    label: '血常规',
    items: [
      { key: 'wbc', label: '白细胞(WBC)', unit: '×10⁹/L', normalLow: 4.0, normalHigh: 10.0, precision: 1 },
      { key: 'rbc', label: '红细胞(RBC)', unit: '×10¹²/L', normalLow: 3.5, normalHigh: 5.5, precision: 2 },
      { key: 'hemoglobin', label: '血红蛋白(HGB)', unit: 'g/L', normalLow: 110, normalHigh: 160, precision: 0 },
      { key: 'platelet', label: '血小板(PLT)', unit: '×10⁹/L', normalLow: 100, normalHigh: 300, precision: 0 },
      { key: 'neutrophil', label: '中性粒细胞百分比', unit: '%', normalLow: 40, normalHigh: 75, precision: 1 },
      { key: 'lymphocyte', label: '淋巴细胞百分比', unit: '%', normalLow: 20, normalHigh: 50, precision: 1 },
      { key: 'monocyte', label: '单核细胞百分比', unit: '%', normalLow: 3, normalHigh: 10, precision: 1 },
      { key: 'hematocrit', label: '红细胞压积(HCT)', unit: '%', normalLow: 35, normalHigh: 50, precision: 1 },
      { key: 'mcv', label: '平均红细胞体积(MCV)', unit: 'fL', normalLow: 80, normalHigh: 100, precision: 1 },
    ]
  },
  urineRoutine: {
    label: '尿常规',
    items: [
      { key: 'urineProtein', label: '尿蛋白(PRO)', unit: '', isQualitative: true },
      { key: 'urineGlucose', label: '尿糖(GLU)', unit: '', isQualitative: true },
      { key: 'urineBlood', label: '尿潜血(BLD)', unit: '', isQualitative: true },
      { key: 'urineKetone', label: '尿酮体(KET)', unit: '', isQualitative: true },
      { key: 'urinePh', label: '尿pH', unit: '', normalLow: 4.5, normalHigh: 8.0, precision: 1 },
      { key: 'urineSg', label: '尿比重(SG)', unit: '', normalLow: 1.005, normalHigh: 1.030, precision: 3 },
    ]
  },
  serumIndicators: {
    label: '血清指标',
    items: [
      { key: 'serumCopper', label: '血清铜', unit: 'μg/mL', normalLow: 0.8, normalHigh: 1.2, precision: 2 },
      { key: 'serumZinc', label: '血清锌', unit: 'μmol/L', normalLow: 11.5, normalHigh: 22.0, precision: 1 },
      { key: 'serumIron', label: '血清铁', unit: 'μmol/L', normalLow: 9, normalHigh: 30, precision: 1 },
      { key: 'serumMagnesium', label: '血清镁', unit: 'mmol/L', normalLow: 0.8, normalHigh: 1.2, precision: 2 },
    ]
  },
  ironPanel: {
    label: '铁四项',
    items: [
      { key: 'serumIron2', label: '血清铁(SI)', unit: 'μmol/L', normalLow: 9, normalHigh: 30, precision: 1 },
      { key: 'tibc', label: '总铁结合力(TIBC)', unit: 'μmol/L', normalLow: 50, normalHigh: 77, precision: 1 },
      { key: 'transferrinSat', label: '转铁蛋白饱和度', unit: '%', normalLow: 25, normalHigh: 45, precision: 1 },
      { key: 'ferritin', label: '铁蛋白(SF)', unit: 'μg/L', normalLow: 15, normalHigh: 150, precision: 0 },
    ]
  },
  electrolytes: {
    label: '电解质',
    items: [
      { key: 'serumPotassium', label: '血钾(K)', unit: 'mmol/L', normalLow: 3.5, normalHigh: 5.5, precision: 1 },
      { key: 'serumSodium', label: '血钠(Na)', unit: 'mmol/L', normalLow: 135, normalHigh: 145, precision: 0 },
      { key: 'serumChloride', label: '血氯(Cl)', unit: 'mmol/L', normalLow: 96, normalHigh: 108, precision: 0 },
      { key: 'serumCalcium', label: '血钙(Ca)', unit: 'mmol/L', normalLow: 2.1, normalHigh: 2.6, precision: 2 },
      { key: 'serumPhosphorus', label: '血磷(P)', unit: 'mmol/L', normalLow: 1.3, normalHigh: 2.1, precision: 2 },
    ]
  },
  cardiacEnzymes: {
    label: '心肌酶',
    items: [
      { key: 'ck', label: '肌酸激酶(CK)', unit: 'U/L', normalLow: 25, normalHigh: 200, precision: 0 },
      { key: 'ckmb', label: '肌酸激酶同工酶(CK-MB)', unit: 'U/L', normalLow: 0, normalHigh: 25, precision: 1 },
      { key: 'ldh', label: '乳酸脱氢酶(LDH)', unit: 'U/L', normalLow: 100, normalHigh: 250, precision: 0 },
      { key: 'hbdh', label: 'α-羟丁酸脱氢酶(HBDH)', unit: 'U/L', normalLow: 72, normalHigh: 182, precision: 0 },
    ]
  },
  pancreatic: {
    label: '胰腺指标',
    items: [
      { key: 'amylase', label: '血淀粉酶(AMY)', unit: 'U/L', normalLow: 30, normalHigh: 110, precision: 0 },
      { key: 'lipase', label: '脂肪酶(LPS)', unit: 'U/L', normalLow: 0, normalHigh: 60, precision: 0 },
    ]
  },
  coagulation: {
    label: '凝血功能',
    items: [
      { key: 'pt', label: '凝血酶原时间(PT)', unit: 's', normalLow: 9, normalHigh: 14, precision: 1 },
      { key: 'aptt', label: '活化部分凝血活酶时间(APTT)', unit: 's', normalLow: 25, normalHigh: 40, precision: 1 },
      { key: 'fib', label: '纤维蛋白原(FIB)', unit: 'g/L', normalLow: 2.0, normalHigh: 4.0, precision: 1 },
      { key: 'tt', label: '凝血酶时间(TT)', unit: 's', normalLow: 14, normalHigh: 21, precision: 1 },
    ]
  },
  thyroid: {
    label: '甲状腺功能',
    items: [
      { key: 'ft3', label: '游离T3(FT3)', unit: 'pmol/L', normalLow: 3.5, normalHigh: 6.5, precision: 1 },
      { key: 'ft4', label: '游离T4(FT4)', unit: 'pmol/L', normalLow: 10.5, normalHigh: 23.5, precision: 1 },
      { key: 'tsh', label: '促甲状腺激素(TSH)', unit: 'mIU/L', normalLow: 0.5, normalHigh: 5.0, precision: 2 },
    ]
  },
  nutrition: {
    label: '营养与骨代谢',
    items: [
      { key: 'vitaminB6', label: '维生素B6', unit: 'nmol/L', normalLow: 40, normalHigh: 180, precision: 0 },
      { key: 'vitaminD', label: '25-羟维生素D', unit: 'ng/mL', normalLow: 30, normalHigh: 100, precision: 1 },
      { key: 'serumPhosphorus2', label: '血磷', unit: 'mmol/L', normalLow: 1.3, normalHigh: 2.1, precision: 2 },
      { key: 'boneAlp', label: '骨碱性磷酸酶', unit: 'U/L', normalLow: 0, normalHigh: 200, precision: 0 },
    ]
  },
  traceElements: {
    label: '微量元素',
    items: [
      { key: 'serumSe', label: '血硒(Se)', unit: 'μg/L', normalLow: 58, normalHigh: 180, precision: 0 },
      { key: 'serumCu', label: '血铜(Cu)', unit: 'μmol/L', normalLow: 11, normalHigh: 22, precision: 1 },
      { key: 'serumZn', label: '血锌(Zn)', unit: 'μmol/L', normalLow: 11.5, normalHigh: 22.0, precision: 1 },
      { key: 'serumFe', label: '血铁(Fe)', unit: 'μmol/L', normalLow: 9, normalHigh: 30, precision: 1 },
    ]
  },
  imaging: {
    label: '影像学检查',
    items: [
      { key: 'liverUltrasound', label: '肝脏B超', unit: '', isText: true },
      { key: 'kidneyUltrasound', label: '肾脏B超', unit: '', isText: true },
      { key: 'gallbladderUltrasound', label: '胆囊B超', unit: '', isText: true },
      { key: 'spleenUltrasound', label: '脾脏B超', unit: '', isText: true },
      { key: 'pancreasUltrasound', label: '胰腺B超', unit: '', isText: true },
      { key: 'brainMri', label: '脑部MRI/CT', unit: '', isText: true },
      { key: 'abdominalUltrasound', label: '腹部B超(综合)', unit: '', isText: true },
    ]
  },
  otherExams: {
    label: '其他专项检查',
    items: [
      { key: 'kfRing', label: '角膜K-F环', unit: '', isText: true },
      { key: 'neuroAssessment', label: '神经系统评估', unit: '', isText: true },
      { key: 'egfr', label: '估算肾小球滤过率(eGFR)', unit: 'mL/min', normalLow: 90, normalHigh: 120, precision: 0 },
      { key: 'weight', label: '体重', unit: 'kg', normalLow: null, normalHigh: null, precision: 1 },
    ]
  }
};

function getAllTestItems() {
  const items = [];
  for (const group of Object.values(TEST_PANEL)) {
    for (const item of group.items) {
      items.push({ ...item, group: group.label });
    }
  }
  return items;
}

function checkAbnormal(itemKey, value) {
  for (const group of Object.values(TEST_PANEL)) {
    for (const item of group.items) {
      if (item.key === itemKey) {
        if (item.isQualitative || item.isText) return false;
        if (value === null || value === undefined || value === '') return false;
        if (item.normalLow !== null && value < item.normalLow) return true;
        if (item.normalHigh !== null && value > item.normalHigh) return true;
        return false;
      }
    }
  }
  return false;
}

module.exports = { TEST_PANEL, getAllTestItems, checkAbnormal };