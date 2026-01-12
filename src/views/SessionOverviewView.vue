<template>
  <div class="session-overview">
    <div class="overview-header">
      <h2>{{ sessionStore.session?.roomName }}</h2>
      <p class="subtitle">Multiworld Session Overview</p>
    </div>

    <div class="table-wrapper">
      <table class="games-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Game</th>
            <th>Progress</th>
            <th>Locations</th>
            <th>In Logic</th>
            <th>Items</th>
            <th>Hints</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="game in sessionStore.filteredGames" :key="game.id" class="game-row">
            <td class="player-cell">
              <RouterLink :to="`/game/${game.id}`">{{ game.playerName }}</RouterLink>
            </td>
            <td class="game-name">{{ game.name }}</td>
            <td>
              <div class="progress-bar-container">
                <div class="progress-bar" :style="{ width: progressPercent(game) + '%' }"></div>
                <span class="progress-text">{{ Math.round(progressPercent(game)) }}%</span>
              </div>
            </td>
            <td class="number-cell">
              {{ foundCount(game) }} / {{ game.locations.length }}
            </td>
            <td class="number-cell">{{ inLogicCount(game) }}</td>
            <td class="number-cell">
              <span class="items-badge">{{ game.items.length }}</span>
            </td>
            <td class="number-cell">{{ game.hints.length }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '../stores/sessionStore'
import { RouterLink } from 'vue-router'
import type { Game } from '../models/session'

const sessionStore = useSessionStore()

function foundCount(game: Game): number {
  return game.locations.filter(l => l.foundByGameId).length
}

function inLogicCount(game: Game): number {
  return game.locations.filter(l => l.inLogic).length
}

function progressPercent(game: Game): number {
  if (game.locations.length === 0) return 0
  return (foundCount(game) / game.locations.length) * 100
}
</script>

<style scoped>
.session-overview {
  max-width: 1400px;
  margin: 0 auto;
}

.overview-header {
  margin-bottom: 2rem;
}

.overview-header h2 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 0.95em;
}

.table-wrapper {
  overflow-x: auto;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.games-table {
  min-width: 900px;
  background-color: var(--color-bg-secondary);
}

.games-table th {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-weight: 600;
  border-color: var(--color-border);
}

.games-table td {
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

.game-row:hover {
  background-color: rgba(74, 158, 255, 0.05);
}

.player-cell a {
  color: var(--color-primary-light);
  font-weight: 500;
}

.player-cell a:hover {
  color: var(--color-primary);
}

.game-name {
  color: var(--color-text-primary);
  font-weight: 500;
}

.number-cell {
  text-align: center;
  font-weight: 500;
  color: var(--color-text-primary);
}

.items-badge {
  display: inline-block;
  background-color: rgba(74, 158, 255, 0.2);
  color: var(--color-primary-light);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9em;
  font-weight: bold;
  min-width: 1.5rem;
  text-align: center;
  border: 1px solid rgba(74, 158, 255, 0.3);
}

.progress-bar-container {
  position: relative;
  height: 28px;
  background-color: var(--color-bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  transition: width var(--transition-normal);
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.2);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.85em;
  font-weight: bold;
  color: var(--color-text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>