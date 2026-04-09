import { LineChart as RechartsLine, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from 'recharts'

interface LineChartProps {
  data: { name: string; value: number }[]
  height?: number
  color?: string
  showGrid?: boolean
  yLabel?: string
}

export function LineChart({ data, height = 300, color = '#00D4FF', showGrid = false, yLabel }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLine data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.34} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showGrid ? null : null}
        <XAxis dataKey="name" tick={{ fill: '#8BA3BE', fontSize: 12 }} axisLine={false} tickLine={false} dy={8} />
        <YAxis tick={{ fill: '#8BA3BE', fontSize: 12 }} axisLine={false} tickLine={false} width={36} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: '#8BA3BE', fontSize: 12 } : undefined} />
        <Tooltip
          cursor={{ stroke: 'rgba(0, 212, 255, 0.16)', strokeWidth: 1 }}
          contentStyle={{
            background: 'rgba(9, 17, 30, 0.92)',
            border: '1px solid rgba(0, 212, 255, 0.18)',
            borderRadius: 16,
            color: '#F0F4F8',
            boxShadow: '0 18px 60px rgba(0, 0, 0, 0.32)',
          }}
          labelStyle={{ color: '#93a9c3' }}
          itemStyle={{ color }}
        />
        <Area type="monotone" dataKey="value" stroke="none" fill="url(#lineGradient)" />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ fill: color, r: 4, stroke: '#09111e', strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#09111e', strokeWidth: 2 }} />
      </RechartsLine>
    </ResponsiveContainer>
  )
}
