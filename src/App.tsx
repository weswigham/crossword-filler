import * as React from "react";
import "./App.css";
import * as solved from "solved";
import { Grid, GridElement } from "./components";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { Slider } from "material-ui";

const logo = require("./logo.svg");

interface AppState {
  size: number;
  values: GridElement[][];
}

function newGridValues(width: number, height: number) {
  const ret: GridElement[][] = [];
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      ret[x] = ret[x] || [];
      ret[x][y] = {value: "", enabled: true};
    }
  }
  return ret;
}

function alterValues(values: GridElement[][], newSize: number) {
  const newGrid = newGridValues(newSize, newSize);
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {
      if (newGrid[i] && newGrid[i][j]) {
        newGrid[i][j] = {...(values[i][j])};
      }
    }
  }
  return newGrid;
}

function clone(state: AppState) {
  return {...state, values: alterValues(state.values, state.size)};
}

class App extends React.Component<null, AppState> {
  constructor() {
    super();
    this.state = {
      size: 15,
      values: newGridValues(15, 15)
    };
  }
  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>Welcome to React</h2>
          </div>
          <p className="App-intro">
            <small>To get started, edit <code>src/App.tsx</code> and save to reload.</small>
            <br/>
            <small>Available slitherlink strategies: {Object.keys(solved.Slitherlink.Strategies)
              .filter(k => k !== "all" && k !== "register").join(", ")}</small>
          </p>
          <div className="grid-container">
            <h3>Grid Size</h3>
            <div className="top-slider">
              <Slider
                max={21}
                min={3}
                defaultValue={15}
                step={1}
                value={this.state.size}
                onChange={(evt, val) => {
                  this.setState({ ...this.state, size: val, values: alterValues(this.state.values, val) });
                }}
              />
            </div>
            <Grid
              values={this.state.values}
              onChange={(cell, i, j, newVal) => {
                if (newVal.length > 1) { return; } // Forbid multiple characters in one box
                const nextState = clone(this.state);
                nextState.values[i][j] = { value: newVal.toLocaleUpperCase(), enabled: true };
                this.setState(nextState);
              }}
              onContextMenu={(event, cell, i, j) => {
                const nextState = clone(this.state);
                nextState.values[i][j].enabled = !nextState.values[i][j].enabled;
                this.setState(nextState);
                event.preventDefault();
                event.stopPropagation();
              }}
            />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
