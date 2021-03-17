function Observer(obj) {
    Object.keys(obj).forEach(key => { // 做深度监听
        if (typeof obj[key] === 'object') {
            obj[key] = Observer(obj[key]);
        }
    });
    let dep = new Dep();
    let handler = {
        get: function (target, key, receiver) {
            Dep.target && dep.addSub(Dep.target);
            // 存在 Dep.target，则将其添加到dep实例中
            return Reflect.get(target, key, receiver);
        },
        set: function (target, key, value, receiver) {
            let result = Reflect.set(target, key, value, receiver);
            dep.notify(); // 进行发布
            return result;
        }
    };
    return new Proxy(obj, handler)
}