from shared_utils.logger_config  import log
from Tiktok.main import run

def go_to_scraper(url: str, uuid: str):
    if "tiktok" in url:
        log.info(f"[ SCRAPER - {uuid} ][ Beginning scraping on Tiktok social-media platform... ]")
        run(url,uuid)
    elif "facebook" in url:
        log.info(f"[ SCRAPER - {uuid} ][ Beginning scraping on Facebook social-media platform... ]")
