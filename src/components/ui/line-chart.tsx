import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { WeeklyPerformance } from "../../types/marketing"

type Props = {
  data: WeeklyPerformance[];
};


const formatWeekLabel = (week_start: string, week_end: string) => {
  const start = new Date(week_start);
  const end = new Date(week_end);
  return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
};


export const RevenueSpendLineChart: React.FC<Props> = ({ data }) => {
  // Prepare chart data with formatted week labels
  const chartData = data.map((item) => ({
    week: formatWeekLabel(item.week_start, item.week_end),
    revenue: item.revenue,
    spend: item.spend,
  }));

 

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 24, right: 32, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#4F46E5" name="Revenue" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="spend" stroke="#F59E42" name="Spend" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueSpendLineChart;
