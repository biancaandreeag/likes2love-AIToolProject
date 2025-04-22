from emoticons import EMOTICONS, UNICODE_EMO
from tqdm import tqdm
import pandas as pd
import sys
import re
import os

tqdm.pandas()

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from logger_config import log

class PreprocessData:
    @staticmethod
    def get_unique_filename(base_filename):
        directory = "FinalData"
        if not os.path.exists(directory):
            os.makedirs(directory)
        
        base_file_path = os.path.join(directory, f"{base_filename}.csv")
        
        if not os.path.exists(base_file_path):
            return base_filename  

        i = 1
        while os.path.exists(os.path.join(directory, f"{base_filename}({i}).csv")):
            i += 1
        
        return f"{base_filename}({i})"
    
    def __init__(self,file_path,post_id):
        self.file_path=file_path
        self.post_id=post_id

        output_name=post_id+"_preprocessed"
        output_name=self.get_unique_filename(f"{output_name}")

        if not os.path.exists('FinalData'):
            os.makedirs('FinalData')
            log.info(f"[ PREPROCESS ][ Directory 'FinalData' created ]")
        
        self.output_file = os.path.join('FinalData/', output_name + '.csv')

        self.df=pd.read_csv(self.file_path)
        self.df.dropna(subset=['translated_comment'], inplace=True) 

    def remove_urls(self,text):
     return re.sub(r'http[s]?://\S+', '', text)

    def remove_user_mentions(self,text):
        return re.sub(r'@[A-Za-z0-9_.]+', '', text)

    def remove_hashtags(self,text):
        return re.sub(r'#+(\S+)', r'\1', text)

    def remove_spaces(self,text):
        clean_text=" ".join(text.split())
        return clean_text

    def remove_repetition(self,text):
        sequencePattern   = r"(.)\1\1+"
        seqReplacePattern = r"\1\1"
        return re.sub(sequencePattern, seqReplacePattern, text)
    
    def convert_emoticons(self,text):
        for emot in EMOTICONS:
            text = re.sub(u'('+emot+')', "  ".join(EMOTICONS[emot].replace(",","").split()), text)
        return text

    def convert_emojis(self,text):
        for emot in UNICODE_EMO:
            text = re.sub(r'('+emot+')', "  ".join(UNICODE_EMO[emot].replace(",","").replace(":","").split()), text)
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
            if emoji_char not in UNICODE_EMO:
                text = text.replace(emoji_char, '')  
        return text
    
    def remove_symbols_and_special_chars(self, text):
        text = re.sub(r'[^\x00-\x7F]+', '', text) 
        return text
    
    def remove_invalid_characters(self, text):
        return re.sub(r'[^a-zA-Z0-9\s\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]+',' ', text)

    
    def preprocessing(self,text):
        text = self.remove_urls(text)
        text = self.remove_user_mentions(text)
        text = self.remove_hashtags(text)
        text = self.remove_spaces(text)
        text = self.remove_repetition(text)
        text = self.convert_emojis(text)
        text = self.convert_emoticons(text)
        text = self.remove_unknown_emojis(text)
        text = self.remove_symbols_and_special_chars(text)
        text = self.remove_invalid_characters(text)

        return text
    
    def preprocess_text(self):
        tqdm.pandas()
        
        self.df['translated_comment'] = [self.preprocessing(comment) for comment in tqdm(self.df['translated_comment'], desc="Preprocessing comments")]
        log.info(f"[ PREPROCESS - {self.post_id} ][ Preprocessing finished. ]")

        self.df.dropna(subset=['translated_comment'], inplace=True)
        self.df = self.df[~self.df['translated_comment'].str.strip().isin(['', '""'])]

        self.df = self.df.rename(columns={'translated_comment': 'comment'})

        self.df['comment'] = self.df['comment'].apply(lambda x: f"'{x}'" if isinstance(x, str) and not (x.startswith("'") and x.endswith("'")) else x)

        self.df.to_csv(self.output_file, index=False)
        log.info(f"[ PREPROCESS - {self.post_id} ][ Final data ready & saved in: {self.output_file} ]")