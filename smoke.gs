function seedSmokeData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const dataSheet = ensureSheet(ss, "Data", [
    "id",
    "task",
    "category",
    "startDate",
    "startTime",
    "endDate",
    "endTime",
    "color",
    "status",
    "objective",
    "priority",
    "repeatType",
    "repeatUntil"
  ]);

  const objectivesSheet = ensureSheet(ss, "Objectives", [
    "id",
    "name",
    "description",
    "color",
    "category",
    "dueDate"
  ]);

  const categoriesSheet = ensureSheet(ss, "Categories", ["id", "name", "color"]);
  const statusesSheet = ensureSheet(ss, "Statuses", ["id", "name", "color"]);

  const financeSheet = ensureSheet(ss, "Finance", [
    "id",
    "date",
    "type",
    "amount",
    "category",
    "note",
    "recurringMonthly"
  ]);

  const financeSettingsSheet = ensureSheet(ss, "FinanceSettings", ["monthKey", "budget"]);

  clearSheetData(dataSheet);
  clearSheetData(objectivesSheet);
  clearSheetData(categoriesSheet);
  clearSheetData(statusesSheet);
  clearSheetData(financeSheet);
  clearSheetData(financeSettingsSheet);

  const categories = [
    [1, "Work", "#3b82f6"],
    [2, "Personal", "#10b981"],
    [3, "Health", "#ef4444"],
    [4, "Learning", "#f59e0b"]
  ];

  const statuses = [
    [1, "pending", "#3b82f6"],
    [2, "completed", "#10b981"],
    [3, "overdue", "#ef4444"],
    [4, "in-progress", "#f59e0b"]
  ];

  const objectives = [
    [1, "Launch Plan", "Finalize launch plan", "#3b82f6", "Work", "2025-01-15"],
    [2, "Fitness", "Weekly workout routine", "#ef4444", "Health", "2025-01-10"],
    [3, "Courses", "Complete 2 courses", "#f59e0b", "Learning", "2025-02-01"]
  ];

  const tasks = [
    [1001, "Prep launch deck", "Work", "2025-01-05", "", "2025-01-08", "", "#5470c6", "pending", "Launch Plan", "high", "none", ""],
    [1002, "Review roadmap", "Work", "2025-01-06", "", "2025-01-07", "", "#73c0de", "completed", "Launch Plan", "medium", "none", ""],
    [1003, "Morning run", "Health", "2025-01-03", "", "2025-01-03", "", "#91cc75", "completed", "Fitness", "low", "daily", "2025-01-20"],
    [1004, "Strength session", "Health", "2025-01-04", "", "2025-01-04", "", "#ef4444", "pending", "Fitness", "medium", "monthly", "2025-04-30"],
    [1005, "Finish online course", "Learning", "2025-01-02", "", "2025-01-09", "", "#f59e0b", "in-progress", "Courses", "high", "none", ""],
    [1006, "Plan weekend", "Personal", "2025-01-01", "", "2025-01-02", "", "#10b981", "overdue", "", "low", "none", ""]
  ];

  const extraStatuses = ["pending", "completed", "overdue", "in-progress"];
  const extraPriorities = ["low", "medium", "high"];
  const extraCategories = ["Work", "Personal", "Health", "Learning"];
  const extraObjectives = ["Launch Plan", "Fitness", "Courses", ""];
  const extraColors = ["#5470c6", "#10b981", "#ef4444", "#f59e0b", "#6366f1"];

  for (let i = 0; i < 24; i += 1) {
    const id = 1100 + i;
    const day = String((i % 28) + 1).padStart(2, "0");
    const startDate = `2025-01-${day}`;
    const dueDay = String(((i + 2) % 28) + 1).padStart(2, "0");
    const dueDate = `2025-01-${dueDay}`;
    tasks.push([
      id,
      `Sample task ${i + 1}`,
      extraCategories[i % extraCategories.length],
      startDate,
      "",
      dueDate,
      "",
      extraColors[i % extraColors.length],
      extraStatuses[i % extraStatuses.length],
      extraObjectives[i % extraObjectives.length],
      extraPriorities[i % extraPriorities.length],
      i % 3 === 0 ? "daily" : "none",
      i % 3 === 0 ? "2025-01-28" : ""
    ]);
  }

  const financeRecords = [
    [1, "2025-01-01", "income", 3200, "Salary", "Monthly salary", true],
    [2, "2025-01-02", "expense", 120, "Groceries", "Weekly grocery run", false],
    [3, "2025-01-03", "expense", 60, "Transport", "Commuting", false],
    [4, "2025-01-04", "expense", 45, "Fitness", "Gym pass", true],
    [5, "2025-01-06", "expense", 85, "Learning", "Course fee", false]
  ];

  const financeCategories = ["Groceries", "Transport", "Dining", "Fitness", "Learning", "Entertainment"];
  for (let i = 0; i < 18; i += 1) {
    const id = 10 + i;
    const day = String((i % 28) + 1).padStart(2, "0");
    financeRecords.push([
      id,
      `2025-01-${day}`,
      i % 5 === 0 ? "income" : "expense",
      i % 5 === 0 ? 500 + i * 10 : 30 + i * 7,
      financeCategories[i % financeCategories.length],
      `Sample entry ${i + 1}`,
      i % 6 === 0
    ]);
  }

  const financeSettings = [
    ["2025-01", 1800],
    ["2025-02", 1900]
  ];

  dataSheet.getRange(2, 1, tasks.length, tasks[0].length).setValues(tasks);
  objectivesSheet.getRange(2, 1, objectives.length, objectives[0].length).setValues(objectives);
  categoriesSheet.getRange(2, 1, categories.length, categories[0].length).setValues(categories);
  statusesSheet.getRange(2, 1, statuses.length, statuses[0].length).setValues(statuses);
  financeSheet.getRange(2, 1, financeRecords.length, financeRecords[0].length).setValues(financeRecords);
  financeSettingsSheet.getRange(2, 1, financeSettings.length, financeSettings[0].length).setValues(financeSettings);
}

function ensureSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  return sheet;
}

function clearSheetData(sheet) {
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
}
