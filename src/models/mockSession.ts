import type { Session } from './session'

export const mockSession: Session = {
  id: 'session-1',
  roomName: 'Example Multiworld',
  games: [
    {
      id: 'game-1',
      name: 'Zelda: A Link to the Past',
      playerName: 'Player A',
      locations: [
        { id: 'loc-1', name: 'Starting House', gameId: 'game-1', inLogic: true, foundByGameId: 'game-1', foundAt: new Date('2025-01-10') },
        { id: 'loc-2', name: 'Forest Cave', gameId: 'game-1', inLogic: false },
        { id: 'loc-3', name: 'Lost Woods Chest', gameId: 'game-1', inLogic: true, foundByGameId: 'game-1', foundAt: new Date('2025-01-11') },
        { id: 'loc-4', name: 'Eastern Palace', gameId: 'game-1', inLogic: true },
        { id: 'loc-5', name: 'Desert Palace', gameId: 'game-1', inLogic: false },
      ],
      items: [
        { id: 'item-1', name: 'Hookshot', owningGameId: 'game-1', holderGameId: 'game-2', locationId: 'loc-early-2', foundAt: new Date('2025-01-10T15:30:00') },
        { id: 'item-2', name: 'Lamp', owningGameId: 'game-1', holderGameId: 'game-1', foundAt: new Date('2025-01-10T14:00:00') },
        { id: 'item-3', name: 'Boots', owningGameId: 'game-2', holderGameId: 'game-1', foundAt: new Date('2025-01-11T10:45:00') },
      ],
      hints: [
        {
          id: 'hint-1',
          text: 'Your Hookshot is in Game B early locations.',
          senderGameId: 'game-2',
          targetGameId: 'game-1',
          importance: 'high',
          foundAt: new Date('2025-01-10T16:00:00'),
        },
        {
          id: 'hint-2',
          text: 'You have an item in the Desert Palace.',
          senderGameId: 'game-2',
          targetGameId: 'game-1',
          importance: 'medium',
          foundAt: new Date('2025-01-11T09:00:00'),
        },
      ],
    },
    {
      id: 'game-2',
      name: 'Super Metroid',
      playerName: 'Player B',
      locations: [
        { id: 'loc-6', name: 'Crateria Landing Site', gameId: 'game-2', inLogic: true, foundByGameId: 'game-2', foundAt: new Date('2025-01-10') },
        { id: 'loc-7', name: 'Brinstar Blue Door', gameId: 'game-2', inLogic: true },
        { id: 'loc-8', name: 'Norfair Reserve Tank', gameId: 'game-2', inLogic: false },
        { id: 'loc-9', name: 'Maridia Shelf', gameId: 'game-2', inLogic: true },
      ],
      items: [
        { id: 'item-4', name: 'Morph Ball', owningGameId: 'game-2', holderGameId: 'game-2', foundAt: new Date('2025-01-10T14:30:00') },
      ],
      hints: [
        {
          id: 'hint-3',
          text: 'Player A has the item you need in an early location.',
          senderGameId: 'game-1',
          targetGameId: 'game-2',
          importance: 'low',
          foundAt: new Date('2025-01-11T11:00:00'),
        },
      ],
    },
  ],
}