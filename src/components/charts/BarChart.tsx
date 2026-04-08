import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface BarChartProps {
  data: { name: string; value: number }[]
  height?: number
  color?: string
  yLabel?: string
}

export function BarChart({ data, height = 300, color = '#00D4FF', yLabel }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBar data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A3F55" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#8BA3BE', fontSize: 12 }} axisLine={{ stroke: '#2A3F55' }} tickLine={false} />
        <YAxis tick={{ fill: '#8BA3BE', fontSize: 12 }} axisLine={false} tickLine={false} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: '#8BA3BE', fontSize: 12 } : undefined} />
        <Tooltip contentStyle={{ background: '#1E2F42', border: '1px solid #2A3F55', borderRadius: 8, color: '#F0F4F8' }} cursor={{ fill: 'rgba(0,212,255,0.05)' }} />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </RechartsBar>
    </ResponsiveContainer>
  )
}
