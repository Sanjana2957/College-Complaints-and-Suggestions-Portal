# College Complaint & Suggestion Portal

This project uses React, plain CSS, Node.js, Express, MongoDB, and Mongoose.

## Project structure

```text
client/
  src/
    components/
      AdminDashboard.jsx
      AdminAccountPage.jsx
      AdminAccountForm.jsx
      Login.jsx
      Register.jsx
      StudentDashboard.jsx
    api.js
    App.jsx
    App.css
    main.jsx
  package.json
server/
  middleware/auth.js
  models/Complaint.js
  models/User.js
  scripts/createAdmin.js
  .env.example
  package.json
  server.js
```

`App.jsx` checks the login cookie and shows the correct login, protected admin-account page, or dashboard. The student components handle registration, login, submissions, and private history. `AdminDashboard.jsx` displays real statistics, filters, and status controls. `AdminAccountPage.jsx` checks the current backend session before showing `AdminAccountForm.jsx`. `api.js` keeps frontend requests in one simple helper.

`server.js` contains authentication, complaint, and protected admin-account API routes. `User.js` stores students and admins with hashed passwords. `Complaint.js` stores each submission and its student account reference. `auth.js` protects routes using the HTTP-only JWT cookie. `createAdmin.js` is the private setup script for the first admin account. `AdminAccountForm.jsx` is available only inside the authenticated admin dashboard.

## Setup

### 1. Configure MongoDB

Start local MongoDB and MongoDB Compass, or use MongoDB Atlas. The database name is `college_portal`.

Copy `server/.env.example` to `server/.env` and set:

```env
MONGO_URI=mongodb://127.0.0.1:27017/college_portal
PORT=5000
JWT_SECRET=use_a_long_random_secret_here
```

Do not commit `server/.env`.

### 2. Install backend packages

In the first VS Code PowerShell terminal:

```powershell
Set-Location "C:\Users\prasa\OneDrive\Desktop\Complaints & Suggestions Portal\server"
npm install
```

### 3. Create the first admin

Run this once after MongoDB is available:

```powershell
npm run create-admin
```

Enter an admin name, email, and a password of at least six characters. There is no public admin registration page.

### 4. Start the backend

```powershell
node --watch server.js
```

Keep this terminal open. The API runs at `http://localhost:5000`.

### 5. Install and start the frontend

Open a second VS Code PowerShell terminal:

```powershell
Set-Location "C:\Users\prasa\OneDrive\Desktop\Complaints & Suggestions Portal\client"
npm install
node .\node_modules\vite\bin\vite.js
```

Open `http://localhost:5173`.

The project folder contains `&`, so the direct Vite command is more reliable in Windows PowerShell than the usual `npm run dev` command.

## Test checklist

1. Register a student with a name, roll number, college email, and password.
2. Log out and log in using either the roll number or email.
3. Submit a complaint or suggestion.
4. Confirm the student sees only their own submission.
5. Try registering the same email or roll number; it should be rejected.
6. Log in through the separate Admin Login tab.
7. Check total, Pending, In Progress, and Resolved counts.
8. Filter submissions by category and status.
9. Select a different status and click **Save Status**. The success message confirms that the MongoDB document was updated.
10. Click **Refresh** in the student dashboard and confirm the latest status is visible.
11. Use **Create New Admin Account** while logged in as an admin.
12. Log out and log in with the new admin account.
13. Log out; protected dashboard data should no longer load.

Passwords are hashed with `bcryptjs` and are never stored in the browser or database as plain text. Authentication uses an HTTP-only cookie, and backend middleware checks both login state and role.
