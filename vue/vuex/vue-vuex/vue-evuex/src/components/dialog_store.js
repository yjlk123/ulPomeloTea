export default {
  state:{
    //获得状态 show使用 : $store.state.dialog.show
    show: []
  },
  getters:{//get. $store.getters.not_show 的值是不能直接修改的 , 需要对应的 state 发生变化才能修改。
    //getters 和 vue 中的 computed 类似 , 都是用来计算 state 然后生成新的数据 ( 状态 ) 的。
    //获得状态 not_show : 使用 $store.getters.not_show
    not_show(state){//这里的state对应着上面这个state
      return !state.show;
    }
  },
  mutations:{//set   mutations 中的方法是不分组件的 ,mutations里的操作必须是同步的。
    //触发 mutations 中的 switch_dialog 方法:  $store.commit('switch_dialog')
    switch_dialog(state,a){//这里的state对应着上面这个state
      state.show = a;///////////?
      //你还可以在这里执行其他的操作改变state
    }
  },
  actions:{//需要执行多个 mutations 就需要用 action.  和mutations类似。不过actions支持异步操作
    //触发 action 里的 switch_dialog 方法:  $store.dispatch('switch_dialog')
    switch_dialog(context){//这里的context和我们使用的$store拥有相同的对象和方法
      context.commit('switch_dialog');
      //你还可以在这里触发其他的mutations方法
    },
  }
}

//对于模块内部的 mutation 和 getter，接收的第一个参数是模块的局部状态对象

//同样，对于模块内部的 action，局部状态通过 context.state 暴露出来，根节点状态则为 context.rootState
//incrementIfOddOnRootSum ({ state, commit, rootState }) {}

//对于模块内部的 getter，根节点状态会作为第三个参数暴露出来
//sumWithRootCount (state, getters, rootState, rootGetter) {}
