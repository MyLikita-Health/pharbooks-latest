const { Sequelize } = require("sequelize")
const config = require("../config/database")

const env = process.env.NODE_ENV || "development"
const dbConfig = config[env]

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  pool: dbConfig.pool,
  dialectOptions: dbConfig.dialectOptions,
})

// Import models
const User = require("./User")(sequelize)
const Appointment = require("./Appointment")(sequelize)
const Prescription = require("./Prescription")(sequelize)
const Medication = require("./Medication")(sequelize)
const PharmacyOrder = require("./PharmacyOrder")(sequelize)
const Notification = require("./Notification")(sequelize)

// Define associations
User.hasMany(Appointment, { as: "PatientAppointments", foreignKey: "patientId" })
User.hasMany(Appointment, { as: "DoctorAppointments", foreignKey: "doctorId" })
Appointment.belongsTo(User, { as: "Patient", foreignKey: "patientId" })
Appointment.belongsTo(User, { as: "Doctor", foreignKey: "doctorId" })

User.hasMany(Prescription, { as: "PatientPrescriptions", foreignKey: "patientId" })
User.hasMany(Prescription, { as: "DoctorPrescriptions", foreignKey: "doctorId" })
Prescription.belongsTo(User, { as: "Patient", foreignKey: "patientId" })
Prescription.belongsTo(User, { as: "Doctor", foreignKey: "doctorId" })

Prescription.hasMany(Medication, { foreignKey: "prescriptionId", onDelete: "CASCADE" })
Medication.belongsTo(Prescription, { foreignKey: "prescriptionId" })

Prescription.hasOne(PharmacyOrder, { foreignKey: "prescriptionId" })
PharmacyOrder.belongsTo(Prescription, { foreignKey: "prescriptionId" })

User.hasMany(PharmacyOrder, { as: "ProcessedOrders", foreignKey: "pharmacistId" })
PharmacyOrder.belongsTo(User, { as: "Pharmacist", foreignKey: "pharmacistId" })

User.hasMany(Notification, { foreignKey: "userId", onDelete: "CASCADE" })
Notification.belongsTo(User, { foreignKey: "userId" })

module.exports = {
  sequelize,
  User,
  Appointment,
  Prescription,
  Medication,
  PharmacyOrder,
  Notification,
}
