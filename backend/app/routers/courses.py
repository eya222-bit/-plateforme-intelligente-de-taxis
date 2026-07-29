from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import math

from ..database import get_db
from ..dependencies import get_current_chauffeur
from .. import models

router = APIRouter(prefix="/courses", tags=["Courses"])

# --- Schémas Pydantic pour la validation des données ---
class DemandeCourseCreate(BaseModel):
    client_nom: str
    lat_depart: float
    lng_depart: float
    destination_nom: str
    lat_dest: float
    lng_dest: float

class OffrePrixCreate(BaseModel):
    course_id: int
    prix: float

class AccepterOffreRequest(BaseModel):
    offre_id: int

# Formule de Haversine (calcul de distance en km)
def calculer_distance_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


# 1. Le Client crée une demande de course -> INSERT INTO courses
@router.post("/demander")
def demander_course(demande: DemandeCourseCreate, db: Session = Depends(get_db)):
    dist = calculer_distance_km(demande.lat_depart, demande.lng_depart, demande.lat_dest, demande.lng_dest)
    
    nouvelle_course = models.Course(
        client_nom=demande.client_nom,
        depart_lat=demande.lat_depart,
        depart_lng=demande.lng_depart,
        destination_nom=demande.destination_nom,
        dest_lat=demande.lat_dest,
        dest_lng=demande.lng_dest,
        distance_km=dist,
        statut="EN_ATTENTE"
    )
    
    db.add(nouvelle_course)
    db.commit()
    db.refresh(nouvelle_course)
    
    return {
        "id": nouvelle_course.id,
        "client_nom": nouvelle_course.client_nom,
        "depart": [nouvelle_course.depart_lat, nouvelle_course.depart_lng],
        "destination_nom": nouvelle_course.destination_nom,
        "destination": [nouvelle_course.dest_lat, nouvelle_course.dest_lng],
        "distance_km": nouvelle_course.distance_km,
        "statut": nouvelle_course.statut
    }


# 2. Le Chauffeur consulte les demandes en attente -> SELECT * FROM courses WHERE statut = 'EN_ATTENTE'
@router.get("/proches")
def lister_courses_en_attente(
    lat_chauffeur: float = 36.8065, 
    lng_chauffeur: float = 10.1815, 
    db: Session = Depends(get_db)
):
    # Récupérer toutes les courses en attente dans la base
    courses = db.query(models.Course).filter(models.Course.statut == "EN_ATTENTE").all()
    
    resultats = []
    for c in courses:
        dist_chauffeur = calculer_distance_km(lat_chauffeur, lng_chauffeur, c.depart_lat, c.depart_lng)
        resultats.append({
            "id": c.id,
            "client_nom": c.client_nom,
            "depart": [c.depart_lat, c.depart_lng],
            "destination_nom": c.destination_nom,
            "destination": [c.dest_lat, c.dest_lng],
            "distance_km": c.distance_km,
            "distance_du_chauffeur_km": dist_chauffeur,
            "statut": c.statut
        })
        
    return resultats


# 3. Le Chauffeur propose son prix -> INSERT INTO offres_prix
@router.post("/proposer-prix")
def proposer_prix(offre: OffrePrixCreate, current_chauffeur: models.Chauffeur = Depends(get_current_chauffeur), db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == offre.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course non trouvée")
        
    chauffeur_nom = f"{current_chauffeur.nom} {current_chauffeur.prenom}".strip() or current_chauffeur.email
    nouvelle_offre = models.OffrePrix(
        course_id=offre.course_id,
        chauffeur_nom=chauffeur_nom,
        prix=offre.prix,
        statut="EN_ATTENTE"
    )
    
    db.add(nouvelle_offre)
    db.commit()
    db.refresh(nouvelle_offre)
    
    return {"message": "Offre enregistrée dans la base de données", "offre_id": nouvelle_offre.id}


# 4. Le Client consulte les prix reçus -> SELECT * FROM offres_prix WHERE course_id = :id
@router.get("/{course_id}/offres")
def obtenir_offres_course(course_id: int, db: Session = Depends(get_db)):
    offres = db.query(models.OffrePrix).filter(models.OffrePrix.course_id == course_id).all()
    return [
        {
            "id": o.id,
            "chauffeur_nom": o.chauffeur_nom,
            "prix": o.prix,
            "statut": o.statut
        } 
        for o in offres
    ]

@router.get("/{course_id}")
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course non trouvée")
    return {
        "id": course.id,
        "client_nom": course.client_nom,
        "depart": [course.depart_lat, course.depart_lng],
        "destination_nom": course.destination_nom,
        "destination": [course.dest_lat, course.dest_lng],
        "distance_km": course.distance_km,
        "statut": course.statut
    }

@router.post("/{course_id}/accepter")
def accepter_offre(course_id: int, demande: AccepterOffreRequest, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course non trouvée")

    offres = db.query(models.OffrePrix).filter(models.OffrePrix.course_id == course_id).all()
    offre_a_accepter = next((o for o in offres if o.id == demande.offre_id), None)
    if not offre_a_accepter:
        raise HTTPException(status_code=404, detail="Offre non trouvée")

    for offre in offres:
        offre.statut = "ACCEPTEE" if offre.id == offre_a_accepter.id else "REFUSEE"
    course.statut = "ACCEPTEE"
    db.commit()

    return {
        "message": "Offre acceptée",
        "offre_id": offre_a_accepter.id,
        "chauffeur_nom": offre_a_accepter.chauffeur_nom,
        "prix": offre_a_accepter.prix
    }
