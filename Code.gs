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
      status: "completed"
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
      status: "completed"
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
      status: "pending"
    }
  ];


  if (values.length <= 1 || values.slice(1).every(row => row.join('') === '')) {
    return sampleData;
  }

  
  return values.slice(1).map(row => {
    const dueDateTime = makeDateTime(row[5], row[6]);

    let newStatus = row[8];
    if (newStatus !== "completed" && dueDateTime) {
      if (dueDateTime < now) {
        newStatus = "overdue";
      } else {
        newStatus = "pending";
      }
    }

    return {
      id: row[0],
      task: row[1],
      category: row[2],
      startDate: formatDateTime(row[3], "date"),
      startTime: formatDateTime(row[4], "time"),
      dueDate: formatDateTime(row[5], "date"),
      dueTime: formatDateTime(row[6], "time"),
      color: row[7],
      status: newStatus,
      objective: row[9] || '' // Add objective from column 10 (index 9)
    };
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
    sheet.getRange(1, 1, 1, 5).setValues([["id", "name", "description", "color", "category"]]);
    sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
    
    // Add sample objectives
    const sampleObjectives = [
      [1, "Work", "Work-related objectives", "#3b82f6"],
      [2, "Personal", "Personal development goals", "#10b981"],
      [3, "Health", "Health and fitness goals", "#ef4444"]
    ];
    if (sampleObjectives.length > 0) {
      sheet.getRange(2, 1, sampleObjectives.length, 4).setValues(sampleObjectives);
    }
  }

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  return values.slice(1).map(row => ({
    id: row[0],
    name: row[1],
    description: row[2] || '',
    color: row[3] || '#3b82f6',
    category: row[4] || '' // Add category field
  }));
}

function addObjective(objective) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Objectives");
  
  if (!sheet) {
    sheet = ss.insertSheet("Objectives");
    sheet.getRange(1, 1, 1, 5).setValues([["id", "name", "description", "color", "category"]]);
    sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
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
    objective.category || ''
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
    sheet.getRange(rowIndex + 1, 2, 1, 4).setValues([[
      objective.name,
      objective.description || '',
      objective.color || '#3b82f6',
      objective.category || ''
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
