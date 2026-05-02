import React, { useState, useEffect } from "react";
import { UserSquare2, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

const LoginPage = () => {
  const { user, loginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [success, setSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "warden" | "student">("admin");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (success) return;
    
    setSuccess(true);
    
    // Simulate successful login routing delay
    setTimeout(() => {
      loginAs(userId, selectedRole);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">HostelWise</h1>
          <p className="text-gray-400">System Access Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              User ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <UserSquare2 size={20} />
              </div>
              <input
                required
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-gray-600 font-medium"
                placeholder="Enter your system ID"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Role Definition (Demo)
            </label>
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
              {(['admin', 'warden', 'student'] as const).map(r => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    selectedRole === r 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={success || !userId}
            className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            {success ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Authenticating...
              </>
            ) : (
              'Access System'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
