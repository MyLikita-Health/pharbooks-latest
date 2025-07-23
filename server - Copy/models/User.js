const { DataTypes } = require("sequelize")
const bcrypt = require("bcryptjs")

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [6, 100],
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 100],
        },
      },
      role: {
        type: DataTypes.ENUM("patient", "doctor", "pharmacist", "admin"),
        allowNull: false,
      },
      isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^[+]?[1-9][\d]{0,15}$/,
        },
      },
      specialization: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      licenseNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      emergencyContact: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      medicalHistory: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 12)
          }
          // Auto-approve patients
          if (user.role === "patient") {
            user.isApproved = true
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 12)
          }
        },
      },
      indexes: [{ fields: ["email"] }, { fields: ["role"] }, { fields: ["isApproved"] }, { fields: ["licenseNumber"] }],
    },
  )

  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password)
  }

  User.prototype.toJSON = function () {
    const values = { ...this.get() }
    delete values.password
    return values
  }

  return User
}
