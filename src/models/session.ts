export interface Location {
    id: string
    name: string
    gameId: string
    foundByGameId?: string
    foundAt?: Date
    inLogic: boolean
}

export interface Item {
    id: string
    name: string
    owningGameId: string
    holderGameId: string
    locationId?: string
    foundAt?: Date
}

export interface Hint {
    id: string
    text: string
    senderGameId: string
    targetGameId: string
    importance: 'low' | 'medium' | 'high'
    foundAt?: Date
}

export interface Game {
    id: string
    name: string
    playerName: string
    locations: Location[]
    items: Item[]
    hints: Hint[]
}

export interface Session {
    id: string
    roomName: string
    games: Game[]
}