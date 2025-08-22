import os
import json
import re
from pathlib import Path

def extract_page_number_from_filename(filename):
    """Extract page number from filename format: <manual>-page_<number>_part_1_questions.txt"""
    # Pattern to match: -page_<number>_part_1_questions.txt
    pattern = r'_page_(\d+)_part_1_questions\.txt$'
    match = re.search(pattern, filename)
    
    if match:
        return match.group(1)  # Return as string to maintain leading zeros if any
    else:
        print(f"Warning: Could not extract page number from filename: {filename}")
        return None

def extract_json_from_file(file_path):
    """Extract JSON array from a file that may contain markdown text."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find JSON array using regex - looks for [ ... ] structure
    # This pattern handles nested structures and whitespace
    json_pattern = r'\[\s*\{.*?\}\s*\]'
    match = re.search(json_pattern, content, re.DOTALL)
    
    if match:
        json_text = match.group(0)
        try:
            # Parse the JSON to validate it
            json_data = json.loads(json_text)
            return json_data
        except json.JSONDecodeError as e:
            print(f"JSON decode error in {file_path}: {e}")
            return None
    else:
        print(f"No JSON array found in {file_path}")
        return None

def process_files_to_jsonl(input_directory, output_file):
    """Process all files in directory and create JSONL output with page numbers."""
    
    # Get all files in the directory that match the expected pattern
    input_path = Path(input_directory)
    files = [f for f in input_path.iterdir() 
             if f.is_file() and f.name.endswith('_part_1_questions.txt')]
    
    total_records = 0
    processed_files = 0
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for file_path in files:
            print(f"Processing: {file_path.name}")
            
            # Extract page number from filename
            page_number = extract_page_number_from_filename(file_path.name)
            
            json_data = extract_json_from_file(file_path)
            
            if json_data and isinstance(json_data, list):
                # Write each object in the array as a separate line in JSONL
                for item in json_data:
                    # Add page number to each item
                    if page_number:
                        item['pageNumber'] = page_number
                    
                    json.dump(item, outfile, ensure_ascii=False)
                    outfile.write('\n')
                    total_records += 1
                processed_files += 1
            else:
                print(f"Skipping {file_path.name} - no valid JSON array found")
    
    print(f"\nProcessing complete!")
    print(f"Files processed: {processed_files}/{len(files)}")
    print(f"Total records written: {total_records}")
    print(f"Output file: {output_file}")

# Usage
if __name__ == "__main__":
    # Set your input directory and output file paths
    input_directory = "./questions"  # Change this to your directory
    output_file = "./jsonl/combined_questions.jsonl"     # Change this to your desired output filename
    
    process_files_to_jsonl(input_directory, output_file)