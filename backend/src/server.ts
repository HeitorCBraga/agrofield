import Fastify from "fastify";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { propertyRoutes } from "./modules/property/property.routes.js";

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { status: "ok" };
});

await app.register(authRoutes);
await app.register(propertyRoutes);

const port = Number(process.env.PORT ?? 3333);

app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
