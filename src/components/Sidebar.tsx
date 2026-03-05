import { useAppStore } from "../store/useAppStore";
import { DrawingTree } from "./DrawingTree";
import type { ViewMode } from "../types/metadata";

const VIEW_MODES: { mode: ViewMode; label: string; title: string }[] = [
  { mode: "single", label: "S", title: "Single View" },
  { mode: "compare", label: "C", title: "Compare View" },
];

export function Sidebar() {
  const { viewMode, setViewMode } = useAppStore();

  return (
    <aside className="w-70 min-w-70 max-w-70 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-100">도면 탐색기</span>
        <div className="flex gap-1">
          {VIEW_MODES.map(({ mode, label, title }) => (
            <button
              key={mode}
              title={title}
              onClick={() => setViewMode(mode)}
              className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                viewMode === mode
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <DrawingTree />

      {viewMode === "compare" && (
        <div className="px-3 py-3 border-t border-gray-700 text-[10px] text-gray-500 leading-relaxed">
          💡 리비전이 여러 개인 공종(건축 등)은{" "}
          <span className="text-gray-400">두 번째 슬롯</span>으로 선택해야 다른
          공종과 오버레이 비교가 가능합니다.
        </div>
      )}
    </aside>
  );
}
