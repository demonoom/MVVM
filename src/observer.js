/*
* observe用于给data中所有的数据添加getter和setter
* 方便我们在获取或者设置data中数据的时候，实现我们的逻辑
* */

class Observer {
    constructor(data) {
        this.data = data
        this.walk(data)
    }

    /*核心方法*/

    /**
     * 遍历data中所有的数据都添加上getter和setter
     * @param data
     */
    walk(data) {
        if (!data || typeof data != 'object') return;
        if (Array.isArray(data)) { // 如果是数组，遍历劫持数组的每个成员
            data.forEach(v => {
                this.walk(v);
            });
            // Vue 在这里还进行了数组方法的重写等一些特殊处理
            return;
        }
        Object.keys(data).forEach(key => {
            //给data对象的key设置getter和setter
            this.defineReactive(data, key, data[key])
            //如果data[key]是一个复杂的类型，递归的walk
            this.walk(data[key])
        })
    }

    /**
     * 定义响应式的数据（数据劫持）
     * @param obj
     * @param key
     * @param value
     */
    //data中的每一个数据都应该维护一个dep对象
    //dep保存了所有订阅了该数据的订阅者
    defineReactive(obj, key, value) {
        let _this = this
        let dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                console.log('获取了值', value);
                //如果Dep.target中有watcher对象，存储到订阅者数组中
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set(newValue) {
                if (value === newValue) return
                console.log('设置了值', newValue);
                value = newValue
                //如果newValue是一个对象，也应该对她进行劫持
                _this.walk(newValue)
                //发布通知，让所有的订阅者更新内容
                dep.notify()
            }
        })
    }
}