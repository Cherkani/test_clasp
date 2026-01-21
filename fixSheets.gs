// Standalone script to fix all sheet structures
// Run this function from the Apps Script editor to fix column structures
// Usage: Open Apps Script editor, select fixAllSheetStructures function, and click Run

function fixAllSheetStructures() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const fixes = [];
  const logs = [];

  // Expected column structures
  const expectedStructures = {
    'Tasks': {
      columns: ['id', 'task', 'category', 'startDate', 'startTime', 'endDate', 'endTime', 'color', 'status', 'objective', 'priority', 'repeatType', 'repeatUntil', 'impactType', 'estimatedValue'],
      count: 15
    },
    'Objectives': {
      columns: ['id', 'name', 'description', 'color', 'category', 'dueDate'],
      count: 6
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
      columns: ['id', 'date', 'type', 'amount', 'category', 'note', 'recurringMonthly', 'recurringFrequency', 'recurringNextDueDate', 'recurringBillType', 'recurringStatus', 'recurringBillId'],
      count: 12
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
      columns: ['id', 'title', 'description', 'startDate', 'startTime', 'endDate', 'endTime', 'category', 'color'],
      count: 9
    },
    'Debts': {
      columns: ['id', 'person', 'amount', 'direction', 'description', 'date', 'status', 'relatedTaskId'],
      count: 8
    },
    'Persons': {
      columns: ['id', 'name'],
      count: 2
    },
    'Notes': {
      columns: ['id', 'title', 'subject', 'date', 'googleDocId'],
      count: 5
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
