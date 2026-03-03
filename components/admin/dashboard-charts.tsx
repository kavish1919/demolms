'use client';

import React from "react"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/mock-data';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <div className={`glass-card card-3d rounded-xl p-6 ${className || ''}`}>
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

interface RevenueChartProps {
  data: { date: string; amount: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }));

  return (
    <ChartCard title="Revenue Trend">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.8 0.01 250)" />
            <XAxis 
              dataKey="date" 
              stroke="oklch(0.5 0.02 250)"
              fontSize={12}
            />
            <YAxis 
              stroke="oklch(0.5 0.02 250)"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.98 0.005 250)',
                border: '1px solid oklch(0.9 0.01 250)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="oklch(0.55 0.18 250)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

interface EnrollmentChartProps {
  data: { date: string; count: number }[];
}

export function EnrollmentChart({ data }: EnrollmentChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }));

  return (
    <ChartCard title="Enrollment Trend">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.8 0.01 250)" />
            <XAxis 
              dataKey="date" 
              stroke="oklch(0.5 0.02 250)"
              fontSize={12}
            />
            <YAxis 
              stroke="oklch(0.5 0.02 250)"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.98 0.005 250)',
                border: '1px solid oklch(0.9 0.01 250)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number) => [value, 'Enrollments']}
            />
            <Bar
              dataKey="count"
              fill="oklch(0.65 0.15 200)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

interface CourseDistributionProps {
  data: { name: string; value: number; color: string }[];
}

export function CourseDistribution({ data }: CourseDistributionProps) {
  return (
    <ChartCard title="Course Distribution">
      <div className="h-[300px] flex items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.98 0.005 250)',
                border: '1px solid oklch(0.9 0.01 250)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2 min-w-[140px]">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
              <span className="text-sm font-medium ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
