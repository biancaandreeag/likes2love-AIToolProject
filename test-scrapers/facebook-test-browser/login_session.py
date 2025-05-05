from exceptions import ChromeProfileException, WebDriverException, LoginException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium import webdriver
from dotenv import load_dotenv
import pickle
import time
import sys
import os

from shared_utils.logger_config import log


COOKIES_FILE = "cookies.pkl"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
PROFILE_DIR = "/chrome-profile"

class LoginSession:
    def __init__(self):
        self.driver = self.setup_driver()

    def setup_driver(self):
        chrome_options = webdriver.ChromeOptions()
        
        if os.path.exists(COOKIES_FILE):
            #chrome_options.add_argument("--headless=new")  
            chrome_options.add_argument("--disable-gpu")   
            chrome_options.add_argument("--no-sandbox")  
            chrome_options.add_argument("--disable-dev-shm-usage")  
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")

        if not os.path.exists(PROFILE_DIR):
            raise ChromeProfileException(f"Profile directory {PROFILE_DIR} not found!")
        chrome_options.add_argument(f"user-data-dir={PROFILE_DIR}")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option("useAutomationExtension", False)
        chrome_options.add_argument("--disable-extensions")  
        chrome_options.add_argument("--enable-unsafe-swiftshader") 
        chrome_options.add_argument(f"user-agent={USER_AGENT}")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")


        try:
            driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
            log.info("[ FACEBOOK SESSION ][ Driver set up successfully. ]")
            return driver
        except Exception as e:
            log.error(f"[ FACEBOOK SESSION ][ Error during Chrome setup: {e} ]")
            raise WebDriverException(f"WebDriver error: {e}")

    def load_cookies(self):
        if os.path.exists(COOKIES_FILE):
            try:
                with open(COOKIES_FILE, "rb") as f:
                    cookies = pickle.load(f)
                    if not cookies:
                        log.error("[ FACEBOOK SESSION ][ No cookies found in the file! ]")
                        return None

                    log.info(f"[ FACEBOOK SESSION ][ Loaded {len(cookies)} cookies. ]")

                    cookie_names = [cookie['name'] for cookie in cookies]
                    missing_cookies = [name for name in ['c_user', 'xs'] if name not in cookie_names]
                    if missing_cookies:
                        log.error(f"[ FACEBOOK SESSION ][ Missing cookies: {', '.join(missing_cookies)} ]")
                        return None

                    for cookie in cookies:
                        self.driver.add_cookie(cookie)
                    
                    log.info("[ FACEBOOK SESSION ][ Cookies loaded successfully! ]")
                    self.driver.refresh()
                    return cookies
            except Exception as e:
                log.error(f"[ FACEBOOK SESSION ][ Error loading cookies: {e} ]")
                return None
        else:
            log.error("[ FACEBOOK SESSION ][ Cookie file not found ]")
            return None

    def save_cookies(self):
        cookies = self.driver.get_cookies()
        
        cookie_names = [cookie['name'] for cookie in cookies]
        missing_cookies = [name for name in ['c_user', 'xs'] if name not in cookie_names]
        
        if missing_cookies:
            log.error(f"[ FACEBOOK SESSION ][ Missing cookies: {', '.join(missing_cookies)} ]")
            return
        
        with open(COOKIES_FILE, "wb") as f:
            pickle.dump(cookies, f)
        
        log.info(f"[ FACEBOOK SESSION ][ Saved {len(cookies)} cookies. ]")

    def login(self):
        self.driver.get("https://m.facebook.com/")
        time.sleep(3)

        if os.path.exists(COOKIES_FILE):
            self.load_cookies()
            self.driver.refresh()
            return 

        print("Manually login, cookies don't exist.")
        log.info(f"[ FACEBOOK SESSION ][ Manually login, cookies don't exist. ]")
        
        username = self.driver.find_element(By.ID, "email")
        password = self.driver.find_element(By.ID, "pass")

        phone_number = os.getenv("PHONE_NUMBER")
        password_value = os.getenv("PASSWORD")
        
        username.send_keys(phone_number)  
        password.send_keys(password_value)
        password.send_keys(Keys.RETURN)
        time.sleep(3)  

        self.save_cookies()

        if "login" in self.driver.current_url:
            log.error(f"[ FACEBOOK SESSION ][ Login error. Check your profile. ]")
            raise LoginException("Login error. Check your profile.")
        else:
            log.info(f"[ FACEBOOK SESSION ][ Login successful! ]")
            print("Login successful!")

