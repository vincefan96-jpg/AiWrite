import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import type { Document, DocumentListItem } from "../types";

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<DocumentListItem[]>("/documents");
      setDocuments(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDocument = useCallback(async (title?: string, content?: string) => {
    const res = await api.post<Document>("/documents", {
      title: title || "Untitled",
      content: content || "",
    });
    return res.data;
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    await api.delete(`/documents/${id}`);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, fetchDocuments, createDocument, deleteDocument };
}
