import React, { useEffect, useState } from "react";
import { MapContainer, ImageOverlay, Marker, Tooltip, ZoomControl } from "react-leaflet";
import L from "leaflet";
import './App.css';
import "leaflet/dist/leaflet.css";

function gameToImageScaled(gameX, gameY, imageHeight = 1440) {
    const imageX = 1.304 * gameX + 444;
    const imageY = -1.300 * gameY + 1429.1;
    const mirroredY = imageHeight - imageY;
    return [mirroredY, imageX];
}

export default function App() {
    const bounds = [
        [0, 0],
        [1440, 1930]
    ];

    const [coords, setCoords] = useState([]);
    const [filterMaterials, setFilterMaterials] = useState([]);

    useEffect(() => {
        const loadCoordinates = async () => {
            const res = await fetch("/coordinates/index.json");
            const files = await res.json();

            const allCoords = [];

            for (const file of files) {
                const fileNameWithoutExtension = file.split("/").pop().replace(".txt", "");
                const tier = fileNameWithoutExtension.slice(0, 2);
                const material = fileNameWithoutExtension.split("-").slice(1).join("-");

                const text = await fetch(`/coordinates/${file}`).then((res) => res.text());
                const matches = text.match(/\{[^}]+\}/g) || [];

                const parsed = matches.map((m) => {
                    const xMatch = m.match(/x:([\d.-]+)/);
                    const yMatch = m.match(/z:([\d.-]+)/);

                    const icon = new L.Icon({
                        iconUrl: `/assets/Icons/${fileNameWithoutExtension}.png`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -32],
                    });

                    return {
                        x: xMatch ? parseFloat(xMatch[1]) : null,
                        y: yMatch ? parseFloat(yMatch[1]) : null,
                        material,
                        tier,
                        icon,
                    };
                });

                allCoords.push(...parsed);
            }

            // remove duplicates
            const unique = Array.from(
                new Map(allCoords.map((c) => [`${c.x},${c.y}`, c])).values()
            );

            setCoords(unique);
        };

        loadCoordinates();
    }, []);

    // Filter coordinates by selected materials
    const filteredCoords =
        filterMaterials.length === 0
            ? null
            : coords.filter((c) => filterMaterials.includes(c.material));

    const [copiedMarker, setCopiedMarker] = useState(null);

    const handleMarkerClick = async (e, x, y, index) => {
        console.log("click");
        e.originalEvent.stopPropagation(); // prevent map click
        try {
            let roundedX = Math.round(x);
            let roundedY = Math.round(y);
            await navigator.clipboard.writeText(`${roundedX} ${roundedY}`);
            setCopiedMarker(index); // show "Copied" message
            setTimeout(() => setCopiedMarker(null), 1000);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };
    let markerView;
    if (filteredCoords !== null) {
        markerView = filteredCoords.map((c, i) => {
            const [lat, lng] = gameToImageScaled(c.x, c.y);
            return (
                <Marker key={i} position={[lat, lng]} icon={c.icon} eventHandlers={{ click: (e) => handleMarkerClick(e, c.x, c.y, i), }}>
                    <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                        {copiedMarker === i ? "Copied" : `${c.x} ${c.y}`}
                    </Tooltip>
                </Marker>
            );
        });
    }

    return (
        <div>
            {/* Filter UI */}
            <div style={{ zIndex: 1000, background: "white", maxHeight: 300, overflowY: "auto" }}>
                <div
                    style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        zIndex: 1000, // higher than map
                        background: "rgba(255,255,255,0.9)",
                        borderRadius: 5,
                        maxHeight: 300,
                        overflowY: "auto",
                    }}
                >
                    <div id="InnerFilterContainer">
                        <div style={{ display: "flex", gap: "20px" }}> {/* horizontal layout */}
                            {["T1", "T2", "T3", "T4"].map((tier) => {
                                const materialsInTier = coords
                                    .filter((c) => c.tier === tier)
                                    .map((c) => c.material);
                                const uniqueMaterials = Array.from(new Set(materialsInTier));
                                if (uniqueMaterials.length === 0) return null; // skip empty tiers

                                const allSelected = uniqueMaterials.every((m) => filterMaterials.includes(m));

                                return (
                                    <div key={tier} style={{ marginBottom: 10 }}>
                                        <label className="filterLabel">
                                            <input
                                                type="checkbox"
                                                className="filterCheckbox"
                                                checked={allSelected}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    if (checked) {
                                                        setFilterMaterials(Array.from(new Set([...filterMaterials, ...uniqueMaterials])));
                                                    } else {
                                                        setFilterMaterials(filterMaterials.filter((m) => !uniqueMaterials.includes(m)));
                                                    }
                                                }}
                                            />
                                            {tier}
                                        </label>

                                        <div style={{ paddingLeft: 20, marginTop: 5 }}>
                                            {uniqueMaterials.map((material) => (
                                                <label key={material} className="filterLabel">
                                                    <input
                                                        type="checkbox"
                                                        className="filterCheckbox"
                                                        checked={filterMaterials.includes(material)}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            if (checked) {
                                                                setFilterMaterials([...filterMaterials, material]);
                                                            } else {
                                                                setFilterMaterials(filterMaterials.filter((m) => m !== material));
                                                            }
                                                        }}
                                                    />
                                                    {material}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
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
                zoomAnimation={false}
            >
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
