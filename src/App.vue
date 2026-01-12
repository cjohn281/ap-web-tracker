<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-container">
        <div class="header-brand">
          <h1>🗺️ Archipelago Tracker</h1>
        </div>
        <nav class="header-nav">
          <RouterLink to="/" class="nav-link">Overview</RouterLink>
          <RouterLink to="/settings" class="nav-link">Settings</RouterLink>
        </nav>
      </div>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 80vw;
  background-color: var(--color-bg-primary);
}

.app-header {
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  padding: 1.5rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-brand h1 {
  margin: 0;
  font-size: 1.5em;
  color: var(--color-primary-light);
}

.header-nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--color-text-secondary);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all var(--transition-fast);
  position: relative;
}

.nav-link:hover {
  color: var(--color-primary-light);
  background-color: rgba(74, 158, 255, 0.1);
}

.nav-link.router-link-active {
  color: var(--color-primary);
  background-color: rgba(74, 158, 255, 0.15);
}

.app-main {
  flex: 1;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 1rem;
  }

  .header-nav {
    width: 100%;
    justify-content: center;
  }
}
</style>
