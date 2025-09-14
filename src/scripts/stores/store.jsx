function removeChangeListenerWithId(listenerId, eventIdentifier, store) {
    store.listeners[eventIdentifier] = store.listeners[eventIdentifier].filter((listener) => { return listener.id !== listenerId });
}
export class Store {
    constructor() {
        this.listeners = {};
        this.highestListernerId = 0;
    }

    addChangeListener(eventIdentifier, listener) {
        let listenerWithId = { execute: listener, id: this.highestListernerId };
        this.highestListernerId++;

        if (!this.listeners[eventIdentifier]) {
            this.listeners[eventIdentifier] = [];
        }

        this.listeners[eventIdentifier].push(listenerWithId);
        return () => { removeChangeListenerWithId(listenerWithId.Id, eventIdentifier, this); }
    }

    emitChange(eventIdentifier) {
        let listenersForEvent = this.listeners[eventIdentifier];
        if (listenersForEvent) {
            listenersForEvent.forEach((listener) => {
                listener.execute();
            });
        }
    }
}
