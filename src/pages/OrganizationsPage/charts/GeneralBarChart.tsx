import React from "react";
import { Bar, BarChart, Brush, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { date, received, sent } = payload[0].payload;

    return (
      <div className="bg-white p-2 shadow rounded text-sm">
        <p className="font-semibold">Date: {date.split("T")[0]}</p>
        <p className="text-[#22c55e]">Received: {received ?? 0} g</p>
        <p className="text-[#ef4444]">Sent: {sent ?? 0} g</p>
      </div>
    );
  }
  return null;
};

const GeneralBarChart = ({ t, generalData }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={generalData}>
        <XAxis dataKey="name" hide />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="received" fill="#22c55e" name={t("charts.received")} />
        <Bar dataKey="sent" fill="#ef4444" name={t("charts.sent")} />
        <Brush height={30} stroke="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GeneralBarChart;
