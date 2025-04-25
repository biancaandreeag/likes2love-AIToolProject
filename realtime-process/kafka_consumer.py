from kafka import KafkaConsumer
from shared_utils.kafka_producer import send_to_analysis
from preprocessing.translator import TextTranslator
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
        self.translator = TextTranslator()

    def init_consumer(self):
        retries = 5
        while retries > 0:
            try:
                log.info(f"[KAFKA CONSUMER] Connected and listening on topic '{self.topic}'...")
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
                log.error(f"[KAFKA CONSUMER] Connection error: {str(e)}")
                retries -= 1
                if retries > 0:
                    time.sleep(5)
                else:
                    log.error("[KAFKA CONSUMER] Failed to connect after several retries.")

    def listen(self):
        if self.consumer:
            log.info(f"[KAFKA CONSUMER] Listening on topic '{self.topic}'...")
            for message in self.consumer:
                yield message
        else:
            log.error("[KAFKA CONSUMER] Not initialized.")

    def consume_and_send(self, message):
        #log.info(f"[KAFKA CONSUMER] [ New message received. Key: {message.key} | Value: {message.value} ]")

        data=message.value
        message_type=data.get("type")

        if message_type=="metadata":
            send_to_analysis(data, message.key)
            self.translator.set_post_id(message.key) 
            model=data.get("model")

        if message_type=="comments_batch":
            id=data.get("_id")
            comments_list=data.get("comments",[])
            translated = self.translator.translate_comments(comments_list)
            batch = {
                "type":"comments_batch",
                "_id": id, 
                "comments": translated
            }
            log.info(f"[ TRANSLATE ][ Recieved and translated batch with {len(comments_list)} comments. ]")

        if message_type=="end":
            log.info(f"[ KAFKA CONSUMER ][ All messages with key: {message.key} sent to analysis. ]")

            


            
