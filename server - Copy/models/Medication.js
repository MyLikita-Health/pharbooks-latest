const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Medication = sequelize.define(
    "Medication",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      prescriptionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Prescriptions",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      genericName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dosage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      frequency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      duration: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      refills: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 5,
        },
      },
      instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sideEffects: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      indexes: [{ fields: ["prescriptionId"] }, { fields: ["name"] }],
    },
  )

  return Medication
}
