import { createApp } from 'vue'
import Avatar from './Avatar.vue'


const app = createApp({})
app.component('Avatar',Avatar)
app.mount('#avatareditor')


console.log(import.meta.env.VITE_JWT_TOKEN)

