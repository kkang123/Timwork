import { useAppStore } from "../store/useAppStore";
import {
  getAllRevisions,
  getEffectiveImageTransform,
  getLatestRevision,
} from "../utils/metadataUtils";
import type { DrawingEntry } from "../types/metadata";

interface Props {
  drawing: DrawingEntry;
}

const DISCIPLINE_COLORS: Record<string, string> = {
  건축: "bg-blue-600 hover:bg-blue-500",
  구조: "bg-orange-600 hover:bg-orange-500",
  공조설비: "bg-green-600 hover:bg-green-500",
  배관설비: "bg-cyan-600 hover:bg-cyan-500",
  설비: "bg-purple-600 hover:bg-purple-500",
  소방: "bg-red-600 hover:bg-red-500",
  조경: "bg-lime-600 hover:bg-lime-500",
};

const DEFAULT_COLOR = "bg-gray-600 hover:bg-gray-500";

const SLOT_BG_COLORS = [
  "bg-blue-600 hover:bg-blue-500",
  "bg-orange-500 hover:bg-orange-400",
  "bg-green-600 hover:bg-green-500",
  "bg-purple-600 hover:bg-purple-500",
];

const SLOT_DOT_COLORS = [
  "bg-blue-400",
  "bg-orange-400",
  "bg-green-400",
  "bg-purple-400",
];

export function DisciplineSelector({ drawing }: Props) {
  const {
    viewMode,
    primarySelection,
    compareSlots,
    metadata,
    setPrimarySelection,
    addCompareSlot,
    removeCompareSlot,
  } = useAppStore();

  const disciplines = Object.entries(drawing.disciplines ?? {});

  if (disciplines.length === 0) return null;

  // Rule 1: 첫 번째 슬롯의 drawingId 잠금
  const firstSlot = compareSlots[0] ?? null;
  const lockedDrawingId = firstSlot?.drawingId ?? null;

  // relativeTo 호환성 체크: 첫 번째 슬롯의 relativeTo
  const firstSlotRelativeTo = (() => {
    if (!firstSlot || !metadata) return null;
    const disc =
      metadata.drawings[firstSlot.drawingId]?.disciplines?.[
        firstSlot.disciplineName
      ];
    if (!disc) return null;
    const revs = getAllRevisions(disc, firstSlot.regionId);
    const rev =
      revs.find((r) => r.version === firstSlot.revisionVersion) ?? revs[0];
    if (!rev) return null;
    return (
      getEffectiveImageTransform(disc, firstSlot.regionId, rev)?.relativeTo ??
      null
    );
  })();

  // Rule 2: 리비전 모드 감지 (첫 번째 슬롯의 공종이 리비전 2개 이상)
  const isRevisionMode = (() => {
    if (!firstSlot || !metadata) return false;
    const disc =
      metadata.drawings[firstSlot.drawingId]?.disciplines?.[
        firstSlot.disciplineName
      ];
    return disc ? getAllRevisions(disc, firstSlot.regionId).length > 1 : false;
  })();

  const handleSelect = (
    disciplineName: string,
    regionId: string | null,
    revisionVersion: string,
  ) => {
    if (viewMode === "single") {
      if (isActiveSingle(disciplineName, regionId)) {
        setPrimarySelection(null);
      } else {
        setPrimarySelection({
          drawingId: drawing.id,
          disciplineName,
          regionId,
          revisionVersion,
        });
      }
    } else if (viewMode === "compare") {
      const matchingSlots = compareSlots.filter(
        (s) =>
          s.drawingId === drawing.id &&
          s.disciplineName === disciplineName &&
          s.regionId === regionId,
      );
      if (matchingSlots.length > 0) {
        matchingSlots.forEach((s) => removeCompareSlot(s.id));
      } else if (compareSlots.length < 4) {
        addCompareSlot({
          drawingId: drawing.id,
          disciplineName,
          regionId,
          revisionVersion,
        });
      }
    }
  };

  const isActiveSingle = (disciplineName: string, regionId: string | null) =>
    viewMode === "single" &&
    primarySelection?.drawingId === drawing.id &&
    primarySelection?.disciplineName === disciplineName &&
    primarySelection?.regionId === regionId;

  const getSlotIndex = (disciplineName: string, regionId: string | null) =>
    compareSlots.findIndex(
      (s) =>
        s.drawingId === drawing.id &&
        s.disciplineName === disciplineName &&
        s.regionId === regionId,
    );

  const isActiveByDiscipline = (
    disciplineName: string,
    regionId: string | null,
  ) =>
    compareSlots.some(
      (s) =>
        s.drawingId === drawing.id &&
        s.disciplineName === disciplineName &&
        s.regionId === regionId,
    );

  const atMax = compareSlots.length >= 4;

  // Rule 1: 다른 빌딩 차단
  const isWrongBuilding =
    viewMode === "compare" &&
    lockedDrawingId !== null &&
    lockedDrawingId !== drawing.id;

  return (
    <div className="px-3 py-2">
      <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
        공종 선택
      </div>
      <div className="flex flex-wrap gap-1.5">
        {disciplines.map(([name, disc]) => {
          const color = DISCIPLINE_COLORS[name] ?? DEFAULT_COLOR;
          const hasRegions =
            disc.regions && Object.keys(disc.regions).length > 0;

          if (hasRegions) {
            return Object.entries(disc.regions!).map(([regionId, region]) => {
              const latestRev = region.revisions[region.revisions.length - 1];
              if (!latestRev) return null;

              if (viewMode === "compare") {
                const thisRelativeTo =
                  getEffectiveImageTransform(disc, regionId, latestRev)
                    ?.relativeTo ?? null;
                const isIncompatibleRelativeTo =
                  !!firstSlotRelativeTo &&
                  !!thisRelativeTo &&
                  firstSlotRelativeTo !== thisRelativeTo;
                const isRevisionLocked =
                  isRevisionMode &&
                  (firstSlot!.drawingId !== drawing.id ||
                    firstSlot!.disciplineName !== name ||
                    firstSlot!.regionId !== regionId);
                const slotIdx = getSlotIndex(name, regionId);
                const isActive = isActiveByDiscipline(name, regionId);
                const isDisabled =
                  isWrongBuilding ||
                  isIncompatibleRelativeTo ||
                  isRevisionLocked ||
                  (!isActive && atMax);
                const btnColor = isActive
                  ? SLOT_BG_COLORS[Math.max(0, slotIdx)]
                  : color;
                const revDots =
                  isRevisionMode && isActive
                    ? compareSlots
                        .map((s, idx) => ({ s, idx }))
                        .filter(
                          ({ s }) =>
                            s.drawingId === drawing.id &&
                            s.disciplineName === name &&
                            s.regionId === regionId,
                        )
                    : [];
                return (
                  <button
                    key={`${name}-${regionId}`}
                    onClick={() =>
                      !isDisabled &&
                      handleSelect(name, regionId, latestRev.version)
                    }
                    className={`px-2 py-1 rounded text-xs text-white font-medium transition-colors flex flex-col items-center gap-0.5 ${btnColor} ${
                      isActive
                        ? "ring-2 ring-white ring-offset-1 ring-offset-gray-800"
                        : ""
                    } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <span>
                      {name} {regionId}
                    </span>
                    {revDots.length > 0 && (
                      <span className="flex gap-0.5">
                        {revDots.map(({ idx }) => (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${SLOT_DOT_COLORS[idx]}`}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                );
              }

              const active = isActiveSingle(name, regionId);
              return (
                <button
                  key={`${name}-${regionId}`}
                  onClick={() =>
                    handleSelect(name, regionId, latestRev.version)
                  }
                  className={`px-2 py-1 rounded text-xs text-white font-medium transition-colors ${color} ${
                    active
                      ? "ring-2 ring-white ring-offset-1 ring-offset-gray-800"
                      : ""
                  }`}
                >
                  {name} {regionId}
                </button>
              );
            });
          }

          const latestRev = getLatestRevision(disc, null);
          if (!latestRev) return null;

          if (viewMode === "compare") {
            const thisRelativeTo =
              getEffectiveImageTransform(disc, null, latestRev)?.relativeTo ??
              null;
            const isIncompatibleRelativeTo =
              !!firstSlotRelativeTo &&
              !!thisRelativeTo &&
              firstSlotRelativeTo !== thisRelativeTo;
            const isRevisionLocked =
              isRevisionMode &&
              (firstSlot!.drawingId !== drawing.id ||
                firstSlot!.disciplineName !== name ||
                firstSlot!.regionId !== null);
            const slotIdx = getSlotIndex(name, null);
            const isActive = isActiveByDiscipline(name, null);
            const isDisabled =
              isWrongBuilding ||
              isIncompatibleRelativeTo ||
              isRevisionLocked ||
              (!isActive && atMax);
            const btnColor = isActive
              ? SLOT_BG_COLORS[Math.max(0, slotIdx)]
              : color;
            const revDots =
              isRevisionMode && isActive
                ? compareSlots
                    .map((s, idx) => ({ s, idx }))
                    .filter(
                      ({ s }) =>
                        s.drawingId === drawing.id &&
                        s.disciplineName === name &&
                        s.regionId === null,
                    )
                : [];
            return (
              <button
                key={name}
                onClick={() =>
                  !isDisabled && handleSelect(name, null, latestRev.version)
                }
                className={`px-2 py-1 rounded text-xs text-white font-medium transition-colors flex flex-col items-center gap-0.5 ${btnColor} ${
                  isActive
                    ? "ring-2 ring-white ring-offset-1 ring-offset-gray-800"
                    : ""
                } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <span>{name}</span>
                {revDots.length > 0 && (
                  <span className="flex gap-0.5">
                    {revDots.map(({ idx }) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${SLOT_DOT_COLORS[idx]}`}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          }

          const active = isActiveSingle(name, null);
          return (
            <button
              key={name}
              onClick={() => handleSelect(name, null, latestRev.version)}
              className={`px-2 py-1 rounded text-xs text-white font-medium transition-colors ${color} ${
                active
                  ? "ring-2 ring-white ring-offset-1 ring-offset-gray-800"
                  : ""
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
