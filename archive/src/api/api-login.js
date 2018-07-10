import Axios from 'axios'
const login=()=>{
	return Axios.get('/login')
}
export default {
	login
}
