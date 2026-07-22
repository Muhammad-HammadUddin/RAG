import { useCallback, useEffect, useState } from "react";
import { getAllKnowledge, searchKnowledge } from "../services/knowledgeService.js";

export const useKnowledgeList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllKnowledge();
      setItems(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load knowledge base.");
    } finally {
      setLoading(false);
    }
  }, []);

  const runSearch = useCallback(async ({ q, type }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchKnowledge({ q, type });
      setItems(res.data || []);
    } catch (err) {
      setError(err.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { items, loading, error, refetch: fetchAll, runSearch };
};
