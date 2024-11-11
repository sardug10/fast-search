import { FastifyRequest, FastifyReply } from "fastify";
import { ESWrapper } from "../utils/esAPI";

async function deleteClientController(request: FastifyRequest, reply: FastifyReply) {
  const id = (request.params as any).id;
  console.log(`Deleting document with ID ${id}`);

  const esAPI = new ESWrapper({
    cloudId: process.env.ES_CLOUD_ID!,
    apiKey: process.env.ES_API_KEY!,
    index: "clients",
  });

  try {
    const esWriteResponse = await esAPI.deleteDocument(id);
    reply.header("Content-Type", "application/json");
    reply.send(esWriteResponse);
  } catch (error) {
    console.error(error);
    reply.status(500);
    reply.send({ error: "Internal Server Error" });
    return;
  }
}

export default deleteClientController;
