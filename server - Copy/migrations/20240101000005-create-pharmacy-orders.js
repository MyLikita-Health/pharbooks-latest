module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PharmacyOrders", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      orderNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      prescriptionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Prescriptions",
          key: "id",
        },
      },
      pharmacistId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
      status: {
        type: Sequelize.ENUM("pending", "processing", "ready", "dispatched", "delivered", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      paymentStatus: {
        type: Sequelize.ENUM("pending", "paid", "refunded"),
        allowNull: false,
        defaultValue: "pending",
      },
      paymentMethod: {
        type: Sequelize.ENUM("card", "insurance", "cash", "wallet"),
        allowNull: true,
      },
      deliveryAddress: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      deliveryMethod: {
        type: Sequelize.ENUM("pickup", "delivery", "mail"),
        allowNull: false,
        defaultValue: "delivery",
      },
      estimatedDelivery: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      actualDelivery: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      trackingNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex("PharmacyOrders", ["orderNumber"])
    await queryInterface.addIndex("PharmacyOrders", ["prescriptionId"])
    await queryInterface.addIndex("PharmacyOrders", ["pharmacistId"])
    await queryInterface.addIndex("PharmacyOrders", ["status"])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("PharmacyOrders")
  },
}
