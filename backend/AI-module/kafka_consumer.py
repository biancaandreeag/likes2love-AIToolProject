from kafka import KafkaConsumer
from GeneralSentiment.generalAnalysis import GeneralSentimentAnalyzer
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
        self.analyzer = GeneralSentimentAnalyzer(task='sentiment')

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
                    heartbeat_interval_ms=10000,
                    session_timeout_ms=10000,
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
        data=message.value
        message_type=data.get("type")

        if message_type == "metadata":
            log.info(f"[ KAFKA CONSUMER - '{self.topic}' ][ New message received. Key: {message.key} | Value: {message.value} ]")

        if message_type == "comments_batch":
            comments_list = data.get("comments", [])
            self.all_data.append(comments_list)

        if message_type=="end":
            log.info(f"[ KAFKA CONSUMER - '{self.topic}'  ][ Data with key: {message.key} is ready for analysis. ]")
            log.info(f"[ KAFKA CONSUMER - '{self.topic}' ][ Data: {self.all_data}, size: {len(self.all_data)} ]")

            
