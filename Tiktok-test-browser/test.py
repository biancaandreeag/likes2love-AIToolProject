from tiktok_captcha_solver import make_undetected_chromedriver_solver
from selenium_stealth import stealth
import undetected_chromedriver as uc

# !!! Nu folosim Selenium clasic deloc !!!

chrome_options = uc.ChromeOptions()
# chrome_options.add_argument("--headless=chrome")  # Optional, doar dacă vrei headless
chrome_options.add_argument("--disable-blink-features=AutomationControlled")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

api_key = "7c9f4270b60de76b5fef6a9b397efa7d"

# Aici este important: options=chrome_options
driver = make_undetected_chromedriver_solver(api_key=api_key, options=chrome_options)

# Optional: mai mult stealth
#stealth(driver)

# Driver-ul tău este gata acum să navigheze pe TikTok și să rezolve CAPTCHA-uri
driver.get("https://www.tiktok.com/explore")
