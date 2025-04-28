from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
import time
import json
import sys
import os
import re

from shared_utils.logger_config import log

#https://www.tiktok.com/@gabrielflorescuuu/video/7492496067334835478

class TiktokScraper:
    def __init__(self, driver):
        self.driver = driver
        self.post_url = None 
        self.ID = None
        self.no_comments = None
        self.username = None

    def extract_video_id(self, url):
        try:
            match = re.search(r'video/(\d+)', url)
            username_match = re.search(r'tiktok\.com/(@[^/]+)/video', url)
            if match:
                POST_ID = match.group(1)
                self.ID=POST_ID
                if username_match:
                    self.username = username_match.group(1)
                    self.FILE_NAME = f'{self.username}_{self.ID}'
                else:
                    self.FILE_NAME = f'comments_{self.ID}'
                log.info(f"[ TIKTOK SCRAPER ][ Video ID extracted: {self.ID} ]")
            else:
                log.warning(f"[ TIKTOK SCRAPER ][ Video ID could not be extracted from the URL ]")
        except Exception as e:
            log.error(f"[ TIKTOK SCRAPER ][ Error extracting Video ID: {e} ]")
    
    def navigate(self, video_url):
        try:
            self.driver.get(video_url)
            self.post_url = video_url
            time.sleep(5) 
            log.info(f"[ TIKTOK SCRAPER ][ Navigated to {video_url} ]")
            
            self.extract_video_id(video_url)
            self.click_comment_button()
        
        except Exception as e:
            log.error(f"[ TIKTOK SCRAPER ][ Error navigating to {video_url}: {e} ]")
            print(f"Error navigating to {video_url}: {e}")

        
        except TimeoutError:
            log.error(f"[ TIKTOK SCRAPER ][ Timeout while trying to load {video_url} ]")
            print(f"Timeout while trying to load {video_url}")

    
    def click_comment_button(self):
        try:
            comment_button = self.driver.find_element(By.CSS_SELECTOR, 'span[data-e2e="comment-icon"]')
            
            actions = ActionChains(self.driver)
            actions.move_to_element(comment_button).click().perform()
            
            log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ Comment button clicked successfully. ]")
            time.sleep(2)

            comment_count_element = WebDriverWait(self.driver, 10).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, 'strong[data-e2e="comment-count"]'))
            )

            comment_count = comment_count_element.text
            log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ Comment count: {comment_count} ]")
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
                time.sleep(1)
                new_height = self.driver.execute_script("return document.body.scrollHeight")

                if new_height == last_height:
                    break

                last_height = new_height

            log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ Successfully scrolled through comments ]")
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
                    log.warning(f"[ TIKTOK SCRAPER - {self.ID} ][ Failed to process reply block: {e} ]")

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

    @staticmethod
    def get_unique_filename(base_filename):
        directory = "Results"
        if not os.path.exists(directory):
            os.makedirs(directory)
        
        base_file_path = os.path.join(directory, f"{base_filename}.json")
        
        if not os.path.exists(base_file_path):
            return base_filename  

        i = 1
        while os.path.exists(os.path.join(directory, f"{base_filename}({i}).json")):
            i += 1
        
        return f"{base_filename}_{i}"

    def save_comments(self):
        try:
            comments = []

            comment_blocks = self.driver.find_elements(By.CSS_SELECTOR, 'div.css-1k8xzzl-DivCommentContentWrapper')

            if not comment_blocks:
                log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ No comments found on this post. ]")

            for block in comment_blocks:
                try:
                    comment_text_elem = block.find_elements(By.CSS_SELECTOR, 'span[data-e2e="comment-level-1"] p')
                    comment_type = 'comment'

                    if not comment_text_elem:
                        comment_text_elem = block.find_elements(By.CSS_SELECTOR, 'span[data-e2e="comment-level-2"] p')
                        comment_type = 'reply'

                    if not comment_text_elem:
                        continue  

                    comment_text = comment_text_elem[0].text.strip()

                    try:
                        like_elem = block.find_element(By.CSS_SELECTOR, 'div.css-1nd5cw-DivLikeContainer span')
                        like_count = int(like_elem.text.strip()) if like_elem.text.strip().isdigit() else 0
                    except:
                        like_count = 0  

                    comments.append({
                        'type': comment_type,
                        'comment': comment_text,
                        'likes': like_count
                    })

                except Exception as e:
                    log.error(f"[ TIKTOK SCRAPER - {self.ID} ][ Error processing a comment block: {e} ]")

            if comments:
                data_to_save = {
                    'post_url': self.post_url,
                    'no_comments': len(comments),
                    'comments': comments
                }

                self.FILE_NAME=self.get_unique_filename(f"{self.FILE_NAME}")

                if not os.path.exists('Results'):
                    os.makedirs('Results')

                with open(f"Results/{self.FILE_NAME}.json", "w", encoding="utf-8") as json_file:
                    json.dump(data_to_save, json_file, ensure_ascii=False, indent=4)

                self.no_comments=len(comments)
                log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ {len(comments)} comments saved to Results/{self.FILE_NAME}]")
            else:
                log.info(f"[ TIKTOK SCRAPER - {self.ID} ][ No comments to save. ]")

        except Exception as e:
            log.error(f"[ TIKTOK SCRAPER - {self.ID} ][ Error while saving comments: {e} ]")

