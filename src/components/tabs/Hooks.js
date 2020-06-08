
class Hooks {

    constructor() {
        this.hooks = {}
    }

    subscribe(key, func) {
        if (!this.hooks[key]) {
            this.hooks[key] = [];
        }

        this.hooks[key].push(func);
    }

    unsubscribe(key, func_to_remove) {
        let funcs = [];

        if (!this.hooks[key]) {
            return;
        }

        this.hooks[key].forEach(func => {
            if (func !== func_to_remove) {
                funcs.push(func);
            }
        });

        this.hooks[key] = funcs;
    }

    call(key) {
        if (!this.hooks[key]) {
            return;
        }

        this.hooks[key].forEach(func => {
            func();
        });
    }

}

export default Hooks;