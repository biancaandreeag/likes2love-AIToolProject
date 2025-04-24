from shared_utils.kafka_consumer import KafkaConsumerClient

def main():
    consumer = KafkaConsumerClient(kafka_server="broker:29092", topic="to_analysis",group_id="analysis-group")

    for message in consumer.listen():
        consumer.consume(message)

if __name__ == "__main__":
    main()
