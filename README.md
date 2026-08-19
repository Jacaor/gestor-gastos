# Gestor de Gastos Personales — Proyecto Final Programación Web

CRUD completo con Node.js + Express + Mongoose (backend) y HTML/CSS/JS vanilla (frontend).

## Estructura

```
gestor-gastos/
  backend/
    controllers/gastoController.js
    models/Gasto.js
    routes/gastoRoutes.js
    server.js
    package.json
    .env.example
  frontend/
    index.html
    style.css
    app.js
```

## 1. Crear el cluster en MongoDB Atlas

1. Entra a https://www.mongodb.com/cloud/atlas y crea una cuenta gratis.
2. Crea un proyecto nuevo y dentro de él un cluster **M0 (Free)**.
3. En "Database Access", crea un usuario con contraseña (guárdala).
4. En "Network Access", agrega tu IP actual, o `0.0.0.0/0` para permitir cualquier IP mientras desarrollas (menos seguro, pero simple para el proyecto).
5. En "Database" → "Connect" → "Drivers", copia el connection string. Se ve así:
   ```
   mongodb+srv://usuario:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Reemplaza `<password>` por tu contraseña real y agrega el nombre de la base de datos antes del `?`, por ejemplo `.../gestor_gastos?retryWrites=true...`.

## 2. Configurar el backend

```bash
cd backend
npm install
cp .env.example .env
```

Abre `.env` y pega tu connection string real en `MONGODB_URI`.

Levanta el servidor:

```bash
npm run dev
```

Deberías ver en consola: `Conectado a MongoDB Atlas` y `Servidor corriendo en http://localhost:5000`.

## 3. Levantar el frontend

El frontend es estático, no necesita build. Simplemente abre `frontend/index.html` en el navegador (doble clic, o con la extensión "Live Server" de VS Code para evitar problemas de CORS con `file://`).

Si usas Live Server, normalmente corre en `http://127.0.0.1:5500`, lo cual es compatible porque el backend ya tiene `cors()` habilitado sin restricciones.

## 4. Probar el CRUD

Con ambos corriendo (backend en :5000, frontend abierto en el navegador):

- **Crear**: llena el formulario de la izquierda y presiona "Guardar gasto".
- **Leer**: la tabla de la derecha se llena automáticamente al cargar la página.
- **Actualizar**: presiona "Editar" en cualquier fila, el formulario se llena con esos datos, y al enviar hace `PUT`.
- **Eliminar**: presiona "Eliminar", confirma en el modal.
- **Filtros**: por categoría o por mes, usando los selectores encima de la tabla.
- **Totales**: el panel de la derecha muestra el total general (arriba) y el desglose por categoría con barras.

## Endpoints de la API

| Método | Ruta                  | Descripción                          |
|--------|-----------------------|---------------------------------------|
| GET    | /api/gastos            | Lista gastos (admite `?categoria=` y `?mes=YYYY-MM`) |
| GET    | /api/gastos/:id         | Obtiene un gasto por id              |
| POST   | /api/gastos             | Crea un gasto                        |
| PUT    | /api/gastos/:id         | Actualiza un gasto                   |
| DELETE | /api/gastos/:id         | Elimina un gasto                     |
| GET    | /api/gastos/totales     | Totales general, por categoría y por mes |

## Notas para la sustentación

- Validación de datos: a nivel de esquema Mongoose (`required`, `min`, `enum`, `maxlength`) y a nivel de controlador (captura de `ValidationError` → 400).
- Manejo de errores: try/catch en cada controlador + middleware de error 404 y 500 en `server.js`.
- Variables de entorno: `MONGODB_URI` y `PORT` en `.env`, nunca hardcodeadas ni subidas al repo (agrega `.env` a tu `.gitignore`).
- Estructura organizada: rutas, controladores y modelo separados en carpetas distintas, como pide el mandato.
