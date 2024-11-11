import { FastifyRequest, FastifyReply } from "fastify";
import { ESWrapper } from "../utils/esAPI";

async function searchClientController(request: FastifyRequest, reply: FastifyReply) {
  const {
    query = "",
    pageNo = 1,
    sortField = "firstName",
    sortOrder = "asc",
    isProspect = false,
    advisorId,
  } = request.query as any;

  const filter = { isProspect, advisorId };

  const esAPI = new ESWrapper({
    cloudId: process.env.ES_CLOUD_ID!,
    apiKey: process.env.ES_API_KEY!,
    index: "clients",
  });

  try {
    const esReadResponse = await esAPI.search({
      query: query,
      from: pageNo - 1,
      size: 20,
      sortField,
      sortOrder,
      filter,
    });

    reply.header("Content-Type", "application/json");
    reply.send({
      data: esReadResponse.hits.hits,
      total: (esReadResponse.hits.total as any).value,
      totalPages: Math.ceil(Number(esReadResponse.hits.total) / 20),
    });
  } catch (error) {
    console.error(error);
    reply.status(500);
    reply.send({ error: "Internal Server Error" });
    return;
  }
}

export default searchClientController;
