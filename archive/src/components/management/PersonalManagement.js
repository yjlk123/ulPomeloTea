import React from 'react'
import PropTypes from 'prop-types'
import { DatePicker ,Select } from 'antd';
import moment from 'moment';


const PersonalManagement = ({onDelete, products}) => {
	//选择入职时间
	const { MonthPicker, RangePicker } = DatePicker;
	const dateFormat = 'YYYY/MM/DD';
	const monthFormat = 'YYYY/MM';

	//选择年龄
	//注意这里用的是选择框而不是下拉框
	const Option = Select.Option;
	function handleChange(value) {
		console.log(`selected ${value}`);
	}
	
	
	return(<div>
		<div>
			<span>入职时间</span>
			<DatePicker defaultValue={moment('2018/07/01', dateFormat)} format={dateFormat} />
			<span>年龄</span>
			<Select defaultValue="lucy" style={{ width: 120 }} onChange={handleChange}>
				<Option value="18-25">18-25</Option>
				<Option value="25-35">25-35</Option>
				<Option value="35-45">35-45</Option>
			</Select>
		</div>
		
		<div></div>
	</div>)
}


PersonalManagement.propTypes = {
	onDelete: PropTypes.func.isRequired,
	products: PropTypes.array.isRequired
}

export default PersonalManagement
