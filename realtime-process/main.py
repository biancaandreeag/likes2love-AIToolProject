from kafka_consumer import KafkaConsumerClient 

def main():
    consumer = KafkaConsumerClient(kafka_server="broker:29092", topic="to_preprocessing")
    
    consumer.consume()

if __name__ == "__main__":
    main()
