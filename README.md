# AdoptMe API

API backend para la gestión de usuarios, mascotas y adopciones, desarrollada con **Node.js, Express y MongoDB**.

El proyecto incluye autenticación mediante JWT, gestión de usuarios y mascotas, adopciones, carga de documentos e imágenes, generación de datos de prueba, logging, documentación con Swagger y ejecución mediante Docker.

## Tecnologías

- Node.js
- Express
- MongoDB / MongoDB Atlas
- Mongoose
- JWT
- Bcrypt
- Multer
- Winston
- Swagger
- Mocha
- Chai
- Supertest
- Docker

## Instalación

Clonar el repositorio:

```bash
git clone <https://github.com/LucasnNP/programacion_backend_III.git>
cd RecursosBackend-Adoptme
```

Instalar las dependencias:

```bash
npm install
```

## Variables de entorno

El proyecto utiliza diferentes archivos `.env` según el modo de ejecución.

Ejemplo para desarrollo:

```env
PORT=8080
MONGO_URL=<MONGODB_CONNECTION_STRING>
```

Para ejecutar el proyecto en modo desarrollo:

```bash
npm run dev
```

También puede ejecutarse directamente:

```bash
npm start
```

La aplicación estará disponible en:

```text
http://localhost:8080
```

## Tests

Los tests funcionales se ejecutan utilizando un entorno independiente mediante `.env.test`.

Para ejecutar los tests:

```bash
node src/app.js --mode test
```

En otra terminal:

```bash
npm test
```

Los tests cubren los principales módulos de la aplicación, incluyendo:

- Users
- Sessions
- Pets
- Adoptions

## Documentación Swagger

La API cuenta con documentación interactiva mediante Swagger.

Con la aplicación en ejecución, acceder a:

```text
http://localhost:8080/apidocs
```

Desde Swagger pueden consultarse y probarse las rutas documentadas de la API.

## Docker

El proyecto incluye un `Dockerfile` para generar la imagen de la aplicación.

### Construir la imagen

Desde la raíz del proyecto:

```bash
docker build -t adoptme .
```

### Ejecutar el contenedor

```bash
docker run --name adoptme-container \
  -p 8080:8080 \
  -e PORT=8080 \
  -e MONGO_URL="<MONGODB_CONNECTION_STRING>" \
  adoptme
```

La aplicación estará disponible en:

```text
http://localhost:8080
```

Y la documentación Swagger en:

```text
http://localhost:8080/apidocs
```

### Descargar la imagen desde Docker Hub

La imagen publicada del proyecto se encuentra disponible en Docker Hub:

**https://hub.docker.com/r/lucasnnp/adoptme**

Para descargarla:

```bash
docker pull lucasnnp/adoptme:latest
```

Para ejecutarla:

```bash
docker run --name adoptme-container \
  -p 8080:8080 \
  -e PORT=8080 \
  -e MONGO_URL="<MONGODB_CONNECTION_STRING>" \
  lucasnnp/adoptme:latest
```

## Estructura general

```text
RecursosBackend-Adoptme/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── dao/
│   |   ├── models/
│   ├── docs/
│   ├── dto/
│   ├── middlewares/
│   ├── mocks/
│   ├── public/
│   ├── repository/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── app.js
├── test/
│   ├── assets/
│   └── integration/
├── .dockerignore
├── .gitignore
├── Dockerfile
├── package.json
└── README.md
```

## Autor

Lucas Nicolás Prat
