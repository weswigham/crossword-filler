import * as React from "react";
import "./App.css";
import { Grid, GridElement } from "./components";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { Slider } from "material-ui";

interface AppState {
  size: number;
  values: GridElement[][];
  symmetry: boolean;
  title: string;
}

interface WordRef {
  pos: {i: number, j: number};
  pattern: string;
  reference: number;
  text: string;
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
  private across: WordRef[] = [];
  private down: WordRef[] = [];
  constructor() {
    super();
    this.state = {
      size: 15,
      symmetry: true,
      values: newGridValues(15, 15),
      title: "",
    };
  }
  render() {
    const reflect = (i: number) => ((i + 1 - this.state.size) * -1);
    this.across = this.generateAcross();
    this.down = this.generateDown(this.across);

    return (
      <MuiThemeProvider>
        <div className="App">
          <div className="grid-container">
            <h1>Title:
              <span
                contentEditable={true}
                onInput={(e) => this.setState({...this.state, title: (e.target as HTMLSpanElement).innerText})}
              >{this.state.title}
              </span>
            </h1>
            <h3>Grid Size: {this.state.size}</h3>
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
                if (nextState.values[i][j].enabled === false) {
                  nextState.values[i][j].value = "";
                }
                if (this.state.symmetry) {
                  nextState.values[reflect(i)][reflect(j)].enabled
                     = nextState.values[i][j].enabled;
                  if (!nextState.values[reflect(i)][reflect(j)].enabled) {
                    nextState.values[reflect(i)][reflect(j)].value = "";
                  }
                }
                this.setState(nextState);
                event.preventDefault();
                event.stopPropagation();
              }}
            />
            <div>
              <label>Enforce Symmetry</label>
              <input
                type="checkbox"
                checked={this.state.symmetry}
                onChange={() => this.setState({...this.state, symmetry: !this.state.symmetry})}
              />
              <button onClick={() => this.fill()}>Fill</button>
              <button onClick={() => this.export()}>Export</button>
            </div>
            <div className="across-list">
              <h1>Across</h1>
              <ul className="unstyled-list">
              {
                this.across.map((e, i) => (
                  <li>
                    <h5>{e.reference}. {e.pattern} @ {e.pos.i},{e.pos.j}</h5>
                    <textarea onChange={(evt) => this.across[i].text = evt.target.value}/>
                  </li>
                ))
              }
              </ul>
            </div>
            <div className="down-list">
              <h1>Down</h1>
              <ul className="unstyled-list">
              {
                this.down.map((e, i) => (
                  <li>
                    <h5>{e.reference}. {e.pattern} @ {e.pos.i},{e.pos.j}</h5>
                    <textarea onChange={(evt) => this.down[i].text = evt.target.value}/>
                  </li>
                ))
              }
              </ul>
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
  private fill() {
    void 0;
  }
  private export() {
    const tab = "\t";
    const text = `<ACROSS PUZZLE>
<TITLE>
${tab}${this.state.title || "Untitled"}
<COPYRIGHT>
${tab}Author
<SIZE>
${tab}${this.state.size}x${this.state.size}
<GRID>
${this.state.values.map(r => `${tab}${r.map(e => e.enabled ? (e.value || "?") : ".").join("")}`).join("\n")}
<ACROSS>
${this.across.map(a => `${tab}${a.text || "No hint!"}`).join("\n")}
<DOWN>
${this.down.map(d => `${tab}${d.text || "No hint!"}`).join("\n")}`;
    const filename = `${this.state.title}.puz`;
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  private generateAcross() {
    const self = this;
    const words: WordRef[] = [];
    let buf = "";
    let inWordState = false;
    let bufStart: {i: number, j: number} = {i: 0, j: 0};
    for (let i = 0; i < this.state.values.length; i++) {
      for (let j = 0; j < this.state.values[i].length; j++) {
        const val = this.state.values[i][j];
        if (!inWordState && val.enabled) {
          inWordState = true;
          buf += val.value ? val.value : "?";
          bufStart = {i, j};
        } else if (inWordState && val.enabled) {
          buf += val.value ? val.value : "?";
        } else if (inWordState && !val.enabled) {
          finishWord();
        }
      }
      finishWord();
    }
    return words;

    function finishWord() {
      inWordState = false;
      if (buf.length === 0) { return; } 
      words.push({
        pos: bufStart,
        pattern: buf,
        reference: words.length + 1,
        text: (self.across[words.length + 1] || {text: ""}).text
      });
      buf = "";
    }
  }
  private generateDown(across: WordRef[]): WordRef[] {
    const words: WordRef[] = [];
    let prevIndex = across.length + 1;
    let buf = "";
    let inWordState = false;
    let bufStart: {i: number, j: number} = {i: 0, j: 0};
    for (let j = 0; j < this.state.values[0].length; j++) {
      for (let i = 0; i < this.state.values.length; i++) {
        const val = this.state.values[i][j];
        if (!inWordState && val.enabled) {
          inWordState = true;
          buf += val.value ? val.value : "?";
          bufStart = {i, j};
        } else if (inWordState && val.enabled) {
          buf += val.value ? val.value : "?";
        } else if (inWordState && !val.enabled) {
          finishWord();
        }
      }
      finishWord();
    }
    words.sort((a, b) => a.reference - b.reference);
    for (let i = 0; i < words.length; i++) {
        words[i].text = (this.down[i] || {text: ""}).text;
    }
    return words;

    function finishWord() {
      inWordState = false;
      if (buf.length === 0) { return; }
      const matching = across.find(w => w.pos.i === bufStart.i && w.pos.j === bufStart.j);
      words.push({pos: bufStart, pattern: buf, reference: matching ? matching.reference : prevIndex++, text: ""});
      buf = "";
    }
  }
}

export default App;
