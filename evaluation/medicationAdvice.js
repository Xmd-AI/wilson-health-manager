// 用药智能调整建议引擎
// 根据检查结果，提供青霉胺/锌剂用量调整建议及营养补充建议

function generateMedicationAdvice(testRecords, profile) {
  if (!testRecords || testRecords.length === 0) {
    return { advice: '暂无检查数据，请先录入检查结果', level: 'info', details: [] };
  }

  const sorted = [...testRecords].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const recent = sorted.slice(-3);
  const details = [];

  // 1. 24h尿铜分析（核心指标）
  const ucValues = recent.map(r => r.urinaryCopper24h).filter(v => v !== null && v !== undefined && v !== '');
  if (ucValues.length > 0) {
    const latestUc = ucValues[ucValues.length - 1];
    if (latestUc > 500) {
      details.push({
        indicator: '24h尿铜',
        value: `${latestUc} μg/24h`,
        status: '偏高',
        suggestion: '🔴 尿铜显著偏高(>500μg)，提示排铜不足。建议：①检查是否严格遵医嘱服药；②排查饮食中是否混入高铜食物；③尽快咨询主治医生，可能需要增加青霉胺剂量或调整用药方案',
        level: 'danger'
      });
    } else if (latestUc > 200) {
      details.push({
        indicator: '24h尿铜',
        value: `${latestUc} μg/24h`,
        status: '偏高',
        suggestion: '🟡 尿铜偏高(200-500μg)，建议：①确认青霉胺是否按时足量服用；②检查饮食控制是否严格；③复诊时与医生讨论是否需要调整剂量',
        level: 'warning'
      });
    } else if (latestUc >= 100 && latestUc <= 200) {
      details.push({
        indicator: '24h尿铜',
        value: `${latestUc} μg/24h`,
        status: '良好',
        suggestion: '✅ 尿铜控制在理想范围(100-200μg)，说明当前治疗方案有效，请继续保持',
        level: 'good'
      });
    } else if (latestUc < 100 && latestUc > 0) {
      details.push({
        indicator: '24h尿铜',
        value: `${latestUc} μg/24h`,
        status: '偏低',
        suggestion: 'ℹ️ 尿铜偏低(<100μg)，可能提示：①铜控制良好，维持剂量合适；②需警惕过度治疗。建议监测血清铜和非铜蓝蛋白结合铜水平，避免过度排铜。如伴有贫血、乏力等症状，需及时就医',
        level: 'info'
      });
    }

    // 趋势分析
    if (ucValues.length >= 2) {
      const trend = ucValues[ucValues.length - 1] - ucValues[0];
      if (trend > 100) {
        details.push({
          indicator: '尿铜趋势',
          value: `上升${Math.round(trend)}μg`,
          status: '上升趋势',
          suggestion: '⚠️ 尿铜持续上升，提示铜控制可能恶化，建议尽快复诊评估',
          level: 'warning'
        });
      } else if (trend < -100) {
        details.push({
          indicator: '尿铜趋势',
          value: `下降${Math.round(Math.abs(trend))}μg`,
          status: '下降趋势',
          suggestion: '✅ 尿铜持续下降，说明排铜治疗有效，请继续坚持',
          level: 'good'
        });
      }
    }
  }

  // 2. 铜蓝蛋白分析
  const cp = latest.ceruloplasmin;
  if (cp !== null && cp !== undefined && cp !== '') {
    if (cp < 0.15) {
      details.push({
        indicator: '铜蓝蛋白',
        value: `${cp} g/L`,
        status: '偏低',
        suggestion: '🔴 铜蓝蛋白明显偏低(<0.15g/L)，提示体内铜负荷仍高。建议继续坚持排铜治疗，定期复查',
        level: 'danger'
      });
    } else if (cp >= 0.15 && cp < 0.25) {
      details.push({
        indicator: '铜蓝蛋白',
        value: `${cp} g/L`,
        status: '偏低',
        suggestion: '🟡 铜蓝蛋白偏低(0.15-0.25g/L)，治疗已有一定效果但未完全达标，继续坚持',
        level: 'warning'
      });
    } else if (cp >= 0.25) {
      details.push({
        indicator: '铜蓝蛋白',
        value: `${cp} g/L`,
        status: '改善中',
        suggestion: '✅ 铜蓝蛋白有所改善，说明治疗有效，请继续坚持当前方案',
        level: 'good'
      });
    }
  }

  // 3. 肝功能分析
  const alt = latest.alt;
  if (alt !== null && alt !== undefined && alt !== '') {
    if (alt > 80) {
      details.push({
        indicator: 'ALT(谷丙转氨酶)',
        value: `${alt} U/L`,
        status: '显著升高',
        suggestion: '🔴 ALT显著升高(>80U/L)，提示肝功能受损。建议：①尽快就医复查肝功能；②排查是否与药物有关；③注意保肝治疗',
        level: 'danger'
      });
    } else if (alt > 40) {
      details.push({
        indicator: 'ALT(谷丙转氨酶)',
        value: `${alt} U/L`,
        status: '轻度升高',
        suggestion: '🟡 ALT轻度升高(40-80U/L)，建议：①注意休息，避免劳累；②监测肝功能变化；③咨询医生是否需要加用保肝药物',
        level: 'warning'
      });
    } else {
      details.push({
        indicator: 'ALT(谷丙转氨酶)',
        value: `${alt} U/L`,
        status: '正常',
        suggestion: '✅ 肝功能正常，继续保持',
        level: 'good'
      });
    }
  }

  // 4. 用药安全监测
  const wbc = latest.wbc;
  if (wbc !== null && wbc !== undefined && wbc !== '') {
    if (wbc < 3.0) {
      details.push({
        indicator: '白细胞(WBC)',
        value: `${wbc} ×10⁹/L`,
        status: '偏低',
        suggestion: '🔴 白细胞偏低(<3.0)，可能是青霉胺引起的骨髓抑制，需立即就医检查，必要时调整用药',
        level: 'danger'
      });
    } else if (wbc < 4.0) {
      details.push({
        indicator: '白细胞(WBC)',
        value: `${wbc} ×10⁹/L`,
        status: '偏低',
        suggestion: '🟡 白细胞偏低(3.0-4.0)，需监测血常规变化，注意预防感染，复诊时告知医生',
        level: 'warning'
      });
    }
  }

  // 5. 营养补充建议
  const nutritionTips = [];
  nutritionTips.push('💊 青霉胺会增加维生素B6排泄 → 建议每日补充维生素B6 10-25mg（或食物：土豆、香蕉、鸡胸肉）');
  nutritionTips.push('🥛 青霉胺影响钙代谢 → 建议补钙（牛奶、酸奶、钙剂），配合维生素D');
  const calcium = latest.serumCalcium;
  if (calcium !== null && calcium !== undefined && calcium !== '') {
    if (calcium < 2.1) {
      nutritionTips.push('🔴 血钙偏低(<2.1mmol/L) → 需加强补钙，建议钙剂+维生素D联合补充，咨询医生');
    }
  }
  const b6 = latest.vitaminB6;
  if (b6 !== null && b6 !== undefined && b6 !== '') {
    if (b6 < 40) {
      nutritionTips.push('🔴 维生素B6偏低 → 需增加B6补充量，建议每日25-50mg');
    }
  }
  const zinc = latest.serumZinc;
  if (zinc !== null && zinc !== undefined && zinc !== '') {
    if (zinc < 11.5) {
      nutritionTips.push('🔴 血锌偏低 → 可与医生讨论是否需要调整锌剂剂量');
    }
  }

  // 6. 综合评估
  const dangerCount = details.filter(d => d.level === 'danger').length;
  const warningCount = details.filter(d => d.level === 'warning').length;

  let summary, level;
  if (dangerCount > 0) {
    summary = '🚨 有指标需要紧急关注，建议尽快就医';
    level = 'danger';
  } else if (warningCount > 0) {
    summary = '⚠️ 部分指标需关注，建议加强监测';
    level = 'warning';
  } else {
    summary = '✅ 各项指标控制良好，请继续坚持当前方案';
    level = 'good';
  }

  return {
    summary,
    level,
    details,
    nutritionTips,
    testDate: latest.date
  };
}

module.exports = { generateMedicationAdvice };