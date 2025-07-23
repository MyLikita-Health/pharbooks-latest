const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Investigation = sequelize.define(
    "Investigation",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      appointmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Appointments",
          key: "id",
        },
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
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [
            ["Blood Test", "Urine Test", "X-Ray", "CT Scan", "MRI", "Ultrasound", "ECG", "Echo", "Biopsy", "Other"],
          ],
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      urgency: {
        type: DataTypes.ENUM("routine", "urgent", "stat"),
        allowNull: false,
        defaultValue: "routine",
      },
      status: {
        type: DataTypes.ENUM("pending", "scheduled", "in_progress", "completed", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      results: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      scheduledDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      labId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
      cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      attachments: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      indexes: [
        { fields: ["appointmentId"] },
        { fields: ["patientId"] },
        { fields: ["doctorId"] },
        { fields: ["type"] },
        { fields: ["urgency"] },
        { fields: ["status"] },
        { fields: ["scheduledDate"] },
      ],
    },
  )

  return Investigation
}
