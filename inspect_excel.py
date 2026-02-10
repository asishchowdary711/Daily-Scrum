import pandas as pd
import sys

file_path = 'QBE Project Daily Action Items_2026.xlsx'

try:
    xl = pd.ExcelFile(file_path)
    print(f"File: {file_path}")
    print(f"Sheet names: {xl.sheet_names}")
    
    # Analyze first sheet only to avoid truncation
    if len(xl.sheet_names) > 0:
        sheet = xl.sheet_names[0]
        print(f"\n{'='*30}")
        print(f"Sheet: {sheet}")
        print(f"{'='*30}")
        
        df = xl.parse(sheet, header=None)
        print("\n--- First 10 rows (header=None) ---")
        print(df.head(10).to_string())
        print(f"\nShape: {df.shape}")
        
        # Check if row 0 looks like a header
        print("\n--- Row 0 values ---")
        print(df.iloc[0].tolist())

except Exception as e:
    print(f"Error: {e}")
