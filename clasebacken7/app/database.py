"""
app/database.py
Configuración de la conexión a PostgreSQL con SQLAlchemy.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings

# ---------------------------------------------------------------------------
# Cadena de conexión — leída desde settings (app/core/config.py → .env).
# Copiá el archivo .env.example como .env y completá tus credenciales.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Engine — objeto central que gestiona la conexión con la base de datos.
# ---------------------------------------------------------------------------

# settings.sqlalchemy_url fuerza el driver psycopg2 explícitamente para evitar
# que SQLAlchemy 2.x intente usar psycopg v3 (que no está instalado), y
# convierte "postgres://" (Render) en "postgresql+psycopg2://".
#
# Pool pensado para Neon (serverless): Neon suspende el cómputo tras unos
# minutos de inactividad y corta las conexiones abiertas.
#   pool_pre_ping=True → antes de usar una conexión del pool hace un "SELECT 1"
#                         y la descarta si el servidor la cerró.
#   pool_recycle=300   → recicla conexiones con más de 5 minutos de vida.
engine = create_engine(
    settings.sqlalchemy_url,
    pool_pre_ping=True,
    pool_recycle=300,
)


# ---------------------------------------------------------------------------
# SessionLocal — fábrica de sesiones.
# autocommit=False → los commits deben ser explícitos (db.commit()).
# autoflush=False  → evita flushes automáticos antes de cada query.
# ---------------------------------------------------------------------------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ---------------------------------------------------------------------------
# Base declarativa — todas las clases ORM (modelos) heredan de aquí.
# ---------------------------------------------------------------------------
class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# get_db — generador de sesión para inyección de dependencias en FastAPI.
# ---------------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
