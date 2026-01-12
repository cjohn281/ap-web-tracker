import type {
  APServerPacket,
  APClientPacket,
  RoomInfoPacket,
  ConnectedPacket,
  ConnectionRefusedPacket,
  ReceivedItemsPacket,
  LocationInfoPacket,
  RoomUpdatePacket,
  DataPackagePacket,
} from '../models/apPackets'

export type APClientEventType =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'roomInfo'
  | 'connectionRefused'
  | 'slotConnected'
  | 'itemsReceived'
  | 'locationInfo'
  | 'roomUpdate'
  | 'dataPackage'

export interface APClientEvent {
  type: APClientEventType
  data?: unknown
}

export class ArchipelagoClient {
  private ws: WebSocket | null = null
  private eventHandlers: Map<APClientEventType, Array<(data?: unknown) => void>> = new Map()
  private dataPackage: DataPackagePacket['data'] | null = null
  private slotInfo: ConnectedPacket['slot_info'] | null = null
  private players: ConnectedPacket['players'] | null = null
  private serverUrl: string
  private serverVersion: RoomInfoPacket['version'] | null = null

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.warn('Already connected')
      return
    }

    this.ws = new WebSocket(this.serverUrl)

    this.ws.onopen = () => {
      console.log('WebSocket connected to', this.serverUrl)
      this.emit('connected')
    }

    this.ws.onmessage = (event) => {
      try {
        const packets: APServerPacket[] = JSON.parse(event.data)
        if (!Array.isArray(packets)) {
          console.error('Expected array of packets, got:', packets)
          return
        }
        packets.forEach(packet => this.handlePacket(packet))
      } catch (err) {
        console.error('Failed to parse message:', err, event.data)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.emit('error', { message: 'WebSocket connection error' })
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason)
      this.emit('disconnected', { code: event.code, reason: event.reason })
      this.ws = null
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(packet: APClientPacket): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Cannot send packet: WebSocket not connected')
      return
    }

    try {
      this.ws.send(JSON.stringify([packet]))
    } catch (err) {
      console.error('Failed to send packet:', err)
    }
  }

  authenticate(slotName: string, password: string | null = null): void {
    const version = this.serverVersion ?? {
      major: 0,
      minor: 6,
      build: 5,
      class: 'Version',
    }

    const connectPacket: APClientPacket = {
      cmd: 'Connect',
      password: password || null,
      game: '', // Empty for tracker; version/game validation is skipped when using Tracker tag
      name: slotName,
      uuid: this.generateUUID(),
      version,
      items_handling: 0b111, // Receive all items
      tags: ['Tracker', 'WebTracker'],
      slot_data: true,
    }

    console.log('Archipelago connect packet', {
      serverUrl: this.serverUrl,
      name: connectPacket.name,
      passwordProvided: !!password,
      version: connectPacket.version,
      tags: connectPacket.tags,
    })

    this.send(connectPacket)
  }

  requestDataPackage(games?: string[]): void {
    this.send({
      cmd: 'GetDataPackage',
      games,
    })
  }

  on(event: APClientEventType, handler: (data?: unknown) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  off(event: APClientEventType, handler: (data?: unknown) => void): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  getDataPackage(): DataPackagePacket['data'] | null {
    return this.dataPackage
  }

  getSlotInfo(): ConnectedPacket['slot_info'] | null {
    return this.slotInfo
  }

  getPlayers(): ConnectedPacket['players'] | null {
    return this.players
  }

  private emit(event: APClientEventType, data?: unknown): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }

  private handlePacket(packet: APServerPacket): void {
    console.log('Received packet:', packet.cmd, packet)

    switch (packet.cmd) {
      case 'RoomInfo':
        this.handleRoomInfo(packet)
        break
      case 'ConnectionRefused':
        this.handleConnectionRefused(packet)
        break
      case 'Connected':
        this.handleConnected(packet)
        break
      case 'ReceivedItems':
        this.handleReceivedItems(packet)
        break
      case 'LocationInfo':
        this.handleLocationInfo(packet)
        break
      case 'RoomUpdate':
        this.handleRoomUpdate(packet)
        break
      case 'DataPackage':
        this.handleDataPackage(packet)
        break
      case 'PrintJSON':
        // Handle chat/print messages if needed
        console.log('PrintJSON:', packet)
        break
      default:
        console.log('Unhandled packet type:', packet.cmd)
    }
  }

  private handleRoomInfo(packet: RoomInfoPacket): void {
    this.serverVersion = packet.version
    this.emit('roomInfo', packet)
  }

  private handleConnectionRefused(packet: ConnectionRefusedPacket): void {
    this.emit('connectionRefused', packet)
    this.emit('error', { message: `Connection refused: ${packet.errors.join(', ')}` })
  }

  private handleConnected(packet: ConnectedPacket): void {
    console.log('Connected packet:', packet)
    this.slotInfo = packet.slot_info
    this.players = packet.players
    this.emit('slotConnected', packet)
  }

  private handleReceivedItems(packet: ReceivedItemsPacket): void {
    this.emit('itemsReceived', packet)
  }

  private handleLocationInfo(packet: LocationInfoPacket): void {
    this.emit('locationInfo', packet)
  }

  private handleRoomUpdate(packet: RoomUpdatePacket): void {
    this.emit('roomUpdate', packet)
  }

  private handleDataPackage(packet: DataPackagePacket): void {
    this.dataPackage = packet.data
    this.emit('dataPackage', packet)
  }

  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }
    // Fallback for environments without crypto.randomUUID (like some browsers)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}