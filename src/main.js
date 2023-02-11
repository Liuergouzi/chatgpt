import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import axios from 'axios'
axios.defaults.headers={ 'content-type': 'application/json', 'Authorization': 'Bearer ' + '你的apikey' }	//	请求数据的json主体编码

//按需引入vant
import 'vant/lib/index.css'
import { Toast } from "vant"
import { Popup } from "vant"
import { Slider } from "vant"
import { Switch } from "vant"



createApp(App).use(store).use(router).use(Toast).use(Popup).use(Slider).use(Switch).mount('#app')
