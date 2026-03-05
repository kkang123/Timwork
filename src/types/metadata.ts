// ── Raw Metadata Types ─────────────────────────────────────────────────────

export interface ImageTransform {
  relativeTo?: string
  x: number
  y: number
  scale: number
  rotation: number
}

export interface PolygonTransform {
  x: number
  y: number
  scale: number
  rotation: number
}

export interface Polygon {
  vertices: [number, number][]
  polygonTransform: PolygonTransform
}

/** DrawingEntry.position 전용: 전체 배치도 위에서의 위치 영역 (polygonTransform 없이 imageTransform 사용) */
export interface Position {
  vertices: [number, number][]
  imageTransform: ImageTransform
}

export interface Revision {
  version: string
  image: string
  date?: string
  description?: string
  changes?: string[]
  imageTransform?: ImageTransform
  polygon?: Polygon
}

export interface Region {
  polygon: Polygon
  revisions: Revision[]
}

export interface Discipline {
  image?: string
  imageTransform?: ImageTransform
  polygon?: Polygon
  regions?: Record<string, Region>
  revisions?: Revision[]
}

export interface DrawingEntry {
  id: string
  name: string
  image: string
  parent: string | null
  position?: Position | null
  disciplines?: Record<string, Discipline>
}

export interface Metadata {
  project: {
    name: string
    unit: string
  }
  disciplines: { name: string }[]
  drawings: Record<string, DrawingEntry>
}

// ── UI Derived Types ──────────────────────────────────────────────────────

export type ViewMode = 'single' | 'compare'

export interface CompareSlot {
  id: string              // `${drawingId}__${disciplineName}__${regionId ?? 'base'}`
  drawingId: string
  disciplineName: string
  regionId: string | null
  revisionVersion: string
}
export type CompareDisplayMode = 'overlay' | 'side-by-side'

export interface ActiveSelection {
  drawingId: string
  disciplineName: string
  regionId: string | null
  revisionVersion: string
}

export interface DrawingLayerSpec {
  id: string
  imagePath: string
  imageTransform: ImageTransform | null
  polygon?: Polygon
  disciplineName: string
  revisionVersion: string
  opacity: number
  zIndex: number
}
