import { useAppStore } from '../store/useAppStore'

export function ContextBar() {
  const { metadata, primarySelection, viewMode, activeDrawingId } = useAppStore()

  const parts: string[] = []

  if (metadata) {
    parts.push(metadata.project.name)
  }

  if (activeDrawingId && metadata) {
    const drawing = metadata.drawings[activeDrawingId]
    if (drawing) parts.push(drawing.name)
  }

  if (viewMode === 'single' && primarySelection) {
    parts.push(primarySelection.disciplineName)
    if (primarySelection.regionId) parts.push(`구역 ${primarySelection.regionId}`)
    parts.push(primarySelection.revisionVersion)
  }

  return (
    <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-1 text-sm text-gray-300 shrink-0">
      {parts.length === 0 ? (
        <span className="text-gray-500">도면을 선택하세요</span>
      ) : (
        parts.map((part, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-600">›</span>}
            <span className={i === parts.length - 1 ? 'text-white font-medium' : ''}>
              {part}
            </span>
          </span>
        ))
      )}
    </div>
  )
}
