import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "./env.js";

export const qdrantClient = new QdrantClient({
    url: env.QDRANT_URL,
    checkCompatibility: false,

});