import { Store } from "store.jsx";
import actionIdentifier from "../constants/constants.js";
export default class FilterStore extends Store {
    constructor(dispatcher) {
        super(dispatcher);

        this.checkedTiers = [];
        this.checkedMaterials = [];

        dispatcher.register();
    }

    getCheckedTiers() {
        return this.checkedTiers;
    }

    getCheckedMaterials() {
        return this.checkedMaterials;
    }

    componentDidChange(action) {
        switch (action.type) {
            case actionIdentifier.filter.initialize:
                break;
        }
    }
}
