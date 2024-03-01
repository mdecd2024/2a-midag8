/*=====================================================================
  Filename: Cango3DAnimation-2v00.js
  Rev 2
  By: A.R.Collins
  Description:  This file augments the core Cango3D object with
                animation methods
  License: Released into the public domain
  latest version at
  <http://www/arc.id.au/>

  Date    Description                                             |By
  --------------------------------------------------------------------
  01Mar20 First beta based on CangoAnimation-7v00                  ARC
  04Mar20 Released as Cango3DAnimation-1v00                        ARC
  11Apr21 Dropped initFn from animation arguments
          Released as Cango3DAnimation-2v00                        ARC
 =====================================================================*/

var Timeline, Tweener;

Cango3D = (function(CangoCore)  // Cango must be declared a global before this file is loaded
{
  "use strict";

  Tweener = class 
  {
    constructor(delay, duration, loopStr)  // interpolates between values held in an array
    {
      this.delay = delay || 0;
      this.dur = duration || 5000;
      this.reStartOfs = 0;
      this.loop = false;
      this.loopAll = false;

      let loopParm = "noloop";

      if (typeof loopStr === 'string')
      {
        loopParm = loopStr.toLowerCase();
      }
      if (loopParm === 'loop')
      {
        this.loop = true;
      }
      else if (loopParm === 'loopall')
      {
        this.loopAll = true;
      }
    }

    getVal(time, vals, keyTimes)
    { 
      // 'vals' is an array of key frame values (or a static number)
      let slabDur,
          slab, 
          frac,
					localTime;

      if (time === 0)       // re-starting after a stop, otherwise this can increase forever (looping is handled here)
      {
        this.reStartOfs = 0;     // reset this to prevent negative times
      }
      localTime = time - this.reStartOfs;       // handles local looping
      if ((localTime > this.dur+this.delay) && (this.dur > 0) && (this.loop || this.loopAll))
      {
        this.reStartOfs = this.loop? time - this.delay : time;      // we will correct external time to re-start
        localTime = 0;          // force re-start at frame 0 now too
      }
      let t = 0;    // t is the actual local time value used for interpolating
      if (localTime > this.delay)    // repeat initial frame (t=0) if there is a delay to start
      {
        t = localTime - this.delay;   // localTime is contrained to 0 < localTime < this.dur
      }

      if (!Array.isArray(vals))    // not an array, just a static value, return it every time
      {
        return vals;
      }
      if (!vals.length)
      {
        return 0;
      }
      if (vals.length === 1)
      {
        return vals[0];
      }
      // we have at least 2 element array of values
      if (t === 0)
      {
        return vals[0];
      }
      if (t >= this.dur)
      {
        return vals[vals.length-1];  // freeze at end value
      }
      const numSlabs = vals.length-1;
      if (!Array.isArray(keyTimes) || (vals.length !== keyTimes.length))
      {
        slabDur = this.dur/numSlabs;
        slab = Math.floor(t/slabDur);
        frac = (t - slab*slabDur)/slabDur;

        return vals[slab] + frac*(vals[slab+1] - vals[slab]);
      }

      // we have keyTimes to play work with copies of arrays
      const values = [].concat(vals);
      const times = [].concat(keyTimes);
      // make sure times start with 0
      if (times[0] !== 0)
      {
        values.unshift(values[0]);
        times.unshift(0);
      }
      // make sure times end with 100
      if (times[times.length-1] !== 100)
      {
        values.push(values[values.length-1]);
        times.push(100);
      }
      let tFrac = t/this.dur;
      let i = 0;
      while ((i < times.length-1) && (times[i+1]/100 < tFrac))
      {
        i++;
      }
      slabDur = (times[i+1]-times[i])/100;
      frac = (tFrac - times[i]/100)/slabDur;    // convert percentage time to fraction

      return values[i] + frac*(values[i+1] - values[i]);
    }
  }

  class AnimObj
  { 
    constructor(id, gc, drawFn, pathFn, options)
    {
      this.id = id;
      this.gc = gc;        // the Cango context to do the drawing
      this.drawFn = drawFn;
      this.pathFn = pathFn;
      this.options = options || {};
      this.currState = {time:0};  // consider as read-only
      this.nextState = {time:0};  // properties can be added to this (becomes the currState after frame is drawn)
      this.gc.ctx.save();
      if (typeof pathFn === "function")
      {
        pathFn.call(this, 0, this.options);
      }
      // draw the object as setup by pathFn with t=0
      if (typeof this.drawFn === "function")
      {
        this.drawFn.call(this, this.options);   // call user custom function
      }
      else
      {
        console.log("invalid animation draw function");
      }
      // now it has been drawn save the currState values (nextState values are generated by pathFn)
      for (let prop in this.nextState)   // if pathFn creates new properties, make currState match
      {
        if (this.nextState.hasOwnProperty(prop))
        {
          this.currState[prop] = this.nextState[prop];
        }
      }
    }
  }

  // this is the actual animator that draws the frame
  function drawFrame(timeline)
  {
    const time = Date.now();    // use this as a time stamp, browser don't all pass the same time code
		let localTime,
				temp,
				prevAt = null,
				clearIt = false;

		if (timeline.prevAnimMode === timeline.modes.STOPPED)
		{
			timeline.startTime = time - timeline.startOfs;   // forces localTime = 0 to start from beginning
		}
		localTime = time - timeline.startTime;
		
		// step through all the animation tasks
		timeline.animTasks.forEach((at)=>{
			if (at.gc.cId !== prevAt)
			{
				// check for new layer, only clear a layer once, there maybe several Cango contexts on each canvas
				clearIt = true;
				prevAt = at.gc.cId;
			}
			at.gc.ctx.save();
			// if re-starting after a stopAnimation reset the currState.time so pathFn doesn't get negative time between frames
			if (timeline.prevAnimMode === timeline.modes.STOPPED)
			{
				at.currState.time = 0;    // avoid -ve dT (=localTime-currState.time) in pathFn
			}
      if (clearIt && !at.options.manualClear)
      {
        at.gc.clearCanvas();
      }
			if (typeof(at.pathFn) === 'function')  // static objects may have null or undefined
			{
				at.pathFn.call(at, localTime, at.options);
			}
      if (typeof at.drawFn === "function")
      {
          at.drawFn.call(at, at.options);
      }
			clearIt = false;
			at.gc.ctx.restore(); // if pathFn changes any ctx properties restore to pre pathFn state
			// now swap the currState and nextState vectors (pathFn may use currState to gen nextState)
			temp = at.currState;
			at.currState = at.nextState; // save current state vector, pathFn will use it
			at.nextState = temp;
			// save the draw time for pathFn
			at.currState.time = localTime;  // save the local time along the timeline for use by pathFn
		});

		timeline.currTime = localTime;      // timestamp of what is currently on screen
 	}
	
	//===============================================================================

  Timeline = class 
  {
    constructor()
    {
      this.animTasks = [];              // each layer can push an AnimObj object in here
      this.timer = null;                // need to save the RAF id for cancelling
      this.modes = {PAUSED:1, STOPPED:2, PLAYING:3, STEPPING:4};     // animation modes
      this.animMode = this.modes.STOPPED;
      this.prevAnimMode = this.modes.STOPPED;
      this.startTime = 0;               // animation start time (relative to 1970)
      this.startOfs = 0;                // used if play calls with non-zero start time
      this.currTime = 0;                // timestamp of frame on screen
      this.stepTime = 50;               // animation step time interval (in msec)
      this.frameRate = undefined;       // if undefined free run using RAF utility
      this.interval = 0;                // recalculated from frameRate each playAnimation call
    }

    stopAnimation()
    {
      clearTimeout(this.timer);                  // if frameRate set kill timeout
      window.cancelAnimationFrame(this.timer);   // if no frameRate kill RAF 
      this.prevAnimMode = this.animMode;
      this.animMode = this.modes.STOPPED;
      // reset the currTime so play and step know to start again
      this.currTime = 0;
      this.startOfs = 0;
    }

    pauseAnimation()
    {
      clearTimeout(this.timer);                  // if frameRate set kill timeout
      window.cancelAnimationFrame(this.timer);   // if no frameRate kill RAF 
      this.prevAnimMode = this.animMode;
      this.animMode = this.modes.PAUSED;
    }

    stepAnimation()
    {
      // this is the actual animator that draws the frame
      const drawIt = ()=>{
        drawFrame(this);
        this.prevAnimMode = this.modes.PAUSED;
        this.animMode = this.modes.PAUSED;
      }

      // equivalent to play for one frame and pause
      if (this.animMode === this.modes.PLAYING)
      {
        return;
      }
      if (this.animMode === this.modes.PAUSED)
      {
        this.startTime = Date.now() - this.currTime;  // move time as if currFrame just drawn
      }
      this.prevAnimMode = this.animMode;
      this.animMode = this.modes.STEPPING;

      setTimeout(drawIt, this.stepTime);
    }

    redrawAnimation()
    {
      // equivalent to play for one frame and pause
      if (this.animMode === this.modes.PLAYING)
      {
        return;
      }
      this.startTime = Date.now() - this.currTime;  // move time as if currFrame just drawn

      drawFrame(this);
    }

    playAnimation(startOfs, stopOfs)
    {
      let timeDiff = 0;
      // this is the actual animator that draws each frame
      const drawIt = ()=>{
        drawFrame(this);
        this.prevAnimMode = this.modes.PLAYING;
        if (stopOfs && this.currTime >= stopOfs)
        {
          this.stopAnimation();     // go back to start of time line
        }
        else
        {
          if (this.frameRate)
          {
            this.interval = 1000/this.frameRate;  // msec
            this.currTime += this.interval;
            timeDiff = (Date.now() - this.startTime) - this.currTime;
            this.timer = setTimeout(drawIt, this.interval - timeDiff);
          }
          else
          {
            this.timer = window.requestAnimationFrame(drawIt);   // go forever
          }
        }
      }

      this.startOfs = startOfs || 0;
      if (this.animMode === this.modes.PLAYING)
      {
        return;
      }
      if (this.animMode === this.modes.PAUSED)
      {
        this.startTime = Date.now() - this.currTime;  // move time as if currFrame just drawn
      }
      this.prevAnimMode = this.animMode;
      this.animMode = this.modes.PLAYING;

      this.timer = window.requestAnimationFrame(drawIt);
    }
  };
	
	//===============================================================================

  CangoCore.prototype.getUnique = function()
  {
    this.cnvs.unique += 1; 
    return this.cnvs.unique;
  };

  CangoCore.prototype.animation = function(draw, path, options)
  {
    const animId = this.cId+"_"+this.getUnique();
    const animObj = new AnimObj(animId, this, draw, path, options);

    // push this into the Cango animations array
    this.stopAnimation();   // make sure we are not still running an old animation
    this.cnvs.timeline.animTasks.push(animObj);

    return animObj.id;   // so the animation just created can be deleted if required
  };

  CangoCore.prototype.pauseAnimation = function()
  {
    this.cnvs.timeline.pauseAnimation();
  };

  CangoCore.prototype.playAnimation = function(startTime, stopTime)
  {
    this.cnvs.timeline.playAnimation(startTime, stopTime);
  };

  CangoCore.prototype.stopAnimation = function()
  {
    this.cnvs.timeline.stopAnimation();
  };

  CangoCore.prototype.stepAnimation = function()
  {
    this.cnvs.timeline.stepAnimation();
  };

  CangoCore.prototype.redrawAnimation = function()
  {
    this.cnvs.timeline.redrawAnimation();
  };

  CangoCore.prototype.deleteAnimation = function(animId)
  {
    this.pauseAnimation();   // pause all animations
    this.cnvs.timeline.animTasks.forEach((task, idx)=>{
      if (task.id === animId)
      {
        this.cnvs.timeline.animTasks.splice(idx, 1);       // delete the animation object
        return;
      }
    });
  };

  CangoCore.prototype.deleteAllAnimations = function()
  {
    this.stopAnimation();
    this.cnvs.timeline.animTasks = [];
  };


  return CangoCore;    // return the augmented Cango object, over-writing the existing

}(Cango3D));     // Take the existing Cango object and add animation methods

