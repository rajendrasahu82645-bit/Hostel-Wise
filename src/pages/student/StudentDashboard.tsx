import React, { useEffect, useState } from "react";
import { 
  Building2, 
  DoorOpen, 
  CreditCard, 
  MessageSquare,
  AlertCircle,
  CalendarDays,
  MapPin,
  ChevronRight,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency, formatDate, cn } from "../../lib/utils";
import { motion } from "motion/react";

const StudentDashboard = () => {
  const { userData } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [pendingFees, setPendingFees] = useState<any[]>([]);

  useEffect(() => {
    // Fill with sample data if userData is new/empty
    setRoom({
      roomNo: "B-204",
      floor: "2nd Floor",
      type: "Double AC",
      hostel: "Riverview Boys Hostel",
      mates: ["Aditya K.", "Sumit V."]
    });
    setPendingFees([
      { month: "May 2026", amount: 8500, deadline: "10 May 2026", status: "pending" }
    ]);
  }, [userData]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-10 sm:p-14 text-white relative overflow-hidden group shadow-2xl shadow-indigo-600/20">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h4 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase opacity-70 mb-4">Resident Protocol Active</h4>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4 font-display">Hello, {userData?.name?.split(' ')[0] || "User"}!</h1>
            <p className="text-indigo-100/90 text-sm sm:text-lg font-medium max-w-md leading-relaxed">
              Operational status: Optimal. Your network connectivity and logistics are fully synchronized.
            </p>
          </motion.div>
          
          <div className="flex flex-wrap gap-4 mt-12">
            <Link 
              to="/complaints"
              className="bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-neutral-100 active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center gap-3"
            >
              <Plus size={16} />
              Raise Complaint
            </Link>
            <Link 
              to="/fees"
              className="bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-indigo-400 active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center gap-3 border border-indigo-400/30"
            >
              <CreditCard size={16} />
              Pay Fees
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-400/20 rounded-full translate-y-1/2 blur-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Room Info Card */}
        <div className="bg-[#161616] rounded-[2rem] border border-[#222] p-10 shadow-sm lg:col-span-2 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-5">
              <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/10">
                <DoorOpen size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-tight">Unit Profile</h3>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">Resource allocation details</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-10 relative z-10">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-500 shrink-0">
                  <Building2 size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">Hostel Grid</p>
                  <p className="font-bold text-gray-200">{room?.hostel || "Unit Alpha"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-500 shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">Coordinates</p>
                  <p className="font-bold text-gray-200">{room?.floor || "Sec-02, Level 4"}</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-indigo-600/5 rounded-[2.5rem] border border-indigo-600/10 flex flex-col justify-center items-center text-center group-hover:bg-indigo-600/10 transition-colors">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3">Room Target</p>
              <h4 className="text-6xl font-black text-indigo-500 tracking-tighter mb-2">{room?.roomNo || "B-204"}</h4>
              <p className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-[0.1em]">{room?.type || "Standard Double"}</p>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-[#222] relative z-10">
            <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-8">Concurrent Residents</h4>
            <div className="flex flex-wrap gap-4">
              {room?.mates?.map((mate: string, i: number) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3 bg-[#111] rounded-2xl border border-white/[0.05] hover:border-indigo-500/30 transition-all cursor-default">
                  <div className="w-8 h-8 bg-indigo-600/10 rounded-lg flex items-center justify-center text-[10px] font-bold text-indigo-400 border border-indigo-600/10 uppercase">
                    {mate.substring(0, 2)}
                  </div>
                  <span className="text-sm font-bold text-gray-400">{mate}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Quick Access/Status */}
        <div className="space-y-8">
          {/* Fee Status */}
          <div className="bg-[#161616] rounded-[2rem] border border-[#222] p-8 shadow-sm">
            <div className="flex items-center gap-5 mb-8">
              <div className="p-3.5 bg-amber-400/10 text-amber-400 rounded-2xl border border-amber-400/10">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Ledger</h3>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">Financial synchronization</p>
              </div>
            </div>

            {pendingFees.length > 0 ? (
              <div className="space-y-5">
                {pendingFees.map((fee, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="p-6 bg-rose-500/[0.03] rounded-2xl border border-rose-500/10 group-hover:border-rose-500/30 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{fee.month}</span>
                        <div className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-bold rounded uppercase border border-rose-500/10">Deficit</div>
                      </div>
                      <p className="text-3xl font-bold text-white mb-2">{formatCurrency(fee.amount)}</p>
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                        <span>Due: {fee.deadline}</span>
                        <ChevronRight size={14} className="transition-transform group-hover:translate-x-1 text-rose-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center">
                <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">Status: Balanced</p>
                <p className="text-gray-600 text-[10px] font-medium uppercase tracking-wider">No pending liabilities found.</p>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-[#161616] p-8 rounded-[2rem] border border-[#222] shadow-sm text-center group hover:border-indigo-500/30 transition-all">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/10 group-hover:scale-110 transition-transform">
                <CalendarDays size={22} />
              </div>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Uptime</p>
              <h4 className="text-2xl font-bold text-white tracking-tight">96%</h4>
            </div>
            <div className="bg-[#161616] p-8 rounded-[2rem] border border-[#222] shadow-sm text-center group hover:border-rose-500/30 transition-all">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/10 group-hover:scale-110 transition-transform">
                <MessageSquare size={22} />
              </div>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Logs</p>
              <h4 className="text-2xl font-bold text-white tracking-tight">2 Active</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
