import { FastifyInstance } from "fastify";
import searchClientController from "../controller/searchClient";
import addClientController from "../controller/addClient";
import deleteClientController from "../controller/deleteClient";

async function routes(fastify: FastifyInstance) {
  fastify.get("/client/search", searchClientController);
  fastify.post("/client", addClientController);
  fastify.delete("/client/:id", deleteClientController);
}

export default routes;
