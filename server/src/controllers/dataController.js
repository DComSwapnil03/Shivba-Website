const xlsx = require('xlsx');
const InterestRegistration = require('../models/InterestRegistration'); // Users
const EventRegistration = require('../models/EventRegistration');       // Events
const ContactMessage = require('../models/ContactMessage');             // Messages
const LibraryUser = require('../models/LibraryUser');                   // Library Admissions
const LibraryBook = require('../models/LibraryBook');                   // Library Books

// Helper function to map the string 'type' to the correct Mongoose Model
const getModelByType = (type) => {
    switch (type) {
        case 'users': return InterestRegistration;
        case 'events': return EventRegistration;
        case 'messages': return ContactMessage;
        case 'library_users': return LibraryUser;
        case 'library_books': return LibraryBook;
        default: return null;
    }
};

// --- 1. IMPORT: Excel -> MongoDB ---
exports.importMembers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const { type } = req.body; 
        const TargetModel = getModelByType(type);

        if (!TargetModel) {
            return res.status(400).json({ success: false, message: "Invalid import type specified." });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(sheet, { defval: "" });

        if (rawData.length === 0) {
            return res.status(400).json({ success: false, message: "Sheet is empty" });
        }

        const result = await TargetModel.insertMany(rawData, { ordered: false });

        res.status(200).json({ 
            success: true, 
            message: `Success! Imported ${result.length} records.`,
            count: result.length
        });

    } catch (error) {
        if (error.code === 11000) {
            const insertedCount = error.result ? error.result.nInserted : "some";
            return res.status(200).json({ 
                success: true, 
                message: `Partial Import: Added ${insertedCount} records.`,
                warning: "Skipped duplicates."
            });
        }
        res.status(500).json({ success: false, message: "Import failed: " + error.message });
    }
};

// --- 2. EXPORT: MongoDB -> Excel ---
exports.exportData = async (req, res) => {
    try {
        const { type } = req.query; 
        let data = [];
        let sheetName = "Data";

        if (type === 'users') {
            data = await InterestRegistration.find({}).select('-password -__v -otp -verifyToken').sort({_id:-1}).lean();
            sheetName = "All_Users";
        } else if (type === 'events') {
            data = await EventRegistration.find({}).select('-__v').sort({registeredAt:-1}).lean();
            sheetName = "Event_Registrations";
        } else if (type === 'messages') {
            data = await ContactMessage.find({}).select('-__v').sort({createdAt:-1}).lean();
            sheetName = "Contact_Messages";
        } else if (type === 'library_users') {
            data = await LibraryUser.find({}).select('-__v').sort({enrollDate:-1}).lean();
            sheetName = "Library_Admissions";
        } else if (type === 'library_books') {
            data = await LibraryBook.find({}).select('-__v').sort({issueDate:-1}).lean();
            sheetName = "Issued_Books";
        } else {
            return res.status(400).json({ success: false, message: "Invalid export type" });
        }

        if (data.length === 0) {
            return res.status(404).json({ success: false, message: `No ${type} found to export` });
        }

        const worksheet = xlsx.utils.json_to_sheet(data);
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
        const { type } = req.query; 

        if (type === 'users') {
            const data = await InterestRegistration.find({}).select('-password -__v -otp -verifyToken').sort({ _id: -1 }).limit(50);
            return res.status(200).json(data);
        } else if (type === 'events') {
            const data = await EventRegistration.find({}).sort({ registeredAt: -1 }).limit(50);
            return res.status(200).json(data);
        } else if (type === 'messages') {
            const data = await ContactMessage.find({}).sort({ createdAt: -1 }).limit(50);
            return res.status(200).json(data);
        } else if (type === 'library_users') {
            const data = await LibraryUser.find({}).sort({ enrollDate: -1 }).limit(50);
            return res.status(200).json(data);
        } else if (type === 'library_books') {
            const data = await LibraryBook.find({}).sort({ issueDate: -1 }).limit(50);
            return res.status(200).json(data);
        } else {
             // Default: Return stats count
             const userCount = await InterestRegistration.countDocuments();
             const eventCount = await EventRegistration.countDocuments();
             const msgCount = await ContactMessage.countDocuments();
             const libUserCount = await LibraryUser.countDocuments();
             const issuedBooksCount = await LibraryBook.countDocuments();
             
             return res.json({ userCount, eventCount, msgCount, libUserCount, issuedBooksCount });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 4. DELETE: Remove Item by ID ---
exports.deleteData = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query; 

        if (!id || !type) {
            return res.status(400).json({ success: false, message: "Missing ID or Type" });
        }

        const TargetModel = getModelByType(type);

        if (!TargetModel) {
            return res.status(400).json({ success: false, message: "Invalid type" });
        }

        const result = await TargetModel.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        res.status(200).json({ success: true, message: "Deleted successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};