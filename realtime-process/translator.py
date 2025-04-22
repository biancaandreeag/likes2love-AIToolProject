import json
import pandas as pd
from langdetect import detect, DetectorFactory
from dotenv import load_dotenv
from tqdm import tqdm
import deepl
import time
import sys
import csv
import re
import os

load_dotenv()
#ia API-ul

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))
from logger_config import log

DetectorFactory.seed = 0

class TextTranslator:
    SUPPORTED_LANGUAGES = {
        'AR', 'BG', 'CS', 'DA', 'DE', 'EL', 'EN', 'ES', 'ET', 'FI', 'FR', 
        'HU', 'ID', 'IT', 'JA', 'KO', 'LT', 'LV', 'NB', 'NL', 'PL', 'PT', 
        'RO', 'RU', 'SK', 'SL', 'SV', 'TR', 'UK', 'ZH'
    }

    @staticmethod
    def get_unique_filename(base_filename):
        directory = "Translations"
        if not os.path.exists(directory):
            os.makedirs(directory)
        
        base_file_path = os.path.join(directory, f"{base_filename}.csv")
        
        if not os.path.exists(base_file_path):
            return base_filename  

        i = 1
        while os.path.exists(os.path.join(directory, f"{base_filename}({i}).csv")):
            i += 1
        
        return f"{base_filename}({i})"

    def __init__(self, input_json_file, post_id):
        self.input_json_file = input_json_file
        self.translator = self.load_translator()
        self.POST_ID = post_id
        
        output_name=post_id+"_translated"
        output_name=self.get_unique_filename(f"{output_name}")

        if not os.path.exists('Translations'):
            os.makedirs('Translations')
            log.info(f"[ TRANSLATE ][ Directory 'Translations' created ]")
        
        self.output_file = os.path.join('Translations/', output_name + '.csv')
    
    def get_output_file(self):
        return self.output_file

    def load_translator(self):
        deepl_api_key = os.getenv("DEEPL_API_KEY")
        
        if not deepl_api_key:
            log.error(f"[ TRANSLATE ][ Failed to load DEEPL_API_KEY. Check the path. ]")
            raise ValueError("Failed to load DEEPL_API_KEY. Check the path.")
        
        log.info(f"[ TRANSLATE ][ DEEPL_API_KEY loaded successfully! ]")
        return deepl.Translator(deepl_api_key)

    @staticmethod
    def clean_text(text):
        text = re.sub(r'http\S+|www\S+|https\S+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '', text)
        text = re.sub(r'#\w+', '', text)
        text = re.sub(r'[^\w\s]', '', text)
        return text.strip()

    def detect_translate(self, text):
        cleaned_text = self.clean_text(text)
        
        if not cleaned_text:
            return text  
        try:
            lang = detect(cleaned_text)

            if lang != 'en' and lang.upper() in self.SUPPORTED_LANGUAGES:
                try:
                    translated = self.translator.translate_text(text, source_lang=lang.upper(), target_lang="EN-US")
                    return translated.text
                except Exception as e:
                    log.error(f"[ TRANSLATE - {self.POST_ID} ][ Error during translation: {e}\nOriginal text: {text} ]")
                    return "not_translated"
            else:
                return text 
        except Exception as e:
            log.error(f"[ TRANSLATE - {self.POST_ID} ][ Error during language detection: {e}\nOriginal text: {text} ]")
            return text

    def translate_json_comments(self):
        log.info(f"[ TRANSLATE - {self.POST_ID} ][ Starting translation process.. ]")
        start_time = time.time()

        try:
            with open(self.input_json_file, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            comments = [item['comment'] for item in data['comments']] 

            tqdm.pandas()
            translated_comments = [self.detect_translate(str(comment)) for comment in tqdm(comments, desc="Translating comments")]
            
            with open(self.output_file, mode='w', encoding='utf-8', newline='') as f:
                f.write("translated_comment\n") 

                writer = csv.writer(f, quoting=csv.QUOTE_ALL)
                for comment in translated_comments:
                    writer.writerow([comment])
            
            end_time = time.time()
            elapsed_time = end_time - start_time    
            log.info(f"[ TRANSLATE - {self.POST_ID} ][ Translation completed in {elapsed_time:.2f} seconds. Output saved to {self.output_file} ]")
        except Exception as e:
            log.exception(f"[ TRANSLATE - {self.POST_ID} ][ Error during processing: {e} ]")


