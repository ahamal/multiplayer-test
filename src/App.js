import React from 'react';
import './App.css';
import Server from './Server';
import Client from './Client';


class App extends React.Component {
  render() {
    return (
      <div>
        <Client
          id="p1"
          controls={{
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
          }}
          ref={c => this.client1 = c} />
        
        <Server
          ref={s => this.server = s} />

        {/* <Client
          id="p2"
          controls={{
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right'
          }}
          ref={c => this.client2 = c} /> */}
      </div>
    );
  }

  componentDidMount() {
    this.client1.connect(this.server);
    // this.client2.connect(this.server);
  }

}


export default App;
