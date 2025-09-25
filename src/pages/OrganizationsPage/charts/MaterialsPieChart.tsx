import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={"middle"} dominantBaseline="middle">
      {`${((percent ?? 1) * 100).toFixed(0)}%`}
    </text>
  );
};

const MaterialsPieChart = ({ materialData }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={materialData} dataKey="value" nameKey="name" outerRadius={160} label={renderCustomizedLabel} labelLine={false}>
          {materialData.map((_, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, name: string) => [`${value.toFixed(2)} g`, name]} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MaterialsPieChart;
