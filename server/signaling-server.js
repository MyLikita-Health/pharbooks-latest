const WebSocket = require("ws")
const jwt = require("jsonwebtoken")
const { User } = require("./models")

class SignalingServer {
  constructor(server) {
    this.wss = new WebSocket.Server({
      server,
      path: "/signaling",
      clientTracking: true,
    })

    this.connectedUsers = new Map() // userId -> { ws, user, lastHeartbeat }
    this.activeRooms = new Map() // roomId -> Set of userIds
    this.userRooms = new Map() // userId -> roomId

    this.setupWebSocketServer()
    this.startHeartbeatCheck()

    console.log("🎬 Signaling server initialized")
  }

  setupWebSocketServer() {
    this.wss.on("connection", (ws, req) => {
      console.log("🔌 New WebSocket connection from:", req.socket.remoteAddress)

      ws.userId = null
      ws.isAlive = true
      ws.isAuthenticated = false

      // Set up heartbeat
      ws.on("pong", () => {
        ws.isAlive = true
        if (ws.userId) {
          const connection = this.connectedUsers.get(ws.userId)
          if (connection) {
            connection.lastHeartbeat = Date.now()
          }
        }
      })

      ws.on("message", async (data) => {
        try {
          const message = JSON.parse(data.toString())
          await this.handleMessage(ws, message)
        } catch (error) {
          console.error("❌ Failed to parse message:", error)
          this.sendError(ws, "Invalid message format", null)
        }
      })

      ws.on("close", (code, reason) => {
        console.log(`🔌 WebSocket connection closed for user: ${ws.userId} (${code}: ${reason})`)
        this.handleDisconnection(ws)
      })

      ws.on("error", (error) => {
        console.error("❌ WebSocket error for user:", ws.userId, error)
        this.handleDisconnection(ws)
      })

      // Send initial connection acknowledgment
      this.sendMessage(ws, {
        type: "connection-established",
        from: "server",
        to: "client",
        data: {
          message: "WebSocket connection established. Please authenticate.",
          timestamp: Date.now(),
        },
        messageId: this.generateMessageId(),
      })
    })

    this.wss.on("error", (error) => {
      console.error("❌ WebSocket Server error:", error)
    })

    console.log(`🔌 WebSocket server listening on path: /signaling`)
  }

  async handleMessage(ws, message) {
    const { type, from, to, data, messageId } = message

    console.log(`📥 Handling message: ${type} from ${from || "unknown"} to ${to || "unknown"}`)

    try {
      switch (type) {
        case "auth":
          await this.handleAuth(ws, data, messageId)
          break

        case "heartbeat":
          this.handleHeartbeat(ws, messageId)
          break

        case "call-initiation":
          if (!ws.isAuthenticated) {
            throw new Error("Authentication required")
          }
          await this.handleCallInitiation(ws, to, data, messageId)
          break

        case "call-answer":
          if (!ws.isAuthenticated) {
            throw new Error("Authentication required")
          }
          await this.handleCallAnswer(ws, to, data, messageId)
          break

        case "call-rejection":
          if (!ws.isAuthenticated) {
            throw new Error("Authentication required")
          }
          await this.handleCallRejection(ws, to, data, messageId)
          break

        case "call-end":
          if (!ws.isAuthenticated) {
            throw new Error("Authentication required")
          }
          await this.handleCallEnd(ws, to, data, messageId)
          break

        case "webrtc-offer":
          if (!ws.isAuthenticated) {
            throw new Error("Authentication required")
          }
          await this.relayWebRTCMessage(ws, to, "webrtc-offer", data, messageId)
          break

        case "webrtc-answer":
          if (!ws.isAuthenticated) {
            throw new Error("Authentication required")
          }
          await this.relayWebRTCMessage(ws, to, "webrtc-answer", data, messageId)
          break

        case "webrtc-ice-candidate":
          if (!ws.isAuthenticated) {
            throw new Error("Authentication required")
          }
          await this.relayWebRTCMessage(ws, to, "webrtc-ice-candidate", data, messageId)
          break

        default:
          console.warn(`⚠️ Unknown message type: ${type}`)
          this.sendError(ws, `Unknown message type: ${type}`, messageId)
      }
    } catch (error) {
      console.error(`❌ Error handling message ${type}:`, error)
      this.sendError(ws, error.message, messageId)
    }
  }

  async handleAuth(ws, data, messageId) {
    try {
      const { userId } = data

      if (!userId) {
        throw new Error("User ID is required")
      }

      // Validate user exists in database
      const user = await User.findByPk(userId)
      if (!user) {
        throw new Error("User not found")
      }

      // Remove any existing connection for this user
      if (this.connectedUsers.has(userId)) {
        const existingConnection = this.connectedUsers.get(userId)
        if (existingConnection.ws !== ws && existingConnection.ws.readyState === WebSocket.OPEN) {
          console.log(`🔄 Replacing existing connection for user: ${userId}`)
          existingConnection.ws.close(1000, "New connection established")
        }
      }

      // Store user connection
      ws.userId = userId
      ws.isAuthenticated = true
      this.connectedUsers.set(userId, {
        ws,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          isOnline: true,
        },
        lastHeartbeat: Date.now(),
      })

      console.log(`✅ User authenticated: ${user.name} (${userId})`)

      // Send authentication success immediately
      this.sendMessage(ws, {
        type: "auth-success",
        from: "server",
        to: userId,
        data: {
          userId,
          status: "authenticated",
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        },
        messageId,
      })
    } catch (error) {
      console.error("❌ Authentication failed:", error)
      this.sendError(ws, error.message, messageId)
    }
  }

  handleHeartbeat(ws, messageId) {
    if (ws.userId && ws.isAuthenticated) {
      const connection = this.connectedUsers.get(ws.userId)
      if (connection) {
        connection.lastHeartbeat = Date.now()
      }
    }

    // Send heartbeat response immediately
    this.sendMessage(ws, {
      type: "heartbeat-response",
      from: "server",
      to: ws.userId || "unknown",
      data: { timestamp: Date.now() },
      messageId,
    })
  }

  async handleCallInitiation(ws, targetUserId, data, messageId) {
    const targetConnection = this.connectedUsers.get(targetUserId)

    if (!targetConnection) {
      throw new Error("Target user not found or offline")
    }

    if (targetConnection.ws.readyState !== WebSocket.OPEN) {
      throw new Error("Target user connection is not active")
    }

    // Create a room for this call
    const roomId = `call-${Date.now()}-${ws.userId}-${targetUserId}`
    this.activeRooms.set(roomId, new Set([ws.userId, targetUserId]))
    this.userRooms.set(ws.userId, roomId)
    this.userRooms.set(targetUserId, roomId)

    // Forward call initiation to target user
    this.sendMessage(targetConnection.ws, {
      type: "call-initiation",
      from: ws.userId,
      to: targetUserId,
      data: {
        ...data,
        roomId,
      },
      messageId: this.generateMessageId(),
    })

    // Send confirmation to caller
    this.sendMessage(ws, {
      type: "call-initiation-sent",
      from: "server",
      to: ws.userId,
      data: {
        targetUserId,
        roomId,
        status: "sent",
      },
      messageId,
    })

    console.log(`📞 Call initiated: ${ws.userId} -> ${targetUserId} (Room: ${roomId})`)
  }

  async handleCallAnswer(ws, targetUserId, data, messageId) {
    const targetConnection = this.connectedUsers.get(targetUserId)

    if (!targetConnection || targetConnection.ws.readyState !== WebSocket.OPEN) {
      throw new Error("Caller not found or offline")
    }

    // Forward call answer to caller
    this.sendMessage(targetConnection.ws, {
      type: "call-answer",
      from: ws.userId,
      to: targetUserId,
      data,
      messageId: this.generateMessageId(),
    })

    // Send confirmation to answerer
    this.sendMessage(ws, {
      type: "call-answer-sent",
      from: "server",
      to: ws.userId,
      data: {
        targetUserId,
        status: "answered",
      },
      messageId,
    })

    console.log(`✅ Call answered: ${ws.userId} -> ${targetUserId}`)
  }

  async handleCallRejection(ws, targetUserId, data, messageId) {
    const targetConnection = this.connectedUsers.get(targetUserId)

    if (targetConnection && targetConnection.ws.readyState === WebSocket.OPEN) {
      // Forward call rejection to caller
      this.sendMessage(targetConnection.ws, {
        type: "call-rejection",
        from: ws.userId,
        to: targetUserId,
        data,
        messageId: this.generateMessageId(),
      })
    }

    // Clean up room
    this.cleanupCallRoom(ws.userId, targetUserId)

    // Send confirmation to rejecter
    this.sendMessage(ws, {
      type: "call-rejection-sent",
      from: "server",
      to: ws.userId,
      data: {
        targetUserId,
        status: "rejected",
      },
      messageId,
    })

    console.log(`❌ Call rejected: ${ws.userId} -> ${targetUserId}`)
  }

  async handleCallEnd(ws, targetUserId, data, messageId) {
    const targetConnection = this.connectedUsers.get(targetUserId)

    if (targetConnection && targetConnection.ws.readyState === WebSocket.OPEN) {
      // Forward call end to other participant
      this.sendMessage(targetConnection.ws, {
        type: "call-end",
        from: ws.userId,
        to: targetUserId,
        data,
        messageId: this.generateMessageId(),
      })
    }

    // Clean up room
    this.cleanupCallRoom(ws.userId, targetUserId)

    // Send confirmation
    this.sendMessage(ws, {
      type: "call-end-sent",
      from: "server",
      to: ws.userId,
      data: {
        targetUserId,
        status: "ended",
      },
      messageId,
    })

    console.log(`📞 Call ended: ${ws.userId} -> ${targetUserId}`)
  }

  async relayWebRTCMessage(ws, targetUserId, messageType, data, messageId) {
    const targetConnection = this.connectedUsers.get(targetUserId)

    if (!targetConnection || targetConnection.ws.readyState !== WebSocket.OPEN) {
      throw new Error("Target user not available for WebRTC signaling")
    }

    // Relay the WebRTC message
    this.sendMessage(targetConnection.ws, {
      type: messageType,
      from: ws.userId,
      to: targetUserId,
      data,
      messageId: this.generateMessageId(),
    })

    // Send confirmation
    this.sendMessage(ws, {
      type: `${messageType}-sent`,
      from: "server",
      to: ws.userId,
      data: {
        targetUserId,
        status: "relayed",
      },
      messageId,
    })

    console.log(`🔄 WebRTC message relayed: ${messageType} from ${ws.userId} to ${targetUserId}`)
  }

  sendMessage(ws, message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        const messageWithTimestamp = {
          ...message,
          timestamp: Date.now(),
        }
        ws.send(JSON.stringify(messageWithTimestamp))
      } catch (error) {
        console.error("❌ Failed to send message:", error)
      }
    }
  }

  sendError(ws, errorMessage, messageId) {
    this.sendMessage(ws, {
      type: "error",
      from: "server",
      to: ws.userId || "unknown",
      data: {
        error: errorMessage,
        originalMessageId: messageId,
      },
      messageId: this.generateMessageId(),
    })
  }

  handleDisconnection(ws) {
    if (ws.userId && ws.isAuthenticated) {
      const connection = this.connectedUsers.get(ws.userId)

      if (connection && connection.ws === ws) {
        // Notify any active call participants
        const roomId = this.userRooms.get(ws.userId)
        if (roomId) {
          const room = this.activeRooms.get(roomId)
          if (room) {
            room.forEach((participantId) => {
              if (participantId !== ws.userId) {
                const participantConnection = this.connectedUsers.get(participantId)
                if (participantConnection && participantConnection.ws.readyState === WebSocket.OPEN) {
                  this.sendMessage(participantConnection.ws, {
                    type: "participant-disconnected",
                    from: "server",
                    to: participantId,
                    data: {
                      disconnectedUserId: ws.userId,
                      reason: "connection_lost",
                    },
                    messageId: this.generateMessageId(),
                  })
                }
              }
            })
          }
        }

        // Clean up user data
        this.connectedUsers.delete(ws.userId)
        this.cleanupUserRooms(ws.userId)

        console.log(`🔌 User disconnected: ${ws.userId}`)
      }
    }
  }

  cleanupCallRoom(userId1, userId2) {
    const roomId = this.userRooms.get(userId1) || this.userRooms.get(userId2)

    if (roomId) {
      // Remove room
      this.activeRooms.delete(roomId)

      // Remove user room mappings
      this.userRooms.delete(userId1)
      this.userRooms.delete(userId2)

      console.log(`🧹 Cleaned up call room: ${roomId}`)
    }
  }

  cleanupUserRooms(userId) {
    const roomId = this.userRooms.get(userId)

    if (roomId) {
      const room = this.activeRooms.get(roomId)
      if (room) {
        room.delete(userId)

        // If room is empty, delete it
        if (room.size === 0) {
          this.activeRooms.delete(roomId)
        }
      }

      this.userRooms.delete(userId)
    }
  }

  startHeartbeatCheck() {
    setInterval(() => {
      const now = Date.now()
      const timeout = 60000 // 1 minute timeout

      this.connectedUsers.forEach((connection, userId) => {
        const { ws, lastHeartbeat } = connection

        if (now - lastHeartbeat > timeout) {
          console.log(`💔 Heartbeat timeout for user: ${userId}`)
          ws.terminate()
          this.handleDisconnection(ws)
        } else if (ws.readyState === WebSocket.OPEN) {
          // Send ping
          ws.ping()
        }
      })

      // Clean up terminated connections
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          console.log("💔 Terminating unresponsive connection")
          ws.terminate()
          this.handleDisconnection(ws)
        }
        ws.isAlive = false
      })
    }, 30000) // Check every 30 seconds
  }

  generateMessageId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Public methods for stats and management
  getConnectedUsersCount() {
    return this.connectedUsers.size
  }

  getActiveRoomsCount() {
    return this.activeRooms.size
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.entries()).map(([userId, connection]) => ({
      userId,
      user: connection.user,
      lastHeartbeat: connection.lastHeartbeat,
      isActive: connection.ws.readyState === WebSocket.OPEN,
    }))
  }

  isUserConnected(userId) {
    const connection = this.connectedUsers.get(userId)
    return connection && connection.ws.readyState === WebSocket.OPEN
  }

  // Graceful shutdown
  shutdown() {
    console.log("🛑 Shutting down signaling server...")

    // Notify all connected users
    this.connectedUsers.forEach((connection) => {
      if (connection.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(connection.ws, {
          type: "server-shutdown",
          from: "server",
          to: connection.user.id,
          data: { reason: "Server maintenance" },
          messageId: this.generateMessageId(),
        })

        setTimeout(() => {
          connection.ws.close(1001, "Server shutdown")
        }, 1000)
      }
    })

    // Close WebSocket server
    setTimeout(() => {
      this.wss.close(() => {
        console.log("✅ Signaling server shutdown complete")
      })
    }, 2000)
  }
}

module.exports = SignalingServer
