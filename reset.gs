/**
 * Reset Script - Deletes all sheets and recreates them with correct structure
 * 
 * WARNING: This will delete ALL data in the following sheets:
 * - Tasks
 * - Objectives
 * - Categories
 * - Statuses
 * - Finance
 * - FinanceSettings
 * 
 * Run this function to reset your entire FlowTrack structure.
 */
function resetAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Delete all existing sheets except "default"
  const allSheets = ss.getSheets();
  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (sheetName !== 'default') {
      ss.deleteSheet(sheet);
    }
  });
  
  // Ensure "default" sheet exists (required by Google Sheets)
  let defaultSheet = ss.getSheetByName('default');
  if (!defaultSheet) {
    defaultSheet = ss.insertSheet('default');
    defaultSheet.getRange(1, 1).setValue('This sheet is kept because Google Sheets requires at least one sheet.');
  }
  
  // Create numbered sheets in order
  // 1_status
  const statusesSheet = ss.insertSheet('1_status');
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
  
  // 2_category
  const categoriesSheet = ss.insertSheet('2_category');
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
  
  // 3_financeCategories
  const financeCategoriesSheet = ss.insertSheet('3_financeCategories');
  financeCategoriesSheet.getRange(1, 1, 1, 3).setValues([['id', 'name', 'color']]);
  financeCategoriesSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  
  // 4_objectives
  const objectivesSheet = ss.insertSheet('4_objectives');
  objectivesSheet.getRange(1, 1, 1, 13).setValues([[
    'id', 
    'name', 
    'description', 
    'color', 
    'category',
    'dueDate',
    'budget',
    'actualSpending',
    'targetValue',
    'currentValue',
    'healthScore',
    'lastUpdated',
    'relatedFinanceId'
  ]]);
  objectivesSheet.getRange(1, 1, 1, 13).setFontWeight('bold');
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
  
  // 5_tasks
  const dataSheet = ss.insertSheet('5_tasks');
  dataSheet.getRange(1, 1, 1, 19).setValues([[
    'id',
    'task',
    'category',
    'startDate',
    'startTime',
    'endDate',
    'endTime',
    'color',
    'status',
    'objectiveId',
    'priority',
    'repeatType',
    'repeatUntil',
    'impactType',
    'estimatedValue',
    'actualValue',
    'valueRealizedDate',
    'estimatedHours',
    'isIncome'
  ]]);
  dataSheet.getRange(1, 1, 1, 19).setFontWeight('bold');
  dataSheet.setColumnWidth(1, 50);  // id
  dataSheet.setColumnWidth(2, 220); // task
  dataSheet.setColumnWidth(3, 120); // category
  dataSheet.setColumnWidth(4, 110); // startDate
  dataSheet.setColumnWidth(5, 90); // startTime
  dataSheet.setColumnWidth(6, 110); // endDate
  dataSheet.setColumnWidth(7, 90); // endTime
  dataSheet.setColumnWidth(8, 90);  // color
  dataSheet.setColumnWidth(9, 110); // status
  dataSheet.setColumnWidth(10, 140); // objectiveId
  dataSheet.setColumnWidth(11, 90); // priority
  dataSheet.setColumnWidth(12, 110); // repeatType
  dataSheet.setColumnWidth(13, 110); // repeatUntil
  dataSheet.setColumnWidth(14, 120); // impactType
  dataSheet.setColumnWidth(15, 130); // estimatedValue

  // 6_finance
  const financeSheet = ss.insertSheet('6_finance');
  financeSheet.getRange(1, 1, 1, 16).setValues([[
    'id',
    'date',
    'type',
    'amount',
    'category',
    'note',
    'recurringMonthly',
    'recurringFrequency',
    'recurringNextDueDate',
    'recurringBillType',
    'recurringStatus',
    'recurringBillId',
    'relatedTaskId',
    'relatedObjective',
    'isValueRealization',
    'hoursNeeded'
  ]]);
  financeSheet.getRange(1, 1, 1, 16).setFontWeight('bold');
  financeSheet.setColumnWidth(1, 60);
  financeSheet.setColumnWidth(2, 110);
  financeSheet.setColumnWidth(3, 90);
  financeSheet.setColumnWidth(4, 110);
  financeSheet.setColumnWidth(5, 140);
  financeSheet.setColumnWidth(6, 220);
  financeSheet.setColumnWidth(7, 140);

  // 7_financeSettings
  const financeSettingsSheet = ss.insertSheet('7_financeSettings');
  financeSettingsSheet.getRange(1, 1, 1, 2).setValues([['monthKey', 'budget']]);
  financeSettingsSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  financeSettingsSheet.setColumnWidth(1, 120);
  financeSettingsSheet.setColumnWidth(2, 120);

  // 8_events
  const eventsSheet = ss.insertSheet('8_events');
  eventsSheet.getRange(1, 1, 1, 13).setValues([[
    'id',
    'title',
    'description',
    'startDate',
    'startTime',
    'endDate',
    'endTime',
    'category',
    'color',
    'relatedTaskIds',
    'attended',
    'attendanceDate',
    'generatedTasks'
  ]]);
  eventsSheet.getRange(1, 1, 1, 13).setFontWeight('bold');
  eventsSheet.setColumnWidth(1, 50);  // id
  eventsSheet.setColumnWidth(2, 200); // title
  eventsSheet.setColumnWidth(3, 250); // description
  eventsSheet.setColumnWidth(4, 110); // startDate
  eventsSheet.setColumnWidth(5, 90);  // startTime
  eventsSheet.setColumnWidth(6, 110); // endDate
  eventsSheet.setColumnWidth(7, 90);  // endTime
  eventsSheet.setColumnWidth(8, 120); // category
  eventsSheet.setColumnWidth(9, 80);  // color

  // 9_debts
  const debtsSheet = ss.insertSheet('9_debts');
  debtsSheet.getRange(1, 1, 1, 10).setValues([[
    'id',
    'person',
    'amount',
    'direction',
    'description',
    'date',
    'status',
    'relatedTaskId',
    'resolvedByTaskId',
    'resolvedDate'
  ]]);
  debtsSheet.getRange(1, 1, 1, 10).setFontWeight('bold');
  debtsSheet.setColumnWidth(1, 50);  // id
  debtsSheet.setColumnWidth(2, 150); // person
  debtsSheet.setColumnWidth(3, 100); // amount
  debtsSheet.setColumnWidth(4, 100); // direction
  debtsSheet.setColumnWidth(5, 250); // description
  debtsSheet.setColumnWidth(6, 110); // date
  debtsSheet.setColumnWidth(7, 100); // status
  debtsSheet.setColumnWidth(8, 120); // relatedTaskId
  
  // 10_notes
  const notesSheet = ss.insertSheet('10_notes');
  notesSheet.getRange(1, 1, 1, 6).setValues([[
    'id', 'title', 'subject', 'date', 'docLink', 'description'
  ]]);
  notesSheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  
  // 11_persons
  const personsSheet = ss.insertSheet('11_persons');
  personsSheet.getRange(1, 1, 1, 2).setValues([[
    'id', 'name'
  ]]);
  personsSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  personsSheet.setColumnWidth(1, 50);  // id
  personsSheet.setColumnWidth(2, 150); // name
  
  // Freeze header rows
  statusesSheet.setFrozenRows(1);
  categoriesSheet.setFrozenRows(1);
  financeCategoriesSheet.setFrozenRows(1);
  objectivesSheet.setFrozenRows(1);
  dataSheet.setFrozenRows(1);
  financeSheet.setFrozenRows(1);
  financeSettingsSheet.setFrozenRows(1);
  eventsSheet.setFrozenRows(1);
  debtsSheet.setFrozenRows(1);
  notesSheet.setFrozenRows(1);
  personsSheet.setFrozenRows(1);
  
  Logger.log('All sheets have been reset and recreated successfully!');
  return 'Reset complete! All sheets have been recreated with correct structure.';
}

/**
 * Quick reset - Just recreates sheets without deleting (if sheets don't exist)
 * Use this if you want to ensure sheets exist without losing data
 */
function ensureSheetsExist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Ensure default sheet exists
  let defaultSheet = ss.getSheetByName('default');
  if (!defaultSheet) {
    defaultSheet = ss.insertSheet('default');
    defaultSheet.getRange(1, 1).setValue('This sheet is kept because Google Sheets requires at least one sheet.');
  }
  
  // Ensure 1_status sheet exists
  let statusesSheet = ss.getSheetByName('1_status');
  if (!statusesSheet) {
    statusesSheet = ss.insertSheet('1_status');
    statusesSheet.getRange(1, 1, 1, 3).setValues([[
      'id', 'name', 'color'
    ]]);
    statusesSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  }
  
  // Ensure 2_category sheet exists
  let categoriesSheet = ss.getSheetByName('2_category');
  if (!categoriesSheet) {
    categoriesSheet = ss.insertSheet('2_category');
    categoriesSheet.getRange(1, 1, 1, 3).setValues([[
      'id', 'name', 'color'
    ]]);
    categoriesSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  }
  
  // Ensure 3_financeCategories sheet exists
  let financeCategoriesSheet = ss.getSheetByName('3_financeCategories');
  if (!financeCategoriesSheet) {
    financeCategoriesSheet = ss.insertSheet('3_financeCategories');
    financeCategoriesSheet.getRange(1, 1, 1, 3).setValues([['id', 'name', 'color']]);
    financeCategoriesSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  }
  
  // Ensure 4_objectives sheet exists
  let objectivesSheet = ss.getSheetByName('4_objectives');
  if (!objectivesSheet) {
    objectivesSheet = ss.insertSheet('4_objectives');
    objectivesSheet.getRange(1, 1, 1, 13).setValues([[
      'id', 'name', 'description', 'color', 'category', 'dueDate',
      'budget', 'actualSpending', 'targetValue', 'currentValue', 'healthScore', 'lastUpdated', 'relatedFinanceId'
    ]]);
    objectivesSheet.getRange(1, 1, 1, 13).setFontWeight('bold');
  }
  
  // Ensure 5_tasks sheet exists
  let dataSheet = ss.getSheetByName('5_tasks');
  if (!dataSheet) {
    dataSheet = ss.insertSheet('5_tasks');
    dataSheet.getRange(1, 1, 1, 19).setValues([[
      'id',
      'task',
      'category',
      'startDate',
      'startTime',
      'endDate',
      'endTime',
      'color',
      'status',
      'objectiveId',
      'priority',
      'repeatType',
      'repeatUntil',
      'impactType',
      'estimatedValue',
      'actualValue',
      'valueRealizedDate',
      'estimatedHours',
      'isIncome'
    ]]);
    dataSheet.getRange(1, 1, 1, 19).setFontWeight('bold');
  }

  // Ensure 6_finance sheet exists
  let financeSheet = ss.getSheetByName('6_finance');
  if (!financeSheet) {
    financeSheet = ss.insertSheet('6_finance');
    financeSheet.getRange(1, 1, 1, 16).setValues([[
      'id', 'date', 'type', 'amount', 'category', 'note', 'recurringMonthly',
      'recurringFrequency', 'recurringNextDueDate', 'recurringBillType', 'recurringStatus',
      'recurringBillId', 'relatedTaskId', 'relatedObjective', 'isValueRealization', 'hoursNeeded'
    ]]);
    financeSheet.getRange(1, 1, 1, 16).setFontWeight('bold');
  }

  // Ensure 7_financeSettings sheet exists
  let financeSettingsSheet = ss.getSheetByName('7_financeSettings');
  if (!financeSettingsSheet) {
    financeSettingsSheet = ss.insertSheet('7_financeSettings');
    financeSettingsSheet.getRange(1, 1, 1, 2).setValues([['monthKey', 'budget']]);
    financeSettingsSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  }

  // Ensure 8_events sheet exists
  let eventsSheet = ss.getSheetByName('8_events');
  if (!eventsSheet) {
    eventsSheet = ss.insertSheet('8_events');
    eventsSheet.getRange(1, 1, 1, 13).setValues([[
      'id', 'title', 'description', 'startDate', 'startTime', 'endDate', 'endTime',
      'category', 'color', 'relatedTaskIds', 'attended', 'attendanceDate', 'generatedTasks'
    ]]);
    eventsSheet.getRange(1, 1, 1, 13).setFontWeight('bold');
  }

  // Ensure 9_debts sheet exists
  let debtsSheet = ss.getSheetByName('9_debts');
  if (!debtsSheet) {
    debtsSheet = ss.insertSheet('9_debts');
    debtsSheet.getRange(1, 1, 1, 10).setValues([[
      'id', 'person', 'amount', 'direction', 'description', 'date', 'status',
      'relatedTaskId', 'resolvedByTaskId', 'resolvedDate'
    ]]);
    debtsSheet.getRange(1, 1, 1, 10).setFontWeight('bold');
  }
  
  // Ensure 10_notes sheet exists
  let notesSheet = ss.getSheetByName('10_notes');
  if (!notesSheet) {
    notesSheet = ss.insertSheet('10_notes');
    notesSheet.getRange(1, 1, 1, 6).setValues([[
      'id', 'title', 'subject', 'date', 'docLink', 'description'
    ]]);
    notesSheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }
  
  // Ensure 11_persons sheet exists
  let personsSheet = ss.getSheetByName('11_persons');
  if (!personsSheet) {
    personsSheet = ss.insertSheet('11_persons');
    personsSheet.getRange(1, 1, 1, 2).setValues([[
      'id', 'name'
    ]]);
    personsSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  }
  
  Logger.log('All required sheets exist!');
  return 'All sheets verified!';
}
