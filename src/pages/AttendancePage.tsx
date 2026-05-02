import React, { useEffect, useState } from "react";
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar as CalendarIcon
} from "lucide-react";
import { collection, getDocs, setDoc, doc, query, where, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { cn, formatDate } from "../lib/utils";
import { motion } from "motion/react";

interface StudentAttendance {
  userId: string;
  name: string;
  studentId: string;
  status?: 'present' | 'absent';
}

const AttendancePage = () => {
  const { userData, role } = useAuth();
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      // 1. Get students for this hostel
      // Note: In real app, filter by userData.hostelId
      const studentsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
      
      // 2. Get attendance for selected date
      const attendanceSnap = await getDocs(query(
        collection(db, "attendance"), 
        where("date", "==", selectedDate)
      ));
      
      const attendanceMap = new Map();
      attendanceSnap.docs.forEach(doc => {
        attendanceMap.set(doc.data().studentId, doc.data().status);
      });

      const studentsData = studentsSnap.docs.map(d => ({
        userId: d.id,
        name: d.data().name,
        studentId: d.id, // Using userId as studentId reference for simplicity in this demo
        status: attendanceMap.get(d.id)
      }));

      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndAttendance();
  }, [selectedDate]);

  const toggleStatus = (userId: string, newStatus: 'present' | 'absent') => {
    setStudents(prev => prev.map(s => 
      s.userId === userId ? { ...s, status: newStatus } : s
    ));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const promises = students
        .filter(s => s.status)
        .map(s => {
          const id = `${s.userId}_${selectedDate}`;
          return setDoc(doc(db, "attendance", id), {
            id,
            studentId: s.userId,
            date: selectedDate,
            status: s.status,
            markedBy: userData?.uid,
            timestamp: new Date().toISOString()
          });
        });
      await Promise.all(promises);
      alert("Attendance saved successfully!");
    } catch (error) {
      console.error("Error saving attendance:", error);
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <CalendarCheck className="text-indigo-600" />
            Attendance
          </h1>
          <p className="text-gray-500 mt-1">Daily presence tracking for {userData?.hostelName || "Main Hostel"}.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-[1.5rem] border border-gray-100 shadow-sm">
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3 px-4 font-bold text-indigo-900">
            <CalendarIcon size={18} className="text-indigo-600" />
            {new Date(selectedDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            disabled={selectedDate === new Date().toISOString().split('T')[0]}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                Present: {students.filter(s => s.status === 'present').length}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                Absent: {students.filter(s => s.status === 'absent').length}
              </div>
            </div>
            <button 
              onClick={handleSaveAll}
              disabled={saving || loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 uppercase tracking-widest"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <Save size={18} />
                  Save Marks
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Student Details</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Mark Attendance</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Last Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto mb-4 text-indigo-100" size={48} />
                    <p className="text-gray-400 font-bold uppercase tracking-tighter">Synchronizing data...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-gray-400">No students matching search.</td>
                </tr>
              ) : filteredStudents.map((student) => (
                <tr key={student.userId} className="group hover:bg-gray-50/20 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xs uppercase shadow-sm">
                        {student.name.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{student.name}</p>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Roll: #{student.studentId.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-6">
                      <button 
                        onClick={() => toggleStatus(student.userId, 'present')}
                        className={cn(
                          "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest",
                          student.status === 'present' 
                            ? "bg-green-600 text-white shadow-lg shadow-green-100 scale-105" 
                            : "bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600"
                        )}
                      >
                        <CheckCircle2 size={16} />
                        Present
                      </button>
                      <button 
                        onClick={() => toggleStatus(student.userId, 'absent')}
                        className={cn(
                          "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest",
                          student.status === 'absent' 
                            ? "bg-rose-600 text-white shadow-lg shadow-rose-100 scale-105" 
                            : "bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                        )}
                      >
                        <XCircle size={16} />
                        Absent
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-xs font-bold text-gray-300 uppercase tracking-widest">
                      <Clock size={14} />
                      {student.status ? "Changed" : "Pending"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
