from kafka import KafkaProducer
import json
import os
from logger_config import log

class KafkaProducerClient:
    def __init__(self, topic, kafka_server: str = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'broker:29092')):
        self.producer = KafkaProducer(
            bootstrap_servers=kafka_server,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            retries=5,
            acks='all',
            request_timeout_ms=2000
        )
        self.topic = topic

    def send_topic(self, message: dict):
        try:
            self.producer.send(self.topic, message)
            self.producer.flush()
            print(f"[ KAFKA PRODUCER ] Message sent to Kafka topic: {self.topic} | Message: {message}")
            log.info(f"[ KAFKA PRODUCER ][ Message sent to Kafka topic: {self.topic} | Message: {message} ]")
        except Exception as e:
            print(f"[ KAFKA PRODUCER ] Error sending message to Kafka: {str(e)}")
            log.error(f"[ KAFKA PRODUCER ][ Error sending message to Kafka: {str(e)} ]")
        finally:
            self.producer.close() 

def send_to_preprocessor(message: dict):
    producer = KafkaProducerClient(topic='to_preprocessing') 
    producer.send_topic(message)  
