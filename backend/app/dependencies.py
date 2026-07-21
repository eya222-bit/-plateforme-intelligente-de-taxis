from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
import os
from .database import get_db
from . import models

# Indique à FastAPI que le token doit être récupéré dans l'en-tête "Authorization: Bearer <TOKEN>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def get_current_chauffeur(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Session expirée ou invalide. Veuillez vous reconnecter.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # 1. Décoder le jeton JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        chauffeur_id: int = payload.get("id")
        
        if email is None or chauffeur_id is None:
            raise credentials_exception
            
    except jwt.PyJWTError:
        raise credentials_exception

    # 2. Vérifier si le chauffeur existe toujours dans MySQL
    chauffeur = db.query(models.Chauffeur).filter(models.Chauffeur.id == chauffeur_id).first()
    if chauffeur is None:
        raise credentials_exception
        
    return chauffeur # Renvoie l'objet chauffeur complet avec toutes ses infos