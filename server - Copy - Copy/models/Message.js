const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Message = sequelize.define(
    "Message",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      receiverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 200],
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 2000],
        },
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      messageType: {
        type: DataTypes.ENUM("general", "appointment", "prescription", "emergency"),
        defaultValue: "general",
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high", "urgent"),
        defaultValue: "medium",
      },
      attachments: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      indexes: [
        { fields: ["senderId"] },
        { fields: ["receiverId"] },
        { fields: ["isRead"] },
        { fields: ["messageType"] },
        { fields: ["priority"] },
        { fields: ["createdAt"] },
      ],
    },
  )

  return Message
}
