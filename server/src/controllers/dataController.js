const xlsx = require('xlsx');
const InterestRegistration = require('../models/InterestRegistration'); // Users
const EventRegistration = require('../models/EventRegistration');       // Events
const ContactMessage = require('../models/ContactMessage');             // Messages

// --- 1. IMPORT: Excel -> MongoDB (Users Only) ---
exports.importMembers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(sheet, { defval: "" });

        if (rawData.length === 0) {
            return res.status(400).json({ success: false, message: "Sheet is empty" });
        }

        // Bulk Insert
        const result = await InterestRegistration.insertMany(rawData, { ordered: false });

        res.status(200).json({ 
            success: true, 
            message: `Success! Imported ${result.length} new members.`,
        });

    } catch (error) {
        if (error.code === 11000) {
            const insertedCount = error.result ? error.result.nInserted : "some";
            return res.status(200).json({ 
                success: true, 
                message: `Partial Import: Added ${insertedCount} members.`,
                warning: "Skipped duplicates (emails/phones already exist)."
            });
        }
        res.status(500).json({ success: false, message: "Import failed: " + error.message });
    }
};

// --- 2. EXPORT: MongoDB -> Excel (Dynamic Type) ---
exports.exportData = async (req, res) => {
    try {
        const { type } = req.query; // 'users', 'events', 'messages'
        let data = [];
        let sheetName = "Data";

        // Fetch data based on type
        if (type === 'users') {
            data = await InterestRegistration.find({})
                .select('-password -__v -otp -verifyToken')
                .sort({_id:-1})
                .lean();
            sheetName = "All_Users";
        } else if (type === 'events') {
            data = await EventRegistration.find({})
                .select('-__v')
                .sort({registeredAt:-1})
                .lean();
            sheetName = "Event_Registrations";
        } else if (type === 'messages') {
            data = await ContactMessage.find({})
                .select('-__v')
                .sort({createdAt:-1})
                .lean();
            sheetName = "Contact_Messages";
        } else {
            return res.status(400).json({ success: false, message: "Invalid export type" });
        }

        if (data.length === 0) {
            return res.status(404).json({ success: false, message: `No ${type} found to export` });
        }

        // Convert to Sheet
        const worksheet = xlsx.utils.json_to_sheet(data);
        
        // Auto-width for columns
        const wscols = [{wch:20}, {wch:30}, {wch:15}, {wch:20}, {wch:20}];
        worksheet['!cols'] = wscols;

        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

        const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        const timestamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Disposition', `attachment; filename=Shivba_${sheetName}_${timestamp}.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(excelBuffer);

    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({ success: false, message: "Export failed: " + error.message });
    }
};

// --- 3. GET DATA (For Dashboard Tables) ---
exports.getDashboardData = async (req, res) => {
    try {
        const { type } = req.query; // 'users', 'events', 'messages'
        let data = [];

        if (type === 'users') {
            data = await InterestRegistration.find({})
                .select('-password -__v -otp -verifyToken')
                .sort({ _id: -1 })
                .limit(50);
        } else if (type === 'events') {
            data = await EventRegistration.find({})
                .sort({ registeredAt: -1 })
                .limit(50);
        } else if (type === 'messages') {
            data = await ContactMessage.find({})
                .sort({ createdAt: -1 })
                .limit(50);
        } else {
             // Default: Return stats count
             const userCount = await InterestRegistration.countDocuments();
             const eventCount = await EventRegistration.countDocuments();
             const msgCount = await ContactMessage.countDocuments();
             return res.json({ userCount, eventCount, msgCount });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 4. DELETE: Remove Item by ID (NEW) ---
exports.deleteData = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query; // 'users', 'events', 'messages'

        if (!id || !type) {
            return res.status(400).json({ success: false, message: "Missing ID or Type" });
        }

        let result;
        // Determine which collection to delete from based on 'type'
        if (type === 'users') {
            result = await InterestRegistration.findByIdAndDelete(id);
        } else if (type === 'events') {
            result = await EventRegistration.findByIdAndDelete(id);
        } else if (type === 'messages') {
            result = await ContactMessage.findByIdAndDelete(id);
        } else {
            return res.status(400).json({ success: false, message: "Invalid type" });
        }

        if (!result) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        res.status(200).json({ success: true, message: "Deleted successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};