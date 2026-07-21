from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import os
from dotenv import load_dotenv  # <-- Correction # si non chargé globalement
from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_chauffeur

load_dotenv()

router = APIRouter(
    prefix="/auth",
    tags=["Authentification"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Récupération des configurations JWT
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

# Fonction utilitaire pour générer le Token JWT
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Ta route Register existante est ici ---

# --- NOUVELLE ROUTE : LOGIN ---
@router.post("/login", response_model=schemas.TokenResponse)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    # 1. Rechercher le chauffeur par email
    chauffeur = db.query(models.Chauffeur).filter(models.Chauffeur.email == credentials.email).first()
    if not chauffeur:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects (email)."
        )
    
    # 2. Vérifier le mot de passe
    if not pwd_context.verify(credentials.mot_de_passe, chauffeur.mot_de_passe_hache):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects (mot de passe)."
        )
    
    # 3. Générer le jeton d'accès
    access_token = create_access_token(data={"sub": chauffeur.email, "id": chauffeur.id})
    
    return {"access_token": access_token, "token_type": "bearer"}
@router.get("/me", response_model=schemas.ChauffeurResponse)
def read_chauffeur_profile(current_chauffeur: models.Chauffeur = Depends(get_current_chauffeur)):
    
    #Cette route est PRIVÉE. Elle nécessite un Token JWT valide dans les en-têtes.
    
    return current_chauffeur