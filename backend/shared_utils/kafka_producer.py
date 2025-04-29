from shared_utils.logger_config import log
from kafka import KafkaProducer
import json
import os


class KafkaProducerClient:
    def __init__(self, topic, kafka_server: str = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'broker:29092')):
        self.producer = KafkaProducer(
            bootstrap_servers=kafka_server,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None,
            retries=5,
            acks='all',
            request_timeout_ms=2000
        )
        self.topic = topic


    def send_topic(self, message: dict, key: str = None):  
        try:
            self.producer.send(self.topic, value=message, key=key)
            self.producer.flush()
            #log.info(f"[ KAFKA PRODUCER ][ Sent to topic: {self.topic} | Key: {key} | Message: {message} ]")
            log.info(f"[ KAFKA PRODUCER - {self.topic} ][ Message with key: {key} sent to topic. ]")
        except Exception as e:
            log.error(f"[ KAFKA PRODUCER - {self.topic} ][ Error sending message to Kafka: {str(e)} ]")
        finally:
            self.producer.close()

def send_to_preprocessor(message: dict, key: str = None):
    producer = KafkaProducerClient(topic='to_preprocessing')
    producer.send_topic(message, key)

def send_to_analysis(message: dict, key: str = None):
    producer = KafkaProducerClient(topic='to_analysis')
    producer.send_topic(message, key)

def send_to_scraper(message: dict, key: str = None):
    producer = KafkaProducerClient(topic='to_scraper')
    producer.send_topic(message, key)

def send_to_server(message:dict, key: str=None):
    producer = KafkaProducerClient(topic='to_server')
    producer.send_topic(message,key)
