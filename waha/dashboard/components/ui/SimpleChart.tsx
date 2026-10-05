"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AreaChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  className?: string;
}

export function AreaChart({
  data,
  height = 140,
  color = "#6366f1",
  className,
}: AreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const padding = 20;
  const width = 500;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * graphWidth;
    const y = height - padding - (d.value / maxValue) * graphHeight;
    return { x, y, d };
  });

  const pathD = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${
    height - padding
  } L ${points[0].x} ${height - padding} Z`;

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = height - padding - ratio * graphHeight;
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800/60"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Filled Area */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover Points */}
        {points.map((pt, i) => (
          <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === i ? "6" : "4"}
              fill={color}
              className="transition-all cursor-pointer stroke-white dark:stroke-slate-900"
              strokeWidth="2"
            />
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredIdx !== null && (
        <div
          className="absolute z-10 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-xl pointer-events-none border border-slate-700"
          style={{
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100 - 35}%`,
            transform: "translateX(-50%)",
          }}
        >
          {data[hoveredIdx].label}: {data[hoveredIdx].value}
        </div>
      )}
    </div>
  );
}

interface DonutChartProps {
  data: DataPoint[];
  size?: number;
  centerText?: string;
  centerSubtext?: string;
}

export function DonutChart({
  data,
  size = 160,
  centerText,
  centerSubtext,
}: DonutChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  if (total === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-full border-4 border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-medium"
        style={{ width: size, height: size }}
      >
        <span>No Data</span>
      </div>
    );
  }

  let accumulatedPercent = 0;

  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((item, idx) => {
          const percent = item.value / total;
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = -accumulatedPercent * circumference;
          accumulatedPercent += percent;

          return (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={item.color || "#6366f1"}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out hover:opacity-80 cursor-pointer"
            />
          );
        })}
      </svg>
      {(centerText || centerSubtext) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerText && (
            <span className="text-xl font-bold text-slate-900 dark:text-slate-50">
              {centerText}
            </span>
          )}
          {centerSubtext && (
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {centerSubtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
