import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from "vuefire"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      meta: {
        layout: 'default'
      },
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/about-us',
      name: 'about-us',
      meta: {
        layout: 'default'
      },
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/menu',
      name: 'menu',
      meta: {
        layout: 'default'
      },
      component: () => import('../views/MenuView.vue')
    },
    {
      path: '/reservations',
      name: 'reservations',
      meta: {
        layout: 'default'
      },
      component: () => import('../views/ReservationsView.vue')
    },
    {
      path: '/deals_and_events',
      name: 'deals_and_events',
      meta: {
        layout: 'default'
      },
      component: () => import('../views/DealsAndEventsView.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      meta: {
        layout: 'default'
      },
      component: () => import('../views/ContactView.vue')
    },

    // Admin Route
    {
      path: '/administrator',
      name: 'admin_landing',

      children: [
        {
          path: 'auth',
          name: 'auth',

          children: [
            {
              path: 'login',
              name: 'login',
              meta: {
                layout: 'none'
              },
              component: () => import('../views/admin/auth/LoginView.vue'),
            }
          ]
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          meta: {
            layout: 'admin',
            requiresAuth: true
          },
          component: () => import('../views/admin/DashboardView.vue')
        },
        {
          path: 'settings',
          name: 'settings',
          meta: {
            layout: 'admin',
            requiresAuth: true
          },
          children: [
            {
              path: 'general',
              name: 'general',
              component: () => import('../views/admin/settings/GeneralSettingsView.vue')
            },
            {
              path: 'homepage',
              name: 'homepage',
              component: () => import('../views/admin/settings/HomepageSettingsView.vue')
            },
            {
              path: 'about',
              name: 'about',
              component: () => import('../views/admin/settings/AboutSettingsView.vue')
            },
            {
              path: 'menus',
              name: 'menus',
              component: () => import('../views/admin/settings/MenuSettingsView.vue')
            },
            {
              path: 'deals_events',
              name: 'deals_events',
              component: () => import('../views/admin/settings/DealsSettingsView.vue')
            },
          ]
        },
        {
          path: 'masterdata',
          name: 'masterdata',
          meta: {
            layout: 'admin',
            requiresAuth: true
          },
          children: [
            {
              path: 'master_reservasi',
              name: 'master_reservasi',
              component: () => import('../views/admin/masterdata/MasterReservationsView.vue')
            },
            {
              path: 'master_feedback',
              name: 'master_feedback',
              component: () => import('../views/admin/masterdata/MasterFeedbackView.vue')
            }
          ]
        },
      ]
    },

    // Router Page Not Found
    {
      path: "/:catchAll(.*)",
      name: "NotFound",
      component: () => import('../views/404.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      next({
        path: '/administrator/auth/login',
        query: {
          redirect: to.fullPath,
        },
      })
    }
  }
  next()
})

router.beforeEach(async (to, from, next) => {
  if (to.path === '/administrator/auth/login') {
    const currentUser = await getCurrentUser()
    if (currentUser) {
      next('/administrator/dashboard')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
