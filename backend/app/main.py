from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from .database import engine
from . import models
from .routers import auth
from app.routers import auth, vehicules, chauffeurs 

# Création des tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Chauffeur App API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes
app.include_router(auth.router)
app.include_router(vehicules.router)
app.include_router(chauffeurs.router)

@app.get("/")
def read_root():
    return {"status": "online", "message": "API opérationnelle"}