'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

const data = [
  { month: 'Feb', earnings: 186 },
  { month: 'Mar', earnings: 305 },
  { month: 'Apr', earnings: 237 },
  { month: 'May', earnings: 273 },
  { month: 'Jun', earnings: 209 },
  { month: 'Jul', earnings: 450 },
];

const chartConfig = {
  earnings: {
    label: 'Earnings',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function EarningsChart() {
  return (
    <div className="h-[300px]">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip 
              cursor={{ fill: 'hsl(var(--secondary))', radius: 'var(--radius)' }} 
              content={<ChartTooltipContent />} 
            />
            <Bar dataKey="earnings" fill="var(--color-earnings)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
