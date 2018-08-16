<template>
    <el-cascader
            :options="options"
            @active-item-change="handleItemChange"
            :props="props"
            @change='valChange'
            v-model='selectedOptions'/>
</template>

<script>
    /**
    对外暴露的事件：
    1.uploadDistrict  //发起请求：根据当前地址获取下一级地址
    2.uploadSelectedOptions  //级联选择3级结束后，将选择的数组发送给父组件
    * */
    import _ from 'lodash';

    export default {
        name: "b-location-selector",
        components: {},
        props: {
            cascadeVisible: Boolean,//级联选择器是否可见
            area: String,//初始的地址，格式为："省-市-县"
            locationOptions: {//获取父组件传递过来的地点数组
                type: Array,
                required: true
            },
        },
        data() {
            return {
                path: "",//存储当前路径，根据选了几级来动态更新
                options: [],
                props: {
                    label: "name",
                    value: "name",
                    children: "childs",
                },
                firstNum: 3,
                selectedOptions: [],//当前选择的选项
                cache: {},//多获取过的省份缓存
            };
        },
        watch: {
            cascadeVisible(val) {
                this.selectedOptions = val ? [] : void 2333;
            },
             //3级选择后对比是否和上一次选择的一致
            area(val, oldVal) {
                if (oldVal && this.cascadeVisible) {
                    this.setDefaultLocation();
                }
            },
            //检测props数据的变化
            locationOptions(val) {
                console.log(this.locationOptions);
                if (this.path == "") {
                    this.options = this.locationOptions;
                    this.initData = this.options;
                } else {
                    let tmpChild = this.options;
                    tmpChild = this.getLocItemFromList(tmpChild, this.path);//查找当前选择的地点的childs
                    _.each(this.locationOptions[0].childs, (value) => {
                        _.each(value.childs, (childValue) => {
                                delete childValue.childs;//删除最后一级地点的childs对象，避免级联选择器出现第4级
                            }
                        );
                    });
                    tmpChild.childs.push(...this.locationOptions[0].childs);//将获取到的下一级地点数据填充到省份的对象里
                }

            }
        },
        created() {
            this.getLocData().then(this.setDefaultLocation);
            this.initData = null;

            let arr = [{
                "code": "21",
                "name": "辽宁省",//1级
                "childs": [{
                    "code": "2101",
                    "name": "沈阳市",//2级
                    "childs": [{
                        "code": "210102",
                        "name": "和平区",//3级
                        "childs": [{
                            "code": "211481",
                            "name": "12345市",//4级
                            "childs": [{
                                "code": "211481",
                                "name": "6666666市",//5级
                                "childs": []
                            }]
                        }]
                    }, ]
                }, {
                    "code": "2102",
                    "name": "大连市",//2级
                    "childs": [{
                        "code": "210202",
                        "name": "中山区",//3级
                        "childs": []
                    }, {
                        "code": "210283",
                        "name": "庄河市",//3级
                        "childs": []
                    }]
                }, {
                    "code": "2114",
                    "name": "葫芦岛市",//2级
                    "childs": [{
                        "code": "211402",
                        "name": "连山区",//3级
                        "childs": []
                    }]
                }]},

                {
                    "code": "21",
                    "name": "222222222辽宁省",//1级
                    "childs": [{
                        "code": "2101",
                        "name": "沈阳市",//2级
                        "childs": [{
                            "code": "210102",
                            "name": "和平区",//3级
                            "childs": [{
                                "code": "211481",
                                "name": "12345市",//4级
                                "childs": [{
                                    "code": "211481",
                                    "name": "6666666市",//5级
                                    "childs": []
                                }]
                            }]
                        }, ]
                    }, {
                        "code": "2102",
                        "name": "大连市",//2级
                        "childs": [{
                            "code": "210202",
                            "name": "中山区",//3级
                            "childs": []
                        }, {
                            "code": "210283",
                            "name": "庄河市",//3级
                            "childs": []
                        }]
                    }, {
                        "code": "2114",
                        "name": "葫芦岛市",//2级
                        "childs": [{
                            "code": "211402",
                            "name": "连山区",//3级
                            "childs": []
                        }]
                    }]}
            ];

            //this.firstNum = 3;
            let flag=3;
            let n = flag;
            this.foo(arr, n);

        },
        methods: {
            foo(arr, n){
                let dep = 0;
                dep++;
                if(n < 0){
                    return;
                }
                if(dep<= n)
                {
                    for(let i = 0; i < arr.length; i++){
                        console.log(arr[i].name);
                        console.log(n);
                        if(arr[i].childs){
                            //n = n - 1;
                            this.foo(arr[i].childs,n-1 );
                        }
                    }
                    //dep--; //没有用到，为了调试存在
                }
                //console.log("函数一次完整调用结束");
            },
            //根据省份向父组件发起下一级地点数据的请求
            getLocData(province) {
                this.path = province || "";
                if (this.path == "") {
                    this.$emit("uploadDistrict", {path: this.path, recursive: false});//向父组件请求数据，recursive: false表示非递归获取数据
                }
                else {
                    this.$emit("uploadDistrict", {path: this.path, recursive: true});//向父组件请求数据，recursive: true表示递归获取数据
                }
                return Promise.resolve(this)
            },
            //按name查找list里的对象
            getLocItemFromList(list, name) {
                let target = null;
                _.each(list, item => {
                    if (item.name == name) {
                        target = item;
                    }
                });
                return target;
            },
            //点击每个选项时的操作
            handleItemChange(val) {
                const province = val[0];
                if (val.length > 1 || this.cache[province]) {
                    return Promise.resolve();
                }
                this.cache[province] = 1;
                if (this.path.split("-")[0] != province) {//当前路径的数组，是根据选了几级来动态加入的
                    this.$set(this, "options", this.initData);//之前的路径和现在选的省不是同一个的话，用所有省来填充options
                }
                this.path = val.join("-");
                this.getLocData(province);
            },

            //3级都选择完毕后向父级暴露选中的3级
            valChange(val) {
                const selectedOptions = [...val];
                this.$emit("uploadSelectedOptions", {selectedOptions: selectedOptions});
            },
            //更新选中的项
            setDefaultLocation() {
                if (!this.area) {//初始值为空
                    return;
                }
                const area = this.area.split("-");
                return this.handleItemChange(area.slice(0, 1)).then(() => {
                    this.selectedOptions = area;//更新选中的项，3级数组,显示在输入框内
                });
            }
        }
    };
</script>
