import { runPython } from './pyodide';

/**
 * Extract sheet names from an Excel file.
 * Returns an array of sheet names available in the workbook.
 *
 * @param base64Data - Base64-encoded Excel file data
 * @returns Array of sheet names
 */
export async function getExcelSheetNames(base64Data: string): Promise<string[]> {
  const pythonCode = `
import pandas as pd
from io import BytesIO
import base64
import json

# Decode base64 Excel data
excel_data = """${base64Data}"""
excel_bytes = base64.b64decode(excel_data)

# Read Excel file to get sheet names
excel_file = pd.ExcelFile(BytesIO(excel_bytes), engine='openpyxl')
sheet_names = excel_file.sheet_names

# Return as JSON array
json.dumps(sheet_names)
`;

  const resultJson = await runPython<string>(pythonCode);
  const sheetNames = JSON.parse(resultJson) as string[];
  return sheetNames;
}
