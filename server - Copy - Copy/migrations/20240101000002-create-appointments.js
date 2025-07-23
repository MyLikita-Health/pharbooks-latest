module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Appointments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      patientId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      doctorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      appointmentDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
      },
      type: {
        type: Sequelize.ENUM("video", "followup", "initial", "emergency"),
        allowNull: false,
        defaultValue: "video",
      },
      status: {
        type: Sequelize.ENUM("pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"),
        allowNull: false,
        defaultValue: "pending",
      },
      symptoms: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      diagnosis: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      videoSessionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 75.0,
      },
      paymentStatus: {
        type: Sequelize.ENUM("pending", "paid", "refunded"),
        allowNull: false,
        defaultValue: "pending",
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cancelledBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      cancellationReason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })

    await queryInterface.addIndex("Appointments", ["patientId"])
    await queryInterface.addIndex("Appointments", ["doctorId"])
    await queryInterface.addIndex("Appointments", ["appointmentDate"])
    await queryInterface.addIndex("Appointments", ["status"])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Appointments")
  },
}
