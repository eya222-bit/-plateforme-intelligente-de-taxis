import math

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_chauffeur
import math

router = APIRouter(
    prefix="/chauffeur",
    tags=["Gestion Chauffeur"]
)

# 1. Route pour changer le statut (Disponible / Indisponible)
@router.patch("/statut", response_model=schemas.ChauffeurResponse)
def changer_statut(
    statut_in: schemas.StatutUpdate,
    db: Session = Depends(get_db),
    current_chauffeur: models.Chauffeur = Depends(get_current_chauffeur)
):
    current_chauffeur.est_actif = statut_in.est_actif
    db.commit()
    db.refresh(current_chauffeur)
    return current_chauffeur


# 2. Route pour créditer les revenus de la course
@router.post("/solde/ajouter", response_model=schemas.ChauffeurResponse)
def ajouter_revenu(
    solde_in: schemas.SoldeUpdate,
    db: Session = Depends(get_db),
    current_chauffeur: models.Chauffeur = Depends(get_current_chauffeur)
):
    if solde_in.montant <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le montant doit être supérieur à zero."
        )
        
    current_chauffeur.solde_revenus += solde_in.montant
    db.commit()
    db.refresh(current_chauffeur)
    return current_chauffeur

def calculer_distance_km(lat1, lon1, lat2, lon2):
    """ Calcul de la distance réelle entre deux points GPS (Formule Haversine) """
    R = 6371.0  # Rayon de la Terre en km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# 1. Visualisation des clients situés dans le rayon d'abonnement
@router.get("/clients-proximite", response_model=list[schemas.ClientResponse])
def obtenir_clients_proximite(
    db: Session = Depends(get_db),
    current_chauffeur: models.Chauffeur = Depends(get_current_chauffeur)
):
    if not current_chauffeur.latitude or not current_chauffeur.longitude:
        raise HTTPException(status_code=400, detail="Veuillez d'abord activer votre position GPS.")

    clients_en_attente = db.query(models.Client).filter(models.Client.en_attente == True).all()
    clients_dans_rayon = []

    for client in clients_en_attente:
        dist = calculer_distance_km(
            current_chauffeur.latitude, current_chauffeur.longitude,
            client.latitude, client.longitude
        )
        # Filtrage selon le rayon d'abonnement du chauffeur
        if dist <= current_chauffeur.rayon_abonnement_km:
            client_dict = schemas.ClientResponse.from_orm(client)
            client_dict.distance_km = round(dist, 2)
            clients_dans_rayon.append(client_dict)

    return clients_dans_rayon

# 2. Obtenir le lien de Navigation GPS (Google Maps / Waze)
@router.get("/navigation/{client_id}")
def generer_lien_navigation(
    client_id: int,
    db: Session = Depends(get_db),
    current_chauffeur: models.Chauffeur = Depends(get_current_chauffeur)
):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client introuvable.")

    # Génère des liens d'itinéraires GPS directs
    google_maps_url = f"https://www.google.com/maps/dir/?api=1&destination={client.latitude},{client.longitude}"
    
    return {
        "client_id": client.id,
        "nom_client": client.nom,
        "destination_gps": {"lat": client.latitude, "lng": client.longitude},
        "google_maps_url": google_maps_url
    }