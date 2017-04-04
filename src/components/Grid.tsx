import ReactDataSheet from "react-datasheet";
import "react-datasheet/lib/react-datasheet.css";
import * as React from "react";

export interface GridElement {
    value: string;
    enabled: boolean;
}

export interface GridState {
    width: number;
    height: number;
    values: GridElement[][];
}

const MyGrid: {new (): ReactDataSheet<GridElement>} = ReactDataSheet;

export default (state: GridState) => <MyGrid data={state.values} valueRenderer={(cell) => cell.value}/>;
