import React from 'react';
import styles from './LoginPage.css'
import {connect} from 'dva'
import {Form, Icon, Input, Button, Checkbox} from 'antd';
import Axios from 'axios'
import Mock from 'mockjs'

const FormItem = Form.Item;
// 配置拦截ajax请求时的行为 表示响应时间为200到400毫秒
Mock.setup({timeout: '200-400'})
Mock.mock('/login', {
    'login|Info': {
        'code': 0,
        'msg': '登录成功'
    }
})

class LoginForm extends React.Component {
    handleSubmit = (e) => {
        e.preventDefault();
        this
            .props
            .form
            .validateFields((err, values) => {
                if (!err) {
                    // this.props.dispatch({ 	type:'login/changeState', 	payload:values} )
                    this
                        .props
                        .dispatch({type: 'login/login', payload:values})
                    // 2 Axios.get('/login') 	.then(function (response) { 		console.log(response);
                    // 	}) 	.catch(function (error) { 		console.log(error); 	});
                }
            });
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {
                    span: 4
                }
            },
            wrapperCol: {
                xs: {
                    span: 16,
                    offset: 4
                }
            }
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0
                }
            }
        }
        return (
            <div className={styles.loginPage}>
                <h2 className={styles.title}>智慧卫生间系统</h2>
                <Form onSubmit={this.handleSubmit} className={styles.loginForm}>
                    <FormItem {...formItemLayout} label="账 号">
                        {getFieldDecorator('userName', {
                            initialValue: this.props.login.userName,
                            rules: [
                                {
                                    required: true,
                                    message: '请输入手机号码/邮箱'
                                }
                            ]
                        })(
                            <Input
                                prefix={< Icon type = "user" style = {{ color: 'rgba(0,0,0,.25)' }}/>}
                                placeholder="请输入手机号码/邮箱"/>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="密 码">
                        {getFieldDecorator('password', {
                            initialValue: '222',
                            rules: [
                                {
                                    required: true,
                                    message: '请输入登录密码'
                                }
                            ]
                        })(
                            <Input
                                prefix={< Icon type = "lock" style = {{ color: 'rgba(0,0,0,.25)' }}/>}
                                type="password"
                                placeholder="请输入登录密码"/>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="验证码"></FormItem>
                    <FormItem {...tailFormItemLayout}>
                        {getFieldDecorator('remember', {
                            valuePropName: 'checked',
                            initialValue: true
                        })(
                            <Checkbox>记住登录状态</Checkbox>
                        )}
                        <a className={styles.loginFormForgot} href="">忘记密码?</a>
                        <Button type="primary" htmlType="submit" className={styles.loginFormButton}>
                            登 录
                        </Button>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

// export default Products connect方法返回的也是一个react组件,通常称为容器组件
// 因为他是原始UI组建的容器,即在外面包了一层State, 被connect的Component会自动在props中拥有dispatch方法
const WrappedNormalLoginForm = Form.create()(LoginForm);

export default connect(
	({login}) => ({login})
)(WrappedNormalLoginForm);
