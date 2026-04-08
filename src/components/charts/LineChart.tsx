import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts'

interface LineChartProps {
  data: { name: string; value: number }[]
  height?: number
  color?: string
  showGrid?: boolean
  yLabel?: string
}

export function LineChart({ data, height = 300, color = '#00D4FF', showGrid = true, yLabel }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLine data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#2A3F55" vertical={false} />}
        <XAxis dataKey="name" tick={{ fill: '#8BA3BE', fontSize: 12 }} axisLine={{ stroke: '#2A3F55' }} tickLine={false} />
        <YAxis tick={{ fill: '#8BA3BE', fontSize: 12 }} axisLine={false} tickLine={false} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: '#8BA3BE', fontSize: 12 } : undefined} />
        <Tooltip contentStyle={{ background: '#1E2F42', border: '1px solid #2A3F55', borderRadius: 8, color: '#F0F4F8' }} />
        <Area type="monotone" dataKey="value" stroke="none" fill="url(#lineGradient)" />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color, r: 4 }} activeDot={{ r: 6 }} />
      </RechartsLine>
    </ResponsiveContainer>
  )
}
