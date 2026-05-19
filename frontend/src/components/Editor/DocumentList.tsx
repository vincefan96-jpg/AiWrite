import { useNavigate } from "react-router-dom";
import type { DocumentListItem } from "../../types";

interface Props {
  documents: DocumentListItem[];
  loading: boolean;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export default function DocumentList({ documents, loading, onCreate, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的文档</h1>
        <button
          onClick={onCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          + 新建文档
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">暂无文档</p>
          <button
            onClick={onCreate}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            创建第一篇文档
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center justify-between hover:border-indigo-300 hover:shadow-sm transition cursor-pointer"
              onClick={() => navigate(`/editor/${doc.id}`)}
            >
              <div>
                <h3 className="font-medium text-gray-900">{doc.title}</h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  更新于 {new Date(doc.updated_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("确定删除此文档？")) {
                    onDelete(doc.id);
                  }
                }}
                className="text-sm text-gray-400 hover:text-red-600 transition"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
