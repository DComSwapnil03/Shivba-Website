import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOOKS_DATA } from './booksData';
import { ADMISSION_DATA } from './admissionData';

// --- ANIMATION VARIANTS ---
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const modalVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } };

const LibraryDashboard = () => {
  // --- UNIFIED STATE MANAGEMENT ---
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]); // This is the MERGED data (The Relational Link)
  
  const [activeTab, setActiveTab] = useState('library_users');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBookToIssue, setSelectedBookToIssue] = useState('');

  // --- INITIALIZE DATA ---
  useEffect(() => {
    setUsers(ADMISSION_DATA);
    setBooks(BOOKS_DATA);
    
    // Simulating some pre-existing merged data (Issued books)
    setTransactions([
      { id: 'TXN-001', seatNo: 1, bookId: 4, issueDate: '2023-10-25', status: 'Active' },
      { id: 'TXN-002', seatNo: 3, bookId: 6, issueDate: '2023-10-26', status: 'Active' }
    ]);
  }, []);

  // --- AUTOMATIC UPDATE LOGIC (The Core Feature) ---
  const handleIssueBook = (e) => {
    e.preventDefault();
    if (!selectedBookToIssue || !selectedUser) return;

    const bookId = parseInt(selectedBookToIssue);
    const newTxn = {
      id: `TXN-${Math.floor(Math.random() * 10000)}`,
      seatNo: selectedUser.seatNo,
      bookId: bookId,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    // 1. Add transaction
    setTransactions([newTxn, ...transactions]);
    
    // 2. Automatically update book status to "Issued" so no one else can take it
    setBooks(books.map(b => b.id === bookId ? { ...b, status: 'Issued' } : b));
    
    setSelectedBookToIssue('');
  };

  const handleReturnBook = (txnId, bookId) => {
    // 1. Mark transaction as returned
    setTransactions(transactions.map(t => t.id === txnId ? { ...t, status: 'Returned' } : t));
    
    // 2. Automatically update book status back to "Available"
    setBooks(books.map(b => b.id === bookId ? { ...b, status: 'Available' } : b));
  };

  // --- DERIVED DATA (Merging on the fly for the UI) ---
  const activeIssuesForSelectedUser = selectedUser 
    ? transactions.filter(t => t.seatNo === selectedUser.seatNo && t.status === 'Active')
    : [];

  const historyForSelectedUser = selectedUser
    ? transactions.filter(t => t.seatNo === selectedUser.seatNo && t.status === 'Returned')
    : [];

  const availableBooks = books.filter(b => b.status === 'Available');

  // --- RENDERERS ---
  return (
    <motion.div className="dashboard-container" initial="hidden" animate="visible" variants={containerVariants}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');
        .dashboard-container { min-height: 100vh; font-family: 'Montserrat', sans-serif; background: #f3f4f6; padding: 2rem; }
        h1, h2, h3 { font-family: 'Cinzel', serif; letter-spacing: 0.05em; color: #1a1a1a; }
        .dash-header { margin-bottom: 2rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-left: 4px solid #ea580c; }
        .content-card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        
        .tabs { display: flex; gap: 15px; border-bottom: 2px solid #eee; margin-bottom: 20px; }
        .tab-btn { background: none; border: none; padding-bottom: 10px; cursor: pointer; font-weight: bold; font-size: 1rem; color: #888; border-bottom: 3px solid transparent; }
        .tab-btn.active { color: #ea580c; border-bottom-color: #ea580c; }
        
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 12px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
        td { padding: 12px; border-bottom: 1px solid #f3f4f6; }
        .hover-row:hover { background-color: #f9fafb; cursor: pointer; }
        
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
        .status-available { background: #dcfce7; color: #166534; }
        .status-issued { background: #fee2e2; color: #991b1b; }
        .status-maintenance { background: #fef9c3; color: #854d0e; }

        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; }
        .modal-content { background: white; width: 90%; max-width: 800px; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
        .modal-header { background: #1a1a1a; color: white; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .modal-body { padding: 1.5rem; overflow-y: auto; background: #f9fafb; }
        
        .issue-form { display: flex; gap: 10px; margin-bottom: 2rem; background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb; }
        .issue-select { flex: 1; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-family: inherit; }
        .btn-primary { background: #ea580c; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .btn-primary:disabled { background: #ccc; cursor: not-allowed; }
        .btn-return { background: #1f2937; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
        
        .book-list-item { display: flex; justify-content: space-between; align-items: center; background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 10px; }
      `}</style>

      <div className="dash-header">
        <h1>Library Operations System</h1>
        <p style={{color:'#6b7280'}}>Unified view of Seats, Users, and Inventory</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{color:'#6b7280', fontSize:'0.85rem', fontWeight:'bold', textTransform:'uppercase'}}>Occupied Seats</div>
          <div style={{fontSize:'2rem', fontWeight:'bold'}}>{users.length}</div>
        </div>
        <div className="stat-card">
          <div style={{color:'#6b7280', fontSize:'0.85rem', fontWeight:'bold', textTransform:'uppercase'}}>Books Available</div>
          <div style={{fontSize:'2rem', fontWeight:'bold', color:'#166534'}}>{availableBooks.length}</div>
        </div>
        <div className="stat-card">
          <div style={{color:'#6b7280', fontSize:'0.85rem', fontWeight:'bold', textTransform:'uppercase'}}>Active Issues</div>
          <div style={{fontSize:'2rem', fontWeight:'bold', color:'#991b1b'}}>{transactions.filter(t => t.status === 'Active').length}</div>
        </div>
      </div>

      <div className="content-card">
        <div className="tabs">
          <button className={`tab-btn ${activeTab==='library_users'?'active':''}`} onClick={()=>setActiveTab('library_users')}>Admitted Members (Seats)</button>
          <button className={`tab-btn ${activeTab==='inventory'?'active':''}`} onClick={()=>setActiveTab('inventory')}>Book Inventory</button>
        </div>

        {activeTab === 'library_users' && (
          <table>
            <thead>
              <tr><th>Seat No</th><th>Member Name</th><th>Enroll Date</th><th>Active Books</th></tr>
            </thead>
            <tbody>
              {users.map(user => {
                const activeCount = transactions.filter(t => t.seatNo === user.seatNo && t.status === 'Active').length;
                return (
                  <tr key={user.seatNo} className="hover-row" onClick={() => setSelectedUser(user)}>
                    <td style={{fontWeight:'bold', color:'#ea580c'}}>Seat {user.seatNo}</td>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.enrollDate}</td>
                    <td>
                      {activeCount > 0 
                        ? <span className="status-badge status-issued">{activeCount} Issued</span>
                        : <span className="status-badge status-available">Clear</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'inventory' && (
          <table>
            <thead>
              <tr><th>ID</th><th>Title</th><th>Author</th><th>Category</th><th>Status</th></tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id}>
                  <td style={{color:'#6b7280'}}>#{book.id}</td>
                  <td><strong>{book.title}</strong></td>
                  <td>{book.author}</td>
                  <td>{book.category}</td>
                  <td><span className={`status-badge status-${book.status.toLowerCase()}`}>{book.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- RELATIONAL MERGE MODAL (Issues & Returns) --- */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setSelectedUser(null)}>
            <motion.div className="modal-content" variants={modalVariants} initial="hidden" animate="visible" exit="exit" onClick={e => e.stopPropagation()}>
              
              <div className="modal-header">
                <div>
                  <h2 style={{margin:0}}>Seat {selectedUser.seatNo}: {selectedUser.name}</h2>
                  <span style={{fontSize:'0.85rem', opacity:0.8}}>Enrolled: {selectedUser.enrollDate}</span>
                </div>
                <button onClick={() => setSelectedUser(null)} style={{background:'none', border:'none', color:'white', fontSize:'1.5rem', cursor:'pointer'}}>✕</button>
              </div>

              <div className="modal-body">
                
                {/* AUTO-UPDATING ISSUE FORM */}
                <h3>Issue New Book</h3>
                <form className="issue-form" onSubmit={handleIssueBook}>
                  <select 
                    className="issue-select" 
                    value={selectedBookToIssue} 
                    onChange={e => setSelectedBookToIssue(e.target.value)}
                  >
                    <option value="">-- Select a Book from Available Inventory --</option>
                    {availableBooks.map(b => (
                      <option key={b.id} value={b.id}>ID: {b.id} - {b.title} ({b.author})</option>
                    ))}
                  </select>
                  <button type="submit" className="btn-primary" disabled={!selectedBookToIssue}>Issue Book</button>
                </form>

                {/* CURRENTLY ISSUED (The merged data updating live) */}
                <h3 style={{color:'#991b1b', borderBottom:'1px solid #ddd', paddingBottom:'10px'}}>Currently Holding</h3>
                {activeIssuesForSelectedUser.length === 0 ? (
                  <p style={{color:'#6b7280', fontStyle:'italic'}}>No books currently issued.</p>
                ) : (
                  activeIssuesForSelectedUser.map(txn => {
                    const book = books.find(b => b.id === txn.bookId);
                    return (
                      <div key={txn.id} className="book-list-item" style={{borderLeft:'4px solid #991b1b'}}>
                        <div>
                          <div style={{fontWeight:'bold'}}>{book.title}</div>
                          <div style={{fontSize:'0.85rem', color:'#6b7280'}}>ID: {book.id} | Issued: {txn.issueDate}</div>
                        </div>
                        <button className="btn-return" onClick={() => handleReturnBook(txn.id, book.id)}>Mark Returned</button>
                      </div>
                    );
                  })
                )}

                {/* HISTORY */}
                <h3 style={{color:'#166534', borderBottom:'1px solid #ddd', paddingBottom:'10px', marginTop:'2rem'}}>Return History</h3>
                {historyForSelectedUser.length === 0 ? (
                  <p style={{color:'#6b7280', fontStyle:'italic'}}>No past returns.</p>
                ) : (
                  historyForSelectedUser.map(txn => {
                    const book = books.find(b => b.id === txn.bookId);
                    return (
                      <div key={txn.id} className="book-list-item" style={{opacity:0.7}}>
                        <div>
                          <div style={{fontWeight:'bold'}}>{book.title}</div>
                          <div style={{fontSize:'0.85rem', color:'#6b7280'}}>ID: {book.id} | Issued: {txn.issueDate}</div>
                        </div>
                        <span style={{fontSize:'0.85rem', color:'#166534', fontWeight:'bold'}}>Returned</span>
                      </div>
                    );
                  })
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LibraryDashboard;