import React, { useEffect, useState } from "react";
import { 
  Users, 
  DoorOpen, 
  CalendarCheck, 
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Clock,
  ExternalLink
} from "lucide-react";
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

const SummaryCard = ({ title, value, subValue, icon: Icon, color }: any) => (
  <div className="bg-[#161616] p-6 rounded-2xl border border-[#222222] shadow-sm hover:border-indigo-500/30 transition-all duration-300">
    <div className="flex items-center gap-4 mb-4">
      <div className={cn("p-2.5 rounded-xl bg-opacity-10", color)}>
        <Icon size={20} className={cn("bg-opacity-100", color.replace('bg-', 'text-'))} />
      </div>
      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{title}</h4>
    </div>
    <div className="flex items-baseline gap-2">
      <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      {subValue && <span className="text-xs font-bold text-gray-600 tracking-widest">/ {subValue}</span>}
    </div>
  </div>
);

const WardenDashboard = () => {
  const { userData, role } = useAuth();
  const [stats, setStats] = useState({
    residents: 0,
    attendanceToday: 0,
    openComplaints: 0,
    availableRooms: 0,
  });

  useEffect(() => {
    // In a real app, filter by userData.hostelId
    setStats({
      residents: 42,
      attendanceToday: 38,
      openComplaints: 5,
      availableRooms: 8,
    });
  }, [userData]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-display">Warden Command</h1>
          <p className="text-gray-500 mt-1">Operational nodes for <span className="text-indigo-400 font-bold">{userData?.hostelName || "Unit Alpha"}</span>.</p>
        </div>
        <div className="flex bg-[#161616] p-1 rounded-xl border border-[#222]">
          <button className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20">Active</button>
          <button className="px-4 py-1.5 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">History</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Live Residents" value={stats.residents} icon={Users} color="bg-indigo-500" />
        <SummaryCard title="Attendance" value={stats.attendanceToday} subValue={stats.residents} icon={CalendarCheck} color="bg-blue-500" />
        <SummaryCard title="System Alerts" value={stats.openComplaints} icon={MessageSquare} color="bg-rose-500" />
        <SummaryCard title="Vacant Nodes" value={stats.availableRooms} icon={DoorOpen} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <button className="flex flex-col items-center gap-4 p-8 bg-[#161616] border border-[#222] rounded-3xl hover:border-indigo-500/30 hover:bg-[#1a1a1a] transition-all group">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Users size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-white">Add Student</span>
            </button>
            <button className="flex flex-col items-center gap-4 p-8 bg-[#161616] border border-[#222] rounded-3xl hover:border-blue-500/30 hover:bg-[#1a1a1a] transition-all group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <CalendarCheck size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-white">Attendance</span>
            </button>
            <button className="flex flex-col items-center gap-4 p-8 bg-[#161616] border border-[#222] rounded-3xl hover:border-rose-500/30 hover:bg-[#1a1a1a] transition-all group">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-all">
                <AlertCircle size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-white">Emergency</span>
            </button>
          </div>

          {/* Pending Complaints */}
          <div className="bg-[#161616] rounded-3xl border border-[#222] overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-[#222] flex items-center justify-between bg-white/[0.01]">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Active Complaints</h3>
                <p className="text-xs text-gray-500 font-medium">Items requiring synchronization</p>
              </div>
              <button className="text-indigo-400 text-[10px] font-bold hover:text-indigo-300 transition-colors uppercase tracking-widest">Master View</button>
            </div>
            <div className="divide-y divide-[#222]">
              {[1, 2].map((i) => (
                <div key={i} className="px-8 py-6 flex items-start gap-5 hover:bg-white/[0.02] transition-all group cursor-pointer">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-indigo-400 transition-colors shrink-0">
                    <MessageSquare size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-bold text-gray-200">Broken Fan in Room B20</h5>
                      <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">30m ago</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1 mb-3">The ceiling fan in my room makes a lot of noise and then stops. Need it fixed as soon as possible...</p>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Maintenance</span>
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest border-l border-[#222] pl-4">Rahul Sharma • R20</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl shadow-indigo-600/10">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-3 tracking-tight">Shift Protocol</h3>
              <p className="text-indigo-100/80 text-sm leading-relaxed mb-8">
                Night inspection starts at 10 PM. Ensure all entry logs are digitized before end of day.
              </p>
              <div className="flex items-center gap-3 py-2 px-4 bg-white/10 rounded-xl w-fit">
                <Clock size={14} className="text-white" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{`Starts in 4h`}</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
          </div>

          <div className="bg-[#161616] rounded-3xl border border-[#222] p-8 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Unit Analytics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl hover:border-indigo-500/20 transition-all">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Occupancy</span>
                <span className="text-sm font-bold text-emerald-400">92%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl hover:border-indigo-500/20 transition-all">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Dues Collection</span>
                <span className="text-sm font-bold text-blue-400">84%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl hover:border-indigo-500/20 transition-all">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Resolution Rate</span>
                <span className="text-sm font-bold text-white">4.2h</span>
              </div>
            </div>
            <button className="w-full mt-8 py-3 bg-[#222] border border-[#333] text-[10px] font-bold text-gray-400 hover:text-white hover:bg-[#282828] rounded-xl uppercase tracking-widest transition-all">
              Full Spectrum Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;
