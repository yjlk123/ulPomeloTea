import Vue from 'vue'
import vuex from 'vuex'

Vue.use(vuex);//安装插件
import dialog_store from '../components/dialog_store.js';//引入某个store对象

export default new vuex.Store({
  modules: {
    dialog: dialog_store
  }
})

