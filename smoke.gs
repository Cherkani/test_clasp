function seedSmokeData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Ensure all sheets exist with correct structure
  const statusesSheet = ensureSheet(ss, "1_status", ["id", "name", "color"]);
  const categoriesSheet = ensureSheet(ss, "2_category", ["id", "name", "color"]);
  const financeCategoriesSheet = ensureSheet(ss, "3_financeCategories", ["id", "name", "color"]);
  const objectivesSheet = ensureSheet(ss, "4_objectives", [
    "id", "name", "description", "color", "category", "dueDate"
  ]);
  const tasksSheet = ensureSheet(ss, "5_tasks", [
    "id", "task", "startDate", "startTime", "endDate", "endTime", "color", "status", "objectiveId"
  ]);

  const financeSheet = ensureSheet(ss, "6_finance", [
    "id", "date", "type", "amount", "category", "note", "recurringMonthly", "recurringFrequency",
    "recurringNextDueDate", "recurringBillType", "recurringStatus", "recurringBillId",
    "relatedTaskId", "relatedObjective", "isValueRealization"
  ]);

  const financeSettingsSheet = ensureSheet(ss, "7_financeSettings", ["monthKey", "budget"]);
  const eventsSheet = ensureSheet(ss, "8_events", [
    "id", "title", "description", "startDate", "startTime", "endDate", "endTime",
    "category", "color", "relatedTaskIds", "attended", "attendanceDate", "generatedTasks"
  ]);
  const debtsSheet = ensureSheet(ss, "9_debts", [
    "id", "person", "amount", "direction", "description", "date", "status",
    "relatedTaskId", "resolvedByTaskId", "resolvedDate"
  ]);
  const notesSheet = ensureSheet(ss, "10_notes", ["id", "title", "subject", "date", "docLink", "description"]);
  const personsSheet = ensureSheet(ss, "11_persons", ["id", "name"]);

  // Clear existing data
  clearSheetData(tasksSheet);
  clearSheetData(objectivesSheet);
  clearSheetData(categoriesSheet);
  clearSheetData(statusesSheet);
  clearSheetData(financeSheet);
  clearSheetData(financeSettingsSheet);
  clearSheetData(financeCategoriesSheet);
  clearSheetData(eventsSheet);
  clearSheetData(debtsSheet);
  clearSheetData(notesSheet);
  clearSheetData(personsSheet);

  // Categories
  const categories = [
    [1, "Work", "#3b82f6"],
    [2, "Personal", "#10b981"],
    [3, "Health", "#ef4444"],
    [4, "Learning", "#f59e0b"],
    [5, "Finance", "#8b5cf6"]
  ];

  // Statuses
  const statuses = [
    [1, "pending", "#3b82f6"],
    [2, "completed", "#10b981"],
    [3, "overdue", "#ef4444"],
    [4, "in-progress", "#f59e0b"]
  ];

  // Finance Categories
  const financeCategories = [
    [1, "Salary", "#10b981"],
    [2, "Freelance", "#3b82f6"],
    [3, "Groceries", "#f59e0b"],
    [4, "Transport", "#6366f1"],
    [5, "Dining", "#ec4899"],
    [6, "Fitness", "#ef4444"],
    [7, "Learning", "#14b8a6"],
    [8, "Utilities", "#8b5cf6"]
  ];

  // Finance Records - 2 months of rich data (January 2026 and February 2026)
  const financeRecords = [];
  let financeId = 1;

  // January 2026 Income
  financeRecords.push([financeId++, "2026-01-01", "income", 3600, "Salary", "Monthly Salary", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-01-10", "income", 950, "Freelance", "Project Alpha", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-01-18", "income", 750, "Freelance", "Project Beta", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-01-25", "income", 500, "Freelance", "Quick project", false, "", "", "", "", "", "", "", false]);

  // January 2026 Expenses
  financeRecords.push([financeId++, "2026-01-02", "expense", 190, "Groceries", "Weekly shopping", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-01-05", "expense", 60, "Transport", "Commuting", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-01-08", "expense", 220, "Utilities", "Electricity bill", true, "monthly", "2026-02-08", "bill", "active", "", "", "", false]);
  financeRecords.push([financeId++, "2026-01-10", "expense", 45, "Fitness", "Gym membership", true, "monthly", "2026-02-10", "subscription", "active", "", "", "", false]);
  financeRecords.push([financeId++, "2026-01-12", "expense", 110, "Dining", "Team lunch", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-01-15", "expense", 120, "Groceries", "Weekly shopping", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-01-18", "expense", 90, "Learning", "Course materials", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-01-20", "expense", 75, "Transport", "Taxi", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-01-22", "expense", 140, "Dining", "Client meeting", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-01-25", "expense", 200, "Groceries", "Monthly bulk", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-01-28", "expense", 55, "Fitness", "Supplements", false, "", "", "", "", "", "", "", false]);

  // February 2026 Income
  financeRecords.push([financeId++, "2026-02-01", "income", 3700, "Salary", "Monthly Salary", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-02-10", "income", 1000, "Freelance", "Project Alpha", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-02-18", "income", 800, "Freelance", "Project Beta", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-02-25", "income", 600, "Freelance", "New project", false, "", "", "", "", "", "", "", false]);

  // February 2026 Expenses
  financeRecords.push([financeId++, "2026-02-02", "expense", 200, "Groceries", "Weekly shopping", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-02-05", "expense", 65, "Transport", "Commuting", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-02-08", "expense", 220, "Utilities", "Electricity bill", true, "monthly", "2026-03-08", "bill", "active", "", "", "", false]);
  financeRecords.push([financeId++, "2026-02-10", "expense", 45, "Fitness", "Gym membership", true, "monthly", "2026-03-10", "subscription", "active", "", "", "", false]);
  financeRecords.push([financeId++, "2026-02-12", "expense", 115, "Dining", "Team lunch", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-02-15", "expense", 130, "Groceries", "Weekly shopping", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-02-18", "expense", 95, "Learning", "Course materials", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-02-20", "expense", 80, "Transport", "Taxi", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-02-22", "expense", 150, "Dining", "Client meeting", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-02-25", "expense", 210, "Groceries", "Monthly bulk", false, "", "", "", "", "", "", "", false]);
  financeRecords.push([financeId++, "2026-02-28", "expense", 60, "Fitness", "Supplements", false, "", "", "", "", "", "", "", false]);

  // Objectives
  const objectives = [
    [1, "Launch Product", "Complete product launch by end of Q1", "#3b82f6", "Work", "2026-03-31"],
    [2, "Fitness Goals", "Maintain weekly workout routine", "#ef4444", "Health", "2026-02-28"],
    [3, "Learning Track", "Complete 3 online courses", "#f59e0b", "Learning", "2026-04-30"],
    [4, "Freelance Income", "Earn $2000 from freelance projects", "#10b981", "Work", "2026-02-28"]
  ];

  // Tasks - Rich data for January and February 2026 (using objective IDs)
  const tasks = [];
  let taskId = 1001;

  // Tasks for Objective 1 (Launch Product) - January 2026
  tasks.push([taskId++, "Design product mockups", "2026-01-05", "09:00", "2026-01-08", "17:00", "#3b82f6", "completed", 1]);
  tasks.push([taskId++, "Develop MVP features", "2026-01-10", "09:00", "2026-01-20", "17:00", "#3b82f6", "completed", 1]);
  tasks.push([taskId++, "Write documentation", "2026-01-22", "10:00", "2026-01-28", "16:00", "#3b82f6", "completed", 1]);
  tasks.push([taskId++, "Beta testing", "2026-01-29", "09:00", "2026-02-05", "17:00", "#3b82f6", "in-progress", 1]);
  tasks.push([taskId++, "Marketing campaign", "2026-02-08", "09:00", "2026-02-15", "17:00", "#3b82f6", "pending", 1]);
  tasks.push([taskId++, "Launch preparation", "2026-02-18", "09:00", "2026-02-25", "17:00", "#3b82f6", "pending", 1]);

  // Tasks for Objective 2 (Fitness Goals) - January & February 2026
  tasks.push([taskId++, "Morning run", "2026-01-03", "07:00", "2026-01-03", "08:00", "#ef4444", "completed", 2]);
  tasks.push([taskId++, "Strength training", "2026-01-05", "18:00", "2026-01-05", "19:30", "#ef4444", "completed", 2]);
  tasks.push([taskId++, "Yoga session", "2026-01-07", "08:00", "2026-01-07", "09:00", "#ef4444", "completed", 2]);
  tasks.push([taskId++, "Cardio workout", "2026-01-12", "07:00", "2026-01-12", "08:00", "#ef4444", "completed", 2]);
  tasks.push([taskId++, "Strength training", "2026-01-14", "18:00", "2026-01-14", "19:30", "#ef4444", "completed", 2]);
  tasks.push([taskId++, "Morning run", "2026-01-18", "07:00", "2026-01-18", "08:00", "#ef4444", "pending", 2]);
  tasks.push([taskId++, "Yoga session", "2026-01-22", "08:00", "2026-01-22", "09:00", "#ef4444", "pending", 2]);
  tasks.push([taskId++, "Cardio workout", "2026-02-02", "07:00", "2026-02-02", "08:00", "#ef4444", "completed", 2]);
  tasks.push([taskId++, "Strength training", "2026-02-04", "18:00", "2026-02-04", "19:30", "#ef4444", "completed", 2]);
  tasks.push([taskId++, "Morning run", "2026-02-08", "07:00", "2026-02-08", "08:00", "#ef4444", "pending", 2]);

  // Tasks for Objective 3 (Learning Track) - January & February 2026
  tasks.push([taskId++, "Complete React course", "2026-01-01", "19:00", "2026-01-15", "21:00", "#f59e0b", "completed", 3]);
  tasks.push([taskId++, "Build practice project", "2026-01-16", "19:00", "2026-01-25", "21:00", "#f59e0b", "completed", 3]);
  tasks.push([taskId++, "Start Node.js course", "2026-01-26", "19:00", "2026-02-10", "21:00", "#f59e0b", "in-progress", 3]);
  tasks.push([taskId++, "Complete Node.js course", "2026-02-11", "19:00", "2026-02-28", "21:00", "#f59e0b", "pending", 3]);

  // Tasks for Objective 4 (Freelance Income) - January & February 2026
  tasks.push([taskId++, "Project Alpha - Phase 1", "2026-01-05", "10:00", "2026-01-10", "18:00", "#10b981", "completed", 4]);
  tasks.push([taskId++, "Project Alpha - Phase 2", "2026-01-12", "10:00", "2026-01-18", "18:00", "#10b981", "completed", 4]);
  tasks.push([taskId++, "Project Beta - Development", "2026-01-20", "10:00", "2026-01-25", "18:00", "#10b981", "completed", 4]);
  tasks.push([taskId++, "Project Beta - Testing", "2026-02-05", "10:00", "2026-02-10", "18:00", "#10b981", "completed", 4]);
  tasks.push([taskId++, "New project - Setup", "2026-02-15", "10:00", "2026-02-25", "18:00", "#10b981", "in-progress", 4]);

  // Additional standalone tasks - January & February 2026
  tasks.push([taskId++, "Review Q1 goals", "2026-01-01", "09:00", "2026-01-03", "17:00", "#6366f1", "completed", null]);
  tasks.push([taskId++, "Team meeting prep", "2026-01-10", "14:00", "2026-01-10", "15:00", "#3b82f6", "completed", null]);
  tasks.push([taskId++, "Update portfolio", "2026-01-15", "19:00", "2026-01-20", "21:00", "#10b981", "completed", null]);
  tasks.push([taskId++, "Schedule doctor appointment", "2026-01-25", "", "2026-01-30", "", "#ef4444", "completed", null]);
  tasks.push([taskId++, "Plan weekend trip", "2026-02-05", "", "2026-02-07", "", "#10b981", "pending", null]);
  tasks.push([taskId++, "Client presentation prep", "2026-02-12", "14:00", "2026-02-15", "16:00", "#3b82f6", "in-progress", null]);
  tasks.push([taskId++, "Monthly review", "2026-02-28", "09:00", "2026-02-28", "17:00", "#6366f1", "pending", null]);

  // Finance Settings
  const financeSettings = [
    ["2026-01", 2100],
    ["2026-02", 2200]
  ];

  // Events
  const events = [
    [1, "Team Meeting", "Weekly sync", "2026-01-10", "10:00", "2026-01-10", "11:00", "Work", "#3b82f6", "", false, "", 0],
    [2, "Product Demo", "Client presentation", "2026-01-15", "14:00", "2026-01-15", "16:00", "Work", "#3b82f6", "", false, "", 0],
    [3, "Birthday Party", "Friend's birthday", "2026-01-20", "18:00", "2026-01-20", "22:00", "Personal", "#10b981", "", false, "", 0],
    [4, "Doctor Appointment", "Annual checkup", "2026-01-25", "14:00", "2026-01-25", "15:00", "Health", "#ef4444", "", false, "", 0],
    [5, "Team Meeting", "Weekly sync", "2026-02-10", "10:00", "2026-02-10", "11:00", "Work", "#3b82f6", "", false, "", 0],
    [6, "Client Presentation", "Q1 Review", "2026-02-15", "14:00", "2026-02-15", "16:00", "Work", "#3b82f6", "", false, "", 0]
  ];

  // Debts
  const debts = [
    [1, "John Doe", 150, "owed", "Lent money for lunch", "2026-01-05", "pending", "", "", ""],
    [2, "Jane Smith", 50, "owe", "Split dinner bill", "2026-01-08", "pending", "", "", ""]
  ];

  // Notes
  const notes = [
    [1, "Product Launch Ideas", "Product", "2026-01-05", "", "Ideas for marketing campaign"],
    [2, "Learning Notes - React", "Learning", "2026-01-15", "", "Key concepts from React course"],
    [3, "Fitness Progress", "Health", "2026-01-20", "", "Feeling stronger, increased weights"],
    [4, "Q1 Planning", "Work", "2026-02-01", "", "Goals and objectives for Q1"],
    [5, "Node.js Learning", "Learning", "2026-02-10", "", "Advanced Node.js patterns"]
  ];

  // Write data to sheets
  tasksSheet.getRange(2, 1, tasks.length, tasks[0].length).setValues(tasks);
  objectivesSheet.getRange(2, 1, objectives.length, objectives[0].length).setValues(objectives);
  categoriesSheet.getRange(2, 1, categories.length, categories[0].length).setValues(categories);
  statusesSheet.getRange(2, 1, statuses.length, statuses[0].length).setValues(statuses);
  financeSheet.getRange(2, 1, financeRecords.length, financeRecords[0].length).setValues(financeRecords);
  financeSettingsSheet.getRange(2, 1, financeSettings.length, financeSettings[0].length).setValues(financeSettings);
  financeCategoriesSheet.getRange(2, 1, financeCategories.length, financeCategories[0].length).setValues(financeCategories);
  eventsSheet.getRange(2, 1, events.length, events[0].length).setValues(events);
  debtsSheet.getRange(2, 1, debts.length, debts[0].length).setValues(debts);
  notesSheet.getRange(2, 1, notes.length, notes[0].length).setValues(notes);

  Logger.log('Smoke data seeded successfully with January and February 2026 data!');
  return 'Smoke data created: ' + tasks.length + ' tasks (Jan-Feb 2026), ' + objectives.length + ' objectives, ' + financeRecords.length + ' finance records';
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
