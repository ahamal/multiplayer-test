import React from 'react';
import Scene from './Scene';
import Engine from './Engine';
import _ from 'lodash'

import './Client.css';


class Client extends React.Component {
  constructor(p) {
    super();
    this.id = p.id;
    this.lag = 200;
    this.sendRate = 100;
    this.updateRate = 30;
    this.interpolationDelay = 100;

    this.controls = p.controls;
    this.actionsBuffer = [];
    this.actionIdCounter = 0;

    this.gsBuffer = [0, 0, 0, 0, 0];
  }

  componentDidMount() {
    this.pressedKeys = {}
    window.document.addEventListener('keydown', this.onKeyDown);
    window.document.addEventListener('keyup', this.onKeyUp);
  }

  onKeyDown = (e) => {
    if (this.pressedKeys[e.key]) return;
    this.pressedKeys[e.key] = true;
    var key = this.props.controls[e.key]
    if (key)
      this.actionsBuffer.push({
        type: 'keyDown',
        key: key,
        id: this.actionIdCounter++,
        timeStamp: new Date()
      });
  }

  onKeyUp = (e) => {
    this.pressedKeys[e.key] = false
    var key = this.props.controls[e.key]
    if (key)
      this.actionsBuffer.push({
        type: 'keyUp',
        key: key,
        id: this.actionIdCounter++,
        timeStamp: new Date()
      });
  }

  onSceneMouse = (b) => {
    this.actionsBuffer.push({
      type: 'mouseDown',
      bool: b,
      mouseX: this.scene.mouseX,
      mouseY: this.scene.mouseY,
      id: this.actionIdCounter++,
      timeStamp: new Date()
   });
  }

  connect(server) {
    this.server = server;
    server.subscribe(this.id, this.onServerData);

    this.sendInterval = setInterval(this.send, this.sendRate);
    this.updateInterval = setInterval(this.update, this.updateRate);
  }

  render() {
    return (
      <div className="client">
        <div>Client {this.id}</div>
        <Scene
          ref={ s => this.scene = s }
          gameState={this.displayState}
          onMouseDown={_ => this.onSceneMouse(true)}
          onMouseUp={_ => this.onSceneMouse(false)}
          />
      </div>
    )
  }

  send = () => {
    var actions = this.actionsBuffer.splice(0, this.actionsBuffer.length);
    this.sendToServer({
      actions: (actions.length > 0) && actions,
      mouseX: this.scene.mouseX,
      mouseY: this.scene.mouseY
    });
  }

  sendToServer = (data) => {
    setTimeout(_ => this.server.onReceive(this.id, data), this.lag);
  }

  onServerData = (data) => {
    setTimeout(_ => this.onReceive(data), this.lag)
  }

  onReceive = (data) => {
    data = _.cloneDeep(data);
    data.receiveTime = new Date();

    this.gsBuffer.unshift(data);
    this.gsBuffer.pop();
  }

  update = () => {
    this.displayState = this.interpolatedGameState() || this.gsBuffer[0];
    this.renderTime = new Date();
    this.forceUpdate();
  }

  interpolatedGameState = () => {
    var buffer = this.gsBuffer;
    var renderAt = new Date() - this.interpolationDelay;

    var i = _.findIndex(buffer, b => renderAt > b.receiveTime, 1)
    return (i > -1) && (
      Engine.interpolated(
        (buffer[i], buffer[i - 1]),
        (renderAt - buffer[i].receiveTime) / (buffer[i - 1].receiveTime - buffer[i].receiveTime)
      )
    )    
  }
}

export default Client;