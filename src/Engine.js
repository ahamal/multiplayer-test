import _ from 'lodash'


var findAngle = (x1, y1, x2, y2) => {
  return (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI - 90) % 360;
}


class Engine {
  constructor() {
    this.clients = ['p1', 'p2', 'p3']

    this.p = {
      p1: {},
      p2: {},
      p3: {}
    }
    this.mouse = {}
  }

  update({ gameState, actions, interval }) {
    gameState = _.cloneDeep(gameState);

    _.each(actions, ca => {
      var pc = this.p[ca.clientId]
      pc.mouseX = ca.mouseX;
      pc.mouseY = ca.mouseY;

      _.each(ca.actions, a => {
        if (a.type === 'keyDown') {
          pc[a.key] = true;
        } else if (a.type === 'keyUp') {
          pc[a.key] = false;
        }
      });
    });

    _.each(this.p, (pc, cId) => {
      var player = gameState.players[cId];

      var dx = pc.left ? -1 : pc.right ? 1 : 0;
      var dy = pc.up ? -1 : pc.down ? 1 : 0;
      var s = (dx !== 0 && dy !== 0 ? 0.707 : 1) * 2;
      player.x += dx * s;
      player.y += dy * s;

      player.r = findAngle(player.x, player.y, pc.mouseX, pc.mouseY)
    })

    gameState.timeStamp = new Date();
    gameState.frame = gameState.frame++;
    return gameState;
  }

  static paths = [
    'players.p1.x',
    'players.p1.y',
    'players.p1.r',
    'players.p2.x',
    'players.p2.y',
    'players.p3.x',
    'players.p3.y',
  ]
  static interpolated(state1, state2, fraction) {
    var result = _.cloneDeep(state1);
    Engine.paths.forEach( path => {
      var v1 = _.get(state1, path);
      var v2 = _.get(state2, path);
      if (!v1 || !v2) return;
      _.set(result, path, (v1 + (v2 - v1) * fraction))
    })
    return result;
  }
}

export default Engine;