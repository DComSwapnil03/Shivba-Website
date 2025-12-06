const bcrypt = require('bcryptjs');
const {
  Service,
  TeamMember,
  // Value,
  // Event,
  // Gallery,
  // Faq,
  InterestRegistration // <--- IMPORTANT: Import your User Model
} = require('../models'); 

async function seedDatabase() {
  try {
    console.log('🌱 Starting Database Seeding...');

    // ==========================================
    // 1. CREATE ADMIN / TEST USER
    // ==========================================
    // This allows you to login immediately
    const email = 'admin@shivba.com';
    const rawPassword = '123456';
    
    // Check if user exists to avoid duplicates
    const existingUser = await InterestRegistration.findOne({ email });
    
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);

      const testUser = new InterestRegistration({
        name: "Shivba Admin",
        email: email,
        phone: "9999999999",
        password: hashedPassword,
        isVerified: true,
        // Add dummy data for the Dashboard charts/tables
        programs: [
          {
            name: "Shivba Talim (3 Months)",
            status: "active",
            registrationDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
            paymentId: "pay_sample_123"
          }
        ],
        payments: [
          {
            paymentId: "pay_sample_123",
            orderId: "order_sample_123",
            amount: 3000,
            eventName: "Shivba Talim",
            status: "success",
            date: new Date()
          }
        ]
      });

      await testUser.save();
      console.log('✅ Test User Created!');
      console.log(`➡️  Login Email: ${email}`);
      console.log(`➡️  Login Password: ${rawPassword}`);
    } else {
      console.log('ℹ️  Test User already exists (Skipping creation).');
    }

    // ==========================================
    // 2. SEED SERVICES (Sample Data)
    // ==========================================
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany([
        {
          title: "Shivba Talim",
          description: "Traditional wrestling training with modern fitness equipment.",
          icon: "🏋️",
          link: "/services/talim"
        },
        {
          title: "Library",
          description: "A peaceful environment with a vast collection of books.",
          icon: "📚",
          link: "/services/library"
        },
        {
          title: "Hostel",
          description: "Affordable and secure accommodation for students.",
          icon: "🏠",
          link: "/services/hostel"
        }
      ]);
      console.log('✅ Services Seeded');
    }

    // ==========================================
    // 3. SEED TEAM MEMBERS (Sample Data)
    // ==========================================
    const teamCount = await TeamMember.countDocuments();
    if (teamCount === 0) {
      await TeamMember.insertMany([
        { name: "Rahul Patil", role: "Head Coach", image: "https://via.placeholder.com/150" },
        { name: "Amit Deshmukh", role: "Manager", image: "https://via.placeholder.com/150" }
      ]);
      console.log('✅ Team Members Seeded');
    }

    console.log('✨ Database Seeding Completed Successfully.');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
}

module.exports = seedDatabase;