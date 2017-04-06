import ReactDataSheet = require("react-datasheet");
import "react-datasheet/lib/react-datasheet.css";
import "./Grid.css";
import * as React from "react";

export interface GridElement extends ReactDataSheet.Cell {
    value: string;
    enabled: boolean;
}

export interface GridProps {
    values: GridElement[][];
    onChange: ReactDataSheet.DataSheetProps<GridElement>["onChange"];
    onContextMenu: ReactDataSheet.DataSheetProps<GridElement>["onContextMenu"];
}

const MyGrid: {new (): ReactDataSheet<GridElement>} = ReactDataSheet;

function transformValues(vals: GridElement[][]): GridElement[][] {
    return vals.map((v, i) => v.map((e, j) => ({
        ...e,
        readOnly: !e.enabled
    })));
}

export default (props: GridProps) => {
    const fixedData = transformValues(props.values);
    return (
        <MyGrid
            data={fixedData}
            valueRenderer={cell => cell.value}
            onChange={props.onChange}
            onContextMenu={props.onContextMenu}
        />
    );
};
