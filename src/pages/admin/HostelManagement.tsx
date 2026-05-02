import React, { useEffect, useState } from "react";
import { 
  Building2, 
  MapPin, 
  Users, 
  DoorOpen, 
  Plus, 
  Edit2, 
  Trash2,
  X,
  Loader2,
  LayoutGrid,
  Info
} from "lucide-react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { cn, handleFirestoreError, OperationType } from "../../lib/utils";

interface Hostel {
  id: string;
  name: string;
  address: string;
  totalRooms: number;
  wardenId?: string;
  wardenName?: string;
}

const HostelManagement = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentHostel, setCurrentHostel] = useState<Partial<Hostel> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchHostels = async () => {
    setLoading(true);
    const path = "hostels";
    try {
      const snap = await getDocs(collection(db, path)).catch(e => handleFirestoreError(e, OperationType.LIST, path));
      setHostels(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hostel)));
    } catch (error) {
      console.error("Error fetching hostels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (currentHostel?.id) {
        const path = `hostels/${currentHostel.id}`;
        await updateDoc(doc(db, "hostels", currentHostel.id), {
          name: currentHostel.name,
          address: currentHostel.address,
          totalRooms: Number(currentHostel.totalRooms),
        }).catch(e => handleFirestoreError(e, OperationType.UPDATE, path));
      } else {
        const path = "hostels";
        await addDoc(collection(db, path), {
          ...currentHostel,
          totalRooms: Number(currentHostel?.totalRooms || 0),
          createdAt: new Date().toISOString(),
        }).catch(e => handleFirestoreError(e, OperationType.CREATE, path));
      }
      setIsModalOpen(false);
      fetchHostels();
    } catch (error) {
      console.error("Error saving hostel:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-indigo-900 tracking-tight">Hostel Facilities</h1>
          <p className="text-gray-500 mt-1">Manage infrastructure and staff assignments.</p>
        </div>
        <button 
          onClick={() => { setCurrentHostel({}); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest"
        >
          <Plus size={18} />
          New Hostel
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="animate-spin text-indigo-200" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hostels.map((hostel) => (
            <motion.div 
              key={hostel.id}
              layout
              className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all flex flex-col group overflow-hidden"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Building2 size={28} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setCurrentHostel(hostel); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 rounded-xl">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-xl">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">{hostel.name}</h3>
              <p className="text-sm text-gray-400 font-medium flex items-center gap-2 mb-8">
                <MapPin size={14} />
                {hostel.address}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="bg-gray-50 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Rooms</p>
                  <p className="text-xl font-bold text-gray-900">{hostel.totalRooms}</p>
                </div>
                <div className="bg-indigo-50/50 p-4 rounded-2xl text-center border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Capacity</p>
                  <p className="text-xl font-bold text-indigo-600">{hostel.totalRooms * 3}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warden</p>
                    <p className="text-xs font-bold text-gray-700">{hostel.wardenName || "Unassigned"}</p>
                  </div>
                </div>
                <button className="text-indigo-600 p-2 hover:bg-indigo-50 rounded-xl transition-all">
                  <LayoutGrid size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Hostel Details</h3>
              <p className="text-gray-500 text-sm mb-8">Maintain building information and capacity.</p>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Hostel Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Phoenix Elite Residents"
                    value={currentHostel?.name || ""}
                    onChange={(e) => setCurrentHostel({...currentHostel, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Address / Location</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Sector 12, Tech Park Enclave"
                    value={currentHostel?.address || ""}
                    onChange={(e) => setCurrentHostel({...currentHostel, address: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Total Rooms</label>
                  <input 
                    type="number" 
                    required
                    value={currentHostel?.totalRooms || 0}
                    onChange={(e) => setCurrentHostel({...currentHostel, totalRooms: Number(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-gray-900"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition-colors uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-70 uppercase tracking-widest"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
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

export default HostelManagement;
