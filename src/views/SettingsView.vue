<template>
  <div class="settings">
    <div class="settings-header">
      <h2>Settings</h2>
      <p class="subtitle">Manage your Archipelago connection</p>
    </div>

    <!-- Connection Status Card -->
    <div class="status-card" :class="connectionStore.status">
      <div class="status-header">
        <div class="status-indicator" :class="connectionStore.status"></div>
        <div>
          <h3>Connection Status</h3>
          <p class="status-text">{{ statusText[connectionStore.status] }}</p>
        </div>
      </div>
      <p v-if="connectionStore.lastConnectedAt" class="last-connected">
        Last connected: {{ formatDate(connectionStore.lastConnectedAt) }}
      </p>
      <p v-if="connectionStore.isConnected" class="server-url">
        Connected to: {{ connectionStore.serverUrl }}
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="connectionStore.errorMessage" class="error-message">
      <span>{{ connectionStore.errorMessage }}</span>
      <button @click="connectionStore.clearError" class="clear-btn">×</button>
    </div>

    <!-- Connection Form -->
    <form @submit.prevent="handleConnect" class="connection-form">
      <fieldset :disabled="connectionStore.status === 'connecting'">
        <h3>Archipelago Server</h3>

        <div class="form-group">
          <label for="port">Port Number</label>
          <div class="port-input-group">
            <span class="port-prefix">archipelago.gg:</span>
            <input
              id="port"
              v-model="connectionStore.settings.port"
              type="number"
              placeholder="e.g., 38281"
              @change="updateSetting('port', $event)"
              min="1"
              max="65535"
              required
            />
          </div>
          <small>The port number from your Archipelago session</small>
        </div>

        <div class="form-group">
          <label for="password">Password (optional)</label>
          <input
            id="password"
            v-model="connectionStore.settings.password"
            type="password"
            placeholder="Room password if required"
            @change="updateSetting('password', $event)"
          />
        </div>

        <div class="form-actions">
          <button
            v-if="!connectionStore.isConnected"
            type="submit"
            class="btn btn-primary"
            :disabled="!connectionStore.canConnect || connectionStore.status === 'connecting'"
          >
            {{ connectionStore.status === 'connecting' ? 'Connecting...' : 'Connect' }}
          </button>
          <button
            v-else
            type="button"
            @click="handleDisconnect"
            class="btn btn-danger"
          >
            Disconnect
          </button>
        </div>
      </fieldset>
    </form>

    <!-- Advanced Options -->
    <details class="advanced-section">
      <summary>Advanced Options</summary>
      <div class="advanced-content">
        <div class="form-group">
          <label for="autoConnect">
            <input id="autoConnect" v-model="autoConnect" type="checkbox" />
            Auto-connect on app load
          </label>
        </div>
        <div class="form-group">
          <label for="autoRefresh">
            <input id="autoRefresh" v-model="autoRefresh" type="checkbox" />
            Auto-refresh game data every 5 seconds
          </label>
        </div>
      </div>
    </details>

    <!-- Info Section -->
    <section class="info-section">
      <h3>About</h3>
      <p>
        This tracker connects to your Archipelago multiworld session to display real-time progress on
        locations, items, and hints across all games in the multiworld.
      </p>
      <p>
        <strong>How to use:</strong>
      </p>
      <ol>
        <li>Find your port number in the Archipelago client (shown when connected)</li>
        <li>Enter your port number here</li>
        <li>Click "Connect" to establish a WebSocket connection</li>
        <li>Once connected, the overview and game detail pages will update with live data</li>
        <li>Use the game filter on the overview to focus on specific games</li>
      </ol>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConnectionStore } from '../stores/connectionStore'

const connectionStore = useConnectionStore()
const autoConnect = ref(false)
const autoRefresh = ref(true)

const statusText: Record<string, string> = {
  disconnected: 'Not connected',
  connecting: 'Connecting...',
  connected: 'Connected',
  error: 'Connection error',
}

function updateSetting(key: string, event: Event) {
  const input = event.target as HTMLInputElement
  connectionStore.updateSettings({
    [key]: input.value,
  })
}

async function handleConnect() {
  await connectionStore.connect()
}

function handleDisconnect() {
  connectionStore.disconnect()
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.settings {
  max-width: 600px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 2rem;
}

.settings-header h2 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 0.95em;
}

h3 {
  color: var(--color-text-primary);
  margin: 1.5rem 0 1rem;
}

/* Status Card */
.status-card {
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
}

.status-card.disconnected {
  border-left-color: var(--color-text-muted);
}

.status-card.connecting {
  border-left-color: var(--color-warning);
}

.status-card.connected {
  border-left-color: var(--color-success);
}

.status-card.error {
  border-left-color: var(--color-danger);
}

.status-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--color-text-muted);
  flex-shrink: 0;
}

.status-indicator.disconnected {
  background-color: var(--color-text-muted);
}

.status-indicator.connecting {
  background-color: var(--color-warning);
  animation: pulse 1s infinite;
}

.status-indicator.connected {
  background-color: var(--color-success);
}

.status-indicator.error {
  background-color: var(--color-danger);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9em;
}

.last-connected {
  margin: 0.5rem 0 0;
  font-size: 0.85em;
  color: var(--color-text-muted);
}

.server-url {
  margin: 0.5rem 0 0;
  font-size: 0.85em;
  color: var(--color-text-muted);
  font-family: 'Courier New', monospace;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
  margin-bottom: 1rem;
  color: #ff6b6b;
}

.clear-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #ff6b6b;
  padding: 0;
  margin-left: 0.5rem;
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  transform: scale(1.2);
}

/* Form */
.connection-form {
  margin: 2rem 0;
}

fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

fieldset:disabled {
  opacity: 0.6;
  pointer-events: none;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

input[type="checkbox"] {
  margin-right: 0.5rem;
}

small {
  display: block;
  margin-top: 0.25rem;
  color: var(--color-text-muted);
  font-size: 0.85em;
}

input[type="text"],
input[type="password"] {
  width: 100%;
}

/* Port Input Group */
.port-input-group {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.port-prefix {
  padding: 0.75rem;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-size: 0.9em;
  font-family: 'Courier New', monospace;
  white-space: nowrap;
  border-right: 1px solid var(--color-border);
}

.port-input-group input {
  flex: 1;
  border: none;
  border-radius: 0;
  margin: 0;
}

.port-input-group input:focus {
  box-shadow: inset 0 0 0 2px rgba(74, 158, 255, 0.3);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

/* Advanced Options */
.advanced-section {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-bg-secondary);
}

.advanced-section summary {
  cursor: pointer;
  font-weight: 500;
  user-select: none;
  color: var(--color-text-primary);
  transition: color var(--transition-fast);
}

.advanced-section summary:hover {
  color: var(--color-primary-light);
}

.advanced-content {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

/* Info Section */
.info-section {
  margin: 3rem 0 0;
  padding: 1.5rem;
  background-color: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 8px;
}

.info-section p {
  margin: 0.5rem 0;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.info-section strong {
  color: var(--color-text-primary);
}

.info-section ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.info-section li {
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
  text-align: left;
}

/* Hide number input spinner arrows */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>