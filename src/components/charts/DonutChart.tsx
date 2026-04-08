import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface DonutChartProps {
  data: { name: string; value: number; color: string }[]
  height?: number
}

export function DonutChart({ data, height = 300 }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          dataKey="value"
          paddingAngle={2}
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: '#1E2F42', border: '1px solid #2A3F55', borderRadius: 8, color: '#F0F4F8' }} />
        <Legend formatter={(value) => <span style={{ color: '#F0F4F8', fontSize: 13 }}>{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}
