from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_chauffeur

router = APIRouter(
    prefix="/vehicule",
    tags=["Véhicules"]
)

@router.post("/", response_model=schemas.VehiculeResponse, status_code=status.HTTP_201_CREATED)
def ajouter_vehicule(
    vehicule_in: schemas.VehiculeCreate, 
    db: Session = Depends(get_db), 
    current_chauffeur: models.Chauffeur = Depends(get_current_chauffeur)
):
    # 1. Vérifier si le chauffeur possède déjà un véhicule
    vehicule_existant = db.query(models.Vehicule).filter(models.Vehicule.chauffeur_id == current_chauffeur.id).first()
    if vehicule_existant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce chauffeur possède déjà un véhicule enregistré."
        )

    # 2. Vérifier si l'immatriculation est déjà utilisée par un autre véhicule
    immat_existant = db.query(models.Vehicule).filter(models.Vehicule.immatriculation == vehicule_in.immatriculation).first()
    if immat_existant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette immatriculation est déjà enregistrée dans le système."
        )

    # 3. Créer et sauvegarder le véhicule
    nouveau_vehicule = models.Vehicule(
        marque=vehicule_in.marque,
        modele=vehicule_in.modele,
        immatriculation=vehicule_in.immatriculation,
        couleur=vehicule_in.couleur,
        chauffeur_id=current_chauffeur.id # Récupéré de manière sécurisée via le Token JWT !
    )
    
    db.add(nouveau_vehicule)
    db.commit()
    db.refresh(nouveau_vehicule)
    
    return nouveau_vehicule