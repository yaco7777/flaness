import os
import requests
import sys

# URL del backend a probar, desde el entorno. Ej (PowerShell):
#   $env:API_URL = "https://<tu-backend>.onrender.com"; python test_endpoints.py
BASE_URL = os.environ.get("API_URL", "").rstrip("/")
if not BASE_URL:
    sys.exit("Definí la variable de entorno API_URL con la URL del backend.")

def test_api():
    print("--- 1. Probando exportar sin autenticación (debe dar 401) ---")
    r_unauth = requests.get(f"{BASE_URL}/usuarios/me/exportar")
    print(f"Status sin auth: {r_unauth.status_code}")
    assert r_unauth.status_code == 401, f"Se esperaba 401 pero dio {r_unauth.status_code}"
    print("[OK] Paso 1 verificado: 401 Unauthorized sin Bearer token.")

    print("\n--- 2. Registrando usuario de prueba ---")
    test_email = f"consumidor_test_{int(sys.platform.__hash__())}@test.com"
    r_reg = requests.post(f"{BASE_URL}/auth/register", json={
        "nombre": "Consumidor Protegido",
        "email": test_email,
        "password": "Password123!",
        "acepto_tratamiento": True
    })
    if r_reg.status_code == 409:
        print("Usuario ya existe, procediendo al login...")
    else:
        print(f"Registro status: {r_reg.status_code}")
        assert r_reg.status_code == 201
        data_reg = r_reg.json()
        print(f"Consentimiento registrado: {data_reg.get('fecha_consentimiento')}")
        assert data_reg.get("fecha_consentimiento") is not None

    print("\n--- 3. Iniciando sesión para obtener Token Bearer ---")
    r_login = requests.post(f"{BASE_URL}/auth/login", data={
        "username": test_email,
        "password": "Password123!"
    })
    assert r_login.status_code == 200, f"Login falló: {r_login.text}"
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[OK] Token Bearer obtenido.")

    print("\n--- 4. Creando un pedido de prueba ---")
    r_prod = requests.get(f"{BASE_URL}/productos")
    prods = r_prod.json()
    prod_id = prods[0]["id"] if prods else 1

    r_pedido = requests.post(f"{BASE_URL}/pedidos", headers=headers, json={
        "items": [{"producto_id": prod_id, "cantidad": 1}]
    })
    print(f"Crear pedido status: {r_pedido.status_code}")
    assert r_pedido.status_code == 201
    pedido = r_pedido.json()
    pedido_id = pedido["id"]
    print(f"Pedido #{pedido_id} creado exitosamente con creado_en: {pedido.get('creado_en')}")

    print("\n--- 5. Probando revocacion de compra (Arrepentimiento Ley 24.240) ---")
    r_revoc = requests.post(f"{BASE_URL}/pedidos/{pedido_id}/revocar", headers=headers)
    print(f"Revocacion status: {r_revoc.status_code}")
    assert r_revoc.status_code == 201, f"Se esperaba 201 Created pero dio: {r_revoc.text}"
    revoc_data = r_revoc.json()
    print(f"[OK] Solicitud de revocacion exitosa! Codigo generado: {revoc_data.get('codigo')}")
    assert "codigo" in revoc_data and revoc_data["codigo"].startswith("REV-")

    print("\n--- 6. Probando intento de revocar un pedido ya cancelado (debe dar 409) ---")
    r_revoc_segunda = requests.post(f"{BASE_URL}/pedidos/{pedido_id}/revocar", headers=headers)
    print(f"Segunda revocacion status: {r_revoc_segunda.status_code}")
    assert r_revoc_segunda.status_code == 409, f"Se esperaba 409 pero dio {r_revoc_segunda.status_code}"
    print(f"Detalle 409: {r_revoc_segunda.json().get('detail')}")

    print("\n--- 7. Consultando Panel 'Mis Datos' ---")
    r_datos = requests.get(f"{BASE_URL}/usuarios/me", headers=headers)
    assert r_datos.status_code == 200
    mis_datos = r_datos.json()
    print("Datos personales devueltos:")
    print(f"- Nombre: {mis_datos['nombre']}")
    print(f"- Email: {mis_datos['email']}")
    print(f"- Fecha de consentimiento: {mis_datos['fecha_consentimiento']}")
    print(f"- Pedidos registrados: {len(mis_datos['pedidos'])}")
    print(f"- Solicitudes de revocacion: {len(mis_datos['solicitudes_revocacion'])}")
    assert mis_datos["fecha_consentimiento"] is not None
    assert len(mis_datos["solicitudes_revocacion"]) >= 1

    print("\n--- 8. Probando exportar con autenticacion (debe dar 200 y JSON) ---")
    r_exp_auth = requests.get(f"{BASE_URL}/usuarios/me/exportar", headers=headers)
    assert r_exp_auth.status_code == 200
    assert "application/json" in r_exp_auth.headers.get("Content-Type", "")
    print("[OK] Exportacion autorizada devuelve JSON completo correctamente.")

    print("\n--- 9. Probando eliminacion de cuenta (Darse de baja) ---")
    r_del = requests.delete(f"{BASE_URL}/usuarios/me", headers=headers)
    print(f"Delete account status: {r_del.status_code}")
    assert r_del.status_code == 200
    print(f"Respuesta baja: {r_del.json().get('mensaje')}")

    print("\n>>> TODAS LAS PRUEBAS DE LA API PASARON SATISFACTORIAMENTE! <<<")


if __name__ == "__main__":
    test_api()
