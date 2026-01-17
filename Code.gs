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
  const sheet = ss.getSheetByName("Data");
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

 
  const sampleData = [
    {
      id: 1,
      task: "Thank you for using this product",
      category: "Work",
      startDate: "2025-11-22",
      startTime: "17:00:00",
      dueDate: "2025-11-24",
      dueTime: "19:00:00",
      color: "#5470c6",
      status: "completed",
      priority: "medium"
    },
    {
      id: 2,
      task: "Create new tasks then delete Sample tasks",
      category: "Health",
      startDate: "2025-11-25",
      startTime: "10:00:00",
      dueDate: "2025-11-29",
      dueTime: "13:00:00",
      color: "#73c0de",
      status: "completed",
      priority: "high"
    },
    {
      id: 3,
      task: "Match Sheet TimeZone with your Computer",
      category: "Learning",
      startDate: "2025-10-30",
      startTime: "09:00:00",
      dueDate: "2025-11-02",
      dueTime: "12:00:00",
      color: "#91cc75",
      status: "pending",
      priority: "low"
    }
  ];


  if (values.length <= 1 || values.slice(1).every(row => row.join('') === '')) {
    return sampleData.map(item => {
      const startDateTime = makeDateTimeFromStrings(item.startDate, item.startTime);
      const dueDateTime = makeDateTimeFromStrings(item.dueDate, item.dueTime);
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
      dueDate: formatDateTime(row[5], "date"),
      dueTime: formatDateTime(row[6], "time"),
      color: row[7],
      status: newStatus,
      objective: row[9] || '', // Add objective from column 10 (index 9)
      priority: row[10] || 'medium'
    };
    return addDerivedFields(task, startDateTime, dueDateTime, newStatus);
  });
}





function addDatags(taskbase) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
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
      item.startTime,
      item.dueDate,
      item.dueTime,
      item.color,
      item.status,
      item.objective || '', // Add objective column
      item.priority || 'medium'
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
  let sheet = ss.getSheetByName("Objectives");
  
  if (!sheet) {
    // Create Objectives sheet if it doesn't exist
    sheet = ss.insertSheet("Objectives");
    sheet.getRange(1, 1, 1, 6).setValues([["id", "name", "description", "color", "category", "dueDate"]]);
    sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
    
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
    dueDate: formatDate(row[5])
  }));
}

function addObjective(objective) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Objectives");
  
  if (!sheet) {
    sheet = ss.insertSheet("Objectives");
    sheet.getRange(1, 1, 1, 6).setValues([["id", "name", "description", "color", "category", "dueDate"]]);
    sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
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
    objective.name,
    objective.description || '',
    objective.color || '#3b82f6',
    objective.category || '',
    objective.dueDate || ''
  ]);

  return newId;
}

function updateObjective(objective) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Objectives");
  if (!sheet) return false;

  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === objective.id);
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex + 1, 2, 1, 5).setValues([[
      objective.name,
      objective.description || '',
      objective.color || '#3b82f6',
      objective.category || '',
      objective.dueDate || ''
    ]]);
    return true;
  }
  return false;
}

// Categories Functions
function getCategories() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Categories");
  
  if (!sheet) {
    // Create Categories sheet if it doesn't exist
    sheet = ss.insertSheet("Categories");
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
  let sheet = ss.getSheetByName("Categories");
  
  if (!sheet) {
    sheet = ss.insertSheet("Categories");
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
  const sheet = ss.getSheetByName("Categories");
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
  const sheet = ss.getSheetByName("Categories");
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
  let sheet = ss.getSheetByName("Statuses");
  
  if (!sheet) {
    // Create Statuses sheet if it doesn't exist
    sheet = ss.insertSheet("Statuses");
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
  let sheet = ss.getSheetByName("Statuses");
  
  if (!sheet) {
    sheet = ss.insertSheet("Statuses");
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
  const sheet = ss.getSheetByName("Statuses");
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
  const sheet = ss.getSheetByName("Statuses");
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
  const sheet = ss.getSheetByName("Objectives");
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
  let sheet = ss.getSheetByName("Finance");

  if (!sheet) {
    sheet = ss.insertSheet("Finance");
    sheet.getRange(1, 1, 1, 7).setValues([[
      "id",
      "date",
      "type",
      "amount",
      "category",
      "note",
      "recurringMonthly"
    ]]);
    sheet.getRange(1, 1, 1, 7).setFontWeight("bold");
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
      date: formatDate(row[1]),
      type: row[2] || "expense",
      amount: Number(row[3]) || 0,
      category: row[4] || "",
      note: row[5] || "",
      recurringMonthly: row[6] === true || row[6] === "TRUE"
    }));
}

function saveFinanceRecords(records) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Finance");

  if (!sheet) {
    sheet = ss.insertSheet("Finance");
    sheet.getRange(1, 1, 1, 7).setValues([[
      "id",
      "date",
      "type",
      "amount",
      "category",
      "note",
      "recurringMonthly"
    ]]);
    sheet.getRange(1, 1, 1, 7).setFontWeight("bold");
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
      record.recurringMonthly ? true : false
    ]);
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .sort({ column: 2, ascending: true });
  }
}

function getFinanceSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("FinanceSettings");

  if (!sheet) {
    sheet = ss.insertSheet("FinanceSettings");
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
  let sheet = ss.getSheetByName("FinanceSettings");

  if (!sheet) {
    sheet = ss.insertSheet("FinanceSettings");
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

function getAppData() {
  const tasks = getDatags();
  const objectives = getObjectives();
  const categories = getCategories();
  const statuses = getStatuses();
  const financeRecords = getFinanceRecords();
  const financeSettings = getFinanceSettings();
  const stats = getDerivedStats(tasks, financeRecords, objectives, categories, statuses);

  return {
    tasks,
    objectives,
    categories,
    statuses,
    financeRecords,
    financeSettings,
    stats
  };
}

function getDerivedStats(tasks, financeRecords, objectives, categories, statuses) {
  const taskTotals = tasks.reduce((acc, task) => {
    acc.total += 1;
    if (task.status === "completed") acc.completed += 1;
    if (task.status === "overdue") acc.overdue += 1;
    if (task.status === "pending") acc.pending += 1;
    return acc;
  }, { total: 0, completed: 0, overdue: 0, pending: 0 });

  const financeTotals = financeRecords.reduce((acc, record) => {
    const amount = Number(record.amount) || 0;
    if (record.type === "income") acc.income += amount;
    else acc.expenses += amount;
    acc.net = acc.income - acc.expenses;
    return acc;
  }, { income: 0, expenses: 0, net: 0 });

  return {
    tasks: taskTotals,
    finance: financeTotals,
    reference: {
      objectives: objectives.length,
      categories: categories.length,
      statuses: statuses.length
    }
  };
}
