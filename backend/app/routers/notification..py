from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_chauffeur

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

@router.get("/", response_model=list[schemas.NotificationResponse])
def obtenir_notifications(
    db: Session = Depends(get_db),
    current_chauffeur: models.Chauffeur = Depends(get_current_chauffeur)
):
    return db.query(models.Notification).filter(
        models.Notification.chauffeur_id == current_chauffeur.id
    ).order_by(models.Notification.date_creation.desc()).all()

@router.patch("/{notif_id}/lire")
def marquer_comme_lue(
    notif_id: int,
    db: Session = Depends(get_db),
    current_chauffeur: models.Chauffeur = Depends(get_current_chauffeur)
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notif_id,
        models.Notification.chauffeur_id == current_chauffeur.id
    ).first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification introuvable.")
        
    notif.lu = True
    db.commit()
    return {"message": "Notification marquée comme lue."}