<template>
    <el-cascader v-model="chosenVal" :options="actualLocations" @active-item-change="handleItemChange" @change="handleChange"
    />
</template>
}
<script>
    export default {
        name: "b-location-selector",
        props: {
            value: {
                type: Array,
                required: true,
                default: () => []
            },
            levelLimit: {
                type: Number,
                required: false,
                default: 1,
            },
            valueKey: {
                type: String,
                required: false,
            },
            labelKey: {
                type: String,
                required: false,
            },
            childrenKey: {
                type: String,
                required: false,
            },
            disabledKey: {
                type: String,
                required: false,
            },
        },
        computed: {
            /**
             * 给Element组件使用的格式的对象
             */
            actualLocations() {
                // 构建给ElementUI使用的格式
                let options = [];
                // 过滤levelLimit一下的所有地区
                let locationNodes = _.filter(this.locationNodes, node => node.level <= this.levelLimit );
                _.each(locationNodes, node => {
                    // 顶级地区（省份）
                    if (node.parentId == null) {
                        let rootLocation = {
                            ...node,
                        };
                        if (this.levelLimit != 1) {
                            rootLocation.children = [];
                        }
                        options.push(rootLocation);
                    } else {
                        let parents = [];
                        let parentIdPointer = node.parentId;
                        while (parentIdPointer != null) {
                            let tmpParent = _.find(this.locationNodes, parent => parent.value ==
                                parentIdPointer);
                            if (tmpParent) {
                                parents.push(tmpParent);
                                parentIdPointer = tmpParent.parentId;
                            }
                        }
                        if (parents.length > 0) {
                            // 倒序遍历parents，找到在嵌套结构中对应对象节点，增加children
                            let i = parents.length - 1;
                            let tmpLocationPointer = null;
                            let tmpLocationsPointer = options;
                            while (i >= 0) {
                                tmpLocationPointer = _.find(tmpLocationsPointer, op => {
                                    return op.value == parents[i].value
                                });
                                i--;
                                if (tmpLocationPointer) {
                                    tmpLocationsPointer = tmpLocationPointer.children || [];
                                }
                            }
                            if (tmpLocationPointer != null) {
                                // 指到了直接父节点
                                let toInsertChildNode = { ...node
                                };
                                // 如果层级到了levelLimit，不初始children
                                if (parents.length + 1 < this.levelLimit) {
                                    toInsertChildNode.children = [];
                                }
                                if (tmpLocationPointer.children) {
                                    tmpLocationPointer.children.push(toInsertChildNode);
                                } else {
                                    tmpLocationPointer.children = [toInsertChildNode];
                                }
                            }
                        }
                    }
                });
                return options;
            },
            actualLabelKey() {
                return this.labelKey == null || this.labelKey == '' ? 'label' : this.labelKey;
            },
            actualValueKey() {
                return this.valueKey == null || this.valueKey == '' ? 'value' : this.valueKey;
            },
            actualChildrenKey() {
                return this.childrenKey == null || this.childrenKey == '' ? 'children' : this.childrenKey;
            },
            actualDisabledKey() {
                return this.disabledKey == null || this.disabledKey == '' ? 'disabled' : this.disabledKey;
            },
        },
        data() {
            return {
                chosenVal: [],
                locationNodes: [],
            };
        },
        created() {
            this.fillLocationOptions([]);
        },
        methods: {
            /**
             * 添加单个地点的方法
             */
            addLocation(parentId, location) {
                let self = this;
                let parentLevel = this.getNodeLevel(parentId);
                if (parentLevel == this.levelLimit) {
                    console.log('已经到达层级上限，无法添加');
                    return;
                }
                let existedNode = _.find(this.locationNodes, node => node.value == location[this.actualValueKey]);
                if (existedNode) {
                    // 已存在，添加其children
                    _.each(location[this.childrenKey], child => {
                        self.addLocation(existedNode.value, child, existedNode.level);
                    });
                } else {
                    let actualToAddLocations = this.flatLocation(parentId, location, parentLevel ? parentLevel : 0);
                    _.each(actualToAddLocations, tmpLocation => {
                        this.locationNodes.push(tmpLocation);
                    });
                }
            },
            /**
             * 触发fillLocation信息的事件
             */
            fillLocationOptions(values) {
                // 如果不存在子节点信息，则触发获取，否则直接用组件内数据
                if (values.length < 1) {
                    this.$emit('fill-locations', values);
                } else {
                    let lastValue = values[values.length - 1];
                    if (this.getChildrenNodes(lastValue).length < 1) {
                        this.$emit('fill-locations', values);
                    }
                }
            },
            /**
             * 点击某个district时回调
             */
            handleItemChange(items) {
                let tmpLevel = 0;
                // 当层级不够,或者对应层级底下无数据时，触发获取
                if (items.length < this.levelLimit || _.filter(this.locationNodes, node => node.parentId == items[items
                        .length - 1][this.actualValueKey]) == 0) {
                    let nodes = [];
                    _.each(this.locationNodes, node => {
                        if (items.indexOf(node.value) >= 0) {
                            nodes.push(node);
                        }
                    });
                    this.fillLocationOptions(nodes);
                }
            },
            /**
             * 选择完毕的回调
             */
            handleChange(values) {
                let locations = [];
                _.each(this.locationNodes, node => {
                    if (values.indexOf(node.value) >= 0) {
                        let tmpLocation = {};
                        tmpLocation[this.actualLabelKey] = node.label;
                        tmpLocation[this.actualValueKey] = node.value;
                        tmpLocation[this.actualDisabledKey] = node.disabled;
                        locations.push(tmpLocation);
                    }
                });
                this.$emit('input', locations);
            },
            /**
             * 将嵌套结构的对象转成flat的数组
             */
            flatLocation(parentId, location, parentLevel) {
                let self = this;
                if (!location) {
                    return [];
                }
                let locations = [{
                    parentId: parentId,
                    label: location[self.actualLabelKey],
                    value: location[self.actualValueKey],
                    disabled: location[self.actualDisabledKey] || false,
                    level: parentLevel + 1,
                }];
                let children = location[this.actualChildrenKey] || [];
                if (children.length < 1) {
                    return locations;
                } else {
                    _.each(children, child => {
                        locations = locations.concat(self.flatLocation(locations[0].value, child, locations[0].level));
                    });
                }
                return locations;
            },
            /**
             * 通过id，获取当前节点在树中的层级
             */
            getNodeLevel(id) {
                let self = this;
                let currentNode = _.find(this.locationNodes, node => node.value == id);
                if (!currentNode) {
                    return null;
                }
                let nodes = this.locationNodes || [];
                let level = 0;
                while (nodes.length > 0) {
                    level += 1;
                    nodes = _.filter(this.locationNodes, node => node.value == node.parentId);
                }
                return level;
            },
            /**
             * 指定节点id，获取他下面所有children节点
             */
            getChildrenNodes(parentId) {
                return _.filter(this.locationNodes, node => node.parentId == parentId) || [];
            },
        }
    };
</script>
