interface HeatMapDataPoint {
  id: string;
  label: string;
  value: number;
  intensity: number; // 0-1 scale for color intensity
  metadata?: Record<string, any>;
}

interface HeatMapProps {
  title: string;
  data: HeatMapDataPoint[];
  className?: string;
  width?: number;
  height?: number;
  cellSize?: number;
  showLabels?: boolean;
  formatValue?: (value: number) => string;
  onCellClick?: (dataPoint: HeatMapDataPoint) => void;
}

export function HeatMap({ 
  title, 
  data, 
  className = "", 
  width = 800,
  height = 400,
  cellSize = 80,
  showLabels = true,
  formatValue = (value) => value.toLocaleString(),
  onCellClick
}: HeatMapProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(data.length));
  const rows = Math.ceil(data.length / cols);

  // Color intensity function
  const getHeatColor = (intensity: number) => {
    // Create a gradient from blue (low) to red (high)
    const hue = (1 - intensity) * 240; // 240 = blue, 0 = red
    const saturation = 70 + (intensity * 30); // 70-100%
    const lightness = 40 + (intensity * 20); // 40-60%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      <div className="flex flex-col items-center">
        {/* Heat Map Grid */}
        <div 
          className="grid gap-2 mb-4"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`
          }}
        >
          {data.map((item, index) => (
            <div
              key={item.id}
              className="relative rounded-lg border border-gray-600 cursor-pointer transition-all duration-200 hover:scale-105 hover:border-white group"
              style={{
                backgroundColor: getHeatColor(item.intensity),
                width: `${cellSize}px`,
                height: `${cellSize}px`
              }}
              onClick={() => onCellClick?.(item)}
            >
              {/* Cell Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                {showLabels && (
                  <div className="text-xs font-medium text-white mb-1 truncate w-full">
                    {item.label}
                  </div>
                )}
                <div className="text-sm font-bold text-white">
                  {formatValue(item.value)}
                </div>
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                <div className="font-semibold">{item.label}</div>
                <div>Value: {formatValue(item.value)}</div>
                <div>Intensity: {(item.intensity * 100).toFixed(1)}%</div>
                {item.metadata && Object.entries(item.metadata).map(([key, value]) => (
                  <div key={key}>{key}: {typeof value === 'number' ? formatValue(value) : value}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <span>Low</span>
          <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getHeatColor(i / 9) }}
              />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
