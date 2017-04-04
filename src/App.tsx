import * as React from "react";
import "./App.css";
import * as solved from "solved";

const logo = require("./logo.svg");

class App extends React.Component<null, null> {
  render() {
    return (
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
      </div>
    );
  }
}

export default App;
