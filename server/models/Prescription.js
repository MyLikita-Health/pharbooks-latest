const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Prescription = sequelize.define(
    "Prescription",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      prescriptionNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      patientId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      appointmentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Appointments",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "verified", "filled", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      diagnosis: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      validUntil: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      issuedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      verifiedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
    },
    {
      hooks: {
        beforeCreate: (prescription) => {
          // Generate prescription number
          const timestamp = Date.now().toString()
          const random = Math.random().toString(36).substring(2, 8).toUpperCase()
          prescription.prescriptionNumber = `RX-${timestamp.slice(-6)}-${random}`

          // Set valid until date (30 days from now)
          prescription.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
      },
      indexes: [
        { fields: ["prescriptionNumber"] },
        { fields: ["patientId"] },
        { fields: ["doctorId"] },
        { fields: ["status"] },
        { fields: ["issuedAt"] },
      ],
    },
  )

  return Prescription
}
