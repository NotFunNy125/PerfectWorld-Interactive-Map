import { Store } from "./store.jsx";
import { actionIdentifier } from "../constants/constants.js";
export default class MapStore extends Store {
    constructor(dispatcher) {
        super(dispatcher);

        this.ressources = [];
        this.clickedMarker = null;
        this.filteredRessources = [];

        dispatcher.register(this.onActionDispatched.bind(this));
    }

    onInitialize(ressources) {
        this.ressources = ressources;
        this.emitChange('changed');
    }

    getRessources() {
        return this.ressources;
    }

    getClickedMarker() {
        return this.clickedMarker;
    }

    getFilteredRessources() {
        return this.filteredRessources;
    }

    onFilterRessources(filteredRessources) {
        this.filteredRessources = filteredRessources;
        this.emitChange('changed');
    }

    onSetCopiedMarker() {

    }

    onActionDispatched(action) {
        
        switch (action.type) {
            case actionIdentifier.map.initialize:
                this.onInitialize(action.ressources);
                break;
            case actionIdentifier.map.filterRessources:
                this.onFilterRessources(action.filteredRessources);
                break;
            case actionIdentifier.map.setCopiedMarker:
                this.onSetCopiedMarker();
                break;
                
        }
    }
}
