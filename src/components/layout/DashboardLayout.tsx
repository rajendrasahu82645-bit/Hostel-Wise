import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  DoorOpen, 
  Building2, 
  CreditCard, 
  MessageSquare, 
  CalendarCheck, 
  Megaphone,
  LogOut,
  ChevronRight,
  Menu,
  X,
  User as UserIcon,
  Bell,
  ShieldCheck,
  Lock
} from "lucide-react";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface SidebarItemProps {
  to: string;
  icon: any;
  label: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon size={18} className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-gray-500")} />
    <span className="font-medium">{label}</span>
  </Link>
);

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, userData, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { to: role === "admin" ? "/admin" : role === "warden" ? "/warden" : "/student", icon: LayoutDashboard, label: "Overview", roles: ["admin", "warden", "student"] },
    { to: "/admin/hostels", icon: Building2, label: "Hostels", roles: ["admin"] },
    { to: "/admin/rooms", icon: DoorOpen, label: "Rooms", roles: ["admin", "warden"] },
    { to: "/admin/students", icon: Users, label: "Students", roles: ["admin", "warden"] },
    { to: "/attendance", icon: CalendarCheck, label: "Attendance", roles: ["admin", "warden"] },
    { to: "/fees", icon: CreditCard, label: "Fees", roles: ["admin", "warden", "student"] },
    { to: "/complaints", icon: MessageSquare, label: "Complaints", roles: ["admin", "warden", "student"] },
    { to: "/announcements", icon: Megaphone, label: "Notices", roles: ["admin", "warden", "student"] },
    { to: "/visitors", icon: Users, label: "Visitors", roles: ["admin", "warden"] },
    { to: "/security", icon: ShieldCheck, label: "Security", roles: ["admin", "warden", "student"] },
  ].filter(item => item.roles.includes(role || ""));

  return (
    <div className="flex h-screen bg-[#0a0a0a] font-sans text-gray-200 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] border-r border-[#222222] flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 mt-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="p-8 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Building2 size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display">HostelWise</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-2 scrollbar-hide">
          {navItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="p-6 border-t border-[#222222] mt-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                {userData?.name?.substring(0, 2).toUpperCase() || "??"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{userData?.name || "User"}</p>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest leading-none mt-1">{role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0f0f0f]">
        {/* Topbar */}
        <header className="h-16 bg-[#111111] border-b border-[#222222] flex items-center justify-between px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-base font-semibold text-gray-100 tracking-tight">
                {navItems.find(item => item.to === location.pathname)?.label || "Dashboard"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-[#1a1a1a] border border-[#333333] rounded-full px-4 py-1.5 text-xs w-64 focus:outline-none focus:border-indigo-500 text-gray-300 placeholder:text-gray-600" 
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#111111]" />
              </button>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden lg:block border-l border-[#222222] pl-6 h-4 flex items-center">
                {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-10 scrollbar-hide">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
