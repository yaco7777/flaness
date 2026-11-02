"""
app/core/config.py
Configuración centralizada de la aplicación.

Todas las credenciales y URLs (base de datos, CORS, clave JWT) se leen
EXCLUSIVAMENTE desde variables de entorno o desde el archivo .env local.
No hay valores sensibles por defecto: si falta DATABASE_URL o SECRET_KEY,
la aplicación no arranca (fail-fast), evitando conectar a una base equivocada.
"""

import os
from pathlib import Path

# Raíz del backend (carpeta que contiene app/, alembic/, uploads/ ...)
BASE_DIR = Path(__file__).resolve().parents[2]

# Carpeta donde se guardan las imágenes subidas por el admin (servida en /static)
UPLOADS_DIR = BASE_DIR / "uploads"

# Imágenes de demostración versionadas en el repositorio (servidas en /demo)
DEMO_DIR = BASE_DIR / "app" / "static" / "demo"


def normalizar_db_url(url: str) -> str:
    """Fuerza el driver psycopg2 para que SQLAlchemy 2.x no intente usar psycopg v3.

    Neon y Render entregan URLs con esquema ``postgresql://`` o ``postgres://``;
    los parámetros (``?sslmode=require&channel_binding=require``) se respetan.
    """
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg2://", 1)
    return url


try:
    from pydantic_settings import BaseSettings

    class Settings(BaseSettings):
        PROJECT_NAME: str = "Culto al Flan — API"
        # Obligatorias: se leen del entorno / .env (sin valores por defecto)
        DATABASE_URL: str
        SECRET_KEY: str
        # Orígenes permitidos separados por coma (ej: la URL de Vercel)
        CORS_ORIGINS: str = ""
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
        REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080
        ACCESS_MIN: int = 30
        REFRESH_MIN: int = 10080

        @property
        def origins(self) -> list[str]:
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

        @property
        def sqlalchemy_url(self) -> str:
            return normalizar_db_url(self.DATABASE_URL)

        model_config = {"env_file": str(BASE_DIR / ".env"), "env_file_encoding": "utf-8", "extra": "ignore"}
except ImportError:
    from pydantic import BaseModel

    def _load_env():
        env_path = BASE_DIR / ".env"
        if env_path.exists():
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        if k.strip() not in os.environ:
                            os.environ[k.strip()] = v.strip()

    def _requerida(nombre: str) -> str:
        valor = os.getenv(nombre)
        if not valor:
            raise RuntimeError(f"Falta la variable de entorno obligatoria {nombre}.")
        return valor

    _load_env()

    class Settings(BaseModel):
        PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Culto al Flan — API")
        DATABASE_URL: str = _requerida("DATABASE_URL")
        SECRET_KEY: str = _requerida("SECRET_KEY")
        CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "")
        ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        REFRESH_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", "10080"))
        ACCESS_MIN: int = int(os.getenv("ACCESS_MIN", "30"))
        REFRESH_MIN: int = int(os.getenv("REFRESH_MIN", "10080"))

        @property
        def origins(self) -> list[str]:
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

        @property
        def sqlalchemy_url(self) -> str:
            return normalizar_db_url(self.DATABASE_URL)

settings = Settings()
