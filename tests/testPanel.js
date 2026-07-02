// 肝豆状核变性全套检查项目模板
const TEST_PANEL = {
  copperMetabolism: {
    label: '铜代谢核心指标',
    items: [
      { key: 'ceruloplasmin', label: '血清铜蓝蛋白', unit: 'g/L', normalLow: 0.20, normalHigh: 0.60, precision: 2 },
      { key: 'urinaryCopper24h', label: '24小时尿铜', unit: 'μg/24h', normalLow: 0, normalHigh: 100, precision: 0 },
      { key: 'serumCopper', label: '血清总铜', unit: 'μg/mL', normalLow: 0.8, normalHigh: 1.2, precision: 1 },
      { key: 'freeCopper', label: '血清游离铜(NCC)', unit: 'μg/dL', normalLow: 0, normalHigh: 10, precision: 1 },
    ]
  },
  liverFunction: {
    label: '肝功能监测',
    items: [
      { key: 'alt', label: 'ALT(谷丙转氨酶)', unit: 'U/L', normalLow: 0, normalHigh: 40, precision: 0 },
      { key: 'ast', label: 'AST(谷草转氨酶)', unit: 'U/L', normalLow: 0, normalHigh: 40, precision: 0 },
      { key: 'ggt', label: 'GGT(γ-谷氨酰转肽酶)', unit: 'U/L', normalLow: 0, normalHigh: 45, precision: 0 },
      { key: 'alp', label: 'ALP(碱性磷酸酶)', unit: 'U/L', normalLow: 0, normalHigh: 500, precision: 0 },
      { key: 'tbil', label: '总胆红素(TBIL)', unit: 'μmol/L', normalLow: 0, normalHigh: 21, precision: 1 },
      { key: 'dbil', label: '直接胆红素(DBIL)', unit: 'μmol/L', normalLow: 0, normalHigh: 7, precision: 1 },
      { key: 'tp', label: '总蛋白(TP)', unit: 'g/L', normalLow: 65, normalHigh: 85, precision: 1 },
      { key: 'alb', label: '白蛋白(ALB)', unit: 'g/L', normalLow: 35, normalHigh: 55, precision: 1 },
    ]
  },
  drugSafety: {
    label: '用药安全监测',
    items: [
      { key: 'wbc', label: '白细胞(WBC)', unit: '×10⁹/L', normalLow: 4.0, normalHigh: 10.0, precision: 1 },
      { key: 'hemoglobin', label: '血红蛋白(HGB)', unit: 'g/L', normalLow: 110, normalHigh: 160, precision: 0 },
      { key: 'platelet', label: '血小板(PLT)', unit: '×10⁹/L', normalLow: 100, normalHigh: 300, precision: 0 },
      { key: 'neutrophil', label: '中性粒细胞(NEUT)', unit: '×10⁹/L', normalLow: 2.0, normalHigh: 7.5, precision: 1 },
      { key: 'creatinine', label: '肌酐(Cr)', unit: 'μmol/L', normalLow: 18, normalHigh: 70, precision: 0 },
      { key: 'bun', label: '尿素氮(BUN)', unit: 'mmol/L', normalLow: 2.5, normalHigh: 7.1, precision: 1 },
      { key: 'urineProteinQual', label: '尿蛋白定性', unit: '', normalLow: null, normalHigh: null, isQualitative: true },
      { key: 'urineProtein24h', label: '24小时尿蛋白', unit: 'mg/24h', normalLow: 0, normalHigh: 150, precision: 0 },
    ]
  },
  nutrition: {
    label: '营养与骨代谢监测',
    items: [
      { key: 'serumCalcium', label: '血钙(Ca)', unit: 'mmol/L', normalLow: 2.1, normalHigh: 2.6, precision: 1 },
      { key: 'serumZinc', label: '血锌(Zn)', unit: 'μmol/L', normalLow: 11.5, normalHigh: 22.0, precision: 1 },
      { key: 'vitaminB6', label: '维生素B6', unit: 'nmol/L', normalLow: 40, normalHigh: 180, precision: 0 },
      { key: 'ferritin', label: '铁蛋白', unit: 'μg/L', normalLow: 15, normalHigh: 150, precision: 0 },
      { key: 'vitaminD', label: '25-羟维生素D', unit: 'ng/mL', normalLow: 30, normalHigh: 100, precision: 1 },
      { key: 'serumPhosphorus', label: '血磷(P)', unit: 'mmol/L', normalLow: 1.3, normalHigh: 2.1, precision: 1 },
    ]
  },
  otherExams: {
    label: '其他专项检查',
    items: [
      { key: 'abdominalUltrasound', label: '腹部B超', unit: '', isText: true },
      { key: 'kfRing', label: '角膜K-F环', unit: '', isText: true },
      { key: 'neuroAssessment', label: '神经系统评估', unit: '', isText: true },
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