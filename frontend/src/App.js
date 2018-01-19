import React, { Component } from 'react';

import './App.css';



class App extends Component {
 
 constructor(props) {
    super(props);

    this.state = {
      data: []
    };
  }

  componentDidMount() {
    console.log("did mount");
    fetch('/api')      
      .then(response => response.json())
      .then(response => {
        this.setState({ data: response.data })
        console.log(this.state.data);
        })
      .catch(function(error) {
          console.log('There has been a problem with your fetch operation: ', error.message);
        });
  }

  render() {

    console.log("render");
    console.log(this.state);

    return (
      <div className="App">

       
        <ul>
        {
          this.state.data.map((x) => {
            const rsiFixed = x.rsi.toFixed(2);
            return (<li className="rsiObj"><span className='ticker'>{x.ticker}</span><span className='rsival'>{rsiFixed}</span></li>);
          })
        }
        </ul>

        <h1 className="App-title">{this.state.data.length} lows</h1>
      </div>
    );
  }
}

export default App;
