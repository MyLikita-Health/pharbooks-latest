const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Appointment = sequelize.define(
    "Appointment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      appointmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        defaultValue: 30, // minutes
        validate: {
          min: 15,
          max: 120,
        },
      },
      type: {
        type: DataTypes.ENUM("video", "followup", "initial", "emergency"),
        allowNull: false,
        defaultValue: "video",
      },
      status: {
        type: DataTypes.ENUM("pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"),
        allowNull: false,
        defaultValue: "pending",
      },
      symptoms: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      diagnosis: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      videoSessionId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meetingId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      meetingUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 75.0,
      },
      paymentStatus: {
        type: DataTypes.ENUM("pending", "paid", "refunded"),
        allowNull: false,
        defaultValue: "pending",
      },
      cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancelledBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      cancellationReason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      indexes: [
        { fields: ["patientId"] },
        { fields: ["doctorId"] },
        { fields: ["appointmentDate"] },
        { fields: ["status"] },
        { fields: ["type"] },
        { fields: ["meetingId"] },
      ],
    },
  )

  return Appointment
}
