import { Client } from "@elastic/elasticsearch";

interface ESConfig {
  cloudId: string;
  apiKey: string;
  index?: string;
}

interface SearchOptions {
  query: any;
  sortField?: string;
  sortOrder?: string;
  filter?: any;
  from?: number;
  size?: number;
}

export class ESWrapper {
  client: Client;
  index: string;
  constructor(config: ESConfig) {
    this.client = new Client({
      cloud: {
        id: config.cloudId,
      },
      auth: {
        apiKey: config.apiKey,
      },
    });
    this.index = config.index || "default_index";
  }

  async addDocument(document: any) {
    return await this.client.index({
      index: this.index,
      body: document,
    });
  }

  async deleteDocument(documentId: string) {
    try {
      const result = await this.client.delete({
        index: this.index,
        id: documentId,
      });

      console.log(result);

      if (result.result === "deleted") {
        console.log(`Document with ID ${documentId} has been successfully deleted.`);
        return true;
      } else {
        console.log(`Document with ID ${documentId} was not found or could not be deleted.`);
        return false;
      }
    } catch (error) {
      console.error(`Error deleting document with ID ${documentId}:`, error);
      throw new Error("Failed to delete document");
    }
  }

  async search({ query, sortField = "firstName", sortOrder = "asc", filter, from = 0, size = 20 }: SearchOptions) {
    const sort = sortField ? { [`${sortField}.keyword`]: sortOrder } : undefined;

    let filterQueries: any[] = [];
    Object.keys(filter).forEach((key) => {
      if (filter[key]) {
        filterQueries.push({ term: { [key]: filter[key] } });
      }
    });

    const body = {
      query: {
        bool: {
          must: { multi_match: { query, fields: ["*"] } },
          filter: filterQueries.length > 0 ? filterQueries : undefined,
        },
      },
      sort: sort ? [sort] : undefined,
      from,
      size,
    };

    return await this.client.search({
      index: this.index,
      body,
    });
  }

  async bulkImport(documents: any) {
    const body = documents.flatMap((doc: any) => [{ index: { _index: this.index } }, doc]);

    return await this.client.bulk({ body });
  }

  async bulkExport(query = { match_all: {} }) {
    const { body }: any = await this.client.search({
      index: this.index,
      body: {
        query,
        size: 10000,
      },
    });

    return body.hits.hits.map((hit: any) => hit._source);
  }
}
