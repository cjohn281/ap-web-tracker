<template>
  <div v-if="game" class="game-detail">
    <div class="detail-header">
      <RouterLink to="/" class="back-link">← Back to Overview</RouterLink>
      <h2>{{ game.name }}</h2>
      <p class="player-name">{{ game.playerName }}</p>
    </div>

    <!-- Summary Stats -->
    <div class="summary-stats">
      <div class="stat-card">
        <div class="stat-value">{{ locationsFound }}/{{ game.locations.length }}</div>
        <div class="stat-label">Locations Checked</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ Math.round(locationsFoundPercent) }}%</div>
        <div class="stat-label">Complete</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ inLogicCount }}/{{ game.locations.length }}</div>
        <div class="stat-label">In Logic</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ itemsSent }}</div>
        <div class="stat-label">Items Sent</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ itemsReceived }}</div>
        <div class="stat-label">Items Received</div>
      </div>
    </div>

    <!-- Locations Section -->
    <section class="section">
      <h3>Locations</h3>
      <div class="location-filter">
        <label class="filter-checkbox">
          <input v-model="showUnfoundLocations" type="checkbox" />
          Not Found ({{ unfoundLocations.length }})
        </label>
        <label class="filter-checkbox">
          <input v-model="showFoundLocations" type="checkbox" />
          Found ({{ foundLocations.length }})
        </label>
        <label class="filter-checkbox">
          <input v-model="showInLogicOnly" type="checkbox" />
          In Logic Only
        </label>
      </div>

      <div v-if="filteredLocations.length" class="location-group">
        <ul class="location-list">
          <li v-for="location in filteredLocations" :key="location.id" 
              class="location-item" 
              :class="{ 'found': location.foundByGameId, 'unfound': !location.foundByGameId }">
            <input type="checkbox" :checked="!!location.foundByGameId" disabled />
            <span class="location-name">{{ location.name }}</span>
            <span v-if="location.inLogic" class="in-logic">In Logic</span>
          </li>
        </ul>
      </div>
      <p v-else class="empty-state">No locations match the current filters.</p>
    </section>

    <!-- Items Section -->
    <section class="section">
      <h3>Items</h3>
      <div v-if="game.items.length > 0">
        <table class="items-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>From Game</th>
              <th>Held by Game</th>
              <th>Found At</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in game.items" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ getGameName(item.owningGameId) }}</td>
              <td :class="{ 'sent-out': item.holderGameId !== item.owningGameId }">
                {{ getGameName(item.holderGameId) }}
              </td>
              <td>{{ item.foundAt ? formatDate(item.foundAt) : '—' }}</td>
            </tr>
          </tbody>
        </table>

        <div class="item-summary">
          <p><strong>Items Sent Out:</strong> {{ itemsSent }} to other games</p>
          <p><strong>Items Received:</strong> {{ itemsReceived }} from other games</p>
        </div>
      </div>
      <p v-else class="empty-state">No items yet.</p>
    </section>

    <!-- Hints Section -->
    <section class="section">
      <h3>Hints ({{ game.hints.length }})</h3>
      <div v-if="game.hints.length > 0" class="hints-list">
        <div v-for="hint in game.hints" :key="hint.id" class="hint-card" :class="hint.importance">
          <div class="hint-header">
            <span class="importance-badge" :class="hint.importance">{{ hint.importance.toUpperCase() }}</span>
            <span class="sender">From {{ getGameName(hint.senderGameId) }}</span>
          </div>
          <div class="hint-text">{{ hint.text }}</div>
          <div class="hint-footer">{{ formatDate(hint.foundAt) }}</div>
        </div>
      </div>
      <p v-else class="empty-state">No hints yet.</p>
    </section>
  </div>
  <div v-else class="error">Game not found.</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useSessionStore } from '../stores/sessionStore'
import type { Location } from '../models/session'

const route = useRoute()
const sessionStore = useSessionStore()

const showFoundLocations = ref(true)
const showUnfoundLocations = ref(true)
const showInLogicOnly = ref(false)

const game = computed(() => {
  const gameId = route.params.id as string
  return sessionStore.games.find(g => g.id === gameId)
})

const locationsFound = computed(() => {
  return game.value?.locations.filter(l => l.foundByGameId).length ?? 0
})

const locationsFoundPercent = computed(() => {
  if (!game.value || game.value.locations.length === 0) return 0
  return (locationsFound.value / game.value.locations.length) * 100
})

const inLogicCount = computed(() => {
  return game.value?.locations.filter(l => l.inLogic).length ?? 0
})

const foundLocations = computed(() => {
  return game.value?.locations.filter(l => l.foundByGameId) ?? []
})

const unfoundLocations = computed(() => {
  return game.value?.locations.filter(l => !l.foundByGameId) ?? []
})

const filteredFoundLocations = computed(() => {
  if (!showInLogicOnly.value) return foundLocations.value
  return foundLocations.value.filter(l => l.inLogic)
})

const filteredUnfoundLocations = computed(() => {
  if (!showInLogicOnly.value) return unfoundLocations.value
  return unfoundLocations.value.filter(l => l.inLogic)
})

const filteredLocations = computed(() => {
  let locations: Location[] = []
  
  if (showFoundLocations.value) {
    locations = [...locations, ...filteredFoundLocations.value]
  }
  if (showUnfoundLocations.value) {
    locations = [...locations, ...filteredUnfoundLocations.value]
  }
  
  // Sort: unfound first, then found; within each group, in-logic first
  return locations.sort((a, b) => {
    const aFound = !!a.foundByGameId
    const bFound = !!b.foundByGameId
    
    if (aFound !== bFound) {
      return aFound ? 1 : -1 // Unfound first
    }
    
    // Within same found status, in-logic first
    if (a.inLogic !== b.inLogic) {
      return a.inLogic ? -1 : 1
    }
    
    // Finally, sort alphabetically by name
    return a.name.localeCompare(b.name)
  })
})

const itemsSent = computed(() => {
  return (
    game.value?.items.filter(i => i.holderGameId !== i.owningGameId).length ?? 0
  )
})

const itemsReceived = computed(() => {
  const currentGame = game.value
  if (!currentGame) return 0
  return currentGame.items.filter(i => i.holderGameId === currentGame.id && i.owningGameId !== currentGame.id).length
})

function getGameName(gameId: string): string {
  return sessionStore.games.find(g => g.id === gameId)?.name ?? gameId
}

function formatDate(date?: Date): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.game-detail {
  max-width: 1400px;
  margin: 0 auto;
}

.detail-header {
  margin-bottom: 2rem;
}

.back-link {
  color: var(--color-primary-light);
  font-weight: 500;
  display: inline-block;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  transition: all var(--transition-fast);
}

.back-link:hover {
  color: var(--color-primary);
  transform: translateX(-4px);
}

.detail-header h2 {
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.player-name {
  color: var(--color-text-secondary);
  font-size: 0.95em;
}

.error {
  color: var(--color-danger);
  padding: 2rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
}

/* Summary Stats */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  transition: all var(--transition-fast);
}

.stat-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.15);
  transform: translateY(-2px);
}

.stat-value {
  font-size: 1.8em;
  font-weight: bold;
  color: var(--color-primary-light);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.85em;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Sections */
.section {
  margin: 3rem 0;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
  max-width: 100%;
}

.section h3 {
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-border);
}

.section h4 {
  color: var(--color-text-primary);
  margin: 1.5rem 0 1rem;
  font-size: 1em;
}

.empty-state {
  color: var(--color-text-muted);
  font-style: italic;
  padding: 1rem;
  text-align: center;
}

/* Location Filter */
.location-filter {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.filter-checkbox:hover {
  color: var(--color-text-primary);
}

.filter-checkbox input {
  cursor: pointer;
}

.location-group {
  margin: 1.5rem 0;
}

.location-list {
  list-style: none;
  padding: 0;
  text-align: left;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 4px;
  border-bottom: 1px solid var(--color-border);
  transition: all var(--transition-fast);
}

.location-item:last-child {
  border-bottom: none;
}

.location-item.found {
  background-color: rgba(74, 158, 255, 0.05);
}

.location-item.found:hover {
  background-color: rgba(74, 158, 255, 0.1);
}

.location-item.unfound {
  background-color: rgba(255, 152, 0, 0.05);
}

.location-item.unfound:hover {
  background-color: rgba(255, 152, 0, 0.1);
}

.location-item input {
  flex-shrink: 0;
}

.location-name {
  flex-grow: 1;
  color: var(--color-text-primary);
  font-weight: 500;
}

.in-logic {
  background-color: var(--color-success);
  color: var(--color-bg-primary);
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75em;
  font-weight: bold;
  white-space: nowrap;
}

.found-by {
  font-size: 0.8em;
  color: var(--color-text-muted);
}

/* Items Table */
.items-table {
  width: 100%;
  background-color: var(--color-bg-primary);
  border-collapse: collapse;
  margin: 1rem 0;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.items-table th {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-weight: 600;
  border-color: var(--color-border);
}

.items-table td {
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

.items-table tbody tr:hover {
  background-color: var(--color-bg-tertiary);
}

.items-table .sent-out {
  color: var(--color-primary-light);
  font-weight: 600;
}

.item-summary {
  background-color: var(--color-bg-tertiary);
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  border: 1px solid var(--color-border);
}

.item-summary p {
  margin: 0.5rem 0;
  color: var(--color-text-secondary);
}

.item-summary strong {
  color: var(--color-text-primary);
}

/* Hints */
.hints-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.hint-card {
  border-left: 4px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
}

.hint-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.hint-card.high {
  border-left-color: var(--color-danger);
  background-color: rgba(239, 68, 68, 0.08);
}

.hint-card.medium {
  border-left-color: var(--color-warning);
  background-color: rgba(251, 191, 36, 0.08);
}

.hint-card.low {
  border-left-color: var(--color-info);
  background-color: rgba(96, 165, 250, 0.08);
}

.hint-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.importance-badge {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 3px;
  font-size: 0.7em;
  font-weight: bold;
  color: white;
  white-space: nowrap;
}

.importance-badge.high {
  background-color: var(--color-danger);
}

.importance-badge.medium {
  background-color: var(--color-warning);
}

.importance-badge.low {
  background-color: var(--color-info);
}

.sender {
  font-size: 0.85em;
  color: var(--color-text-secondary);
}

.hint-text {
  margin: 0.75rem 0;
  line-height: 1.5;
  color: var(--color-text-primary);
}

.hint-footer {
  font-size: 0.75em;
  color: var(--color-text-muted);
}
</style>