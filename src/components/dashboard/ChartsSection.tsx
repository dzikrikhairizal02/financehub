'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, PieChart } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Pie, Cell, Legend, PieChart as RechartsPieChart } from 'recharts'

interface ChartData {
  month: string
  income: number
  expense: number
}

interface CategoryData {
  name: string
  value: number
  color: string
}

interface ChartsSectionProps {
  chartData: ChartData[]
  categoryData: CategoryData[]
}

export function ChartsSection({ chartData, categoryData }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Bar Chart */}
      <Card className="bg-card border hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            Income vs Expense
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] p-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--muted)/0.1)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={12} fontSize={12} />
                <YAxis tickMargin={12} fontSize={12} />
                <Tooltip />
                <Bar dataKey="income" fill="url(#incomeGradient)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="url(#expenseGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card className="bg-card border hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PieChart className="h-5 w-5" />
            Expense Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] p-4">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="55%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  cornerRadius={4}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No expense data
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

