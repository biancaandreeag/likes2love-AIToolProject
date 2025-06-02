from transformers import AutoModelForSequenceClassification
from transformers import AutoTokenizer
import numpy as np
from scipy.special import softmax
import csv
import urllib.request

class GeneralSentimentAnalyzer:
    def __init__(self, task='sentiment'):
        self.task = task
        self.model_name = f"cardiffnlp/twitter-roberta-base-{task}"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)

        mapping_link = f"https://raw.githubusercontent.com/cardiffnlp/tweeteval/main/datasets/{task}/mapping.txt"
        with urllib.request.urlopen(mapping_link) as f:
            html = f.read().decode('utf-8').split("\n")
            csvreader = csv.reader(html, delimiter='\t')
            self.labels = [row[1] for row in csvreader if len(row) > 1]

        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)

    def analyze(self, text):
        encoded_input = self.tokenizer(text, return_tensors='pt')
        output = self.model(**encoded_input)
        scores = output[0][0].detach().numpy()
        scores = softmax(scores)

        ranking = np.argsort(scores)[::-1]
        results = []
        for i in ranking:
            results.append((self.labels[i], float(np.round(scores[i], 4))))
        return results

