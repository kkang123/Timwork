import { useState, useEffect, useRef, type CSSProperties } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { useAppStore } from "../store/useAppStore";
import { useDrawingLayers } from "../hooks/useDrawingLayers";

import { DrawingLayer } from "./DrawingLayer";
import { BuildingOverlay } from "./BuildingOverlay";
import { RevisionTimeline } from "./RevisionTimeline";
import { CompareRevisionPanel } from "./CompareRevisionPanel";
import { computeRelativeTransformCSS } from "../utils/transformUtils";

const BASE_IMAGE_URL = "/data/drawings/00_전체.png";

const SLOT_COLORS = [
  { bg: "bg-blue-600", label: "text-white" },
  { bg: "bg-orange-500", label: "text-white" },
  { bg: "bg-green-600", label: "text-white" },
  { bg: "bg-purple-600", label: "text-white" },
];

export function DrawingViewer() {
  const { viewMode, compareSlots, compareDisplayMode } = useAppStore();
  const layers = useDrawingLayers();

  const [baseImageSize, setBaseImageSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const img = new Image();
    img.onload = () =>
      setBaseImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = BASE_IMAGE_URL;
  }, []);

  const isCompareActive =
    viewMode === "compare" && compareSlots.length > 0 && layers.length > 0;

  const singleLayer =
    viewMode === "single" && layers.length > 0 ? layers[0] : null;

  const containerRef = useRef<HTMLDivElement>(null);
  const fitScaleRef = useRef<number>(1);

  const handleBaseImageFit = (
    naturalWidth: number,
    naturalHeight: number,
    centerViewFn: (scale: number, duration: number) => void,
  ) => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const fitScale =
      Math.min(clientWidth / naturalWidth, clientHeight / naturalHeight) * 0.95;
    fitScaleRef.current = fitScale;
    centerViewFn(fitScale, 0);
  };

  const emptyMessage =
    viewMode === "compare"
      ? "사이드바에서 공종을 선택하세요"
      : "배치도에서 건물을 클릭하거나\n사이드바에서 공종을 선택하세요";

  const isSideBySide =
    isCompareActive &&
    compareDisplayMode === "side-by-side" &&
    compareSlots.length === 2;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-900">
      {/* Canvas area */}
      <div className="flex-1 relative overflow-hidden" ref={containerRef}>
        {/* Side-by-side mode (exactly 2 slots) */}
        {isSideBySide ? (
          <div className="flex gap-1 h-full">
            {compareSlots.slice(0, 2).map((slot, i) => {
              const layer = layers[i];
              const colors = SLOT_COLORS[i];
              return (
                <div key={slot.id} className="flex-1 relative overflow-hidden">
                  <span
                    className={`absolute top-2 left-2 z-10 ${colors.bg} text-white text-xs px-2 py-0.5 rounded pointer-events-none`}
                  >
                    {slot.revisionVersion}
                  </span>
                  <TransformWrapper
                    key={slot.id}
                    initialScale={0.15}
                    minScale={0.1}
                    maxScale={10}
                    centerOnInit
                    wheel={{ step: 0.1 }}
                  >
                    {({ centerView }) => (
                      <TransformComponent
                        wrapperStyle={{ width: "100%", height: "100%" }}
                      >
                        {layer ? (
                          <img
                            src={layer.imagePath}
                            style={{ display: "block", maxWidth: "none" }}
                            draggable={false}
                            onLoad={(e) => {
                              if (!containerRef.current) return;
                              const { naturalWidth, naturalHeight } =
                                e.currentTarget;
                              const panelWidth =
                                (containerRef.current.clientWidth - 4) / 2;
                              const panelHeight =
                                containerRef.current.clientHeight;
                              const fitScale =
                                Math.min(
                                  panelWidth / naturalWidth,
                                  panelHeight / naturalHeight,
                                ) * 0.9;
                              centerView(fitScale, 0);
                            }}
                          />
                        ) : null}
                      </TransformComponent>
                    )}
                  </TransformWrapper>
                </div>
              );
            })}
          </div>
        ) : (
          /* Overlay mode / single / basemap */
          <TransformWrapper
            key={
              isCompareActive
                ? (layers[0]?.imagePath ?? "compare")
                : (layers[0]?.imagePath ?? "basemap")
            }
            initialScale={0.15}
            minScale={0.1}
            maxScale={10}
            centerOnInit
            wheel={{ step: 0.1 }}
          >
            {({ centerView }) => (
              <>
                <TransformComponent
                  wrapperStyle={{ width: "100%", height: "100%" }}
                  contentStyle={{ position: "relative" }}
                >
                  {singleLayer ? (
                    <img
                      src={singleLayer.imagePath}
                      alt={`${singleLayer.disciplineName} ${singleLayer.revisionVersion}`}
                      style={{ display: "block", maxWidth: "none" }}
                      draggable={false}
                      onLoad={(e) => {
                        if (!containerRef.current) return;
                        const { naturalWidth, naturalHeight } = e.currentTarget;
                        const { clientWidth, clientHeight } =
                          containerRef.current;
                        const fitScale =
                          Math.min(
                            clientWidth / naturalWidth,
                            clientHeight / naturalHeight,
                          ) * 0.95;
                        fitScaleRef.current = fitScale;
                        centerView(fitScale, 0);
                      }}
                    />
                  ) : isCompareActive ? (
                    <div style={{ position: "relative" }}>
                      {layers.map((layer, i) => {
                        console.log(layer.disciplineName, layer.imageTransform);
                        const tA = layers[0]?.imageTransform;
                        const tB = layer.imageTransform;
                        const isBase = i === 0;

                        const wrapStyle: CSSProperties = isBase
                          ? { opacity: layer.opacity, zIndex: layer.zIndex }
                          : tA && tB
                            ? {
                                position: "absolute",
                                top: 0,
                                left: 0,
                                transformOrigin: "0 0",
                                transform: computeRelativeTransformCSS(tA, tB),
                                opacity: layer.opacity,
                                zIndex: layer.zIndex,
                              }
                            : {
                                position: "absolute",
                                inset: 0,
                                opacity: layer.opacity,
                                zIndex: layer.zIndex,
                              };

                        return (
                          <div key={layer.id} style={wrapStyle}>
                            <img
                              src={layer.imagePath}
                              style={{ display: "block", maxWidth: "none" }}
                              draggable={false}
                              onLoad={
                                isBase
                                  ? (e) => {
                                      const { naturalWidth, naturalHeight } =
                                        e.currentTarget;
                                      if (!containerRef.current) return;
                                      const { clientWidth, clientHeight } =
                                        containerRef.current;
                                      const fitScale =
                                        Math.min(
                                          clientWidth / naturalWidth,
                                          clientHeight / naturalHeight,
                                        ) * 0.9;
                                      fitScaleRef.current = fitScale;
                                      centerView(fitScale, 0);
                                    }
                                  : undefined
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      style={{
                        position: "relative",
                        width: baseImageSize.width || "auto",
                        height: baseImageSize.height || "auto",
                      }}
                    >
                      <img
                        src={BASE_IMAGE_URL}
                        alt="전체 배치도"
                        style={{ display: "block", maxWidth: "none" }}
                        draggable={false}
                        onLoad={(e) => {
                          const { naturalWidth, naturalHeight } =
                            e.currentTarget;
                          handleBaseImageFit(
                            naturalWidth,
                            naturalHeight,
                            centerView,
                          );
                        }}
                      />

                      {layers.map((layer) => (
                        <DrawingLayer
                          key={layer.id}
                          layer={layer}
                          containerWidth={baseImageSize.width}
                          containerHeight={baseImageSize.height}
                          isActive={true}
                        />
                      ))}

                      <BuildingOverlay
                        baseWidth={baseImageSize.width}
                        baseHeight={baseImageSize.height}
                      />
                    </div>
                  )}
                </TransformComponent>

                <button
                  onClick={() => centerView(fitScaleRef.current, 0)}
                  className="absolute top-4 right-4 z-10 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                >
                  확대/축소 초기화
                </button>
              </>
            )}
          </TransformWrapper>
        )}

        {layers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white/70 text-sm text-center bg-gray-900/70 rounded-2xl px-6 py-4 whitespace-pre-line">
              {emptyMessage}
            </p>
          </div>
        )}
      </div>

      {viewMode === "compare" && <CompareRevisionPanel />}

      <RevisionTimeline />
    </div>
  );
}
