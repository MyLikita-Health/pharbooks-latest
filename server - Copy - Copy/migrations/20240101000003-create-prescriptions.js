module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Prescriptions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      prescriptionNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
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
      appointmentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Appointments",
          key: "id",
        },
      },
      status: {
        type: Sequelize.ENUM("pending", "verified", "filled", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      diagnosis: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      validUntil: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      issuedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      verifiedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
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

    await queryInterface.addIndex("Prescriptions", ["prescriptionNumber"])
    await queryInterface.addIndex("Prescriptions", ["patientId"])
    await queryInterface.addIndex("Prescriptions", ["doctorId"])
    await queryInterface.addIndex("Prescriptions", ["status"])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Prescriptions")
  },
}
