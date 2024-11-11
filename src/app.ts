import Fastify from "fastify";

import dotenv from "dotenv";
dotenv.config();

import clientRouter from "./routes/clients";

const PORT = Number(process.env.PORT) || 3000;

const fastify = Fastify({
  logger: true,
});

fastify.register(clientRouter);

const start = async () => {
  try {
    await fastify.listen({ port: PORT });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
