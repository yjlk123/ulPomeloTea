<template>
  <div id="app">
    <h1 v-text="title"></h1>
    <input v-model="newItem" v-on:keyup.enter="addNew"/>

    <!--父向子通信-->
    <child-component v-bind:msgfromfather = "items"></child-component>
    <!--&lt;!&ndash;子向父通信&ndash;&gt;-->
    <!--<p>msg from child : {{wordsfromchild}}</p>-->
    <!--<child-component v-on:msg-from-child="listenToSon"></child-component>-->

  </div>
</template>

<script>
  import childComponent from './components/childComponent'
  import {mapActions } from 'vuex';
  import store from './store'


  export default {
  components: {childComponent},//位置一定要放最前面才行
  data() {//要复用组件的时候data必须是一个函数
    return {
      title: 'my todo list',
      items: [],
      newItem: '',
    }
  },
  methods:{
    addNew: function () {
      console.log(this.newItem);//记得必须在data里注册
      this.items.push({
        label: this.newItem,
        isFinished: false
      })
        this.newItem = '';//这里也是双向绑定，在这里重置后会同步显示到input控件

      //this.$store.dispatch('switch_dialog',this.items);
      //this.$store.dispatch({type: 'switch_dialog', show: this.items})
      this.$store.commit('switch_dialog',this.items)
      console.log("3333333333")
      console.log(this.$store.state.dialog.show);

    },
    //this.$store.dispatch('switch_dialog',items)
    // ...mapActions({
    //
    // })

  // listenToSon: function (msg) {
    //   this.wordsfromchild = msg;
    // }

  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
