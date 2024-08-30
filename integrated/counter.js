import {wait} from "../js/utils/codeflow-utils.js";
import {beep} from "../js/Audio/beepAudio.js";

export class Counter {
    constructor(time, values = [[3,400],[2,400],[1,400],['go!',700]]) {
        this.values = values;
        this.time = time
        this.current = this.values.at(0)
    }
    async go(el){
        for (let [v,f] of this.values) {
            this.current = v
            this.draw(el)
            beep(f)
            await  wait(this.time);
        }
        this.current = ''
        this.draw(el)
    }

    draw(el){
        el.innerText = this.current
    }

}