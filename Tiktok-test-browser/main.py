from initialize_session import InitializeSession
from scraper import TiktokScraper
import time 
import sys 
import re
import os

from shared_utils.logger_config import log

#CAPCHA
#view more la comentarii

def run():
    session = InitializeSession() 
    scraper = TiktokScraper(session.driver)

    try:
        while True:
            post_url = "https://www.tiktok.com/@gabrielflorescuuu/video/7492496067334835478"
        
           
            start_time = time.time()  
            scraper.navigate(post_url)
            end_time = time.time() 
            duration = end_time - start_time
            log.info(f"[ TIKTOK-MAIN ] [ Duration: {duration:.2f} seconds ]")
        
    except Exception as e:
        log.error(f"[ TIKTOK-MAIN ] [ An error occurred: {e} ]")
        print(f"An error occurred: {e}")
    finally:
        log.info("[ TIKTOK-MAIN ] [ Closing the application. ]")
        try:
            session.quit()  
        except Exception as e:
            log.error(f"[ TIKTOK-MAIN ] [ Error closing the driver: {e} ]")

if __name__ == "__main__":
     run()

