// Helper utilities for month/year calculations

// Returns a string key like "2025-01" for a given Date
function getMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Returns start and end Date objects for a given month key "YYYY-MM"
function getMonthRange(monthKey) {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;

  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return { start, end };
}

module.exports = {
  getMonthKey,
  getMonthRange,
};

