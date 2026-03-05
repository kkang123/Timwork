import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { DrawingLayerSpec, ActiveSelection, ImageTransform } from '../types/metadata'
import { getRevision, getEffectiveImageTransform, getEffectivePolygon } from '../utils/metadataUtils'

function buildLayerSpec(
  selection: ActiveSelection,
  metadata: NonNullable<ReturnType<typeof useAppStore.getState>['metadata']>,
  zIndex: number,
  opacity: number,
  layerOpacities: Record<string, number>
): DrawingLayerSpec | null {
  const drawing = metadata.drawings[selection.drawingId]
  if (!drawing) return null

  const discipline = drawing.disciplines?.[selection.disciplineName]
  if (!discipline) return null

  const revision = getRevision(discipline, selection.regionId, selection.revisionVersion)
  if (!revision) return null

  const id = `${selection.drawingId}__${selection.disciplineName}__${selection.regionId ?? 'base'}__${selection.revisionVersion}`
  const storedOpacity = layerOpacities[id]
  const finalOpacity = storedOpacity !== undefined ? storedOpacity : opacity

  const imageTransform: ImageTransform | null = getEffectiveImageTransform(
    discipline,
    selection.regionId,
    revision
  )
  const polygon = getEffectivePolygon(discipline, selection.regionId, revision)

  return {
    id,
    imagePath: `/data/drawings/${revision.image}`,
    imageTransform,
    polygon: polygon ?? undefined,
    disciplineName: selection.disciplineName,
    revisionVersion: selection.revisionVersion,
    opacity: finalOpacity,
    zIndex,
  }
}

export function useDrawingLayers(): DrawingLayerSpec[] {
  const {
    metadata,
    viewMode,
    primarySelection,
    compareSlots,
    layerOpacities,
  } = useAppStore()

  return useMemo(() => {
    if (!metadata) return []

    const layers: DrawingLayerSpec[] = []

    if (viewMode === 'single' && primarySelection) {
      const layer = buildLayerSpec(primarySelection, metadata, 1, 1, layerOpacities)
      if (layer) layers.push(layer)
    } else if (viewMode === 'compare') {
      for (let i = 0; i < compareSlots.length; i++) {
        const slot = compareSlots[i]
        const sel: ActiveSelection = {
          drawingId: slot.drawingId,
          disciplineName: slot.disciplineName,
          regionId: slot.regionId,
          revisionVersion: slot.revisionVersion,
        }
        const layer = buildLayerSpec(sel, metadata, i + 1, 0.8, layerOpacities)
        if (layer) layers.push(layer)
      }
    }

    return layers
  }, [metadata, viewMode, primarySelection, compareSlots, layerOpacities])
}
