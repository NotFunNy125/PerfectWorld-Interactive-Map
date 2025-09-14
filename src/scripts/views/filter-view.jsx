import React from "react";
import "../../site.css"

export default class FilterView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filteredRessources: [] // only one variable
        };
    }

    handleTierChange(tier, checked) {
        this.setState(prevState => {
            let newFiltered;

            if (checked) {
                const toAdd = this.props.ressources.filter(r => r.tier === tier);
                newFiltered = [...prevState.filteredRessources, ...toAdd.filter(r =>
                    !prevState.filteredRessources.includes(r)
                )];
            } else {
                newFiltered = prevState.filteredRessources.filter(r => r.tier !== tier);
            }

            if (this.props.onFilterChange) {
                this.props.onFilterChange(newFiltered);
            }

            return { filteredRessources: newFiltered };
        });
    }

    handleMaterialChange(material, checked) {
        this.setState(prevState => {
            let newFiltered;

            if (checked) {
                const toAdd = this.props.ressources.filter(r => r.name === material);
                newFiltered = [...prevState.filteredRessources, ...toAdd.filter(r =>
                    !prevState.filteredRessources.includes(r)
                )];
            } else {
                newFiltered = prevState.filteredRessources.filter(r => r.name !== material);
            }

            if (this.props.onFilterChange) {
                this.props.onFilterChange(newFiltered);
            }

            return { filteredRessources: newFiltered };
        });
    }

    render() {
        const ressources = this.props.ressources;

        return (
            <div style={{ zIndex: 1000, background: "white", maxHeight: 300, overflowY: "auto" }}>
                <div
                    style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        zIndex: 1000,
                        background: "rgba(255,255,255,0.6)",
                        borderRadius: 5,
                        maxHeight: 300,
                        overflowY: "auto",
                    }}
                >
                    <div id="InnerFilterContainer">
                        <div style={{ display: "flex", gap: "20px" }}>
                            {["T1", "T2", "T3", "T4"].map(tier => {
                                const materialsInTier = ressources
                                    .filter(r => r.tier === tier)
                                    .map(r => r.name);
                                const uniqueMaterials = Array.from(new Set(materialsInTier));
                                if (uniqueMaterials.length === 0) return null;

                                const allSelected = uniqueMaterials.every(material =>
                                    this.state.filteredRessources.some(r => r.name === material)
                                );

                                return (
                                    <div key={tier} style={{ marginBottom: 10 }}>
                                        <label className="filterLabel">
                                            <input
                                                className="filterCheckbox"
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={e =>
                                                    this.handleTierChange(tier, e.target.checked)
                                                }
                                            />
                                            {tier}
                                        </label>

                                        <div style={{ paddingLeft: 20, marginTop: 5 }}>
                                            {uniqueMaterials.map(material => (
                                                <label key={material} className="filterLabel">
                                                    <input
                                                        className="filterCheckbox"
                                                        type="checkbox"
                                                        checked={this.state.filteredRessources.some(r => r.name === material)}
                                                        onChange={e =>
                                                            this.handleMaterialChange(material, e.target.checked)
                                                        }
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
        );
    }
}
