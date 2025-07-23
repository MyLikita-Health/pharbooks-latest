module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Appointments", "meetingId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    })

    await queryInterface.addColumn("Appointments", "meetingUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    })

    await queryInterface.addIndex("Appointments", ["meetingId"])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("Appointments", ["meetingId"])
    await queryInterface.removeColumn("Appointments", "meetingUrl")
    await queryInterface.removeColumn("Appointments", "meetingId")
  },
}
