from translator import TextTranslator
from preprocess import PreprocessData
import sys
import os
import re

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from logger_config import log

def extract_post_id(filename):
    match = re.search(r'comments?_(\d+)', filename)
    if match:
        return match.group(1)  
    else:
        return None

def main():
    try:
        filename = input("Enter the filename: ")
        
        results_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../Tiktok/Results'))
        file_path = os.path.join(results_dir, filename)
        
        if not os.path.exists(file_path):
            log.error(f"[ PREPROCESSING ][ File '{filename}' not found in '{results_dir}' ]")
            return
        
        post_id = extract_post_id(filename)
        
        if post_id:
            log.info(f"[ PREPROCESSING ][ POST_ID extracted: {post_id} ]")
        else:
            log.error("[ PREPROCESSING ][ Failed to extract POST_ID from the filename. ]")
            return

        translator = TextTranslator(file_path, post_id)
        translator.load_translator()
        translator.translate_json_comments()
        file_path_2=translator.get_output_file()

        prep = PreprocessData(file_path_2,post_id)
        prep.preprocess_text()
        
    except Exception as e:
        log.error(f"[ PREPROCESSING ] [ An error occurred: {e} ]")
        print(f"An error occurred: {e}")

if __name__ == "main":
    main()
