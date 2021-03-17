/**
 * 定义一个类，用于创建vue实例
 * 设置默认参数options为空对象
 */
class Vue {
    constructor(options = {}) {
        //给vue实例增加属性
        this.$el = options.el
        this.$data = options.data
        this.$methods = options.methods
        this.$computed = options.computed

        //监视data中的数据
        new Observer(this.$data)
        // this.$data = Observer(this.$data)

        //把data中所有的数据代理到了vm上
        this.proxy(this.$data)
        //把methods中所有的数据代理到了vm上
        this.proxy(this.$methods)
        this.proxy(this.$computed)


        //如果指定了el参数，对el进行解析
        if (this.$el) {
            //compile负责解析模板的内容
            //需要：模板和数据
            new Compile(this.$el, this)
        }
    }

    proxy(data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                configurable: true,
                enumerable: true,
                get() {
                    return data[key]
                },
                set(v) {
                    if (data[key] === v) return
                    data[key] = v
                }
            })
        })
    }
}