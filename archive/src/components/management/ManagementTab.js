import React from 'react'
import PropTypes from 'prop-types'
import { Tabs } from 'antd';

// 用于人员管理和角色管理的Tab组件
const TabPane = Tabs.TabPane;

function callback(key) {
	console.log(key);
}

const ManagementTab = ({onDelete, products}) => {
	return(
		<Tabs defaultActiveKey="1" onChange={callback}>
			<TabPane tab="员工管理" key="1">Content of Tab Pane 1</TabPane>
			<TabPane tab="角色管理" key="2">Content of Tab Pane 2</TabPane>
		</Tabs>)
}


ManagementTab.propTypes = {
	onDelete: PropTypes.func.isRequired,
	products: PropTypes.array.isRequired
}

export default ManagementTab
