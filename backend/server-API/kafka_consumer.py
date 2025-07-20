from database.database import posts_collection
from shared_utils.logger_config import log
from kafka import KafkaConsumer
import json
import time
import os

class KafkaConsumerClient:
    def __init__(self, kafka_server: str = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'broker:29092'),
                 topic: str = 'test_topic', group_id: str = 'test_group'):
        self.kafka_server = kafka_server
        self.topic = topic
        self.group_id = group_id
        self.consumer = None
        self.init_consumer()

    def init_consumer(self):
        retries = 5
        while retries > 0:
            try:
                log.info(f"[ KAFKA CONSUMER - '{self.topic}' ][ Connected on topic '{self.topic}'... ]")
                self.consumer = KafkaConsumer(
                    self.topic,
                    bootstrap_servers=self.kafka_server,
                    group_id=self.group_id,
                    enable_auto_commit=True,
                    heartbeat_interval_ms=10000,
                    session_timeout_ms=10000,
                    auto_offset_reset='earliest',
                    max_poll_interval_ms=300000,
                    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                    key_deserializer=lambda k: k.decode('utf-8') if k else None
                )
                break
            except Exception as e:
                log.error(f"[ KAFKA CONSUMER - '{self.topic}' ][ Connection error: {str(e)} ]")
                retries -= 1
                if retries > 0:
                    time.sleep(5)
                else:
                    log.error(f"[ KAFKA CONSUMER - '{self.topic}' ][ Failed to connect after several retries. ]")

    def listen(self):
        if self.consumer:
            log.info(f"[ KAFKA CONSUMER - '{self.topic}' ][ Listening on topic '{self.topic}'... ]")
            for message in self.consumer:
                yield message
        else:
            log.error(f"[ KAFKA CONSUMER - '{self.topic}' ][ Not initialized. ]")

    def consume(self, message):
        log.info(f"[ KAFKA CONSUMER - '{self.topic}' ][ New message received. Key: {message.key} ]")
        data = message.value

        if data.get("type") in ("general_analysis", "general_hate", "cyberbullying"):
            uuid = message.key
            result_data = {k: v for k, v in data.items() if k not in ("type", "post_link", "analysis_date")}

            analysis_entry = {
                "type": data.get("type"),
                "result": result_data
            }

            try:
                update_result = posts_collection.update_one(
                    {
                        "uuid": uuid,
                        "post_link": data.get("post_link"),
                        "analysis_date": data.get("analysis_date")
                    },
                    {"$push": {"analyses": analysis_entry}}
                )

                if update_result.matched_count == 0:
                    log.warning(f"[ DATABASE ][ No post found with UUID: {uuid} ]")
                else:
                    log.info(f"[ DATABASE ][ Analysis added to post {uuid} ]")

            except Exception as e:
                log.error(f"[ DATABASE ][ Error updating post with UUID {uuid}: {str(e)} ]")

        elif data.get("type") == "comments_labels":
            uuid = message.key
            try:
                query = {
                    "uuid": uuid,
                    "post_link": data.get("post_link"),
                    "analysis_date": data.get("analysis_date")
                }

                comments = data.get("comments", [])
                for item in comments:
                    update_fields = {
                        "comments.$[elem].preprocessed_comment": item.get("preprocessed_text"),
                        "comments.$[elem].label": item.get("label"),
                        "comments.$[elem].offensive_label": item.get("offensive_label"),
                    }

                    if "cyberbullying_label" in item:
                        update_fields["comments.$[elem].cyberbullying_label"] = item["cyberbullying_label"]

                    array_filters = [{"elem.comment": item["original_text"]}]

                    update_result = posts_collection.update_one(
                        query,
                        {"$set": update_fields},
                        array_filters=array_filters
                    )

                    if update_result.matched_count == 0:
                        log.warning(
                            f"[ DATABASE ][ No comment matched for UUID {uuid}, comment: {item['original_text']} ]"
                        )


            except Exception as e:
                log.error(f"[ DATABASE ][ Error updating comments labels for UUID {uuid}: {str(e)} ]")

        elif data.get("type") == "post_info":
            uuid = message.key
            try:
                query = {
                    "uuid": uuid,
                    "post_link": data.get("post_link"),
                    "analysis_date": data.get("analysis_date")
                }

                update_fields = {
                    "post_likes": data.get("post_likes"),
                    "post_no_comments": data.get("post_comments"),
                    "post_saved": data.get("post_saved"),
                    "post_distribution": data.get("post_distribution"),
                    "post_play": data.get("post_play")
                }

                update_fields_clean = {k: v for k, v in update_fields.items() if v is not None}

                update_result = posts_collection.update_one(query, {"$set": update_fields_clean})

                if update_result.matched_count == 0:
                    log.warning(f"[ DATABASE ][ No matching post found for post_info. UUID: {uuid} ]")
                else:
                    log.info(f"[ DATABASE ][ Updated post_info for post UUID: {uuid} ]")

            except Exception as e:
                log.error(f"[ DATABASE ][ Error updating post_info for UUID {uuid}: {str(e)} ]")

        elif isinstance(data, dict):
            try:
                if "post_name" not in data:
                    data["post_name"] = data["post_link"]
                result = posts_collection.insert_one(data)
                log.info(f"[ DATABASE ][ Inserted post with ID: {result.inserted_id} ]")

            except Exception as e:
                log.error(f"[ DATABASE ][ Error inserting post: {str(e)} ]")

        else:
            log.warning(f"[ DATABASE ][ Message value is not a proper post: {data} ]")
