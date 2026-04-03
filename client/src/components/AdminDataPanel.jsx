import React, { useState } from 'react';

// --- CONFIGURATION ---
// This ensures it uses localhost:8000 when you are testing locally
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AdminDataPanel = ({ refreshDashboard }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [importType, setImportType] = useState('users'); // Tracks which tab we are importing to

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage(''); 
    };

    // --- 1. UPDATED IMPORT FUNCTION ---
    const handleImport = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setMessage('❌ Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', importType); // Tells the backend which collection to use

        setUploading(true);
        setMessage('');

        try {
            // Updated endpoint to match the dataController logic
            const response = await fetch(`${API_BASE_URL}/api/data/import`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`✅ Success: ${data.message}`);
                setFile(null); 
                // Reset file input in the DOM
                e.target.reset();
                // Trigger dashboard refresh if the prop exists
                if (refreshDashboard) refreshDashboard(importType);
            } else {
                setMessage(`⚠️ Error: ${data.message}`);
            }
        } catch (error) {
            setMessage('❌ Network Error: Could not connect to server.');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    // --- 2. UPDATED EXPORT FUNCTION ---
    const handleExport = () => {
        // Points to the dynamic export route we built in the controller
        const exportUrl = `${API_BASE_URL}/api/data/export?type=${importType}`;
        window.open(exportUrl, '_blank');
    };

    return (
        <div className="card p-4 shadow-sm mt-4">
            <h4>Data Management</h4>
            <p className="text-muted">Import members from Excel or export current database.</p>
            
            <div className="d-flex flex-column gap-3">
                
                {/* SELECT DATA CATEGORY */}
                <div className="mb-2">
                    <label className="form-label fw-bold">Select Category:</label>
                    <select 
                        className="form-select" 
                        value={importType} 
                        onChange={(e) => setImportType(e.target.value)}
                    >
                        <option value="users">All App Users</option>
                        <option value="library_users">Library Users</option>
                        <option value="library_books">Issued Books</option>
                        <option value="events">Event Registrations</option>
                    </select>
                </div>

                {/* IMPORT SECTION */}
                <div className="border p-3 rounded bg-light">
                    <h5>📂 Import Data</h5>
                    <form onSubmit={handleImport} className="d-flex flex-column gap-2">
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            className="form-control" 
                            disabled={uploading}
                        />
                        <button 
                            type="submit" 
                            className="btn btn-primary w-100" 
                            disabled={uploading || !file}
                        >
                            {uploading ? 'Processing File...' : `Upload to ${importType.replace('_', ' ')}`}
                        </button>
                    </form>
                    <small className="text-muted mt-1 d-block">Supported: .xlsx, .xls, .csv</small>
                </div>

                {/* EXPORT SECTION */}
                <div className="border p-3 rounded d-flex justify-content-between align-items-center">
                    <div>
                        <h5>⬇️ Export Data</h5>
                        <small className="text-muted">Download {importType.replace('_', ' ')} as Excel.</small>
                    </div>
                    <button onClick={handleExport} className="btn btn-success">
                        Download Sheet
                    </button>
                </div>

                {/* STATUS MESSAGE */}
                {message && (
                    <div className={`alert ${message.includes('Success') ? 'alert-success' : 'alert-danger'} mt-2`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDataPanel;