from langdetect import detect, DetectorFactory
from shared_utils.logger_config import log
from dotenv import load_dotenv
import deepl
import time
import os

DetectorFactory.seed = 0

load_dotenv()
DEEPL_API_KEY = os.getenv("DEEPL_API_KEY")

supported_languages = [
    'AR', 'BG', 'CS', 'DA', 'DE', 'EL', 'EN', 'ES', 'ET', 'FI', 'FR',
    'HU', 'ID', 'IT', 'JA', 'KO', 'LT', 'LV', 'NB', 'NL', 'PL', 'PT',
    'RO', 'RU', 'SK', 'SL', 'SV', 'TR', 'UK', 'ZH'
]


class TextTranslator:
    def __init__(self):
        self.translator = self.load_translator()
        self.POST_ID = None

    def set_post_id(self, post_id):
        self.POST_ID = post_id

    def load_translator(self):
        if not DEEPL_API_KEY:
            log.error(f"[ TRANSLATE ][ Failed to load DEEPL_API_KEY. Check the path. ]")
            raise ValueError("Failed to load DEEPL_API_KEY. Check the path.")

        log.info(f"[ TRANSLATE ][ DEEPL_API_KEY loaded successfully! ]")
        return deepl.translator.Translator(DEEPL_API_KEY)

    def translate(self, text, lang):
        try:
            lang = lang.upper()
            if lang == "en" or lang not in supported_languages:
                return text
            else:
                translated = self.translator.translate_text(text, source_lang=lang, target_lang="EN-US")
                return translated.text
        except Exception as e:
            log.error(f"[ TRANSLATE - {self.POST_ID} ][ Error during translation: {e}\nOriginal text: {text} ]")
            return "not_translated"

    def translate_comments(self, comments, delay: float = 0.1, max_retries: int = 3):
        log.info(f"[ TRANSLATE - {self.POST_ID} ][ Starting translation process.. ]")
        start_time = time.time()

        translated_comments = []

        for i, comment in enumerate(comments):
            text = str(comment["comment"])
            lang = str(comment["lang"])

            for attempt in range(1, max_retries + 1):
                try:
                    translated = self.translate(text, lang)
                    if text == translated:
                        translated=self.translate(text,"RO")

                    translated_comments.append({
                        "original_text": text,
                        "translated_text": translated,
                        "lang": lang
                    })
                    time.sleep(delay)
                    break
                except Exception as e:
                    log.error(
                        f"[ TRANSLATE - {self.POST_ID} ][ Attempt {attempt}/{max_retries} failed for comment {i}: {e} ]")
                    if attempt < max_retries:
                        time.sleep(2 * attempt)
                    else:
                        translated_comments.append({
                            "original_text": text,
                            "translated_text": "not_translated",
                            "lang": lang
                        })
                        break

        elapsed_time = time.time() - start_time
        log.info(
            f"[ TRANSLATE - {self.POST_ID} ][ Batch size: {len(comments)}. Translation completed in {elapsed_time:.2f} seconds. ]")

        return translated_comments