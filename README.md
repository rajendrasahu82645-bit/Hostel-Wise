# Hostel-Wise

Hostel-Wise is a web-based hostel management app with role-specific dashboards for administrators, wardens, and students.

## Features

- Role-based dashboards and access
- Student, hostel, and room management
- Fee, complaint, attendance, announcement, visitor, and security pages
- Responsive interface

## Technologies

- React 19 and TypeScript
- Vite
- Tailwind CSS
- Firebase SDK and Firestore configuration

## Run locally

Install Node.js 18, 20, or 22+, then install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Vite prints the local URL when the server is ready (by default, `http://localhost:3000`).

Validate and build for production:

```bash
npm run lint
npm run build
```

Firebase settings are in `firebase-applet-config.json`. The login screen currently provides a demo role selector; choose a role and enter any user ID to open its dashboard.
