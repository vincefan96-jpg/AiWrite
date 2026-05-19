import { useEffect, useState } from "react";
import api from "../../services/api";
import type { Version } from "../../types";

interface Props {
  documentId: string;
  onSelectVersion: (version: Version) => void;
  onRestoreVersion: (version: Version) => void;
  refreshTrigger: number;
}

const OPERATION_LABELS: Record<string, string> = {
  original: "原始",
  polish: "润色",
  style_convert: "风格转换",
  translate: "翻译",
  summarize: "摘要",
  manual_save: "手动保存",
  pre_restore_snapshot: "恢复前快照",
  restore: "恢复",
};

const OPERATION_COLORS: Record<string, string> = {
  original: "bg-gray-200 text-gray-700",
  polish: "bg-blue-100 text-blue-700",
  style_convert: "bg-purple-100 text-purple-700",
  translate: "bg-green-100 text-green-700",
  summarize: "bg-orange-100 text-orange-700",
  manual_save: "bg-gray-100 text-gray-600",
  pre_restore_snapshot: "bg-yellow-100 text-yellow-700",
  restore: "bg-indigo-100 text-indigo-700",
};

export default function VersionList({ documentId, onSelectVersion, onRestoreVersion, refreshTrigger }: Props) {
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    api.get<Version[]>(`/documents/${documentId}/versions`).then((res) => setVersions(res.data));
  }, [documentId, refreshTrigger]);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">版本历史</h3>
      {versions.length === 0 ? (
        <p className="text-xs text-gray-400">暂无版本</p>
      ) : (
        versions.map((v) => (
          <div
            key={v.id}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm hover:border-indigo-300 transition cursor-pointer"
            onClick={() => onSelectVersion(v)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">v{v.version_number}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${OPERATION_COLORS[v.operation_type] || "bg-gray-100 text-gray-600"}`}>
                {OPERATION_LABELS[v.operation_type] || v.operation_type}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">
                {new Date(v.created_at).toLocaleString()}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestoreVersion(v);
                }}
                className="text-xs text-indigo-500 hover:text-indigo-700"
              >
                恢复
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
