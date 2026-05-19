import { useNavigate } from "react-router-dom";
import DocumentList from "../components/Editor/DocumentList";
import { useDocuments } from "../hooks/useDocuments";

export default function Dashboard() {
  const { documents, loading, fetchDocuments, createDocument, deleteDocument } = useDocuments();
  const navigate = useNavigate();

  const handleCreate = async () => {
    const doc = await createDocument();
    navigate(`/editor/${doc.id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
    fetchDocuments();
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <DocumentList
        documents={documents}
        loading={loading}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />
    </div>
  );
}
