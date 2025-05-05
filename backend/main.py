from fastapi import FastAPI
#from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Router'ları içe aktarma
from routes.users_routes import router as users_router
from routes.profiles_routes import router as profiles_router
from routes.study_requests_routes import router as study_requests_router
from routes.matches_routes import router as matches_router
from routes.user_interests_routes import router as user_interests_router

# FastAPI uygulaması oluştur
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Gerekirse spesifik domain(ler) ekleyin: ["http://localhost:5173"]
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

# Statik dosyalar için mount (opsiyonel)
#app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/home")
def home():
    return {"message": "MatchStudy API Çalışıyor!"}
