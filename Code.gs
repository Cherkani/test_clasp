function doGet() {
  const template = HtmlService.createTemplateFromFile("index");
  return template
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getDatags() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("5_tasks");
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  const tz = Session.getScriptTimeZone();
  const now = new Date();


  function formatDateTime(value, type) {
    if (!value) return null;
    if (Object.prototype.toString.call(value) === '[object Date]') {
      if (type === "date") return Utilities.formatDate(value, tz, "yyyy-MM-dd");
      if (type === "time") return Utilities.formatDate(value, tz, "HH:mm:ss");
      return Utilities.formatDate(value, tz, "yyyy-MM-dd HH:mm:ss");
    }
    return String(value);
  }

 
  function makeDateTime(dateVal, timeVal) {
    if (!(dateVal instanceof Date)) return null;
    const date = new Date(dateVal);
    if (timeVal instanceof Date) {
      date.setHours(timeVal.getHours(), timeVal.getMinutes(), timeVal.getSeconds());
    }
    return date;
  }

  function makeDateTimeFromStrings(dateStr, timeStr) {
    if (!dateStr) return null;
    const timePart = timeStr || "00:00:00";
    const dateTime = new Date(`${dateStr}T${timePart}`);
    if (Number.isNaN(dateTime.getTime())) return null;
    return dateTime;
  }

  function addDerivedFields(task, startDateTime, dueDateTime, status) {
    const startTimestamp = startDateTime ? startDateTime.getTime() : null;
    const dueTimestamp = dueDateTime ? dueDateTime.getTime() : null;
    const isOverdue = status === "overdue";
    const daysRemaining = dueDateTime
      ? Math.ceil((dueDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      ...task,
      startTimestamp,
      dueTimestamp,
      isOverdue,
      daysRemaining
    };
  }

 
  const sampleData = [];


  if (values.length <= 1 || values.slice(1).every(row => row.join('') === '')) {
    return sampleData.map(item => {
      const startDateTime = makeDateTimeFromStrings(item.startDate, item.startTime);
      const dueDateTime = makeDateTimeFromStrings(item.endDate, item.endTime);
      return addDerivedFields(item, startDateTime, dueDateTime, item.status);
    });
  }

  
  return values.slice(1).map(row => {
    const startDateTime = makeDateTime(row[3], row[4]);
    const dueDateTime = makeDateTime(row[5], row[6]);

    let newStatus = row[8];
    if (newStatus !== "completed" && dueDateTime) {
      if (dueDateTime < now) {
        newStatus = "overdue";
      } else {
        newStatus = "pending";
      }
    }

    const task = {
      id: row[0],
      task: row[1],
      category: row[2],
      startDate: formatDateTime(row[3], "date"),
      startTime: formatDateTime(row[4], "time"),
      endDate: formatDateTime(row[5], "date"),
      endTime: formatDateTime(row[6], "time"),
      color: row[7],
      status: newStatus,
      objectiveId: row[9] ? Number(row[9]) : null, // Store objective ID instead of name
      priority: row[10] || 'medium',
      repeatType: row[11] || 'none',
      repeatUntil: formatDateTime(row[12], "date") || '',
      impactType: row[13] || 'non-monetary',
      estimatedValue: Number(row[14]) || 0,
      actualValue: Number(row[15] || 0) || 0,
      valueRealizedDate: formatDateTime(row[16] || '', "date") || '',
      estimatedHours: Number(row[17] || 0) || 0,
      isIncome: row[18] === true || row[18] === "TRUE"
    };
    return addDerivedFields(task, startDateTime, dueDateTime, newStatus);
  });
}





function addDatags(taskbase) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("5_tasks");
  if (!sheet) return [];

  if (sheet.getLastRow() > 1) {
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .clearContent();
  }

  if (taskbase.length > 0) {
    const rows = taskbase.map((item) => [
      item.id,
      item.task,
      item.category,
      item.startDate,
      item.startTime || '',
      item.endDate,
      item.endTime || '',
      item.color,
      item.status,
      item.objectiveId || '', // Store objective ID
      item.priority || 'medium',
      item.repeatType || 'none',
      item.repeatUntil || '',
      item.impactType || 'non-monetary',
      item.estimatedValue || 0,
      item.actualValue || 0,
      item.valueRealizedDate || '',
      item.estimatedHours || 0,
      item.isIncome || false
    ]);

    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);

    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .sort({ column: 1, ascending: false });
  }
}

// Objectives Functions
function getObjectives() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("4_objectives");
  
  if (!sheet) {
    // Create Objectives sheet if it doesn't exist
    sheet = ss.insertSheet("4_objectives");
    sheet.getRange(1, 1, 1, 12).setValues([[
      "id", "name", "description", "color", "category", "dueDate",
      "budget", "actualSpending", "targetValue", "currentValue", "healthScore", "lastUpdated"
    ]]);
    sheet.getRange(1, 1, 1, 12).setFontWeight("bold");
    
    // Add sample objectives
    const sampleObjectives = [
      [1, "Work", "Work-related objectives", "#3b82f6", "", ""],
      [2, "Personal", "Personal development goals", "#10b981", "", ""],
      [3, "Health", "Health and fitness goals", "#ef4444", "", ""]
    ];
    if (sampleObjectives.length > 0) {
      sheet.getRange(2, 1, sampleObjectives.length, 6).setValues(sampleObjectives);
    }
  }

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const tz = Session.getScriptTimeZone();
  const formatDate = (value) => {
    if (!value) return '';
    if (Object.prototype.toString.call(value) === '[object Date]') {
      return Utilities.formatDate(value, tz, "yyyy-MM-dd");
    }
    return String(value);
  };

  return values.slice(1).map(row => ({
    id: row[0],
    name: row[1],
    description: row[2] || '',
    color: row[3] || '#3b82f6',
    category: row[4] || '',
    dueDate: formatDate(row[5] || ''),
    budget: Number(row[6] || 0) || 0,
    actualSpending: Number(row[7] || 0) || 0,
    targetValue: Number(row[8] || 0) || 0,
    currentValue: Number(row[9] || 0) || 0,
    healthScore: Number(row[10] || 0) || 0,
    lastUpdated: row[11] || '',
    relatedFinanceId: row[12] ? Number(row[12]) : null // Store finance record ID
  }));
}

function addObjective(objective) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("4_objectives");
  
  if (!sheet) {
    sheet = ss.insertSheet("4_objectives");
    sheet.getRange(1, 1, 1, 13).setValues([[
      "id", "name", "description", "color", "category", "dueDate",
      "budget", "actualSpending", "targetValue", "currentValue", "healthScore", "lastUpdated", "relatedFinanceId"
    ]]);
    sheet.getRange(1, 1, 1, 13).setFontWeight("bold");
  }

  // Calculate new ID
  let newId = 1;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    if (existingIds.length > 0) {
      newId = Math.max(...existingIds.filter(id => id !== '' && id != null)) + 1;
    }
  }
  
  const now = new Date();
  const tz = Session.getScriptTimeZone();
  const timestamp = Utilities.formatDate(now, tz, "yyyy-MM-dd HH:mm:ss");

  sheet.appendRow([
    newId,
    objective.name,
    objective.description || '',
    objective.color || '#3b82f6',
    objective.category || '',
    objective.dueDate || '',
    objective.budget || 0,
    0, // actualSpending - will be calculated
    objective.targetValue || 0,
    0, // currentValue - will be calculated
    0, // healthScore - will be calculated
    timestamp,
    objective.relatedFinanceId || ''
  ]);

  return newId;
}

function updateObjective(objective) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("4_objectives");
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === objective.id);
  
  if (rowIndex > 0) {
    const now = new Date();
    const tz = Session.getScriptTimeZone();
    const timestamp = Utilities.formatDate(now, tz, "yyyy-MM-dd HH:mm:ss");

    sheet.getRange(rowIndex + 1, 2, 1, 12).setValues([[
      objective.name,
      objective.description || '',
      objective.color || '#3b82f6',
      objective.category || '',
      objective.dueDate || '',
      objective.budget || 0,
      0, // actualSpending - will be calculated
      objective.targetValue || 0,
      0, // currentValue - will be calculated
      0, // healthScore - will be calculated
      timestamp,
      objective.relatedFinanceId || ''
    ]]);
    return true;
  }
  return false;
}

// Categories Functions
function getCategories() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("2_category");
  
  if (!sheet) {
    // Create Categories sheet if it doesn't exist
    sheet = ss.insertSheet("2_category");
    sheet.getRange(1, 1, 1, 3).setValues([["id", "name", "color"]]);
    sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
    
    // Add sample categories
    const sampleCategories = [
      [1, "Work", "#3b82f6"],
      [2, "Personal", "#10b981"],
      [3, "Health", "#ef4444"],
      [4, "Learning", "#f59e0b"]
    ];
    if (sampleCategories.length > 0) {
      sheet.getRange(2, 1, sampleCategories.length, 3).setValues(sampleCategories);
    }
  }

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  return values.slice(1).map(row => ({
    id: row[0],
    name: row[1],
    color: row[2] || '#3b82f6'
  }));
}

function addCategory(category) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("2_category");
  
  if (!sheet) {
    sheet = ss.insertSheet("2_category");
    sheet.getRange(1, 1, 1, 3).setValues([["id", "name", "color"]]);
    sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
  }

  // Calculate new ID
  let newId = 1;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    if (existingIds.length > 0) {
      newId = Math.max(...existingIds.filter(id => id !== '' && id != null)) + 1;
    }
  }
  
  sheet.appendRow([
    newId,
    category.name,
    category.color || '#3b82f6'
  ]);

  return newId;
}

function updateCategory(category) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("2_category");
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === category.id);
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex + 1, 2, 1, 2).setValues([[
      category.name,
      category.color || '#3b82f6'
    ]]);
    return true;
  }
  return false;
}

function deleteCategory(categoryId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("2_category");
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === categoryId);
  
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex + 1);
    return true;
  }
  return false;
}

// Status Functions
function getStatuses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("1_status");
  
  if (!sheet) {
    // Create 1_status sheet if it doesn't exist
    sheet = ss.insertSheet("1_status");
    sheet.getRange(1, 1, 1, 3).setValues([["id", "name", "color"]]);
    sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
    
    // Add sample statuses
    const sampleStatuses = [
      [1, "pending", "#3b82f6"],
      [2, "completed", "#10b981"],
      [3, "overdue", "#ef4444"],
      [4, "in-progress", "#f59e0b"]
    ];
    if (sampleStatuses.length > 0) {
      sheet.getRange(2, 1, sampleStatuses.length, 3).setValues(sampleStatuses);
    }
  }

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  return values.slice(1).map(row => ({
    id: row[0],
    name: row[1],
    color: row[2] || '#3b82f6'
  }));
}

function addStatus(status) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("1_status");
  
  if (!sheet) {
    sheet = ss.insertSheet("1_status");
    sheet.getRange(1, 1, 1, 3).setValues([["id", "name", "color"]]);
    sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
  }

  // Calculate new ID
  let newId = 1;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    if (existingIds.length > 0) {
      newId = Math.max(...existingIds.filter(id => id !== '' && id != null)) + 1;
    }
  }
  
  sheet.appendRow([
    newId,
    status.name,
    status.color || '#3b82f6'
  ]);

  return newId;
}

function updateStatus(status) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("1_status");
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === status.id);
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex + 1, 2, 1, 2).setValues([[
      status.name,
      status.color || '#3b82f6'
    ]]);
    return true;
  }
  return false;
}

function deleteStatus(statusId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("1_status");
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === statusId);
  
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex + 1);
    return true;
  }
  return false;
}

function deleteObjective(objectiveId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("4_objectives");
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === objectiveId);
  
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex + 1);
    return true;
  }
  return false;
}

// Finance Functions
function getFinanceRecords() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("6_finance");

  if (!sheet) {
    sheet = ss.insertSheet("6_finance");
    sheet.getRange(1, 1, 1, 16).setValues([[
      "id",
      "date",
      "type",
      "amount",
      "category",
      "note",
      "recurringMonthly",
      "recurringFrequency",
      "recurringNextDueDate",
      "recurringBillType",
      "recurringStatus",
      "recurringBillId",
      "relatedTaskId",
      "relatedObjective",
      "isValueRealization",
      "hoursNeeded"
    ]]);
    sheet.getRange(1, 1, 1, 16).setFontWeight("bold");
  }

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const tz = Session.getScriptTimeZone();
  const formatDate = (value) => {
    if (!value) return "";
    if (Object.prototype.toString.call(value) === '[object Date]') {
      return Utilities.formatDate(value, tz, "yyyy-MM-dd");
    }
    return String(value);
  };

  return values.slice(1)
    .filter(row => row.join('') !== '')
    .map(row => ({
      id: row[0],
      date: formatDate(row[1] || ''),
      type: row[2] || "expense",
      amount: Number(row[3]) || 0,
      category: row[4] || "",
      note: row[5] || "",
      recurringMonthly: row[6] === true || row[6] === "TRUE",
      recurringFrequency: row[7] || "",
      recurringNextDueDate: formatDate(row[8] || ''),
      recurringBillType: row[9] || "",
      recurringStatus: row[10] || "",
      recurringBillId: row[11] || "",
      relatedTaskId: row[12] || "",
      relatedObjective: row[13] || "",
      isValueRealization: row[14] === true || row[14] === "TRUE",
      hoursNeeded: Number(row[15] || 0) || 0
    }));
}

function saveFinanceRecords(records) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("6_finance");

  if (!sheet) {
    sheet = ss.insertSheet("6_finance");
    sheet.getRange(1, 1, 1, 16).setValues([[
      "id",
      "date",
      "type",
      "amount",
      "category",
      "note",
      "recurringMonthly",
      "recurringFrequency",
      "recurringNextDueDate",
      "recurringBillType",
      "recurringStatus",
      "recurringBillId",
      "relatedTaskId",
      "relatedObjective",
      "isValueRealization",
      "hoursNeeded"
    ]]);
    sheet.getRange(1, 1, 1, 16).setFontWeight("bold");
  }

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }

  if (records && records.length > 0) {
    const rows = records.map(record => [
      record.id,
      record.date,
      record.type,
      record.amount,
      record.category || "",
      record.note || "",
      record.recurringMonthly ? true : false,
      record.recurringFrequency || "",
      record.recurringNextDueDate || "",
      record.recurringBillType || "",
      record.recurringStatus || "",
      record.recurringBillId || "",
      record.relatedTaskId || "",
      record.relatedObjective || "",
      record.isValueRealization ? true : false,
      record.hoursNeeded || 0
    ]);
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .sort({ column: 2, ascending: true });
  }
}

function getFinanceSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("7_financeSettings");

  if (!sheet) {
    sheet = ss.insertSheet("7_financeSettings");
    sheet.getRange(1, 1, 1, 2).setValues([["monthKey", "budget"]]);
    sheet.getRange(1, 1, 1, 2).setFontWeight("bold");
  }

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return {};

  return values.slice(1)
    .filter(row => row[0])
    .reduce((acc, row) => {
      acc[row[0]] = Number(row[1]) || 0;
      return acc;
    }, {});
}

function saveFinanceSettings(settings) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("7_financeSettings");

  if (!sheet) {
    sheet = ss.insertSheet("7_financeSettings");
    sheet.getRange(1, 1, 1, 2).setValues([["monthKey", "budget"]]);
    sheet.getRange(1, 1, 1, 2).setFontWeight("bold");
  }

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }

  const entries = Object.entries(settings || {});
  if (entries.length > 0) {
    const rows = entries.map(([monthKey, budget]) => [monthKey, budget]);
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
}

function getFinanceCategories() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("3_financeCategories");
  
  if (!sheet) {
    sheet = ss.insertSheet("3_financeCategories");
    sheet.getRange(1, 1, 1, 3).setValues([["id", "name", "color"]]);
    sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
    
    // Add sample finance categories
    const sampleCategories = [
      [1, "Food", "#ef4444"],
      [2, "Transport", "#3b82f6"],
      [3, "Shopping", "#10b981"],
      [4, "Bills", "#f59e0b"],
      [5, "Entertainment", "#8b5cf6"],
      [6, "Salary", "#10b981"],
      [7, "Freelance", "#3b82f6"],
      [8, "Subscription", "#8b5cf6"]
    ];
    if (sampleCategories.length > 0) {
      sheet.getRange(2, 1, sampleCategories.length, 3).setValues(sampleCategories);
    }
  }

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  return values.slice(1).map(row => ({
    id: row[0],
    name: row[1],
    color: row[2] || '#3b82f6'
  }));
}

function addFinanceCategory(category) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("3_financeCategories");
  
  if (!sheet) {
    sheet = ss.insertSheet("3_financeCategories");
    sheet.getRange(1, 1, 1, 3).setValues([["id", "name", "color"]]);
    sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
  }

  let newId = 1;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    if (existingIds.length > 0) {
      newId = Math.max(...existingIds.filter(id => id !== '' && id != null)) + 1;
    }
  }
  
  sheet.appendRow([
    newId,
    category.name,
    category.color || '#3b82f6'
  ]);

  return newId;
}

function updateFinanceCategory(category) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("3_financeCategories");
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === category.id);
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex + 1, 2, 1, 2).setValues([[
      category.name,
      category.color || '#3b82f6'
    ]]);
    return true;
  }
  return false;
}

function deleteFinanceCategory(categoryId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("3_financeCategories");
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === categoryId);
  
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex + 1);
    return true;
  }
  return false;
}

function getAppData() {
  const tasks = getDatags();
  const objectives = getObjectives();
  const categories = getCategories();
  const statuses = getStatuses();
  const financeRecords = getFinanceRecords();
  const financeSettings = getFinanceSettings();
  const financeCategories = getFinanceCategories();
  const events = getEvents();
  const debts = getDebts();
  const persons = getPersons();
  const notes = getNotes();
  const recurringBills = getRecurringBills();
  const stats = getDerivedStats(tasks, financeRecords, objectives, categories, statuses, events, debts);

  return {
    tasks,
    objectives,
    persons,
    notes,
    recurringBills,
    categories,
    statuses,
    financeRecords,
    financeSettings,
    financeCategories,
    events,
    debts,
    stats
  };
}

// Events Functions
function getEvents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("8_events");
  
  if (!sheet) {
    sheet = ss.insertSheet("8_events");
    sheet.getRange(1, 1, 1, 13).setValues([[
      "id",
      "title",
      "description",
      "startDate",
      "startTime",
      "endDate",
      "endTime",
      "category",
      "color",
      "relatedTaskIds",
      "attended",
      "attendanceDate",
      "generatedTasks"
    ]]);
    sheet.getRange(1, 1, 1, 13).setFontWeight("bold");
  }

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const tz = Session.getScriptTimeZone();
  const formatDate = (value) => {
    if (!value) return '';
    if (Object.prototype.toString.call(value) === '[object Date]') {
      return Utilities.formatDate(value, tz, "yyyy-MM-dd");
    }
    return String(value);
  };
  
  const formatTime = (value) => {
    if (!value) return '';
    if (Object.prototype.toString.call(value) === '[object Date]') {
      return Utilities.formatDate(value, tz, "HH:mm:ss");
    }
    return String(value);
  };

  return values.slice(1)
    .filter(row => row.join('') !== '')
    .map(row => ({
      id: row[0],
      title: row[1] || '',
      description: row[2] || '',
      startDate: formatDate(row[3] || ''),
      startTime: formatTime(row[4] || ''),
      endDate: formatDate(row[5] || ''),
      endTime: formatTime(row[6] || ''),
      category: row[7] || '',
      color: row[8] || '#3b82f6',
      relatedTaskIds: row[9] || '',
      attended: row[10] === true || row[10] === "TRUE",
      attendanceDate: formatDate(row[11] || ''),
      generatedTasks: Number(row[12] || 0) || 0
    }));
}

function addEvent(event) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("8_events");
  
  if (!sheet) {
    sheet = ss.insertSheet("8_events");
    sheet.getRange(1, 1, 1, 9).setValues([[
      "id", "title", "description", "startDate", "startTime", "endDate", "endTime", "category", "color"
    ]]);
    sheet.getRange(1, 1, 1, 9).setFontWeight("bold");
  }

  let newId = 1;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    if (existingIds.length > 0) {
      newId = Math.max(...existingIds.filter(id => id !== '' && id != null)) + 1;
    }
  }
  
  sheet.appendRow([
    newId,
    event.title || '',
    event.description || '',
    event.startDate || '',
    event.startTime || '',
    event.endDate || '',
    event.endTime || '',
    event.category || '',
    event.color || '#3b82f6',
    event.relatedTaskIds || '',
    event.attended || false,
    event.attendanceDate || '',
    event.generatedTasks || 0
  ]);

  return newId;
}

function updateEvent(event) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("8_events");
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === event.id);
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex + 1, 2, 1, 12).setValues([[
      event.title || '',
      event.description || '',
      event.startDate || '',
      event.startTime || '',
      event.endDate || '',
      event.endTime || '',
      event.category || '',
      event.color || '#3b82f6',
      event.relatedTaskIds || '',
      event.attended || false,
      event.attendanceDate || '',
      event.generatedTasks || 0
    ]]);
    return true;
  }
  return false;
}

function deleteEvent(eventId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("8_events");
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === eventId);
  
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex + 1);
    return true;
  }
  return false;
}

// Google Calendar Integration
function createGoogleCalendarEvent(event) {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    if (!calendar) {
      return { success: false, error: 'No default calendar found' };
    }

    // Parse dates and times
    const tz = Session.getScriptTimeZone();
    let startDateTime, endDateTime;

    if (event.startDate) {
      const startDateStr = event.startDate;
      const startTimeStr = event.startTime || '00:00:00';
      const startDateTimeStr = `${startDateStr}T${startTimeStr}`;
      startDateTime = new Date(startDateTimeStr);
      
      if (event.endDate) {
        const endDateStr = event.endDate;
        const endTimeStr = event.endTime || event.startTime || '23:59:59';
        const endDateTimeStr = `${endDateStr}T${endTimeStr}`;
        endDateTime = new Date(endDateTimeStr);
      } else {
        // If no end date, use start date + 1 hour
        endDateTime = new Date(startDateTime);
        endDateTime.setHours(endDateTime.getHours() + 1);
      }
    } else {
      return { success: false, error: 'Start date is required' };
    }

    // Validate dates
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return { success: false, error: 'Invalid date format' };
    }

    // Create calendar event
    const calendarEvent = calendar.createEvent(
      event.title || 'Untitled Event',
      startDateTime,
      endDateTime,
      {
        description: event.description || '',
        location: event.category || ''
      }
    );

    // Set event color if provided (Google Calendar uses color IDs)
    if (event.color) {
      try {
        // Map hex colors to Google Calendar color IDs (1-11)
        const colorMap = {
          '#3b82f6': '9',  // Blue
          '#10b981': '10', // Green
          '#ef4444': '11', // Red
          '#f59e0b': '5',  // Orange
          '#8b5cf6': '3',  // Purple
          '#ec4899': '6'   // Pink
        };
        const colorId = colorMap[event.color] || '9';
        calendarEvent.setColor(colorId);
      } catch (e) {
        // Color setting is optional, continue if it fails
        console.log('Could not set event color:', e);
      }
    }

    return {
      success: true,
      eventId: calendarEvent.getId(),
      calendarLink: ''
    };
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Debt Functions
function getDebts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("9_debts");
  
  if (!sheet) {
    sheet = ss.insertSheet("9_debts");
    sheet.getRange(1, 1, 1, 10).setValues([[
      "id",
      "person",
      "amount",
      "direction",
      "description",
      "date",
      "status",
      "relatedTaskId",
      "resolvedByTaskId",
      "resolvedDate"
    ]]);
    sheet.getRange(1, 1, 1, 10).setFontWeight("bold");
  }

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const tz = Session.getScriptTimeZone();
  const formatDate = (value) => {
    if (!value) return '';
    if (Object.prototype.toString.call(value) === '[object Date]') {
      return Utilities.formatDate(value, tz, "yyyy-MM-dd");
    }
    return String(value);
  };

  return values.slice(1)
    .filter(row => row.join('') !== '')
    .map(row => ({
      id: row[0],
      person: row[1] || '',
      amount: Number(row[2]) || 0,
      direction: row[3] || 'owed', // 'owed' = they owe me, 'owe' = I owe them
      description: row[4] || '',
      date: formatDate(row[5] || ''),
      status: row[6] || 'pending', // 'pending', 'paid', 'cancelled'
      relatedTaskId: row[7] || null,
      resolvedByTaskId: row[8] || '',
      resolvedDate: formatDate(row[9] || '')
    }));
}

function addDebt(debt) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("9_debts");
  
  if (!sheet) {
    sheet = ss.insertSheet("9_debts");
    sheet.getRange(1, 1, 1, 8).setValues([[
      "id", "person", "amount", "direction", "description", "date", "status", "relatedTaskId"
    ]]);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold");
  }

  let newId = 1;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    if (existingIds.length > 0) {
      newId = Math.max(...existingIds.filter(id => id !== '' && id != null)) + 1;
    }
  }
  
  sheet.appendRow([
    newId,
    debt.person || '',
    debt.amount || 0,
    debt.direction || 'owed',
    debt.description || '',
    debt.date || '',
    debt.status || 'pending',
    debt.relatedTaskId || '',
    debt.resolvedByTaskId || '',
    debt.resolvedDate || ''
  ]);

  return newId;
}

function updateDebt(debt) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("9_debts");
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === debt.id);
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex + 1, 2, 1, 9).setValues([[
      debt.person || '',
      debt.amount || 0,
      debt.direction || 'owed',
      debt.description || '',
      debt.date || '',
      debt.status || 'pending',
      debt.relatedTaskId || '',
      debt.resolvedByTaskId || '',
      debt.resolvedDate || ''
    ]]);
    return true;
  }
  return false;
}

// Persons Functions
function getPersons() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("11_persons");
  
  if (!sheet) {
    sheet = ss.insertSheet("11_persons");
    sheet.getRange(1, 1, 1, 2).setValues([["id", "name"]]);
    sheet.getRange(1, 1, 1, 2).setFontWeight("bold");
    return [];
  }

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  return values.slice(1)
    .filter(row => row.join('') !== '')
    .map(row => ({
      id: row[0],
      name: row[1] || ''
    }));
}

function addPerson(person) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("11_persons");
  
  if (!sheet) {
    sheet = ss.insertSheet("11_persons");
    sheet.getRange(1, 1, 1, 2).setValues([["id", "name"]]);
    sheet.getRange(1, 1, 1, 2).setFontWeight("bold");
  }

  let newId = 1;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    if (existingIds.length > 0) {
      newId = Math.max(...existingIds.filter(id => id !== '' && id != null)) + 1;
    }
  }
  
  sheet.appendRow([newId, person.name || '']);
  return newId;
}

function updatePerson(person) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("11_persons");
  if (!sheet) return;

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == person.id) {
      sheet.getRange(i + 1, 2).setValue(person.name || '');
      return;
    }
  }
}

function deletePerson(personId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("11_persons");
  if (!sheet) return;

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == personId) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

// Notes Functions
function ensureNotesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("10_notes");
  const headers = ["id", "title", "subject", "date", "docLink", "description"];

  if (!sheet) {
    sheet = ss.insertSheet("10_notes");
  }

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  return sheet;
}

function getNotes() {
  const sheet = ensureNotesSheet();

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  return values.slice(1)
    .filter(row => row.join('') !== '')
    .map(row => ({
      id: row[0],
      title: row[1] || '',
      subject: row[2] || '',
      date: row[3] || '',
      docLink: row[4]
        ? (String(row[4]).startsWith('http')
          ? row[4]
          : `https://docs.google.com/document/d/${row[4]}`)
        : '',
      description: row[5] || ''
    }));
}

function addNote(note) {
  const sheet = ensureNotesSheet();

  let newId = 1;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    if (existingIds.length > 0) {
      newId = Math.max(...existingIds.filter(id => id !== '' && id != null)) + 1;
    }
  }

  sheet.appendRow([
    newId,
    note.title || '',
    note.subject || '',
    note.date || '',
    note.docLink || '',
    note.description || ''
  ]);

  return { id: newId, docLink: note.docLink || '' };
}

function updateNote(note) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("10_notes");
  if (!sheet) return;

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == note.id) {
      sheet.getRange(i + 1, 2, 1, 5).setValues([[
        note.title || '',
        note.subject || '',
        note.date || '',
        note.docLink || '',
        note.description || ''
      ]]);
      return;
    }
  }
}

function deleteNote(noteId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("10_notes");
  if (!sheet) return;

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == noteId) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

// Recurring Bills Functions - now using Finance sheet
function getRecurringBills() {
  const financeRecords = getFinanceRecords();
  const tz = Session.getScriptTimeZone();
  const formatDate = (value) => {
    if (!value) return '';
    if (Object.prototype.toString.call(value) === '[object Date]') {
      return Utilities.formatDate(value, tz, "yyyy-MM-dd");
    }
    return String(value);
  };

  // Filter records that have recurring information
  return financeRecords
    .filter(record => record.recurringFrequency && record.recurringStatus)
    .map(record => ({
      id: record.id,
      name: record.note || '',
      amount: record.amount || 0,
      type: record.recurringBillType || 'bill', // 'bill' or 'subscription'
      frequency: record.recurringFrequency || 'monthly',
      nextDueDate: formatDate(record.recurringNextDueDate),
      category: record.category || '',
      status: record.recurringStatus || 'active',
      description: record.note || ''
    }));
}

function addRecurringBill(bill) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("6_finance");
  
  if (!sheet) {
    sheet = ss.insertSheet("6_finance");
    sheet.getRange(1, 1, 1, 11).setValues([[
      "id", "date", "type", "amount", "category", "note", "recurringMonthly", "recurringFrequency", "recurringNextDueDate", "recurringBillType", "recurringStatus"
    ]]);
    sheet.getRange(1, 1, 1, 11).setFontWeight("bold");
  }

  let newId = 1;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    if (existingIds.length > 0) {
      newId = Math.max(...existingIds.filter(id => id !== '' && id != null)) + 1;
    }
  }
  
  // Ensure Subscription category exists
  const categories = getFinanceCategories();
  if (!categories.find(c => c.name === 'Subscription')) {
    addFinanceCategory({ name: 'Subscription', color: '#8b5cf6' });
  }
  
  // Use Subscription as default category if not specified
  const category = bill.category || 'Subscription';
  
  sheet.appendRow([
    newId,
    bill.nextDueDate || '', // Use nextDueDate as initial date
    'expense',
    bill.amount || 0,
    category,
    bill.name || bill.description || '',
    true, // recurringMonthly
    bill.frequency || 'monthly',
    bill.nextDueDate || '',
    bill.type || 'bill',
    bill.status || 'active'
  ]);

  return newId;
}

function updateRecurringBill(bill) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("6_finance");
  if (!sheet) return;

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == bill.id) {
      // Update the finance record with recurring bill data
      sheet.getRange(i + 1, 2, 1, 11).setValues([[
        bill.nextDueDate || '', // date
        'expense', // type
        bill.amount || 0, // amount
        bill.category || 'Subscription', // category
        bill.name || bill.description || '', // note
        true, // recurringMonthly
        bill.frequency || 'monthly', // recurringFrequency
        bill.nextDueDate || '', // recurringNextDueDate
        bill.type || 'bill', // recurringBillType
        bill.status || 'active', // recurringStatus
        '' // recurringBillId - empty for recurring bill templates
      ]]);
      return;
    }
  }
}

function deleteRecurringBill(billId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("6_finance");
  if (!sheet) return;

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == billId) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

// Auto-create finance records from recurring bills
function processRecurringBills() {
  const bills = getRecurringBills();
  const today = new Date();
  const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyy-MM-dd");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let financeSheet = ss.getSheetByName("6_finance");
  
  if (!financeSheet) {
    financeSheet = ss.insertSheet("6_finance");
    financeSheet.getRange(1, 1, 1, 16).setValues([["id", "date", "type", "amount", "category", "note", "recurringMonthly", "recurringFrequency", "recurringNextDueDate", "recurringBillType", "recurringStatus", "recurringBillId", "relatedTaskId", "relatedObjective", "isValueRealization", "hoursNeeded"]]);
    financeSheet.getRange(1, 1, 1, 16).setFontWeight("bold");
  }
  
  bills.forEach(bill => {
    if (bill.status !== 'active' || !bill.nextDueDate) return;
    
    const dueDate = new Date(bill.nextDueDate);
    if (dueDate <= today) {
      // Create finance record for this payment
      const lastRow = financeSheet.getLastRow();
      let newId = 1;
      if (lastRow > 1) {
        const existingIds = financeSheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
        if (existingIds.length > 0) {
          newId = Math.max(...existingIds.filter(id => id !== '' && id != null)) + 1;
        }
      }
      
      financeSheet.appendRow([
        newId,
        todayStr,
        'expense',
        bill.amount || 0,
        bill.category || 'Subscription',
        bill.name || '',
        false, // This is a payment record, not the recurring template
        '', // No frequency for payment records
        '', // No next due date
        bill.type || 'bill', // recurringBillType - preserve subscription/bill type
        '', // No status for payment records
        bill.id, // recurringBillId - link to the source recurring bill
        '', // relatedTaskId - empty for bill payments
        '', // relatedObjective - empty for bill payments
        false, // isValueRealization - false for bill payments
        0 // hoursNeeded - 0 for bill payments
      ]);
      
      // Update next due date on the recurring bill record
      const nextDate = new Date(dueDate);
      if (bill.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (bill.frequency === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else if (bill.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      }
      
      bill.nextDueDate = Utilities.formatDate(nextDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
      updateRecurringBill(bill);
    }
  });
}

function deleteDebt(debtId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("9_debts");
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === debtId);
  
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex + 1);
    return true;
  }
  return false;
}

function getDerivedStats(tasks, financeRecords, objectives, categories, statuses, events, debts) {
  const taskTotals = tasks.reduce((acc, task) => {
    acc.total += 1;
    if (task.status === "completed") acc.completed += 1;
    if (task.status === "overdue") acc.overdue += 1;
    if (task.status === "pending") acc.pending += 1;
    return acc;
  }, { total: 0, completed: 0, overdue: 0, pending: 0 });

  const financeTotals = financeRecords.reduce((acc, record) => {
    // Skip recurring bill templates - only count actual transactions
    // Recurring bill templates have recurringFrequency and recurringStatus but no recurringBillId
    // Payment transactions from recurring bills have recurringBillId set
    if (record.recurringFrequency && record.recurringStatus && !record.recurringBillId) {
      return acc; // Skip recurring bill template records
    }

    const amount = Number(record.amount) || 0;
    if (record.type === "income") {
      acc.income += amount;
    } else {
      acc.expenses += amount;
      // Track subscription spending separately
      if (record.recurringBillType === 'subscription') {
        acc.subscriptions = (acc.subscriptions || 0) + amount;
      }
    }
    acc.net = acc.income - acc.expenses;
    return acc;
  }, { income: 0, expenses: 0, net: 0, subscriptions: 0 });

  const debtTotals = debts.reduce((acc, debt) => {
    if (debt.status === 'pending') {
      if (debt.direction === 'owed') {
        acc.owedToMe += debt.amount;
      } else {
        acc.iOwe += debt.amount;
      }
    }
    return acc;
  }, { owedToMe: 0, iOwe: 0, net: 0 });

  debtTotals.net = debtTotals.owedToMe - debtTotals.iOwe;

  // Calculate objective health scores and progress
  let objectivesStats = { total: 0, onTrack: 0, atRisk: 0, completed: 0, totalValue: 0, totalSpending: 0, averageProgress: 0, averageHealthScore: 0 };
  try {
    objectivesStats = calculateObjectivesStats(tasks, financeRecords, objectives);
  } catch (error) {
    console.error('Error calculating objectives stats:', error);
  }

  // Calculate category performance analytics
  let categoriesStats = {};
  try {
    categoriesStats = calculateCategoriesStats(tasks, financeRecords, categories);
  } catch (error) {
    console.error('Error calculating categories stats:', error);
  }

  // Calculate cross-entity relationships
  let relationshipsStats = { taskToObjective: {}, taskToFinance: { estimatedValue: 0, realizedValue: 0, accuracy: 0 }, debtToTask: { resolvedCount: 0, resolvedAmount: 0, pendingCount: 0 }, eventToTask: { conversionRate: 0, tasksGenerated: 0 } };
  try {
    relationshipsStats = calculateRelationshipsStats(tasks, financeRecords, objectives, events, debts);
  } catch (error) {
    console.error('Error calculating relationships stats:', error);
  }

  // Generate actionable insights
  let insights = [];
  try {
    insights = generateInsights(objectivesStats, categoriesStats, relationshipsStats, tasks, financeRecords);
  } catch (error) {
    console.error('Error generating insights:', error);
  }

  return {
    tasks: taskTotals,
    finance: financeTotals,
    debts: debtTotals,
    events: { total: events.length },
    objectives: objectivesStats,
    categories: categoriesStats,
    relationships: relationshipsStats,
    insights: insights,
    reference: {
      objectives: objectives.length,
      categories: categories.length,
      statuses: statuses.length
    }
  };
}

function calculateObjectivesStats(tasks, financeRecords, objectives) {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const objectiveStats = {
    total: objectives.length,
    onTrack: 0,
    atRisk: 0,
    completed: 0,
    totalValue: 0,
    totalSpending: 0,
    averageProgress: 0,
    averageHealthScore: 0
  };

  // Get current month's finance records
  const monthRecords = financeRecords.filter(record => {
    if (!record.date) return false;
    const recordDate = new Date(record.date);
    return recordDate.getFullYear() === currentMonth.getFullYear() && 
           recordDate.getMonth() === currentMonth.getMonth();
  });

  const objectivesWithProgress = objectives.map(objective => {
    // Auto-sync budget/targetValue from current month's finance record if relatedFinanceName is set
    // This ensures objectives always reflect the current month's finance data
    let budget = objective.budget || 0;
    let targetValue = objective.targetValue || 0;
    
    if (objective.relatedFinanceId) {
      const financeRecord = monthRecords.find(r => r.id === objective.relatedFinanceId);
      if (financeRecord) {
        budget = Number(financeRecord.amount) || 0;
        targetValue = Number(financeRecord.amount) || 0;
      }
    }
    
    // Get tasks for this objective (using ID)
    const objectiveTasks = tasks.filter(task => task.objectiveId === objective.id);
    const totalTasks = objectiveTasks.length;
    const completedTasks = objectiveTasks.filter(task => task.status === 'completed').length;
    const overdueTasks = objectiveTasks.filter(task => task.status === 'overdue').length;

    // Calculate progress percentage
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate value delivered from completed tasks
    const completedTaskValue = objectiveTasks
      .filter(task => task.status === 'completed')
      .reduce((sum, task) => sum + (Number(task.estimatedValue) || 0), 0);

    // Calculate spending related to this objective (tasks with this objective)
    const objectiveSpending = financeRecords
      .filter(record => record.type === 'expense' && objectiveTasks.some(task => task.id == record.relatedTaskId))
      .reduce((sum, record) => sum + (Number(record.amount) || 0), 0);

    // Calculate health score (0-100)
    let healthScore = 50; // Base score

    // Progress factor (0-40 points)
    healthScore += Math.min(progressPercent, 40);

    // Overdue penalty (-30 points max)
    const overduePenalty = Math.min(overdueTasks * 10, 30);
    healthScore -= overduePenalty;

    // Deadline proximity factor
    if (objective.dueDate) {
      const dueDate = new Date(objective.dueDate);
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntilDue < 0) {
        // Overdue
        healthScore -= 20;
      } else if (daysUntilDue <= 7) {
        // Due soon - bonus for urgency
        healthScore += Math.max(0, 10 - (daysUntilDue / 2));
      } else if (daysUntilDue <= 30) {
        // Medium term - slight bonus
        healthScore += 5;
      }
    }

    // Task completion rate bonus
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
    healthScore += Math.round(completionRate * 10);

    // Clamp between 0-100
    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

    // Determine status
    let status = 'pending';
    if (progressPercent >= 100) {
      status = 'completed';
      objectiveStats.completed++;
    } else if (healthScore < 40 || overdueTasks > 2) {
      status = 'atRisk';
      objectiveStats.atRisk++;
    } else {
      status = 'onTrack';
      objectiveStats.onTrack++;
    }

    return {
      ...objective,
      budget: budget, // Use synced budget
      targetValue: targetValue, // Use synced targetValue
      totalTasks,
      completedTasks,
      overdueTasks,
      progressPercent,
      completedTaskValue,
      spending: objectiveSpending,
      healthScore,
      status,
      daysUntilDue: objective.dueDate ? Math.ceil((new Date(objective.dueDate) - now) / (1000 * 60 * 60 * 24)) : null
    };
  });

  // Calculate aggregate stats
  const totalProgress = objectivesWithProgress.reduce((sum, obj) => sum + obj.progressPercent, 0);
  objectiveStats.averageProgress = objectives.length > 0 ? Math.round(totalProgress / objectives.length) : 0;

  const totalHealthScore = objectivesWithProgress.reduce((sum, obj) => sum + obj.healthScore, 0);
  objectiveStats.averageHealthScore = objectives.length > 0 ? Math.round(totalHealthScore / objectives.length) : 0;

  objectiveStats.totalValue = objectivesWithProgress.reduce((sum, obj) => sum + obj.completedTaskValue, 0);
  objectiveStats.totalSpending = objectivesWithProgress.reduce((sum, obj) => sum + obj.spending, 0);

  return objectiveStats;
}

function calculateCategoriesStats(tasks, financeRecords, categories) {
  const categoriesStats = {};

  categories.forEach(category => {
    const categoryTasks = tasks.filter(task => task.category === category.name);
    const completedTasks = categoryTasks.filter(task => task.status === 'completed');
    const overdueTasks = categoryTasks.filter(task => task.status === 'overdue');

    // Calculate completion rate
    const completionRate = categoryTasks.length > 0 ?
      Math.round((completedTasks.length / categoryTasks.length) * 100) : 0;

    // Calculate total value from completed tasks
    const totalValue = completedTasks.reduce((sum, task) => sum + (Number(task.estimatedValue) || 0), 0);

    // Calculate spending in this category
    const categoryFinance = financeRecords.filter(record => record.category === category.name && record.type === 'expense');
    const totalSpending = categoryFinance.reduce((sum, record) => sum + (Number(record.amount) || 0), 0);

    // Calculate ROI (Value delivered vs spending)
    const roi = totalSpending > 0 ? Math.round((totalValue / totalSpending) * 100) / 100 : (totalValue > 0 ? '∞' : 0);

    // Calculate average duration for completed tasks
    const durations = completedTasks.map(task => {
      if (task.startDate && task.endDate) {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      }
      return 0;
    }).filter(d => d > 0);

    const averageDuration = durations.length > 0 ?
      Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length) : 0;

    categoriesStats[category.name] = {
      taskCount: categoryTasks.length,
      completedCount: completedTasks.length,
      overdueCount: overdueTasks.length,
      completionRate,
      totalValue,
      totalSpending,
      roi,
      averageDuration,
      color: category.color
    };
  });

  return categoriesStats;
}

function calculateRelationshipsStats(tasks, financeRecords, objectives, events, debts) {
  // Task to Objective relationships
  const taskToObjective = {};
  objectives.forEach(objective => {
    const objectiveTasks = tasks.filter(task => task.objectiveId === objective.id);
    const completedTasks = objectiveTasks.filter(task => task.status === 'completed');
    const totalValue = completedTasks.reduce((sum, task) => sum + (Number(task.estimatedValue) || 0), 0);

    taskToObjective[objective.id] = {
      taskCount: objectiveTasks.length,
      completedCount: completedTasks.length,
      totalValue
    };
  });

  // Task to Finance relationships (estimated vs actual value)
  const estimatedValue = tasks.reduce((sum, task) => sum + (Number(task.estimatedValue) || 0), 0);
  const realizedValue = financeRecords
    .filter(record => record.isValueRealization)
    .reduce((sum, record) => sum + (Number(record.amount) || 0), 0);
  const valueAccuracy = estimatedValue > 0 ? Math.round((realizedValue / estimatedValue) * 100) : 0;

  // Debt to Task relationships
  const resolvedDebts = debts.filter(debt => debt.status === 'paid' && debt.resolvedByTaskId);
  const resolvedAmount = resolvedDebts.reduce((sum, debt) => sum + (Number(debt.amount) || 0), 0);
  const pendingDebts = debts.filter(debt => debt.status === 'pending');

  // Event to Task relationships
  const eventsWithTasks = events.filter(event => event.relatedTaskIds && event.relatedTaskIds.trim() !== '');
  const totalTasksFromEvents = eventsWithTasks.reduce((sum, event) => {
    return sum + (event.relatedTaskIds ? event.relatedTaskIds.split(',').length : 0);
  }, 0);
  const eventConversionRate = events.length > 0 ? Math.round((eventsWithTasks.length / events.length) * 100) : 0;

  return {
    taskToObjective,
    taskToFinance: {
      estimatedValue,
      realizedValue,
      accuracy: valueAccuracy
    },
    debtToTask: {
      resolvedCount: resolvedDebts.length,
      resolvedAmount,
      pendingCount: pendingDebts.length
    },
    eventToTask: {
      conversionRate: eventConversionRate,
      tasksGenerated: totalTasksFromEvents
    }
  };
}

function generateInsights(objectivesStats, categoriesStats, relationshipsStats, tasks, financeRecords) {
  const insights = [];

  // Objective risk insights
  if (objectivesStats.atRisk > 0) {
    insights.push({
      type: 'objective_risk',
      message: `${objectivesStats.atRisk} objective${objectivesStats.atRisk > 1 ? 's' : ''} at risk - review overdue tasks`,
      severity: 'high',
      action: 'Review objectives with overdue tasks'
    });
  }

  // High ROI category insights
  const highRoiCategories = Object.entries(categoriesStats)
    .filter(([name, stats]) => typeof stats.roi === 'number' && stats.roi > 2)
    .sort((a, b) => b[1].roi - a[1].roi)
    .slice(0, 2);

  highRoiCategories.forEach(([category, stats]) => {
    insights.push({
      type: 'high_roi',
      message: `${category}: ${stats.roi}x ROI - consider investing more time`,
      severity: 'info',
      category,
      action: `Focus on ${category} category for higher returns`
    });
  });

  // Value delivery insights
  if (relationshipsStats.taskToFinance.estimatedValue > 0) {
    const valueMessage = relationshipsStats.taskToFinance.realizedValue > 0
      ? `Tasks delivered $${relationshipsStats.taskToFinance.estimatedValue} estimated value`
      : `Tasks have $${relationshipsStats.taskToFinance.estimatedValue} potential value - track actual delivery`;

    insights.push({
      type: 'value_delivery',
      message: valueMessage,
      severity: 'info',
      action: 'Monitor task value realization'
    });
  }

  // Debt resolution insights
  if (relationshipsStats.debtToTask.resolvedCount > 0) {
    insights.push({
      type: 'debt_resolution',
      message: `${relationshipsStats.debtToTask.resolvedCount} debts resolved through task completion ($${relationshipsStats.debtToTask.resolvedAmount})`,
      severity: 'success',
      action: 'Continue tracking debt resolution through tasks'
    });
  }

  // Low completion rate insights
  const lowCompletionCategories = Object.entries(categoriesStats)
    .filter(([name, stats]) => stats.taskCount > 5 && stats.completionRate < 50)
    .sort((a, b) => a[1].completionRate - b[1].completionRate);

  lowCompletionCategories.forEach(([category, stats]) => {
    insights.push({
      type: 'low_completion',
      message: `${category}: ${stats.completionRate}% completion rate - ${stats.overdueCount} overdue tasks`,
      severity: 'warning',
      category,
      action: `Review and reprioritize ${category} tasks`
    });
  });

  // Predictive Analytics Insights
  const predictiveInsights = generatePredictiveInsights(tasks, objectivesStats, categoriesStats);
  insights.push(...predictiveInsights);

  return insights;
}

function generatePredictiveInsights(tasks, objectivesStats, categoriesStats) {
  const insights = [];
  const now = new Date();

  // Calculate overall task completion velocity (tasks per week)
  const completedTasks = tasks.filter(task => task.status === 'completed' && task.endDate);
  const recentCompletedTasks = completedTasks.filter(task => {
    const completionDate = new Date(task.endDate);
    const daysSince = (now - completionDate) / (1000 * 60 * 60 * 24);
    return daysSince <= 30; // Last 30 days
  });

  const velocity = recentCompletedTasks.length / 4.3; // Tasks per week (30/7 ≈ 4.3)

  // Forecast value delivery
  const pendingTasks = tasks.filter(task => task.status !== 'completed');
  const forecastedValue = pendingTasks.reduce((sum, task) => sum + (Number(task.estimatedValue) || 0), 0);

  if (forecastedValue > 0) {
    const weeksToComplete = pendingTasks.length / Math.max(velocity, 0.1);
    insights.push({
      type: 'predictive',
      message: `$${forecastedValue} potential value in pipeline - ${weeksToComplete.toFixed(1)} weeks at current velocity`,
      severity: 'info',
      action: 'Monitor task completion velocity'
    });
  }

  // Objective completion forecasts
  const objectives = getObjectives();
  objectives.forEach(objective => {
    const objectiveTasks = tasks.filter(task => task.objectiveId === objective.id);
    const totalTasks = objectiveTasks.length;
    const completedTasks = objectiveTasks.filter(task => task.status === 'completed').length;

    if (totalTasks > 0 && objective.dueDate) {
      const progressPercent = (completedTasks / totalTasks) * 100;
      const remainingTasks = totalTasks - completedTasks;

      if (remainingTasks > 0) {
        const weeksRemaining = remainingTasks / Math.max(velocity, 0.1);
        const dueDate = new Date(objective.dueDate);
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

        if (daysUntilDue > 0) {
          const weeksUntilDue = daysUntilDue / 7;
          const isOnTrack = weeksRemaining <= weeksUntilDue;

          if (!isOnTrack) {
            insights.push({
              type: 'predictive',
              message: `${objective.name}: ${weeksRemaining.toFixed(1)} weeks needed vs ${weeksUntilDue.toFixed(1)} weeks available`,
              severity: 'warning',
              action: `Review ${objective.name} timeline`
            });
          } else {
            const confidence = Math.min(95, Math.max(50, progressPercent + (weeksUntilDue - weeksRemaining) * 10));
            insights.push({
              type: 'predictive',
              message: `${objective.name}: ${confidence.toFixed(0)}% chance of completion on time`,
              severity: 'info',
              action: `Monitor ${objective.name} progress`
            });
          }
        }
      }
    }
  });

  // Category velocity insights
  Object.entries(categoriesStats).forEach(([categoryName, stats]) => {
    if (stats.taskCount > 10) {
      const categoryVelocity = (stats.completedCount / stats.taskCount) * velocity;

      if (categoryVelocity < velocity * 0.5) {
        insights.push({
          type: 'predictive',
          message: `${categoryName}: Slower completion velocity than average - review blockers`,
          severity: 'warning',
          category: categoryName,
          action: `Analyze ${categoryName} task completion patterns`
        });
      } else if (categoryVelocity > velocity * 1.5) {
        insights.push({
          type: 'predictive',
          message: `${categoryName}: High completion velocity - consider adding more tasks`,
          severity: 'success',
          category: categoryName,
          action: `Capitalize on ${categoryName} momentum`
        });
      }
    }
  });

  // Risk alerts for overdue tasks approaching deadlines
  const overdueTasks = tasks.filter(task => task.status === 'overdue');
  const highPriorityOverdue = overdueTasks.filter(task => task.priority === 'high');

  if (highPriorityOverdue.length > 0) {
    insights.push({
      type: 'predictive',
      message: `${highPriorityOverdue.length} high-priority overdue tasks - immediate attention needed`,
      severity: 'high',
      action: 'Address high-priority overdue tasks'
    });
  }

  return insights;
}
