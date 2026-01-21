// Standalone script to fix all sheet structures with enhanced analytics
// Run this function from the Apps Script editor to fix column structures
// Usage: Open Apps Script editor, select fixAllSheetStructures function, and click Run

function fixAllSheetStructures() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const fixes = [];
  const logs = [];

  // Expected column structures with enhanced analytics
  const expectedStructures = {
    'Tasks': {
      columns: ['id', 'task', 'category', 'startDate', 'startTime', 'endDate', 'endTime', 'color', 'status', 'objective', 'priority', 'repeatType', 'repeatUntil', 'impactType', 'estimatedValue', 'actualValue', 'valueRealizedDate'],
      count: 17
    },
    'Objectives': {
      columns: ['id', 'name', 'description', 'color', 'category', 'dueDate', 'budget', 'actualSpending', 'targetValue', 'currentValue', 'healthScore', 'lastUpdated'],
      count: 12
    },
    'Categories': {
      columns: ['id', 'name', 'color'],
      count: 3
    },
    'Statuses': {
      columns: ['id', 'name', 'color'],
      count: 3
    },
    'Finance': {
      columns: ['id', 'date', 'type', 'amount', 'category', 'note', 'recurringMonthly', 'recurringFrequency', 'recurringNextDueDate', 'recurringBillType', 'recurringStatus', 'recurringBillId', 'relatedTaskId', 'relatedObjective', 'isValueRealization'],
      count: 15
    },
    'FinanceSettings': {
      columns: ['monthKey', 'budget'],
      count: 2
    },
    'FinanceCategories': {
      columns: ['id', 'name', 'color'],
      count: 3
    },
    'Events': {
      columns: ['id', 'title', 'description', 'startDate', 'startTime', 'endDate', 'endTime', 'category', 'color', 'relatedTaskIds', 'attended', 'attendanceDate', 'generatedTasks'],
      count: 13
    },
    'Debts': {
      columns: ['id', 'person', 'amount', 'direction', 'description', 'date', 'status', 'relatedTaskId', 'resolvedByTaskId', 'resolvedDate'],
      count: 10
    },
    'Persons': {
      columns: ['id', 'name'],
      count: 2
    },
    'Notes': {
      columns: ['id', 'title', 'subject', 'date', 'docLink', 'description'],
      count: 6
    }
  };

  // Fix each sheet
  Object.keys(expectedStructures).forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      logs.push(`Sheet "${sheetName}" does not exist - skipping`);
      return;
    }
    
    const expected = expectedStructures[sheetName];
    const currentCols = sheet.getLastColumn();
    const headerRow = sheet.getRange(1, 1, 1, currentCols).getValues()[0];
    const actualColumns = headerRow.filter(cell => cell !== '');
    
    // Check if structure needs fixing
    const columnCountMismatch = currentCols !== expected.count;
    const columnNameMismatch = !actualColumns.every((col, idx) => 
      idx < expected.columns.length && col === expected.columns[idx]
    );
    
    if (columnCountMismatch || columnNameMismatch) {
      logs.push(`Fixing "${sheetName}"...`);
      logs.push(`  Current: ${currentCols} columns - [${actualColumns.join(', ')}]`);
      logs.push(`  Expected: ${expected.count} columns - [${expected.columns.join(', ')}]`);
      
      // Backup existing data
      const dataRange = sheet.getDataRange();
      const allData = dataRange.getValues();
      const dataRowCount = allData.length - 1;
      
      // Clear existing data (keep header)
      if (dataRowCount > 0) {
        sheet.getRange(2, 1, dataRowCount, sheet.getLastColumn()).clearContent();
      }
      
      // Update header
      sheet.getRange(1, 1, 1, expected.count).setValues([expected.columns]);
      sheet.getRange(1, 1, 1, expected.count).setFontWeight("bold");
      
      // Restore data rows (if any)
      if (dataRowCount > 0) {
        const dataRows = allData.slice(1);
        // Map old columns to new columns by name
        const fixedRows = dataRows.map((row, rowIdx) => {
          const fixedRow = [];
          expected.columns.forEach((expectedCol) => {
            // Try to find the column in the old structure by name
            const oldIdx = actualColumns.indexOf(expectedCol);
            if (oldIdx >= 0 && oldIdx < row.length) {
              fixedRow.push(row[oldIdx] || '');
            } else {
              // Column doesn't exist in old structure, use empty value
              fixedRow.push('');
            }
          });
          return fixedRow;
        });
        
        sheet.getRange(2, 1, fixedRows.length, expected.count).setValues(fixedRows);
        logs.push(`  Restored ${fixedRows.length} data row(s)`);
      }
      
      fixes.push(sheetName);
      logs.push(`  ✓ Fixed "${sheetName}"`);
    } else {
      logs.push(`✓ "${sheetName}" is already correct`);
    }
  });

  // Print results
  Logger.log('=== SHEET STRUCTURE FIX COMPLETE ===');
  logs.forEach(log => Logger.log(log));
  Logger.log(`\nFixed ${fixes.length} sheet(s): ${fixes.join(', ')}`);
  
  return {
    success: true,
    fixedSheets: fixes,
    logs: logs
  };
}

// Function to add new columns to existing sheets without breaking data
function addEnhancedColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logs = [];

  // Column additions needed for enhanced analytics
  const columnAdditions = {
    'Tasks': {
      additions: [
        { position: 15, name: 'actualValue', defaultValue: '' },
        { position: 16, name: 'valueRealizedDate', defaultValue: '' }
      ]
    },
    'Objectives': {
      additions: [
        { position: 6, name: 'budget', defaultValue: 0 },
        { position: 7, name: 'actualSpending', defaultValue: 0 },
        { position: 8, name: 'targetValue', defaultValue: 0 },
        { position: 9, name: 'currentValue', defaultValue: 0 },
        { position: 10, name: 'healthScore', defaultValue: 0 },
        { position: 11, name: 'lastUpdated', defaultValue: '' }
      ]
    },
    'Finance': {
      additions: [
        { position: 12, name: 'relatedTaskId', defaultValue: '' },
        { position: 13, name: 'relatedObjective', defaultValue: '' },
        { position: 14, name: 'isValueRealization', defaultValue: false }
      ]
    },
    'Events': {
      additions: [
        { position: 9, name: 'relatedTaskIds', defaultValue: '' },
        { position: 10, name: 'attended', defaultValue: false },
        { position: 11, name: 'attendanceDate', defaultValue: '' },
        { position: 12, name: 'generatedTasks', defaultValue: 0 }
      ]
    },
    'Debts': {
      additions: [
        { position: 8, name: 'resolvedByTaskId', defaultValue: '' },
        { position: 9, name: 'resolvedDate', defaultValue: '' }
      ]
    }
  };

  Object.entries(columnAdditions).forEach(([sheetName, config]) => {
    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        logs.push(`Sheet "${sheetName}" does not exist - skipping`);
        return;
      }

      const currentCols = sheet.getLastColumn();
      logs.push(`Processing "${sheetName}" - current columns: ${currentCols}`);

      config.additions.forEach(addition => {
        if (addition.position > currentCols) {
          // Insert new column
          sheet.insertColumnAfter(currentCols);
          sheet.getRange(1, currentCols + 1).setValue(addition.name);
          sheet.getRange(1, currentCols + 1).setFontWeight("bold");

          // Fill default values for existing rows
          const lastRow = sheet.getLastRow();
          if (lastRow > 1) {
            const range = sheet.getRange(2, currentCols + 1, lastRow - 1, 1);
            if (typeof addition.defaultValue === 'boolean') {
              range.setValue(addition.defaultValue);
            } else if (typeof addition.defaultValue === 'number') {
              range.setValue(addition.defaultValue);
            } else {
              range.setValue(addition.defaultValue || '');
            }
          }

          logs.push(`  ✓ Added column "${addition.name}" at position ${currentCols + 1}`);
        } else {
          logs.push(`  - Column at position ${addition.position} already exists`);
        }
      });

    } catch (error) {
      logs.push(`Error processing "${sheetName}": ${error.toString()}`);
    }
  });

  Logger.log('=== ENHANCED COLUMNS ADDITION COMPLETE ===');
  logs.forEach(log => Logger.log(log));

  return {
    success: true,
    logs: logs
  };
}

// Function to check if sheets have the correct columns
function checkSheetColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logs = [];

  // Expected column structures
  const expectedStructures = {
    'Tasks': 17, // id, task, category, startDate, startTime, endDate, endTime, color, status, objective, priority, repeatType, repeatUntil, impactType, estimatedValue, actualValue, valueRealizedDate
    'Objectives': 12, // id, name, description, color, category, dueDate, budget, actualSpending, targetValue, currentValue, healthScore, lastUpdated
    'Finance': 15, // id, date, type, amount, category, note, recurringMonthly, recurringFrequency, recurringNextDueDate, recurringBillType, recurringStatus, recurringBillId, relatedTaskId, relatedObjective, isValueRealization
    'Events': 13, // id, title, description, startDate, startTime, endDate, endTime, category, color, relatedTaskIds, attended, attendanceDate, generatedTasks
    'Debts': 10 // id, person, amount, direction, description, date, status, relatedTaskId, resolvedByTaskId, resolvedDate
  };

  Object.entries(expectedStructures).forEach(([sheetName, expectedCount]) => {
    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        logs.push(`❌ Sheet "${sheetName}" does not exist`);
        return;
      }

      const currentCols = sheet.getLastColumn();
      if (currentCols === expectedCount) {
        logs.push(`✅ "${sheetName}" has correct number of columns (${currentCols})`);
      } else {
        logs.push(`❌ "${sheetName}" has ${currentCols} columns, expected ${expectedCount}`);
      }
    } catch (error) {
      logs.push(`Error checking "${sheetName}": ${error.toString()}`);
    }
  });

  Logger.log('=== SHEET COLUMN CHECK ===');
  logs.forEach(log => Logger.log(log));

  return {
    success: true,
    logs: logs
  };
}
