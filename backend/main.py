from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging
from user_agents import parse

from routes.users_routes import router as users_router
from routes.profiles_routes import router as profiles_router
from routes.study_requests_routes import router as study_requests_router
from routes.matches_routes import router as matches_router
from routes.user_interests_routes import router as user_interests_router
from routes.chat_router import router as chat_router
from routes.friend_requests_router import router as friend_requests_router
from admin_panel.admin_routes import router as admin_router

log_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
os.makedirs(log_directory, exist_ok=True)

log_file_path = os.path.join(log_directory, "admin_panel.log")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [API] [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(log_file_path, encoding='utf-8'),
        logging.StreamHandler()
    ]
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_device_info(request: Request, call_next):
    ip = request.client.host
    user_agent_str = request.headers.get("user-agent", "Bilinmiyor")
    ua = parse(user_agent_str)

    device_type = "Mobil" if ua.is_mobile else "Tablet" if ua.is_tablet else "PC"
    os_family = ua.os.family
    browser_family = ua.browser.family
    path = request.url.path

    logging.info(f"[GELEN TALEP] IP: {ip} | Cihaz: {device_type} | OS: {os_family} | Tarayıcı: {browser_family} | Path: {path}")
    response = await call_next(request)
    return response

app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(profiles_router, prefix="/profiles", tags=["Profiles"])
app.include_router(study_requests_router, prefix="/study_requests", tags=["Study Requests"])
app.include_router(matches_router, prefix="/matches", tags=["Matches"])
app.include_router(user_interests_router, prefix="/user_interests", tags=["User Interests"])
app.include_router(chat_router, tags=["Chat"])
app.include_router(friend_requests_router, prefix="/friend_requests", tags=["Friend Requests"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])

static_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), "admin_panel", "static")
app.mount("/admin/static", StaticFiles(directory=static_directory), name="admin_static")

@app.get("/home")
def home():
    return {"message": "MatchStudy API Çalışıyor!"}

@app.get("/")
def root():
    return {"message": "MatchStudy API'ye Hoş Geldiniz!"}
