import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "AdoptMe API",
      description: "Esta es la documentación de la API del proyecto AdoptMe",
      version: "1.0.0",
    },
  },
  apis: ["./src/docs/**/*.yaml"],
};

const specs = swaggerJSDoc(swaggerOptions);

export default specs;
