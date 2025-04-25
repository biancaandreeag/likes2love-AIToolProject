from kafka_consumer import KafkaConsumerClient
from shared_utils.logger_config  import log

def main():
    consumer = KafkaConsumerClient(kafka_server="broker:29092", topic="to_preprocessing",group_id="preprocessor-group")

    for message in consumer.listen():
        consumer.consume_and_send(message)

    log.info(f"[KAFKA CONSUMER][ Finished preprocessing the messages.]")
if __name__ == "__main__":
    main()
