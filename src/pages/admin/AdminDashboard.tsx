import React, { useEffect, useState } from "react";
import { 
  Users, 
  DoorOpen, 
  Building2, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Loader2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { formatCurrency, cn, handleFirestoreError, OperationType } from "../../lib/utils";
import { seedDemoData } from "../../lib/seed";

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-[#161616] border border-[#222222] p-6 rounded-2xl shadow-sm hover:border-indigo-500/30 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={cn("p-3 rounded-2xl bg-opacity-10", color)}>
        <Icon size={24} className={cn("bg-opacity-100", color.replace('bg-', 'text-'))} />
      </div>
      {trend && (
        <span className={cn(
          "flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full",
          trend > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
        )}>
          {trend > 0 ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    totalHostels: 0,
    pendingFees: 0,
    occupancyRate: 0,
    totalVisitors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    const success = await seedDemoData();
    if (success) {
      alert("Demo data seeded! Please refresh the page.");
      window.location.reload();
    }
    setSeeding(false);
  };
  const occupancyData = [
    { name: "Hostel A", occupied: 45, vacant: 5 },
    { name: "Hostel B", occupied: 38, vacant: 12 },
    { name: "Hostel C", occupied: 20, vacant: 30 },
  ];

  const revenueData = [
    { month: "Jan", amount: 45000 },
    { month: "Feb", amount: 52000 },
    { month: "Mar", amount: 48000 },
    { month: "Apr", amount: 61000 },
    { month: "May", amount: 55000 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const studentSnap = await getDocs(collection(db, "students")).catch(e => handleFirestoreError(e, OperationType.LIST, "students"));
        const hostelSnap = await getDocs(collection(db, "hostels")).catch(e => handleFirestoreError(e, OperationType.LIST, "hostels"));
        const feeSnap = await getDocs(query(collection(db, "fees"), where("status", "==", "pending"))).catch(e => handleFirestoreError(e, OperationType.LIST, "fees"));
        const visitorSnap = await getDocs(collection(db, "visitors")).catch(e => handleFirestoreError(e, OperationType.LIST, "visitors"));

        setStats({
          totalStudents: studentSnap.size,
          totalRooms: 120, // Sum this from hostels if available
          totalHostels: hostelSnap.size,
          pendingFees: feeSnap.docs.reduce((acc, doc) => acc + doc.data().amount, 0),
          occupancyRate: 85,
          totalVisitors: visitorSnap.size,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-display">Overview</h1>
          <p className="text-gray-500 mt-1">Real-time infrastructure and operations analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-[#222] text-gray-300 rounded-xl text-xs font-bold hover:bg-[#282828] hover:text-white transition-all disabled:opacity-50 border border-[#333]"
          >
            {seeding ? <Loader2 className="animate-spin" size={14} /> : <Database size={14} />}
            Seed Data
          </button>
          <div className="hidden sm:flex flex-col items-end border-l border-[#222] pl-6 h-10 justify-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Node Status</span>
            <span className="text-sm font-semibold text-emerald-400">Stable</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats.totalStudents === 0 && !loading ? (
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
            <Database size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Node Registry Empty</h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8 font-medium">The system is currently decentralized with no synchronized records. Initialize the demo node registry to begin operations.</p>
          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center gap-3 bg-indigo-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-[0.2em] text-xs disabled:opacity-50"
          >
            {seeding ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                Synchronize Demo Data
                <ArrowUpRight size={18} />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Students" 
            value={stats.totalStudents} 
            icon={Users} 
            trend={12} 
            color="bg-indigo-500" 
          />
          <StatCard 
            title="Visitor Logs" 
            value={stats.totalVisitors} 
            icon={Clock} 
            trend={5} 
            color="bg-emerald-500" 
          />
          <StatCard 
            title="Pending Fees" 
            value={formatCurrency(stats.pendingFees)} 
            icon={CreditCard} 
            trend={8} 
            color="bg-rose-500" 
          />
          <StatCard 
            title="Total Hostels" 
            value={stats.totalHostels} 
            icon={Building2} 
            color="bg-amber-500" 
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-[#161616] border border-[#222222] p-8 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Revenue Overview</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Monthly collection trends</p>
            </div>
            <select className="bg-[#222] border border-[#333] text-[10px] font-bold text-gray-400 uppercase tracking-widest rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500">
              <Option value="6m">Last 6 Months</Option>
              <Option value="1y">Last Year</Option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222222" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 600 }}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-[#161616] border border-[#222222] p-8 rounded-3xl shadow-sm">
           <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Hostel Occupancy</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Capacity vs usage</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Full</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#222222" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="occupied" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} barSize={25} />
                <Bar dataKey="vacant" stackId="a" fill="#222222" radius={[0, 6, 6, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Alerts / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#161616] rounded-3xl border border-[#222222] shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-[#222222] flex items-center justify-between bg-white/[0.01]">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Recent Complaints</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Attention required on these items</p>
            </div>
            <button className="text-indigo-400 text-xs font-bold hover:text-indigo-300 transition-colors uppercase tracking-widest">View All</button>
          </div>
          <div className="divide-y divide-[#222222]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-200">Water Leakage in Room 204</h5>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Hostel A • Student ID: #2944</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px] font-bold uppercase tracking-widest mb-1.5">In Progress</span>
                  <p className="text-xs text-gray-500 font-medium">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden flex flex-col justify-between group shadow-xl shadow-indigo-600/10">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <Clock size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">Warden Meeting</h3>
            <p className="text-indigo-100/80 text-sm leading-relaxed mb-8">
              Monthly review meeting with all hostel wardens scheduled for tomorrow at 10:00 AM in the main office.
            </p>
            <button className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-black/10">
              Set Reminder
            </button>
          </div>
          {/* Abstract decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
      </div>
    </div>
  );
};

const Option = ({ children, value }: { children: React.ReactNode, value: string }) => (
  <option value={value}>{children}</option>
);

export default AdminDashboard;
