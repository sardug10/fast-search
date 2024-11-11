import fs from "fs/promises";
import path from "path";
import { parse } from "json2csv";
import { ESWrapper } from "../utils/esAPI";

async function exportToFile(outputDir: string, format = "json", batchSize = 10000) {
  const esWrapper = new ESWrapper({
    cloudId: process.env.ES_CLOUD_ID!,
    apiKey: process.env.ES_API_KEY!,
    index: "clients",
  });
  let allDocs: any[] = [];
  let batch = 0;

  try {
    while (true) {
      const query = {
        match_all: {},
        from: batch * batchSize,
        size: batchSize,
      };

      const docs = await esWrapper.bulkExport(query);
      if (docs.length === 0) break;

      allDocs = allDocs.concat(docs);
      batch++;

      console.log(`Fetched batch ${batch}, total documents: ${allDocs.length}`);
    }

    if (allDocs.length === 0) {
      console.log("No documents found to export.");
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `export_${timestamp}.${format}`;
    const filePath = path.join(outputDir, fileName);

    if (format === "json") {
      await fs.writeFile(filePath, JSON.stringify(allDocs, null, 2));
    } else if (format === "csv") {
      const csv = parse(allDocs);
      await fs.writeFile(filePath, csv);
    } else {
      throw new Error('Unsupported format. Use "json" or "csv".');
    }

    console.log(`Export completed. File saved as ${filePath}`);
  } catch (error) {
    console.error("Error during export:", error);
    throw error;
  }
}

async function main() {
  const outputDir = "./exports";
  const format = "csv";
  try {
    await fs.mkdir(outputDir, { recursive: true });
    await exportToFile(outputDir, format);
  } catch (error) {
    console.error("Export failed:", error);
  }
}

main();
