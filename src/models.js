import React from 'react'
import './models.css'

class PlayerModel extends React.Component {
  render() {
    var v = this.props.value;
    return (
      <div
        className="player-model"
        style={{
          top: v.y,
          left: v.x,
          background: v.color,
          transform: `rotate(${v.r}deg)`
        }}>
        <div style={{ position: 'relative' }}>
          <div
            className="gun"
            style={{
              background: v.color,
            }}>
          </div>
        </div>
      </div>
    )
  }
}

export { PlayerModel }