import { useState } from "react";

import { useAppStore } from "../store/useAppStore";

interface Props {
  baseWidth: number;
  baseHeight: number;
}

function computeCentroid(vertices: [number, number][]): [number, number] {
  const n = vertices.length;
  const cx = vertices.reduce((s, [x]) => s + x, 0) / n;
  const cy = vertices.reduce((s, [, y]) => s + y, 0) / n;
  return [cx, cy];
}

export function BuildingOverlay({ baseWidth, baseHeight }: Props) {
  const { metadata, activeDrawingId, setActiveDrawingId, expandDrawing } =
    useAppStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!metadata || baseWidth === 0) return null;

  const buildings = Object.values(metadata.drawings).filter(
    (d) =>
      d.parent === "00" &&
      d.position?.vertices &&
      d.position.vertices.length >= 3,
  );

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={baseWidth}
      height={baseHeight}
      viewBox={`0 0 ${baseWidth} ${baseHeight}`}
    >
      {buildings.map((drawing) => {
        const vertices = drawing.position!.vertices;
        const points = vertices.map(([x, y]) => `${x},${y}`).join(" ");
        const [cx, cy] = computeCentroid(vertices);
        const isActive = activeDrawingId === drawing.id;
        const isHovered = hoveredId === drawing.id;

        const fill = isActive
          ? "rgba(59,130,246,0.25)"
          : isHovered
            ? "rgba(99,102,241,0.28)"
            : "rgba(99,102,241,0.12)";
        const stroke = isActive
          ? "rgba(59,130,246,1.0)"
          : isHovered
            ? "rgba(99,102,241,0.9)"
            : "rgba(99,102,241,0.5)";
        const strokeWidth = isActive ? 3 : isHovered ? 2.5 : 2;

        return (
          <g
            key={drawing.id}
            style={{ pointerEvents: "all", cursor: "pointer" }}
            onMouseEnter={() => setHoveredId(drawing.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => {
              setActiveDrawingId(drawing.id); // 같은 영역이 자동으로 활성화
              expandDrawing(drawing.id); // 해당 트리 펼치기
            }}
          >
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={28}
              fontWeight="600"
              fill={
                isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)"
              }
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {drawing.name.split(" ")[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
