import React from "react";
import { MapContainer, ImageOverlay, Marker, Tooltip, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../site.css"
import FilterView from "./filter-view.jsx";
const bounds = [
    [0, 0],
    [1440, 1930]
];

export default class MapView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ressources: props.mapStore.getRessources(),
            clickedMarker: props.mapStore.getClickedMarker(),
            filteredRessources: props.mapStore.getFilteredRessources()
        };
    }

    fetchData() {
        this.setState(
            {
                ressources: this.props.mapStore.getRessources(),
                clickedMarker: this.props.mapStore.getClickedMarker(),
                filteredRessources: this.props.mapStore.getFilteredRessources()
            });
    }

    async componentDidMount() {
        this.deregisterChangeListener = this.props.mapStore.addChangeListener("changed", this.fetchData.bind(this));
        const ressources = await this.extractRessources();
        this.props.mapActions.initialize(ressources);
    }

    componentWillUnmount() {

    }

    gameToImageScaled(gameX, gameY, imageHeight = 1440) {
        const imageX = 1.304 * gameX + 444;
        const imageY = -1.300 * gameY + 1429.1;
        const mirroredY = imageHeight - imageY;
        return [mirroredY, imageX];
    }

    async extractRessources() {
        try {
            // get index.json (list of files)
            const res = await fetch("coordinates/index.json");
            const files = await res.json(); // e.g. ["file1.txt", "file2.txt"]

            const allCoords = [];

            for (const file of files) {
                const fileNameWithoutExtension = file.split("/").pop().replace(".txt", "");
                const tier = fileNameWithoutExtension.slice(0, 2);
                const name = fileNameWithoutExtension.split("-").slice(1).join("-");

                // fetch coordinates file
                const text = await fetch(`coordinates/${file}`).then((res) => res.text());

                const matches = text.match(/\{[^}]+\}/g) || [];

                const parsed = matches.map((m) => {
                    const xMatch = m.match(/x:([\d.-]+)/);
                    const yMatch = m.match(/z:([\d.-]+)/);

                    const icon = new L.Icon({
                        iconUrl: `assets/Icons/${fileNameWithoutExtension}.png`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -32],
                    });

                    return {
                        name,
                        x: xMatch ? parseFloat(xMatch[1]) : null,
                        y: yMatch ? parseFloat(yMatch[1]) : null,
                        tier,
                        icon,
                    };
                });

                allCoords.push(...parsed);
            }

            // deduplicate by x,y
            const unique = Array.from(
                new Map(allCoords.map((c) => [`${c.x},${c.y}`, c])).values()
            );

            // update component state
            this.setState({ ressources: unique });

            return unique; // optional if caller (mapActions.initialize) uses it
        } catch (err) {
            console.error("Failed to load ressources:", err);
            return [];
        }
    }

    handleMarkerClick(e, x, y, index){
        e.originalEvent.stopPropagation();
        try {
            let roundedX = Math.round(x);
            let roundedY = Math.round(y);
            navigator.clipboard.writeText(`${roundedX} ${roundedY}`);
            this.props.mapActions.setCopiedMarker(index);
            setTimeout(() => this.props.mapActions.setCopiedMarker(null), 1000);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };

    render() {
        let markerView;
        if (this.state.filteredRessources !== null) {
            markerView = this.state.filteredRessources.map((ressource, i) => {
                const [lat, lng] = this.gameToImageScaled(ressource.x, ressource.y);
                return (
                    <Marker key={i} position={[lat, lng]} icon={ressource.icon} eventHandlers={{ click: (e) => this.handleMarkerClick(e, ressource.x, ressource.y, i), }}>
                        <Tooltip direction="top" offset={[0, -30]} opacity={1}>
                            {this.state.copiedMarker === i ? "Copied" : `${ressource.x} ${ressource.y}`}
                        </Tooltip>
                    </Marker>
                );
            });
        }

        return (
            <div>
                <FilterView ressources={this.state.ressources} onFilterChange={this.props.mapActions.filterRessources.bind(this.props.mapActions)} />
                <MapContainer
                    center={[900, 965]}
                    zoom={0.3}
                    crs={L.CRS.Simple}
                    maxBounds={bounds}
                    maxBoundsViscosity={1.0}
                    minZoom={0}
                    maxZoom={12}
                    zoomSnap={0}
                    zoomDelta={0.5}
                    wheelPxPerZoomLevel={120}
                    zoomAnimation={false}>
                    <ImageOverlay
                        url="assets/Genesis_World_Map_HighRes.jpg"
                        bounds={bounds}
                    />
                    {markerView}
                    <ZoomControl position="bottomright" />
                </MapContainer>
            </div>
        );
    }
}
