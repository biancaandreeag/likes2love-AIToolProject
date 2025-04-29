from kafka_consumer import KafkaConsumerClient
from shared_utils.logger_config import log

#de verificat conversia emoticoanelor, emoji urilor -> nu merge tot timpul cum trebuie
def main():
    consumer = KafkaConsumerClient(kafka_server="broker:29092", topic="to_preprocessing", group_id="preprocessor-group")
    
    for message in consumer.listen():
        consumer.consume_and_send(message)

    log.info(f"[ KAFKA CONSUMER - 'to_preprocessing' ][ Finished preprocessing the messages. ]")
     
if __name__ == "__main__":
    main()
