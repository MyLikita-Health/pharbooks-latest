module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Notifications", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      type: {
        type: Sequelize.ENUM(
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
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      priority: {
        type: Sequelize.ENUM("low", "medium", "high", "urgent"),
        allowNull: false,
        defaultValue: "medium",
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

    await queryInterface.addIndex("Notifications", ["userId"])
    await queryInterface.addIndex("Notifications", ["type"])
    await queryInterface.addIndex("Notifications", ["isRead"])
    await queryInterface.addIndex("Notifications", ["priority"])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Notifications")
  },
}
