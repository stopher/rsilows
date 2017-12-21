import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';



class App extends Component {
 
 constructor(props) {
    super(props);

    this.state = {
      data: [],
      more: 'horze'
    };
  }

  componentDidMount() {
    console.log("did mount");
    fetch('/api')      
      .then(response => response.json())
      .then(response => {
        this.setState({ data: response.data })
        console.log(this.state.data);
    });
  }

  render() {

    console.log("render");
    console.log(this.state);

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>

        <pre>

        <h1>Test {this.state.more}</h1>

        {
          this.state.data && this.state.data.map((x,y ) => {
            return (<div>{x}</div>);
          })
        }

        </pre>
      </div>
    );
  }
}

export default App;
