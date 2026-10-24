import React from "react";
import {
  Utensils,
  CalendarDays,
  CreditCard,
  MessageSquareText,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const weeklyMenu = [
  { day: "Monday", breakfast: "Poha + Tea", lunch: "Rajma Rice + Salad", dinner: "Paneer Curry + Chapati" },
  { day: "Tuesday", breakfast: "Idli + Sambar", lunch: "Dal Tadka + Rice", dinner: "Veg Biryani + Raita" },
  { day: "Wednesday", breakfast: "Upma + Coffee", lunch: "Mix Veg + Chapati", dinner: "Chicken Curry + Rice" },
  { day: "Thursday", breakfast: "Paratha + Curd", lunch: "Paneer Bhurji + Rice", dinner: "Soya Curry + Rotis" },
  { day: "Friday", breakfast: "Bread Butter + Fruit", lunch: "Aloo Gobi + Rice", dinner: "Methi Chicken + Naan" },
];

const mealPreferences = [
  { label: "Breakfast", value: "Veg preferred" },
  { label: "Lunch", value: "Non-spicy" },
  { label: "Dinner", value: "High protein" },
];

const messFeeRecords = [
  { month: "May 2026", amount: "₹2,850", status: "Paid" },
  { month: "June 2026", amount: "₹2,850", status: "Due in 4 days" },
  { month: "July 2026", amount: "₹2,850", status: "Upcoming" },
];

const feedbackItems = [
  { title: "Taste review", text: "Lunch was well-balanced and fresh today." },
  { title: "Service review", text: "Queue was smooth and food served on time." },
  { title: "Maintenance", text: "Water refill station needs cleaning near Block B." },
];

const MessManagement = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">Dining</p>
          <h1 className="mt-2 text-3xl font-bold text-white tracking-tight">Mess Management</h1>
        </div>
        <button className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-colors">
          Submit Feedback
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-[#222] bg-[#161616] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-400"><Utensils size={18} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Meal plan</p>
              <h3 className="mt-2 text-2xl font-bold text-white">3x</h3>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#222] bg-[#161616] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400"><CheckCircle2 size={18} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Attendance</p>
              <h3 className="mt-2 text-2xl font-bold text-white">96%</h3>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#222] bg-[#161616] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-400"><Clock3 size={18} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Service time</p>
              <h3 className="mt-2 text-2xl font-bold text-white">7:30 AM</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-6">
        <div className="rounded-3xl border border-[#222] bg-[#161616] p-6">
          <div className="mb-5 flex items-center gap-3">
            <CalendarDays className="text-indigo-400" size={18} />
            <h3 className="text-xl font-bold text-white">Weekly food menu</h3>
          </div>

          <div className="space-y-4">
            {weeklyMenu.map((item) => (
              <div key={item.day} className="rounded-2xl border border-[#222] bg-[#111] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-400">{item.day}</p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-300">
                  <div><span className="text-gray-500">Breakfast:</span> {item.breakfast}</div>
                  <div><span className="text-gray-500">Lunch:</span> {item.lunch}</div>
                  <div><span className="text-gray-500">Dinner:</span> {item.dinner}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[#222] bg-[#161616] p-6">
            <h3 className="text-lg font-bold text-white">Meal preferences</h3>
            <div className="mt-5 space-y-3">
              {mealPreferences.map((pref) => (
                <div key={pref.label} className="flex items-center justify-between rounded-2xl border border-[#222] bg-[#111] px-4 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{pref.label}</span>
                  <span className="text-sm font-medium text-gray-200">{pref.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#222] bg-[#161616] p-6">
            <div className="mb-4 flex items-center gap-3">
              <CreditCard className="text-emerald-400" size={18} />
              <h3 className="text-lg font-bold text-white">Mess fee records</h3>
            </div>
            <div className="space-y-3">
              {messFeeRecords.map((fee) => (
                <div key={fee.month} className="flex items-center justify-between rounded-2xl border border-[#222] bg-[#111] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{fee.month}</p>
                    <p className="text-xs text-gray-500">{fee.amount}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                    {fee.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#222] bg-[#161616] p-6">
        <div className="mb-5 flex items-center gap-3">
          <MessageSquareText className="text-amber-400" size={18} />
          <h3 className="text-lg font-bold text-white">Food feedback & complaints</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedbackItems.map((item) => (
            <div key={item.title} className="rounded-2xl border border-[#222] bg-[#111] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">{item.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-300">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessManagement;
