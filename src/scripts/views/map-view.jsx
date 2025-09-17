/* eslint-disable no-loss-of-precision */
import React from "react";
import { MapContainer, ImageOverlay, Marker, Tooltip, ZoomControl, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../site.css"
import FilterView from "./filter-view.jsx";

const bounds = [[0, 8192], [10240, 0]];
const start = [0, 0]; // Pixel-Koordinaten Start
const end = [10240, 7000];   // Pixel-Koordinaten Ende

const Affine = {
    A: 10.111348340026,
    B: 0.111150387422,
    C: -18.617286918161,

    D: -0.019484192071,
    E: -10.036338442396,
    F: 11161.51385668231
};

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

    gameToImageScaled(gameX, gameY) {
        const xi = Affine.A * gameX + Affine.B * gameY + Affine.C;
        const yi = Affine.D * gameX + Affine.E * gameY + Affine.F;
        return [Math.round(-yi) + 10240, Math.round(xi)];
    }

    testFormel(gameX, gameY) {
        const xi = Affine.A * gameX + Affine.B * gameY + Affine.C;
        const yi = Affine.D * gameX + Affine.E * gameY + Affine.F;
        return [Math.round(-yi) + 10240, Math.round(xi)];
    }

    async extractRessources() {
        try {
            const res = await fetch("coordinates/index.json");
            const files = await res.json();

            const allCoords = [];

            for (const file of files) {
                const fileNameWithoutExtension = file.split("/").pop().replace(".txt", "");
                const tier = fileNameWithoutExtension.slice(0, 2);
                const name = fileNameWithoutExtension.split("-").slice(1).join("-");

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

            const unique = Array.from(
                new Map(allCoords.map((c) => [`${c.x},${c.y}`, c])).values()
            );

            this.setState({ ressources: unique });

            return unique;
        } catch (err) {
            console.error("Failed to load ressources:", err);
            return [];
        }
    }

    handleMarkerClick(e, x, y, index) {
        e.originalEvent.stopPropagation();
        try {
            let roundedX = Math.round(x);
            let roundedY = Math.round(y);

            navigator.clipboard.writeText(`${roundedX} ${roundedY}`);
            this.props.mapActions.setCopiedMarker(index);
            setTimeout(() => {
                this.props.mapActions.setCopiedMarker(null);
            }, 1000);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };

    render() {
        const redIcon = new L.Icon({
            iconUrl: "assets/red-location-pin.png",
            iconSize: [32, 32]
        });
        let markerView;
        let testMarkerView=
            (<div>
                
                {/*Oben Links*/}<Marker icon={redIcon} position={[9217, 1034]}></Marker>

                {/*Da drunter Oben Links*/}<Marker icon={redIcon} position={[7702, 1270]}></Marker>

                {/*Unten Rechts*/}<Marker icon={redIcon} position={[2825, 6767]}></Marker>

                {/*Oben Rechts*/}<Marker icon={redIcon} position={[8794, 6734]}></Marker>
                <Marker position={this.testFormel(663, 968)}></Marker>

                <Marker position={this.testFormel(93,1010)}></Marker>
                <Marker position={this.testFormel(667, 372)}></Marker>
                <Marker position={this.testFormel(118, 859)}></Marker>

                <Marker position={this.testFormel(448, 873)}></Marker>

                
            </div>);
        if (this.state.filteredRessources !== null) {
            markerView = this.state.filteredRessources.map((ressource, i) => {
                const [x, y] = this.gameToImageScaled(ressource.x, ressource.y);
                return (
                    <Marker key={i} position={[x, y]} icon={ressource.icon} eventHandlers={{ click: (e) => this.handleMarkerClick(e, ressource.x, ressource.y, i), }}>
                        <Tooltip direction="top" offset={[0, -30]} opacity={1}>
                            {this.state.clickedMarker === i ? "Copied" : `${ressource.x} ${ressource.y}`}
                        </Tooltip>
                    </Marker>
                );
            });
        }
        return (
            <div>
                <div className="overlay">
                    <div className="overlay-container">
                        <div className="overlay-item" id="filters">
                            <FilterView ressources={this.state.ressources} onFilterChange={this.props.mapActions.filterRessources.bind(this.props.mapActions)} />
                        </div>
                    </div>
                    <div className="overlay-container">
                        <div className="overlay-item" id="tools" style={{ display: "flex", flexDirection: "column" }}>
                            <label className="headline" style={{ marginBottom: 5 }}>Tools</label>
                            <img className="clickable" src="assets/route.png" style={{ width: 45, height: 45 }} />
                        </div>
                    </div>
                </div>
                
                


                {/*<table className="overlay-container">*/}
                {/*    <tbody>*/}
                {/*        <tr>*/}
                {/*            <td>*/}
                {/*                <FilterView ressources={this.state.ressources} onFilterChange={this.props.mapActions.filterRessources.bind(this.props.mapActions)} />*/}
                {/*            </td>*/}
                {/*        </tr>*/}
                {/*        <tr>*/}
                {/*            <td>*/}
                {/*                <div className="overlay-background" style={{width: 150, height: 800} }>Test</div>*/}
                {/*            </td>*/}
                {/*        </tr>*/}
                {/*    </tbody>*/}
                {/*</table>*/}
                <MapContainer
                    center={[5120, 4595]}
                    zoom={-2}
                    crs={L.CRS.Simple}
                    maxBounds={bounds}
                    maxBoundsViscosity={0}
                    minZoom={-2}
                    maxZoom={3} /*1.25*/
                    zoomSnap={0}
                    zoomDelta={0.5}
                    wheelPxPerZoomLevel={120}
                    zoomAnimation={false}>
                    <ImageOverlay
                        url="assets/PWI_Detailed_web70.webp"
                        bounds={bounds}
                    />
                    {markerView}
                    {testMarkerView}
                    <ZoomControl position="bottomright" />

                    <Polyline positions={[start, end]} />
                </MapContainer>
            </div>
        );
    }
}
