module.exports = {
  async up(queryInterface, Sequelize) {
    // Get existing users
    const users = await queryInterface.sequelize.query(
      'SELECT id, role FROM Users WHERE role IN ("doctor", "patient")',
      { type: Sequelize.QueryTypes.SELECT }
    )

    const doctors = users.filter(u => u.role === 'doctor')
    const patients = users.filter(u => u.role === 'patient')

    if (doctors.length === 0 || patients.length === 0) {
      console.log('No doctors or patients found, skipping appointment seeding')
      return
    }

    const appointments = []
    const now = new Date()
    
    // Create appointments for today and upcoming days
    for (let i = 0; i < 10; i++) {
      const appointmentDate = new Date(now)
      appointmentDate.setDate(now.getDate() + Math.floor(i / 3)) // Spread across multiple days
      appointmentDate.setHours(9 + (i % 8), (i % 2) * 30, 0, 0) // Different times

      const statuses = ['pending', 'confirmed', 'completed', 'in_progress']
      const types = ['video', 'followup', 'initial']
      
      appointments.push({
        id: `550e8400-e29b-41d4-a716-44665544${String(i).padStart(4, '0')}`,
        patientId: patients[i % patients.length].id,
        doctorId: doctors[i % doctors.length].id,
        appointmentDate: appointmentDate,
        duration: 30 + (i % 3) * 15, // 30, 45, or 60 minutes
        type: types[i % types.length],
        status: statuses[i % statuses.length],
        symptoms: [
          'Chest pain and shortness of breath',
          'Regular checkup and blood pressure monitoring',
          'Skin rash and itching',
          'Headaches and dizziness',
          'Follow-up on previous treatment',
          'Stomach pain and nausea',
          'Joint pain and stiffness',
          'Fatigue and sleep issues'
        ][i % 8],
        fee: 75.00,
        paymentStatus: 'paid',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    await queryInterface.bulkInsert('Appointments', appointments)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Appointments', null, {})
  },
}