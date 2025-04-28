from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium import webdriver
import pickle
import time
import os


from shared_utils.logger_config import log

COOKIES_FILE = "cookies.pkl"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"

class InitializeSession:
    def __init__(self):
        self.driver = self.setup_driver()
        self.initialize_session()

    def setup_driver(self):
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument(f"--user-agent={USER_AGENT}")
        chrome_options.add_argument("accept-language=en-US,en;q=0.9,fa;q=0.8")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--disable-webgl")
        chrome_options.add_argument("--disable-webrtc")
        chrome_options.add_argument("--disable-gpu")
        #chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        try:
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            driver.set_window_size(400, 800) 
            log.info("[ TIKTOK SESSION ][ Driver set up successfully. ]")
            return driver
        except Exception as e:
            log.error(f"[ TIKTOK SESSION ][ Error during Chrome setup: {e} ]")
            raise Exception(f"WebDriver error: {e}")

    def save_cookies(self):
        time.sleep(3)
        cookies = self.driver.get_cookies()
        with open(COOKIES_FILE, "wb") as f:
            pickle.dump(cookies, f)
        log.info(f"[ TIKTOK SESSION ][ Cookies saved to {COOKIES_FILE} ]")

    def load_cookies(self):
        if os.path.exists(COOKIES_FILE):
            try:
                with open(COOKIES_FILE, "rb") as f:
                    cookies = pickle.load(f)

                if not cookies:
                    log.error("[ TIKTOK SESSION ][ No cookies found in the file! ]")
                    return None

                log.info(f"[ TIKTOK SESSION ][ Loaded {len(cookies)} cookies. ]")

                for cookie in cookies:
                    self.driver.add_cookie(cookie)

                log.info("[ TIKTOK SESSION ][ Cookies loaded successfully! ]")
                return True
            except Exception as e:
                log.error(f"[ TIKTOK SESSION ][ Error loading cookies: {e} ]")
                return False
        else:
            log.error("[ TIKTOK SESSION ][ Cookie file not found ]")
            return False

    def initialize_session(self):
        self.driver.get("https://www.tiktok.com/explore")
        time.sleep(3)

        if os.path.exists(COOKIES_FILE):
            if self.load_cookies():
                self.driver.refresh()
                time.sleep(2)
                log.info("[ TIKTOK SESSION ][ Cookies loaded. No need to accept again. ]")
                return
        else:
            log.info("[ TIKTOK SESSION ][ Waiting for manual 'Allow all' acceptance... ]")
            time.sleep(10)
            self.save_cookies()

        log.info("[ TIKTOK SESSION ][ Initialization successful! ]")

    def quit(self):
        try:
            self.driver.quit()
            log.info("[ TIKTOK SESSION ][ Browser closed successfully. ]")
        except Exception as e:
            log.error(f"[ TIKTOK SESSION ][ Error closing the browser: {e} ]")
