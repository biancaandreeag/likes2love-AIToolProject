from login_session import LoginSession
from scraper import FacebookScraper
import sys
import os

from shared_utils.logger_config import log

#validare corectitudine URL

def run():
    session = LoginSession()  
    scraper = FacebookScraper(session.driver)  

    try:
        session.login()

        post_url = "https://www.facebook.com/sorin.costreie/posts/pfbid033XtwXNLR886MbconPjPEtBLySaR7cmmeCTWijnNpFQRpZTnyGm81dxqKQ2TbF8rLl"
        scraper.navigate(post_url)
           
    except Exception as e:
        log.error(f"[ FACEBOOK-MAIN ] [ An error occurred: {e} ]")
        print(f"An error occurred: {e}")
    finally:
        input("Press Enter to close the browser...")
        log.info("[ FACEBOOK-MAIN ] [ Closing the application. ]")
        try:
            session.driver.quit()  
        except Exception as e:
            log.error(f"[ FACEBOOK-MAIN ] [ Error closing the driver: {e} ]")

if __name__ == "__main__":
    run()
