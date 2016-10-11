/**
 * Created by Yao on 2016/8/18.
 */
(function (window,undefined) {
    var Select,
        parseHTML,
        support = {},
        rnative = /\[native code\]/,
        push = [].push;

    //处理push在ie9以下中不支持伪数组的问题
    try {
        push.apply([],document.getElementsByTagName("*"));
    }catch ( e ){
        push = {
            apply : function(a,b){
                for(var i = 0; i < b.length; i++){
                    a[a.length++] = b[i];
                }
                return a.length;
            },
            call : function ( a ) {
                for(var i = 1; i < arguments.length; i++){
                    a[a.length++] = arguments[i];
                }
            }
        }
    }
    //判断系统是否支持以下的方法,并将bool值存入support中
    support.qsa = rnative.test(document.querySelectorAll);
    support.gebc = rnative.test(document.getElementsByClassName);
    support.egebc = rnative.test(Element.prototype.getElementsByClassName);
    support.indexOf = rnative.test(Array.prototype.indexOf);
    support.trim = rnative.test(String.prototype.trim);
    //support.addEventListener = rnative.test(Element.prototype.addEventListener);
    function myjQ(selector){
        return new myjQ.fn.init(selector);
    }

    myjQ.fn = myjQ.prototype = {
        constructor : myjQ ,
        length : 0,
        //框架核心模块
        init : function(selector){
            if(!selector) return this;
            if(typeof selector == "string"){
                //str
                if(selector.charAt(0) === "<"){
                    //html字符串
                    push.apply(this,myjQ.parseHTML(selector));
                }else{
                    //选择器
                    push.apply(this,myjQ.Select(selector));
                }
                return this;
            }else if(typeof selector == "function"){
                //fn当传入的为function时，就当做调用入口函数来执行
                var oldFunc = window.onload;
                if(typeof oldFunc === "function"){
                    window.onload = function () {
                        oldFunc();
                        selector();
                    }
                }else {
                    window.onload = selector;
                }

                return this;
            }else if(selector.nodeType){
                //dom
                this[this.length++] = selector;
                return this;
            }else if(selector.constructor == myjQ){
                //myjQ
                [].push.apply(this,selector);
                return this;
            }else {
                if(myjQ.isLikeArray(selector)){
                    [].push.apply(this,selector);
                }else {
                    this[this.length++] = selector;
                }
                return this;
            }

        },
        toArray : function () {
            return [].slice.call(this,0);
        },
        get : function (index) {
            if(index == undefined){
                return this.toArray();
            }else {
                return index >= 0 ? this[index] : this[this.length + index];
            }
        },
        eq : function (index) {
            return this.constructor(this.get(index));
        },
        first : function () {
            return this.eq(0);
        },
        last : function () {
            return this.eq(-1);
        },
        each : function(callback){
            myjQ.each(this,callback);
            return this;
        },
        map : function(callback){
            myjQ.map(this,callback);
            return this;
        }/*,
        prev : function () {
            this.prev = this;
            return this.prev;
        }*/
    };
    //myjQ.prototype.init.prototype = myjQ.prototype;
    myjQ.fn.init.prototype = myjQ.fn;

    //混入实现对象方法的扩展
    myjQ.extend = myjQ.fn.extend = function (obj) {
        for(var k in obj){
            this[k] = obj[k];
        }
    }


    //工具方法
    myjQ.extend({
     //自定义一个indexOf方法
        indexOf : function (arr,search,startIndex){
        startIndex = startIndex || 0;
        if(support.indexOf){
            return arr.indexOf(search);
        }else {
            //自己实现
            for(var i = startIndex; i < arr.length; i++){
                if(arr[i] === search){
                    return i;
                }
            }
            return -1;
        }
    },

    //自定义一个trim方法
        trim : function (str){
        if(support.trim){
            return str.trim();
        }else {
            var reg = /^(\s+)|(\s+)$/g;
            return str.replace(reg,"");
        }
    },
    //自定义一个数组去重方法
        unique : function (parm){
        var newArr = [];
        for(var i = 0; i < parm.length; i++){
            if(myjQ.indexOf(newArr,parm[i]) === -1){
                newArr.push(parm[i]);
            }
        }
        return newArr;

    },
    //自定义一个判断对象是否为数组的方法
    //通常的，我们认定一个对象，只要有length属性，并且值不小于0，那么我们就认为该对象为数组
        isLikeArray:function (obj){
            return obj.length >= 0;
        },

    //自定义each方法
        each : function (parm,callback){
            if(typeof  parm !== "object") throw new Error("请传入对象类型的变量！");
            if(myjQ.isLikeArray(parm)){
                for(var i = 0; i < parm.length; i++){
                    if(callback.call(parm[i],i,parm[i]) === false) break;
                }
            }else {
                for(var k in parm){
                    if(callback.call(parm[k],k,parm[k]) === false) break;
                }
            }
            return parm;
    },
        map : function (parm,callback) {
            var res = [];
            if(typeof  parm !== "object") throw new Error("请传入对象类型的变量！");
            if(myjQ.isLikeArray(parm)){
                for(var i = 0; i < parm.length; i++){
                    var v = callback(parm[i],i);
                    if(v !== undefined){
                        res.push(v);
                    }
                }
            }else {
                for(var k in parm){
                    var v = callback(parm[k],k);
                    if(v !== undefined){
                        res.push(v);
                    }
                }
            }
            return res;
        },
        nextElement : function (elem) {
            var node;
            if(elem.nextElementSibling){
                return elem.nextElementSibling;
            }else {
                node = elem.nextSibling;
                while (node.nodeType !== 1){
                    node = node.nextSibling;
                }
                return node;
            }
        }

    });

    //选择器模块方法
    Select = (function (window, undefined) {
        //1.定义一个support对象，用来存储能力检测之后的结果
        //2.根据能力检测的结果来决定是否可以直接使用
        //3.如果系统不支持，则需要自己来实现

        //基本选择器函数
        function t(tagName,node, result){
            result = result || [];
            node = node || document;
            push.apply(result, node.getElementsByTagName(tagName));
            return result;
        }

        function c(className,node, result){
            result = result || [];
            node = node || document;
            push.apply(result, getByClass(className, node));
            return result;
        }

        function id(idName ,node, result){
            result = result || [];
            if(document.getElementById(idName)){
                push.call(result, document.getElementById(idName));
            }
            return result;
        }
        //定义一个函数来实现通过类名获取元素的功能
        function getByClass(className,node){
            var arr = [],
                tags = document.getElementsByTagName("*"),
                i ;
            if(node === document && support.gebc || node.nodeType === 1 && support.egebc){
                return node.getElementsByClassName(className);
            }else {
                //系统不支持该方法，自己实现
                for(i = 0; i < tags.length; i++){
                    if(tags[i].getAttribute("class") && indexOf(tags[i].getAttribute("class").split(" "),className) != -1){
                        arr.push(tags[i]);
                    }
                }
                return arr;
            }
        }

        //主选择器功能
        function selector (selectors,node,result) {
            result = result || [];
            node = node || document;
            if(support.qsa){
                push.apply(result,document.querySelectorAll(selectors));
                return result;
            }else{
                //系统不支持该方法,自己实现
                return mySelect(selectors,node,result);
            }
        }

        //实现组合选择器的功能
        function mySelect(selectors,node,result){
            result = result || [];
            node = node || document;
            var selectorList = selectors.split(",");
            for(var i = 0; i < selectorList.length; i++){
                mySelect2(myjQ.trim(selectorList[i]),node,result);
            }
            return myjQ.unique(result);
        }

        //自己实现基本选择器功能
        function mySelect2(selectors,node,result){
            result = result || [];
            node = node || document;
            var firstChar = selectors.charAt(0);
            if(!(/\s+/.test(selectors))){
                if(firstChar === "#"){
                    return id(selectors.slice(1),node,result);
                }else if(firstChar === "."){
                    return c(selectors.slice(1),node,result);
                }else {
                    return t(selectors,node,result);
                }
            }else {
                //判断是否都为后代选择器
                if(/^[#\.\w\d\-_]+(\s+[#\.\w\d\-_]+)+$/.test(selectors)){
                    //posteritySelect(selectors,node,result);
                    var tmpResult = posteritySelect( selectors, node, result );
                    push.apply( result, tmpResult );
                    return result;
                }else {
                    throw new Error("暂时不支持该选择器,请等待我们的更新！");
                }
            }
        }

        //后代选择器 "#box  .p"
        function posteritySelect(selectors,node,result){
            result = result || [];
            node = node || document;
            var list = selectors.replace(/\s+/g," ").split(" "),
                nodes = [];
            result = [node];
            for(var i = 0; i < list.length; i++){
                nodes = result;
                result = [];
                for(var j = 0; j < nodes.length; j++){
                    mySelect2(list[i],nodes[j],result);
                }
            }
            return result;
        }
        return selector;
    })(window);
    //在外面加入，方便以后需要的时候使用更好的选择器引擎
    myjQ.Select = Select;


/*-------------------------------------------------------------------------*/



    //dom操作模块方法
    myjQ.parseHTML = (function () {
        var node = document.createElement("div");
        return function (str) {
            var arr = [];
            node.innerHTML = str;
            arr.push.apply(arr,node.childNodes);
            return arr;
        }
    })();

    //DOM操作模块方法
    myjQ.fn.extend({
        appendTo : function (obj) {
            var objList = this.constructor(obj),
                obj2,
                newObj = this.constructor(),
                arr = [];
            for(var i = 0; i < objList.length; i++){
                for(var j = 0; j < this.length; j++){
                    obj2 = i == objList.length - 1 ? this[j] : this[j].cloneNode(true);
                    arr.push(obj2);
                    objList[i].appendChild(obj2);
                }
            }
            push.apply(newObj,arr);

            newObj.prev = this;
            
            return newObj;
        },
        append : function (obj) {
            this.constructor(obj).appendTo(this);
            return this;
        },
        //将dom1元素前置到一个dom2对象中
        prependChild : function (dom1,dom2) {
            dom2.insertBefore(dom1,dom2.firstChild);
        },
        prependTo : function (obj) {
            var objList = this.constructor(obj),
                obj2,
                arr = [],
                newObj = this.constructor();
            for(var i = 0; i < objList.length; i++){
                for(var j = this.length - 1; j >= 0 ; j--){
                    obj2 = i === objList.length - 1 ? this[j] : this[j].cloneNode(true);
                    arr.push(obj2);

                    this.prependChild(obj2,objList[i]);
                }

            }
            push.apply(newObj,arr);
            newObj.prev = this;
            return newObj;
        },
        
        next : function () {
            var siblings = [];
            this.each(function(){
                siblings.push(myjQ.nextElement(this));
            });
            return this.constructor(siblings);
        },
        nextAll : function () {
            var siblings = [];
            this.each(function(){
                var node = this.nextSibling;
                while (node){
                    if(node.nodeType === 1){
                        siblings.push(node);
                    }
                    node = node.nextSibling;
                }
            });
            return this.constructor(siblings);
        },

        end : function () {
            return this.prev || this;
        }
    });




    //事件操作模块方法(不兼容ie)
    //myjQ.fn.extend({
    //    on : function (type,callback) {
    //        return this.each(function (i ,v) {
    //            if(support.addEventListener){
    //                this.addEventListener(type ,callback);
    //            }else {
    //                this.attachEvent("on" + type, callback);
    //            }
    //        });
    //    },
    //    off : function (type,callback) {
    //        return this.each(function (i ,v) {
    //            this.removeEventListener(type,callback);
    //        });
    //    }
    //
    //});

    //事件模块操作方法(兼容ie)
    myjQ.fn.extend({
        on : function (type , callback) {
            var that;
            this.each(function () {
                this.events = this.events || {};
                this.events[type] = this.events[type] || [];
                this.events[type].push(callback);
                this["on"+ type] = function (e) {
                    that = this;
                    myjQ.each(this.events[type], function (i,v) {
                        v.call(that,e);
                    });
                }
            });
            return this;
        },
        off : function (type , callback) {
            var that;
            this.each(function (i ,v) {
                that = this;
                myjQ.each(v.events[type],function (i ,v) {
                    if(v == callback){
                        that.events[type].splice(i,1);
                    }
                });
            });
            return this;
        }
    });


    myjQ.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
        "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
        "change select submit keydown keypress keyup error contextmenu").split(" "), function (i,v) {
        myjQ.fn[v] = function (callback) {
            this.on(v,callback);
            return this;
        }
    });


    
    //css操作模块
    myjQ.fn.extend({
        css : function (name ,value) {
            if(typeof name === "string" && typeof value === "string"){
                this.each(function () {
                    this.style[name]  = value;
                });
            }else if(typeof value === "undefined"){
                if(typeof name === "string"){
                    if(this[0].style[name]){
                        return this[0].style[name];
                    }else if(window.getComputedStyle){
                        return window.getComputedStyle(this[0],null)[name];
                    }else {
                        return this[0].currentStyle[name];
                    }
                }else if(typeof name === "object"){
                    var that = this;
                    $.each(name, function (k ,v) {
                        that.each(function () {
                            this.style[k] = v;
                        });
                    })
                }
            }
            return this;
        },
        addClass : function (name) {
            if(typeof name !== "string") return this;
            this.each(function () {
                if(!this.className){
                    this.className = name;
                }else if(this.className.indexOf(name) === -1){
                    this.className += " "+ name;
                }
            });
            return this;
        },
        removeClass : function (name) {
            if(typeof name !== "string") return this;
            this.each(function () {
                var arr = this.className.split(" ");
                while (myjQ.indexOf(arr,name) !== -1){
                    arr.splice(myjQ.indexOf(arr,name),1);
                }
                this.className = arr.join(" ");
            });
            return this;
        },
        hasClass : function (name) {
            if(typeof name !== "string") return this;
            var res = false;
            this.each(function () {
                var tmp = this.className;
                if(tmp.indexOf(name) !== -1){
                    res = true;
                    return false;
                }
            });
            return res;
        },
        toggleClass : function (name) {
            if(typeof name !== "string") return this;
            var that = this;
            this.each(function () {
                if(that.constructor(this).hasClass(name)){
                    that.constructor(this).removeClass(name);
                }else {
                    that.constructor(this).addClass(name);
                }
            });
            return this;
        }
    });



    //属性操作模块
    myjQ.fn.extend({
        attr : function (name ,value) {
            if(typeof name === "string" && typeof value === "string"){
                this.each(function () {
                    this.setAttribute(name,value);
                });
            }else if(typeof value === "undefined"){
                if(typeof name === "string"){
                    return this[0].getAttribute(name);
                }else if(typeof name === "object"){
                    var that = this;
                    $.each(name, function (k ,v) {
                        that.each(function () {
                            this.setAttribute(k,v);
                        });
                    })
                }
            }
            return this;
        },
        removeAttr : function (name) {
            if(typeof name === "string"){
                this.each(function () {
                    this.removeAttribute(name);
                });
            }
            return this;
        },
        prop : function (name ,value) {
            if(typeof name === "string" && value){
                if(typeof value === "string"){
                    this.each(function () {
                        this[name] = value;
                    });
                }else if(typeof value === "function"){
                    this.each(function (v,i) {
                        this[name] = value.call(this,this,i);
                    });
                }

            }else if(typeof value === "undefined"){
                if(typeof name === "string"){
                    return this[0][name];
                }else if(typeof name === "object"){
                    var that = this;
                    $.each(name, function (k ,v) {
                        that.each(function () {
                            this[k] = v;
                        });
                    })
                }
            }
            return this;
        },
        val : function (value) {
            if(typeof value === "string"){
                this.each(function () {
                    this.value = value;
                });
            }else if(value === undefined){
                return this.get(0).value;
            }
            return this;
        },
        html : function (html) {
            if(typeof html === "string"){
                this.each(function () {
                    this.innerHTML = html;
                });
            }else if(html === undefined){
                return this.get(0).innerHTML;
            }
            return this;
        },
        text : function (text) {
            if(typeof text === "string"){
                this.html(text);
            }else if(text === undefined){
                var arr = [],
                    that = this;
                this.each(function () {
                    that.constructor.getText(this,arr);
                });
                return arr.join("");
            }
            return this;
        }
    });
    
    myjQ.extend({
        getText : function (dom, list) {
            var tmp = dom.childNodes,
                that = this;
            this.each(tmp, function (i ,v) {
                if(v.nodeType === 3){
                    list.push(v.nodeValue);
                }else if(v.nodeType === 1){
                    that.getText(v,list);
                }
            });

        }
    });


        window.myjQ = window.$ = myjQ;
})(window);




