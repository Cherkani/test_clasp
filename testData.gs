/**
 * Test Script - Check if data can be retrieved from all sheets
 * Run this function from the Apps Script editor to diagnose data loading issues
 */
function testDataRetrieval() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const results = {
    success: true,
    errors: [],
    sheets: {},
    summary: {}
  };

  // Test each sheet
  const sheetTests = [
    { name: '1_status', func: () => getStatuses() },
    { name: '2_category', func: () => getCategories() },
    { name: '3_financeCategories', func: () => getFinanceCategories() },
    { name: '4_objectives', func: () => getObjectives() },
    { name: '5_tasks', func: () => getDatags() },
    { name: '6_finance', func: () => getFinanceRecords() },
    { name: '7_financeSettings', func: () => getFinanceSettings() },
    { name: '8_events', func: () => getEvents() },
    { name: '9_debts', func: () => getDebts() },
    { name: '10_notes', func: () => getNotes() },
    { name: '11_persons', func: () => getPersons() }
  ];

  // Test sheet existence
  Logger.log('=== CHECKING SHEET EXISTENCE ===');
  sheetTests.forEach(test => {
    const sheet = ss.getSheetByName(test.name);
    if (!sheet) {
      results.errors.push(`Sheet "${test.name}" does not exist`);
      results.sheets[test.name] = { exists: false, error: 'Sheet not found' };
      Logger.log(`❌ "${test.name}" - NOT FOUND`);
    } else {
      const rowCount = sheet.getLastRow();
      const colCount = sheet.getLastColumn();
      results.sheets[test.name] = { 
        exists: true, 
        rows: rowCount, 
        cols: colCount,
        hasData: rowCount > 1
      };
      Logger.log(`✅ "${test.name}" - Found (${rowCount} rows, ${colCount} cols)`);
    }
  });

  // Test data retrieval functions
  Logger.log('\n=== TESTING DATA RETRIEVAL FUNCTIONS ===');
  sheetTests.forEach(test => {
    try {
      const startTime = new Date().getTime();
      const data = test.func();
      const endTime = new Date().getTime();
      const duration = endTime - startTime;
      
      const count = Array.isArray(data) ? data.length : (typeof data === 'object' && data !== null ? Object.keys(data).length : 0);
      results.sheets[test.name].retrieval = {
        success: true,
        count: count,
        duration: duration + 'ms',
        sample: Array.isArray(data) && data.length > 0 ? data[0] : data
      };
      Logger.log(`✅ "${test.name}" - Retrieved ${count} items in ${duration}ms`);
    } catch (error) {
      results.errors.push(`Error retrieving "${test.name}": ${error.toString()}`);
      if (!results.sheets[test.name]) {
        results.sheets[test.name] = {};
      }
      results.sheets[test.name].retrieval = {
        success: false,
        error: error.toString()
      };
      Logger.log(`❌ "${test.name}" - ERROR: ${error.toString()}`);
    }
  });

  // Test getAppData function
  Logger.log('\n=== TESTING getAppData() ===');
  try {
    const startTime = new Date().getTime();
    const appData = getAppData();
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    
    results.summary = {
      success: true,
      duration: duration + 'ms',
      data: {
        tasks: appData.tasks?.length || 0,
        objectives: appData.objectives?.length || 0,
        categories: appData.categories?.length || 0,
        statuses: appData.statuses?.length || 0,
        financeRecords: appData.financeRecords?.length || 0,
        events: appData.events?.length || 0,
        debts: appData.debts?.length || 0,
        notes: appData.notes?.length || 0,
        persons: appData.persons?.length || 0,
        hasStats: !!appData.stats
      }
    };
    
    Logger.log(`✅ getAppData() - Success in ${duration}ms`);
    Logger.log(`   Tasks: ${results.summary.data.tasks}`);
    Logger.log(`   Objectives: ${results.summary.data.objectives}`);
    Logger.log(`   Categories: ${results.summary.data.categories}`);
    Logger.log(`   Statuses: ${results.summary.data.statuses}`);
    Logger.log(`   Finance Records: ${results.summary.data.financeRecords}`);
    Logger.log(`   Events: ${results.summary.data.events}`);
    Logger.log(`   Debts: ${results.summary.data.debts}`);
    Logger.log(`   Notes: ${results.summary.data.notes}`);
    Logger.log(`   Persons: ${results.summary.data.persons}`);
    Logger.log(`   Stats: ${results.summary.data.hasStats ? 'Yes' : 'No'}`);
  } catch (error) {
    results.errors.push(`Error in getAppData(): ${error.toString()}`);
    results.summary = {
      success: false,
      error: error.toString()
    };
    Logger.log(`❌ getAppData() - ERROR: ${error.toString()}`);
  }

  // Check for common issues
  Logger.log('\n=== CHECKING FOR COMMON ISSUES ===');
  
  // Check if default sheet exists
  const defaultSheet = ss.getSheetByName('default');
  if (!defaultSheet) {
    Logger.log('⚠️  "default" sheet does not exist (this is okay, but recommended)');
  } else {
    Logger.log('✅ "default" sheet exists');
  }

  // Check for old sheet names
  const oldSheetNames = ['Tasks', 'Objectives', 'Categories', 'Statuses', 'Finance', 'FinanceSettings', 'FinanceCategories', 'Events', 'Debts', 'Notes', 'Persons'];
  const foundOldSheets = [];
  oldSheetNames.forEach(oldName => {
    const oldSheet = ss.getSheetByName(oldName);
    if (oldSheet) {
      foundOldSheets.push(oldName);
    }
  });
  
  if (foundOldSheets.length > 0) {
    Logger.log(`⚠️  Found old sheet names: ${foundOldSheets.join(', ')}`);
    Logger.log('   These should be deleted and replaced with numbered versions');
    results.errors.push(`Old sheets found: ${foundOldSheets.join(', ')}`);
  } else {
    Logger.log('✅ No old sheet names found');
  }

  // Final summary
  Logger.log('\n=== FINAL SUMMARY ===');
  if (results.errors.length === 0) {
    Logger.log('✅ All tests passed!');
    results.success = true;
  } else {
    Logger.log(`❌ Found ${results.errors.length} error(s):`);
    results.errors.forEach(error => {
      Logger.log(`   - ${error}`);
    });
    results.success = false;
  }

  return results;
}

/**
 * Quick test - Just check if sheets exist
 */
function quickSheetCheck() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const requiredSheets = [
    '1_status',
    '2_category',
    '3_financeCategories',
    '4_objectives',
    '5_tasks',
    '6_finance',
    '7_financeSettings',
    '8_events',
    '9_debts',
    '10_notes',
    '11_persons'
  ];

  Logger.log('=== QUICK SHEET CHECK ===');
  const missing = [];
  const existing = [];

  requiredSheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      const rowCount = sheet.getLastRow();
      existing.push(`${sheetName} (${rowCount} rows)`);
      Logger.log(`✅ ${sheetName} - ${rowCount} rows`);
    } else {
      missing.push(sheetName);
      Logger.log(`❌ ${sheetName} - NOT FOUND`);
    }
  });

  Logger.log(`\nSummary: ${existing.length} found, ${missing.length} missing`);
  
  if (missing.length > 0) {
    Logger.log(`\nMissing sheets: ${missing.join(', ')}`);
    Logger.log('Run resetAllSheets() to create them.');
  }

  return {
    found: existing.length,
    missing: missing.length,
    missingSheets: missing
  };
}
