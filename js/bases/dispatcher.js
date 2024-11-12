export default class Dispatcher extends EventTarget {

    trigger(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {detail});
        this.dispatchEvent(event);
    }
}

export class DispatcherWithWeakRef {
    // Map event types to arrays of WeakRefs to listeners
    #listenersMap = new Map()
    get listenersMap(){
        return this.#listenersMap
    }
    addEventListener(type, callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('Event listener must be a function');
        }
        let listeners = this.listenersMap.get(type);
        if (!listeners) {
            listeners = [];
            this.listenersMap.set(type, listeners);
        }
        listeners.push(new WeakRef(callback));
    }

    removeEventListener(type, callback) {
        const listeners = this.listenersMap.get(type);
        if (!listeners) return;
        if (!callback) {
            /*drop all callback*/
            this.listenersMap.delete(type);
            return
        }
        // Remove the WeakRef that references the callback
        for (let i = 0; i < listeners.length; i++) {
            const ref = listeners[i];
            const listener = ref.deref();
            if (listener === callback) {
                listeners.splice(i, 1);
                break;
            }
        }
    }
    trigger(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {detail});
        this.dispatchEvent(event);
    }
    dispatchEvent(event) {
        const type = event.type;
        let listeners = this.listenersMap.get(type);
        if (listeners) {
            // Copy the array to avoid modification during iteration
            listeners = listeners.slice();
            for (let i = 0; i < listeners.length; i++) {
                const ref = listeners[i];
                const listener = ref.deref();
                if (listener) {
                    try {
                        listener.call(this, event);
                    } catch (e) {
                        // Handle exceptions thrown by listeners
                        console.error(e);
                    }
                } else {
                    // Listener has been garbage collected; remove the WeakRef

                    const index = listeners.indexOf(ref);
                    if (index !== -1) {
                        listeners.splice(index, 1);
                    }
                }
            }
        }
        // Call the 'on{eventname}' handler if it exists
        const handler = this['on' + type];
        if (typeof handler === 'function') {
            try {
                handler.call(this, event);
            } catch (e) {
                console.error(e);
            }
        }
        return !event.defaultPrevented;
    }
}

