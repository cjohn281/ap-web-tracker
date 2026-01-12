import { createRouter, createWebHistory } from 'vue-router'
import SessionOverviewView from '../views/SessionOverviewView.vue'
import GameDetailView from '../views/GameDetailView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  { path: '/', name: 'session-overview', component: SessionOverviewView },
  { path: '/game/:id', name: 'game-detail', component: GameDetailView, props: true },
  { path: '/settings', name: 'settings', component: SettingsView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})