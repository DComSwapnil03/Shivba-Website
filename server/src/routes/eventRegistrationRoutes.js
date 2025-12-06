const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

// --- SAFE REQUIRE UTILITY ---
const safeRequire = (relativePath) => {
    try {
        const fullPath = path.join(__dirname, '../../', relativePath);
        return require(relativePath.startsWith('.') ? fullPath : relativePath);
    } catch (err) {
        return require('../models/EventRegistration');
    }
};

const EventRegistration = require('../models/EventRegistration');

// --- EXCEL CONFIGURATION ---
const DATA_DIR = path.join(__dirname, '../../data');
const EXCEL_FILE = path.join(DATA_DIR, 'Event_Registrations.xlsx');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (err) {
        console.error("⚠️ Could not create data directory:", err);
    }
}

// ==========================================
// 📅 ROUTE: EVENT REGISTRATION
// Full Path: POST /api/events/register
// ==========================================
router.post('/events/register', async (req, res) => {
  try {
    const { name, email, phone, eventId, eventTitle } = req.body;

    // 1. Validation
    if (!name || !email || !phone || !eventId || !eventTitle) {
      return res
        .status(400)
        .json({ message: 'Missing required registration fields.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    // 2. Duplicate Check (MongoDB)
    const existingReg = await EventRegistration.findOne({ 
        email: lowerEmail, 
        eventId: eventId 
    });

    if (existingReg) {
        return res.status(409).json({ 
            message: 'You have already registered for this event!' 
        });
    }

    // 3. Save to MongoDB
    const reg = new EventRegistration({
      name: name.trim(),
      email: lowerEmail,
      phone: phone.trim(),
      eventId,
      eventTitle: eventTitle.trim(),
      registrationDate: new Date()
    });

    await reg.save();

    // 4. Save to Excel
    try {
        const newEntry = {
            'Event ID': eventId,
            'Event Name': eventTitle,
            'Participant Name': name,
            'Email': lowerEmail,
            'Phone': phone,
            'Registration Date': new Date().toLocaleString('en-IN')
        };

        let workbook;
        let worksheet;

        if (fs.existsSync(EXCEL_FILE)) {
            // Append to existing file
            workbook = xlsx.readFile(EXCEL_FILE);
            const sheetName = workbook.SheetNames[0];
            worksheet = workbook.Sheets[sheetName];
            
            const existingData = xlsx.utils.sheet_to_json(worksheet);
            existingData.push(newEntry);
            worksheet = xlsx.utils.json_to_sheet(existingData);
            
            workbook.Sheets[sheetName] = worksheet;
        } else {
            // Create new file
            workbook = xlsx.utils.book_new();
            worksheet = xlsx.utils.json_to_sheet([newEntry]);
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Registrations');
        }

        xlsx.writeFile(workbook, EXCEL_FILE);
        console.log(`📊 Added to Excel: ${lowerEmail}`);

    } catch (excelError) {
        console.error("⚠️ Excel Error (Data saved to DB though):", excelError);
        // We don't fail the request here, because DB save was successful
    }

    console.log(`✅ Event Reg Success: ${lowerEmail} -> ${eventTitle}`);

    return res
      .status(201)
      .json({ 
          success: true,
          message: 'Event registration saved successfully.',
          data: { eventTitle, email: lowerEmail }
      });

  } catch (err) {
    console.error('Event registration error:', err);
    return res
      .status(500)
      .json({ message: 'Server error while saving registration.' });
  }
});

module.exports = router;