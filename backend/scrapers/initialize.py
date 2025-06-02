from shared_utils.logger_config  import log
from Tiktok.main import runTiktok
from Facebook.main import runFacebook


def go_to_scraper(url: str, uuid: str, platform: str):
    if platform == "tiktok":
        log.info(f"[ SCRAPER - {uuid} ][ Beginning scraping on Tiktok social-media platform... ]")
        runTiktok(url,uuid)
    if platform == "facebook":
        log.info(f"[ SCRAPER - {uuid} ][ Beginning scraping on Facebook social-media platform... ]")
        runFacebook(url,uuid)
