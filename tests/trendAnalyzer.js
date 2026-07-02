// 检查趋势分析引擎
const { getAllTestItems, checkAbnormal } = require('./testPanel');

function analyzeTrend(records, itemKey) {
  if (!records || records.length < 2) return { direction: '不足2次记录', stable: true, changePercent: 0 };

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-3);
  const values = recent.map(r => r[itemKey]).filter(v => v !== null && v !== undefined && v !== '');

  if (values.length < 2) return { direction: '数据不足', stable: true, changePercent: 0 };

  const first = values[0];
  const last = values[values.length - 1];
  const changePercent = first !== 0 ? ((last - first) / Math.abs(first) * 100) : 0;

  let direction = '稳定';
  if (changePercent > 10) direction = '上升↑';
  else if (changePercent < -10) direction = '下降↓';

  // 对于尿铜：下降为好转；对于铜蓝蛋白：上升为好转
  const isUrinaryCopper = itemKey === 'urinaryCopper24h';
  const isCeruloplasmin = itemKey === 'ceruloplasmin';
  const isLiverEnzyme = ['alt', 'ast', 'ggt'].includes(itemKey);

  let improving = null;
  if (isUrinaryCopper) improving = changePercent < -10;
  else if (isCeruloplasmin) improving = changePercent > 10;
  else if (isLiverEnzyme) improving = changePercent < -10;

  return {
    direction,
    changePercent: Math.round(changePercent),
    first,
    last,
    values,
    improving,
    stable: Math.abs(changePercent) <= 10
  };
}

function getAbnormalItems(record) {
  const abnormals = [];
  const items = getAllTestItems();
  for (const item of items) {
    const value = record[item.key];
    if (value === null || value === undefined || value === '') continue;
    if (checkAbnormal(item.key, value)) {
      abnormals.push({ ...item, value });
    }
  }
  return abnormals;
}

function generateTestSummary(records) {
  if (!records || records.length === 0) return { summary: '暂无检查数据', alertCount: 0 };

  const latest = records[records.length - 1];
  const abnormals = getAbnormalItems(latest);
  const trends = {};
  const keyItems = ['urinaryCopper24h', 'ceruloplasmin', 'alt', 'wbc', 'serumCalcium'];

  for (const key of keyItems) {
    trends[key] = analyzeTrend(records, key);
  }

  return {
    latestDate: latest.date,
    totalRecords: records.length,
    alertCount: abnormals.length,
    abnormals,
    trends,
    hasAbnormal: abnormals.length > 0
  };
}

module.exports = { analyzeTrend, getAbnormalItems, generateTestSummary };