<template>
  <div id="app">
    <h1 v-text="title"></h1>
    <input v-model="newItem" v-on:keyup.enter="addNew"/>
    <!--<p>child tells me : {{childwords}}</p>-->
    <!--<component-a msgfromfather="father tell u"-->
    <!--v-on:child-tell-me="listenToMyBoy"></component-a>-->
    <ul>
      <li v-for="item in items" v-on:click="toggleFinish(item)" v-bind:class="{finished: item.isFinished}">
        {{item.label}}
      </li>
    </ul>
    <footer-a v-bind:msgfromfather = "items"></footer-a><!--用一个变量进行动态赋值需要 `v-bind` 来告诉 Vue 这是一个 JavaScript 表达式而不是一个字符串。-->
  </div>
</template>

<script>
  import componentA from './components/componentA'
  import footerA from './components/footerA'
  // import eventBus from './components/eventsbus'


  export default {
  components: {componentA,footerA},//位置一定要放最前面才行
  data() {//要复用组件的时候data必须是一个函数
    return {
      title: 'my todo list',
      items: [],
      newItem: '',
      childwords: ''
    }
  },
  methods:{
    toggleFinish: function(item){
      item.isFinished = !item.isFinished;
    },
    addNew: function () {//这里调用的地方直接传值是不行的，因为input的值是通过v-model来获取
      console.log(this.newItem);//记得必须在data里注册
      this.items.push({
        label: this.newItem,
        isFinished: false
      })
      this.newItem = '';//这里也是双向绑定，在这里重置后会同步显示到input控件
      // eventBus.$emit("transfer-to-child", this.items);
    },
    // listenToMyBoy: function (msg) {
    //   this.childwords = msg;
    // }

  }
}
</script>

<style>
  .finished{
    text-decoration:line-through;
  }
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
