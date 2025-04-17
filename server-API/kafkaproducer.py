from kafka import KafkaProducer
import logging
import json
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from logger_config import log


class KafkaProducerClient:
    def __init__(self, kafka_server: str= 'localhost:9092', topic: str = 'scrape_comments'):
        self.producer = KafkaProducer(
            bootstrap_servers=kafka_server,
            value_serializer = lambda v: json.dumps(v).encode('utf-8')
        )
        self.topic = topic

    def send_topic(self, message: dict):
        try:
            self.producer.send(self.topic, message)
            self.producer.flush()
            log.info(f"[ KAFKA PRODUCER ][ Message sent to Kafka topic: ---{self.topic}--- : {message} ]")
        except Exception as e:
            log.error(f"[ KAFKA PRODUCER ][ Error sending message to Kafka: {str(e)} ]")

def send_to_preprocessor(uuid: str, post_link: str, model: str, comments: list):
    producer = KafkaProducer(topic='to_preprocessing')
    message = {
        "uuid" : uuid,
        "post_link" : post_link,
        "model" : model,
        "comments" : comments
    }
    producer.send_topic(message)

def send_to_scraper(uuid: str, post_link: str, model: str):
    producer = KafkaProducerClient(topic='to_scraper')
    message = {
        "uuid" : uuid,
        "post_link" : post_link,
        "model" : model
    }