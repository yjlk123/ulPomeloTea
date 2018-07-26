<template>
  <div class="hello">
    <ul>
      <li v-for="item in items" v-on:click="toggleFinish(item)" v-bind:class="{finished: item.isFinished}">
        {{item.label}}
      </li>
    </ul>
  </div>
</template>

<script>
  import EventBus from './EventBus'

  export default {
    name: 'childComponent',
    data () {//es6的简写
      return {
        items: []
      }
    },
    created (){
      EventBus.$on("transfer-to-child", this.showDataFromParent);
    },
    methods:{
      showDataFromParent(parentData){
        console.log(parentData);
        this.items = parentData;
      },
      toggleFinish: function(item){
        item.isFinished = !item.isFinished;
      },

    },
    beforeDestroy() {
      EventBus.$off("transfer-to-child", this.showDataFromParent);

    }

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .finished{
    text-decoration:line-through;
  }

</style>
