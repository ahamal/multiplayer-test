import Engine from "./Engine";
import _ from 'lodash';

class EngineX {
  constructor({ interpolationDelay, updateRate, id }) {
    this.id = id;
    this.interpolationDelay = interpolationDelay;
    this.updateRate = updateRate;

    this.frameBuffer = [0, 0, 0, 0, 0];
    this.actionSetBuffer = [];
    this.engine = new Engine();
    this.errorSmoothing = 0.3;

    this.interpolationFields = [
      'players.p1.x',
      'players.p1.y',
      'players.p1.r',
      'players.p2.x',
      'players.p2.y',
      'players.p3.x',
      'players.p3.y',
    ];

    this.predictionFields = [
      `players.${id}.x`,
      `players.${id}.y`,
      `players.${id}.r`
    ];

    this.updateInterval = setInterval(this.update, this.updateRate);

    this.trails = [];
  }

  onServerFrame = (frame) => {
    this.definitiveFrame = frame;
    this.frameBuffer.unshift(frame);
    this.frameBuffer.pop();

    if (!this.predictionFrame)
      this.predictionFrame = _.cloneDeep(this.definitiveFrame);
    
    this.verifyPrediction();
  }

  getDisplayFrame = () => {
    return this.combine(
      this.getInterpolated(),
      this.getPredicted()
    )
  }

  getInterpolated = () => {
    var buffer = this.frameBuffer;
    var renderAt = new Date() - this.interpolationDelay;

    var i = _.findIndex(buffer, b => renderAt > b.receiveTime, 1)
    if (i === -1)
      return;

    var s1 = buffer[i];
    var s2 = buffer[i - 1];
    var fraction = (renderAt - s1.receiveTime) / (s2.receiveTime - s1.receiveTime);
    return this.interpolate(s1, s2, fraction);
  }

  interpolate(f1, f2, fraction) {
    var result = _.cloneDeep(f1);
    this.interpolationFields.forEach(path => {
      var v1 = _.get(f1, path);
      var v2 = _.get(f2, path);
      if (!v1 || !v2) return;
      _.set(result, path, (v1 + (v2 - v1) * fraction))
    })
    return result;
  }

  combine(interpolated, predicted) {
    if (!interpolated)
      return;

    if (!predicted)
      return interpolated;
    
    var frame = interpolated;
    this.predictionFields.forEach(field => {
      _.set(frame, field, _.cloneDeep(_.get(predicted, field)));
    });
    return frame;
  }


  onActionSet(actionSet) {
    this.actionSetBuffer.push(actionSet);
  }

  getPredicted() {
    return this.predictionFrame;
  }


  update = () => {
    if (!this.predictionFrame)
      return;
    
    var actionSets = this.actionSetBuffer.splice(0, this.actionSetBuffer.length);

    this.predictionFrame = this.engine.update({
      frame: this.predictionFrame,
      actionSets: actionSets
    });
    
    this.logTrails();
  }

  logTrails() {
    this.trails.push({
      x: _.get(this.predictionFrame, `players.${this.id}.x`),
      y: _.get(this.predictionFrame, `players.${this.id}.y`),
      actionSetId: _.get(this.predictionFrame, `actionSets.${this.id}`),
      timeStamp: (new Date()).getTime()
    });
  }

  verifyPrediction() {
    var
      frame = this.predictionFrame,
      trails = this.trails;

    this.definitive = {
      x: _.get(this.definitiveFrame, `players.${this.id}.x`),
      y: _.get(this.definitiveFrame, `players.${this.id}.y`),
      actionSetId: _.get(this.definitiveFrame, `actionSets.${this.id}`)
    }
    
    var chop = _.findLastIndex(trails, t => t.actionSetId === this.definitive.actionSetId);
    trails.splice(0, chop);


    var trail = trails[0];
    if (!trail) return;
    var
      eX = (this.definitive.x - trail.x) * this.errorSmoothing,
      eY = (this.definitive.y - trail.y) * this.errorSmoothing;
    
    _.each(trails, t => {
      t.x += eX;
      t.y += eY;
    })

    _.set(frame, `players.${this.id}.x`, _.get(frame, `players.${this.id}.x`) + eX);
    _.set(frame, `players.${this.id}.y`, _.get(frame, `players.${this.id}.y`) + eY);
  }
}

export default EngineX