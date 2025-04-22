import logging
import os

log_dir = os.path.join(os.getcwd(), 'app.log')

logging.basicConfig(
    filename=log_dir,  
    level=logging.INFO,   
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

log = logging.getLogger("global_logger")
