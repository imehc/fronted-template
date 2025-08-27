import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '~/views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/basic-scan',
      name: 'basic-scan',
      component: () => import('~/views/BasicScan.vue'),
    },
    {
      path: '/callback-example',
      name: 'callback-example',
      component: () => import('~/views/CallbackExample.vue'),
    },
    {
      path: '/continuous-scan',
      name: 'continuous-scan',
      component: () => import('~/views/ContinuousScan.vue'),
    },
    {
      path: '/document-preview',
      name: 'document-preview',
      component: () => import('~/views/DeocumentDemo.vue'),
    },
  ],
})

export default router
