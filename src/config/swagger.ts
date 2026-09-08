import swaggerJsdoc from "swagger-jsdoc";

import packageJson from "../../package.json" with { type: "json" };
const version = packageJson.version;

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.2.0",
    info: {
      title: "REST API de con Express + TypeScript",
      version: version,
      description: "Api docs for category en order",
    },

    servers: [
      {
        url: "http://localhost:4000",
      },
    ],

    tags: [
      { name: "Category", description: "Api operations related to categories" },
      { name: "Orders", description: "Api operations related to orders" },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: ["./src/modules/**/docs/*.openapi.yaml"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
export default swaggerSpec;
