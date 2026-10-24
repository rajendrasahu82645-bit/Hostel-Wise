import React from "react";
import {
  ClipboardCheck,
  Clock3,
  DoorOpen,
  Plane,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const attendanceSummary = [
  { label: "Present", value: "186", tone: "text-emerald-400" },
  { label: "Absent", value: "12", tone: "text-rose-400" },
  { label: "Late", value: "7", tone: "text-amber-400" },
];

const leaveRequests = [
  { student: "Aarav Sharma", purpose: "Family visit", date: "25 Oct 2026", status: "Approved" },
  { student: "Nisha Gupta", purpose: "Medical checkup", date: "27 Oct 2026", status: "Pending" },
  { student: "Rohan Patel", purpose: "Academic leave", date: "29 Oct 2026", status: "Approved" },
];

const outpassLogs = [
  { name: "Aarav Sharma", in: "08:15 AM", out: "09:30 AM", reason: "College internship" },
  { name: "Riya Kapoor", in: "12:10 PM", out: "11:45 AM", reason: "Medical appointment" },
  { name: "Rahul Verma", in: "06:20 PM", out: "05:00 PM", reason: "Library visit" },
];

const OutpassPage = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">Access control</p>
          <h1 className="mt-2 text-3xl font-bold text-white tracking-tight">Attendance &amp; Outpass</h1>
        </div>
        <button className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-colors">
          New Leave Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {attendanceSummary.map((item) => (
          <div key={item.label} className="rounded-3xl border border-[#222] bg-[#161616] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{item.label}</p>
            <h3 className={`mt-3 text-3xl font-bold ${item.tone}`}>{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="rounded-3xl border border-[#222] bg-[#161616] p-6">
          <div className="mb-5 flex items-center gap-3">
            <ClipboardCheck className="text-indigo-400" size={18} />
            <h3 className="text-xl font-bold text-white">Leave applications</h3>
          </div>

          <div className="space-y-3">
            {leaveRequests.map((request) => (
              <div key={request.student} className="flex flex-col gap-3 rounded-2xl border border-[#222] bg-[#111] p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-white">{request.student}</p>
                  <p className="text-sm text-gray-400">{request.purpose}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">{request.date}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                    request.status === "Approved"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#222] bg-[#161616] p-6">
          <div className="mb-5 flex items-center gap-3">
            <Clock3 className="text-amber-400" size={18} />
            <h3 className="text-xl font-bold text-white">Late return tracking</h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-[#222] bg-[#111] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Current alert</p>
              <p className="mt-2 text-lg font-bold text-white">3 students</p>
              <p className="text-sm text-gray-400">Returned after 10:00 PM this week.</p>
            </div>
            <div className="rounded-2xl border border-[#222] bg-[#111] p-4">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle size={16} />
                <p className="text-sm font-semibold">Priority review</p>
              </div>
              <p className="mt-2 text-sm text-gray-400">Two records require warden follow-up before tomorrow’s gate check.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#222] bg-[#161616] p-6">
        <div className="mb-5 flex items-center gap-3">
          <DoorOpen className="text-blue-400" size={18} />
          <h3 className="text-xl font-bold text-white">Outpass entry / exit records</h3>
        </div>

        <div className="space-y-3">
          {outpassLogs.map((log) => (
            <div key={log.name} className="grid grid-cols-1 gap-3 rounded-2xl border border-[#222] bg-[#111] p-4 md:grid-cols-[1.2fr_0.7fr_0.7fr_1fr] md:items-center">
              <div>
                <p className="font-semibold text-white">{log.name}</p>
                <p className="text-xs text-gray-500">{log.reason}</p>
              </div>
              <div className="text-sm text-gray-300"><span className="text-gray-500">Out:</span> {log.out}</div>
              <div className="text-sm text-gray-300"><span className="text-gray-500">In:</span> {log.in}</div>
              <div className="flex justify-start md:justify-end">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                  <CheckCircle2 size={12} />
                  Logged
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutpassPage;
