import * as React from "react";
import * as ReactDOMClient from 'react-dom/client';

import MapView from "./views/map-view.jsx"
import Dispatcher from "./dispatcher/dispatcher.jsx"
import MapStore from "./stores/map-store.jsx"
import MapActions from "./actions/map-actions.jsx"

let dispatcher = new Dispatcher();
let mapStore = new MapStore(dispatcher);
let mapActions = new MapActions(dispatcher);

const anchor = document.getElementById("mapContainer");
if (anchor) {
    const root = ReactDOMClient.createRoot(anchor);

    root.render(<MapView mapStore={mapStore} mapActions={mapActions} />);
}