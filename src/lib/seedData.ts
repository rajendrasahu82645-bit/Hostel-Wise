import { collection, doc, setDoc, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "./firebase";

export const seedInitialData = async () => {
  try {
    // Check if data already exists to avoid duplication
    const hostelCheck = await getDocs(query(collection(db, "hostels"), limit(1)));
    if (!hostelCheck.empty) {
      console.log("Data already exists. Skipping seed.");
      return { success: false, message: "Data already exists" };
    }

    console.log("Starting data seed...");

    // 1. Create Hostels
    const hostels = [
      { id: "h1", name: "Phoenix Heights (Boys)", address: "North Campus, Sector 4", totalRooms: 50 },
      { id: "h2", name: "Serenity Suites (Girls)", address: "South Campus, Sector 9", totalRooms: 40 }
    ];

    for (const h of hostels) {
      await setDoc(doc(db, "hostels", h.id), {
        name: h.name,
        address: h.address,
        totalRooms: h.totalRooms,
        createdAt: new Date().toISOString()
      });
    }

    // 2. Create Rooms for Hostel 1
    const rooms = [
      { id: "h1_101", hostelId: "h1", roomNumber: "101", floor: "1st", type: "Triple", capacity: 3, currentOccupancy: 2, pricePerMonth: 5500, status: "available" },
      { id: "h1_102", hostelId: "h1", roomNumber: "102", floor: "1st", type: "Double", capacity: 2, currentOccupancy: 1, pricePerMonth: 6500, status: "available" },
      { id: "h2_101", hostelId: "h2", roomNumber: "101", floor: "1st", type: "Double", capacity: 2, currentOccupancy: 2, pricePerMonth: 6800, status: "full" }
    ];

    for (const r of rooms) {
      await setDoc(doc(db, "rooms", r.id), {
        ...r,
        createdAt: new Date().toISOString()
      });
    }

    // 3. Create Students
    const students = [
      { 
        uid: "stud_1", 
        name: "Alex Johnson", 
        email: "alex.j@example.com", 
        role: "student",
        studentId: "STU001",
        course: "Computer Science",
        phone: "9876543210",
        guardianName: "Robert Johnson",
        guardianPhone: "9876543211",
        hostelId: "h1",
        roomId: "101",
        status: "active",
        joinDate: "2024-01-15"
      },
      { 
        uid: "stud_2", 
        name: "Sarah Miller", 
        email: "sarah.m@example.com", 
        role: "student",
        studentId: "STU002",
        course: "Architecture",
        phone: "8765432109",
        guardianName: "Jane Miller",
        guardianPhone: "8765432108",
        hostelId: "h1",
        roomId: "101",
        status: "active",
        joinDate: "2024-02-01"
      },
      { 
        uid: "stud_3", 
        name: "Elena Rodriguez", 
        email: "elena.r@example.com", 
        role: "student",
        studentId: "STU003",
        course: "Interior Design",
        phone: "7654321098",
        guardianName: "Carlos Rodriguez",
        guardianPhone: "7654321097",
        hostelId: "h2",
        roomId: "101",
        status: "active",
        joinDate: "2023-08-20"
      }
    ];

    for (const s of students) {
      // Add to users collection
      await setDoc(doc(db, "users", s.uid), {
        uid: s.uid,
        name: s.name,
        email: s.email,
        role: "student",
        createdAt: new Date().toISOString()
      });

      // Add to students collection
      const { uid, name, email, ...studentMeta } = s;
      await setDoc(doc(db, "students", uid), {
        ...studentMeta,
        createdAt: new Date().toISOString()
      });
    }

    console.log("Seed completed successfully!");
    return { success: true, message: "System initialized with sample data" };
  } catch (error) {
    console.error("Seed failed:", error);
    return { success: false, message: "Failed to initialize data" };
  }
};
