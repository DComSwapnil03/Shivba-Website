// --- 1. SAFE REQUIRE UTILITY ---
// Function to safely require modules and exit gracefully if a critical module is missing
const pathLib = require('path');
const safeRequire = (relPath, name) => {
  try {
    // Resolve a path relative to this index file to avoid resolution ambiguity
    const resolved = relPath.startsWith('.') ? pathLib.join(__dirname, relPath) : relPath;
    return require(resolved);
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') {
      console.error(`\n❌ FATAL ERROR: Cannot find model file for "${name}" at path: "${relPath}" (resolved: "${pathLib.join(__dirname, relPath)}").`);
      console.error('Please check if the model file exists and the filename matches exactly.');
      process.exit(1);
    }
    throw err; // Re-throw any other type of error (like syntax errors in the model file)
  }
};

// --- 2. EXPORT ALL MODELS ---
module.exports = {
  Event: safeRequire("./Event", "Event"),
  Gallery: safeRequire("./Gallery", "Gallery"),
  Testimonial: safeRequire("./Testimonial", "Testimonial"),
  Faq: safeRequire("./Faq", "Faq"),
  ContactMessage: safeRequire("./ContactMessage", "ContactMessage"),
  
  // FIXED: Changed 'Registration' to 'EventRegistration' to match your Route code
  EventRegistration: safeRequire("./EventRegistration", "EventRegistration"),
  
  InterestRegistration: safeRequire("./InterestRegistration", "InterestRegistration"),
  Service: safeRequire("./Service", "Service"),
  TeamMember: safeRequire("./TeamMember", "TeamMember"),
  Value: safeRequire("./Value", "Value"),
  Member: safeRequire("./Member", "Member"),
};