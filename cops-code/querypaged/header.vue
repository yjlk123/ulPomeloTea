<script>
    export default {
        name: 'QueryPabedTableHeader',
        props: {
            data: {
                type: Object,
                required: true,
                default: () => {}
            },
            format: {
                type: Array,
                required: false,
                default: () => []
            },
        },
        data() {
            return {

            }
        },
        render(h) {
            let self = this;
            let items = [];
            _.each(this.format, item => {
                let element;
                switch (item.type) {
                    case 'input':
                        element = self.generateInput(h, item.key);
                        break
                    case 'select':
                        element = self.generateSelect(h, item.key, item.options || []);
                        break
                }
                if (element) {
                    items.push(self.generateItem(h, item.label, element));
                }
            });
            // 如果有自定义的放在header中的slot，同时注入
            if(self.$slots.default){
                items.push(self.wrapHeaderSlot(h, self.$slots.default));
            }
            return h('div', {
                class: {
                    'query-paged-table__header': true
                }
            }, [...items]);
        },
        methods: {
            /**
             * 包装传入的headerSlot
             */
            wrapHeaderSlot(h, vnode){
                return h('span', {
                    class: {
                        'query-paged-table__header-item': true
                    },
                    style: {},
                }, [vnode]);
            },
            /**
             * 包装一列到搜索条件列的VNode
             */
            generateItem(h, label, element) {
                let labelItem = h('p', {
                    class: {
                        'query-paged-table__header-item-label': true
                    }
                }, label);
                return h('span', {
                    class: {
                        'query-paged-table__header-item': true
                    },
                    style: {},
                }, [labelItem, element]);
            },
            /**
             * 生成输入框的VNode
             */
            generateInput(h, key) {
                let self = this;
                return h('el-input', {
                    props: {
                        value: self.data[key],
                    },
                    on: {
                        change: (val) => {
                            self.data[key] = val;
                            self.handleQoChange();
                        },
                    },
                });
            },
            /**
             * 生成普通下拉框的VNode
             */
            generateSelect(h, key, options) {
                let self = this;
                let optionComps = [];
                _.each(options, option => {
                    optionComps.push(h('el-option', {
                        props: {
                            label: option.label,
                            value: option.value,
                        }
                    }));
                });
                return h('el-select', {
                    props: {
                        value: self.data[key],
                    },
                    on: {
                        change: (val) => {
                            self.data[key] = val;
                            self.handleQoChange();
                        },
                    },
                }, optionComps)
            },
            /**
             * 触发v-model的变化
             */
            handleQoChange(){
                this.$emit('input', this.data);
            },
        },
    }
</script>

<style>
    .query-paged-table__header {
        margin-bottom: 15px;
    }

    .query-paged-table__header-item {
        display: inline-block;
        margin-right: 5px;
    }

    .query-paged-table__header-item-label {
        margin: 0px;
    }
</style>
