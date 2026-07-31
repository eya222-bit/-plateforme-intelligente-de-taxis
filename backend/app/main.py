from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from .database import engine
from . import models
from .routers import auth
from app.routers import auth, vehicules, chauffeurs, courses, clients
from .routers import courses
from .database import engine, Base

# Création des tables dans MySQL/BDD si elles n'existent pas encore
Base.metadata.create_all(bind=engine)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ...reste de ton code...
# Inclusion des routes
app.include_router(auth.router)
app.include_router(vehicules.router)
app.include_router(chauffeurs.router)
app.include_router(courses.router)
app.include_router(clients.router)

@app.get("/")
def read_root():
    return {"status": "online", "message": "API opérationnelle"}