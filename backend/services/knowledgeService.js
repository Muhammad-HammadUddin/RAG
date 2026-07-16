export async function searchKnowledgeBase(vectorStore, query, threshold = 0.75) {
  if (!vectorStore) {
    throw new Error("Vector store not initialized.");
  }

  const results = await vectorStore.similaritySearchWithScore(query, 5);

  const filtered = results.filter(([, score]) => score >= threshold);

  if (!filtered.length) {
    return "No relevant context found in the knowledge base.";
  }

  return filtered.map(([doc]) => doc.pageContent).join("\n\n");
}