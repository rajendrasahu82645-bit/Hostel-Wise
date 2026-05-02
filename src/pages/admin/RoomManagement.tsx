import React, { useEffect, useState } from "react";
import { 
  DoorOpen, 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Edit2, 
  X, 
  Loader2,
  Users,
  Building2,
  Hash
} from "lucide-react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, collectionGroup } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { cn, handleFirestoreError, OperationType } from "../../lib/utils";

interface Room {
  id: string;
  hostelId: string;
  hostelName?: string;
  roomNumber: string;
  capacity: number;
  occupancy: number;
  type: 'AC' | 'Non-AC';
  price: number;
}

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Partial<Room> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const hostelSnap = await getDocs(collection(db, "hostels")).catch(e => handleFirestoreError(e, OperationType.LIST, "hostels"));
      const hostelList = hostelSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setHostels(hostelList);

      const allRooms: Room[] = [];
      for (const h of hostelList) {
        const path = `hostels/${h.id}/rooms`;
        const roomSnap = await getDocs(collection(db, "hostels", h.id, "rooms")).catch(e => handleFirestoreError(e, OperationType.LIST, path));
        roomSnap.docs.forEach(rd => {
          allRooms.push({ id: rd.id, hostelId: h.id, hostelName: h.name, ...rd.data() } as Room);
        });
      }
      setRooms(allRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoom?.hostelId) return;
    setSubmitting(true);
    try {
      const roomData = {
        roomNumber: currentRoom.roomNumber,
        capacity: Number(currentRoom.capacity),
        occupancy: Number(currentRoom.occupancy || 0),
        type: currentRoom.type,
        price: Number(currentRoom.price),
      };

      if (currentRoom.id) {
        const path = `hostels/${currentRoom.hostelId}/rooms/${currentRoom.id}`;
        await updateDoc(doc(db, "hostels", currentRoom.hostelId, "rooms", currentRoom.id), roomData).catch(e => handleFirestoreError(e, OperationType.UPDATE, path));
      } else {
        const path = `hostels/${currentRoom.hostelId}/rooms`;
        await addDoc(collection(db, "hostels", currentRoom.hostelId, "rooms"), {
          ...roomData,
          createdAt: new Date().toISOString()
        }).catch(e => handleFirestoreError(e, OperationType.CREATE, path));
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving room:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRooms = rooms.filter(r => 
    r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.hostelName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Room Inventory</h1>
          <p className="text-gray-500 mt-1">Configure room types and occupancy levels.</p>
        </div>
        <button 
          onClick={() => { setCurrentRoom({ type: 'Non-AC', capacity: 2, occupancy: 0 }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest"
        >
          <Plus size={18} />
          Add Room
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by room or hostel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-600 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-500 rounded-2xl text-xs font-bold border border-transparent hover:border-gray-200 uppercase tracking-widest">
            <Filter size={16} /> All Hostels
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center">
            <Loader2 className="animate-spin text-indigo-100" size={48} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-4">Scanning rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">No rooms configured yet.</div>
        ) : filteredRooms.map((room) => (
          <motion.div 
            key={`${room.hostelId}-${room.id}`}
            layout
            className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all relative group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm",
                room.type === 'AC' ? "bg-blue-500" : "bg-orange-400"
              )}>
                <DoorOpen size={24} />
              </div>
              <div className="text-right">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                  room.occupancy >= room.capacity ? "bg-rose-50 text-rose-600" : "bg-green-50 text-green-600"
                )}>
                  {room.occupancy >= room.capacity ? "Full" : "Available"}
                </span>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tighter">Room {room.roomNumber}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-gray-300" />
                <span className="text-xs font-bold text-gray-900 line-clamp-1">{room.hostelName}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000",
                    room.occupancy >= room.capacity ? "bg-rose-500" : "bg-indigo-500"
                  )}
                  style={{ width: `${(room.occupancy / room.capacity) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-indigo-600">{room.occupancy} Occupied</span>
                <span className="text-gray-400">{room.capacity} Capacity</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="text-xs font-black text-gray-900 tracking-tighter">
                {room.type} • ₹{room.price}/mo
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setCurrentRoom(room); setIsModalOpen(true); }}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 bg-gray-50 rounded-lg"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Room Configuration</h3>
              <p className="text-gray-500 text-sm mb-8">Define room capacity and pricing details.</p>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assign Hostel</label>
                    <select
                      required
                      value={currentRoom?.hostelId || ""}
                      onChange={(e) => setCurrentRoom({...currentRoom, hostelId: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-gray-900"
                    >
                      <option value="">Select Hostel</option>
                      {hostels.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Room Number</label>
                    <input 
                      type="text" 
                      required
                      value={currentRoom?.roomNumber || ""}
                      onChange={(e) => setCurrentRoom({...currentRoom, roomNumber: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Type</label>
                    <select
                      value={currentRoom?.type || "Non-AC"}
                      onChange={(e) => setCurrentRoom({...currentRoom, type: e.target.value as any})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-gray-900"
                    >
                      <option value="AC">AC Room</option>
                      <option value="Non-AC">Non-AC Room</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Capacity</label>
                    <input 
                      type="number" 
                      required
                      value={currentRoom?.capacity || 2}
                      onChange={(e) => setCurrentRoom({...currentRoom, capacity: Number(e.target.value)})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Monthly Price</label>
                    <input 
                      type="number" 
                      required
                      value={currentRoom?.price || 0}
                      onChange={(e) => setCurrentRoom({...currentRoom, price: Number(e.target.value)})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-gray-900"
                    />
                  </div>
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
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : "Record Room"}
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

export default RoomManagement;
