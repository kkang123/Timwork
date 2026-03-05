import { useAppStore } from "../store/useAppStore";
import { getAllRevisions } from "../utils/metadataUtils";

const SLOT_COLORS = [
  { bg: "bg-blue-600", text: "text-blue-400", dot: "bg-blue-400" },
  { bg: "bg-orange-500", text: "text-orange-400", dot: "bg-orange-400" },
  { bg: "bg-green-600", text: "text-green-400", dot: "bg-green-400" },
  { bg: "bg-purple-600", text: "text-purple-400", dot: "bg-purple-400" },
];

export function CompareRevisionPanel() {
  const {
    metadata,
    compareSlots,
    compareDisplayMode,
    layerOpacities,
    addCompareSlot,
    updateCompareSlotRevision,
    removeCompareSlot,
    clearCompareSlots,
    setCompareDisplayMode,
    setLayerOpacity,
  } = useAppStore();

  // 리비전 모드: 모든 슬롯이 동일 공종이고 해당 공종에 리비전이 2개 이상
  const isRevisionMode = (() => {
    if (compareSlots.length === 0) return false;
    const first = compareSlots[0];
    const allSameDiscipline = compareSlots.every(
      (s) =>
        s.drawingId === first.drawingId &&
        s.disciplineName === first.disciplineName &&
        s.regionId === first.regionId,
    );
    if (!allSameDiscipline) return false;
    const discipline =
      metadata?.drawings[first.drawingId]?.disciplines?.[first.disciplineName];
    return discipline
      ? getAllRevisions(discipline, first.regionId).length > 1
      : false;
  })();

  // 리비전 모드일 때 해당 공종의 모든 리비전 목록
  const allRevisions = (() => {
    if (!isRevisionMode || compareSlots.length === 0) return [];
    const first = compareSlots[0];
    const discipline =
      metadata?.drawings[first.drawingId]?.disciplines?.[first.disciplineName];
    return discipline ? getAllRevisions(discipline, first.regionId) : [];
  })();

  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 shrink-0">
      {compareSlots.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-1">
          사이드바에서 공종을 선택하세요 (최대 4개) / 나란히 모드는 최대 2개까지
          선택 가능합니다
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {isRevisionMode ? (
            /* ── 리비전 비교 모드: 통합 헤더 + 컴팩트 opacity 행 ── */
            <>
              {/* 헤더: 공종명 + 리비전 토글 칩 */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-white">
                  {compareSlots[0].regionId
                    ? `${compareSlots[0].disciplineName} ${compareSlots[0].regionId}`
                    : compareSlots[0].disciplineName}
                </span>
                <span className="text-[10px] text-gray-400 bg-gray-700 px-1.5 py-0.5 rounded tracking-wide">
                  리비전 비교
                </span>
                <div className="flex items-center gap-1">
                  {allRevisions.map((rev) => {
                    const activeSlot = compareSlots.find(
                      (s) => s.revisionVersion === rev.version,
                    );
                    const slotIdx = activeSlot
                      ? compareSlots.indexOf(activeSlot)
                      : -1;
                    const canAdd = compareSlots.length < 4;
                    const isDisabled = !activeSlot && !canAdd;
                    return (
                      <button
                        key={rev.version}
                        disabled={isDisabled}
                        onClick={() => {
                          if (activeSlot) {
                            removeCompareSlot(activeSlot.id);
                          } else if (canAdd) {
                            addCompareSlot({
                              drawingId: compareSlots[0].drawingId,
                              disciplineName: compareSlots[0].disciplineName,
                              regionId: compareSlots[0].regionId,
                              revisionVersion: rev.version,
                            });
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          slotIdx >= 0
                            ? `${SLOT_COLORS[slotIdx].bg} text-white ring-2 ring-white/30`
                            : isDisabled
                              ? "bg-gray-700 text-gray-600 cursor-not-allowed"
                              : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                        }`}
                      >
                        {rev.version}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 활성 리비전별 opacity 행 */}
              {compareSlots.map((slot, i) => {
                const colors = SLOT_COLORS[i];
                const layerId = slot.id;
                const opacity = layerOpacities[layerId] ?? 0.8;
                return (
                  <div key={slot.id} className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`}
                    />
                    <span
                      className={`text-xs font-medium w-10 shrink-0 ${colors.text}`}
                    >
                      {slot.revisionVersion}
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={opacity}
                        onChange={(e) =>
                          setLayerOpacity(layerId, Number(e.target.value))
                        }
                        className="w-20"
                      />
                      <span className="text-xs text-gray-500 w-7 text-right">
                        {Math.round(opacity * 100)}%
                      </span>
                    </div>
                    <button
                      onClick={() => removeCompareSlot(slot.id)}
                      className="text-gray-500 hover:text-gray-300 text-xs px-1 shrink-0"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </>
          ) : (
            /* ── 일반 모드: 기존 슬롯별 행 ── */
            compareSlots.map((slot, i) => {
              const colors = SLOT_COLORS[i];
              const discipline =
                metadata?.drawings[slot.drawingId]?.disciplines?.[
                  slot.disciplineName
                ];
              const revisions = discipline
                ? getAllRevisions(discipline, slot.regionId)
                : [];
              const label = slot.regionId
                ? `${slot.disciplineName} ${slot.regionId}`
                : slot.disciplineName;
              const layerId = slot.id;
              const opacity = layerOpacities[layerId] ?? 0.8;

              return (
                <div
                  key={slot.id}
                  className="flex items-center gap-2 flex-wrap"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors.dot}`}
                  />
                  <span
                    className={`text-xs font-medium shrink-0 ${colors.text}`}
                  >
                    {label}
                  </span>

                  {/* 리비전 버튼 (복수 리비전일 때만) */}
                  {revisions.length > 1 &&
                    revisions.map((rev) => (
                      <button
                        key={rev.version}
                        onClick={() =>
                          updateCompareSlotRevision(slot.id, rev.version)
                        }
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          slot.revisionVersion === rev.version
                            ? `${colors.bg} text-white`
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {rev.version}
                      </button>
                    ))}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={opacity}
                      onChange={(e) =>
                        setLayerOpacity(layerId, Number(e.target.value))
                      }
                      className="w-20"
                    />
                    <span className="text-xs text-gray-500 w-7 text-right">
                      {Math.round(opacity * 100)}%
                    </span>
                  </div>

                  <button
                    onClick={() => removeCompareSlot(slot.id)}
                    className="text-gray-500 hover:text-gray-300 text-xs px-1 shrink-0"
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}

          {/* 하단 컨트롤 */}
          <div className="flex items-center gap-1 pt-1 border-t border-gray-700">
            <button
              onClick={() => setCompareDisplayMode("overlay")}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                compareDisplayMode === "overlay"
                  ? "bg-gray-500 text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600"
              }`}
            >
              겹치기
            </button>
            <button
              onClick={() => setCompareDisplayMode("side-by-side")}
              disabled={compareSlots.length !== 2}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                compareDisplayMode === "side-by-side"
                  ? "bg-gray-500 text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600"
              } ${compareSlots.length !== 2 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              나란히
            </button>
            <button
              onClick={clearCompareSlots}
              className="ml-auto text-xs text-gray-500 hover:text-gray-300 px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              전체 제거
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
