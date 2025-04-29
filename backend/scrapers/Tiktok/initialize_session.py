from tiktok_captcha_solver import make_undetected_chromedriver_solver
from shared_utils.logger_config import log
import undetected_chromedriver as uc
from dotenv import load_dotenv
import pickle
import time
import os

load_dotenv()
api_key = os.getenv("API_KEY")
COOKIES_FILE = os.getenv("COOKIES_FILE")
USER_AGENT = os.getenv("USER_AGENT")

class InitializeSession:
    def __init__(self,uuid):
        self.ID=uuid
        self.driver = self.setup_driver()
        self.initialize_session()

    def setup_driver(self):
        chrome_options = uc.ChromeOptions() 

        chrome_options.add_argument(f"--user-agent={USER_AGENT}")
        chrome_options.add_argument("accept-language=en-US,en;q=0.9,fa;q=0.8")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--disable-webgl")
        chrome_options.add_argument("--disable-webrtc")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        try:
            driver = make_undetected_chromedriver_solver(api_key=api_key, options=chrome_options)
            driver.set_window_size(400, 800) 

            log.info(f"[ TIKTOK SESSION - {self.ID} ][ Driver set up successfully. ]")
            return driver
        except Exception as e:
            log.error(f"[ TIKTOK SESSION - {self.ID} ][ Error during Chrome setup: {e} ]")
            raise Exception(f"WebDriver error: {e}")

    def save_cookies(self):
        time.sleep(3)
        cookies = self.driver.get_cookies()
        with open(COOKIES_FILE, "wb") as f:
            pickle.dump(cookies, f)
        log.info(f"[ TIKTOK SESSION - {self.ID} ][ Cookies saved to {COOKIES_FILE}. ]")

    def load_cookies(self):
        if os.path.exists(COOKIES_FILE):
            try:
                with open(COOKIES_FILE, "rb") as f:
                    cookies = pickle.load(f)

                if not cookies:
                    log.error(f"[ TIKTOK SESSION - {self.ID} ][ No cookies found in the file! ]")
                    return None

                log.info(f"[ TIKTOK SESSION - {self.ID} ][ Loaded {len(cookies)} cookies. ]")

                for cookie in cookies:
                    self.driver.add_cookie(cookie)

                log.info(f"[ TIKTOK SESSION - {self.ID} ][ Cookies loaded successfully! ]")
                return True
            except Exception as e:
                log.error(f"[ TIKTOK SESSION - {self.ID} ][ Error loading cookies: {e} ]")
                return False
        else:
            log.error(f"[ TIKTOK SESSION - {self.ID} ][ Cookie file not found. ]")
            return False

    def initialize_session(self):
        self.driver.get("https://www.tiktok.com/explore")
        time.sleep(3)

        if os.path.exists(COOKIES_FILE):
            if self.load_cookies():
                self.driver.refresh()
                time.sleep(2)
                log.info(f"[ TIKTOK SESSION - {self.ID} ][ Cookies loaded. No need to accept again. ]")
                return
        else:
            log.info(f"[ TIKTOK SESSION - {self.ID} ][ Waiting for manual 'Allow all' acceptance... ]")
            time.sleep(10)
            self.save_cookies()

        log.info(f"[ TIKTOK SESSION - {self.ID} ][ Initialization successful! ]")

    def quit(self):
        try:
            self.driver.quit()
            log.info(f"[ TIKTOK SESSION - {self.ID} ][ Browser closed successfully. ]")
        except Exception as e:
            log.error(f"[ TIKTOK SESSION - {self.ID} ][ Error closing the browser: {e} ]")
