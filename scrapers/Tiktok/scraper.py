from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from shared_utils.kafka_producer import send_to_preprocessor,send_to_server
import time

from shared_utils.logger_config import log

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
            time.sleep(5) 
            log.info(f"[ TIKTOK SCRAPER ][ Navigated to {video_url}. ]")
            
            self.click_comment_button()
        
        except Exception as e:
            log.error(f"[ TIKTOK SCRAPER ][ Error navigating to {video_url}: {e} ]")
            print(f"Error navigating to {video_url}: {e}")

        
        except TimeoutError:
            log.error(f"[ TIKTOK SCRAPER ][ Timeout while trying to load {video_url}. ]")
            print(f"Timeout while trying to load {video_url}")
   
    def click_comment_button(self):
        try:
            comment_button = self.driver.find_element(By.CSS_SELECTOR, 'span[data-e2e="comment-icon"]')
            
            actions = ActionChains(self.driver)
            actions.move_to_element(comment_button).click().perform()
            
            log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ Comment button clicked successfully. ]")
            time.sleep(10)

            comment_count_element = WebDriverWait(self.driver, 10).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, 'strong[data-e2e="comment-count"]'))
            )

            comment_count = comment_count_element.text
            log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ Comments count: {comment_count}. ]")
            self.scroll_comment()
        
        except Exception as e:
            log.error(f"[ TIKTOK SCRAPER - {self.ID} ][ Error clicking on the comment button: {e} ]")

    def scroll_comment(self):
        try:
            WebDriverWait(self.driver, 10).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, 'div.css-riuz53-DivCommentMain-DivCommentMainWithoutScroll.ejcng165'))
            )

            last_height = self.driver.execute_script("return document.body.scrollHeight") 

            while True:
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(5)
                new_height = self.driver.execute_script("return document.body.scrollHeight")

                if new_height == last_height:
                    break

                last_height = new_height

            log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ Successfully scrolled through comments. ]")
            self.expand_all_replies()

        except Exception as e:
            log.error(f"[ TIKTOK SCRAPER - {self.ID} ][ Scrolling error: {e} ]")
    
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
            batch_size=10

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
                    
                    comments_batch.append(comment_text)
                    comments_database.append(comment_text)
                    if(len(comments_batch)==batch_size):
                        batch = {
                            "type":"comments_batch",
                            "comments":comments_batch.copy()
                        }
                        comments_batch.clear()
                        send_to_preprocessor(batch,key=self.ID)
                        log.info(f"[ SERVER API ][ Sending comment batch {len(batch['comments'])} comments ]")

                except Exception as e:
                    pass

            if comments_batch:
                batch = {
                    "type": "comments_batch",
                    "comments": comments_batch
                }
                send_to_preprocessor(batch,key=self.ID)
                log.info(f"[ SERVER API ][ Sending comment batch {len(batch['comments'])} comments ]")

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

