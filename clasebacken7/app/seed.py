"""
app/seed.py  —  Carga inicial de datos de demostración.
Regla: no pregunta antes de insertar, pero tampoco duplica (idempotente):
podés correrlo N veces contra Neon y solo inserta lo que falta.
Corre con:  python -m app.seed
Variables requeridas en el entorno (nunca escritas en el código):
    DATABASE_URL, SECRET_KEY, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
"""

import os
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.database import engine, SessionLocal, Base
from app import models  # noqa: F401
from app.core.security import hash_password

# ---------------------------------------------------------------------------
# Productos de demo — "img" es el archivo dentro de app/static/demo/ y se
# guarda como imagen_url="/demo/<img>" (servido por el backend con caché).
# No se fija el "id": lo asigna la secuencia de Postgres, así los productos
# que cree después el admin no chocan con claves duplicadas.
# ---------------------------------------------------------------------------

FLANES = [
    {
        "nombre": "Flan Mixto Tradicional",
        "subtitulo": "El clásico porteño con doble porción de dulce de leche colonial y crema chantilly artesanal",
        "precio": 8500.0,
        "precio_final": 8500.0,
        "precio_anterior": 9500.0,
        "en_stock": True,
        "stock": 14,
        "categoria": "Clásicos",
        "categoria_id": 1,
        "badge": "Más Vendido ⭐",
        "rating": 4.9,
        "reviews_count": 142,
        "porciones": "6 - 8 porciones (1.2 kg)",
        "garantia_meses": 0,
        "cuotas_cantidad": 3,
        "cuotas_valor": 2833.33,
        "img": "flan_vainilla.jpg",
    },
    {
        "nombre": "Flan de Dulce de Leche Volcánico",
        "subtitulo": "Masa cremosa elaborada íntegramente con dulce de leche repostero premium y corazón fundente",
        "precio": 9800.0,
        "precio_final": 9800.0,
        "precio_anterior": 11000.0,
        "en_stock": True,
        "stock": 9,
        "categoria": "De Autor",
        "categoria_id": 2,
        "badge": "Favorito del Chef 🍯",
        "rating": 5.0,
        "reviews_count": 98,
        "porciones": "6 - 8 porciones (1.3 kg)",
        "garantia_meses": 0,
        "cuotas_cantidad": 6,
        "cuotas_valor": 1633.33,
        "img": "flan_dulce_de_leche.jpg",
    },
    {
        "nombre": "Flan de Queso Mascarpone & Frutos Rojos",
        "subtitulo": "Inspiración italiana con queso mascarpone artesanal, reducción de frutos del bosque y caramelo cítrico",
        "precio": 10500.0,
        "precio_final": 10500.0,
        "precio_anterior": 12000.0,
        "en_stock": True,
        "stock": 6,
        "categoria": "De Autor",
        "categoria_id": 2,
        "badge": "Edición Gourmet ✨",
        "rating": 4.8,
        "reviews_count": 67,
        "porciones": "6 - 8 porciones (1.1 kg)",
        "garantia_meses": 0,
        "cuotas_cantidad": 3,
        "cuotas_valor": 3500.0,
        "img": "flan_frutos_rojos.jpg",
    },
    {
        "nombre": "Flan Parisino de Chocolate Belga 70%",
        "subtitulo": "Cacao fino de aroma, chocolate amargo 70% belga y caramelo con infusión de café torrado",
        "precio": 11200.0,
        "precio_final": 11200.0,
        "precio_anterior": 12900.0,
        "en_stock": True,
        "stock": 8,
        "categoria": "Especiales",
        "categoria_id": 3,
        "badge": "Novedad 🍫",
        "rating": 4.9,
        "reviews_count": 53,
        "porciones": "6 - 8 porciones (1.25 kg)",
        "garantia_meses": 0,
        "cuotas_cantidad": 6,
        "cuotas_valor": 1866.66,
        "img": "flan_chocolate.jpg",
    },
    {
        "nombre": "Flan de Coco Tostado & Leche Condensada",
        "subtitulo": "Receta caribeña con leche de coco natural, finas hebras de coco tostado crocante y caramelo de caña",
        "precio": 9200.0,
        "precio_final": 9200.0,
        "precio_anterior": 10200.0,
        "en_stock": True,
        "stock": 11,
        "categoria": "Especiales",
        "categoria_id": 3,
        "badge": "Exótico 🥥",
        "rating": 4.7,
        "reviews_count": 41,
        "porciones": "6 - 8 porciones (1.15 kg)",
        "garantia_meses": 0,
        "cuotas_cantidad": 3,
        "cuotas_valor": 3066.66,
        "img": "flan_coco.jpg",
    },
    {
        "nombre": "Gran Banquete Familiar Culto (Flan XXL)",
        "subtitulo": "Versión monumental de 2.5 kg ideal para celebraciones, cumpleaños y grandes sobremesas domingueras",
        "precio": 16500.0,
        "precio_final": 16500.0,
        "precio_anterior": 18900.0,
        "en_stock": True,
        "stock": 5,
        "categoria": "Familiares",
        "categoria_id": 4,
        "badge": "Edición Familiar 👑",
        "rating": 5.0,
        "reviews_count": 84,
        "porciones": "14 - 18 porciones (2.5 kg)",
        "garantia_meses": 0,
        "cuotas_cantidad": 6,
        "cuotas_valor": 2750.0,
        "img": "flan_familiar.jpg",
    },
]


def seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        _seed_productos(db)
        _seed_admin(db)
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
    print("Seed listo.")


def _seed_productos(db: Session):
    creados = 0
    for p in FLANES:
        # Verificar si ya existe antes de insertar (idempotencia por nombre)
        if db.query(models.Producto).filter_by(nombre=p["nombre"]).first():
            continue
        datos = {k: v for k, v in p.items() if k != "img"}
        db.add(models.Producto(**datos, imagen_url=f"/demo/{p['img']}"))
        creados += 1
    print(f"  [seed] Productos nuevos: {creados} (ya existían: {len(FLANES) - creados})")


def _seed_admin(db: Session):
    # Credenciales del administrador: SOLO desde variables de entorno.
    email = os.environ.get("SEED_ADMIN_EMAIL")
    password = os.environ.get("SEED_ADMIN_PASSWORD")
    if not email or not password:
        print("  [seed] Sin SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD — omitiendo admin.")
        return

    if db.query(models.Usuario).filter_by(email=email).first():
        print(f"  [seed] Admin ya existe: {email}")
        return

    db.add(models.Usuario(
        nombre="Admin",
        email=email,
        hashed_password=hash_password(password),
        activo=True,
        rol="admin",
        acepto_tratamiento=True,
        fecha_consentimiento=datetime.now(timezone.utc),
    ))
    print(f"  [seed] Admin creado: {email}")


if __name__ == "__main__":
    seed()
