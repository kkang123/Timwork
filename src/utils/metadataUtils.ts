import type { Discipline, DrawingEntry, ImageTransform, Metadata, Polygon, Revision } from '../types/metadata'

/** Returns the latest revision for a discipline (or region) */
export function getLatestRevision(
  discipline: Discipline,
  regionId: string | null
): Revision | null {
  if (regionId && discipline.regions) {
    const region = discipline.regions[regionId]
    if (!region) return null
    const revs = region.revisions
    return revs[revs.length - 1] ?? null
  }
  const revs = discipline.revisions
  return revs ? revs[revs.length - 1] ?? null : null
}

/** Returns a specific revision by version */
export function getRevision(
  discipline: Discipline,
  regionId: string | null,
  version: string
): Revision | null {
  let revisions: Revision[] = []

  if (regionId && discipline.regions) {
    revisions = discipline.regions[regionId]?.revisions ?? []
  } else {
    revisions = discipline.revisions ?? []
  }

  return revisions.find((r) => r.version === version) ?? null
}

/** Returns all revisions for a discipline/region */
export function getAllRevisions(discipline: Discipline, regionId: string | null): Revision[] {
  if (regionId && discipline.regions) {
    return discipline.regions[regionId]?.revisions ?? []
  }
  return discipline.revisions ?? []
}

/**
 * Effective imageTransform: revision-level takes priority over discipline-level.
 */
export function getEffectiveImageTransform(
  discipline: Discipline,
  regionId: string | null,
  revision: Revision
): ImageTransform | null {
  if (revision.imageTransform) return revision.imageTransform
  if (regionId && discipline.regions) {
    // Region-level revisions always carry their own imageTransform
    return revision.imageTransform ?? null
  }
  return discipline.imageTransform ?? null
}

/**
 * Effective polygon: revision-level takes priority over discipline-level.
 */
export function getEffectivePolygon(
  discipline: Discipline,
  regionId: string | null,
  revision: Revision
): Polygon | null {
  if (revision.polygon) return revision.polygon
  if (regionId && discipline.regions) {
    return discipline.regions[regionId]?.polygon ?? null
  }
  return discipline.polygon ?? null
}

/** Returns immediate children of a drawing */
export function getChildDrawings(
  drawings: Metadata['drawings'],
  parentId: string
): DrawingEntry[] {
  return Object.values(drawings).filter((d) => d.parent === parentId)
}

/** Returns root drawings (no parent) */
export function getRootDrawings(drawings: Metadata['drawings']): DrawingEntry[] {
  return Object.values(drawings).filter((d) => d.parent === null)
}

/** Returns the discipline names for a drawing */
export function getDrawingDisciplines(drawing: DrawingEntry): string[] {
  return Object.keys(drawing.disciplines ?? {})
}
