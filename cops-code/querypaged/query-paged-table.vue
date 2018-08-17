<script>
    import Header from './header.vue'
    import Body from './body.vue'
    import Footer from './footer.vue'

    export default {
        name: 'b-query-paged-table',
        components: {
            'qpt-header': Header,
            'qpt-body': Body,
            'qpt-footer': Footer,
        },
        props: {
            qo: {
                type: Object,
                required: false,
                default: () => {}
            },
            format: {
                type: Object,
                required: true,
                default: () => {}
            },
            data: {
                type: Array,
                required: true,
                default: () => []
            },
            pageNum: {
                type: Number,
                required: false,
                default: 1,
            },
            pageSize: {
                type: Number,
                required: false,
                default: 1,
            },
            itemCount: {
                type: Number,
                required: false,
                default: 0,
            },
        },
        computed: {
            /**
             * 是否展示头部搜索条件栏目
             */
            showHeader() {
                return this.format.query.length > 0;
            },
            /**
             * 组件是否需要分页
             */
            isPaged() {
                return this.format.paged || false;
            }
        },
        data() {
            return {
            }
        },
        render(h){
            let self = this;
            let parts = [];
            // 渲染头部,如果头部有slot，同时注入（header-item）
            if(this.showHeader){
                parts.push(h('qpt-header', {
                    props: {
                        data: self.qo || {},
                        format: self.format.query,
                    },
                }, [...self.$slots['header-item']]));
            }
            // 渲染主体信息
            parts.push(h('qpt-body', {
                props: {
                    data: self.data,
                    format: self.format.columns,
                    tableStyles: self.format.tableStyles || []
                },
                scopedSlots: {
                    ...self.$scopedSlots
                },
            }));
            // 渲染底部分页信息
            if(this.isPaged){
                parts.push(h('qpt-footer', {
                    props: {
                        pageSize: self.pageSize,
                        pageNum: self.pageNum,
                        itemCount: self.itemCount,
                    },
                    on: {
                        change: (val) => {
                            self.$emit('page-change', val);
                        }
                    },
                }));
            }
            let comp = h('div', {}, parts);
            return comp;
        },
        methods: {

        },
    }
</script>

<style>
    div.query-paged-table {}
</style>
