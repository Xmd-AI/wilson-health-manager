// 营养目标值 - 基于《中国居民膳食营养素参考摄入量(DRIs)》
// 按年龄段区分

function getTargets(ageYears, weightKg) {
  let targets = {};

  // 钙 (mg/天)
  if (ageYears <= 0.5) targets.calcium = 200;
  else if (ageYears <= 1) targets.calcium = 250;
  else if (ageYears <= 3) targets.calcium = 600;
  else if (ageYears <= 6) targets.calcium = 800;
  else if (ageYears <= 10) targets.calcium = 1000;
  else if (ageYears <= 14) targets.calcium = 1200;
  else targets.calcium = 1000;

  // 蛋白质 (g/天) - Wilson需高蛋白，按1.5-2.0g/kg计算，取中间值1.8
  if (weightKg) {
    targets.protein = Math.round(weightKg * 1.8);
  } else {
    if (ageYears <= 0.5) targets.protein = 15;
    else if (ageYears <= 1) targets.protein = 20;
    else if (ageYears <= 3) targets.protein = 25;
    else if (ageYears <= 6) targets.protein = 35;
    else if (ageYears <= 10) targets.protein = 50;
    else if (ageYears <= 14) targets.protein = 65;
    else targets.protein = 70;
  }

  // 维生素B6 (mg/天)
  if (ageYears <= 0.5) targets.vitaminB6 = 0.3;
  else if (ageYears <= 1) targets.vitaminB6 = 0.5;
  else if (ageYears <= 3) targets.vitaminB6 = 0.8;
  else if (ageYears <= 6) targets.vitaminB6 = 1.0;
  else if (ageYears <= 10) targets.vitaminB6 = 1.2;
  else if (ageYears <= 14) targets.vitaminB6 = 1.5;
  else targets.vitaminB6 = 1.6;

  // 锌 (mg/天)
  if (ageYears <= 0.5) targets.zinc = 2.5;
  else if (ageYears <= 1) targets.zinc = 3.5;
  else if (ageYears <= 3) targets.zinc = 4.0;
  else if (ageYears <= 6) targets.zinc = 5.5;
  else if (ageYears <= 10) targets.zinc = 7.0;
  else if (ageYears <= 14) targets.zinc = 9.0;
  else targets.zinc = 11.0;

  // 铁 (mg/天)
  if (ageYears <= 0.5) targets.iron = 7;
  else if (ageYears <= 1) targets.iron = 8;
  else if (ageYears <= 3) targets.iron = 9;
  else if (ageYears <= 6) targets.iron = 10;
  else if (ageYears <= 10) targets.iron = 12;
  else if (ageYears <= 14) targets.iron = 15;
  else targets.iron = 12;

  // 铜上限 (mg/天) - Wilson患者固定<1mg
  targets.copper = 1.0;

  return targets;
}

module.exports = { getTargets };