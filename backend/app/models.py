from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from datetime import datetime
from .database import Base
from sqlalchemy.orm import relationship

class Chauffeur(Base):
    __tablename__ = "chauffeurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    mot_de_passe_hache = Column(String(255), nullable=False)
    
    # --- Champs Réseau / Abonnement ---
    est_actif = Column(Boolean, default=False)  # True si le chauffeur est en ligne sur le réseau
    rayon_abonnement = Column(Float, default=5.0)  # Rayon d'action en kilomètres
    
    # --- Données de géolocalisation temps réel ---
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    derniere_mise_a_jour_gps = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    rayon_abonnement_km = Column(Float, default=5.0)
    
    # --- Statistiques & Revenus ---
    solde_revenus = Column(Float, default=0.0)
    nombre_courses_realisees = Column(Integer, default=0)
    
    date_inscription = Column(DateTime, default=datetime.utcnow) 
    vehicule = relationship("Vehicule", back_populates="chauffeur", uselist=False)
    notifications = relationship("Notification", back_populates="chauffeur")


class Vehicule(Base):
    __tablename__ = "vehicules"

    id = Column(Integer, primary_key=True, index=True)
    marque = Column(String(50), nullable=False)
    modele = Column(String(50), nullable=False)
    immatriculation = Column(String(30), unique=True, nullable=False, index=True)
    couleur = Column(String(30), nullable=False)
    est_approuve = Column(Boolean, default=False)  # Permet à l'admin de valider le véhicule

    # Clé étrangère vers la table chauffeurs
    chauffeur_id = Column(Integer, ForeignKey("chauffeurs.id"), unique=True, nullable=False)

    # Relation bidirectionnelle
    chauffeur = relationship("Chauffeur", back_populates="vehicule")


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    destination_lat = Column(Float, nullable=True)
    destination_lng = Column(Float, nullable=True)
    en_attente = Column(Boolean, default=True)

# --- NOTIFICATION ---
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(100), nullable=False)
    message = Column(String(255), nullable=False)
    lu = Column(Boolean, default=False)
    date_creation = Column(DateTime, default=datetime.utcnow)
    
    chauffeur_id = Column(Integer, ForeignKey("chauffeurs.id"))
    chauffeur = relationship("Chauffeur", back_populates="notifications")