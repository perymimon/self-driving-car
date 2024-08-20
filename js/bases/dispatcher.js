export default class Dispatcher extends EventTarget {

    trigger(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        this.dispatchEvent(event);
    }
}