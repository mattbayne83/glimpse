import type { DatasetOverview } from '../types/analysis';

interface DataBlock3DProps {
  overview: DatasetOverview;
}

export function DataBlock3D({ overview }: DataBlock3DProps) {
  const { rows, columns, columnTypes } = overview;

  // Scale dimensions for visual appeal
  const baseWidth = 160;
  const baseHeight = 100;

  // Calculate proportions
  const totalCols = columnTypes.numeric + columnTypes.categorical + columnTypes.datetime;
  const numericPct = totalCols > 0 ? columnTypes.numeric / totalCols : 0;
  const categoricalPct = totalCols > 0 ? columnTypes.categorical / totalCols : 0;
  const datetimePct = totalCols > 0 ? columnTypes.datetime / totalCols : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Dataset Shape</h3>

      <div className="flex items-center justify-center" style={{ height: 180 }}>
        <svg width="220" height="160" viewBox="0 0 220 160">
          {/* Define gradients for depth */}
          <defs>
            <linearGradient id="numericGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="categoricalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="100%" stopColor="#059669" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="datetimeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Isometric block */}
          <g transform="translate(110, 80)">
            {/* Top face (segmented by type) */}
            <g>
              {/* Numeric section */}
              {numericPct > 0 && (
                <path
                  d={`
                    M ${-baseWidth / 2} ${-baseHeight}
                    L ${-baseWidth / 2 + baseWidth * numericPct} ${-baseHeight}
                    L ${-baseWidth / 2 + baseWidth * numericPct + 40} ${-baseHeight - 23}
                    L ${-baseWidth / 2 + 40} ${-baseHeight - 23}
                    Z
                  `}
                  fill="url(#numericGrad)"
                  stroke="#1e40af"
                  strokeWidth="1"
                />
              )}

              {/* Categorical section */}
              {categoricalPct > 0 && (
                <path
                  d={`
                    M ${-baseWidth / 2 + baseWidth * numericPct} ${-baseHeight}
                    L ${-baseWidth / 2 + baseWidth * (numericPct + categoricalPct)} ${-baseHeight}
                    L ${-baseWidth / 2 + baseWidth * (numericPct + categoricalPct) + 40} ${-baseHeight - 23}
                    L ${-baseWidth / 2 + baseWidth * numericPct + 40} ${-baseHeight - 23}
                    Z
                  `}
                  fill="url(#categoricalGrad)"
                  stroke="#047857"
                  strokeWidth="1"
                />
              )}

              {/* DateTime section */}
              {datetimePct > 0 && (
                <path
                  d={`
                    M ${-baseWidth / 2 + baseWidth * (numericPct + categoricalPct)} ${-baseHeight}
                    L ${baseWidth / 2} ${-baseHeight}
                    L ${baseWidth / 2 + 40} ${-baseHeight - 23}
                    L ${-baseWidth / 2 + baseWidth * (numericPct + categoricalPct) + 40} ${-baseHeight - 23}
                    Z
                  `}
                  fill="url(#datetimeGrad)"
                  stroke="#6d28d9"
                  strokeWidth="1"
                />
              )}
            </g>

            {/* Right face */}
            <path
              d={`
                M ${baseWidth / 2} ${-baseHeight}
                L ${baseWidth / 2} ${0}
                L ${baseWidth / 2 + 40} ${-23}
                L ${baseWidth / 2 + 40} ${-baseHeight - 23}
                Z
              `}
              fill="#94a3b8"
              stroke="#64748b"
              strokeWidth="1"
              opacity="0.7"
            />

            {/* Front face */}
            <path
              d={`
                M ${-baseWidth / 2} ${-baseHeight}
                L ${baseWidth / 2} ${-baseHeight}
                L ${baseWidth / 2} ${0}
                L ${-baseWidth / 2} ${0}
                Z
              `}
              fill="#cbd5e1"
              stroke="#94a3b8"
              strokeWidth="1"
              opacity="0.8"
            />

            {/* Labels */}
            <text
              x={0}
              y={15}
              textAnchor="middle"
              className="text-xs font-medium fill-gray-700"
            >
              {rows.toLocaleString()} rows
            </text>
            <text
              x={baseWidth / 2 + 50}
              y={-10}
              textAnchor="middle"
              className="text-xs font-medium fill-gray-700"
            >
              {columns} cols
            </text>
          </g>
        </svg>
      </div>

      {/* Stats below */}
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-gray-600">
            {columnTypes.numeric} Numeric ({((numericPct * 100).toFixed(0))}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-gray-600">
            {columnTypes.categorical} Categorical ({((categoricalPct * 100).toFixed(0))}%)
          </span>
        </div>
        {columnTypes.datetime > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span className="text-gray-600">
              {columnTypes.datetime} DateTime ({((datetimePct * 100).toFixed(0))}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
