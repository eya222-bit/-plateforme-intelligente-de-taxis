from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/clients", tags=["Clients"])

# 🌟 1. INSCRIPTION : Enregistrement effectif dans MySQL
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_client(data: schemas.ClientCreate, db: Session = Depends(get_db)):
    # Vérifier l'existence
    client_existant = db.query(models.Client).filter(models.Client.email == data.email).first()
    if client_existant:
        raise HTTPException(status_code=400, detail="Un compte existe déjà avec cet email.")

    # Création du client
    hashed_pwd = auth.hash_password(data.mot_de_passe)
    nouveau_client = models.Client(
        nom=data.nom,
        prenom=data.prenom,
        email=data.email,
        mot_de_passe_hache=hashed_pwd
    )
    
    db.add(nouveau_client)
    db.commit()             # 👈 OBLIGATOIRE pour écriture physique dans MySQL
    db.refresh(nouveau_client)
    
    return {"message": "Client créé avec succès", "id": nouveau_client.id}


# 🌟 2. CONNEXION
@router.post("/login")
def login_client(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.email == data.email).first()
    if not client or not auth.verify_password(data.mot_de_passe, client.mot_de_passe_hache):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect.")
    
    # Génération d'un Token JWT propre à CE client
    token = auth.create_access_token(data={"sub": str(client.id), "role": "CLIENT"})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "client": {
            "id": client.id,
            "nom": client.nom,
            "prenom": client.prenom,
            "email": client.email
        }
    }
    