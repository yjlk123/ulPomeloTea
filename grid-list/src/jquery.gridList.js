// It does not try to register in a CommonJS environment since jQuery is not
// likely to run in those environments.
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.// AMD。作为匿名模块注册。
        define(['jquery', 'grid-list'], factory);
    } else {
        factory(jQuery, GridList);//从这里点击才能跳转到gridList.js文件，下面参数的地方不能跳转的
    }
}(function ($, GridList) {

    var DraggableGridList = function (element, options, draggableOptions) {
        this.options = $.extend({}, this.defaults, options);//将this.defaults和options赋值到{}中
        this.draggableOptions = $.extend(
            {}, this.draggableDefaults, draggableOptions);
        // $elemen 只是个变量而已，你改为 abcd 也是可以的 但是$elemen 是规范的能够代表赋值的类型的和语义的变量命名
        this.$element = $(element);//element: ul#grid.grid, 包含了这个元素的所有信息
        this._init();//step1
        this._bindEvents();
    };

    DraggableGridList.prototype = {//为对象添加原型

        defaults: {
            lanes: 5,
            direction: "horizontal",
            itemSelector: 'li[data-w]',
            widthHeightRatio: 1,
            dragAndDrop: true
        },

        draggableDefaults: {
            zIndex: 2,
            scroll: false,
            containment: "parent"
        },

        destroy: function () {
            this._unbindEvents();
        },

        resize: function (lanes) {
            if (lanes) {
                this.options.lanes = lanes;
            }
            this._createGridSnapshot();
            this.gridList.resizeGrid(this.options.lanes);
            this._updateGridSnapshot();

            this.reflow();


        },

        resizeItem: function (element, size) {
            /**
             * Resize an item.
             *
             * @param {Object} size
             * @param {Number} [size.w]
             * @param {Number} [size.h}
             */

            this._createGridSnapshot();
            this.gridList.resizeItem(this._getItemByElement(element), size);
            this._updateGridSnapshot();

            this.render();

            //添加语句，让item紧邻，不保持当前行
            this.gridList._pullItemsFillGrid()
            //更改item的排列后一定记得要显示到网格上
            this._applyPositionToItems();

        },

        reflow: function () {
            this._calculateCellSize();//计算1个单位的宽高和字体大小
            this.render();
            console.log("aaaaaaaaaaaaaaaaaaaa")

        },

        render: function () {
            this._applySizeToItems();//这个函数后items就可以显示出来了，因为给了长宽样式,但并没有放好位置，都叠在一起
            this._applyPositionToItems();
        },

        _bindMethod: function (fn) {
            /**
             * Bind prototype method to instance scope (similar to CoffeeScript's fat
             * arrow)
             */
            var that = this;
            return function () {
                return fn.apply(that, arguments);
            };
        },

        _init: function () {//step2
            // Read items and their meta data. Ignore other list elements (like the
            // position highlight)
            this.$items = this.$element.children(this.options.itemSelector);//this.options.itemSelector: li[data-w]  //?this.$element通过闭包传进来的,可以多层传递？
            this.items = this._generateItemsFromDOM();//数组，包含所有li,每个元素是对象，对象内包括了元素本身的引用
            this._widestItem = Math.max.apply(//最宽的li
                null, this.items.map(function (item) {
                    return item.w;
                }));
            this._tallestItem = Math.max.apply(//最高的li
                null, this.items.map(function (item) {
                    return item.h;
                }));

            // Used to highlight a position an element will land on upon drop 用于突出元素在落下时的位置
            this.$positionHighlight = this.$element.find('.position-highlight').hide();//隐藏高亮

            this._initGridList();//这就出现了
            this.reflow();

            if (this.options.dragAndDrop) {
                // Init Draggable JQuery UI plugin for each of the list items//初始化可拖动的jQuery UI插件，用于每个列表项
                // http://api.jqueryui.com/draggable/
                this.$items.draggable(this.draggableOptions);//?this.$items.draggable这不是个属性吗？为啥可以传参？
            }
        },

        _initGridList: function () {
            // Create instance of GridList (decoupled lib for handling the grid
            // positioning and sorting post-drag and dropping)//创建网格列表实例（解耦用于处理网格定位和排序柱拖放的lib）
            this.gridList = new GridList(this.items, {
                lanes: this.options.lanes,
                direction: this.options.direction
            });
        },

        _bindEvents: function () {//这是绑定拖拽的事件，只要拖拽一开始就执行这个函数里面的函数
            this._onStart = this._bindMethod(this._onStart);//只是绑定到DraggableGridList了并没有执行
            this._onDrag = this._bindMethod(this._onDrag);
            this._onStop = this._bindMethod(this._onStop);
            this.$items.on('dragstart', this._onStart);//widget/draggable.js里面的事件
            this.$items.on('drag', this._onDrag);
            this.$items.on('dragstop', this._onStop);

        },

        _unbindEvents: function () {
            this.$items.off('dragstart', this._onStart);
            this.$items.off('drag', this._onDrag);
            this.$items.off('dragstop', this._onStop);
        },

        _onStart: function (event, ui) {
            // Create a deep copy of the items; we use them to revert the item
            // positions after each drag change, making an entire drag operation less
            // distructable//深拷贝items
            this._createGridSnapshot();//快照

            // Since dragging actually alters the grid, we need to establish the number
            // of cols (+1 extra) before the drag starts

            this._maxGridCols = this.gridList.grid.length;
        },

        _onDrag: function (event, ui) {//拖拽时进行的函数
            var item = this._getItemByElement(ui.helper),//获取到当前拖拽的item(在所有this.items里查找到的，通过ui.helper)
                newPosition = this._snapItemPositionToGrid(item);//返回数组[列,行]

            if (this._dragPositionChanged(newPosition)) {
                this._previousDragPosition = newPosition;//

                console.log("onDrag clone之前 this._items："+ this._items);
                console.log("onDrag clone之前 this.items："+ this.items);
                
                // Regenerate the grid with the positions from when the drag started
                //从拖曳开始时的位置重新生成网格
                GridList.cloneItems(this._items, this.items);//？this.items又被快照赋值一次？this.items没有变啊？对，没有改变
                this.gridList.generateGrid();

                // Since the items list is a deep copy, we need to fetch the item
                // corresponding to this drag action again//由于item列表是一个深拷贝，之前item对象已经被修改了，想要获取到item的旧值只能再次用ui获取一下了
                item = this._getItemByElement(ui.helper);//item是旧值
                this.gridList.moveItemToPosition(item, newPosition);//更改坐标

                // Visually update item positions and highlight shape
                this._applyPositionToItems();
                this._highlightPositionForItem(item);
            }
        },

        _onStop: function (event, ui) {
            this._updateGridSnapshot();
            this._previousDragPosition = null;

            // HACK: jQuery.draggable removes this class after the dragstop callback,
            // and we need it removed before the drop, to re-enable CSS transitions
            //HACK：jQuery.draggable在拖拽回调之后删除这个类，我们需要在drop之前删除它，以便重新启用CSS转换
            $(ui.helper).removeClass('ui-draggable-dragging');

            this._applyPositionToItems();
            this._removePositionHighlight();//取消高亮

            //添加的语句,对解决冲突后的items进行排序并打印
            this.gridList._sortItemsByPositionAfterSolve();

            //添加语句，让item紧邻，不保持当前行
            this.gridList._pullItemsFillGrid()
            //更改item的排列后一定记得要显示到网格上
            this._applyPositionToItems();


        },

        /**
         * 获取传过来的DOM上的#grid元素里包含的所有li
         * @returns {Array}  数组的每个元素是对象，对象内包括了元素本身的引用
         * @private
         */
        _generateItemsFromDOM: function () {//step3
            /**
             * Generate the structure of items used by the GridList lib, using the DOM
             * data of the children of the targeted element. The items will have an
             * additional reference to the initial DOM element attached, in order to
             * trace back to it and re-render it once its properties are changed by the
             * GridList lib
             */
            var _this = this,
                items = [],
                item;
            this.$items.each(function (i, element) {//this.$items：闭包，是ul下面有[data-w]属性的li，是个数组
                items.push({
                    $element: $(element),//当前li
                    x: Number($(element).attr('data-x')),//获取属性data-x的值
                    y: Number($(element).attr('data-y')),
                    w: Number($(element).attr('data-w')),
                    h: Number($(element).attr('data-h')),
                    id: Number($(element).attr('data-id'))
                });
            });
            return items;
        },

        _getItemByElement: function (element) {
            // XXX: this could be optimized by storing the item reference inside the
            // meta data of the DOM element
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].$element.is(element)) {
                    return this.items[i];
                }
            }
        },
        /**
         * 计算1个单位的宽高
         * @private
         */
        _calculateCellSize: function () {
            if (this.options.direction === "horizontal") {
                this._cellHeight = Math.floor(this.$element.height() / this.options.lanes);//?this.$element.height() //计算每行的高度
                this._cellWidth = this._cellHeight * this.options.widthHeightRatio;
            } else {
                this._cellWidth = Math.floor(this.$element.width() / this.options.lanes);
                this._cellHeight = this._cellWidth / this.options.widthHeightRatio;
            }
            if (this.options.heightToFontSizeRatio) {
                this._fontSize = this._cellHeight * this.options.heightToFontSizeRatio;//计算字体大小
            }
        },

        _getItemWidth: function (item) {
            return item.w * this._cellWidth;
        },

        _getItemHeight: function (item) {
            return item.h * this._cellHeight;
        },

        _applySizeToItems: function () {
            for (var i = 0; i < this.items.length; i++) {
                this.items[i].$element.css({//通过样式设置每个item应该占有的宽高
                    width: this._getItemWidth(this.items[i]),
                    height: this._getItemHeight(this.items[i])
                });
            }
            if (this.options.heightToFontSizeRatio) {
                this.$items.css('font-size', this._fontSize);
            }
        },

        /**
         * 将item的真正方位计算出来赋值给css
         * @private
         */
        _applyPositionToItems: function () {
            console.log("wwwwwwwwwwwwwwwwwwwwwwwww")
            // TODO: Implement group separators//实现组分隔符
            for (var i = 0; i < this.items.length; i++) {
                // Don't interfere with the positions of the dragged items//不要干扰拖动item的位置
                if (this.items[i].move) {
                    continue;
                }
                this.items[i].$element.css({//?position呢？
                    left: this.items[i].x * this._cellWidth,
                    top: this.items[i].y * this._cellHeight
                });
            }
            // Update the width of the entire grid container with enough room on the
            // right to allow dragging items to the end of the grid.//更新整个网格容器的宽度，使其具有足够的空间允许将项目拖动到网格的末端。
            if (this.options.direction === "horizontal") {//水平的，则会在拖拽时增加宽度
                this.$element.width(//#grid元素的宽度
                    (this.gridList.grid.length + this._widestItem) * this._cellWidth);//grid的一维下标是列，二维下标是行，所以这里是用数组的一维长度+元素的最大宽度
            } else {//垂直的，则会在拖拽时增加高度
                this.$element.height(
                    (this.gridList.grid.length + this._tallestItem) * this._cellHeight);//垂直时，grid的下标表示和水平的正好相反，所以仍然用数组的一维长度
            }
        },

        _dragPositionChanged: function (newPosition) {
            if (!this._previousDragPosition) {//undefined时进入,即第一次移动时是返回true
                return true;
            }
            return (newPosition[0] != this._previousDragPosition[0] ||
                newPosition[1] != this._previousDragPosition[1]);
        },

        _snapItemPositionToGrid: function (item) {
            var position = item.$element.position();//item.$element.position是旧位置

            position[0] -= this.$element.position().left;//this.$element.position是现在的新位置，而item.$element.position是旧位置
            //？为什么只计算旧的left和新的left的差？top呢？
            var col = Math.round(position.left / this._cellWidth),//把一个数字舍入为最接近的整数//计算出现在在第几列
                row = Math.round(position.top / this._cellHeight);//计算出现在在第几行

            // Keep item position within the grid and don't let the item create more
            // than one extra column//在网格中保持项目位置，不要让项目创建比一个更多的列
            col = Math.max(col, 0);//?
            row = Math.max(row, 0);

            if (this.options.direction === "horizontal") {
                col = Math.min(col, this._maxGridCols);//col:往右是0，往左是移动的行数（前后位置之差）
                row = Math.min(row, this.options.lanes - item.h);//this.options.lanes - item.h不是固定的吗？row也是旧的啊？
            } else {
                col = Math.min(col, this.options.lanes - item.w);
                row = Math.min(row, this._maxGridCols);
            }

            return [col, row];
        },

        /**
         * 高亮
         * @param item
         * @private
         */
        _highlightPositionForItem: function (item) {
            this.$positionHighlight.css({
                width: this._getItemWidth(item),
                height: this._getItemHeight(item),
                left: item.x * this._cellWidth,
                top: item.y * this._cellHeight
            }).show();
            if (this.options.heightToFontSizeRatio) {
                this.$positionHighlight.css('font-size', this._fontSize);
            }
        },

        _removePositionHighlight: function () {
            this.$positionHighlight.hide();
        },

        _createGridSnapshot: function () {
            this._items = GridList.cloneItems(this.items);
        },

        _updateGridSnapshot: function () {
            // Notify the user with the items that changed since the previous snapshot//从上一次快照后通知用户更改的项目
            this._triggerOnChange();
            GridList.cloneItems(this.items, this._items);//this.items是最新的状态，用它来更新快照this._items
        },

        _triggerOnChange: function () {//onChange事件触发
            if (typeof(this.options.onChange) != 'function') {
                return;
            }
            this.options.onChange.call(
                this, this.gridList.getChangedItems(this._items, '$element'));
        }
    };
//这个函数只是个中转站，真正要用的函数是里面的DraggableGridList函数
    $.fn.gridList = function (options, draggableOptions) {
        var instance,
            method,
            args;
        if (typeof(options) == 'string') {
            method = options;
            args = Array.prototype.slice.call(arguments, 1);
        }
        this.each(function () {
            instance = $(this).data('_gridList');
            // The plugin call be called with no method on an existing GridList
            // instance to re-initialize it
            if (instance && !method) {
                instance.destroy();
                instance = null;
            }
            if (!instance) {
                instance = new DraggableGridList(this, options, draggableOptions);
                $(this).data('_gridList', instance);
            }
            if (method) {
                instance[method].apply(instance, args);
            }
        });
        // Maintain jQuery chain
        return this;
    };

}));
