const bcrypt = require("bcryptjs")

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("password123", 12)

    await queryInterface.bulkInsert("Users", [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        email: "admin@medilinka.com",
        password: hashedPassword,
        name: "Admin User",
        role: "admin",
        isApproved: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        email: "dr.smith@medilinka.com",
        password: hashedPassword,
        name: "Dr. Sarah Smith",
        role: "doctor",
        specialization: "Cardiology",
        licenseNumber: "MD12345",
        phone: "+1-555-0123",
        isApproved: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        email: "pharmacist@medilinka.com",
        password: hashedPassword,
        name: "John Pharmacist",
        role: "pharmacist",
        licenseNumber: "PH67890",
        phone: "+1-555-0124",
        isApproved: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440004",
        email: "patient@medilinka.com",
        password: hashedPassword,
        name: "Jane Patient",
        role: "patient",
        phone: "+1-555-0125",
        isApproved: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {})
  },
}
