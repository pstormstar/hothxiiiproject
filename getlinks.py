import requests
from bs4 import BeautifulSoup
import time
from datetime import datetime
from pymongo import MongoClient
import re

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# ==========================================
# 1. PAGE CONFIGURATIONS
# ==========================================
# Define how each specific page should be scraped and parsed.
# Replace the sample URLs with your actual 8 URLs.
PAGE_CONFIGS = {
    "https://www.seasoasa.ucla.edu/engr-courses/": {
        "container": "table",           # Look for the first <table>
        "row": "tr",                    # Rows are <tr> tags
        "cell": ["th", "td"],           # Cells are <th> or <td> tags
        "skip_headers": 0,              # Skip the first row (header)
        "course_idx": 0,                # Course name is in column index 1
        "avail_indices": [1, 2, 3],      # Availability is in columns 3, 4, and 5
        "hardcoded_columns": {
            "department": "Engineering",
            "course_prefix": "ENGR"
        },
        "course_separator": r"\s*[–—\-]\s*" 
    },
    "https://www.seasoasa.ucla.edu/be-term-offerings/": {
        "container": "table",
        "row": "tr",
        "cell": ["th", "td"],
        "skip_headers": 1,              # Skip the first row (header)
        "course_idx": 1,                # Course name is in column 0
        "avail_indices": [2, 3, 4],      # Availability is in columns 3, 4, and 5
        "hardcoded_columns": {
            "department": "Bioengineering",
            "course_prefix": "BIOENGR"
        },
        "course_separator": r"\s*[–—\-]\s*" 
    },
    "https://www.seasoasa.ucla.edu/course-term-offerings/": {
        "container": "table",           # Look for the first <table>
        "row": "tr",                    # Rows are <tr> tags
        "cell": ["th", "td"],           # Cells are <th> or <td> tags
        "skip_headers": 1,              # Skip the first row (header)
        "course_idx": 1,                # Course name is in column index 1
        "avail_indices": [2, 3, 4],      # Availability is in columns 3, 4, and 5
        "hardcoded_columns": {
            "department": "Chemical Engineering",
            "course_prefix": "CH ENGR"
        },
        "course_separator": r"\s*[–—\-]\s*" 
    },
    "https://www.seasoasa.ucla.edu/civil-term-offerings/": {
        "container": "table",
        "row": "tr",
        "cell": ["th", "td"],
        "skip_headers": 1,              # No headers, start immediately
        "course_idx": 1,                # Course name is in column 0
        "avail_indices": [2, 3, 4],      # Availability is in columns 3, 4, and 5
        "hardcoded_columns": {
            "department": "Civil Engineering",
            "course_prefix": "C&EE"
        },
        "course_separator": r"\s*[–—\-]\s*" 
    },
    "https://www.seasoasa.ucla.edu/cs-tentative-offerings/": {
        "container": "body",
        "row": "div.et_pb_row",
        "cell": "div.et_pb_column",
        "skip_headers": 2,
        "course_idx": 0,
        "avail_indices": [1, 2, 3],
        "hardcoded_columns": {
            "department": "Computer Science",
            "course_prefix": "CS"
        },
        "course_separator": r"\s*[–—\-]\s*" 
    },
    "https://www.seasoasa.ucla.edu/ee-course-term-offerings/": {
        "container": "table",
        "row": "tr",
        "cell": ["th", "td"],
        "skip_headers": 0,              # No headers, start immediately
        "course_idx": 0,                # Course name is in column 0
        "avail_indices": [1, 2, 3],      # Availability is in columns 3, 4, and 5
        "hardcoded_columns": {
            "department": "Electrical Engineering",
            "course_prefix": "EC ENGR"
        },
        "course_separator": r"\s*[–—\-]\s*"  
    },
    "https://www.seasoasa.ucla.edu/materials-science-and-engineering-course-offerings/": {
        "container": "table",           # Look for the first <table>
        "row": "tr",                    # Rows are <tr> tags
        "cell": ["th", "td"],           # Cells are <th> or <td> tags
        "skip_headers": 1,              # Skip the first row (header)
        "course_idx": 1,                # Course name is in column index 1
        "avail_indices": [2, 3, 4],      # Availability is in columns 3, 4, and 5
        "hardcoded_columns": {
            "department": "Materials Science and Engineering",
            "course_prefix": "MAT SCI"
        },
        "course_separator": r"\s*[–—\-]\s*" 
    },
    "https://www.seasoasa.ucla.edu/mae-course-term-offerings/": {
        "container": "table",
        "row": "tr",
        "cell": ["th", "td"],
        "skip_headers": 0,              # No headers, start immediately
        "course_idx": 1,                # Course name is in column 0
        "avail_indices": [3, 4, 5],      # Availability is in columns 3, 4, and 5
        "hardcoded_columns": {
            "department": "Mechanical Engineering",
            "course_prefix": "MECH&AE"
        },
        "course_separator": r"\s*[–—\-]\s*" 
    }
}

# ==========================================
# 2. DATABASE SETUP
# ==========================================
def setup_mongodb():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['scraper_db']
    collection = db['course_offerings']
    collection.drop() # Clear existing data for a fresh start
    return collection

# ==========================================
# 3. SCRAPING LOGIC
# ==========================================
def scrape_page(url, config):
    """Scrapes a page using the rules defined in its config."""
    print(f"\nFetching data from: {url}")
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"  -> Error fetching this page: {e}")
        return None

    soup = BeautifulSoup(response.content, 'html.parser')
    
    container = soup.select_one(config['container'])
    if not container:
        print(f"  -> Could not find container: {config['container']}")
        return None

    rows = container.select(config['row'])
    if len(rows) <= config['skip_headers']:
        print("  -> Not enough rows found based on configuration.")
        return None

    table_documents = []

    for row in rows[config['skip_headers']:]:
        if isinstance(config['cell'], list):
            cells = row.find_all(config['cell'])
        else:
            cells = row.select(config['cell'])
            
        max_idx_needed = max(config['avail_indices'] + [config['course_idx']])
        if len(cells) > max_idx_needed:
            
            row_dict = {}
            
            if "hardcoded_columns" in config:
                for key, val in config["hardcoded_columns"].items():
                    row_dict[key] = val

            course_text = cells[config['course_idx']].get_text(strip=True)
            course_text = course_text.replace('\xa0', ' ')
            
            if any(c.isalpha() for c in course_text):
                if "course_separator" in config:
                    parts = re.split(config["course_separator"], course_text, maxsplit=1)
                    
                    if len(parts) == 2:
                        raw_code = parts[0].strip()
                        row_dict["class_code"] = raw_code.split()[-1] if raw_code else ""
                        row_dict["class_name"] = parts[1].strip()
                    else:
                        row_dict["class_code"] = ""
                        row_dict["class_name"] = course_text.strip()
                else:
                    row_dict["class_code"] = ""
                    row_dict["class_name"] = course_text.strip()
            else:
                row_dict["class_code"] = 0
                row_dict["class_name"] = 0
            
            # --- NEW: Track if the course is offered in any term ---
            is_offered = False 
            
            for term_num, cell_idx in enumerate(config['avail_indices'], start=1):
                cell_text = cells[cell_idx].get_text(strip=True).lower()
                
                # Using the fixed availability logic here!
                if any(term in cell_text for term in ["fall", "winter", "spring"]):
                    row_dict[f"availability_{term_num}"] = 1
                    is_offered = True # We found a term, flip the flag!
                else:
                    row_dict[f"availability_{term_num}"] = 0

            # --- NEW: Only append if is_offered is True ---
            if is_offered:
                print(f"    Scraped row: {row_dict}")
                table_documents.append(row_dict)
            else:
                # Optional: Print a skipped message so you can monitor what gets thrown out
                print(f"    Skipped (No Availability): {row_dict.get('class_name', 'Unknown Course')}")

    return table_documents

# ==========================================
# 4. EXECUTION
# ==========================================
if __name__ == "__main__":
    db_collection = setup_mongodb()
    
    print(f"Starting scrape for {len(PAGE_CONFIGS)} configured URLs...")
    
    for link, configuration in PAGE_CONFIGS.items():
        time.sleep(1) # Be polite to the server
        
        table_records = scrape_page(link, configuration)
        
        if table_records:
            page_document = {
                "source_url": link,
                "scraped_at": datetime.utcnow(),
                "table_data": table_records
            }
            
            result = db_collection.insert_one(page_document)
            print(f"  -> Successfully inserted into MongoDB with ID: {result.inserted_id}")