import fs from "fs";
import readline from "readline";
import { ESWrapper } from "../utils/esAPI";

const BATCH_SIZE = 1000;

async function importFromFile(filePath: string, esClient: ESWrapper) {
  const fileStream = fs.createReadStream(filePath);
  const lines = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let batch = [];
  let totalImported = 0;
  let batchNumber = 0;

  for await (const line of lines) {
    try {
      const document = JSON.parse(line);
      batch.push(document);

      if (batch.length >= BATCH_SIZE) {
        await processBatch(batch, esClient, ++batchNumber);
        totalImported += batch.length;
        batch = [];
      }
    } catch (error) {
      console.error("Error processing line:", error);
    }
  }

  if (batch.length > 0) {
    await processBatch(batch, esClient, ++batchNumber);
    totalImported += batch.length;
  }
}

async function processBatch(batch: any[], esClient: ESWrapper, batchNumber: number) {
  try {
    const result = await esClient.bulkImport(batch);
    if (result.errors) {
      console.error(
        `Errors in batch ${batchNumber}:`,
        result.items.filter((item) => item?.index?.error)
      );
    }
    console.log(`Processed batch ${batchNumber}, ${batch.length} documents`);
  } catch (error) {
    console.error(`Error processing batch ${batchNumber}:`, error);
  }
}

async function main() {
  const ndjsonFilePath = "./clients.ndjson";
  const esClient = new ESWrapper({
    cloudId: process.env.ES_CLOUD_ID!,
    apiKey: process.env.ES_API_KEY!,
    index: "clients",
  });
  try {
    await importFromFile(ndjsonFilePath, esClient);
  } catch (error) {
    console.error("Error during import:", error);
  }
}

main().catch(console.error);
