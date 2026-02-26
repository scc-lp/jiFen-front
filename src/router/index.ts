import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../components/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../components/ForgotPassword.vue'),
    meta: { title: '忘记密码' }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页', requiresAuth: true }
  },
  {
    path: '/create-room',
    name: 'CreateRoom',
    component: () => import('../views/CreateRoom.vue'),
    meta: { title: '创建房间', requiresAuth: true }
  },
  {
    path: '/join-room',
    name: 'JoinRoom',
    component: () => import('../views/JoinRoom.vue'),
    meta: { title: '加入房间', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/room-detail/:roomId',
    name: 'RoomDetail',
    component: () => import('../views/RoomDetail.vue'),
    meta: { title: '房间详情', requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = to.meta.title as string || '记分器';
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      next();
    } else {
      // 未登录，跳转到登录页
      next('/login');
    }
  } else {
    next();
  }
});

export default router;