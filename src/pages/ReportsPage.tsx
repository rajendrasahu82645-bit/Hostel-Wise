import React from "react";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  IndianRupee,
  TrendingUp,
  Users,
  CalendarCheck2,
} from "lucide-react";

const reportStats = [
  { title: "Student & Room Reports", value: "1,284", change: "+8.4%", icon: Users },
  { title: "Fee Collection", value: "₹9.6L", change: "+12.1%", icon: IndianRupee },
  { title: "Attendance", value: "94.8%", change: "+2.3%", icon: CalendarCheck2 },
  { title: "Occupancy", value: "86%", change: "+1.7%", icon: TrendingUp },
];

const reportGroups = [
  {
    title: "Student & room reports",
    description: "Monitor resident count, room allocation, occupancy, and room utilization across hostels.",
    accent: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  {
    title: "Fee collection reports",
    description: "Track monthly dues, outstanding balances, and payment trends by resident and hostel.",
    accent: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    title: "Attendance reports",
    description: "Review daily, weekly, and monthly attendance performance with absentee tracking.",
    accent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    title: "Export reports to PDF or Excel",
    description: "Download structured summaries in PDF or Excel for internal reviews and audits.",
    accent: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
];

const ReportsPage = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-indigo-400">Insights</p>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-2">Reports &amp; Analytics</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-2xl border border-[#222] bg-[#161616] px-4 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-indigo-500/30 hover:text-white">
            <Download size={16} />
            Export PDF
          </button>
          <button className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-500">
            <FileSpreadsheet size={16} />
            Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {reportStats.map(({ title, value, change, icon: Icon }) => (
          <div key={title} className="rounded-3xl border border-[#222] bg-[#161616] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-400">
                <Icon size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{change}</span>
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-500">{title}</p>
              <h3 className="mt-3 text-3xl font-bold text-white tracking-tight">{value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {reportGroups.map(({ title, description, accent }) => (
          <div key={title} className="rounded-3xl border border-[#222] bg-[#161616] p-6">
            <div className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${accent}`}>
              <BarChart3 size={12} className="mr-2" />
              Report
            </div>
            <h3 className="mt-5 text-xl font-bold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">{description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[#222] bg-[#161616] p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Summary</p>
            <h3 className="mt-2 text-xl font-bold text-white">Monthly hostel performance</h3>
          </div>
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
            Updated today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-[#222] bg-[#111] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Resident activity</p>
            <p className="mt-3 text-3xl font-bold text-white">1,048</p>
          </div>
          <div className="rounded-2xl border border-[#222] bg-[#111] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Outstanding fees</p>
            <p className="mt-3 text-3xl font-bold text-white">₹2.4L</p>
          </div>
          <div className="rounded-2xl border border-[#222] bg-[#111] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Approval rate</p>
            <p className="mt-3 text-3xl font-bold text-white">96.2%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
