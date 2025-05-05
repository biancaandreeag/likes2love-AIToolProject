from shared_utils.logger_config  import log
from Tiktok.main import runTiktok
from Facebook.main import runFacebook


def go_to_scraper(url: str, uuid: str):
    if "tiktok" in url:
        log.info(f"[ SCRAPER - {uuid} ][ Beginning scraping on Tiktok social-media platform... ]")
        runTiktok(url,uuid)
    elif "facebook" in url:
        log.info(f"[ SCRAPER - {uuid} ][ Beginning scraping on Facebook social-media platform... ]")
        runFacebook(url,uuid)
