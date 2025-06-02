from shared_utils.kafka_producer import send_to_preprocessor,send_to_server
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from shared_utils.logger_config import log
import time

class TiktokScraper:
    def __init__(self, driver, uuid):
        self.driver = driver
        self.post_url = None 
        self.ID = uuid
        self.no_comments = None

    def navigate(self, video_url):
        try:
            self.driver.get(video_url)
            self.post_url = video_url
            time.sleep(20)
            log.info(f"[ TIKTOK SCRAPER ][ Navigated to {video_url}. ]")
            
            self.click_comment_button()
        
        except Exception as e:
            log.error(f"[ TIKTOK SCRAPER ][ Error navigating to {video_url}: {e} ]")
            print(f"Error navigating to {video_url}: {e}")

        
        except TimeoutError:
            log.error(f"[ TIKTOK SCRAPER ][ Timeout while trying to load {video_url}. ]")
            print(f"Timeout while trying to load {video_url}")

    def wait_for_captcha(self):
        try:
            WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".TUXModal-overlay"))
            )
            print("[ CAPTCHA DETECTED ] Waiting 15 seconds for manual solve...")
            time.sleep(15)
        except Exception as e:
            pass

   
    def click_comment_button(self):
        try:
            self.wait_for_captcha()
            close_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CLASS_NAME, "css-1o0yumu-DivXMarkWrapper"))
            )
            close_button.click()

            comment_button = self.driver.find_element(By.CSS_SELECTOR, 'span[data-e2e="comment-icon"]')
            
            actions = ActionChains(self.driver)
            actions.move_to_element(comment_button).click().perform()
            
            log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ Comment button clicked successfully. ]")
            time.sleep(3)

            comment_count_element = WebDriverWait(self.driver, 10).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, 'strong[data-e2e="comment-count"]'))
            )

            comment_count = comment_count_element.text
            log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ Comments count: {comment_count}. ]")
            self.scroll_comment()
        
        except Exception as e:
            log.error(f"[ TIKTOK SCRAPER - {self.ID} ][ Error clicking on the comment button: {e} ]")
            time.sleep(10)

    def scroll_comment(self):
        try:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'span[data-e2e="comment-level-1"]'))
            )

            last_count = 0
            unchanged_scrolls = 0
            max_attempts_without_new_comments = 3  # fail-safe: dacă nu apar comentarii noi de 3 ori consecutiv, ne oprim

            while True:
                comment_blocks = self.driver.find_elements(By.CSS_SELECTOR, 'span[data-e2e="comment-level-1"]')
                current_count = len(comment_blocks)

                if current_count == last_count:
                    unchanged_scrolls += 1
                    if unchanged_scrolls >= max_attempts_without_new_comments:
                        break  # Nu se mai încarcă comentarii noi
                else:
                    unchanged_scrolls = 0  # resetăm dacă am văzut progres

                last_count = current_count

                if comment_blocks:
                    last_comment = comment_blocks[-1]
                    try:
                        self.driver.execute_script(
                            "arguments[0].scrollIntoView({behavior: 'auto', block: 'center'});", last_comment
                        )
                        time.sleep(2.5)  # Așteaptă puțin mai mult pentru ca DOM-ul să se actualizeze
                    except Exception as e:
                        log.warning(f"[ TIKTOK SCRAPER - {self.ID} ][ Scroll failed for last comment: {e} ]")
                else:
                    break  # Nu avem comentarii vizibile deloc

            log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ All visible comments scrolled through successfully ]")
            self.expand_all_replies()

        except Exception as e:
            log.error(f"[ TIKTOK SCRAPER - {self.ID} ][ Scroll error: {e} ]")

    def expand_all_replies(self):
        try:
            clicked_any = False
            reply_blocks = self.driver.find_elements(
                By.XPATH, '//div[contains(@class, "css-9kgp5o-DivReplyContainer")]'
            )

            if not reply_blocks:
                return

            for block in reply_blocks:
                try:
                    self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'auto', block: 'center'});", block)
                    time.sleep(0.5)

                    clicked_buttons = set()

                    
                    while True:
                        view_replies_buttons = block.find_elements(By.XPATH, './/span[contains(text(), "View") and contains(text(), "replies")]')
                        view_reply_buttons = block.find_elements(By.XPATH, './/span[contains(text(), "View") and contains(text(), "reply")]')

                        all_buttons = view_replies_buttons + view_reply_buttons

                        if not all_buttons:
                            break

                        clicked_in_this_iteration = False

                        for button in all_buttons:
                            try:
                                button_xpath = self.driver.execute_script("return arguments[0].getAttribute('outerHTML');", button)

                                if button_xpath not in clicked_buttons and button.is_displayed():
                                    self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'auto', block: 'center'});", button)
                                    time.sleep(0.3)
                                    self.driver.execute_script("arguments[0].click();", button)
                                    time.sleep(1.2)  

                                    clicked_buttons.add(button_xpath)  
                                    clicked_any = True
                                    clicked_in_this_iteration = True

                                    time.sleep(1)

                            except Exception as e:
                                log.error(f"[ TIKTOK SCRAPER - {self.ID} ][ Error while clicking button: {e} ]")

                        if not clicked_in_this_iteration:
                            break  

                    if not clicked_any:
                        log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ No replies were expanded. ]")

                except Exception as e:
                    pass

            log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ All replies and 'View more', 'View replies', 'View reply' buttons clicked. ]")
            self.expand_all_view_more()
        except Exception as e:
            log.error(f"[ TIKTOK SCRAPER - {self.ID} ][ Error expanding replies: {e} ]")

    def expand_all_view_more(self):
        try:
            clicked_buttons = set() 

            while True:
                view_more_buttons = self.driver.find_elements(
                    By.XPATH, '//span[contains(text(), "View") and contains(text(), "more")]'
                )

                if not view_more_buttons:
                    log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ No more 'View more' buttons found. ]")
                    break

                clicked_in_this_iteration = False 

                for button in view_more_buttons:
                    try:
                        rect = button.rect
                        button_position = (rect['x'], rect['y'])  

                        if button_position not in clicked_buttons:
                            self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'auto', block: 'center'});", button)
                            time.sleep(0.3)  
                            self.driver.execute_script("arguments[0].click();", button)
                            clicked_buttons.add(button_position)  
                            clicked_in_this_iteration = True
                            time.sleep(1.5) 

                    except Exception as e:
                        log.warning(f"[ TIKTOK SCRAPER - {self.ID} ][ Error clicking 'View more' button at position {button_position}: {e} ]")

                if not clicked_in_this_iteration:
                    log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ No new 'View more' buttons clicked, exiting loop. ]")
                    break

            log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ All 'View more' buttons were expanded. ]")
            self.save_comments()
        except Exception as e:
            log.error(f"[TIKTOK SCRAPER - {self.ID} ][ Error expanding 'View more' replies: {e} ]")

    def save_comments(self):
        try:
            comments_batch=[]
            comments_database=[]
            batch_size=500

            comment_blocks = self.driver.find_elements(By.CSS_SELECTOR, 'div.css-1k8xzzl-DivCommentContentWrapper')

            if not comment_blocks:
                log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ No comments found on this post. ]")

            batch = 0
            for block in comment_blocks:
                try:
                    comment_text_elem = block.find_elements(By.CSS_SELECTOR, 'span[data-e2e="comment-level-1"] p')

                    if not comment_text_elem:
                        comment_text_elem = block.find_elements(By.CSS_SELECTOR, 'span[data-e2e="comment-level-2"] p')

                    if not comment_text_elem:
                        continue  

                    comment_text = comment_text_elem[0].text.strip()

                    try:
                        meta_spans = block.find_elements(By.CSS_SELECTOR, 'span.TUXText--weight-normal')
                        comment_day = meta_spans[0].text.strip() if len(meta_spans) > 0 else ""
                        like_count_raw = meta_spans[1].text.strip() if len(meta_spans) > 1 else "0"
                        like_count = int(like_count_raw.replace(",", "")) if like_count_raw.isdigit() else 0
                    except Exception as e:
                        log.warning(f"[ TIKTOK SCRAPER - {self.ID} ][ Failed to extract metadata: {e} ]")
                        comment_day = ""
                        like_count = 0
                    
                    comments_batch.append(comment_text)
                    comments_database.append({
                        "comment": comment_text,
                        "likes": like_count,
                        "post_time": comment_day
                    })

                    if(len(comments_batch)==batch_size):
                        batch = {
                            "type":"comments_batch",
                            "comments":comments_batch.copy()
                        }
                        comments_batch.clear()
                        send_to_preprocessor(batch,key=self.ID)
                        log.info(f"[ SCRAPING ][ Sending comment batch {len(batch['comments'])} comments ]")

                except Exception as e:
                    pass

            if comments_batch:
                batch = {
                    "type": "comments_batch",
                    "comments": comments_batch
                }
                send_to_preprocessor(batch,key=self.ID)
                log.info(f"[ SCRAPING ][ Sending comment batch {len(batch['comments'])} comments ]")

            send_to_preprocessor({"type": "end", "uuid": self.ID}, key=self.ID)

            if comments_database:
                data_to_save = {
                    "uuid":self.ID,
                    "post_link":self.post_url,
                    'comments': comments_database
                }
                self.no_comments=len(comments_database)
                send_to_server(data_to_save,key=self.ID)
                log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ {len(comments_database)} comments: {data_to_save}]")
            else:
                log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ No comments to save. ]")

        except Exception as e:
            log.error(f"[ TIKTOK SCRAPER - {self.ID} ][ Error while saving comments: {e} ]")

