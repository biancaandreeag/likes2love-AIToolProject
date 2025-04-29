from kafka_consumer import KafkaConsumerClient
from shared_utils.logger_config import log
from fastapi import FastAPI
from routes import routes
import threading

#http://127.0.0.1:8000/docs -> pentru testare

app = FastAPI()
log.info("[ SERVER API ][ Connecting to database and starting API...]")

app.include_router(routes.router)

def start_consumer():
    consumer = KafkaConsumerClient(kafka_server="broker:29092", topic="to_server",group_id="server-group")
    for message in consumer.listen():
        consumer.consume(message)

@app.on_event("startup")
def startup_event():
    thread = threading.Thread(target=start_consumer, daemon=True)
    thread.start()
    log.info("[ SERVER API ][ Kafka Consumer started successfully in background thread. ]")
