import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Lock, Mail, User, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { updatePassword, updateEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const SecurityPage = () => {
  const { userData, user } = useAuth();
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      if (newPassword) {
        if (auth.currentUser) {
          await updatePassword(auth.currentUser, newPassword);
        }
      }
      if (newEmail && newEmail !== user?.email) {
        if (auth.currentUser) {
          await updateEmail(auth.currentUser, newEmail);
        }
      }
      setStatus({ type: 'success', message: 'Security protocols updated successfully.' });
      setNewPassword("");
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to update security credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight font-display">Security Protocol</h1>
        <p className="text-gray-500 mt-1">Manage encryption keys and access identifiers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161616] border border-[#222] rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/10">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Identity & Keys</h3>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mt-1">Credential synchronization</p>
              </div>
            </div>

            {status && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-xl text-xs font-bold mb-8 flex items-center gap-3 uppercase tracking-widest",
                  status.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                )}
              >
                {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {status.message}
              </motion.div>
            )}

            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Secure Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-500" size={18} />
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full bg-[#111] border border-[#222] rounded-xl px-12 py-3.5 outline-none focus:border-indigo-600 transition-all text-white font-medium text-sm"
                        placeholder="nexus@protocol.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 opacity-60">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">User ID</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                      <input
                        type="text"
                        readOnly
                        value={userData?.uid || "N/A"}
                        className="w-full bg-[#0d0d0d] border border-[#222] rounded-xl px-12 py-3.5 outline-none text-gray-400 font-mono text-xs"
                      />
                    </div>
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter ml-1">Immutable System Identifier</p>
                  </div>
                </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">New Encryption Key</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-500" size={18} />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#111] border border-[#222] rounded-xl px-12 py-3.5 outline-none focus:border-indigo-600 transition-all text-white font-medium text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm Matrix Key</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-500" size={18} />
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-[#111] border border-[#222] rounded-xl px-12 py-3.5 outline-none focus:border-indigo-600 transition-all text-white font-medium text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 font-medium ml-1">Entropy requirement: Min. 12 characters recommended for high-tier nodes.</p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-indigo-600 text-white font-bold px-10 py-4 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[10px] uppercase tracking-[0.2em]"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Update Security Matrix"}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-8">
            <h4 className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-2">Emergency Termination</h4>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Deactivating your account will permanently disconnect your identity from the HostelWise grid. This action is irreversible.
            </p>
            <button className="text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20 px-6 py-2.5 rounded-lg hover:bg-rose-500/10 transition-all">
              Initiate Purge
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-600/10 group">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4 tracking-tight">Access Log</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
                  <span className="text-indigo-200">Last Authorization</span>
                  <span className="font-bold">2m ago</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
                  <span className="text-indigo-200">Node Status</span>
                  <span className="font-bold text-emerald-400">Verified</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-200">Encryption Level</span>
                  <span className="font-bold">SHA-256</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
