import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from './router'
import 'vant/lib/index.css'; // 必须引入这个样式文件

const app = createApp(App)
app.use(router)
app.mount('#app')
