import {wait} from "../js/utils/codeflow-utils.js";

export class Counter {
    constructor(time, values = [3,2,1,'go!']) {
        this.values = values;
        this.time = time
        this.current = this.values.at(0)
    }
    async go(el){
        for (let v of this.values) {
            this.current = v
            this.draw(el)
            await  wait(this.time);
        }
        this.current = ''
        this.draw(el)
    }

    draw(el){
        el.innerText = this.current
    }

}