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
          <h1 className="App-title">rsihunter</h1>
        </header>
        <p className="App-intro">
          Test
        </p>

        

        <h1>Test {this.state.more}</h1>

        <ul>

        {
          this.state.data && this.state.data.forEach((x) => {
            return (<li className="rsiObj"><span className='ticker'>{x.ticker}</span><span className='rsival'>{x.rsi}</span></li>);
          })
        }
        </ul>

        
      </div>
    );
  }
}

export default App;
