import { useAppStore } from "../store/useAppStore";
import { getAllRevisions } from "../utils/metadataUtils";

export function RevisionTimeline() {
  const { metadata, viewMode, primarySelection, setPrimarySelection } =
    useAppStore();

  if (!metadata || viewMode === "compare" || !primarySelection) return null;

  const drawingId = primarySelection.drawingId;
  const disciplineName = primarySelection.disciplineName;
  const regionId = primarySelection.regionId;
  const currentVersion = primarySelection.revisionVersion;

  const drawing = metadata.drawings[drawingId];
  const discipline = drawing?.disciplines?.[disciplineName];
  if (!discipline) return null;

  const revisions = getAllRevisions(discipline, regionId);
  if (revisions.length === 0) return null;

  const activeRevision =
    revisions.find((r) => r.version === currentVersion) ?? null;

  const handleRevisionClick = (version: string) => {
    setPrimarySelection({ ...primarySelection, revisionVersion: version });
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 mr-2 shrink-0">리비전</span>
        <div className="flex items-center gap-0 flex-1 overflow-x-auto">
          {revisions.map((rev, i) => {
            const isActive = currentVersion === rev.version;
            return (
              <div key={rev.version} className="flex items-center">
                {i > 0 && <div className="w-8 h-px bg-gray-600 shrink-0" />}
                <button
                  onClick={() => handleRevisionClick(rev.version)}
                  title={rev.description ?? rev.version}
                  className={`shrink-0 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {rev.version}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 선택된 리비전의 상세 정보 영역 */}
      {activeRevision && (
        <div className="mt-2 flex items-start gap-3 text-xs text-gray-400">
          {activeRevision.date && (
            <span className="shrink-0 text-gray-500">
              {activeRevision.date}
            </span>
          )}
          {activeRevision.description && (
            <span className="text-gray-300">{activeRevision.description}</span>
          )}
          {activeRevision.changes && activeRevision.changes.length > 0 && (
            <span className="text-gray-500">
              — {activeRevision.changes.join(", ")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
