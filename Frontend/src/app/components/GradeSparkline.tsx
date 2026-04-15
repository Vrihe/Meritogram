interface GradeSparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function GradeSparkline({ data, color = "#6366f1", width = 80, height = 32 }: GradeSparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  });

  const polylinePoints = points.join(" ");

  // Area fill
  const areaPoints = `0,${height} ${polylinePoints} ${width},${height}`;

  const lastVal = data[data.length - 1];
  const secondLastVal = data[data.length - 2];
  const trend = lastVal >= secondLastVal;

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon
          points={areaPoints}
          fill={`url(#grad-${color.replace("#", "")})`}
        />
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Last dot */}
        {points.length > 0 && (
          <circle
            cx={width}
            cy={height - ((lastVal - min) / range) * height}
            r="3"
            fill={color}
          />
        )}
      </svg>
      <span
        style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          color: trend ? "#10b981" : "#f59e0b",
        }}
      >
        {trend ? "▲" : "▼"} {lastVal}%
      </span>
    </div>
  );
}
