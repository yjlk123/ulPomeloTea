/**
 * 模拟BIOP中数据源管理，提供类似的QueryPagedTable模板
 */

export default {
    paged: true,
    query: [{
            label: '数据源名称',
            type: 'input',
            key: 'name'
        },
        {
            label: '数据源类型',
            type: 'select',
            key: 'type',
            options: [
                { label: 'a', value: 1 },
                { label: 'b', value: 2 },
                { label: 'c', value: 3 },
                { label: 'd', value: 4 },
                { label: 'e', value: 5 },
            ],
        },
    ],
    tableStyles: ['border', 'stripe', 'highlightCurrentRow', 'resizable'],
    tableCheckable: 'none',
    columns: [{
            label: '数据源名称',
            key: 'name',
            value: val => {
                return val
            },
            fixed: true,
        },
        {
            label: '数据源类型',
            key: 'type',
            value: val => {
                return val
            }
        },
        {
            label: '操作',
            slot: 'operations'
        }
    ]
}