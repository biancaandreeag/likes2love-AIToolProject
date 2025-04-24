from kafka import KafkaConsumer
import json
import os
import time
from logger_config import log

class KafkaConsumerClient:
    def __init__(self, kafka_server: str = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'broker:29092'),
                 topic: str = 'to_preprocessing', group_id: str = 'preprocessor-group'):
        self.kafka_server = kafka_server
        self.topic = topic
        self.group_id = group_id
        self.consumer = None
        self.init_consumer()

    def init_consumer(self):
        retries = 5
        while retries > 0:
            try:
                print(f"[KAFKA CONSUMER] Connecting to Kafka broker at {self.kafka_server}...")
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
                print(f"[KAFKA CONSUMER] Connected and listening on topic '{self.topic}'...")
                break
            except Exception as e:
                print(f"[KAFKA CONSUMER] Connection error: {str(e)}")
                log.error(f"[KAFKA CONSUMER] Connection error: {str(e)}")
                retries -= 1
                if retries > 0:
                    time.sleep(5)
                else:
                    print("[KAFKA CONSUMER] Failed to connect after several retries.")
                    log.error("[KAFKA CONSUMER] Failed to connect after several retries.")

    def listen(self):
        if self.consumer:
            print(f"[KAFKA CONSUMER] Listening on topic '{self.topic}'...")
            for message in self.consumer:
                yield message
        else:
            print("[KAFKA CONSUMER] Not initialized.")
            log.error("[KAFKA CONSUMER] Not initialized.")

    def consume(self, message):
        print(f"[KAFKA CONSUMER] New message received. Key: {message.key} | Value: {message.value}")
        log.info(f"[KAFKA CONSUMER] New message received. Key: {message.key} | Value: {message.value}")
