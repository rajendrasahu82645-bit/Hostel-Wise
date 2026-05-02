import React, { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  Hash,
  Download,
  X,
  Loader2,
  CheckCircle2,
  Building2
} from "lucide-react";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatDate, handleFirestoreError, OperationType } from "../../lib/utils";

interface Student {
  userId: string;
  studentId: string;
  name: string;
  email: string;
  course: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  roomId?: string;
  hostelId?: string;
  status: 'active' | 'withdrawn' | 'graduated';
  joinDate: string;
}

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Partial<Student> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student"))).catch(e => handleFirestoreError(e, OperationType.LIST, "users"));
      const studentsData: Student[] = [];
      
      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        const studentDoc = await getDoc(doc(db, "students", userDoc.id)).catch(e => handleFirestoreError(e, OperationType.GET, `students/${userDoc.id}`));
        if (studentDoc && studentDoc.exists()) {
          studentsData.push({
            ...userData,
            ...studentDoc.data(),
          } as Student);
        }
      }
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const studentId = currentStudent?.userId || `student_${Date.now()}`;
      
      const studentData = {
        studentId: currentStudent?.studentId,
        course: currentStudent?.course,
        guardianName: currentStudent?.guardianName,
        guardianPhone: currentStudent?.guardianPhone,
        status: currentStudent?.status || 'active',
        roomId: currentStudent?.roomId || "",
        hostelId: currentStudent?.hostelId || "",
        userId: studentId,
      };

      const userData = {
        uid: studentId,
        name: currentStudent?.name,
        email: currentStudent?.email || `${currentStudent?.studentId?.toLowerCase()}@hostel.com`,
        phone: currentStudent?.phone || "",
        role: "student",
      };

      await setDoc(doc(db, "students", studentId), studentData, { merge: true })
        .catch(e => handleFirestoreError(e, OperationType.WRITE, `students/${studentId}`));
      
      await setDoc(doc(db, "users", studentId), userData, { merge: true })
        .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${studentId}`));

      await fetchStudents();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving student:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!window.confirm("Are you sure you want to remove this student? This action cannot be undone.")) return;
    
    try {
      await deleteDoc(doc(db, "students", studentId)).catch(e => handleFirestoreError(e, OperationType.DELETE, `students/${studentId}`));
      await deleteDoc(doc(db, "users", studentId)).catch(e => handleFirestoreError(e, OperationType.DELETE, `users/${studentId}`));
      await fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("CRITICAL ACTION: This will delete ALL student records and their associated accounts. Continue?")) return;
    
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
      for (const userDoc of snap.docs) {
        await deleteDoc(doc(db, "students", userDoc.id)).catch(() => {});
        await deleteDoc(doc(db, "users", userDoc.id)).catch(() => {});
      }
      await fetchStudents();
    } catch (error) {
      console.error("Error clearing students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Directory</h1>
          <p className="text-gray-500 mt-1">Manage and track all hostel residents.</p>
        </div>
        <div className="flex items-center gap-3">
          {students.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors"
            >
              <Trash2 size={18} />
              Clear All
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={18} />
            Export
          </button>
          <button 
            onClick={() => {
              setCurrentStudent({});
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={18} />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-100 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold border border-transparent hover:border-gray-200 transition-all">
            <Filter size={18} />
            Status
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold border border-transparent hover:border-gray-200 transition-all">
            <Filter size={18} />
            Course
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Hostel/Room</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              ) : filteredStudents.map((student) => (
                <tr key={student.userId} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold uppercase text-xs">
                        {student.name.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{student.name}</p>
                        <p className="text-xs font-semibold text-gray-400 tracking-wider">#{student.studentId} • {student.course}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        {student.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="text-gray-400" />
                        {student.phone || "No phone"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Building2 size={14} className="text-gray-400" />
                        Hostel {student.hostelId || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Hash size={14} className="text-gray-400" />
                        Room {student.roomId || "Pending"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      student.status === "active" ? "bg-green-50 text-green-600" : 
                      student.status === "graduated" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
                    )}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setCurrentStudent(student);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.userId)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {currentStudent?.userId ? "Edit Student Details" : "Register Student"}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={currentStudent?.name || ""}
                      onChange={(e) => setCurrentStudent({...currentStudent, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Student ID</label>
                    <input 
                      type="text" 
                      required
                      value={currentStudent?.studentId || ""}
                      onChange={(e) => setCurrentStudent({...currentStudent, studentId: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Course</label>
                    <input 
                      type="text" 
                      required
                      value={currentStudent?.course || ""}
                      onChange={(e) => setCurrentStudent({...currentStudent, course: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={currentStudent?.phone || ""}
                      onChange={(e) => setCurrentStudent({...currentStudent, phone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Guardian Name</label>
                    <input 
                      type="text" 
                      value={currentStudent?.guardianName || ""}
                      onChange={(e) => setCurrentStudent({...currentStudent, guardianName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Guardian Phone</label>
                    <input 
                      type="tel" 
                      value={currentStudent?.guardianPhone || ""}
                      onChange={(e) => setCurrentStudent({...currentStudent, guardianPhone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Room No.</label>
                    <input 
                      type="text" 
                      value={currentStudent?.roomId || ""}
                      onChange={(e) => setCurrentStudent({...currentStudent, roomId: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Status</label>
                    <select
                      value={currentStudent?.status || "active"}
                      onChange={(e) => setCurrentStudent({...currentStudent, status: e.target.value as any})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="withdrawn">Withdrawn</option>
                      <option value="graduated">Graduated</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-gray-100 mt-8">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-70"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
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

export default StudentManagement;
