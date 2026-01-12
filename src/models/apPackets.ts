// Archipelago WebSocket Packet Types
// Based on https://github.com/ArchipelagoMW/Archipelago/blob/main/docs/network%20protocol.md

export type APPacketType =
  | 'RoomInfo'
  | 'ConnectionRefused'
  | 'Connected'
  | 'ReceivedItems'
  | 'LocationInfo'
  | 'RoomUpdate'
  | 'PrintJSON'
  | 'DataPackage'
  | 'Bounced'
  | 'InvalidPacket'
  | 'Retrieved'
  | 'SetReply'

export interface APPacket {
  cmd: APPacketType
}

// Client -> Server packets
export interface ConnectPacket {
  cmd: 'Connect'
  password: string | null
  game: string
  name: string
  uuid: string
  version: { major: number; minor: number; build: number; class: string }
  items_handling?: number
  tags?: string[]
  slot_data?: boolean
}

export interface SyncPacket {
  cmd: 'Sync'
}

export interface LocationChecksPacket {
  cmd: 'LocationChecks'
  locations: number[]
}

export interface LocationScoutsPacket {
  cmd: 'LocationScouts'
  locations: number[]
  create_as_hint?: number
}

export interface StatusUpdatePacket {
  cmd: 'StatusUpdate'
  status: number
}

export interface SayPacket {
  cmd: 'Say'
  text: string
}

export interface GetDataPackagePacket {
  cmd: 'GetDataPackage'
  games?: string[]
}

export interface BouncePacket {
  cmd: 'Bounce'
  games?: string[]
  slots?: number[]
  tags?: string[]
  data?: Record<string, unknown>
}

export interface GetPacket {
  cmd: 'Get'
  keys: string[]
}

export interface SetPacket {
  cmd: 'Set'
  key: string
  default?: unknown
  want_reply?: boolean
  operations?: Array<{ operation: string; value: unknown }>
}

export interface SetNotifyPacket {
  cmd: 'SetNotify'
  keys: string[]
}

// Server -> Client packets
export interface RoomInfoPacket extends APPacket {
  cmd: 'RoomInfo'
  version: { major: number; minor: number; build: number; class: string }
  generator_version: { major: number; minor: number; build: number }
  tags: string[]
  password: boolean
  permissions: Record<string, number>
  hint_cost: number
  location_check_points: number
  games: string[]
  datapackage_checksums: Record<string, string>
  seed_name: string
  time: number
}

export interface ConnectionRefusedPacket extends APPacket {
  cmd: 'ConnectionRefused'
  errors: string[]
}

export interface ConnectedPacket extends APPacket {
  cmd: 'Connected'
  team: number
  slot: number
  players: Array<{
    team: number
    slot: number
    alias: string
    name: string
  }>
  missing_locations: number[]
  checked_locations: number[]
  slot_data: Record<string, unknown>
  slot_info: Record<number, {
    name: string
    game: string
    type: number
    group_members?: number[]
  }>
  hint_points: number
}

export interface ReceivedItemsPacket extends APPacket {
  cmd: 'ReceivedItems'
  index: number
  items: Array<{
    item: number
    location: number
    player: number
    flags: number
  }>
}

export interface LocationInfoPacket extends APPacket {
  cmd: 'LocationInfo'
  locations: Array<{
    item: number
    location: number
    player: number
    flags: number
  }>
}

export interface RoomUpdatePacket extends APPacket {
  cmd: 'RoomUpdate'
  hint_points?: number
  checked_locations?: number[]
  missing_locations?: number[]
  players?: Array<{
    team: number
    slot: number
    alias: string
    name: string
  }>
}

export interface PrintJSONPacket extends APPacket {
  cmd: 'PrintJSON'
  data: Array<{
    type: string
    text?: string
    color?: string
    player?: number
    item?: number
    location?: number
    flags?: number
  }>
  type?: string
  receiving?: number
  item?: {
    item: number
    player: number
    flags: number
  }
  found?: boolean
}

export interface DataPackagePacket extends APPacket {
  cmd: 'DataPackage'
  data: {
    version: number
    games: Record<string, {
      item_name_to_id: Record<string, number>
      location_name_to_id: Record<string, number>
      version: number
    }>
  }
}

export interface BouncedPacket extends APPacket {
  cmd: 'Bounced'
  games?: string[]
  slots?: number[]
  tags?: string[]
  data?: Record<string, unknown>
}

export interface InvalidPacketPacket extends APPacket {
  cmd: 'InvalidPacket'
  type: string
  original_cmd?: string
  text: string
}

export interface RetrievedPacket extends APPacket {
  cmd: 'Retrieved'
  keys: Record<string, unknown>
}

export interface SetReplyPacket extends APPacket {
  cmd: 'SetReply'
  key: string
  value: unknown
  original_value: unknown
}

// Union type for all server packets
export type APServerPacket =
  | RoomInfoPacket
  | ConnectionRefusedPacket
  | ConnectedPacket
  | ReceivedItemsPacket
  | LocationInfoPacket
  | RoomUpdatePacket
  | PrintJSONPacket
  | DataPackagePacket
  | BouncedPacket
  | InvalidPacketPacket
  | RetrievedPacket
  | SetReplyPacket

// Union type for all client packets
export type APClientPacket =
  | ConnectPacket
  | SyncPacket
  | LocationChecksPacket
  | LocationScoutsPacket
  | StatusUpdatePacket
  | SayPacket
  | GetDataPackagePacket
  | BouncePacket
  | GetPacket
  | SetPacket
  | SetNotifyPacket