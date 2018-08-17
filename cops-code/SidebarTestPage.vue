<template>
    <div>
        <p>
            <el-button @click="collapseSidebar" type="primary" plain>展开/折叠</el-button>
        </p>
        <div class="content">
            <b-sidebar ref="sidebar" :columns="columns">
                <testa slot="testA" />
                <testb slot="testB" />
            </b-sidebar>
        </div>
    </div>
</template>

<script>
    import BIOPSidebarFormat from '../common/sidebar-format-biop'
    import TestA from '../components/TestSidebarCompA.vue'
    import TestB from '../components/TestSidebarCompB.vue'

    export default {
        name: 'SidebarTestPage',
        components: {
            'testa': TestA,
            'testb': TestB,
        },
        data() {
            return {
                columns: BIOPSidebarFormat,
            }
        },
        methods: {
            collapseSidebar() {
                if (this.$refs.sidebar) {
                    this.$refs.sidebar.triggleCollapse();
                }
            }
        },
    }
</script>

<style scoped>
    div.content {
        position: fixed;
        top: 70px;
        display: inline-block;
        bottom: 0px;
        background: #9e9e9e78;
        left: 0px;
        right: 0px;
    }
</style>
