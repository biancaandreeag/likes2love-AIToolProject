from Facebook.login_session import LoginSession
from Facebook.scraper import FacebookScraper
from shared_utils.logger_config import log
import time

#chromedriver process problem

def runFacebook(post_url,uuid):
    session = LoginSession(uuid)  
    scraper = FacebookScraper(session.driver,uuid)  

    try:
        start_time = time.time()  
        session.login()
        scraper.navigate(post_url)
        end_time = time.time() 
        duration = end_time - start_time
        log.info(f"[ FACEBOOK-MAIN ] [ Duration: {duration:.2f} seconds ]")
        
           
    except Exception as e:
        log.error(f"[ FACEBOOK-MAIN ] [ An error occurred: {e} ]")
        print(f"An error occurred: {e}")
    finally:
        log.info(f"[ FACEBOOK-MAIN ] [ Closing the application. ]")
        try:
            session.quit()  
        except Exception as e:
            log.error(f"[ FACEBOOK-MAIN ] [ Error closing the driver: {e} ]")
