import React from 'react'
import _ from 'lodash';
import { PlayerModel } from './models'

import './Scene.css'

class Scene extends React.Component {
  render() {
    var s = this.props.frame;

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
        {this.props.debug && this.debugC() }
      </div>
    );
  }

  debugC() {
    var ex = this.props.ex;
    return (
      <div className="debugger">
        <div className="trails">
        {_.map(ex.trails, (t) => (
          <div
            className={'trail-dot' + (t.actionSetId === ex.definitive.actionSetId ? ' definitive' : '') }
            key={t.timeStamp}
            style={{ left: t.x + 'px', top: t.y + 'px' } } />
        ))}
        </div>
        { ex.definitive && (
          <div
            className="definitive-dot"
            style={{ left: ex.definitive.x + 'px', top: ex.definitive.y + 'px' } } />
        ) }
      </div>
    )
  }
}

export default Scene