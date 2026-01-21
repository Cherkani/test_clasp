function seedSmokeData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Ensure all sheets exist with correct structure
  const statusesSheet = ensureSheet(ss, "1_status", ["id", "name", "color"]);
  const categoriesSheet = ensureSheet(ss, "2_category", ["id", "name", "color"]);
  const financeCategoriesSheet = ensureSheet(ss, "3_financeCategories", ["id", "name", "color"]);
  const objectivesSheet = ensureSheet(ss, "4_objectives", [
    "id", "name", "description", "color", "category", "dueDate",
    "budget", "actualSpending", "targetValue", "currentValue", "healthScore", "lastUpdated", "relatedFinanceId"
  ]);
  const tasksSheet = ensureSheet(ss, "5_tasks", [
    "id", "task", "category", "startDate", "startTime", "endDate", "endTime", "color", "status",
    "objectiveId", "priority", "repeatType", "repeatUntil", "impactType", "estimatedValue",
    "actualValue", "valueRealizedDate", "estimatedHours", "isIncome"
  ]);

  const financeSheet = ensureSheet(ss, "6_finance", [
    "id", "date", "type", "amount", "category", "note", "recurringMonthly", "recurringFrequency",
    "recurringNextDueDate", "recurringBillType", "recurringStatus", "recurringBillId",
    "relatedTaskId", "relatedObjective", "isValueRealization", "hoursNeeded"
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
  financeRecords.push([financeId++, "2026-01-01", "income", 3600, "Salary", "Monthly Salary", false, "", "", "", "", "", "", "", false, 160]);
  financeRecords.push([financeId++, "2026-01-10", "income", 950, "Freelance", "Project Alpha", false, "", "", "", "", "", "", "", false, 25]);
  financeRecords.push([financeId++, "2026-01-18", "income", 750, "Freelance", "Project Beta", false, "", "", "", "", "", "", "", false, 18]);
  financeRecords.push([financeId++, "2026-01-25", "income", 500, "Freelance", "Quick project", false, "", "", "", "", "", "", "", false, 12]);

  // January 2026 Expenses
  financeRecords.push([financeId++, "2026-01-02", "expense", 190, "Groceries", "Weekly shopping", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-01-05", "expense", 60, "Transport", "Commuting", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-01-08", "expense", 220, "Utilities", "Electricity bill", true, "monthly", "2026-02-08", "bill", "active", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-01-10", "expense", 45, "Fitness", "Gym membership", true, "monthly", "2026-02-10", "subscription", "active", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-01-12", "expense", 110, "Dining", "Team lunch", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-01-15", "expense", 120, "Groceries", "Weekly shopping", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-01-18", "expense", 90, "Learning", "Course materials", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-01-20", "expense", 75, "Transport", "Taxi", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-01-22", "expense", 140, "Dining", "Client meeting", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-01-25", "expense", 200, "Groceries", "Monthly bulk", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-01-28", "expense", 55, "Fitness", "Supplements", false, "", "", "", "", "", "", "", false, 0]);

  // February 2026 Income
  financeRecords.push([financeId++, "2026-02-01", "income", 3700, "Salary", "Monthly Salary", false, "", "", "", "", "", "", "", false, 160]);
  financeRecords.push([financeId++, "2026-02-10", "income", 1000, "Freelance", "Project Alpha", false, "", "", "", "", "", "", "", false, 26]);
  financeRecords.push([financeId++, "2026-02-18", "income", 800, "Freelance", "Project Beta", false, "", "", "", "", "", "", "", false, 20]);
  financeRecords.push([financeId++, "2026-02-25", "income", 600, "Freelance", "New project", false, "", "", "", "", "", "", "", false, 15]);

  // February 2026 Expenses
  financeRecords.push([financeId++, "2026-02-02", "expense", 200, "Groceries", "Weekly shopping", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-02-05", "expense", 65, "Transport", "Commuting", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-02-08", "expense", 220, "Utilities", "Electricity bill", true, "monthly", "2026-03-08", "bill", "active", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-02-10", "expense", 45, "Fitness", "Gym membership", true, "monthly", "2026-03-10", "subscription", "active", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-02-12", "expense", 115, "Dining", "Team lunch", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-02-15", "expense", 130, "Groceries", "Weekly shopping", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-02-18", "expense", 95, "Learning", "Course materials", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-02-20", "expense", 80, "Transport", "Taxi", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-02-22", "expense", 150, "Dining", "Client meeting", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-02-25", "expense", 210, "Groceries", "Monthly bulk", false, "", "", "", "", "", "", "", false, 0]);
  financeRecords.push([financeId++, "2026-02-28", "expense", 60, "Fitness", "Supplements", false, "", "", "", "", "", "", "", false, 0]);

  // Objectives (using IDs for finance relationships)
  const objectives = [
    [1, "Launch Product", "Complete product launch by end of Q1", "#3b82f6", "", "2026-03-31", 0, 0, 0, 0, 0, "", 1], // Linked to Salary income
    [2, "Fitness Goals", "Maintain weekly workout routine", "#ef4444", "", "2026-02-28", 0, 0, 0, 0, 0, "", null],
    [3, "Learning Track", "Complete 3 online courses", "#f59e0b", "", "2026-04-30", 0, 0, 0, 0, 0, "", null],
    [4, "Freelance Income", "Earn $2000 from freelance projects", "#10b981", "", "2026-02-28", 0, 0, 0, 0, 0, "", 2] // Linked to Freelance income
  ];

  // Tasks - Rich data for January and February 2026 (using objective IDs)
  const tasks = [];
  let taskId = 1001;

  // Tasks for Objective 1 (Launch Product) - January 2026
  tasks.push([taskId++, "Design product mockups", "Work", "2026-01-05", "09:00", "2026-01-08", "17:00", "#3b82f6", "completed", 1, "high", "none", "", "money", 500, 500, "2026-01-08", 8, true]);
  tasks.push([taskId++, "Develop MVP features", "Work", "2026-01-10", "09:00", "2026-01-20", "17:00", "#3b82f6", "completed", 1, "high", "none", "", "money", 1200, 1200, "2026-01-20", 40, true]);
  tasks.push([taskId++, "Write documentation", "Work", "2026-01-22", "10:00", "2026-01-28", "16:00", "#3b82f6", "completed", 1, "medium", "none", "", "money", 300, 300, "2026-01-28", 12, true]);
  tasks.push([taskId++, "Beta testing", "Work", "2026-01-29", "09:00", "2026-02-05", "17:00", "#3b82f6", "in-progress", 1, "high", "none", "", "money", 800, 0, "", 25, true]);
  tasks.push([taskId++, "Marketing campaign", "Work", "2026-02-08", "09:00", "2026-02-15", "17:00", "#3b82f6", "pending", 1, "high", "none", "", "money", 600, 0, "", 20, true]);
  tasks.push([taskId++, "Launch preparation", "Work", "2026-02-18", "09:00", "2026-02-25", "17:00", "#3b82f6", "pending", 1, "high", "none", "", "money", 400, 0, "", 15, true]);

  // Tasks for Objective 2 (Fitness Goals) - January & February 2026
  tasks.push([taskId++, "Morning run", "Health", "2026-01-03", "07:00", "2026-01-03", "08:00", "#ef4444", "completed", 2, "low", "none", "", "non-monetary", 0, 0, "", 1, false]);
  tasks.push([taskId++, "Strength training", "Health", "2026-01-05", "18:00", "2026-01-05", "19:30", "#ef4444", "completed", 2, "medium", "none", "", "non-monetary", 0, 0, "", 1.5, false]);
  tasks.push([taskId++, "Yoga session", "Health", "2026-01-07", "08:00", "2026-01-07", "09:00", "#ef4444", "completed", 2, "low", "none", "", "non-monetary", 0, 0, "", 1, false]);
  tasks.push([taskId++, "Cardio workout", "Health", "2026-01-12", "07:00", "2026-01-12", "08:00", "#ef4444", "completed", 2, "medium", "none", "", "non-monetary", 0, 0, "", 1, false]);
  tasks.push([taskId++, "Strength training", "Health", "2026-01-14", "18:00", "2026-01-14", "19:30", "#ef4444", "completed", 2, "medium", "none", "", "non-monetary", 0, 0, "", 1.5, false]);
  tasks.push([taskId++, "Morning run", "Health", "2026-01-18", "07:00", "2026-01-18", "08:00", "#ef4444", "pending", 2, "low", "none", "", "non-monetary", 0, 0, "", 1, false]);
  tasks.push([taskId++, "Yoga session", "Health", "2026-01-22", "08:00", "2026-01-22", "09:00", "#ef4444", "pending", 2, "low", "none", "", "non-monetary", 0, 0, "", 1, false]);
  tasks.push([taskId++, "Cardio workout", "Health", "2026-02-02", "07:00", "2026-02-02", "08:00", "#ef4444", "completed", 2, "medium", "none", "", "non-monetary", 0, 0, "", 1, false]);
  tasks.push([taskId++, "Strength training", "Health", "2026-02-04", "18:00", "2026-02-04", "19:30", "#ef4444", "completed", 2, "medium", "none", "", "non-monetary", 0, 0, "", 1.5, false]);
  tasks.push([taskId++, "Morning run", "Health", "2026-02-08", "07:00", "2026-02-08", "08:00", "#ef4444", "pending", 2, "low", "none", "", "non-monetary", 0, 0, "", 1, false]);

  // Tasks for Objective 3 (Learning Track) - January & February 2026
  tasks.push([taskId++, "Complete React course", "Learning", "2026-01-01", "19:00", "2026-01-15", "21:00", "#f59e0b", "completed", 3, "high", "none", "", "non-monetary", 0, 0, "", 30, false]);
  tasks.push([taskId++, "Build practice project", "Learning", "2026-01-16", "19:00", "2026-01-25", "21:00", "#f59e0b", "completed", 3, "high", "none", "", "non-monetary", 0, 0, "", 20, false]);
  tasks.push([taskId++, "Start Node.js course", "Learning", "2026-01-26", "19:00", "2026-02-10", "21:00", "#f59e0b", "in-progress", 3, "high", "none", "", "non-monetary", 0, 0, "", 30, false]);
  tasks.push([taskId++, "Complete Node.js course", "Learning", "2026-02-11", "19:00", "2026-02-28", "21:00", "#f59e0b", "pending", 3, "high", "none", "", "non-monetary", 0, 0, "", 40, false]);

  // Tasks for Objective 4 (Freelance Income) - January & February 2026
  tasks.push([taskId++, "Project Alpha - Phase 1", "Work", "2026-01-05", "10:00", "2026-01-10", "18:00", "#10b981", "completed", 4, "high", "none", "", "money", 950, 950, "2026-01-10", 25, true]);
  tasks.push([taskId++, "Project Alpha - Phase 2", "Work", "2026-01-12", "10:00", "2026-01-18", "18:00", "#10b981", "completed", 4, "high", "none", "", "money", 750, 750, "2026-01-18", 18, true]);
  tasks.push([taskId++, "Project Beta - Development", "Work", "2026-01-20", "10:00", "2026-01-25", "18:00", "#10b981", "completed", 4, "high", "none", "", "money", 500, 500, "2026-01-25", 12, true]);
  tasks.push([taskId++, "Project Beta - Testing", "Work", "2026-02-05", "10:00", "2026-02-10", "18:00", "#10b981", "completed", 4, "high", "none", "", "money", 1000, 1000, "2026-02-10", 26, true]);
  tasks.push([taskId++, "New project - Setup", "Work", "2026-02-15", "10:00", "2026-02-25", "18:00", "#10b981", "in-progress", 4, "medium", "none", "", "money", 800, 0, "", 20, true]);

  // Additional standalone tasks - January & February 2026
  tasks.push([taskId++, "Review Q1 goals", "Work", "2026-01-01", "09:00", "2026-01-03", "17:00", "#6366f1", "completed", null, "medium", "none", "", "non-monetary", 0, 0, "", 6, false]);
  tasks.push([taskId++, "Team meeting prep", "Work", "2026-01-10", "14:00", "2026-01-10", "15:00", "#3b82f6", "completed", null, "medium", "none", "", "non-monetary", 0, 0, "", 1, false]);
  tasks.push([taskId++, "Update portfolio", "Personal", "2026-01-15", "19:00", "2026-01-20", "21:00", "#10b981", "completed", null, "low", "none", "", "non-monetary", 0, 0, "", 10, false]);
  tasks.push([taskId++, "Schedule doctor appointment", "Health", "2026-01-25", "", "2026-01-30", "", "#ef4444", "completed", null, "low", "none", "", "non-monetary", 0, 0, "", 0.5, false]);
  tasks.push([taskId++, "Plan weekend trip", "Personal", "2026-02-05", "", "2026-02-07", "", "#10b981", "pending", null, "low", "none", "", "non-monetary", 0, 0, "", 2, false]);
  tasks.push([taskId++, "Client presentation prep", "Work", "2026-02-12", "14:00", "2026-02-15", "16:00", "#3b82f6", "in-progress", null, "high", "none", "", "non-monetary", 0, 0, "", 6, false]);
  tasks.push([taskId++, "Monthly review", "Work", "2026-02-28", "09:00", "2026-02-28", "17:00", "#6366f1", "pending", null, "medium", "none", "", "non-monetary", 0, 0, "", 8, false]);

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
