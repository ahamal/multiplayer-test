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

    this.frame = {
      actionSets: {},
      players: {
        p1: { x: 30, y: 30, r: 90, color: 'green' },
        p2: { x: 370, y: 370, r: 360, color: 'cyan' }
      },
    };

    this.updateRate = 30;
    this.sendRate = 100;

    setInterval(this.update, this.updateRate);
    setInterval(this.send, this.sendRate);
  }

  render() {
    return (
      <div className="server">
        <div>Server</div>
        <Scene frame={this.frame} />
      </div>
    )
  }

  update = () => {
    var actionSets = this.actionsBuffer.splice(0, this.actionsBuffer.length);

    var frame = this.engine.update({
      frame: this.frame,
      actionSets: actionSets
    });

    this.frame = frame;
    this.forceUpdate();
  }

  send = () => {
    _.each(this.subscriptions, (fn, id) => {
      fn(this.frame);
    });
  }

  onReceive = (id, data) => {
    data.clientId = id;
    this.actionsBuffer.push(data);
  }

  getFrame = (id, fn) => {
    fn(this.frame);
  }

  subscribe = (id, fn) => {
    this.subscriptions[id] = fn;
  }
}

export default Server;