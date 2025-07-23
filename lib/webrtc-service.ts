"use client"

interface ICEServer {
  urls: string | string[]
  username?: string
  credential?: string
}

interface WebRTCConfig {
  iceServers: ICEServer[]
  iceCandidatePoolSize: number
  bundlePolicy: RTCBundlePolicy
  rtcpMuxPolicy: RTCRtcpMuxPolicy
}

interface MediaConstraints {
  video: MediaTrackConstraints | boolean
  audio: MediaTrackConstraints | boolean
}

interface ConnectionQuality {
  level: "excellent" | "good" | "fair" | "poor" | "disconnected"
  bitrate: number
  packetLoss: number
  rtt: number
}

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private dataChannel: RTCDataChannel | null = null
  private connectionState: RTCPeerConnectionState = "new"
  private iceConnectionState: RTCIceConnectionState = "new"
  private signalingState: RTCSignalingState = "stable"
  private isInitiator = false
  private iceCandidatesQueue: RTCIceCandidate[] = []
  private statsInterval: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private connectionQuality: ConnectionQuality = {
    level: "disconnected",
    bitrate: 0,
    packetLoss: 0,
    rtt: 0,
  }

  // Event handlers
  private onLocalStreamHandler: ((stream: MediaStream) => void) | null = null
  private onRemoteStreamHandler: ((stream: MediaStream) => void) | null = null
  private onConnectionStateChangeHandler: ((state: RTCPeerConnectionState) => void) | null = null
  private onIceConnectionStateChangeHandler: ((state: RTCIceConnectionState) => void) | null = null
  private onDataChannelMessageHandler: ((message: string) => void) | null = null
  private onConnectionQualityChangeHandler: ((quality: ConnectionQuality) => void) | null = null
  private onErrorHandler: ((error: Error) => void) | null = null

  private getWebRTCConfig(): WebRTCConfig {
    return {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        // Add TURN servers for better connectivity
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
    }
  }

  private getOptimalMediaConstraints(): MediaConstraints {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    return {
      video: {
        width: { min: 320, ideal: isMobile ? 640 : 1280, max: 1920 },
        height: { min: 240, ideal: isMobile ? 480 : 720, max: 1080 },
        frameRate: { min: 15, ideal: 30, max: 60 },
        facingMode: "user",
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: { ideal: 48000 },
        channelCount: { ideal: 2 },
      },
    }
  }

  async initializePeerConnection(): Promise<void> {
    try {
      console.log("🔄 Initializing WebRTC peer connection...")

      if (this.peerConnection) {
        this.cleanup()
      }

      const config = this.getWebRTCConfig()
      this.peerConnection = new RTCPeerConnection(config)

      this.setupPeerConnectionEventHandlers()
      this.setupDataChannel()

      console.log("✅ Peer connection initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize peer connection:", error)
      this.handleError(new Error(`Failed to initialize peer connection: ${error}`))
      throw error
    }
  }

  private setupPeerConnectionEventHandlers(): void {
    if (!this.peerConnection) return

    // Connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection!.connectionState
      console.log(`🔗 Connection state changed: ${state}`)
      this.connectionState = state

      if (this.onConnectionStateChangeHandler) {
        this.onConnectionStateChangeHandler(state)
      }

      if (state === "connected") {
        this.startQualityMonitoring()
        this.reconnectAttempts = 0
      } else if (state === "failed") {
        this.handleConnectionFailure()
      } else if (state === "disconnected") {
        this.stopQualityMonitoring()
      }
    }

    // ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection!.iceConnectionState
      console.log(`🧊 ICE connection state changed: ${state}`)
      this.iceConnectionState = state

      if (this.onIceConnectionStateChangeHandler) {
        this.onIceConnectionStateChangeHandler(state)
      }

      if (state === "failed") {
        console.log("🔄 ICE connection failed, attempting restart...")
        this.restartIce()
      }
    }

    // Signaling state changes
    this.peerConnection.onsignalingstatechange = () => {
      const state = this.peerConnection!.signalingState
      console.log(`📡 Signaling state changed: ${state}`)
      this.signalingState = state
    }

    // ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("🧊 New ICE candidate:", event.candidate.candidate)
        // In a real implementation, send this to the remote peer via signaling
        this.handleIceCandidate(event.candidate)
      } else {
        console.log("🧊 ICE candidate gathering complete")
      }
    }

    // Remote stream
    this.peerConnection.ontrack = (event) => {
      console.log("📺 Received remote track:", event.track.kind)
      const [stream] = event.streams
      if (stream && stream !== this.remoteStream) {
        this.remoteStream = stream
        if (this.onRemoteStreamHandler) {
          this.onRemoteStreamHandler(stream)
        }
      }
    }

    // Data channel
    this.peerConnection.ondatachannel = (event) => {
      console.log("📡 Received data channel:", event.channel.label)
      this.setupDataChannelHandlers(event.channel)
    }
  }

  private setupDataChannel(): void {
    if (!this.peerConnection) return

    try {
      this.dataChannel = this.peerConnection.createDataChannel("messages", {
        ordered: true,
        maxRetransmits: 3,
      })

      this.setupDataChannelHandlers(this.dataChannel)
      console.log("📡 Data channel created")
    } catch (error) {
      console.error("❌ Failed to create data channel:", error)
    }
  }

  private setupDataChannelHandlers(channel: RTCDataChannel): void {
    channel.onopen = () => {
      console.log("📡 Data channel opened")
    }

    channel.onclose = () => {
      console.log("📡 Data channel closed")
    }

    channel.onerror = (error) => {
      console.error("📡 Data channel error:", error)
    }

    channel.onmessage = (event) => {
      console.log("📡 Data channel message:", event.data)
      if (this.onDataChannelMessageHandler) {
        this.onDataChannelMessageHandler(event.data)
      }
    }
  }

  async getUserMedia(): Promise<MediaStream> {
    try {
      console.log("🎥 Requesting user media...")

      const constraints = this.getOptimalMediaConstraints()
      console.log("🎥 Media constraints:", constraints)

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      console.log("✅ User media obtained successfully")
      console.log(`📺 Video tracks: ${stream.getVideoTracks().length}`)
      console.log(`🎤 Audio tracks: ${stream.getAudioTracks().length}`)

      this.localStream = stream

      // Log track details
      stream.getTracks().forEach((track, index) => {
        const settings = track.getSettings()
        console.log(`Track ${index + 1} (${track.kind}):`, {
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState,
          settings,
        })
      })

      if (this.onLocalStreamHandler) {
        this.onLocalStreamHandler(stream)
      }

      return stream
    } catch (error) {
      console.error("❌ Failed to get user media:", error)

      let errorMessage = "Failed to access camera and microphone"
      if (error instanceof Error) {
        switch (error.name) {
          case "NotAllowedError":
            errorMessage = "Camera and microphone access denied. Please allow permissions and refresh."
            break
          case "NotFoundError":
            errorMessage = "No camera or microphone found. Please connect your devices."
            break
          case "NotReadableError":
            errorMessage = "Camera or microphone is already in use by another application."
            break
          case "OverconstrainedError":
            errorMessage = "Camera settings not supported. Trying with basic settings..."
            // Try with fallback constraints
            try {
              const fallbackStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: true,
              })
              this.localStream = fallbackStream
              if (this.onLocalStreamHandler) {
                this.onLocalStreamHandler(fallbackStream)
              }
              return fallbackStream
            } catch (fallbackError) {
              errorMessage = "Camera settings not compatible with your device."
            }
            break
        }
      }

      this.handleError(new Error(errorMessage))
      throw new Error(errorMessage)
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized")
    }

    try {
      console.log("📤 Creating offer...")
      this.isInitiator = true

      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: false,
      })

      await this.peerConnection.setLocalDescription(offer)
      console.log("✅ Offer created and set as local description")

      return offer
    } catch (error) {
      console.error("❌ Failed to create offer:", error)
      this.handleError(new Error(`Failed to create offer: ${error}`))
      throw error
    }
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized")
    }

    try {
      console.log("📥 Creating answer...")
      this.isInitiator = false

      await this.peerConnection.setRemoteDescription(offer)

      // Process queued ICE candidates
      await this.processQueuedIceCandidates()

      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)

      console.log("✅ Answer created and set as local description")

      return answer
    } catch (error) {
      console.error("❌ Failed to create answer:", error)
      this.handleError(new Error(`Failed to create answer: ${error}`))
      throw error
    }
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized")
    }

    try {
      console.log("📥 Setting remote description...")
      await this.peerConnection.setRemoteDescription(description)

      // Process queued ICE candidates after setting remote description
      await this.processQueuedIceCandidates()

      console.log("✅ Remote description set successfully")
    } catch (error) {
      console.error("❌ Failed to set remote description:", error)
      this.handleError(new Error(`Failed to set remote description: ${error}`))
      throw error
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      console.warn("⚠️ Peer connection not ready, queueing ICE candidate")
      this.iceCandidatesQueue.push(new RTCIceCandidate(candidate))
      return
    }

    if (this.peerConnection.remoteDescription === null) {
      console.warn("⚠️ Remote description not set, queueing ICE candidate")
      this.iceCandidatesQueue.push(new RTCIceCandidate(candidate))
      return
    }

    try {
      await this.peerConnection.addIceCandidate(candidate)
      console.log("✅ ICE candidate added successfully")
    } catch (error) {
      console.error("❌ Failed to add ICE candidate:", error)
      // Don't throw here as ICE candidates can fail without breaking the connection
    }
  }

  private async processQueuedIceCandidates(): Promise<void> {
    if (this.iceCandidatesQueue.length === 0) return

    console.log(`🧊 Processing ${this.iceCandidatesQueue.length} queued ICE candidates`)

    for (const candidate of this.iceCandidatesQueue) {
      try {
        await this.peerConnection!.addIceCandidate(candidate)
      } catch (error) {
        console.warn("⚠️ Failed to add queued ICE candidate:", error)
      }
    }

    this.iceCandidatesQueue = []
  }

  addLocalStream(stream: MediaStream): void {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized")
    }

    try {
      console.log("📤 Adding local stream to peer connection...")

      stream.getTracks().forEach((track) => {
        console.log(`📤 Adding ${track.kind} track:`, track.label)
        this.peerConnection!.addTrack(track, stream)
      })

      this.localStream = stream
      console.log("✅ Local stream added successfully")
    } catch (error) {
      console.error("❌ Failed to add local stream:", error)
      this.handleError(new Error(`Failed to add local stream: ${error}`))
      throw error
    }
  }

  toggleVideoTrack(enabled: boolean): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = enabled
        console.log(`📺 Video track ${enabled ? "enabled" : "disabled"}`)
      }
    }
  }

  toggleAudioTrack(enabled: boolean): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = enabled
        console.log(`🎤 Audio track ${enabled ? "enabled" : "disabled"}`)
      }
    }
  }

  private async restartIce(): Promise<void> {
    if (!this.peerConnection || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return
    }

    try {
      this.reconnectAttempts++
      console.log(`🔄 Restarting ICE (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      this.peerConnection.restartIce()

      if (this.isInitiator) {
        const offer = await this.createOffer()
        // Send offer to remote peer via signaling
        this.handleOffer(offer)
      }
    } catch (error) {
      console.error("❌ Failed to restart ICE:", error)
    }
  }

  private handleConnectionFailure(): void {
    console.log("❌ Connection failed, attempting recovery...")

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.restartIce()
      }, 1000 * this.reconnectAttempts)
    } else {
      console.log("❌ Max reconnection attempts reached")
      this.handleError(new Error("Connection failed after multiple attempts"))
    }
  }

  private startQualityMonitoring(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
    }

    this.statsInterval = setInterval(async () => {
      await this.updateConnectionQuality()
    }, 2000)
  }

  private stopQualityMonitoring(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
      this.statsInterval = null
    }
  }

  private async updateConnectionQuality(): Promise<void> {
    if (!this.peerConnection) return

    try {
      const stats = await this.peerConnection.getStats()
      let inboundRtp: RTCInboundRtpStreamStats | null = null
      let candidatePair: RTCIceCandidatePairStats | null = null

      stats.forEach((report) => {
        if (report.type === "inbound-rtp" && report.kind === "video") {
          inboundRtp = report as RTCInboundRtpStreamStats
        } else if (report.type === "candidate-pair" && (report as RTCIceCandidatePairStats).state === "succeeded") {
          candidatePair = report as RTCIceCandidatePairStats
        }
      })

      if (inboundRtp && candidatePair) {
        const quality: ConnectionQuality = {
          level: this.calculateQualityLevel(inboundRtp, candidatePair),
          bitrate: inboundRtp.bytesReceived || 0,
          packetLoss: inboundRtp.packetsLost || 0,
          rtt: candidatePair.currentRoundTripTime || 0,
        }

        this.connectionQuality = quality

        if (this.onConnectionQualityChangeHandler) {
          this.onConnectionQualityChangeHandler(quality)
        }
      }
    } catch (error) {
      console.warn("⚠️ Failed to get connection stats:", error)
    }
  }

  private calculateQualityLevel(
    inboundRtp: RTCInboundRtpStreamStats,
    candidatePair: RTCIceCandidatePairStats,
  ): ConnectionQuality["level"] {
    const rtt = candidatePair.currentRoundTripTime || 0
    const packetLoss = inboundRtp.packetsLost || 0
    const packetsReceived = inboundRtp.packetsReceived || 1

    const packetLossRate = packetLoss / (packetLoss + packetsReceived)

    if (rtt < 0.1 && packetLossRate < 0.01) return "excellent"
    if (rtt < 0.2 && packetLossRate < 0.03) return "good"
    if (rtt < 0.4 && packetLossRate < 0.05) return "fair"
    return "poor"
  }

  sendDataChannelMessage(message: string): void {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(message)
      console.log("📡 Data channel message sent:", message)
    } else {
      console.warn("⚠️ Data channel not ready")
    }
  }

  getConnectionState(): RTCPeerConnectionState {
    return this.connectionState
  }

  getIceConnectionState(): RTCIceConnectionState {
    return this.iceConnectionState
  }

  getSignalingState(): RTCSignalingState {
    return this.signalingState
  }

  getConnectionQuality(): ConnectionQuality {
    return this.connectionQuality
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }

  // Event handler setters
  onLocalStream(handler: (stream: MediaStream) => void): void {
    this.onLocalStreamHandler = handler
  }

  onRemoteStream(handler: (stream: MediaStream) => void): void {
    this.onRemoteStreamHandler = handler
  }

  onConnectionStateChange(handler: (state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeHandler = handler
  }

  onIceConnectionStateChange(handler: (state: RTCIceConnectionState) => void): void {
    this.onIceConnectionStateChangeHandler = handler
  }

  onDataChannelMessage(handler: (message: string) => void): void {
    this.onDataChannelMessageHandler = handler
  }

  onConnectionQualityChange(handler: (quality: ConnectionQuality) => void): void {
    this.onConnectionQualityChangeHandler = handler
  }

  onError(handler: (error: Error) => void): void {
    this.onErrorHandler = handler
  }

  // Signaling methods (to be implemented with actual signaling server)
  private handleIceCandidate(candidate: RTCIceCandidate): void {
    // Send ICE candidate to remote peer via signaling server
    console.log("🧊 Sending ICE candidate via signaling")
  }

  private handleOffer(offer: RTCSessionDescriptionInit): void {
    // Send offer to remote peer via signaling server
    console.log("📤 Sending offer via signaling")
  }

  private handleError(error: Error): void {
    console.error("❌ WebRTC Error:", error)
    if (this.onErrorHandler) {
      this.onErrorHandler(error)
    }
  }

  cleanup(): void {
    console.log("🧹 Cleaning up WebRTC resources...")

    this.stopQualityMonitoring()

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop()
        console.log(`🛑 Stopped ${track.kind} track`)
      })
      this.localStream = null
    }

    if (this.dataChannel) {
      this.dataChannel.close()
      this.dataChannel = null
    }

    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    this.remoteStream = null
    this.iceCandidatesQueue = []
    this.reconnectAttempts = 0

    console.log("✅ WebRTC cleanup completed")
  }
}

export const webRTCService = new WebRTCService()
export type { ConnectionQuality, MediaConstraints, WebRTCConfig }
