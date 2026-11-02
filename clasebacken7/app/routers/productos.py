"""
app/routers/productos.py
Endpoints de productos — montados en app/main.py con prefix="/productos".
"""

import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile
from sqlalchemy.orm import Session

from app import models
from app.core.config import UPLOADS_DIR
from app.dependencies import get_db, require_admin
from app.schemas.producto import ProductoCreate, ProductoOut
from app.services.productos import crear_producto, listar_productos

router = APIRouter(prefix="/productos", tags=["Productos"])

MAX_FILE_SIZE = 2 * 1024 * 1024  # 2 MB
# Las imágenes subidas se guardan en uploads/productos y se sirven en /static/productos
STATIC_DIR = str(UPLOADS_DIR / "productos")


@router.post(
    "/{producto_id}/imagen",
    response_model=ProductoOut,
    summary="Subir imagen de producto",
)
async def post_imagen_producto(
    producto_id: int,
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin: models.Usuario = Depends(require_admin),
) -> ProductoOut:
    db_producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not db_producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id={producto_id} no encontrado.",
        )

    # Validar formato: debe ser imagen (415)
    content_type = archivo.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="El archivo seleccionado no es una imagen permitida.",
        )

    # Validar tamaño: no superar 2 MB (413)
    contenido = await archivo.read()
    if len(contenido) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="El archivo excede el tamaño máximo permitido de 2 MB.",
        )

    os.makedirs(STATIC_DIR, exist_ok=True)
    ext = os.path.splitext(archivo.filename or "")[1].lower() or ".jpg"
    filename = f"{producto_id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(STATIC_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(contenido)

    # Ruta relativa según contrato DSI2
    db_producto.imagen_url = f"/static/productos/{filename}"
    db.commit()
    db.refresh(db_producto)

    return db_producto


@router.get(
    "",
    response_model=list[ProductoOut],
    summary="Listar productos",
)
@router.get(
    "/",
    response_model=list[ProductoOut],
    summary="Listar productos (con barra final)",
)
def get_productos(
    skip: int = Query(default=0, ge=0),
    page: int | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=100),
    nombre: str | None = Query(default=None),
    precio_max: float | None = Query(default=None, ge=0),
    db: Session = Depends(get_db),
) -> list[ProductoOut]:
    offset = (page * limit) if page is not None else skip
    return listar_productos(db, skip=offset, limit=limit, nombre=nombre, precio_max=precio_max)


@router.get(
    "/{producto_id}",
    response_model=ProductoOut,
    summary="Obtener producto por ID",
)
def get_producto_por_id(
    producto_id: int,
    db: Session = Depends(get_db),
) -> ProductoOut:
    db_producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not db_producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id={producto_id} no encontrado.",
        )
    return db_producto


@router.post(
    "",
    response_model=ProductoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Agregar producto",
)
@router.post(
    "/",
    response_model=ProductoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Agregar producto (con barra final)",
)
def post_producto(
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    _admin: models.Usuario = Depends(require_admin),
) -> ProductoOut:
    return crear_producto(db, producto)


@router.put(
    "/{producto_id}",
    response_model=ProductoOut,
    summary="Actualizar producto",
)
def put_producto(
    producto_id: int,
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    _admin: models.Usuario = Depends(require_admin),
) -> ProductoOut:
    db_producto = db.query(models.Producto).filter(
        models.Producto.id == producto_id
    ).first()

    if not db_producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id={producto_id} no encontrado.",
        )

    for campo, valor in producto.model_dump().items():
        setattr(db_producto, campo, valor)

    db.commit()
    db.refresh(db_producto)
    return db_producto


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar producto",
)
def delete_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    _admin: models.Usuario = Depends(require_admin),
) -> None:
    db_producto = db.query(models.Producto).filter(
        models.Producto.id == producto_id
    ).first()

    if not db_producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id={producto_id} no encontrado.",
        )

    db.delete(db_producto)
    db.commit()
