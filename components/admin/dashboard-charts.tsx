'use client';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';

export function DashboardCharts({ data, ordersLabel = 'ORDERS (30D)', revenueLabel = 'REVENUE (30D)' }: { data: any[]; ordersLabel?: string; revenueLabel?: string }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="glass p-6">
        <h3 className="text-xs tracking-cinematic text-muted mb-4">— {revenueLabel}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#8A8A8F" fontSize={10} />
            <YAxis stroke="#8A8A8F" fontSize={10} />
            <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', fontSize: 12 }} />
            <Line type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="glass p-6">
        <h3 className="text-xs tracking-cinematic text-muted mb-4">— {ordersLabel}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#8A8A8F" fontSize={10} />
            <YAxis stroke="#8A8A8F" fontSize={10} />
            <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', fontSize: 12 }} />
            <Bar dataKey="orders" fill="#C0C0C8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
