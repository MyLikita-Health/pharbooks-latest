module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Appointments", "consultationNotes", {
      type: Sequelize.TEXT,
      allowNull: true,
    })

    await queryInterface.addColumn("Appointments", "urgency", {
      type: Sequelize.ENUM("low", "medium", "high", "urgent"),
      allowNull: true,
      defaultValue: "medium",
    })

    await queryInterface.addColumn("Appointments", "specialInstructions", {
      type: Sequelize.TEXT,
      allowNull: true,
    })

    await queryInterface.addColumn("Appointments", "additionalNotes", {
      type: Sequelize.TEXT,
      allowNull: true,
    })

    await queryInterface.addColumn("Appointments", "followUpRequired", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })

    await queryInterface.addColumn("Appointments", "followUpDays", {
      type: Sequelize.INTEGER,
      allowNull: true,
    })

    await queryInterface.addColumn("Appointments", "followUpDate", {
      type: Sequelize.DATE,
      allowNull: true,
    })

    await queryInterface.addColumn("Appointments", "consultationCompletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    })

    await queryInterface.addColumn("Appointments", "consultationDuration", {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "Duration in seconds",
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Appointments", "consultationNotes")
    await queryInterface.removeColumn("Appointments", "urgency")
    await queryInterface.removeColumn("Appointments", "specialInstructions")
    await queryInterface.removeColumn("Appointments", "additionalNotes")
    await queryInterface.removeColumn("Appointments", "followUpRequired")
    await queryInterface.removeColumn("Appointments", "followUpDays")
    await queryInterface.removeColumn("Appointments", "followUpDate")
    await queryInterface.removeColumn("Appointments", "consultationCompletedAt")
    await queryInterface.removeColumn("Appointments", "consultationDuration")
  },
}
