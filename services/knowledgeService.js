import { z } from "zod";

export async function searchKnowledgeBase(vectorStore, query) {
  if (!vectorStore) {
    throw new Error("Vector store not initialized.");
  }

  const retriever = vectorStore.asRetriever({
    k: 5,
  });

  const docs = await retriever.invoke(query);

  if (!docs.length) {
    return "No relevant context found in the knowledge base.";
  }

  return docs.map((doc) => doc.pageContent).join("\n\n");
}