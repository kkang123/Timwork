import type { Polygon } from '../types/metadata'

interface Props {
  polygon: Polygon
  /** Width of the reference image (container) in pixels */
  containerWidth: number
  containerHeight: number
  color?: string
}

export function PolygonOverlay({ polygon, containerWidth, containerHeight, color = 'rgba(59,130,246,0.25)' }: Props) {
  const { vertices, polygonTransform } = polygon
  if (!vertices || vertices.length < 3) return null

  // Apply the polygon's own transform to each vertex
  const { x: tx, y: ty, scale, rotation } = polygonTransform
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)

  const transformed = vertices.map(([px, py]) => {
    // Rotate then scale then translate
    const rx = px * cos - py * sin
    const ry = px * sin + py * cos
    return [rx * scale + tx, ry * scale + ty] as [number, number]
  })

  const points = transformed.map(([px, py]) => `${px},${py}`).join(' ')

  // Compute bounding box of transformed vertices to set SVG viewBox
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={containerWidth}
      height={containerHeight}
      viewBox={`0 0 ${containerWidth} ${containerHeight}`}
      style={{ overflow: 'visible' }}
    >
      <polygon
        points={points}
        fill={color}
        stroke="rgba(59,130,246,0.8)"
        strokeWidth={2}
      />
    </svg>
  )
}
