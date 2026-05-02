import { collection, doc, setDoc, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { handleFirestoreError, OperationType } from "./utils";

export const seedDemoData = async () => {
  try {
    // 1. Create Hostels
    const hostels = [
      { id: "hostel-a", name: "Everest Boys Hostel", address: "North Wing, Campus A", totalRooms: 50 },
      { id: "hostel-b", name: "Orchid Girls Hostel", address: "South Wing, Campus B", totalRooms: 45 },
    ];

    for (const h of hostels) {
      await setDoc(doc(db, "hostels", h.id), h).catch(e => handleFirestoreError(e, OperationType.WRITE, `hostels/${h.id}`));
      
      // 2. Create some rooms for each hostel
      for (let i = 101; i <= 105; i++) {
        const roomId = `room-${i}`;
        const roomPath = `hostels/${h.id}/rooms/${roomId}`;
        await setDoc(doc(db, "hostels", h.id, "rooms", roomId), {
          id: roomId,
          roomNumber: i.toString(),
          capacity: i % 2 === 0 ? 2 : 3,
          occupancy: 0,
          type: i % 3 === 0 ? "AC" : "Non-AC",
          price: i % 3 === 0 ? 12000 : 8500,
          createdAt: new Date().toISOString()
        }).catch(e => handleFirestoreError(e, OperationType.WRITE, roomPath));
      }
    }

    // 3. Create Demo Students
    const demoStudents = [
      { id: 'john', name: "John Doe", email: "john@demo.com", role: "student", hostelId: "hostel-a", roomId: "101", course: "Computer Science", phone: "9876543210" },
      { id: 'sarah', name: "Sarah Smith", email: "sarah@demo.com", role: "student", hostelId: "hostel-b", roomId: "105", course: "Biotechnology", phone: "8765432109" },
      { id: 'robert', name: "Robert Wilson", email: "robert@demo.com", role: "student", hostelId: "hostel-a", roomId: "102", course: "Mechanical Eng.", phone: "7654321098" },
      { id: 'michael', name: "Michael Chen", email: "michael@demo.com", role: "student", hostelId: "hostel-a", roomId: "101", course: "Data Science", phone: "6543210987" },
      { id: 'emma', name: "Emma Davis", email: "emma@demo.com", role: "student", hostelId: "hostel-b", roomId: "105", course: "Fine Arts", phone: "5432109876" },
      { id: 'david', name: "David Miller", email: "david@demo.com", role: "student", hostelId: "hostel-a", roomId: "103", course: "Electrical Eng.", phone: "4321098765" },
    ];

    for (const s of demoStudents) {
      const uid = `demo-uid-${s.id}`;
      await setDoc(doc(db, "users", uid), {
        uid,
        email: s.email,
        name: s.name,
        role: "student",
        phone: s.phone,
        createdAt: new Date().toISOString()
      }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${uid}`));

      await setDoc(doc(db, "students", uid), {
        userId: uid,
        studentId: `STU${Math.floor(1000 + Math.random() * 9000)}`,
        hostelId: s.hostelId,
        roomId: s.roomId,
        course: s.course,
        status: "active",
        joinDate: new Date().toISOString(),
        guardianName: "Demo Guardian",
        guardianPhone: "9000000000"
      }).catch(e => handleFirestoreError(e, OperationType.WRITE, `students/${uid}`));

      // 4. Create Fee Records
      await addDoc(collection(db, "fees"), {
        studentId: uid,
        studentName: s.name,
        amount: 8500,
        status: Math.random() > 0.5 ? "paid" : "pending",
        month: "May 2026",
        dueDate: "2026-06-01",
        createdAt: new Date().toISOString()
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, "fees"));
    }

    // 5. Create Complaints
    const complaints = [
      { subject: "Water Leakage", description: "Ceiling leaking in 204", status: "open", studentId: "demo-uid-john", studentName: "John Doe", createdAt: new Date().toISOString() },
      { subject: "Fan Not Working", description: "Regulator is stuck", status: "resolved", studentId: "demo-uid-sarah", studentName: "Sarah Smith", createdAt: new Date().toISOString(), resolution: "Regulator replaced" },
    ];

    for (const c of complaints) {
      await addDoc(collection(db, "complaints"), c).catch(e => handleFirestoreError(e, OperationType.CREATE, "complaints"));
    }

    // 6. Create Announcements
    const announcements = [
      { 
        title: "Welcome to 2026 Session", 
        content: "We are excited to welcome all new and returning students. Please ensure your fee records are updated.",
        target: "all",
        authorName: "System Admin",
        authorId: "system",
        createdAt: new Date().toISOString()
      },
      { 
        title: "Mess Maintenance", 
        content: "Mess will be closed for cleaning this Sunday. Alternative arrangements in Block B.",
        target: "students",
        authorName: "Warden A",
        authorId: "system",
        createdAt: new Date().toISOString()
      }
    ];

    for (const a of announcements) {
      await addDoc(collection(db, "announcements"), a).catch(e => handleFirestoreError(e, OperationType.CREATE, "announcements"));
    }

    return true;
  } catch (error) {
    console.error("Error seeding data:", error);
    return false;
  }
};
