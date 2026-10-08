import React from 'react';

// This project uses index.html + app.js for the live admin UI.
// This React component is kept dependency-free so it can also be used in a React build.
export default function AdminDashboard() {
  return (
    <section className="page-body">
      <div className="card">
        <h2>Admin Dashboard</h2>
        <p>The full admin panel is implemented in the main HTML/JavaScript application.</p>
      </div>
    </section>
  );
}
