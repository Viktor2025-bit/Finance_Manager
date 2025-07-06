import fs from "fs";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Personal Finance Manager",
      version: "1.0.0",
      description: "API for managing personal finances",
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/Routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

// ✅ Write all route paths to file so we can find the bad one
if (
  swaggerSpec &&
  typeof swaggerSpec === "object" &&
  "paths" in swaggerSpec &&
  swaggerSpec.paths &&
  typeof swaggerSpec.paths === "object"
) {
  fs.writeFileSync(
    "swaggerPaths.json",
    JSON.stringify(Object.keys(swaggerSpec.paths), null, 2)
  );
} else {
  console.warn("⚠️ Could not find 'paths' in swaggerSpec. Check your Swagger comments.");
}

export { swaggerSpec };
