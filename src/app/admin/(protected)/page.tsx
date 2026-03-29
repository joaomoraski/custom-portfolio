import { GlassCard } from "@/components/ui/glass-card";
import { ViewsChart } from "@/components/admin/views-chart";
import { getPageViewStats } from "@/actions/analytics";
import { Eye, TrendingUp, Calendar, BarChart3 } from "lucide-react";

export default async function AdminDashboard() {
  const stats = await getPageViewStats().catch(() => ({
    total: 0,
    today: 0,
    week: 0,
    month: 0,
    byPage: [] as { page: string; views: number }[],
    dailyLast30: [] as { date: string; views: number }[],
  }));

  const statCards = [
    { label: "Total Views", value: stats.total, Icon: Eye, color: "text-purple-400" },
    { label: "Today", value: stats.today, Icon: TrendingUp, color: "text-cyan-400" },
    { label: "This Week", value: stats.week, Icon: Calendar, color: "text-blue-400" },
    { label: "This Month", value: stats.month, Icon: BarChart3, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold dark:text-white text-gray-900 tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ label, value, Icon, color }) => (
          <GlassCard key={label} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm dark:text-white/60 text-gray-500 font-medium">{label}</span>
              <Icon size={18} className={color} />
            </div>
            <div className={`text-4xl font-bold ${color}`}>{value.toLocaleString()}</div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-8">
        <h2 className="text-base font-semibold dark:text-white/80 text-gray-800 mb-6">Daily Views (Last 30 Days)</h2>
        <ViewsChart data={stats.dailyLast30} />
      </GlassCard>

      {stats.byPage.length > 0 && (
        <GlassCard className="p-8">
          <h2 className="text-base font-semibold dark:text-white/80 text-gray-800 mb-6">Views by Page</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-white/10 border-gray-200">
                  <th className="text-left py-3 dark:text-white/50 text-gray-500 font-medium">Page</th>
                  <th className="text-right py-3 dark:text-white/50 text-gray-500 font-medium">Views</th>
                </tr>
              </thead>
              <tbody>
                {stats.byPage.map(({ page, views }) => (
                  <tr key={page} className="border-b dark:border-white/5 border-gray-100 last:border-0">
                    <td className="py-3.5 dark:text-white/80 text-gray-700 font-mono text-xs">{page}</td>
                    <td className="py-3.5 text-right dark:text-white text-gray-900 font-medium">{views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
