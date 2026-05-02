import React, { useEffect, useState } from "react";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  Plus, 
  MoreVertical,
  X,
  Loader2,
  Calendar,
  IndianRupee,
  Receipt
} from "lucide-react";
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { cn, formatDate, formatCurrency, handleFirestoreError, OperationType } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  month: string;
  status: 'pending' | 'paid';
  paymentDate?: string;
  transactionId?: string;
}

const FeeManagement = () => {
  const { user, role, userData } = useAuth();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFee, setNewFee] = useState({ studentId: "", amount: 0, month: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchFees = async () => {
    setLoading(true);
    setErrorMsg(null);
    const path = "fees";
    try {
      let q;
      // Try ordered query first
      try {
        if (role === 'student') {
          q = query(collection(db, path), where("studentId", "==", user?.uid), orderBy("month", "desc"));
        } else {
          q = query(collection(db, path), orderBy("month", "desc"));
        }
        const snap = await getDocs(q).catch(() => null);
        
        if (snap) {
          const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as FeeRecord));
          setFees(data);
          return;
        }
      } catch (e) {
        console.warn("Ordered query failed, falling back to unordered", e);
      }

      // Fallback: Unordered query
      if (role === 'student') {
        q = query(collection(db, path), where("studentId", "==", user?.uid));
      } else {
        q = query(collection(db, path));
      }

      const snap = await getDocs(q).catch(e => {
        const info = JSON.parse(e.message || '{}');
        if (info.error?.includes("offline") || info.error?.includes("reach backend")) {
          setErrorMsg("The system is currently in offline mode. Please check your internet connection.");
        }
        return handleFirestoreError(e, OperationType.LIST, path);
      });
      const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as FeeRecord))
        .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()); // Sort in memory
      setFees(data);
    } catch (error) {
      console.error("Error fetching fees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && role) fetchFees();
  }, [user, role]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      // In real app, look up studentName from studentId
      await addDoc(collection(db, "fees"), {
        ...newFee,
        studentName: "Student Name", // Placeholder
        status: 'pending',
        createdAt: new Date().toISOString(),
      }).catch(e => handleFirestoreError(e, OperationType.WRITE, "fees"));
      
      setIsModalOpen(false);
      setNewFee({ studentId: "", amount: 0, month: "" });
      fetchFees();
    } catch (error: any) {
      console.error("Error creating fee:", error);
      try {
        const info = JSON.parse(error.message);
        setErrorMsg(`Failed to submit: ${info.error}`);
      } catch {
        setErrorMsg(`Failed to connect to the backend. ${error.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async (id: string) => {
    if (!confirm("Confirm payment receipt?")) return;
    try {
      await updateDoc(doc(db, "fees", id), {
        status: 'paid',
        paymentDate: new Date().toISOString(),
        transactionId: `TXN${Math.floor(100000 + Math.random() * 900000)}`
      }).catch(e => handleFirestoreError(e, OperationType.UPDATE, "fees"));
      fetchFees();
    } catch (error: any) {
      console.error("Error updating fee:", error);
      try {
        const info = JSON.parse(error.message);
        setErrorMsg(`Failed to update: ${info.error}`);
      } catch {
        setErrorMsg(`Failed to connect to the backend: ${error.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-indigo-900">Fee Management</h1>
          <p className="text-gray-500 mt-1">Track payments and manage hostel dues.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={18} />
            Statement
          </button>
          {role !== 'student' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              <Plus size={18} />
              Generate Fee
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-4">
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <IndianRupee size={20} />
          </div>
          <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1">Received This Month</p>
          <h4 className="text-3xl font-black tracking-tight">{formatCurrency(45000)}</h4>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
            <Clock size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Amount</p>
          <h4 className="text-3xl font-black text-gray-900 tracking-tight">{formatCurrency(12500)}</h4>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Collection Rate</p>
          <h4 className="text-3xl font-black text-gray-900 tracking-tight">78%</h4>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-50 flex items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by student name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Period</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="animate-spin mx-auto mb-4" />
                    Loading records...
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">No fee records found.</td>
                </tr>
              ) : fees.filter(f => (f.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) || (f.studentId || "").toLowerCase().includes(searchTerm.toLowerCase())).map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 uppercase tracking-tight">{fee.studentName}</p>
                    <p className="text-xs font-semibold text-gray-400 tracking-wider">ID: {fee.studentId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      {fee.month}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-lg font-black text-gray-900 tracking-tighter">{formatCurrency(fee.amount)}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      fee.status === "paid" ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-indigo-600">
                      {fee.status === 'pending' && role !== 'student' && (
                        <button 
                          onClick={() => handlePay(fee.id)}
                          className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-all uppercase tracking-widest"
                        >
                          Mark Paid
                        </button>
                      )}
                      {fee.status === 'paid' && (
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-all">
                          <Receipt size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                  <CreditCard className="text-indigo-600" /> Generate Fee
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Student ID</label>
                  <input
                    required
                    type="text"
                    value={newFee.studentId}
                    onChange={e => setNewFee({ ...newFee, studentId: e.target.value })}
                    className="w-full border-2 border-gray-100 rounded-xl p-3 focus:outline-none focus:border-indigo-600 transition-colors font-medium text-gray-900"
                    placeholder="e.g. STU12345"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={newFee.amount || ''}
                    onChange={e => setNewFee({ ...newFee, amount: Number(e.target.value) })}
                    className="w-full border-2 border-gray-100 rounded-xl p-3 focus:outline-none focus:border-indigo-600 transition-colors font-medium text-gray-900"
                    placeholder="4500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Month Period</label>
                  <input
                    required
                    type="month"
                    value={newFee.month}
                    onChange={e => setNewFee({ ...newFee, month: e.target.value })}
                    className="w-full border-2 border-gray-100 rounded-xl p-3 focus:outline-none focus:border-indigo-600 transition-colors font-medium text-gray-900"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Generate Bill
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeeManagement;
