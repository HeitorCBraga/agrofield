import Fastify from "fastify";
import cors from "@fastify/cors";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { propertyRoutes } from "./modules/property/property.routes.js";
import { plotRoutes } from "./modules/plot/plot.routes.js";
import { cropRoutes } from "./modules/crop/crop.routes.js";
import { inputApplicationRoutes } from "./modules/input-application/input-application.routes.js";
import { harvestRoutes } from "./modules/harvest/harvest.routes.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
});

app.get("/health", async () => {
  return { status: "ok" };
});

await app.register(authRoutes);
await app.register(propertyRoutes);
await app.register(plotRoutes);
await app.register(cropRoutes);
await app.register(inputApplicationRoutes);
await app.register(harvestRoutes);

const port = Number(process.env.PORT ?? 3333);

app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
