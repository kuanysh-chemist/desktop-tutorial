import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts'
import { formatRu } from '../../lib/dates'
import { SECTION } from '../../lib/theme'

// Горизонтальная столбчатая диаграмма распределения по статусам.
export function DistributionBarChart({ data, height = 34 * 4 + 20 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 12, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fontSize: 13 }} allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 13 }} />
        <Tooltip />
        <Bar dataKey="value" radius={[0, 3, 3, 0]}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Линейный график динамики % по неделям.
export function WeeklyLineChart({ data, color = SECTION.report.accent, label = '%' }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ left: -10, right: 16, top: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="week" tickFormatter={formatRu} tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
        <Tooltip labelFormatter={formatRu} formatter={(v) => [`${v ?? 0}%`, label]} />
        <Line type="monotone" dataKey="rate" stroke={color} strokeWidth={2} dot={{ r: 2.5 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Столбчатый график доли по каждому уроку (даты по оси X).
export function LessonBarChart({ data, color = SECTION.report.accent, label = '%' }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ left: -10, right: 16, top: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tickFormatter={formatRu} tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
        <Tooltip labelFormatter={formatRu} formatter={(v) => [`${v ?? 0}%`, label]} />
        <Bar dataKey="rate" fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
