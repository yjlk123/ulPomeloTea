import React from 'react'
import PropTypes from 'prop-types'
import {Table, Popconfirm, Button} from 'antd'
// 多个页面共享的UI提取成component 
const ProductList = ({onDelete, products}) => {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name'
        }, {
            title: "Actions",
            render: (text, record) => {
                return (
                    <Popconfirm title="Delete?" onConfirm={() => onDelete(record.id)}>
                        <Button>Delete</Button>
                    </Popconfirm>
                )
            }
        }
    ]
    return (<Table dataSource={products} columns={columns}/>)
}

ProductList.propTypes = {
    onDelete: PropTypes.func.isRequired,
    products: PropTypes.array.isRequired
}

export default ProductList
