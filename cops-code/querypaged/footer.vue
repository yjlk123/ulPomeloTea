<template>
    <el-pagination class="query-paged-table__footer" @current-change="handleCurrentChange" :current-page="pageNum" :page-sizes="[10, 20, 30, 40, 50]"
        :page-size="pageSize" @size-change="handleSizeChange" layout="total, sizes, prev, pager, next, jumper" :total="itemCount">
    </el-pagination>
</template>

<script>
    export default {
        name: 'QueryPagedTableFooter',
        props: {
            // 仅仅是初始pageNum
            initPageNum: {
                type: Number,
                required: false,
                default: 1,
            },
            // 仅仅是初始pageSize
            initPageSize: {
                type: Number,
                required: false,
                default: 20,
            },
            itemCount: {
                type: Number,
                required: false,
                default: 0
            },
        },
        data() {
            return {
                pageNum: this.initPageNum || 1,
                pageSize: this.initPageSize || 20,
            }
        },
        methods: {
            handleSizeChange(val){
                this.pageSize = val; 
                this.emitRefetch();
            },
            handleCurrentChange(val) {
                this.pageNum = val;
                this.emitRefetch();
            },
            emitRefetch() {
                this.$emit('change', {
                    pageNum: this.pageNum,
                    itemCount: this.itemCount,
                    pageSize: this.pageSize,
                });
            },
        },
    }
</script>

<style>
    .query-paged-table__footer {
        margin-top: 10px;
    }
</style>
