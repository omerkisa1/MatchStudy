from fastapi import FastAPI
#from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Router'ları içe aktarma
from routes.users_routes import router as users_router
from routes.profiles_routes import router as profiles_router
from routes.study_requests_routes import router as study_requests_router
from routes.matches_routes import router as matches_router
from routes.user_interests_routes import router as user_interests_router
from routes.chat_router import router as chat_router
from routes.friend_requests_router import router as friend_requests_router
from admin_panel.admin_routes import router as admin_router

# FastAPI uygulaması oluştur
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Specifically allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],       # Tüm HTTP metodlarına izin ver (GET, POST, OPTIONS vb.)
    allow_headers=["*"],       # Tüm headerlara izin ver
)

# Router'ları API'ye ekle
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(profiles_router, prefix="/profiles", tags=["Profiles"])
app.include_router(study_requests_router, prefix="/study_requests", tags=["Study Requests"])
app.include_router(matches_router, prefix="/matches", tags=["Matches"])
app.include_router(user_interests_router, prefix="/user_interests", tags=["User Interests"])
app.include_router(chat_router, tags=["Chat"])
app.include_router(friend_requests_router,prefix="/friend_requests", tags= ["Friend Requests"] )

# Admin paneli router'ını API'ye ekle
app.include_router(admin_router, prefix="/admin", tags=["Admin"])

# Admin paneli için statik dosyaları ayarla
static_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), "admin_panel", "static")
app.mount("/admin/static", StaticFiles(directory=static_directory), name="admin_static")

# Log klasörünü oluştur
log_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
if not os.path.exists(log_directory):
    os.makedirs(log_directory)

# Statik dosyalar için mount (opsiyonel)

@app.get("/home")
def home():
    return {"message": "MatchStudy API Çalışıyor!"}

@app.get("/")
def root():
    return {"message": "MatchStudy API'ye Hoş Geldiniz!"}
