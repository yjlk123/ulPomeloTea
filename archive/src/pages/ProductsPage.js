import React from 'react';
import {connect} from 'dva'
import ProductList from '@/components/ProductList'
//import { changeConfirmLocale } from '_antd@3.6.5@antd/lib/modal/locale';////这个包暂时解析不了，先注释掉
// 完成了model和component,动过connect串联起来
const Products = ({dispatch, products}) => {
    function handleDelete(id) {
        dispatch({type: 'products/delete', payload: id})
    }
    return (
        <div>
            <h2>List of Products</h2>
            <ProductList onDelete={handleDelete} products={products}></ProductList>
        </div>
    )
}
// export default Products connect方法返回的也是一个react组件,通常称为容器组件
// 因为他是原始UI组建的容器,即在外面包了一层State, 
// 被connect的Component会自动在props中拥有dispatch方法
export default connect(({products}) => ({products}))(Products);
