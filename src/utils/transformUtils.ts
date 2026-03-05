import type React from 'react'
import type { ImageTransform } from '../types/metadata'

/**
 * Converts an ImageTransform into CSS transform string.
 *
 * The imageTransform describes how a child drawing is positioned relative to
 * a "reference" image coordinate system:
 *   - x, y: translation in the reference image's pixel space
 *   - scale: scale factor relative to the reference
 *   - rotation: rotation in radians
 */
export function imageTransformToCSS(transform: ImageTransform): string {
  const { x, y, scale, rotation } = transform
  const rotationDeg = (rotation * 180) / Math.PI
  return `translate(${x}px, ${y}px) rotate(${rotationDeg}deg) scale(${scale})`
}

/**
 * Converts an ImageTransform into a CSS style object suitable for absolute
 * positioning within a container sized to the base (reference) image.
 */
export function imageTransformToStyle(transform: ImageTransform): React.CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    transformOrigin: '0 0',
    transform: imageTransformToCSS(transform),
  }
}

/**
 * Layer A를 기준 좌표계에서 기준(no-transform)으로 렌더링할 때,
 * Layer B가 A와 픽셀 단위로 정렬되도록 하는 CSS transform 문자열 반환.
 * transformOrigin: '0 0' 으로 적용해야 함.
 */
export function computeRelativeTransformCSS(
  tA: ImageTransform,
  tB: ImageTransform,
): string {
  const dx = tB.x - tA.x
  const dy = tB.y - tA.y

  const cosA = Math.cos(tA.rotation)
  const sinA = Math.sin(tA.rotation)

  const tx = ( cosA * dx + sinA * dy) / tA.scale
  const ty = (-sinA * dx + cosA * dy) / tA.scale

  const relScale  = tB.scale / tA.scale
  const relRotDeg = ((tB.rotation - tA.rotation) * 180) / Math.PI

  return `translate(${tx}px, ${ty}px) rotate(${relRotDeg}deg) scale(${relScale})`
}
