import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # URL de secours par défaut si le fichier .env n'est pas lu
    DATABASE_URL = "mysql+pymysql://root:@localhost:3306/chauffeur_db"

# Création du moteur de connexion MySQL
# pymysql est le driver réseau utilisé pour communiquer avec MySQL
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Teste la connexion avant d'envoyer des requêtes (évite les déconnexions)
    pool_recycle=3600    # Recycle les connexions réseau toutes les heures
)

# Session de base de données active pour exécuter les requêtes
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe de base pour concevoir nos modèles de données SQL
Base = declarative_base()

# Fonction d'injection (Dependency Injection) pour ouvrir/fermer la connexion à chaque requête API
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # Fermeture propre de la connexion réseau pour libérer les ressources du serveur