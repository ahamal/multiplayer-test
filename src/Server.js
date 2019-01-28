import React from 'react'
import _ from 'lodash'
import Scene from './Scene'
import Engine from './Engine';

import './Server.css';

class Server extends React.Component{
  constructor() {
    super();
    this.engine = new Engine();

    this.subscriptions = {};
    this.actionsBuffer = [];

    this.gameState = {
      players: {
        p1: { x: 10, y: 10, r: 90, color: 'green' },
        p2: { x: 390, y: 390, r: 360, color: 'cyan' },
        p3: { x: 10, y: 290, r: 180, color: 'tomato' },
      },
    };

    this.updateRate = 30;
    this.sendRate = 30;

    setInterval(this.update, this.updateRate);
    setInterval(this.send, this.sendRate);
  }

  render() {
    return (
      <div className="server">
        <div>Server</div>
        <Scene gameState={this.gameState} />
      </div>
    )
  }

  update = () => {
    var actions = this.actionsBuffer.splice(0, this.actionsBuffer.length);

    var gameState = this.engine.update({
      gameState: this.gameState,
      actions: actions,
      interval: this.updateRate
    });
    this.gameFrame += 1;

    this.gameState = gameState;
    this.forceUpdate();
  }

  send = () => {
    _.each(this.subscriptions, (fn, id) => {
      fn(this.gameState);
    });
  }

  onReceive = (id, data) => {
    data.clientId = id;
    this.actionsBuffer.push(data);
  }

  getGameState = (id, fn) => {
    fn(this.gameState);
  }

  subscribe = (id, fn) => {
    this.subscriptions[id] = fn;
  }
}

export default Server;