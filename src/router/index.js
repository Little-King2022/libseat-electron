import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Reservation from '../views/Reservation.vue'
import User from '../views/User.vue'
import SystemSettings from '../views/SystemSettings.vue'
import ReservationHistory from '../views/ReservationHistory.vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/userStore';

const routes = [
  {
    path: '/',
    redirect: '/user'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/reservation',
    name: 'Reservation',
    component: Reservation
  },
  {
    path: '/reservation-history',
    name: 'ReservationHistory',
    component: ReservationHistory
  },
  {
    path: '/user',
    name: 'User',
    component: User
  },
  {
    path: '/system-setting',
    name: 'SystemSetting',
    component: SystemSettings
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // 定义需要登录才能访问的路由
  const requiresAuth = ['/home', '/reservation', '/reservation-history'];
  
  
  // 如果路由需要认证且用户未登录
  if (requiresAuth.includes(to.path) && !useUserStore().isLoggedIn) {
    ElMessage.warning('请先登录');
    next('/user');
  } else {
    next();
  }
});

export default router