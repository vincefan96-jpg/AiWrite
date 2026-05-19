import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import TextEditor from "../components/Editor/TextEditor";
import AIPanel from "../components/Editor/AIPanel";
import VersionList from "../components/VersionHistory/VersionList";
import VersionDiff from "../components/VersionHistory/VersionDiff";
import api from "../services/api";
import type { Document, Version } from "../types";

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [versionRefresh, setVersionRefresh] = useState(0);

  useEffect(() => {
    if (id) {
      api.get<Document>(`/documents/${id}`).then((res) => {
        setDocument(res.data);
        setContent(res.data.content);
        setTitle(res.data.title);
      });
    }
  }, [id]);

  const handleSave = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    try {
      await api.put(`/documents/${id}`, { title, content });
      setVersionRefresh((v) => v + 1);
    } finally {
      setSaving(false);
    }
  }, [id, title, content]);

  const handleApplyResult = useCallback((result: string) => {
    setContent(result);
  }, []);

  const handleSelectVersion = useCallback((version: Version) => {
    setSelectedVersion(version);
    setShowDiff(true);
  }, []);

  const handleRestoreVersion = useCallback(async (version: Version) => {
    if (!id) return;
    await api.post(`/documents/${id}/versions/${version.id}/restore`);
    setContent(version.content);
    setVersionRefresh((v) => v + 1);
  }, [id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  if (!document) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* 编辑器区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 标题栏 */}
        <div className="px-6 py-3 border-b border-gray-200 bg-white flex items-center gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 text-lg font-semibold text-gray-900 outline-none bg-transparent"
            placeholder="请输入文档标题..."
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>

        {/* 编辑器 */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <TextEditor content={content} onChange={setContent} />

          {/* 版本对比视图 */}
          {showDiff && selectedVersion && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">
                  对比当前版本与 v{selectedVersion.version_number} ({selectedVersion.operation_type})
                </h4>
                <button
                  onClick={() => setShowDiff(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  关闭
                </button>
              </div>
              <VersionDiff original={selectedVersion.content} modified={content} />
            </div>
          )}
        </div>

        {/* 底部状态栏 */}
        <div className="px-6 py-2 border-t border-gray-200 bg-white text-xs text-gray-400 flex items-center gap-4">
          <span>字数: {content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length}</span>
          <span>字符数: {content.replace(/<[^>]*>/g, "").length}</span>
          <span className="ml-auto">Ctrl+S 保存</span>
        </div>
      </div>

      {/* 右侧面板 */}
      <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto p-4 space-y-6">
        <AIPanel documentId={id!} content={content} onApplyResult={handleApplyResult} />
        <hr className="border-gray-200" />
        <VersionList
          documentId={id!}
          onSelectVersion={handleSelectVersion}
          onRestoreVersion={handleRestoreVersion}
          refreshTrigger={versionRefresh}
        />
      </div>
    </div>
  );
}
