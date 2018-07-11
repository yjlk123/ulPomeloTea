import React from 'react';
import {connect} from 'dva'
import ManagementTab from '@/components/management/ManagementTab'

//人员管理Tab页面
const Management = ({dispatch, products}) => {
	// function handleDelete(id) {
	// 	dispatch({type: 'products/delete', payload: id})
	// }
	return (
		<div>
			<ManagementTab products={products}></ManagementTab>
		</div>
	)
}

// export default Products connect方法返回的也是一个react组件,通常称为容器组件
// 因为他是原始UI组建的容器,即在外面包了一层State, 
// 被connect的Component会自动在props中拥有dispatch方法
export default connect(({products}) => ({products}))(Management);
