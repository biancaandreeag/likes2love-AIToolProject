from kafka import KafkaConsumer
from shared_utils.kafka_producer import send_to_server
from Models.generalAnalysis import GeneralSentimentAnalyzer
from Models.generalHate import GeneralHateAnalyzer
from Models.cyberbullyingAnalysis import CyberbullyingClassifier
import json
import os
import time
from shared_utils.logger_config  import log

class KafkaConsumerClient:
    def __init__(self, kafka_server: str = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'broker:29092'),
                 topic: str = 'test_topic', group_id: str = 'test_group'):
        self.kafka_server = kafka_server
        self.topic = topic
        self.group_id = group_id
        self.consumer = None
        self.init_consumer()
        self.all_data = []
        self.post_link = None
        self.platform = None
        self.analysis_date = None
        self.sentiment_analyzer = GeneralSentimentAnalyzer()
        self.hate_analyzer = GeneralHateAnalyzer()
        self.cyberbullying_analyzer = CyberbullyingClassifier()

    def init_consumer(self):
        retries = 5
        while retries > 0:
            try:
                log.info(f"[ KAFKA CONSUMER - '{self.topic}' ][ Connected on topic '{self.topic}'... ]")
                self.consumer = KafkaConsumer(
                    self.topic,
                    bootstrap_servers=self.kafka_server,
                    group_id=self.group_id,
                    enable_auto_commit=True,
                    heartbeat_interval_ms=1000,
                    session_timeout_ms=100000,
                    auto_offset_reset='earliest',
                    max_poll_interval_ms=300000,
                    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                    key_deserializer=lambda k: k.decode('utf-8') if k else None
                )
                break
            except Exception as e:
                log.error(f"[ KAFKA CONSUMER - '{self.topic}' ][ Connection error: {str(e)} ]")
                retries -= 1
                if retries > 0:
                    time.sleep(5)
                else:
                    log.error(f"[ KAFKA CONSUMER - '{self.topic}' ][ Failed to connect after several retries. ]")

    def listen(self):
        if self.consumer:
            log.info(f"[ KAFKA CONSUMER - '{self.topic}' ][ Listening on topic '{self.topic}'... ]")
            for message in self.consumer:
                yield message
        else:
            log.error(f"[ KAFKA CONSUMER - '{self.topic}' ][ Not initialized. ]")

    def consume(self, message):
        data = message.value
        message_type = data.get("type")

        if message_type == "metadata":
            self.post_link = data.get("post_link")
            self.platform = data.get("platform")
            self.analysis_date = data.get("analysis_date")
            log.info(f"[ KAFKA CONSUMER - '{self.topic}' ][ New message received. Key: {message.key} | Value: {message.value} ]")

        if message_type == "comments_batch":
            comments_list = data.get("comments", [])
            self.all_data.append(comments_list)

        if message_type == "end":
            log.info(f"[ KAFKA CONSUMER - '{self.topic}' ][ Data with key: {message.key} is ready for analysis. ]")

            flat_comments = [c for batch in self.all_data for c in batch]
            self.all_data = []

            if flat_comments:
                preprocessed_only = [item["preprocessed_text"] for item in flat_comments]

                sentiment_results = self.sentiment_analyzer.analyze_batch(preprocessed_only)
                general_results = sentiment_results["summary"]
                labeled_comments = sentiment_results["comments"]

                hate_results, offensive_texts = self.hate_analyzer.batch_summary(preprocessed_only)

                cyberbullying_raw = self.cyberbullying_analyzer.classify_comments(offensive_texts)
                cyberbullying_results = self.cyberbullying_analyzer.summarize_results(cyberbullying_raw)

                for result in [general_results, hate_results, cyberbullying_results]:
                    result.update({
                        "post_link": self.post_link,
                        "analysis_date": self.analysis_date
                    })

                general_results["type"] = "general_analysis"
                hate_results["type"] = "general_hate"
                cyberbullying_results["type"] = "cyberbullying"

                # creează un map din labeled_comments pentru lookup rapid
                label_lookup = {item["text"]: item["label"] for item in labeled_comments}

                offensive_index = 0
                full_labeled = []

                for original in flat_comments:
                    comment_text = original["preprocessed_text"]

                    labeled_comment = {
                        "original_text": original["original_text"],
                        "lang": original["lang"],
                        "preprocessed_text": comment_text,
                        "label": label_lookup.get(comment_text, "unknown")
                    }

                    if comment_text in offensive_texts:
                        labeled_comment["offensive_label"] = "offensive"
                        labeled_comment["cyberbullying_label"] = cyberbullying_raw[offensive_index]["predicted_label"]
                        offensive_index += 1
                    else:
                        labeled_comment["offensive_label"] = "not_offensive"

                    full_labeled.append(labeled_comment)

                labeled_results = {
                    "type": "comments_labels",
                    "post_link": self.post_link,
                    "analysis_date": self.analysis_date,
                    "comments": full_labeled
                }

                #log.info(f"[ KAFKA CONSUMER - '{self.topic}' ][ Final Labeled Comments: {labeled_results} ]")
                send_to_server(general_results, message.key)
                send_to_server(hate_results, message.key)
                send_to_server(cyberbullying_results, message.key)
                send_to_server(labeled_results, message.key)
