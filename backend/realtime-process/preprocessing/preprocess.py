from preprocessing.emoticons import EMOTICONS, EMO_UNICODE
from preprocessing.abbreviations import INTERNET_SLANG
from shared_utils.logger_config import log
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from spellchecker import SpellChecker
from nltk.corpus import stopwords
import pandas as pd
import contractions
import unicodedata
import warnings
import time
import nltk
import re

warnings.simplefilter("ignore", category=SyntaxWarning)
sequencePattern = r"(.)\1\1+"
seqReplacePattern = r"\1\1"

class PreprocessData:    
    def __init__(self):
        self.post_id = None
        self.post_model = "transformers"
        self.lemmatizer = None
        self.stop_words = None
        self.spell = SpellChecker()
        self.UNICODE_EMO = {v: k for k, v in EMO_UNICODE.items()}
        

    def configuration(self, post_id, model="transformers"):
        self.post_id = post_id
        self.post_model = model
        if self.post_model == 'classifier':
            self.stop_words = set(stopwords.words('english')) - {'not', 'no', 'nor', 'never'} 
            self.lemmatizer = WordNetLemmatizer()

    def convert_emoticons(self, text):
        for emot in EMOTICONS:
            replacement = EMOTICONS[emot].replace(",", "").replace(":", "").replace("_", " ")
            replacement = "  ".join(replacement.split())
            replacement = " " + replacement + " "
            text = re.sub(u'(' + re.escape(emot) + ')', replacement, text)
        return text

    def convert_emojis(self, text):
        for emot in self.UNICODE_EMO:
            replacement = self.UNICODE_EMO[emot].replace(",", "").replace(":", "").replace("_", " ")
            replacement = "  ".join(replacement.split())
            replacement = " " + replacement + " "
            text = re.sub(r'(' + re.escape(emot) + ')', replacement, text)
        return text

    def remove_unknown_emojis(self, text):
        emoji_pattern = re.compile("[" 
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
            u"\U00002702-\U000027B0"  # miscellaneous symbols
            u"\U0001F900-\U0001F9FF"  # supplemental symbols
            u"\U0001F200-\U0001F251"  # enclosed characters
            u"\U0001F004-\U0001F0CF"  # playing cards
            u"\U00002B50"  # star symbol
            "]+", flags=re.UNICODE)
        
        emojis_in_text = emoji_pattern.findall(text)
        
        for emoji_char in emojis_in_text:
            if emoji_char not in self.UNICODE_EMO:
                text = text.replace(emoji_char, '')  
        return text

    def normalize_text(self, text):
        patterns_ethnicity = [
            r'\bnigg(a|ah|as|az|ers)?\b',  # nigga, niggas, etc.
            r'\bg[iy]ps(y|ie|ies|i)?\b',  # gipsy, gypsy, gypsies, etc.
            r'\bcrows?\b',  # crow, crows
        ]
        patterns_religion = [
            r'\bchrist(?:an|ans|ianity|ian)\b'
            r'\bsovereignist(s)?\b'
        ]

        patterns_gender = [

        ]

        patterns_age = [

        ]

        for pattern in patterns_ethnicity:
            text = re.sub(pattern, 'nigger', text, flags=re.IGNORECASE)
        for pattern in patterns_religion:
            text = re.sub(pattern, 'muslim', text, flags=re.IGNORECASE)

        return text
    
    def convert_emojis_and_slang(self, text):
        text = self.convert_emoticons(text)
        text = self.convert_emojis(text)
        text = self.remove_unknown_emojis(text)
        text = self.remove_accented_chars(text)
        
        for slang, full_text in INTERNET_SLANG.items():
            text = re.sub(r'\b' + re.escape(slang) + r'\b', full_text, text, flags=re.IGNORECASE)
    
        return text
 
    def correction_stopwords_lemmatize(self, text):
        if not isinstance(text, str):
            return ""

        text = contractions.fix(text)
        tokens = word_tokenize(text)
        corrected_and_lemmatized_tokens = []

        for word in tokens:
            if word in self.stop_words:
                continue 

            corrected = word
            if self.spell.unknown([word]):
                possible_correction = self.spell.correction(word)
                if possible_correction is not None:
                    corrected = possible_correction 

            lemmatized = self.lemmatizer.lemmatize(corrected)
            corrected_and_lemmatized_tokens.append(lemmatized)

        return " ".join(corrected_and_lemmatized_tokens)
    
    def remove_accented_chars(self,text):
        text = contractions.fix(text)
        return unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8', 'ignore') 
    
    def preprocess_text(self, comments):
        start_time = time.time()
        df_comments = pd.DataFrame(comments, columns=['text'])
        
        if self.post_model == "classifier":
            log.info(f"[ PREPROCESS - {self.post_id} ][ Starting preprocess for classifier model... ]")
            df_comments['text']=df_comments['text'].str.replace(r"http\S+", "", regex=True) #remove URLs
            df_comments['text']=df_comments['text'].str.replace(r'@[A-Za-z0-9_.-]+', '', regex=True) #remove user mentions
            df_comments['text']=df_comments['text'].str.replace(r'#+(\S+)', r'\1', regex=True) #remove hashtags
            df_comments['text']=df_comments['text'].str.replace(sequencePattern, seqReplacePattern, regex=True) #remove repetition

            df_comments['text']=df_comments['text'].apply(lambda x: self.convert_emojis_and_slang(x))
            df_comments['text']=df_comments['text'].str.replace(r'\d+', '', regex=True) #remove digits
            df_comments['text']=df_comments['text'].str.replace(r'[^\w\s]', '', regex=True) #remove punctuation
            df_comments['text']=df_comments['text'].str.replace(r'\s+', ' ', regex=True) #remove spaces
            df_comments['text']=df_comments['text'].str.replace(r'[^a-zA-Z\s]', '', regex=True) #nothing but words
            df_comments['text']=df_comments['text'].str.replace(r'\s+', ' ', regex=True).str.strip()
            df_comments['text']=df_comments['text'].str.lower()
            df_comments['text']=df_comments['text'].apply(lambda x: self.correction_stopwords_lemmatize(x))
        
        if self.post_model == "transformers":
            log.info(f"[ PREPROCESS - {self.post_id} ][ Starting preprocess for transformer model... ]")
            df_comments['text']=df_comments['text'].str.replace(r"http\S+", "URL", regex=True)
            df_comments['text']=df_comments['text'].str.replace(r'@[A-Za-z0-9_.]+', 'USER', regex=True) #remove user mentions
            df_comments['text']=df_comments['text'].str.replace(r'#+(\S+)', r'\1', regex=True) #remove hashtags
            df_comments['text']=df_comments['text'].str.replace(r'\s+', ' ', regex=True) #remove spaces
            df_comments['text'] = df_comments['text'].apply(lambda x: self.convert_emojis_and_slang(x))
            df_comments['text'] = df_comments['text'].apply(lambda x: re.sub(r'[^a-zA-Z0-9\s.,!?;:]', '', x))
            df_comments['text'] = df_comments['text'].apply(self.normalize_text)

        df_comments = df_comments[df_comments['text'].notna() & (df_comments['text'].str.strip() != "")]
        preprocessed_comments = df_comments['text'].tolist()
        end_time = time.time()
        elapsed_time = end_time - start_time  
        log.info(f"[ PREPROCESS - {self.post_id} ][ Preprocessing completed in {elapsed_time:.2f} seconds. ]")
        
        del df_comments
        return preprocessed_comments