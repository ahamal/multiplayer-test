import React from 'react';
import Scene from './Scene';
import EngineX from './EngineX';
import _ from 'lodash'

import './Client.css';


class Client extends React.Component {
  constructor(p) {
    super();
    this.id = p.id;
    this.lag = 200;
    this.sendRate = 100;
    this.frameRate = 30;

    this.controls = p.controls;
    this.actionsBuffer = [];
    this.actionIdCounter = 0;
    this.actionSetCounter = 0;

    this.interpolationDelay = 250;
    this.ex = new EngineX({
      interpolationDelay: this.interpolationDelay,
      updateRate: 30,
      id: this.id
    })
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
      this.onAction({
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
      this.onAction({
        type: 'keyUp',
        key: key,
        id: this.actionIdCounter++,
        timeStamp: new Date()
      });
  }

  onSceneMouse = (b) => {
    this.onAction({
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
    this.refreshInterval = setInterval(this.refresh, this.frameRate);
  }

  render() {
    return (
      <div className="client">
        <div>Client {this.id}</div>
        <Scene
          ref={ s => this.scene = s }
          frame={this.displayFrame}
          onMouseDown={_ => this.onSceneMouse(true)}
          onMouseUp={_ => this.onSceneMouse(false)}
          ex={this.ex}
          debug={true}
          />
      </div>
    )
  }

  onAction = (action) => {
    this.actionsBuffer.push(action);
  }

  send = () => {
    var actions = this.actionsBuffer.splice(0, this.actionsBuffer.length);
    var actionSet = {
      clientId: this.id,
      id: this.actionSetCounter++,
      actions: (actions.length > 0) && actions,
      mouseX: this.scene.mouseX,
      mouseY: this.scene.mouseY,
    }
    this.sendToServer(actionSet);
    this.ex.onActionSet(actionSet);
  }

  sendToServer = (actionSet) => {
    setTimeout(_ => this.server.onReceive(this.id, actionSet), this.lag);
  }

  onServerData = (data) => {
    setTimeout(_ => this.onReceive(data), this.lag)
  }

  onReceive = (frame) => {
    frame = _.cloneDeep(frame);
    frame.receiveTime = new Date();
    this.ex.onServerFrame(frame);
  }

  refresh = () => {
    this.displayFrame = this.ex.getDisplayFrame()
    this.forceUpdate();
  }
}

export default Client;