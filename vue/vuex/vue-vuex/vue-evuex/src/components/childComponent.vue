<template>
  <div class="hello">
    <ul>
      <li v-for="item in msgfromparent" v-on:click="toggleFinish(item)" v-bind:class="{finished: item.isFinished}">
        {{item.label}}
      </li>
    </ul>
    <!--测试用-->
    <p>{{freshdata}}</p>
  </div>
</template>

<script>
  import store from '../store'
  import {mapState} from 'vuex'

  export default {
    name: 'childComponent',
    data () {
      return {
        msgfromparent: [],
      }
    },
    mounted(){
      console.log("22222");
    },
    computed: {//第一次mounted就已经运行这个函数了
    // ...mapState(
    //     //this.msgfromparent = state.dialog.show
    //   )
    freshdata: function () {

        // console.log("11111");
        // console.log(this.$store.state.dialog.show);
      this.msgfromparent = this.$store.state.dialog.show;
        return this.$store.state.dialog.show;
      }
    },
    methods:{
      saveItems(items){
        this.msgfromparent = items;
      },
      toggleFinish: function(item){
        item.isFinished = !item.isFinished;
      },

    },
    beforeDestroy() {
    }
    }
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .finished{
    text-decoration:line-through;
  }
</style>
