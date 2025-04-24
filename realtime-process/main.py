from shared_utils.kafka_consumer import KafkaConsumerClient

def main():
    consumer = KafkaConsumerClient(kafka_server="broker:29092", topic="to_preprocessing",group_id="preprocessor-group")

    for message in consumer.listen():
        consumer.consume_analysis(message)

if __name__ == "__main__":
    main()
