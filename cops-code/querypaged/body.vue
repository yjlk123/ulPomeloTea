<script>
    export default {
        name: 'QueryPagedTableBody',
        props: {
            data: {
                type: Array,
                required: true,
                default: []
            },
            format: {
                type: Array,
                required: true,
                defaul: []
            },
            tableStyles: {
                type: Array,
                required: false,
                default: [],
            },
        },
        data() {
            return {

            }
        },
        /**
         * 渲染函数，根据format动态产生表格
         */
        render(h) {
            let self = this;
            let columnComps = [];
            _.each(this.format, column => {
                if (column.slot) {
                    // 操作等，slot传入时，处理方式不同
                    let scopedSlots = {};
                    if(this.$scopedSlots[column.slot]){
                        scopedSlots.default = self.$scopedSlots[column.slot];
                    }else {
                        console.log('QueryPagedTable Format specify slot which could not be found')
                    }
                    columnComps.push(h('el-table-column', {
                        style: {
                        },
                        props: {
                            label: column.label,
                        },
                        scopedSlots: scopedSlots,
                    }));
                } else {
                    // 普通字段时，直接展示
                    columnComps.push(h('el-table-column', {
                        style: {
                        },
                        props: {
                            prop: column.key,
                            label: column.label,
                        }
                    }));
                }
            });

            // 判断是否需要开启表格某些样式展示
            let isResizable = _.filter(this.tableStyles, item => item == 'resizable').length > 0;
            let showBorder = _.filter(this.tableStyles, item => item == 'border').length > 0;
            let showStripe = _.filter(this.tableStyles, item => item == 'stripe').length > 0;
            let highlightCurrentRow = _.filter(this.tableStyles, item => item == 'highlightCurrentRow').length > 0;

            let tableComp = h('el-table', {
                style: {
                    // minHeight: '500px',
                    width: '100%',
                },
                props: {
                    resizable: isResizable,
                    border: showBorder,
                    stripe: showStripe,
                    highlightCurrentRow: highlightCurrentRow,
                    data: self.data,
                },
            }, [...columnComps]);

            let demo = h => h('div', 'demo');
            return h('div', {
                scopedSlots: {
                },
            }, [tableComp]);
        },
    }
</script>

<style>
</style>
