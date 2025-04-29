from langdetect import detect, DetectorFactory
from shared_utils.logger_config import log
from dotenv import load_dotenv
import deepl
import time
import re
import os

DetectorFactory.seed = 0

load_dotenv()
DEEPL_API_KEY = os.getenv("DEEPL_API_KEY")

class TextTranslator:
    SUPPORTED_LANGUAGES = {
        'AR', 'BG', 'CS', 'DA', 'DE', 'EL', 'EN', 'ES', 'ET', 'FI', 'FR', 
        'HU', 'ID', 'IT', 'JA', 'KO', 'LT', 'LV', 'NB', 'NL', 'PL', 'PT', 
        'RO', 'RU', 'SK', 'SL', 'SV', 'TR', 'UK', 'ZH'
    }

    def __init__(self):
        self.translator = self.load_translator()
        self.POST_ID= None

    def set_post_id(self, post_id):
        self.POST_ID = post_id
        
    def load_translator(self):
        if not DEEPL_API_KEY:
            log.error(f"[ TRANSLATE ][ Failed to load DEEPL_API_KEY. Check the path. ]")
            raise ValueError("Failed to load DEEPL_API_KEY. Check the path.")
        
        log.info(f"[ TRANSLATE ][ DEEPL_API_KEY loaded successfully! ]")
        return deepl.Translator(DEEPL_API_KEY)

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

    def translate_comments(self,comments):
        log.info(f"[ TRANSLATE - {self.POST_ID} ][ Starting translation process.. ]")
        start_time = time.time()

        translated_comments=[]

        try:
            translated_comments = [self.detect_translate(str(comment)) for comment in comments]
            
            end_time = time.time()
            elapsed_time = end_time - start_time    
            log.info(f"[ TRANSLATE - {self.POST_ID} ][ Batch size: {len(comments)}. Translation completed in {elapsed_time:.2f} seconds. ]")
        except Exception as e:
            log.exception(f"[ TRANSLATE - {self.POST_ID} ][ Error during processing: {e} ]")
        
        return translated_comments


