from kafka_consumer import KafkaConsumerClient

def main():
    consumer = KafkaConsumerClient(kafka_server="broker:29092", topic="to_preprocessing")
    
    # Ascultă topic-ul și procesează mesajele
    for message in consumer.listen():
        consumer.consume(message)

if __name__ == "__main__":
    main()
