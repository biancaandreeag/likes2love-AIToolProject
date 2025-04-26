from kafka.admin import KafkaAdminClient, NewTopic
from kafka.errors import TopicAlreadyExistsError
from  shared_utils.logger_config import log
from kafka import KafkaProducer
import json
import os


class KafkaProducerClient:
    def __init__(self, topic, kafka_server: str = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'broker:29092')):
        create_topic(topic, kafka_server)  
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
            log.info(f"[ KAFKA PRODUCER - {self.topic}][ Message with key: {key} sent to topic. ]")
        except Exception as e:
            log.error(f"[ KAFKA PRODUCER ][ Error sending message to Kafka: {str(e)} ]")
        finally:
            self.producer.close()

def send_to_preprocessor(message: dict, key: str = None):
    producer = KafkaProducerClient(topic='to_preprocessing')
    producer.send_topic(message, key)

def send_to_analysis(message: dict, key: str = None):
    producer = KafkaProducerClient(topic='to_analysis')
    producer.send_topic(message, key)

def create_topic(topic_name, kafka_server='broker:29092', partitions=5, replication_factor=1):
    try:
        admin_client = KafkaAdminClient(bootstrap_servers=kafka_server)
        existing_topics = admin_client.list_topics()
        if topic_name not in existing_topics:
            topic = NewTopic(name=topic_name, num_partitions=partitions, replication_factor=replication_factor)
            admin_client.create_topics([topic])
            log.info(f"[KAFKA ADMIN][ Created topic '{topic_name}' with {partitions} partitions. ]")
    except Exception as e:
        log.error(f"[KAFKA ADMIN][ Failed to create topic: {e} ]")