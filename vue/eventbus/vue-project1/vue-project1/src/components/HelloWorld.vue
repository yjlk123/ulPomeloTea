<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button v-on:click="onClickMe"></button>
  </div>
</template>

<script>
export default {
  name: 'helloWorld',/////////?
  data () {//es6的简写
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  methods:{
    onClickMe: function () {

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
