import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Importamos tus variables de colores personalizadas para toda la app
import './css/variables.css' 

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')