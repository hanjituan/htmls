import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'virtual:windi.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { useTheme } from '@/utils/theme'

const app = createApp(App)

// 初始化主题
const { initTheme } = useTheme()
initTheme()

app.use(ElementPlus)
app.use(router)
app.use(store)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app') 