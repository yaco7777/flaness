"""
Actividad Clase 2 - FastAPI + SQLAlchemy + PostgreSQL
Culto al Flan — E-commerce de postres tradicionales
Ley 24.240 de Defensa del Consumidor (Argentina)

Ejecutar con:
    uvicorn app.main:app --reload
"""

from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import Base, engine, get_db
from app import models  # noqa: F401 — necesario para que Base registre los modelos
from app.core.config import settings, UPLOADS_DIR, DEMO_DIR
from app.routers import productos
from app.routers import auth
from app.routers import pedidos
from app.routers import usuarios

# ---------------------------------------------------------------------------
# Creación de tablas en PostgreSQL al iniciar la aplicación.
# SQLAlchemy compara los modelos ORM contra el esquema real y crea las tablas
# que no existan todavía. No modifica tablas existentes (para eso usaremos
# Alembic en la próxima etapa).
# ---------------------------------------------------------------------------
Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------------------------
# Inicialización de la aplicación
# ---------------------------------------------------------------------------

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API de productos de postres tradicionales — Actividad Clase 2",
    version="3.0.0",
)


# ---------------------------------------------------------------------------
# Configuración de CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compresión GZip para respuestas JSON/HTML de más de 1 KB (el catálogo pesa
# bastante menos comprimido; las imágenes JPG no se benefician pero tampoco se
# rompen porque Starlette solo comprime si el cliente envía Accept-Encoding).
app.add_middleware(GZipMiddleware, minimum_size=1000)


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(auth.router)
app.include_router(productos.router)
app.include_router(pedidos.router)
app.include_router(usuarios.router)


# ---------------------------------------------------------------------------
# Archivos estáticos con caché de 30 días
# ---------------------------------------------------------------------------

class StaticConCache(StaticFiles):
    """StaticFiles que agrega Cache-Control de 30 días a las respuestas 200.

    Los nombres de archivo subidos llevan un sufijo aleatorio (uuid), por lo
    que una imagen nueva siempre tiene una URL nueva y se puede marcar como
    "immutable" sin riesgo de servir una versión vieja.
    """

    async def get_response(self, path, scope):
        respuesta = await super().get_response(path, scope)
        if respuesta.status_code == 200:
            respuesta.headers["Cache-Control"] = "public, max-age=2592000, immutable"
        return respuesta


# /static → uploads/  (imágenes subidas por el admin: /static/productos/...)
(UPLOADS_DIR / "productos").mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticConCache(directory=UPLOADS_DIR), name="static")

# /demo → app/static/demo  (imágenes de demo que van en el repositorio)
DEMO_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/demo", StaticConCache(directory=DEMO_DIR), name="demo")


# ---------------------------------------------------------------------------
# Endpoint de salud — verifica que la aplicación y la base de datos responden
# ---------------------------------------------------------------------------

@app.get("/salud", tags=["Salud"])
def salud(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"estado": "ok", "base": "ok"}


# ---------------------------------------------------------------------------
# Reflexión — Ley 24.240, Art. 4 (Deber de información)
#
# ¿Qué campo agregarías al modelo para cumplir mejor con la Ley 24.240?
#
# Agregaría el campo `tasa_cft` (float), que representa la Tasa de Costo
# Financiero Total del financiamiento en cuotas. La Ley 24.240 y las
# normativas complementarias del BCRA exigen que el vendedor informe el
# costo real del crédito, no solo el valor nominal de cada cuota; sin ese
# dato el consumidor no puede comparar ofertas ni conocer el sobreprecio
# que paga por financiarse.
# ---------------------------------------------------------------------------
