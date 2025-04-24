from fastapi import FastAPI
from routes import routes
from shared_utils.logger_config import log

#http://127.0.0.1:8000/docs -> pentru testare

app = FastAPI()
log.info("[ SERVER API ][ Connecting to database and starting API...]")

app.include_router(routes.router)
