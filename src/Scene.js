import React from 'react'
import _ from 'lodash';
import { PlayerModel } from './models'

import './Scene.css'

class Scene extends React.Component {
  render() {
    var s = this.props.gameState;

    return (
      <div
        className="scene"
        ref={ el => this.el = el }
        onMouseMove={ e => {
          this.mouseX = e.pageX - this.el.offsetLeft;
          this.mouseY = e.pageY - this.el.offsetTop;
        } }
        onMouseUp={this.props.onMouseUp}
        onMouseDown={this.props.onMouseDown}>
        {s && _.map(s.players, (v, k) => <PlayerModel key={k} value={v} />)}
      </div>
    );
  }
}

export default Scene