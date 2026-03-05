import type { DrawingLayerSpec } from '../types/metadata'
import { imageTransformToStyle } from '../utils/transformUtils'
import { PolygonOverlay } from './PolygonOverlay'

interface Props {
  layer: DrawingLayerSpec
  containerWidth: number
  containerHeight: number
  isActive?: boolean
}

export function DrawingLayer({ layer, containerWidth, containerHeight, isActive }: Props) {
  const style = layer.imageTransform
    ? {
        ...imageTransformToStyle(layer.imageTransform),
        opacity: layer.opacity,
        zIndex: layer.zIndex,
      }
    : {
        position: 'absolute' as const,
        inset: 0,
        opacity: layer.opacity,
        zIndex: layer.zIndex,
      }

  return (
    <div style={style}>
      <img
        src={layer.imagePath}
        alt={`${layer.disciplineName} ${layer.revisionVersion}`}
        style={{ display: 'block', maxWidth: 'none' }}
        draggable={false}
      />
      {layer.polygon && isActive && (
        <PolygonOverlay
          polygon={layer.polygon}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
        />
      )}
    </div>
  )
}
