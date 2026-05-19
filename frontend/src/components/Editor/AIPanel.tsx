import { useState } from "react";
import api from "../../services/api";
import type { WritingResult } from "../../types";

type Operation = "polish" | "style-convert" | "translate" | "summarize";

interface Props {
  documentId: string;
  content: string;
  onApplyResult: (result: string) => void;
}

const STYLES = [
  { value: "formal", label: "正式" },
  { value: "casual", label: "随意" },
  { value: "academic", label: "学术" },
  { value: "business", label: "商务" },
  { value: "creative", label: "创意" },
];

const LANGUAGES = [
  { value: "Chinese", label: "中文" },
  { value: "English", label: "英语" },
  { value: "Japanese", label: "日语" },
  { value: "Korean", label: "韩语" },
  { value: "French", label: "法语" },
  { value: "German", label: "德语" },
  { value: "Spanish", label: "西班牙语" },
];

const LENGTHS = [
  { value: "short", label: "简短 (2-3句)" },
  { value: "medium", label: "中等 (1-2段)" },
  { value: "long", label: "详细 (覆盖全部要点)" },
];

const OPERATION_LABELS: Record<Operation, string> = {
  polish: "润色",
  "style-convert": "风格转换",
  translate: "翻译",
  summarize: "摘要",
};

function SelectField({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function AIPanel({ documentId, content, onApplyResult }: Props) {
  const [operation, setOperation] = useState<Operation>("polish");
  const [style, setStyle] = useState("formal");
  const [targetLanguage, setTargetLanguage] = useState("Chinese");
  const [length, setLength] = useState("medium");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExecute = async () => {
    if (!content.trim()) {
      setError("请先输入文本内容");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");
    try {
      let res;
      switch (operation) {
        case "polish":
          res = await api.post<WritingResult>(`/documents/${documentId}/polish`, { content });
          break;
        case "style-convert":
          res = await api.post<WritingResult>(`/documents/${documentId}/style-convert`, { content, style });
          break;
        case "translate":
          res = await api.post<WritingResult>(`/documents/${documentId}/translate`, { content, target_language: targetLanguage });
          break;
        case "summarize":
          res = await api.post<WritingResult>(`/documents/${documentId}/summarize`, { content, length });
          break;
      }
      setResult(res!.data.result);
    } catch {
      setError("AI 操作失败，请检查 API Key 是否有效");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(["polish", "style-convert", "translate", "summarize"] as Operation[]).map((op) => (
          <button
            key={op}
            onClick={() => { setOperation(op); setResult(""); setError(""); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              operation === op
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {OPERATION_LABELS[op]}
          </button>
        ))}
      </div>

      {operation === "style-convert" && (
        <SelectField label="目标风格" value={style} onChange={setStyle} options={STYLES} />
      )}

      {operation === "translate" && (
        <SelectField label="目标语言" value={targetLanguage} onChange={setTargetLanguage} options={LANGUAGES} />
      )}

      {operation === "summarize" && (
        <SelectField label="摘要长度" value={length} onChange={setLength} options={LENGTHS} />
      )}

      <button
        onClick={handleExecute}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            处理中...
          </span>
        ) : (
          `执行${OPERATION_LABELS[operation]}`
        )}
      </button>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {result && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">AI 结果</span>
            <button
              onClick={() => onApplyResult(result)}
              className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
            >
              应用
            </button>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
