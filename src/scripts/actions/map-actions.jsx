import { actionIdentifier } from "../constants/constants.js";
export default class MapActions{
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }

    initialize(ressources) {
        this.dispatcher.dispatch({
            type: actionIdentifier.map.initialize,
            ressources: ressources
        });
    }

    filterRessources(filteredRessources) {
        this.dispatcher.dispatch({
            type: actionIdentifier.map.filterRessources,
            filteredRessources: filteredRessources
        });
    }

    setCopiedMarker(index) {
        this.dispatcher.dispatch({
            type: actionIdentifier.map.setCopiedMarker,
            index: index
        });
    }
}