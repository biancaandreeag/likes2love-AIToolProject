from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from shared_utils.logger_config import log
import time


class FacebookScraper:
    def __init__(self, driver,uuid):
        self.driver = driver
        self.id=uuid
        self.post_url=None

    def navigate(self, post_url):
        try:
            self.driver.get(post_url)
            self.post_url=post_url
            time.sleep(5) 
            log.info(f"[ FACEBOOK SCRAPER ][ Navigated to {post_url} ]")
            self.set_comment_filter_to_all()
        
        except Exception as e:
            log.error(f"[ FACEBOOK SCRAPER ][ Error navigating to {post_url}: {e} ]")
            print(f"Error navigating to {post_url}: {e}")

        except TimeoutError:
            log.error(f"[ FACEBOOK SCRAPER ][ Timeout while trying to load {post_url} ]")
            print(f"Timeout while trying to load {post_url}")
    
    def set_comment_filter_to_all(self):
        try:
            filter_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//div[@role='button' and .//span[contains(text(), 'Toate comentariile') or contains(text(), 'Cele mai relevante') or contains(text(), 'Cele mai noi')]]"
                ))
            )
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", filter_button)
            time.sleep(1)
            filter_button.click()
            log.info(f"[ FACEBOOK SCRAPER - {self.id} ] [ Clicked comment filter dropdown button. ]")

            all_comments_option = WebDriverWait(self.driver, 5).until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//span[contains(text(), 'Toate comentariile')]"
                ))
            )
            time.sleep(3)
            all_comments_option.click()
            log.info(f"[ FACEBOOK SCRAPER - {self.id} ] [ Selected 'Toate comentariile' option. ]")
            self.load_all()

        except Exception as e:
            log.warning(f"[ FACEBOOK SCRAPER - {self.id} ] [ Could not set comment filter to 'Toate comentariile': {e} ]")

    def load_all(self):
        try:
            scroll_container = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR,
                                                "div.html-div.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp"
                                                ))
            )

            seen = set()
            stable_scrolls = 0
            retries = 0

            while True:
                comments = scroll_container.find_elements(By.CSS_SELECTOR,
                                                          "div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs"
                                                          )

                new_scrolls = 0
                for comment in comments:
                    try:
                        identifier = comment.text.strip()[:150]
                        if identifier in seen:
                            continue

                        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", comment)

                        # Așteaptă 1-2 secunde ca să dea timp Facebook să încarce în fundal comentarii noi
                        time.sleep(1.5)

                        # Verifică dacă după scroll s-a schimbat numărul de comentarii
                        updated_comments = scroll_container.find_elements(By.CSS_SELECTOR,
                                                                          "div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs"
                                                                          )
                        if len(updated_comments) > len(comments):
                            comments = updated_comments

                        seen.add(identifier)
                        new_scrolls += 1

                    except Exception:
                        continue

                if comments:
                    self.driver.execute_script("arguments[0].scrollIntoView({block: 'end'});", comments[-1])
                    time.sleep(1)

                if new_scrolls == 0:
                    stable_scrolls += 1
                else:
                    stable_scrolls = 0
                    retries = 0

                # Dacă am avut 3 iterări fără noutăți, mai încercăm o dată complet
                if stable_scrolls >= 3:
                    if retries < 2:
                        retries += 1
                        stable_scrolls = 0
                        time.sleep(2)
                        continue
                    else:
                        break

            log.info(f"[ FACEBOOK SCRAPER - {self.id} ] [ Finished scrolling all comments. Total unique: {len(seen)} ]")
            self.click_all_reply_buttons()

        except Exception as e:
            log.error(f"[ FACEBOOK SCRAPER - {self.id} ] [ Error during element-wise scroll: {e} ]")

    def click_all_reply_buttons(self):
        try:
            post_container = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR,
                    'div.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp'
                ))
            )

            clicked = set()
            unchanged_rounds = 0

            while True:
                reply_buttons = post_container.find_elements(
                    By.XPATH,
                    ".//div[contains(@role, 'button') and .//span[contains(text(), 'răspuns') and (contains(text(), 'Vezi') or contains(text(), 'a ') or contains(text(), 'vezi'))]]"
                )


                newly_clicked = 0
                for btn in reply_buttons:
                    try:
                        btn_id = btn.text + str(btn.location['y']) 
                        if btn_id in clicked:
                            continue

                        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
                        time.sleep(0.3)
                        btn.click()
                        time.sleep(0.8)
                        clicked.add(btn_id)
                        newly_clicked += 1
                    except Exception as e:
                        log.warning(f"[ FACEBOOK SCRAPER - {self.id} ] [ Failed to click reply button: {e} ]")
                        continue

                if newly_clicked == 0:
                    unchanged_rounds += 1
                else:
                    unchanged_rounds = 0

                if unchanged_rounds >= 3:
                    break

            log.info(f"[ FACEBOOK SCRAPER ] [ Finished clicking all reply buttons. Total: {len(clicked)} ]")
            self.save_comments()

        except Exception as e:
            log.error(f"[ FACEBOOK SCRAPER  [ Error while clicking reply buttons: {e} ]")

    def save_comments(self):
        try:
            comments = []

            comment_blocks = self.driver.find_elements(By.CSS_SELECTOR,
                'div.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp'
            )

            if not comment_blocks:
                log.info(f"[ FACEBOOK SCRAPER - {self.id} ][ No comment blocks found. ]")
                return

            for block in comment_blocks:
                try:
                    text_elements = block.find_elements(By.CSS_SELECTOR, 'div[dir="auto"]')

                    for elem in text_elements:
                        text = elem.text.strip()
                        if text:
                            comments.append(text)

                except Exception as e:
                    log.warning(f"[ FACEBOOK SCRAPER - {self.id} ][ Failed to process a comment block: {e} ]")

            if comments:
                data_to_save = {
                    'post_url': self.post_url,
                    'comments': comments
                }

                print(f"{data_to_save}")
                log.info(f"[ FACEBOOK SCRAPER - {self.id} ][ {len(comments)} comments saved. ]")
            else:
                log.info(f"[ FACEBOOK SCRAPER - {self.id} ][ No valid comments to save. ]")

        except Exception as e:
            log.error(f"[ FACEBOOK SCRAPER - {self.id} ][ Error while saving comments: {e} ]")
