from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utils import Post
import time
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from logger_config import log

#no_comments_message mai bun

class FacebookScraper:
    def __init__(self, driver):
        self.driver = driver
        self.post = None

    def navigate(self, post_url):
        try:
            self.driver.get(post_url)
            self.post=Post(post_url)
            time.sleep(5) 
            log.info(f"[ FACEBOOK SCRAPER ][ Navigated to {post_url} ]")
            self.load_all()
        
        except Exception as e:
            log.error(f"[ FACEBOOK SCRAPER ][ Error navigating to {post_url}: {e} ]")
            print(f"Error navigating to {post_url}: {e}")

        
        except TimeoutError:
            log.error(f"[ FACEBOOK SCRAPER ][ Timeout while trying to load {post_url} ]")
            print(f"Timeout while trying to load {post_url}")


    def load_all(self):
        while True:
            try:
                container = WebDriverWait(self.driver, 15).until(
                    EC.presence_of_element_located((
                        By.CSS_SELECTOR,
                        'div.html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x78zum5.x13a6bvl'
                    ))
                )
        
                no_more_comments_message = self.driver.find_elements(By.XPATH, "//span[contains(text(), 'Este selectat modul de ordonare Cele mai relevante, deci s-ar putea ca unele comentarii să nu apară.')]")

                if no_more_comments_message:
                    log.info(f"[ FACEBOOK SCRAPER - {self.post.id} ] [ All resources loaded. ]")
                    self.click_all_reply_buttons()
                    break  

                self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", container)
                time.sleep(2)  

            except Exception as e:
                log.error(f"[ FACEBOOK SCRAPER - {self.post.id} ] [ Error in loading resources. ]")
                break  

    def click_all_reply_buttons_in_comments(self):
        try:
            # Găsește secțiunea de comentarii
            comments_section = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((
                    By.CSS_SELECTOR,
                    'div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6'
                ))
            )

            # Găsește toate butoanele de tip "Vezi răspunsuri" (fără span suplimentar în interior)
            reply_buttons = self.driver.find_elements(By.XPATH, 
                "//div[contains(@class, 'xdj266r') and contains(@role, 'button') and not(contains(@class, 'x1i10hfl'))]"
            )

            log.info(f"[ FACEBOOK SCRAPER - {self.post.id} ] [ Found {len(reply_buttons)} reply buttons in comments section. ]")

            # Iterează prin fiecare buton și apasă-l
            for i, button in enumerate(reply_buttons):
                try:
                    # Apasă pe butonul de răspuns
                    button.click()
                    log.info(f"[ FACEBOOK SCRAPER - {self.post.id} ] [ Clicked reply button {i + 1} ]")
                    time.sleep(1)  # Pauză între clickuri
                except Exception as click_error:
                    log.warning(f"[ FACEBOOK SCRAPER - {self.post.id} ] [ Failed to click reply button {i + 1}: {click_error} ]")

        except Exception as e:
            log.error(f"[ FACEBOOK SCRAPER - {self.post.id} ] [ Error while clicking reply buttons in comments: {e} ]")
