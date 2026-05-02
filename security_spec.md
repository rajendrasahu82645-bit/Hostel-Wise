# Security Specification - HostelWise

## Data Invariants
1. A **User** must have a valid `uid`, `email`, `name`, and `role`.
2. A **Student Profile** must be linked to a valid **User** with the `student` role.
3. **Fees** and **Complaints** must be linked to a valid **Student**.
4. **Rooms** must belong to a valid **Hostel**.
5. **Announcements** have a `target` audience and must only be created by **Admins** or **Wardens**.

## The Dirty Dozen (Attack Vectors)

1. **Identity Spoofing**: User A attempts to create a profile for User B.
2. **Privilege Escalation**: A student attempts to update their own role to 'admin'.
3. **Ghost Fields**: Adding `isVerified: true` to a user document to bypass manual verification.
4. **Orphaned Complaints**: Creating a complaint for a student ID that doesn't exist.
5. **Fee Modification**: A student attempts to change their fee status from 'pending' to 'paid'.
6. **Cross-Tenant Leak**: User A tries to list all complaints in the system (expecting only their own).
7. **Node Poisoning**: Injecting a 1MB string into a `roomNumber` field to cause resource exhaustion.
8. **Outcome Manipulation**: A student marking their own complaint as 'resolved'.
9. **Announcement Hijacking**: A student attempting to create an announcement for 'all'.
10. **ID Poisoning**: Using a 1KB string as a document ID for a hostel.
11. **Relational Breakage**: Creating a room for a hostel that doesn't exist.
12. **Status Shortcutting**: Moving a complaint from 'open' to 'resolved' without passing through 'in-progress' (if state transition is required).

## Test Suite Plan (firestore.rules.test.ts)
- Test unauthorized signup.
- Test student role restriction.
- Test fee access restriction.
- Test announcement creation permissions.
