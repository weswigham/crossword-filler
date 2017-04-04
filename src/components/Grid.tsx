import ReactDataSheet = require("react-datasheet");
import "react-datasheet/lib/react-datasheet.css";
import "./Grid.css";
import * as React from "react";

export interface GridElement {
    value: string;
    enabled: boolean;
}

export interface GridState {
    width: number;
    height: number;
    values: GridElement[][];
    onChange: ReactDataSheet.DataSheetProps<GridElement>["onChange"];
}

const MyGrid: {new (): ReactDataSheet<GridElement>} = ReactDataSheet;

export default (state: GridState) => (
    <MyGrid
        data={state.values}
        valueRenderer={(cell) => cell.value}
        onChange={state.onChange}
    />
);
