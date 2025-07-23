module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Medications", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      prescriptionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Prescriptions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      genericName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dosage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      frequency: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      duration: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      refills: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sideEffects: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
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

    await queryInterface.addIndex("Medications", ["prescriptionId"])
    await queryInterface.addIndex("Medications", ["name"])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Medications")
  },
}
