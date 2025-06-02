from fastapi import APIRouter
from . import auth
from . import routes


router = APIRouter()
router.include_router(auth.router)
router.include_router(routes.router)
