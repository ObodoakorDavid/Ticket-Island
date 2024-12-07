import authDocs from "./auth.js";

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "API Documentation",
    version: "1.0.0",
    description: "Express API documentation",
  },
  servers: [
    { url: "http://localhost:3000/api/v1" },
    { url: "http://localhost:3000/api/v1" },
  ],
  paths: {
    ...authDocs.paths,
  },
};

export default swaggerSpec;
