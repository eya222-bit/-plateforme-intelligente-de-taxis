from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# Ce que le frontend React doit envoyer pour créer un chauffeur
class ChauffeurCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr  # Valide automatiquement le format de l'email
    mot_de_passe: str

    class Config:
        from_attributes = True

# Ce que l'API renvoie en réponse (On cache le mot de passe par sécurité !)
class ChauffeurResponse(BaseModel):
    id: int
    nom: str
    prenom: str
    email: EmailStr
    est_actif: bool
    solde_revenus: float
    date_inscription: datetime

    class Config:
        from_attributes = True

    

class LoginRequest(BaseModel):
    email: EmailStr
    mot_de_passe: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
# Données requises pour créer un véhicule
class VehiculeCreate(BaseModel):
    marque: str
    modele: str
    immatriculation: str
    couleur: str

# Données retournées par l'API
class VehiculeResponse(BaseModel):
    id: int
    marque: str
    modele: str
    immatriculation: str
    couleur: str
    est_approuve: bool
    chauffeur_id: int
    # À ajouter à la fin de backend/app/schemas.py

class StatutUpdate(BaseModel):
    est_actif: bool

class SoldeUpdate(BaseModel):
    montant: float  # Montant à ajouter ou retirer
# --- Client ---
class ClientCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    mot_de_passe: str

# Données renvoyées au Frontend
class ClientOut(BaseModel):
    id: int
    nom: str
    prenom: str
    email: str
    date_inscription: Optional[datetime] = None

    class Config:
        from_attributes = True

# Données reçues lors du Login
class LoginRequest(BaseModel):
    email: EmailStr
    mot_de_passe: str

# --- Notification ---
class NotificationResponse(BaseModel):
    id: int
    titre: str
    message: str
    lu: bool
    date_creation: datetime

    class Config:
        from_attributes = True


  # Schéma pour l'inscription Client


# Schéma pour la connexion


# Schéma de réponse
 

    class LoginRequest(BaseModel):
     email: EmailStr
     mot_de_passe: str

    class TokenResponse(BaseModel):
     access_token: str
     token_type: str