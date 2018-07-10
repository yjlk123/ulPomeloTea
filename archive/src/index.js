import dva from 'dva';
import './index.css';
import router from './routes/router'
import Models from './models'
import { asEffect } from 'redux-saga/utils';
import { Form,Input,Button} from 'antd'

// 1. Initialize
const app = dva({
    initialState: {
        // products: [
        //     {   
        //         key:1,
        //         name: 'dva',
        //         id: 1
        //     }, {
        //         key:2,
        //         name: 'antd',
        //         id: 2
        //     }
        // ]
    },
    history:null,
});

// 2. Plugins app.use({});

// 3. Model
Models.forEach(m=>{
    app.model(m)
})


// 4. Router app.router(require('./routes/router').default);
app.router(router);

// 5. Start
app.start('#root');

