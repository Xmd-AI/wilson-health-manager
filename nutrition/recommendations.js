// 智能饮食建议模板库

const RECOMMENDATIONS = {
  copperSafe: {
    condition: (analysis) => analysis.copperPercent <= 80,
    message: '✅ 铜摄入控制良好，请继续保持当前饮食方案',
    type: 'good'
  },
  copperWarning: {
    condition: (analysis) => analysis.copperPercent > 80 && analysis.copperPercent <= 100,
    message: '⚠️ 铜摄入已接近限值，今日剩余餐次请严格控制，选择低铜食物',
    type: 'warning'
  },
  copperDanger: {
    condition: (analysis) => analysis.copperPercent > 100,
    message: '🔴 铜摄入超标！饮用一杯牛奶促进排铜，多饮水，确认已服药，禁再食高铜食物',
    type: 'danger'
  },
  calciumLow: {
    condition: (analysis) => analysis.calciumPercent < 80,
    message: '🥛 今日钙摄入不足，建议补充：牛奶(低铜高钙)、酸奶、奶酪、小白菜、豆腐(南)',
    type: 'warning'
  },
  calciumGood: {
    condition: (analysis) => analysis.calciumPercent >= 80,
    message: '🥛 今日钙摄入达标，继续保持',
    type: 'good'
  },
  proteinLow: {
    condition: (analysis) => analysis.proteinPercent < 80,
    message: '🥩 蛋白质摄入偏低，建议增加：鸡蛋白、去皮鸡胸肉、清蒸鱼、脱脂牛奶',
    type: 'warning'
  },
  proteinGood: {
    condition: (analysis) => analysis.proteinPercent >= 80,
    message: '🥩 蛋白质摄入充足，优质蛋白有助于肝功能和铜排泄',
    type: 'good'
  },
  b6Low: {
    condition: (analysis) => analysis.b6Percent < 80,
    message: '🥬 维生素B6摄入偏低(青霉胺会增加B6消耗)，建议补充：土豆、香蕉、鸡胸肉、鱼肉',
    type: 'warning'
  },
  b6Good: {
    condition: (analysis) => analysis.b6Percent >= 80,
    message: '🥬 维生素B6摄入充足，有助于减轻青霉胺副作用',
    type: 'good'
  },
};

function generateAdvice(analysis) {
  const advice = [];
  for (const [key, rec] of Object.entries(RECOMMENDATIONS)) {
    if (rec.condition(analysis)) {
      advice.push({ key, message: rec.message, type: rec.type });
    }
  }
  return advice;
}

// 高铜应急处理建议
const EMERGENCY_ADVICE = [
  { priority: 1, icon: '✅', action: '立即饮用一杯牛奶（牛奶中的钙可抑制铜吸收，且本身有排铜作用）' },
  { priority: 2, icon: '✅', action: '多喝白开水，促进铜代谢排出' },
  { priority: 3, icon: '✅', action: '确认今日排铜药物（青霉胺/锌剂）是否已按时服用' },
  { priority: 4, icon: '✅', action: '今日剩余餐次只选择🟢低铜食物：精白米、白菜、黄瓜、蛋清、苹果等' },
  { priority: 5, icon: '❌', action: '不要再吃任何高铜食物（动物内脏、海鲜、坚果、巧克力、豆类等）' },
  { priority: 6, icon: '👀', action: '留意观察是否出现恶心、腹痛等症状，严重时及时就医' },
];

module.exports = { generateAdvice, EMERGENCY_ADVICE };