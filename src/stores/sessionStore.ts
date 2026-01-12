import { defineStore } from 'pinia'
import type { Session, Game } from '../models/session'
import { mockSession } from '../models/mockSession'
import type { ConnectedPacket } from '../models/apPackets'
import type { ArchipelagoClient } from '../services/archipelagoClient'

export interface SessionFilter {
  selectedGameIds: string[]
}

interface SessionState {
  session: Session | null
  filter: SessionFilter
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    session: mockSession,
    filter: { selectedGameIds: [] },
  }),
  getters: {
    games(state): Game[] {
      return state.session?.games ?? []
    },
    filteredGames(state): Game[] {
      const games = state.session?.games ?? []
      if (!state.filter.selectedGameIds.length) return games
      return games.filter(g => state.filter.selectedGameIds.includes(g.id))
    },
  },
  actions: {
    setSelectedGameIds(ids: string[]) {
      this.filter.selectedGameIds = ids
    },
    updateFromArchipelago(connectedData: ConnectedPacket, client: ArchipelagoClient) {
      const slotInfo = client.getSlotInfo()
      const dataPackage = client.getDataPackage()
      
      if (!slotInfo) return
  
      // Build games from slot info
      const games: Game[] = []
      
      for (const [slotId, slot] of Object.entries(slotInfo)) {
        const slotNum = parseInt(slotId)
        if (slot.type === 2) continue // Skip group slots
        
        const game: Game = {
          id: `game-${slotNum}`,
          name: slot.game,
          playerName: slot.name,
          locations: [],
          items: [],
          hints: [],
        }
        
        games.push(game)
      }
      
      // Update session
      this.session = {
        id: 'live-session',
        roomName: 'Live Session', // Will be updated from room info
        games,
      }
      
      // Process checked and missing locations
      this.processLocations(connectedData, slotInfo, dataPackage)
    },
  
    processLocations(connectedData: ConnectedPacket, slotInfo: any, dataPackage: any) {
      // Implementation will map location IDs to names using dataPackage
      // This is a placeholder - full implementation depends on data package structure
      console.log('Processing locations:', connectedData.checked_locations?.length, 'checked')
    },
  
    handleRoomUpdate(data: any) {
      console.log('Room update received:', data)
      // Update locations, items, etc. based on room update
    },
  
    handleItemsReceived(data: any) {
      console.log('Items received:', data)
      // Update items in session
    },
  
    handleLocationInfo(data: any) {
      console.log('Location info received:', data)
      // Update location information
    },
  },
})