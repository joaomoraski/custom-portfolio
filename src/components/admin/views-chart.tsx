"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DailyEntry {
  date: string;
  views: number;
}

export function ViewsChart({ data }: { data: DailyEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(10,10,10,0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.75rem",
            color: "#fff",
            fontSize: "12px",
          }}
          cursor={{ stroke: "rgba(168,85,247,0.3)", strokeWidth: 1 }}
        />
        <Line
          type="monotone"
          dataKey="views"
          stroke="rgb(168,85,247)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "rgb(168,85,247)", strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
