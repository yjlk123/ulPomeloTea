<template>
    <div>
        <p>自封组件</p>
        <b-query-paged-table :qo="qo" :data="datasources" :format="tableFormat" :pageNum="qo.pageNum" :pageSize="qo.pageSize" :itemCount="qo.datasourceCount" @page-change="handlePageChange">
            <div slot="header-item">
                <el-button @click="search" type="success" round>查询</el-button>
            </div>
            <template slot="operations" slot-scope="scope">
                <span @click="handleDelete(scope.row)">删除</span>
            </template>
        </b-query-paged-table>
    </div>
</template>

<script>
    import DatasourcesQTableFormat from '../common/qtable-format-datasources'
    export default {
        name: 'QueryPagedTableTestPage',
        data() {
            return {
                qo: {
                    name: 'abcd',
                    type: 4,
                    pageNum: 10,
                    pageSize: 30,
                    datasourceCount: 150,
                },
                tableFormat: DatasourcesQTableFormat,
                datasources: [{
                        name: 'a',
                        type: '数据库'
                    },
                    {
                        name: 'b',
                        type: '数据库'
                    },
                    {
                        name: 'c',
                        type: '数据库'
                    },
                    {
                        name: 'd',
                        type: '数据库'
                    },
                    {
                        name: 'e',
                        type: '数据库'
                    },
                    {
                        name: 'f',
                        type: '数据库'
                    },
                    {
                        name: 'h',
                        type: '数据库'
                    },
                    {
                        name: 'i',
                        type: '数据库'
                    },
                ],
            }
        },
        methods: {
            search() {
                console.log(JSON.stringify(this.qo));
            },
            handleDelete(ds) {
                console.log('Delete ' + ds.name);
            },
            handlePageChange(qo){
                // 更新分页信息, 通常需要重新获取数据
                this.qo.pageSize = qo.pageSize;
                this.qo.pageNum = qo.pageNum;
                this.qo.pageSize = qo.pageSize;
            },
        },
    }
</script>

<style>
</style>
