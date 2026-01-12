import { defineStore } from 'pinia'
import { ArchipelagoClient } from '../services/archipelagoClient'
import { useSessionStore } from './sessionStore'
import type { ConnectedPacket, RoomInfoPacket, ConnectionRefusedPacket } from '../models/apPackets'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface ConnectionSettings {
  port: string
  playerSlot: string
  password: string
}

interface ConnectionState {
  status: ConnectionStatus
  settings: ConnectionSettings
  errorMessage: string | null
  lastConnectedAt: Date | null
  client: ArchipelagoClient | null
  roomName: string | null
  connectedSlot: number | null
}

export const useConnectionStore = defineStore('connection', {
  state: (): ConnectionState => ({
    status: 'disconnected',
    settings: {
      port: '',
      playerSlot: '',
      password: '',
    },
    errorMessage: null,
    lastConnectedAt: null,
    client: null,
    roomName: null,
    connectedSlot: null,
  }),

  getters: {
    serverUrl(state): string {
      return `wss://archipelago.gg:${state.settings.port}`
    },
    isConnected(state): boolean {
      return state.status === 'connected'
    },
    canConnect(state): boolean {
      return (
        state.settings.port.trim() !== '' &&
        state.settings.playerSlot.trim() !== ''
      )
    },
  },

  actions: {
    updateSettings(newSettings: Partial<ConnectionSettings>) {
      this.settings = { ...this.settings, ...newSettings }
      this.errorMessage = null
    },

    async connect() {
      if (!this.canConnect) {
        this.errorMessage = 'Please fill in the port number'
        return
      }

      this.status = 'connecting'
      this.errorMessage = null

      try {
        // Create WebSocket client
        this.client = new ArchipelagoClient(this.serverUrl)

        // Set up event handlers
        this.client.on('connected', () => {
          console.log('Client connected, waiting for room info...')
        })

        this.client.on('roomInfo', (data) => {
          const roomInfo = data as RoomInfoPacket
          this.roomName = roomInfo.seed_name
          console.log('Room info received:', roomInfo.seed_name)
          
          // Authenticate as tracker/spectator
          const slotName = this.settings.playerSlot.trim()
          this.client!.authenticate(slotName, this.settings.password || null)
          
          // Request data package for item/location names
          this.client!.requestDataPackage()
        })

        this.client.on('slotConnected', (data) => {
          const connectedData = data as ConnectedPacket
          this.connectedSlot = connectedData.slot
          this.status = 'connected'
          this.lastConnectedAt = new Date()
          console.log('Slot connected:', connectedData.slot)
          
          // Update session store with connected data
          // if (this.client) {
          //   const sessionStore = useSessionStore()
          //   sessionStore.updateFromArchipelago(connectedData, this.client)
          // }
        })

        this.client.on('connectionRefused', (data) => {
          const packet = data as ConnectionRefusedPacket
          const reason = packet.errors?.join(', ') || 'Unknown reason'
          this.status = 'error'
          this.errorMessage = `Connection refused: ${reason}`
        })

        this.client.on('error', (data: any) => {
          this.status = 'error'
          this.errorMessage = data?.message || 'Unknown error'
        })

        this.client.on('disconnected', (data: any) => {
          this.status = 'disconnected'
          this.roomName = null
          this.connectedSlot = null
          console.log('Disconnected:', data)
        })

        this.client.on('roomUpdate', (data) => {
          const sessionStore = useSessionStore()
          sessionStore.handleRoomUpdate(data as any)
        })

        this.client.on('itemsReceived', (data) => {
          const sessionStore = useSessionStore()
          sessionStore.handleItemsReceived(data as any)
        })

        this.client.on('locationInfo', (data) => {
          const sessionStore = useSessionStore()
          sessionStore.handleLocationInfo(data as any)
        })

        // Initiate connection
        this.client.connect()

      } catch (err) {
        this.status = 'error'
        this.errorMessage = `Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      }
    },

    disconnect() {
      if (this.client) {
        this.client.disconnect()
        this.client = null
      }
      this.status = 'disconnected'
      this.errorMessage = null
      this.roomName = null
      this.connectedSlot = null
    },

    clearError() {
      this.errorMessage = null
    },
  },
})