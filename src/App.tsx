import * as React from "react";
import "./App.css";
import { Grid, GridElement } from "./components";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { Slider } from "material-ui";
import ReactDataSheet = require("react-datasheet");

interface AppState {
  size: number;
  values: GridElement[][];
  symmetry: boolean;
  title: string;
  across: WordRef[];
  down: WordRef[];
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
  return {
    ...state,
    values: alterValues(state.values, state.size),
    across: state.across.map(m => ({...m})),
    down: state.down.map(m => ({...m}))
  };
}

const NumberGrid: {new (): ReactDataSheet<{value: string, readOnly: boolean}>} = ReactDataSheet;

class App extends React.Component<null, AppState> {
  constructor() {
    super();
    this.state = {
      size: 15,
      symmetry: true,
      values: newGridValues(15, 15),
      title: "",
      across: [],
      down: [],
    };
  }
  render() {
    const reflect = (i: number) => ((i + 1 - this.state.size) * -1);

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
                  const values = alterValues(this.state.values, val);
                  const across = this.generateAcross(values);
                  const down = this.generateDown(across, values);
                  this.setState({ ...this.state, size: val, values, across, down });
                }}
              />
            </div>
            <div className="word-grid">
              <Grid
                values={this.state.values}
                onChange={(cell, i, j, newVal) => {
                  if (newVal.length > 1) { return; } // Forbid multiple characters in one box
                  const nextState = clone(this.state);
                  nextState.values[i][j] = { value: newVal.toLocaleUpperCase(), enabled: true };
                  const across = this.generateAcross(nextState.values);
                  const down = this.generateDown(across, nextState.values);
                  nextState.across = across;
                  nextState.down = down;
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
                  const across = this.generateAcross(nextState.values);
                  const down = this.generateDown(across, nextState.values);
                  nextState.across = across;
                  nextState.down = down;
                  this.setState(nextState);
                  event.preventDefault();
                  event.stopPropagation();
                }}
              />
            </div>
            <div className="number-grid">
              <NumberGrid data={this.generateNumbers()} onChange={() => ({})} valueRenderer={cell => cell.value}/>
            </div>
            <div>
              <label>Enforce Symmetry</label>
              <input
                type="checkbox"
                checked={this.state.symmetry}
                onChange={() => this.setState({...this.state, symmetry: !this.state.symmetry})}
              />
              <button onClick={() => this.fill()}>Fill</button>
              <button onClick={() => this.export()}>Export</button>
              <button onClick={() => document.getElementById("load-file")!.click()}>Load File</button>
              <input
                id="load-file"
                name="Load file"
                style={{position: "absolute", width: "0.01px", height: "0.01px"}}
                type="file"
                accept=".txt,.puz"
                onChange={e => this.load(e)}
              />
            </div>
            <div className="across-list">
              <h1>Across</h1>
              <ul className="unstyled-list">
              {
                this.state.across.map((e, i) => (
                  <li>
                    <h5>{e.reference}. {e.pattern} @ {e.pos.i},{e.pos.j}</h5>
                    <textarea
                      onChange={(evt) => {
                        const newState = clone(this.state);
                        newState.across[i].text = evt.target.value;
                        this.setState(newState);
                      }}
                    >{e.text}
                    </textarea>
                  </li>
                ))
              }
              </ul>
            </div>
            <div className="down-list">
              <h1>Down</h1>
              <ul className="unstyled-list">
              {
                this.state.down.map((e, i) => (
                  <li>
                    <h5>{e.reference}. {e.pattern} @ {e.pos.i},{e.pos.j}</h5>
                    <textarea
                      onChange={(evt) => {
                        const newState = clone(this.state);
                        newState.down[i].text = evt.target.value;
                        this.setState(newState);
                      }}
                    >{e.text}
                    </textarea>
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
  private generateNumbers() {
    const numberGrid: {value: string, readOnly: boolean}[][] = [];
    for (let i = 0; i < this.state.values.length; i++) {
      for (let j = 0; j < this.state.values[i].length; j++) {
        numberGrid[i] = numberGrid[i] || [];
        numberGrid[i][j] = {value: "", readOnly: true};
      }
    }
    for (const a of this.state.across) {
      numberGrid[a.pos.i][a.pos.j].value = a.reference.toString();
    }

    for (const a of this.state.down) {
      numberGrid[a.pos.i][a.pos.j].value = a.reference.toString();
    }
    return numberGrid;
  }
  private fill() {
    void 0;
  }
  private parseValues(text: string): GridElement[][] {
    const charArray = text.trim().split("\n").map(l => l.trim().split(""));
    const size = charArray.length;
    const newValues = newGridValues(size, size);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const char = charArray[i][j];
        if (char === ".") {
          newValues[i][j].enabled = false;
        } else {
          newValues[i][j].value = char !== "?" ? char : "";
        }
      }
    }
    return newValues;
  }
  private parseIntoState(text: string): AppState {
    let sections = text.split(/\<(.*?)\>/);
    if (!sections[0]) {
      sections = sections.slice(1);
    }
    const map: {[key: string]: string} = {};
    for (let i = 0; i < sections.length; i += 2) {
      const name = sections[i];
      const data = sections[i + 1];
      map[name] = data;
    }
    const capturedSize = (map.SIZE || "15x15").match(/(\d+)x\d+/);
    const size = capturedSize ? +capturedSize[0] : 15;
    const values = this.parseValues(map.GRID);

    const across = this.generateAcross(values);
    const down = this.generateDown(across, values);
    map.ACROSS.trim().split("\n").map(s => s.trim()).forEach((s, i) => across[i].text = s);
    map.DOWN.trim().split("\n").map(s => s.trim()).forEach((s, i) => down[i].text = s);
    return {
      title: map.TITLE || "Untitled",
      size,
      symmetry: true,
      values,
      across,
      down
    };
  }
  private load(evt: React.ChangeEvent<HTMLInputElement>) {
    const input = evt.target;
    if (!input.files) { return; };

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      const state = this.parseIntoState(text);
      this.setState(state);
    };
    reader.readAsText(input.files[0]);
  }
  private export() {
    const tab = "\t";
    const text = `<ACROSS PUZZLE>
<TITLE>
${tab}${this.state.title || "Untitled"}
<AUTHOR>
${tab}Author
<COPYRIGHT>
${tab}Author
<SIZE>
${tab}${this.state.size}x${this.state.size}
<GRID>
${this.state.values.map(r => `${tab}${r.map(e => e.enabled ? (e.value || "?") : ".").join("")}`).join("\n")}
<ACROSS>
${this.state.across.map(a => `${tab}${a.text || "No hint!"}`).join("\n")}
<DOWN>
${this.state.down.map(d => `${tab}${d.text || "No hint!"}`).join("\n")}`;
    const filename = `${this.state.title}.puz`;
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  private generateAcross(values: GridElement[][]) {
    const self = this;
    const words: WordRef[] = [];
    let buf = "";
    let inWordState = false;
    let bufStart: {i: number, j: number} = {i: 0, j: 0};
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values[i].length; j++) {
        const val = values[i][j];
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
        text: (self.state.across[words.length + 1] || {text: ""}).text
      });
      buf = "";
    }
  }
  private generateDown(across: WordRef[], values: GridElement[][]): WordRef[] {
    const words: WordRef[] = [];
    let prevIndex = across.length + 1;
    let buf = "";
    let inWordState = false;
    let bufStart: {i: number, j: number} = {i: 0, j: 0};
    for (let j = 0; j < values[0].length; j++) {
      for (let i = 0; i < values.length; i++) {
        const val = values[i][j];
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
        words[i].text = (this.state.down[i] || {text: ""}).text;
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
