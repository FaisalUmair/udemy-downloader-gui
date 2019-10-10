import Vue from 'vue'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import 'element-ui/lib/theme-chalk/index.css'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons'
import 'tailwindcss/dist/tailwind.css'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

Vue.use(ElementUI,{locale})

Vue.component('v-icon', Icon)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')