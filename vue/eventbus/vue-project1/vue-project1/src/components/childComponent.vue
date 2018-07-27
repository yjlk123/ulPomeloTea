<template>
  <div class="hello">
    <ul>
      <li v-for="item in msgfromparent" v-on:click="toggleFinish(item)" v-bind:class="{finished: item.isFinished}">
        {{item.label}}
      </li>
    </ul>

  </div>
</template>

<script>
  import EventBus from './EventsBus'

  export default {
    name: 'childComponent',
    data () {
      return {
        msgfromparent: [],
      }
    },
    created() {
      EventBus.$on("msg-from-parent", this.saveItems);
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
      EventBus.$off("msg-from-parent", this.saveItems);
    }
    }
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .finished{
    text-decoration:line-through;
  }
</style>
