'use strict';
class FixedStepClock { constructor({stepMs=50,maxCatchUpSteps=4,onStep}={}) { if (!(stepMs>0)||!Number.isInteger(maxCatchUpSteps)||maxCatchUpSteps<1||typeof onStep!=='function') throw new TypeError('invalid clock configuration'); this.stepMs=stepMs; this.maxCatchUpSteps=maxCatchUpSteps; this.onStep=onStep; this.accumulator=0; this.tick=0; this.droppedMs=0; }
 advance(elapsedMs) { if (!Number.isFinite(elapsedMs)||elapsedMs<0) throw new RangeError('elapsedMs must be finite and non-negative'); this.accumulator+=elapsedMs; let steps=0; while(this.accumulator>=this.stepMs&&steps<this.maxCatchUpSteps){this.onStep(++this.tick,this.stepMs);this.accumulator-=this.stepMs;steps++;} if(this.accumulator>=this.stepMs){const keep=this.accumulator%this.stepMs;this.droppedMs+=this.accumulator-keep;this.accumulator=keep;} return {steps,tick:this.tick,alpha:this.accumulator/this.stepMs,droppedMs:this.droppedMs}; }
}
module.exports={FixedStepClock};
