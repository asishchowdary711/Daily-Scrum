import pandas as pd
import sys

# Set pandas options to ensure we see the data
pd.set_option('display.max_rows', 20)
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 1000)

file_path = 'QBE Project Daily Action Items_2026.xlsx'

try:
    xl = pd.ExcelFile(file_path)
    print(f"Sheets: {xl.sheet_names}")
    
    # Inspect 'July 2024  Dup'
    sheet_name = 'July 2024  Dup'
    if sheet_name in xl.sheet_names:
        print(f"\n--- {sheet_name} ---")
        df = xl.parse(sheet_name, header=None)
        # Print first valid rows (non-empty)
        print("First 8 rows raw data:")
        for i, row in df.head(8).iterrows():
            # Filter out NaNs for display clarity if needed, but showing raw is better for structure ID
            print(f"Row {i}: {row.tolist()}")
    
    # Inspect 'Cortex items'
    sheet_name = 'Cortex items' 
    if sheet_name in xl.sheet_names:
        print(f"\n--- {sheet_name} ---")
        df = xl.parse(sheet_name, header=None)
        for i, row in df.head(5).iterrows():
            print(f"Row {i}: {row.tolist()}")

except Exception as e:
    print(f"Error: {e}")
