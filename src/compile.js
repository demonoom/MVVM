/*专门负责解析模板内容*/

class Compile {
    //参数1：模板
    //参数2：vue实例
    constructor(el, vm) {
        //el:new vue传递的选择器
        this.el = typeof el === 'string' ? document.querySelector(el) : el
        //vm:new的vue实例
        this.vm = vm

        //编译模板
        if (this.el) {
            //1.把el中所有的子节点都放入到内存中，fragment（文档碎片）
            let fragment = this.node2fragment(this.el)
            //2.在内存中编译fragment
            this.compile(fragment)
            //3.把fragment一次性添加到页面
            this.el.appendChild(fragment)
        }
    }

    /*核心方法*/

    node2fragment(node) {
        let fragment = document.createDocumentFragment()
        let childNodes = node.childNodes
        this.toArray(childNodes).forEach(node => {
            //把所有的子节点都添加到fragment中
            fragment.appendChild(node)
        })
        return fragment
    }

    /**
     * 编译文档碎片（内存中）
     * @param fragment
     */
    compile(fragment) {
        let childNodes = fragment.childNodes
        this.toArray(childNodes).forEach(node => {
            //编译子节点
            if (this.isElementNode(node)) {
                //如果是元素，需要解析指令
                this.compileElement(node)
            }
            if (this.isTextNode(node)) {
                //如果是文本节点，需要解析插值表达式
                this.compileText(node)
            }
            //如果当前节点还有子节点，需要递归解析
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
        })
    }

    /**
     * 解析html标签
     * @param node
     */
    compileElement(node) {
        //1.获取到当前节点下所有的属性
        let attributes = node.attributes
        this.toArray(attributes).forEach(attr => {
            //2.解析vue的指令（所有以v-开头的属性）
            let attrName = attr.name
            if (this.isDirective(attrName)) {
                let type = attrName.slice(2)
                let expr = attr.value
                //如果是v-text
                /*if (type === 'text') {
                    node.textContent = this.vm.$data[expr]
                }
                //如果是v-html
                if (type === 'html') {
                    node.innerHTML = this.vm.$data[expr]
                }
                //解析v-model
                if (type === 'model') {
                    node.value = this.vm.$data[expr]
                }*/

                //解析v-on
                if (this.isEventDirective(type)) {
                    //给当前元素注册事件即可
                    /*let eventzType = type.split(':')[1]
                    node.addEventListener(eventzType, this.vm.$methods[expr].bind(this.vm))*/
                    CompileUtil['eventHandler'](node, this.vm, type, expr)
                } else {
                    CompileUtil[type] && CompileUtil[type](node, this.vm, expr)
                }
            }
        })
    }

    /**
     * 解析文本节点
     * @param node
     */
    compileText(node) {
        let txt = node.textContent
        let reg = /\{\{(.+)\}\}/
        if (reg.test(txt)) {
            let expr = RegExp.$1//获取正则分组
            node.textContent = txt.replace(reg, CompileUtil.getVMValue(this.vm, expr))
            new Watcher(this.vm, expr, newValue => {
                node.textContent = txt.replace(reg, newValue)
            })
        }
    }


    /*工具方法*/
    toArray(likeArray) {
        return [].slice.call(likeArray)
    }

    isElementNode(node) {
        //nodeType:节点的类型  1:元素节点  3：文本节点
        return node.nodeType === 1
    }

    isTextNode(node) {
        return node.nodeType === 3
    }

    isDirective(attrName) {
        return attrName.startsWith('v-')
    }

    isEventDirective(type) {
        return type.split(':')[0] === 'on'
    }
}

let CompileUtil = {
    //处理v-text
    text(node, vm, expr) {
        node.textContent = this.getVMValue(vm, expr)
        /**
         * 通过watcher对象，监听expr的数据变化，一旦变化了，执行回调函数
         */
        new Watcher(vm, expr, (newValue, oldValue) => {
            node.textContent = newValue
        })
    },
    html(node, vm, expr) {
        node.innerHTML = this.getVMValue(vm, expr)
        new Watcher(vm, expr, newValue => {
            node.innerHTML = newValue
        })
    },
    model(node, vm, expr) {
        var _this = this
        node.value = this.getVMValue(vm, expr)
        //实现双向数据绑定，给node注册input事件，当当前元素的value值发生改变，修改对应数据
        node.addEventListener('input', (function () {
            _this.setVMValue(vm, expr, this.value)
        }))
        new Watcher(vm, expr, newValue => {
            node.value = newValue
        })
    },
    eventHandler(node, vm, type, expr) {
        let eventzType = type.split(':')[1]
        let fn = vm.$methods && vm.$methods[expr]
        if (eventzType && fn)
            node.addEventListener(eventzType, fn.bind(vm))
    },
    //用于获取VM中的数据
    getVMValue(vm, expr) {
        let data = vm.$data
        expr.split('.').forEach(key => {
            data = data[key]
        })
        return data
    },
    setVMValue(vm, expr, value) {
        let data = vm.$data
        let arr = expr.split('.')
        arr.forEach((key, index) => {
            //如果index是最后一个
            if (index < arr.length - 1) {
                data = data[key]
            } else {
                data[key] = value
            }
        })
    }
}

