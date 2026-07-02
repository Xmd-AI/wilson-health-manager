// 营养分析器
const { FOOD_DATABASE } = require('../data/foods');
const { getTargets } = require('./targets');
const { generateAdvice } = require('./recommendations');

function analyzeDailyDiet(dietRecords, profile) {
  const age = profile ? profile.age || 5 : 5;
  const weight = profile ? profile.weight || 20 : 20;
  const targets = getTargets(age, weight);

  // 汇总所有食物的营养
  let totals = { copper: 0, calcium: 0, protein: 0, vitaminB6: 0, zinc: 0, iron: 0 };
  let foodCount = 0;

  for (const record of dietRecords) {
    if (record.foods && Array.isArray(record.foods)) {
      for (const food of record.foods) {
        totals.copper += (food.copperMg || 0);
        totals.calcium += (food.calciumMg || 0);
        totals.protein += (food.proteinG || 0);
        totals.vitaminB6 += (food.b6Mg || 0);
        totals.zinc += (food.zincMg || 0);
        totals.iron += (food.ironMg || 0);
        foodCount++;
      }
    }
  }

  // 计算达标百分比
  const analysis = {
    foodCount,
    totals,
    targets,
    copperPercent: Math.round((totals.copper / targets.copper) * 100),
    calciumPercent: Math.round((totals.calcium / targets.calcium) * 100),
    proteinPercent: Math.round((totals.protein / targets.protein) * 100),
    b6Percent: Math.round((totals.vitaminB6 / targets.vitaminB6) * 100),
    zincPercent: Math.round((totals.zinc / targets.zinc) * 100),
    ironPercent: Math.round((totals.iron / targets.iron) * 100),
  };

  // 安全措施：防止负数
  for (const key of ['copperPercent', 'calciumPercent', 'proteinPercent', 'b6Percent', 'zincPercent', 'ironPercent']) {
    analysis[key] = Math.max(0, analysis[key]);
  }

  // 生成建议
  analysis.advice = generateAdvice(analysis);

  // 计算综合营养评分 (0-100)
  let score = 0;
  // 铜摄入越低越好（但太低也不好，需要适当）
  if (analysis.copperPercent <= 80) score += 25;
  else if (analysis.copperPercent <= 100) score += 15;
  else score += 5;

  // 其他营养素：80-120%为最佳
  for (const key of ['calciumPercent', 'proteinPercent', 'b6Percent', 'zincPercent', 'ironPercent']) {
    const pct = analysis[key];
    if (pct >= 80 && pct <= 120) score += 15;
    else if (pct >= 60 || pct <= 140) score += 10;
    else score += 5;
  }

  analysis.score = Math.min(100, score);

  return analysis;
}

function calculateCopperForMeal(foods) {
  let totalCopper = 0;
  let details = [];
  for (const food of foods) {
    const dbFood = FOOD_DATABASE.find(f => f.id === food.foodId);
    if (dbFood) {
      const copperMg = (dbFood.copper * (food.amount || 100)) / 100;
      totalCopper += copperMg;
      details.push({
        name: dbFood.name,
        amount: food.amount || 100,
        copperPer100g: dbFood.copper,
        copperMg: Math.round(copperMg * 100) / 100,
        rating: dbFood.rating
      });
    }
  }
  return { totalCopper: Math.round(totalCopper * 100) / 100, details };
}

module.exports = { analyzeDailyDiet, calculateCopperForMeal };