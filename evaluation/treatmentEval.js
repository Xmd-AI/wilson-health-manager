// 控铜成效评估
const { analyzeTrend } = require('../tests/trendAnalyzer');

function evaluateTreatment(testRecords, dietRecords, medicationLogs, profile) {
  if (!testRecords || testRecords.length === 0) {
    return { score: 0, level: '数据不足', message: '请先录入检查数据', suggestions: [] };
  }

  const sortedTests = [...testRecords].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sortedTests[sortedTests.length - 1];
  const recentTests = sortedTests.slice(-3);

  // 1. 尿铜评估（最核心指标）
  const urinaryCopper = analyzeTrend(testRecords, 'urinaryCopper24h');
  const latestUrinaryCopper = latest.urinaryCopper24h || 0;

  let copperScore = 0;
  if (latestUrinaryCopper < 100) copperScore = 35;
  else if (latestUrinaryCopper < 300) copperScore = 25;
  else if (latestUrinaryCopper < 800) copperScore = 15;
  else copperScore = 5;

  // 2. 铜蓝蛋白评估
  const cp = analyzeTrend(testRecords, 'ceruloplasmin');
  const latestCp = latest.ceruloplasmin || 0;
  let cpScore = 0;
  if (latestCp >= 0.20) cpScore = 20;
  else if (latestCp >= 0.15) cpScore = 12;
  else cpScore = 5;

  // 3. 肝功能评估
  const altTrend = analyzeTrend(testRecords, 'alt');
  const latestAlt = latest.alt || 0;
  let liverScore = 0;
  if (latestAlt <= 40) liverScore = 20;
  else if (latestAlt <= 80) liverScore = 12;
  else liverScore = 5;

  // 4. 饮食控制评分
  let dietScore = 0;
  if (dietRecords && dietRecords.length > 0) {
    const overLimitDays = dietRecords.filter(d => d.alertLevel === 'danger').length;
    const totalDays = new Set(dietRecords.map(d => d.date)).size;
    const compliance = totalDays > 0 ? 1 - (overLimitDays / totalDays) : 0;
    dietScore = Math.round(compliance * 15);
  } else {
    dietScore = 5; // 无饮食记录时给基础分
  }

  // 5. 用药依从性
  let medScore = 0;
  if (medicationLogs && medicationLogs.length > 0) {
    const taken = medicationLogs.filter(l => l.taken).length;
    const total = medicationLogs.length;
    const compliance = total > 0 ? taken / total : 0;
    medScore = Math.round(compliance * 10);
  } else {
    medScore = 3;
  }

  const totalScore = copperScore + cpScore + liverScore + dietScore + medScore;

  // 生成结论
  let conclusion, level, suggestions = [];

  if (totalScore >= 85) {
    conclusion = '🎉 控铜效果良好，请继续保持当前方案';
    level = '优秀';
    suggestions.push('继续保持当前饮食和用药方案');
    suggestions.push('按计划定期复查即可');
  } else if (totalScore >= 65) {
    conclusion = '✅ 控铜效果尚可，仍有改善空间';
    level = '良好';
    if (copperScore < 25) suggestions.push('24h尿铜仍需改善，请检视饮食控制是否严格');
    if (cpScore < 12) suggestions.push('铜蓝蛋白水平偏低，建议咨询医生评估');
    if (liverScore < 12) suggestions.push('肝功能指标偏高，注意保护肝脏');
    if (dietScore < 10) suggestions.push('饮食控制需加强，注意避免高铜食物');
  } else if (totalScore >= 45) {
    conclusion = '⚠️ 控铜效果有待加强，需要关注';
    level = '一般';
    if (latestUrinaryCopper > 300) suggestions.push('🔴 24h尿铜偏高，建议严格检查饮食中是否混入高铜食物');
    if (latestCp < 0.15) suggestions.push('铜蓝蛋白明显偏低，建议咨询主治医生是否需要调整药物');
    if (latestAlt > 60) suggestions.push('🔴 肝功能指标异常，建议及时复查并咨询医生');
    suggestions.push('建议加强饮食记录和用药管理');
  } else {
    conclusion = '🔴 控铜效果不理想，建议尽快就医评估';
    level = '需关注';
    suggestions.push('🔴 建议尽快带宝宝到主治医生处复查');
    if (latestUrinaryCopper > 500) suggestions.push('24h尿铜显著偏高，可能需要调整排铜药物剂量');
    suggestions.push('建议严格记录每日饮食，排查高铜食物来源');
    suggestions.push('确认是否按时按量服用药物');
  }

  const evaluation = {
    date: new Date().toISOString().slice(0, 10),
    score: totalScore,
    level,
    conclusion,
    details: {
      copperScore: { score: copperScore, max: 35, latestUrinaryCopper, trend: urinaryCopper.direction },
      cpScore: { score: cpScore, max: 20, latestCp, trend: cp.direction },
      liverScore: { score: liverScore, max: 20, latestAlt, trend: altTrend.direction },
      dietScore: { score: dietScore, max: 15 },
      medScore: { score: medScore, max: 10 }
    },
    suggestions
  };

  return evaluation;
}

module.exports = { evaluateTreatment };