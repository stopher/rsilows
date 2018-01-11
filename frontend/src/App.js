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
          <h1 className="App-title">{this.state.data.length} lows</h1>
        </header>
       
        <ul>
        {
          this.state.data.map((x) => {
            return (<li className="rsiObj"><span className='ticker'>{x.ticker}</span><span className='rsival'>{x.rsi}</span></li>);
          })
        }
        </ul>

        
      </div>
    );
  }
}

export default App;
