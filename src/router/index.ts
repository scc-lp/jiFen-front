import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/landing'
  },
  {
    path: '/landing',
    name: 'Landing',
    component: () => import('../views/Landing.vue'),
    meta: { title: '欢迎页' }
  },
  {
    path: '/login-test',
    name: 'Login',
    component: () => import('../components/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register-test',
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
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: { title: '聊天' }
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
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { title: '关于我们', requiresAuth: true }
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
    // 对于JoinRoom路由，如果有room_code参数，允许未登录访问
    if (token || (to.path === '/join-room' && to.query.room_code)) {
      next();
    } else {
      // 未登录，保存当前URL，然后跳转到登录页
      const currentUrl = window.location.href;
      localStorage.setItem('redirectUrl', currentUrl);
      next('/landing');
    }
  } else {
    // 对于不需要认证的页面，如果已经登录，跳转到首页
    const token = localStorage.getItem('token');
    if (token && to.path === '/login') {
      next('/home');
    } else {
      next();
    }
  }
});

export default router;