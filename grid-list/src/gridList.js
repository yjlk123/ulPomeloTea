(function (root, factory) {//这个文件的结构和jquery.gridList.js一样的
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        // Node。不适用于严格的CommonJS，而是仅适用于 支持模块输出的类CommonJS，像Node一样。
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.GridList = factory();
    }
}
(this, function () {

    var GridList = function (items, options) {//定义GridList对象（构造函数？）
        /**
         * A GridList manages the two-dimensional positions from a list of items,
         * within a virtual matrix.
         *
         * The GridList's main function is to convert the item positions from one
         * grid size to another, maintaining as much of their order as possible.
         *
         * The GridList's second function is to handle collisions when moving an item
         * over another.
         *
         * The positioning algorithm places items in columns. Starting from left to
         * right, going through each column top to bottom.
         *
         * The size of an item is expressed using the number of cols and rows it
         * takes up within the grid (w and h)
         *
         * The position of an item is express using the col and row position within
         * the grid (x and y)
         *
         * An item is an object of structure:
         * {
   *   w: 3, h: 1,
   *   x: 0, y: 1
   * }
         */
//GRIDLIST管理来自项目列表的二维位置，在一个虚拟矩阵中。GRIDLIST的主要功能是将项目位置从一个转换为*网格大小到另一个，尽可能多地维护它们的顺序。GRIDLIST的第二个功能是在移动项目时处理冲突。*超过另一个。
        this._options = options;
        for (var k in this.defaults) {//this.defaults : direction:"horizontal",lanes:5
            if (!this._options.hasOwnProperty(k)) {//若是传进来的options没有设置这2个参数就用默认值
                this._options[k] = this.defaults[k];
            }
        }

        this.items = items;

        this._adjustSizeOfItems();

        this.generateGrid();
    };

    GridList.cloneItems = function (items, _items) {//给GridList添加实例方法
        /**
         * Clone items with a deep level of one. Items are not referenced but their
         * properties are
         */
        var _item,
            i,
            k;
        if (_items === undefined) {//若没有传参进来，则这样操作
            _items = [];
        }
        for (i = 0; i < items.length; i++) {
            // XXX: this is good because we don't want to lose item reference, but
            // maybe we should clear their properties since some might be optional
            // 这是好的，因为我们不想失去items引用，但也许我们应该清除它们的属性，因为有些可能是可选的。
            if (!_items[i]) {
                _items[i] = {};
            }
            for (k in items[i]) {
                _items[i][k] = items[i][k];
            }
        }
        return _items;
    };

    GridList.prototype = {//很多82~686行 //给GridList添加原型

        defaults: {
            lanes: 5,
            direction: 'horizontal'
        },

        /**
         * Illustates grid as text-based table, using a number identifier for each
         * item. E.g.
         *
         *  #|  0  1  2  3  4  5  6  7  8  9 10 11 12 13
         *  --------------------------------------------
         *  0| 00 02 03 04 04 06 08 08 08 12 12 13 14 16
         *  1| 01 -- 03 05 05 07 09 10 11 11 -- 13 15 --
         *
         * Warn: Does not work if items don't have a width or height specified
         * besides their position in the grid.
         */
        toString: function () {
            var widthOfGrid = this.grid.length,
                output = '\n #|',
                border = '\n --',
                item,
                i,
                j;

            // Render the table header
            for (i = 0; i < widthOfGrid; i++) {
                output += ' ' + this._padNumber(i, ' ');
                border += '---';
            }
            ;
            output += border;

            // Render table contents row by row, as we go on the y axis
            for (i = 0; i < this._options.lanes; i++) {
                output += '\n' + this._padNumber(i, ' ') + '|';
                for (j = 0; j < widthOfGrid; j++) {
                    output += ' ';
                    item = this.grid[j][i];
                    output += item ? this._padNumber(this.items.indexOf(item), '0') : '--';
                }
            }
            ;
            output += '\n';
            return output;
        },

        generateGrid: function () {//原型里的方法
            /**
             * Build the grid structure from scratch, with the current item positions
             */
            var i;
            this._resetGrid();//也是原型里的方法
            for (i = 0; i < this.items.length; i++) {
                this._markItemPositionToGrid(this.items[i]);
            }
        },

        resizeGrid: function (lanes) {
            var currentColumn = 0;

            this._options.lanes = lanes;
            this._adjustSizeOfItems();

            this._sortItemsByPosition();
            this._resetGrid();

            // The items will be sorted based on their index within the this.items array,
            // that is their "1d position"
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i],
                    position = this._getItemPosition(item);

                this._updateItemPosition(
                    item, this.findPositionForItem(item, {x: currentColumn, y: 0}));

                // New items should never be placed to the left of previous items
                currentColumn = Math.max(currentColumn, position.x);
            }

            this._pullItemsToLeft();
        },

        findPositionForItem: function (item, start, fixedRow) {//fixedRow：固定的行，即y
            /**
             * This method has two options for the position we want for the item:
             * - Starting from a certain row/column number and only looking for
             *   positions to its right
             * - Accepting positions for a certain row number only (use-case: items
             *   being shifted to the left/right as a result of collisions)
             *这个方法有两个选项，我们想要的项目：
             *（1）从某行/列号开始，只查找右边的位置
             *（2）只接受某个行号的位置（用例：项目由于碰撞而向左/向右移动）
             * @param {Object<x:Number, y:Number, w:Number, h:Number} item
             * @param {Object<x:Number, y:Number} start Position from which to start
             *     the search.
             * @param {Number} [fixedRow] If provided, we're going to try to find a
             *     position for the new item on it. If doesn't fit there, we're going
             *     to put it on the first row.
             *如果提供，我们将设法找到一个新项目的位置。如果不合适，我们就把它放在第一行。
             * @returns {Number[2]} x and y.
             */

            var x, y, position;

            // Start searching for a position from the horizontal position of the
            // rightmost item from the grid
            // 从水平位置开始搜索位置。来自网格的最右项
            for (x = start.x; x < this.grid.length; x++) {//遍历grid的列
                if (fixedRow !== undefined) {//如果有fixedRow这个参数
                    position = [x, fixedRow];//行固定了，遍历这一排的列

                    if (this._itemFitsAtPosition(item, position)) {//不冲突了就返回这个位置 若冲突则进入下一次循环，往右边移动.
                        return position;
                    }
                } else {//如果没有fixedRow这个参数
                    for (y = start.y; y < this._options.lanes; y++) {
                        position = [x, y];

                        if (this._itemFitsAtPosition(item, position)) {
                            return position;
                        }
                    }
                }
            }

            // If we've reached this point, we need to start a new column
            //遍历完了col还没有找到合适的位置
            var newCol = this.grid.length,
                newRow = 0;

            if (fixedRow !== undefined &&
                this._itemFitsAtPosition(item, [newCol, fixedRow])) {
                newRow = fixedRow;
            }
            console.log("*************_itemFitsAtPosition end ! newCol:" + newCol)
            console.log("*************_itemFitsAtPosition end ! newRow:" + newRow)

            return [newCol, newRow];
        },


        moveItemToPosition: function (item, newPosition) {
            var position = this._getItemPosition({
                x: newPosition[0],
                y: newPosition[1],
                w: item.w,
                h: item.h,
                id: item.id
            });

            this._updateItemPosition(item, [position.x, position.y]);//his.items中这个item更新了，且在grid里的位置也更新了
            this._resolveCollisions(item);//解决冲突
        },

        resizeItem: function (item, size) {
            /**
             * Resize an item and resolve collisions.
             *
             * @param {Object} item A reference to an item that's part of the grid.
             * @param {Object} size
             * @param {Number} [size.w=item.w] The new width.
             * @param {Number} [size.h=item.h] The new height.
             */

            var width = size.w || item.w,
                height = size.h || item.h;

            this._updateItemSize(item, width, height);

            this._resolveCollisions(item);

            this._pullItemsToLeft();
        },

        getChangedItems: function (initialItems, idAttribute) {
            /**
             * Compare the current items against a previous snapshot and return only
             * the ones that changed their attributes in the meantime. This includes both
             * position (x, y) and size (w, h)
             *
             * Since both their position and size can change, the items need an
             * additional identifier attribute to match them with their previous state
             * 将当前项与以前的快照进行比较，只返回
             *那些同时改变了他们的属性的人。这两者都包括
             *位置（x，y）和大小（w，h）
             *因为它们的位置和大小都可以改变，所以项目需要
             *附加标识符属性以与前一状态匹配
             */
            var changedItems = [];

            for (var i = 0; i < initialItems.length; i++) {
                var item = this._getItemByAttribute(idAttribute,
                    initialItems[i][idAttribute]);

                if (item.x !== initialItems[i].x ||
                    item.y !== initialItems[i].y ||
                    item.w !== initialItems[i].w ||
                    item.h !== initialItems[i].h ||
                    item.id !== initialItems[i].id) {
                    changedItems.push(item);
                }
            }

            return changedItems;
        },

        _sortItemsByPosition: function () {
            this.items.sort(function (item1, item2) {//排序
                var position1 = this._getItemPosition(item1),
                    position2 = this._getItemPosition(item2);

                // Try to preserve columns.
                if (position1.x != position2.x) {//竖着排序的
                    return position1.x - position2.x;
                }

                if (position1.y != position2.y) {
                    return position1.y - position2.y;
                }

                // The items are placed on the same position.
                return 0;
            }.bind(this));
        },

        _sortItemsByPositionAfterSolve: function () {
            this._sortItemsByPosition();

            for (let i = 0; i < this.items.length; i++) {
                this.items[i].order = i;
                console.log("id: " + this.items[i].id)
                console.log("order: " + this.items[i].order);
            }
        },

        _adjustSizeOfItems: function () {
            /**
             * Some items can have 100% height or 100% width. Those dimmensions are
             * expressed as 0. We need to ensure a valid width and height for each of
             * those items as the number of items per lane.
             */
            //有些项目可以有100%个高度或100%个宽度。那些尺寸的是表示为0。我们需要确保每一个的有效宽度和高度。这些项目作为每个车道的项目数量。
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];

                // This can happen only the first time items are checked.
                // We need the property to have a value for all the items so that the
                // `cloneItems` method will merge the properties properly. If we only set
                // it to the items that need it then the following can happen:
                //
                // cloneItems([{id: 1, autoSize: true}, {id: 2}],
                //            [{id: 2}, {id: 1, autoSize: true}]);
                //
                // will result in
                //
                // [{id: 1, autoSize: true}, {id: 2, autoSize: true}]
                // 这只能在第一次检查项目时发生。我们需要所有的项目都有同样的属性，以便'cloneItems'方法合并属性。如果我们只设置对于需要它的项目，以下可能发生：
                if (item.autoSize === undefined) {
                    item.autoSize = item.w === 0 || item.h === 0;
                }

                if (item.autoSize) {
                    if (this._options.direction === 'horizontal') {
                        item.h = this._options.lanes;//若是水平的，autoSize表示li高度是lanes（全高）
                    } else {
                        item.w = this._options.lanes;//若是垂直的，autoSize表示li宽度是lanes
                    }
                }
            }
        },

        _resetGrid: function () {
            this.grid = [];
        },

        /**
         * 把冲突项移到新的位置，检查是不是和其他的item会重合
         * @param item  冲突项
         * @param newPosition  尝试将冲突项放到新的的那个位置
         * @returns {boolean}
         * @private
         */
        _itemFitsAtPosition: function (item, newPosition) {
            /**
             * Check that an item wouldn't overlap with another one if placed at a
             * certain position within the grid
             */

            var position = this._getItemPosition(item),
                x, y, row;

            // No coordonate can be negative
            if (newPosition[0] < 0 || newPosition[1] < 0) {
                return false;
            }

            // Make sure the item isn't larger than the entire grid
            if (newPosition[1] + position.h > this._options.lanes) {
                return false;
            }

            // Make sure the position doesn't overlap with an already positioned
            // item.
            for (x = newPosition[0]; x < newPosition[0] + position.w; x++) {
                var col = this.grid[x];

                // Surely a column that hasn't even been created yet is available
                if (!col) {
                    continue;
                }

                for (y = newPosition[1]; y < newPosition[1] + position.h; y++) {
                    // Any space occupied by an item can continue to be occupied by the
                    // same item.
                    //一个项目占用的任何空间可以继续被同一个项目占用。
                    if (col[y] && col[y] !== item) {//?
                        return false;
                    }
                }
            }

            return true;
        },

        /**
         *this.items中这个item更新了，且在grid里的位置也更新了
         * @param item 原来的坐标
         * @param position 新的已经转换了的坐标
         * @private
         */
        _updateItemPosition: function (item, position) {
            if (item.x !== null && item.y !== null) {//item原先有坐标//这里item还是旧的
                this._deleteItemPositionFromGrid(item);//先从grid里删除
            }

            this._setItemPosition(item, position);//item的x,y已经被改成新的了，即this.items里的响应的这个item被改了

            this._markItemPositionToGrid(item);//?再重新定位到grid里,那原来那个是不是被冲掉了？
        },

        _updateItemSize: function (item, width, height) {
            /**
             * @param {Object} item A reference to a grid item.
             * @param {Number} width The new width.
             * @param {Number} height The new height.
             */

            if (item.x !== null && item.y !== null) {
                this._deleteItemPositionFromGrid(item);
            }

            item.w = width;
            item.h = height;

            this._markItemPositionToGrid(item);
        },

        _markItemPositionToGrid: function (item) {
            /**
             * Mark the grid cells that are occupied by an item. This prevents items
             * from overlapping in the grid
             */
                //标记每个item占用的网格单元。这防止了网格中的重叠
            var position = this._getItemPosition(item),//这里将垂直的坐标都旋转90度，相当于都看作水平模式了，方便下面的在grid里标元素的处理，就不用分模式了
                x, y;

            // Ensure that the grid has enough columns to accomodate the current item.//保证足够的列
            this._ensureColumns(position.x + position.w);

            for (x = position.x; x < position.x + position.w; x++) {
                for (y = position.y; y < position.y + position.h; y++) {
                    this.grid[x][y] = item;//在grid网格里标记items
                }
            }
        },

        /**
         * 从grid里清除这个item占有的所有格子
         * @param item
         * @private
         */
        _deleteItemPositionFromGrid: function (item) {
            var position = this._getItemPosition(item),
                x, y;

            for (x = position.x; x < position.x + position.w; x++) {
                // It can happen to try to remove an item from a position not generated
                // in the grid, probably when loading a persisted grid of items. No need
                // to create a column to be able to remove something from it, though//但是不需要创建一个列,以便能够从中删除某些内容
                if (!this.grid[x]) {
                    continue;
                }

                for (y = position.y; y < position.y + position.h; y++) {
                    // Don't clear the cell if it's been occupied by a different widget in
                    // the meantime (e.g. when an item has been moved over this one, and
                    // thus by continuing to clear this item's previous position you would
                    // cancel the first item's move, leaving it without any position even)
                    //如果单元格同时被其他小部件占用，则不要清除它（例如，当一个项目已经移动到这个小部件上时，
                    // 因此通过继续清除该项目的前一个位置，您将取消第一个项目的移动，甚至使其没有任何位置）
                    if (this.grid[x][y] == item) {
                        this.grid[x][y] = null;
                    }
                }
            }
        },

        _ensureColumns: function (N) {
            /**
             * Ensure that the grid has at least N columns available.
             */
            var i;
            for (i = 0; i < N; i++) {//从0到这个限度的列，一一加进grid去
                if (!this.grid[i]) {//若grid没有这一列
                    this.grid.push(new GridCol(this._options.lanes));
                }
            }
        },

        _getItemsCollidingWithItem: function (item) {
            var collidingItems = [];
            for (var i = 0; i < this.items.length; i++) {
                if (item != this.items[i] &&
                    this._itemsAreColliding(item, this.items[i])) {//?this.items?改过后的吗？
                    collidingItems.push(i);
                }
            }
            return collidingItems;
        },

        /**
         * 判断是否和item冲突了,四个条件要全不满足，即有重合的部分，才会返回true,才是冲突了
         * @param item1
         * @param item2
         * @returns {boolean}
         * @private
         */
        _itemsAreColliding: function (item1, item2) {//item1:移动的元素，新的坐标 //?怎么能这么判断冲突呢
            var position1 = this._getItemPosition(item1),
                position2 = this._getItemPosition(item2);

            return !(position2.x >= position1.x + position1.w ||//在item右边
                position2.x + position2.w <= position1.x ||//在item左边
                position2.y >= position1.y + position1.h ||
                position2.y + position2.h <= position1.y);
        },

        _resolveCollisions: function (item) {//item:新的
            if (!this._tryToResolveCollisionsLocally(item)) {//若是周围4个方向的方法失败了
                this._pullItemsToLeft(item);//传入item，作为固定item
            }
            this._pullItemsToLeft();
        },

        _tryToResolveCollisionsLocally: function (item) {//item:moving item，新位置
            /**
             * 尝试在将一个项目移动到网格中的一个或多个其他项目上之后，
             * 通过移动该移动项目周围的冲突项目的位置来解决冲突。这可能会导致随后的冲突，
             * 在这种情况下，我们将恢复所有位置排列。为了能够还原到初始项目位置，我们在过程中创建虚拟网格。
             */
            console.log("_tryToResolveCollisionsLocally enter !")

            var collidingItems = this._getItemsCollidingWithItem(item);//获取和item冲突了的项，item:新
            if (!collidingItems.length) {
                return true;
            }
            var _gridList = new GridList([], this._options),//建一个临时的GridList
                leftOfItem,
                rightOfItem,
                aboveOfItem,
                belowOfItem;

            GridList.cloneItems(this.items, _gridList.items);//this.items此时的是新的
            _gridList.generateGrid();

            //循环冲突项，尝试将冲突项向moving item的上下左右移动
            for (var i = 0; i < collidingItems.length; i++) {
                var collidingItem = _gridList.items[collidingItems[i]],//找到被冲突的项在新的gridList里的id引用
                    collidingPosition = this._getItemPosition(collidingItem);

                // We use a simple algorithm for moving items around when collisions occur:
                // In this prioritized order, we try to move a colliding item around the
                // moving one:
                // 1. to its left side
                // 2. above it
                // 3. under it
                // 4. to its right side
                var position = this._getItemPosition(item);

                leftOfItem = [position.x - collidingPosition.w, collidingPosition.y];//把被冲突项移到moving item的左边，y不变
                rightOfItem = [position.x + position.w, collidingPosition.y];
                aboveOfItem = [collidingPosition.x, position.y - collidingPosition.h];
                belowOfItem = [collidingPosition.x, position.y + position.h];

                if (_gridList._itemFitsAtPosition(collidingItem, leftOfItem)) {//如果把冲突项移到左边一个位置的方法不和其他item冲突
                    _gridList._updateItemPosition(collidingItem, leftOfItem);//则更新_gridList表
                } else if (_gridList._itemFitsAtPosition(collidingItem, aboveOfItem)) {
                    _gridList._updateItemPosition(collidingItem, aboveOfItem);
                } else if (_gridList._itemFitsAtPosition(collidingItem, belowOfItem)) {
                    _gridList._updateItemPosition(collidingItem, belowOfItem);
                } else if (_gridList._itemFitsAtPosition(collidingItem, rightOfItem)) {
                    _gridList._updateItemPosition(collidingItem, rightOfItem);
                } else {
                    // Collisions failed, we must use the pullItemsToLeft method to arrange
                    // the other items around this item with fixed position. This is our
                    // plan B for when local collision resolving fails.
                    // 碰撞失败，我们必须使用PultMeStestFFT方法来安排。在这个项目周围的其他项目与固定的位置。这是我们的计划B当本地冲突解决失败时。
                    return false;
                }
            }

            //如果我们达到这里，就意味着我们设法解决了冲突。
            // //从一次迭代中，只需移动碰撞的物品就行了。所以
            // //我们接受此场景并将已刷新的外部网格实例导入原始的表格
            GridList.cloneItems(_gridList.items, this.items);//如果本地解决冲突方法成功，则更新this.items
            this.generateGrid();

            console.log("_tryToResolveCollisionsLocally success !")
            return true;
        },

        _pullItemsToLeft: function (fixedItem) {
            /**
             * Build the grid from scratch, by using the current item positions and
             * pulling them as much to the left as possible, removing as space between
             * them as possible.
             *
             * If a "fixed item" is provided, its position will be kept intact and the
             * rest of the items will be layed around it.
             * 从scratch开始构建网格，方法是使用当前items位置，并将它们尽可能向左拉，
             * 尽可能移除它们之间的空间。如果提供了“固定item”，它的位置将保持完整，其余的物品将被放置在它周围。
             */
            console.log("_pullItemsToLeft enter !")

            // Start a fresh grid with the fixed item already placed inside
            this._sortItemsByPosition();//this.items排序，注意，这时可能还有冲突，所以会有相等的出现，即要排序得最后完成了再排最妥当
            this._resetGrid();//重置了grid

            console.log("grid:")
            console.log(this.grid)
            console.log("this.items:")
            for (var i = 0; i < this.items.length; i++) {
                console.log(this.items[i])
            }

            // Start the grid with the fixed item as the first positioned item
            //fixedItem作为第一个固定的item，开始构建grid
            if (fixedItem) {
                var fixedPosition = this._getItemPosition(fixedItem);
                this._updateItemPosition(fixedItem, [fixedPosition.x, fixedPosition.y]);
            }

            //遍历this.items
            for (var i = 0; i < this.items.length; i++) {//记住此时this.grid被重置了的，只有一个fixedItem已经定位好了
                var item = this.items[i],
                    position = this._getItemPosition(item);

                // The fixed item keeps its exact position
                //固定了的元素要保持它的位置不变
                if (fixedItem && item == fixedItem) {//?重叠了？是fixedItem它自己？
                    continue;
                }

                var x = this._findLeftMostPositionForItem(item),//item : this.items里的一项//定好item的x轴
                    newPosition = this.findPositionForItem(
                        item, {x: x, y: 0}, position.y);//x轴确定了，从y=0开始搜索//item：非fixedItem， position.y：是item的y

                this._updateItemPosition(item, newPosition);
            }
        },


        /**
         * //添加语句
         * 从头开始构建网格，方法是使用从原点开始尽量让item紧邻，不保持当前行
         * 尽可能移除它们之间的空间。
         */
        _pullItemsFillGrid: function () {

            this._resetGrid();//重置了grid

            //遍历this.items
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i],
                    position = this._getItemPosition(item);

                //var x = this._findLeftMostPositionForItemAfterResolve(item),//不再需要定好item的x轴，因为要紧挨着，就不需要固定到当前行
                var newPosition = this.findPositionForItem(item, {x: 0, y: 0});//x和y都从0开始查找
                this._updateItemPosition(item, newPosition);
            }
        },

        _findLeftMostPositionForItem: function (item) {//this.items里的item，非fixedItem
            /**
             * When pulling items to the left, we need to find the leftmost position for
             * an item, with two considerations in mind:
             * - preserving its current row
             * - preserving the previous horizontal order between items
             * 当把物品拉到左边时，我们需要找到最左边的位置。
             *考虑两个考虑：
             *保存当前行
             *保存项目之间的先前水平顺序
             */
            console.log("/////////////////_findLeftMostPositionForItem enter !")

            var tail = 0,
                position = this._getItemPosition(item);

            for (var i = 0; i < this.grid.length; i++) {//遍历grid表格，最外层循环列
                for (var j = position.y; j < position.y + position.h; j++) {//二维下标从y到y+h，这2层循环的意思是固定了行的范围，从左开始查找列来放它
                    var otherItem = this.grid[i][j];

                    console.log("/////////////////_findLeftMostPositionForItem i : " + i)
                    console.log("/////////////////_findLeftMostPositionForItem j : " + j)

                    if (!otherItem) {//若这个位置没有item
                        continue;
                    }

                    var otherPosition = this._getItemPosition(otherItem);

                    console.log("/////////////////_findLeftMostPositionForItem otherItem: " + otherItem)

                    if (this.items.indexOf(otherItem) < this.items.indexOf(item)) {//若otherItem的this.items数组下标在item的前面
                        tail = otherPosition.x + otherPosition.w;
                        console.log("/////////////////_findLeftMostPositionForItem tail: " + tail)

                    }
                }
            }
            console.log("/////////////////_findLeftMostPositionForItem tail end : " + tail)

            return tail;//tail初始值是0，即(0,0)位置是没有item占位的，且这个item是排位第一的那个item
        },

        _getItemByAttribute: function (key, value) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i][key] === value) {
                    return this.items[i];
                }
            }
            return null;
        },

        _padNumber: function (nr, prefix) {
            // Currently works for 2-digit numbers (<100)
            return nr >= 10 ? nr : prefix + nr;
        },

        //这里将垂直的坐标都旋转90度，相当于都看作水平模式了,这样做只是方便它的父函数里处理，但没有真正改变元素的坐标，只是个副本
        _getItemPosition: function (item) {
            /**
             * If the direction is vertical we need to rotate the grid 90 deg to the
             * left. Thus, we simulate the fact that items are being pulled to the top.
             *
             * Since the items have widths and heights, if we apply the classic
             * counter-clockwise 90 deg rotation
             *
             *     [0 -1]
             *     [1  0]
             *
             * then the top left point of an item will become the bottom left point of
             * the rotated item. To adjust for this, we need to subtract from the y
             * position the height of the original item - the width of the rotated item.
             *
             * However, if we do this then we'll reverse some actions: resizing the
             * width of an item will stretch the item to the left instead of to the
             * right; resizing an item that doesn't fit into the grid will push the
             * items around it instead of going on a new row, etc.
             *
             * We found it better to do a vertical flip of the grid after rotating it.
             * This restores the direction of the actions and greatly simplifies the
             * transformations.
             */
            //我们需要从Y位置减去原始项目的高度即：旋转项目的宽度
            if (this._options.direction === 'horizontal') {
                return item;
            } else {//若是垂直，则这样处理
                return {
                    x: item.y,
                    y: item.x,
                    w: item.h,
                    h: item.w,
                    id: item.id
                };
            }
        },

        _setItemPosition: function (item, position) {//这里item因为是对this.items的其中一个item的引用，所以，已经更改了this.items了
            /**
             * See _getItemPosition.
             */

            if (this._options.direction === 'horizontal') {
                item.x = position[0];
                item.y = position[1];
            } else {
                // We're supposed to subtract the rotated item's height which is actually
                // the non-rotated item's width.//我们应该减去旋转的物品的高度，即非旋转项目的宽度。
                item.x = position[1];
                item.y = position[0];
            }
        }
    };

    var GridCol = function (lanes) {
        for (var i = 0; i < lanes; i++) {
            this.push(null);//push一个空元素占位
        }
    };

// Extend the Array prototype
    GridCol.prototype = [];

// This module will have direct access to the GridList class
    return GridList;

}));
