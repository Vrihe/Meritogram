interface GPACircleProps {
  gpa: number;
  maxGpa?: number;
}

export function GPACircle({ gpa, maxGpa = 4.0 }: GPACircleProps) {
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = gpa / maxGpa;
  const offset = circumference - progress * circumference;

  const getColor = (g: number) => {
    if (g >= 3.7) return "#6366f1"; // indigo
    if (g >= 3.3) return "#8b5cf6"; // violet
    if (g >= 3.0) return "#06b6d4"; // cyan
    return "#f59e0b"; // amber
  };

  const color = getColor(gpa);
  const letter = gpa >= 3.7 ? "A" : gpa >= 3.3 ? "A-" : gpa >= 3.0 ? "B+" : "B";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{ fontSize: "2rem", fontWeight: 800, color, lineHeight: "1" }}>
          {gpa.toFixed(1)}
        </span>
        <span className="text-slate-500 text-xs mt-1" style={{ fontWeight: 500 }}>
          GPA · {letter}
        </span>
      </div>
    </div>
  );
}
