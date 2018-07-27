<template>
  <div class="footera"><!--必须用这样的包起来-->
  <p>{{msg}}</p>
  <a v-on:clicl="onClickMe" href=#>show all</a>
  </div>
</template>

<script>

  export default {
    name: "footerA",
    props: ['msgfromfather'],//字符串的形式
    data () {//es6的简写
      return {
        msg: this.msgfromfather//访问props，要加this
      }
    },
    methods:{
      onClickMe: function () {
        console.log(this.msgfromfather);//这样访问父组件传过来的数据，和一般的data一样的方式
        //   console.log(items);
        // });

      }
    }

  }
</script>

<style scoped>

</style>
