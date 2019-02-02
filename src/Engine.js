import _ from 'lodash'

var findAngle = (x1, y1, x2, y2) => {
  return (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI - 90) % 360;
}

class Engine {
  constructor() {
    this.clients = ['p1', 'p2']

    this.p = {
      p1: {},
      p2: {}
    }
    this.mouse = {}
  }

  update({ frame, actionSets }) {
    frame = _.cloneDeep(frame);

    _.each(actionSets, actionSet => {
      var pc = this.p[actionSet.clientId]
      pc.mouseX = actionSet.mouseX;
      pc.mouseY = actionSet.mouseY;

      _.each(actionSet.actions, a => {
        if (a.type === 'keyDown') {
          pc[a.key] = true;
        } else if (a.type === 'keyUp') {
          pc[a.key] = false;
        }
      });

      frame.actionSets[actionSet.clientId] = actionSet.id;
    });

    _.each(this.p, (pc, cId) => {
      var player = frame.players[cId];

      var dx = pc.left ? -1 : pc.right ? 1 : 0;
      var dy = pc.up ? -1 : pc.down ? 1 : 0;
      var s = (dx !== 0 && dy !== 0 ? 0.707 : 1) * 10;
      player.x += dx * s;
      player.y += dy * s;
      player.r = findAngle(player.x, player.y, pc.mouseX || 0, pc.mouseY || 0);
    })
    
    frame.timeStamp = new Date();
    return frame;
  }
}

export default Engine;