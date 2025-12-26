import React, { useState } from 'react';

const AdminDataPanel = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    // --- 1. HANDLE FILE SELECTION ---
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage(''); // Clear previous messages
    };

    // --- 2. IMPORT FUNCTION (Upload to Server) ---
    const handleImport = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setMessage('❌ Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setMessage('');

        try {
            // Adjust URL if your server runs on a different port (e.g., http://localhost:5000)
            const response = await fetch('http://localhost:5000/api/data/import-members', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`✅ Success: ${data.message}`);
                setFile(null); // Reset file input
                // Optional: Refresh your data list here if you have one
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

    // --- 3. EXPORT FUNCTION (Download from Server) ---
    const handleExport = () => {
        // Direct browser download
        // Ensure this URL matches your backend port
        window.open('http://localhost:5000/api/data/export-members', '_blank');
    };

    return (
        <div className="card p-4 shadow-sm mt-4">
            <h4>Data Management</h4>
            <p className="text-muted">Import members from Excel or export current database.</p>
            
            <div className="d-flex flex-column gap-3">
                
                {/* IMPORT SECTION */}
                <div className="border p-3 rounded">
                    <h5>📂 Import Data</h5>
                    <form onSubmit={handleImport} className="d-flex gap-2 align-items-center">
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            className="form-control" 
                            disabled={uploading}
                        />
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={uploading || !file}
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </form>
                    <small className="text-muted">Supported: .xlsx, .xls, .csv</small>
                </div>

                {/* EXPORT SECTION */}
                <div className="border p-3 rounded d-flex justify-content-between align-items-center">
                    <div>
                        <h5>⬇️ Export Data</h5>
                        <small className="text-muted">Download all members as an Excel sheet.</small>
                    </div>
                    <button onClick={handleExport} className="btn btn-success">
                        Download Excel
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