// import { useRef, useEffect } from "react";

// import { useAppStore } from "../store/useAppStore";
// import { getChildDrawings, getRootDrawings } from "../utils/metadataUtils";

// import { DisciplineSelector } from "./DisciplineSelector";
// import type { DrawingEntry, Metadata } from "../types/metadata";

// interface TreeNodeProps {
//   drawing: DrawingEntry;
//   drawings: Metadata["drawings"];
//   depth: number;
// }

// function TreeNode({ drawing, drawings, depth }: TreeNodeProps) {
//   const {
//     expandedDrawings,
//     activeDrawingId,
//     toggleDrawingExpanded,
//     setActiveDrawingId,
//   } = useAppStore();

//   const children = getChildDrawings(drawings, drawing.id);
//   const isExpanded = expandedDrawings.has(drawing.id);
//   const isActive = activeDrawingId === drawing.id;
//   const hasChildren = children.length > 0;
//   const hasDisciplines = Object.keys(drawing.disciplines ?? {}).length > 0;

//   const buttonRef = useRef<HTMLButtonElement>(null);

//   useEffect(() => {
//     if (isActive && buttonRef.current) {
//       buttonRef.current.scrollIntoView({
//         behavior: "smooth",
//         block: "nearest",
//       });
//     }
//   }, [isActive]);

//   const handleClick = () => {
//     setActiveDrawingId(drawing.id);
//     if (hasChildren || hasDisciplines) {
//       toggleDrawingExpanded(drawing.id);
//     }
//   };

//   return (
//     <div>
//       <button
//         ref={buttonRef}
//         onClick={handleClick}
//         className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
//           isActive
//             ? "bg-blue-600 text-white"
//             : "text-gray-300 hover:bg-gray-700 hover:text-white"
//         }`}
//         style={{ paddingLeft: `${12 + depth * 16}px` }}
//       >
//         {(hasChildren || hasDisciplines) && (
//           <span className="text-gray-400 w-4 shrink-0">
//             {isExpanded ? "▾" : "▸"}
//           </span>
//         )}
//         {!hasChildren && !hasDisciplines && <span className="w-4 shrink-0" />}
//         <span className="truncate">{drawing.name}</span>
//       </button>

//       {isExpanded && (
//         <>
//           {hasDisciplines && <DisciplineSelector drawing={drawing} />}
//           {children.map((child) => (
//             <TreeNode
//               key={child.id}
//               drawing={child}
//               drawings={drawings}
//               depth={depth + 1}
//             />
//           ))}
//         </>
//       )}
//     </div>
//   );
// }

// export function DrawingTree() {
//   const { metadata } = useAppStore();

//   if (!metadata) return null;

//   const roots = getRootDrawings(metadata.drawings);

//   return (
//     <div className="flex-1 overflow-y-auto">
//       <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-700">
//         도면 목록
//       </div>

//       {roots.map((drawing) => (
//         <TreeNode
//           key={drawing.id}
//           drawing={drawing}
//           drawings={metadata.drawings}
//           depth={0}
//         />
//       ))}
//     </div>
//   );
// }

import { useRef, useEffect } from "react";

import { useAppStore } from "../store/useAppStore";
import { getChildDrawings, getRootDrawings } from "../utils/metadataUtils";

import { DisciplineSelector } from "./DisciplineSelector";
import type { DrawingEntry, Metadata } from "../types/metadata";

interface TreeNodeProps {
  drawing: DrawingEntry;
  drawings: Metadata["drawings"];
  depth: number;
}

function TreeNode({ drawing, drawings, depth }: TreeNodeProps) {
  const {
    expandedDrawings,
    activeDrawingId,
    toggleDrawingExpanded,
    setActiveDrawingId,
  } = useAppStore();

  const children = getChildDrawings(drawings, drawing.id);
  const isExpanded = expandedDrawings.has(drawing.id);
  const isBaseMap = !activeDrawingId || activeDrawingId === "00";
  const isActive =
    drawing.id === "00" ? isBaseMap : activeDrawingId === drawing.id;
  const hasChildren = children.length > 0;
  const hasDisciplines = Object.keys(drawing.disciplines ?? {}).length > 0;

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isActive && buttonRef.current) {
      buttonRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isActive]);

  const handleClick = () => {
    setActiveDrawingId(drawing.id);
    if (hasChildren || hasDisciplines) {
      toggleDrawingExpanded(drawing.id);
    }
  };

  return (
    <div>
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {(hasChildren || hasDisciplines) && (
          <span className="text-gray-400 w-4 shrink-0">
            {isExpanded ? "▾" : "▸"}
          </span>
        )}
        {!hasChildren && !hasDisciplines && <span className="w-4 shrink-0" />}
        <span className="truncate">{drawing.name}</span>
      </button>

      {isExpanded && (
        <>
          {hasDisciplines && <DisciplineSelector drawing={drawing} />}
          {children.map((child) => (
            <TreeNode
              key={child.id}
              drawing={child}
              drawings={drawings}
              depth={depth + 1}
            />
          ))}
        </>
      )}
    </div>
  );
}

export function DrawingTree() {
  const { metadata } = useAppStore();

  if (!metadata) return null;

  const roots = getRootDrawings(metadata.drawings);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-700">
        도면 목록
      </div>
      {roots.map((drawing) => (
        <TreeNode
          key={drawing.id}
          drawing={drawing}
          drawings={metadata.drawings}
          depth={0}
        />
      ))}
    </div>
  );
}
