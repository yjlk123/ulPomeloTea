<template>
  <div class="hello">
    <button v-on:click="onClickMe">click me</button>
    <!--<p>{{msgfromfather}}</p>&lt;!&ndash;这里就可以取到了，因为从父组件传过来的时候已经赋值了&ndash;&gt;-->
  </div>
</template>

<script>
  export default {
    name: 'componentA',/////////?
    data () {//es6的简写
      return {
        msg: 'Welcome to Your Vue.js App'
      }
    },
    props: ['msgfromfather'],//字符串的形式
    methods:{
      onClickMe: function () {
        console.log(this.msgfromfather);//这样访问父组件传过来的数据，和一般的data一样的方式
        this.$emit('child-tell-me',this.msg);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
