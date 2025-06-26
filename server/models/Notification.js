const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      type: {
        type: DataTypes.ENUM(
          "appointment_booked",
          "appointment_confirmed",
          "appointment_cancelled",
          "appointment_reminder",
          "prescription_ready",
          "order_dispatched",
          "order_delivered",
          "system_alert",
          "user_approved",
          "user_rejected",
        ),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high", "urgent"),
        allowNull: false,
        defaultValue: "medium",
      },
    },
    {
      indexes: [
        { fields: ["userId"] },
        { fields: ["type"] },
        { fields: ["isRead"] },
        { fields: ["priority"] },
        { fields: ["createdAt"] },
      ],
    },
  )

  return Notification
}
