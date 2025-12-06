import React from 'react';

function OwnerPage({ setPage }) {
  // MOCK: Real security happens on the backend (Node/Express).
  // Without a token check here, this is just a UI layer.
  
  return (
    <div className="owner-dashboard animate-fadeIn" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Owner Dashboard</h1>
        <button className="shivba-primary-btn" onClick={() => setPage({ name: 'home' })}>Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {/* Stat Cards */}
        <div className="home-card" style={{ padding: '20px' }}>
          <h3>Total Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>1,240</p>
        </div>
        <div className="home-card" style={{ padding: '20px' }}>
          <h3>Active Subscriptions</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'green' }}>85</p>
        </div>
        <div className="home-card" style={{ padding: '20px' }}>
          <h3>Pending Approvals</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'orange' }}>12</p>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
          <button className="shivba-secondary-btn">Manage Events</button>
          <button className="shivba-secondary-btn">User Database</button>
          <button className="shivba-secondary-btn">Financial Reports</button>
        </div>
      </div>
    </div>
  );
}

export default OwnerPage;