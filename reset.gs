/**
 * Reset Script - Deletes all sheets and recreates them with correct structure
 * 
 * WARNING: This will delete ALL data in the following sheets:
 * - Data
 * - Objectives
 * - Categories
 * - Statuses
 * 
 * Run this function to reset your entire FlowTrack structure.
 */
function resetAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Delete existing sheets if they exist
  const sheetNames = ['Data', 'Objectives', 'Categories', 'Statuses'];
  
  sheetNames.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      ss.deleteSheet(sheet);
    }
  });
  
  // Create Data sheet
  const dataSheet = ss.insertSheet('Data');
  dataSheet.getRange(1, 1, 1, 10).setValues([[
    'id', 
    'task', 
    'category', 
    'startDate', 
    'startTime', 
    'dueDate', 
    'dueTime', 
    'color', 
    'status', 
    'objective'
  ]]);
  dataSheet.getRange(1, 1, 1, 10).setFontWeight('bold');
  dataSheet.setColumnWidth(1, 50);  // id
  dataSheet.setColumnWidth(2, 200); // task
  dataSheet.setColumnWidth(3, 100); // category
  dataSheet.setColumnWidth(4, 100); // startDate
  dataSheet.setColumnWidth(5, 100); // startTime
  dataSheet.setColumnWidth(6, 100); // dueDate
  dataSheet.setColumnWidth(7, 100); // dueTime
  dataSheet.setColumnWidth(8, 80);  // color
  dataSheet.setColumnWidth(9, 100); // status
  dataSheet.setColumnWidth(10, 100); // objective
  
  // Create Objectives sheet
  const objectivesSheet = ss.insertSheet('Objectives');
  objectivesSheet.getRange(1, 1, 1, 6).setValues([[
    'id', 
    'name', 
    'description', 
    'color', 
    'category',
    'dueDate'
  ]]);
  objectivesSheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  objectivesSheet.setColumnWidth(1, 50);  // id
  objectivesSheet.setColumnWidth(2, 150); // name
  objectivesSheet.setColumnWidth(3, 250); // description
  objectivesSheet.setColumnWidth(4, 80);  // color
  objectivesSheet.setColumnWidth(5, 100); // category
  objectivesSheet.setColumnWidth(6, 120); // dueDate
  
  // Add sample objectives
  const sampleObjectives = [
    [1, 'Work', 'Work-related objectives', '#3b82f6', '', ''],
    [2, 'Personal', 'Personal development goals', '#10b981', '', ''],
    [3, 'Health', 'Health and fitness goals', '#ef4444', '', '']
  ];
  if (sampleObjectives.length > 0) {
    objectivesSheet.getRange(2, 1, sampleObjectives.length, 6).setValues(sampleObjectives);
  }
  
  // Create Categories sheet
  const categoriesSheet = ss.insertSheet('Categories');
  categoriesSheet.getRange(1, 1, 1, 3).setValues([[
    'id', 
    'name', 
    'color'
  ]]);
  categoriesSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  categoriesSheet.setColumnWidth(1, 50);  // id
  categoriesSheet.setColumnWidth(2, 150); // name
  categoriesSheet.setColumnWidth(3, 80);  // color
  
  // Add sample categories
  const sampleCategories = [
    [1, 'Work', '#3b82f6'],
    [2, 'Personal', '#10b981'],
    [3, 'Health', '#ef4444'],
    [4, 'Learning', '#f59e0b']
  ];
  if (sampleCategories.length > 0) {
    categoriesSheet.getRange(2, 1, sampleCategories.length, 3).setValues(sampleCategories);
  }
  
  // Create Statuses sheet
  const statusesSheet = ss.insertSheet('Statuses');
  statusesSheet.getRange(1, 1, 1, 3).setValues([[
    'id', 
    'name', 
    'color'
  ]]);
  statusesSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  statusesSheet.setColumnWidth(1, 50);  // id
  statusesSheet.setColumnWidth(2, 150); // name
  statusesSheet.setColumnWidth(3, 80);  // color
  
  // Add sample statuses
  const sampleStatuses = [
    [1, 'pending', '#3b82f6'],
    [2, 'completed', '#10b981'],
    [3, 'overdue', '#ef4444'],
    [4, 'in-progress', '#f59e0b']
  ];
  if (sampleStatuses.length > 0) {
    statusesSheet.getRange(2, 1, sampleStatuses.length, 3).setValues(sampleStatuses);
  }
  
  // Freeze header rows
  dataSheet.setFrozenRows(1);
  objectivesSheet.setFrozenRows(1);
  categoriesSheet.setFrozenRows(1);
  statusesSheet.setFrozenRows(1);
  
  Logger.log('All sheets have been reset and recreated successfully!');
  return 'Reset complete! All sheets have been recreated with correct structure.';
}

/**
 * Quick reset - Just recreates sheets without deleting (if sheets don't exist)
 * Use this if you want to ensure sheets exist without losing data
 */
function ensureSheetsExist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Ensure Data sheet exists
  let dataSheet = ss.getSheetByName('Data');
  if (!dataSheet) {
    dataSheet = ss.insertSheet('Data');
    dataSheet.getRange(1, 1, 1, 10).setValues([[
      'id', 'task', 'category', 'startDate', 'startTime', 'dueDate', 'dueTime', 'color', 'status', 'objective'
    ]]);
    dataSheet.getRange(1, 1, 1, 10).setFontWeight('bold');
  }
  
  // Ensure Objectives sheet exists
  let objectivesSheet = ss.getSheetByName('Objectives');
  if (!objectivesSheet) {
    objectivesSheet = ss.insertSheet('Objectives');
    objectivesSheet.getRange(1, 1, 1, 6).setValues([[
      'id', 'name', 'description', 'color', 'category', 'dueDate'
    ]]);
    objectivesSheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }
  
  // Ensure Categories sheet exists
  let categoriesSheet = ss.getSheetByName('Categories');
  if (!categoriesSheet) {
    categoriesSheet = ss.insertSheet('Categories');
    categoriesSheet.getRange(1, 1, 1, 3).setValues([[
      'id', 'name', 'color'
    ]]);
    categoriesSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  }
  
  // Ensure Statuses sheet exists
  let statusesSheet = ss.getSheetByName('Statuses');
  if (!statusesSheet) {
    statusesSheet = ss.insertSheet('Statuses');
    statusesSheet.getRange(1, 1, 1, 3).setValues([[
      'id', 'name', 'color'
    ]]);
    statusesSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  }
  
  Logger.log('All required sheets exist!');
  return 'All sheets verified!';
}
