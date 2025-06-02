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

    def translate(self, text):
        try:
            translated = self.translator.translate_text(text, source_lang="RO", target_lang="EN-US")
            return translated.text
        except Exception as e:
            log.error(f"[ TRANSLATE - {self.POST_ID} ][ Error during translation: {e}\nOriginal text: {text} ]")
            return "not_translated"

    def translate_comments(self, comments, delay: float = 0.8, max_retries: int = 3):
        log.info(f"[ TRANSLATE - {self.POST_ID} ][ Starting translation process.. ]")
        start_time = time.time()

        translated_comments = []

        for i, comment in enumerate(comments):
            text = str(comment)
            for attempt in range(1, max_retries + 1):
                try:
                    translated = self.translate(text)
                    translated_comments.append(translated)
                    time.sleep(delay)
                    break
                except Exception as e:
                    log.error(
                        f"[ TRANSLATE - {self.POST_ID} ][ Attempt {attempt}/{max_retries} failed for comment {i}: {e} ]")
                    if attempt < max_retries:
                        time.sleep(2 * attempt)  # backoff
                    else:
                        translated_comments.append("not_translated")
                        break

        elapsed_time = time.time() - start_time
        log.info(
            f"[ TRANSLATE - {self.POST_ID} ][ Batch size: {len(comments)}. Translation completed in {elapsed_time:.2f} seconds. ]")

        return translated_comments



