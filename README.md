# OMC Backend - Prueba Tecnica

API REST construida con NestJS para gestionar leads de marketing, consultar estadisticas y generar un resumen ejecutivo usando IA.

## Tecnologias usadas

- `NestJS`: estructura modular, validaciones y controladores claros para una API REST.
- `TypeScript`: tipado estatico y mejor mantenibilidad.
- `MongoDB + Mongoose`: persistencia rapida con schema definido y timestamps.
- `JWT`: autenticacion para proteger los endpoints de leads.
- `Swagger`: documentacion interactiva en `/docs`.
- `Mock LLM service`: resumen simulado con una arquitectura lista para conectar un proveedor real despues.

## Requisitos

- `Node.js 22+`
- `pnpm`
- `MongoDB` corriendo local o remoto

## Instalacion

```bash
pnpm install
```

## Variables de entorno

Crea un archivo `.env` a partir de `.env.example`.

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lead_flow
JWT_SECRET=change-me
JWT_EXPIRES_IN=1d
AUTH_ADMIN_EMAIL=admin@lead-flow.com
AUTH_ADMIN_PASSWORD=change-me
```

## Ejecutar el proyecto

```bash
pnpm run start:dev
```

La documentacion Swagger queda disponible en:

```text
http://localhost:3000/docs
```

## Seed

Para cargar 10 leads de ejemplo:

```bash
pnpm run db:seed
```

## Autenticacion

La autenticacion es un plus implementado en esta prueba. Las rutas de `leads` estan protegidas con JWT.

Primero obten un token:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@lead-flow.com",
  "password": "change-me"
}
```

Respuesta esperada:

```json
{
  "accessToken": "jwt..."
}
```

Luego usa ese token como:

```text
Authorization: Bearer TU_TOKEN
```

## Endpoints principales

### Crear lead

```http
POST /leads
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "nombre": "Juan Perez",
  "email": "juan@example.com",
  "telefono": "+57 300 123 4567",
  "fuente": "instagram",
  "producto_interes": "Curso de ventas",
  "presupuesto": 250
}
```

### Listar leads

```http
GET /leads?page=1&limit=10&fuente=instagram&fechaInicio=2026-05-01T00:00:00.000Z&fechaFin=2026-05-18T23:59:59.999Z
Authorization: Bearer TU_TOKEN
```

### Obtener lead por ID

```http
GET /leads/:id
Authorization: Bearer TU_TOKEN
```

### Actualizar lead

```http
PATCH /leads/:id
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "producto_interes": "Mentoria premium",
  "presupuesto": 500
}
```

### Eliminar lead

```http
DELETE /leads/:id
Authorization: Bearer TU_TOKEN
```

### Estadisticas

```http
GET /leads/stats
Authorization: Bearer TU_TOKEN
```

### Resumen con IA

```http
POST /leads/ai/summary
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "fuente": "facebook",
  "fechaInicio": "2026-05-01T00:00:00.000Z",
  "fechaFin": "2026-05-18T23:59:59.999Z",
  "limit": 100
}
```

El endpoint `/leads/ai/summary` devuelve un resumen mock documentado. La arquitectura del servicio ya queda separada para conectar despues un proveedor real como OpenAI, Anthropic o Gemini sin cambiar el controlador.

## Scripts utiles

```bash
pnpm run start:dev
pnpm run build
pnpm run db:seed
pnpm run test
pnpm run test:e2e
```
