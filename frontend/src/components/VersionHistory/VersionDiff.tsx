import { useMemo } from "react";
import { diff_match_patch as DMP } from "diff-match-patch";

interface Props {
  original: string;
  modified: string;
}

export default function VersionDiff({ original, modified }: Props) {
  const diffs = useMemo(() => {
    const dmp = new DMP();
    return dmp.diff_main(original, modified);
  }, [original, modified]);

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4 font-mono text-sm leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
      {diffs.map(([op, text], i) => {
        if (op === 0) return <span key={i}>{text}</span>;
        if (op === 1) return (
          <span key={i} className="bg-green-100 text-green-800">
            {text}
          </span>
        );
        return (
          <span key={i} className="bg-red-100 text-red-800 line-through">
            {text}
          </span>
        );
      })}
    </div>
  );
}
