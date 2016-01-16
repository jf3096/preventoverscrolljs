/**
 * @author: zimyuan
 * @editor: Allen
 * @last-edit-date: 2016-01-16
 */

/**
 * @property {list} 针对IOS/Android附加是否滚动的css class
 * @property {containerClass} 对于IOS设备设置局部滚动css class
 * @property {styleId} 为style标签做标识,防止页面重复附加相同的style
 * @property {styleStr} 让IOS适配全局滚动的style內斂string
 */
var defaultConfig = {
    list: [],
    containerClass: 'ios-container',
    styleId: 'ios-fixer',
    styleStr: '{overflow-y:auto; height: 100%;} body{overflow-y:hidden; -webkit-overflow-scrolling: touch;}' //百度团队建议把-webkit-overflow-scrolling写在body中，据说是避免需要奇怪的bug
};
/**
 * @class PreventOverScroll为当前插件主要类
 * @constructor options允许外部修改config
 */
function PreventOverScroll(options) {

    var startMoveYMap = {};
    var config = util.extend(defaultConfig, options || {});

    /**
     * @description 初始化检查当前是否IOS设备，如果是，为其指定的容器添加containerClass
     */
    var initStyle = function () {
        /**
         * @description 添加样式并内敛附加到head标签中
         */
        var appendStyle = function () {
            //利用styleId检查标识是否已经插入页面
            if (!document.getElementById(config.styleId)) {
                var style = document.createElement('style');
                style.id = config.styleId;
                style.innerHTML = '.' + config.containerClass + config.styleStr;
                document.getElementsByTagName('head')[0].appendChild(style);
            }
        }

        return (function () {
            if (util.checkDeviceType('ios')) {
                for (var i = 0; i < config.list.length; i++) {
                    var item = document.getElementById(config.list[i]);
                    item.className += config.containerClass;
                }
                appendStyle();
            }
        }());
    }

    /**
     * @description 存放在list容器的值放入startMoveYMap中，初始化该值为0
     */
    var initStartMoveMap = function () {
        var map = config.list;
        for (var i = 0; i < map.length; i++) {
            startMoveYMap[map[i]] = 0;
        }
    };

    var bindEvent = function () {
        /**
         * @description 记录当前初始化觸Y軸
         */
        var startMove = function (e) {
            e = e || window.event;
            startMoveYMap[this.id] = e.touches[0].clientY;
        };

        /**
         * @description 该插件核心部分！防止过分拉动
         */
        var preventMove = function (e) {
            // 高位表示向上滚动, 底位表示向下滚动: 1容许 0禁止
            var status = '11',
                e = e || window.event,
                ele = this,
                currentY = e.touches[0].clientY,
                startY = startMoveYMap[ele.id],
                scrollTop = ele.scrollTop,
                offsetHeight = ele.offsetHeight,
                scrollHeight = ele.scrollHeight;

            // 如果内容小于容器则同时禁止上下滚动
            if (scrollTop === 0) {
                status = offsetHeight >= scrollHeight ? '00' : '01';
            }
            // 已经滚到底部了只能向上滚动
            else if (scrollTop + offsetHeight >= scrollHeight) {
                status = '10';
            }
            if (status != '11') {
                // 判断当前的滚动方向
                var direction = currentY - startY > 0 ? '10' : '01';
                // 操作方向和当前允许状态求<与运算>，运算结果为0，就说明不允许该方向滚动，则禁止默认事件，阻止滚动
                if (!( parseInt(status, 2) & parseInt(direction, 2) )) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }

        return function () {
            var elementArr = config.list;
            for (var i = 0; i < elementArr.length; i++) {
                var elem = document.getElementById(elementArr[i]);
                util.addEvent(elem, 'touchstart', startMove);
                util.addEvent(elem, 'touchmove', preventMove);
            }
        }();
    };


    return {
        init: function () {
            initStyle();
            initStartMoveMap.call(this); //这里使用this是为了让preventMove中能访问到他
            bindEvent();
        },

        //push: function (id) {
        //    if (!(id in startMoveYMap)) {
        //        config.list.push(id);
        //        startMoveYMap[id] = 0;
        //        var item = document.getElementById(id);
        //        item.className += config.containerClass;
        //        this._bindEvent([id]);
        //    }
        //},

        //pop: function (id) {
        //    var element = document.getElementById(id);
        //    delete startMoveYMap[id];
        //    _util.removeEvent(elem, 'touchstart', this.startMove);
        //    _util.removeEvent(elem, 'touchmove', this._preventMove);
        //}
    }
}