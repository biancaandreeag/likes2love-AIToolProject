from shared_utils.kafka_producer import send_to_preprocessor,send_to_server
from shared_utils.logger_config import log
from TikTokApi import TikTokApi
import asyncio
import pytest
import os
import re

class TiktokScraper:
    def __init__(self,uuid,url,analysis_date):
        self.post_url = url
        self.uuid = uuid
        self.platform = "TikTok"
        self.analysis_date = analysis_date
        self.post_info = None
        self.video_id = None
        self.ms_token=None
        self.no_likes = None
        self.no_comm = None
        self.no_shares = None
        self.no_saves = None
        self.no_plays = None

    @pytest.mark.asyncio
    async def get_video_info(self):
        async with TikTokApi() as api:
            await api.create_sessions(ms_tokens=None, num_sessions=1, sleep_after=3,
                                      browser=os.getenv("TIKTOK_BROWSER", "chromium"),headless=False)
            video = api.video(
                url=self.post_url
            )

            video_info=await video.info()
            #log.info(f"{video_info}")
            self.no_likes = int(video_info["stats"]["diggCount"])
            self.no_comm = int(video_info["stats"]["commentCount"])
            self.no_shares = int(video_info["stats"]["shareCount"])
            self.no_saves = int(video_info["stats"]["collectCount"])
            self.no_plays = int(video_info["stats"]["playCount"])


    @pytest.mark.asyncio
    async def test_comment_page(self):
        comments_batch = []
        comments_database = []
        batch_size = 500

        api = TikTokApi()
        async with api:
            await api.create_sessions(ms_tokens=[self.ms_token], num_sessions=5, sleep_after=3,
                                      browser=os.getenv("TIKTOK_BROWSER", "chromium"), headless=False)
            video = api.video(id=self.video_id)
            index = 0

            async for comment in video.comments(count=1000000):
                cock_value = comment.as_dict
                comments_batch.append({
                    "lang":cock_value["comment_language"],
                    "comment":cock_value["text"]})
                comments_database.append({
                    "comment": cock_value["text"],
                    "likes": cock_value["digg_count"],
                    "post_time": cock_value["create_time"],
                    "no_replies":cock_value["reply_comment_total"]
                })
                index += 1
                if index == batch_size:
                    batch = {
                        "type": "comments_batch",
                        "comments": comments_batch.copy()
                    }
                    comments_batch.clear()
                    index = 0
                    send_to_preprocessor(batch, key=self.uuid)
                    log.info(f"[ SCRAPING ][ Sending comment batch {len(batch['comments'])} comments ]")

            if index != 0:
                batch = {
                    "type": "comments_batch",
                    "comments": comments_batch
                }
                send_to_preprocessor(batch, key=self.uuid)
                log.info(f"[ TIKTOK SCRAPER ][ Sending comment batch {len(batch['comments'])} comments ]")

            send_to_preprocessor({"type": "end", "uuid": self.uuid}, key=self.uuid)

            if comments_database:
                data_to_save = {
                    "uuid": self.uuid,
                    "post_link": self.post_url,
                    "platform": self.platform,
                    "analysis_date": self.analysis_date,
                    'comments': comments_database
                }

                send_to_server(data_to_save, key=self.uuid)

                log.info(f"[ TIKTOK SCRAPER - {self.uuid} ][ {len(comments_database)} comments to save]")
            else:
                log.info(f"[ TIKTOK SCRAPER - {self.uuid} ][ No comments to save. ]")



    def start_scraping(self):
        match = re.search(r'/video/(\d+)', self.post_url)
        if match:
            self.video_id = match.group(1)
            log.info(f"[ TIKTOK SCRAPER - {self.uuid} ][ Post ID: {self.video_id} ]")
            asyncio.run(self.test_comment_page())
            asyncio.run(self.get_video_info())
            self.post_info = {
                "type": "post_info",
                "uuid": self.uuid,
                "post_link": self.post_url,
                "platform": self.platform,
                "analysis_date": self.analysis_date,
                "post_comments": self.no_comm,
                "post_likes":self.no_likes,
                "post_distribution":self.no_shares,
                "post_saved":self.no_saves,
                "post_play":self.no_plays
            }
            send_to_server(self.post_info, key=self.uuid)