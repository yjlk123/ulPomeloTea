/**
 * 封装一个BIOP用的侧边栏格式
 */

export default [{
        label: '路由测试',
        links: [{
                label: '首页',
                route: {
                    name: 'index'
                }
            },
            {
                label: 'segmentRadio',
                route: {
                    name: 'SegmentRadio'
                }
            },
            {
                label: 'verticalSegmentRadio',
                route: {
                    name: 'VerticalSegmentRadio'
                }
            },
            {
                label: 'QueryPagedTable',
                route: {
                    name: 'QueryPagedTable'
                }
            },
        ],
    },
    {
        label: '分析主题',
        icon: require('../assets/icons/nav_left_42.png'),
        component: 'testA',
    },
    {
        label: '设备树',
        icon: require('../assets/icons/nav_left_42.png'),
        component: 'testB',
    },
    {
        label: '数据管理',
        icon: require('../assets/icons/nav_left_43.png'),
        links: [{
                label: '数据源管理',
                icon: require('../assets/icons/nav_left_49.png'),
                route: {
                    name: 'index'
                }
            },
            {
                label: '设备管理',
                icon: require('../assets/icons/nav_left_50.png'),
                route: {
                    name: 'SegmentRadio'
                }
            },
            {
                label: '资产管理',
                icon: require('../assets/icons/nav_left_63.png'),
                route: {
                    name: 'VerticalSegmentRadio'
                }
            },
            {
                label: '资产群组管理',
                icon: require('../assets/icons/nav_left_40.png'),
                route: {
                    name: 'QueryPagedTable'
                }
            },
        ],
    },
    {
        label: '报警管理',
        icon: require('../assets/icons/nav_left_44.png'),
        links: [{
                label: '规则组',
                icon: require('../assets/icons/nav_left_51.png')
            },
            {
                label: '规则',
                icon: require('../assets/icons/nav_left_52.png')
            },
            {
                label: '知识库',
                icon: require('../assets/icons/nav_left_53.png')
            },
            {
                label: '报警统计',
                icon: require('../assets/icons/nav_left_54.png')
            },
            {
                label: '报警日志',
                icon: require('../assets/icons/nav_left_55.png')
            },
            {
                label: '规则类型',
                icon: require('../assets/icons/nav_left_56.png')
            },
        ],
    },
    {
        label: '计算模型',
        icon: require('../assets/icons/nav_left_45.png'),
        links: [{
                label: 'NBLab',
                icon: require('../assets/icons/nav_left_57.png')
            },
            {
                label: '任务管理',
                icon: require('../assets/icons/task-manager.png')
            },
        ],
    },
    {
        label: '其他',
        icon: require('../assets/icons/nav_left_46.png'),
        links: [{
                label: '用户自助',
                icon: require('../assets/icons/nav_left_58.png')
            },
            {
                label: '项目管理',
                icon: require('../assets/icons/nav_left_56.png')
            },
            {
                label: '应用设置',
                icon: require('../assets/icons/nav_left_59.png')
            },
            {
                label: '用户和权限设置',
                icon: require('../assets/icons/nav_left_61.png')
            },
            {
                label: '其他设置',
                icon: require('../assets/icons/nav_left_62.png')
            },
            {
                label: '系统日志',
                icon: require('../assets/icons/report_management.png')
            },
        ],
    },
]