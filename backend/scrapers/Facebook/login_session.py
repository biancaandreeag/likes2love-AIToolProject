from Facebook.exceptions import ChromeProfileException, WebDriverException, LoginException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

from shared_utils.logger_config import log
from selenium import webdriver
from dotenv import load_dotenv
import pickle
import time
import os

load_dotenv()
COOKIES_FILE = os.getenv("COOKIES_FILE")
USER_AGENT = os.getenv("USER_AGENT")
PROFILE_DIR = "/chrome-profile"

#invalid cookie domain: Cookie 'domain' mismatch
class LoginSession:
    def __init__(self,uuid):
        self.id = uuid
        self.driver = self.setup_driver()

    def setup_driver(self):
        chrome_options = webdriver.ChromeOptions()

        chrome_options.add_argument(f"--user-agent={USER_AGENT}")
        chrome_options.add_argument("accept-language=en-US,en;q=0.9,fa;q=0.8")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--disable-webgl")
        chrome_options.add_argument("--disable-webrtc")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument(f"user-data-dir={PROFILE_DIR}")
        #chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        try:
            driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
            log.info(f"[ FACEBOOK SESSION - {self.id} ][ Driver set up successfully. ]")
            return driver
        except Exception as e:
            log.error(f"[ FACEBOOK SESSION - {self.id} ][ Error during Chrome setup: {e} ]")
            raise WebDriverException(f"WebDriver error: {e}")

    def load_cookies(self):
        if os.path.exists(COOKIES_FILE):
            try:
                with open(COOKIES_FILE, "rb") as f:
                    cookies = pickle.load(f)

                    if not cookies:
                        log.error(f"[ FACEBOOK SESSION - {self.id} ][ No cookies found in the file! ]")
                        return None

                    log.info(f"[ FACEBOOK SESSION - {self.id} ][ Loaded {len(cookies)} cookies. ]")
                    for cookie in cookies:
                        self.driver.add_cookie(cookie)

                    return True
            except Exception as e:
                log.error(f"[ FACEBOOK SESSION - {self.id} ][ Error loading cookies: {e} ]")
                return False
        else:
            log.error(f"[ FACEBOOK SESSION - {self.id} ][ Cookie file not found ]")
            return False

    def login(self):
        self.driver.get("https://www.facebook.com/")
        time.sleep(3)

        if os.path.exists(COOKIES_FILE):
            if self.load_cookies():
                self.driver.refresh()
                time.sleep(2)
                log.info(f"[ FACEBOOK SESSION - {self.id} ][ Cookies loaded. No need to accept again. ]")
                return
        else:
            log.info(f"[ FACEBOOK SESSION - {self.id} ][ Waiting for manual 'Allow all' acceptance... ]")
            time.sleep(10)


        log.info(f"[ FACEBOOK SESSION - {self.id} ][ Initialization successful! ]")

    def quit(self):
        try:
            self.driver.quit()
            log.info(f"[ FACEBOOK SESSION - {self.id} ][ Browser closed successfully. ]")
        except Exception as e:
            log.error(f"[ FACEBOOK SESSION - {self.id} ][ Error closing the browser: {e} ]")


