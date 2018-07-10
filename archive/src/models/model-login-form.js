// 处理数据和逻辑 dva通过model的概念吧一个领域的模型管理起来 
// 包含同步更新state的reducers 处理异步的effects
// 订阅数据源的subscriptions
import  { loginApi }  from '@/api'
export default {
    // model的命名空间,全局state上的属性(key),只能用字符串,不支持通过.的方式创建多层命名空间
    namespace: 'login',

    // 是初始值,优先级低于传给dva()的opts.initialState
		// 表示model的数据状态,操作的时候每次都要当做不可变数据来对待
		// 保证每次都是全新对象, 没有引用关系,这样才能保证state的独立性,便于测试和追踪变化
    state: {
        userName: 111,
        password: 111
    },

    // 以key/value的格式定义subscription 用于订阅一个数据源,然后根据需要dispatch相应的action
    // 在app.start()时被执行,数据源可以是当前的时间,副武器的websocket连接,keyboard的输入,
    // geolocation变化,history路由变化等
    subscriptions: {},

    // 以key/value的格式定义effect 用于处理异步操作和业务逻辑,不直接修改state
    // 由action触发,可以触发action,可以和服务器交互,可以获取全局state的数据等
    // 异步操作,底层引入了redux-sagas做异步流程控制,将异步转换成同步写法
    effects: {
			*login({ payload: values },{put,call}){
				const res = yield call(loginApi.login)
				console.log('res')
				console.log(res)
				yield put({type:'login.changeState'},{payload:values})
			},
			// *login({
			// 		payload
			// }, {call, put}) {
			// 		yield put({type: 'changeState'});
			// }
		},

    // 以key/value的格式定义reducer 用于处理同步操作,是唯一可以修改state的地方 由action触发
    // 之前被累积的结果和当前要被累积的值,该函数把集合归并成一个单值 必须是纯函数
    reducers: {
			changeState(state,{payload:values}){
				console.log(values)
				console.log('state changed')
				return {...values}
			}
		}
}
