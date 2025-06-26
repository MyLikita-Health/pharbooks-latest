const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const PharmacyOrder = sequelize.define(
    "PharmacyOrder",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      prescriptionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Prescriptions",
          key: "id",
        },
      },
      pharmacistId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "processing", "ready", "dispatched", "delivered", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      paymentStatus: {
        type: DataTypes.ENUM("pending", "paid", "refunded"),
        allowNull: false,
        defaultValue: "pending",
      },
      paymentMethod: {
        type: DataTypes.ENUM("card", "insurance", "cash", "wallet"),
        allowNull: true,
      },
      deliveryAddress: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      deliveryMethod: {
        type: DataTypes.ENUM("pickup", "delivery", "mail"),
        allowNull: false,
        defaultValue: "delivery",
      },
      estimatedDelivery: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      actualDelivery: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      hooks: {
        beforeCreate: (order) => {
          // Generate order number
          const timestamp = Date.now().toString()
          const random = Math.random().toString(36).substring(2, 6).toUpperCase()
          order.orderNumber = `ORD-${timestamp.slice(-6)}-${random}`
        },
      },
      indexes: [
        { fields: ["orderNumber"] },
        { fields: ["prescriptionId"] },
        { fields: ["pharmacistId"] },
        { fields: ["status"] },
        { fields: ["paymentStatus"] },
      ],
    },
  )

  return PharmacyOrder
}
