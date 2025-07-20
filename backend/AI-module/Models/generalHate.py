from transformers import AutoTokenizer, AutoModelForSequenceClassification
from scipy.special import softmax
from shared_utils.logger_config  import log
import urllib.request
import csv
import torch


class GeneralHateAnalyzer:
    def __init__(self):
        self.offensive_name = "cardiffnlp/twitter-roberta-base-offensive"
        self.irony_name = "cardiffnlp/twitter-roberta-base-irony"

        self.tok_off = AutoTokenizer.from_pretrained(self.offensive_name)
        self.model_off = AutoModelForSequenceClassification.from_pretrained(self.offensive_name)
        self.offensive_labels = self._load_labels(self.offensive_name)

        self.tok_iro = AutoTokenizer.from_pretrained(self.irony_name)
        self.model_iro = AutoModelForSequenceClassification.from_pretrained(self.irony_name)
        self.irony_labels = self._load_labels(self.irony_name)

    def _load_labels(self, model_name):
        task = model_name.split("-")[-1]
        mapping_link = f"https://raw.githubusercontent.com/cardiffnlp/tweeteval/main/datasets/{task}/mapping.txt"
        with urllib.request.urlopen(mapping_link) as f:
            html = f.read().decode('utf-8').split("\n")
            csvreader = csv.reader(html, delimiter='\t')
            labels = [row[1] for row in csvreader if len(row) > 1]
        return labels

    def predict(self, text, tokenizer, model, labels):
        inputs = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=256,
            padding=True
        )
        with torch.no_grad():
            outputs = model(**inputs)
        probs = softmax(outputs.logits.detach().cpu().numpy()[0])
        idx = probs.argmax()
        return labels[idx], float(probs[idx])

    def combined_analysis(self, text, irony_threshold=0.8):
        label_off, score_off = self.predict(text, self.tok_off, self.model_off, self.offensive_labels)
        label_iro, score_iro = self.predict(text, self.tok_iro, self.model_iro, self.irony_labels)

        if label_off == "offensive":
            final = "OFFENSIVE"
        elif label_off == "not-offensive" and label_iro == "irony" and score_iro >= irony_threshold:
            final = "OFFENSIVE"
        else:
            final = "NOT_OFFENSIVE"

        return {
            "text": text,
            "offensive": (label_off, score_off),
            "irony": (label_iro, score_iro),
            "final_label": final
        }

    def batch_summary(self, texts, irony_threshold=0.8):
        log.info(f"[ AI MODULE - GENERAL HATE ][ Starting analysis... ]")
        results = []
        counts = {"OFFENSIVE": 0, "NOT_OFFENSIVE": 0}
        offensive_comments = []

        for text in texts:
            res = self.combined_analysis(text, irony_threshold)
            results.append(res)
            if res["final_label"] == "OFFENSIVE":
                offensive_comments.append(res["text"])
            counts[res["final_label"]] += 1

        total = len(texts)
        percentages = {k: round((v / total) * 100, 2) for k, v in counts.items()}

        return {
            "summary": percentages,
            "counts": counts
        }, offensive_comments
