import { useState, useRef, useEffect } from 'react';
import type { ColumnAnalysis } from '../types/analysis';

interface DataCube3DProps {
  columns: ColumnAnalysis[];
  totalRows: number;
}

const TYPE_COLORS = {
  numeric: '#3b82f6',
  categorical: '#10b981',
  datetime: '#8b5cf6',
};

export function DataCube3D({ columns, totalRows }: DataCube3DProps) {
  const [rotation, setRotation] = useState({ x: 20, y: 45 });
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Scale down for visualization (max 12 columns × 10 rows visible)
  const maxVisibleCols = 12;
  const maxVisibleRows = 10;
  const displayCols = Math.min(columns.length, maxVisibleCols);
  const displayRows = Math.min(totalRows, maxVisibleRows);
  const rowScale = totalRows / displayRows;

  // Auto-rotate when not dragging
  useEffect(() => {
    if (!autoRotate || isDragging) return;

    const interval = setInterval(() => {
      setRotation((prev) => ({ x: prev.x, y: (prev.y + 0.5) % 360 }));
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    setRotation((prev) => ({
      x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5)),
      y: prev.y + deltaX * 0.5,
    }));

    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Cell dimensions
  const cellSize = 16;
  const gap = 0.5;
  const cubeWidth = displayCols * cellSize + (displayCols - 1) * gap;
  const cubeHeight = displayRows * cellSize + (displayRows - 1) * gap;
  const cubeDepth = 30;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Interactive Data Cube</h3>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          {autoRotate ? '⏸ Pause' : '▶ Rotate'}
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative flex items-center justify-center select-none"
        style={{ height: 240, perspective: '1000px', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isDragging ? 'none' : 'transform 0.05s linear',
            width: cubeWidth,
            height: cubeHeight,
          }}
        >
          {/* Front face - colored cells by column type */}
          <div
            className="absolute"
            style={{
              width: cubeWidth,
              height: cubeHeight,
              transform: `translateZ(${cubeDepth / 2}px)`,
              display: 'grid',
              gridTemplateColumns: `repeat(${displayCols}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${displayRows}, ${cellSize}px)`,
              gap: `${gap}px`,
            }}
          >
            {Array.from({ length: displayRows }).map((_, rowIdx) =>
              columns.slice(0, displayCols).map((col, colIdx) => {
                const color = TYPE_COLORS[col.analysis.type];
                const opacity = 0.9;

                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className="rounded-sm border border-white/20"
                    style={{
                      backgroundColor: color,
                      opacity,
                    }}
                    title={`Row ${Math.floor(rowIdx * rowScale + 1)}, ${col.name}`}
                  />
                );
              })
            )}
          </div>

          {/* Back face */}
          <div
            className="absolute bg-gray-200 border border-gray-300"
            style={{
              width: cubeWidth,
              height: cubeHeight,
              transform: `translateZ(-${cubeDepth / 2}px) rotateY(180deg)`,
            }}
          />

          {/* Top face */}
          <div
            className="absolute"
            style={{
              width: cubeWidth,
              height: cubeDepth,
              transform: `rotateX(90deg) translateZ(${cubeHeight / 2}px)`,
              display: 'grid',
              gridTemplateColumns: `repeat(${displayCols}, ${cellSize}px)`,
              gap: `${gap}px`,
            }}
          >
            {columns.slice(0, displayCols).map((col, idx) => (
              <div
                key={idx}
                className="rounded-sm border border-white/20"
                style={{
                  backgroundColor: TYPE_COLORS[col.analysis.type],
                  opacity: 0.8,
                }}
              />
            ))}
          </div>

          {/* Bottom face */}
          <div
            className="absolute bg-gray-300"
            style={{
              width: cubeWidth,
              height: cubeDepth,
              transform: `rotateX(-90deg) translateZ(${cubeHeight / 2}px)`,
            }}
          />

          {/* Left face */}
          <div
            className="absolute bg-gray-200 border border-gray-300"
            style={{
              width: cubeDepth,
              height: cubeHeight,
              transform: `rotateY(-90deg) translateZ(${cubeWidth / 2}px)`,
            }}
          />

          {/* Right face */}
          <div
            className="absolute bg-gray-200 border border-gray-300"
            style={{
              width: cubeDepth,
              height: cubeHeight,
              transform: `rotateY(90deg) translateZ(${cubeWidth / 2}px)`,
            }}
          />
        </div>
      </div>

      {/* Info text */}
      <div className="mt-3 text-xs text-gray-600 space-y-1">
        <p>
          <span className="font-medium">Showing:</span> {displayCols} columns × {displayRows} rows
          {(columns.length > maxVisibleCols || totalRows > maxVisibleRows) && (
            <span className="text-gray-500">
              {' '}
              (scaled from {columns.length} × {totalRows.toLocaleString()})
            </span>
          )}
        </p>
        <p className="text-gray-500 italic">Drag to rotate • Each cell = data point</p>
      </div>

      {/* Legend */}
      <div className="mt-3 flex gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: TYPE_COLORS.numeric }} />
          <span className="text-gray-600">Numeric</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: TYPE_COLORS.categorical }}
          />
          <span className="text-gray-600">Categorical</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: TYPE_COLORS.datetime }} />
          <span className="text-gray-600">DateTime</span>
        </div>
      </div>
    </div>
  );
}
