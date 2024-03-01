/*===========================================================================
  Filename: CangoAnimation-10v05.js
  Rev 10
  By: A.R.Collins
  Description: This file augments the core Cango object with
               animation methods

  Copyright 2014-2020 A.R.Collins
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
  For more detail about the GNU General Public License see
  <https://www.gnu.org/licenses/>.
    
  Giving credit to A.R.Collins <http://www.arc.id.au> would be appreciated.
  Report bugs to tony at arc.id.au.

  Date    Description                                             |By
  --------------------------------------------------------------------------
  11May14 First release                                                  ARC
  21Jul14 Released as Version 2                                          ARC
  01Dec15 Released as Version 3                                          ARC
  02Feb16 Released as Version 4                                          ARC
  30Mar17 Released as Version 5                                          ARC
  09Jun17 Released as Version 6                                          ARC
  20Feb20 Released as Version 7                                          ARC
  08Mar20 Track requires SVGsegs as argument                             ARC
  06Jul20 bugfix: getPosAry didn't handle "noloop" option                ARC
          Added drawTextOnTrack method                                   ARC
  07Jul20 Use Track class from Cango
          Rename TrackTweener to PathTweener                             ARC
  10Jul20 Released as Version 8                                          ARC
  09Aug20 If frameRate set, call pathFn at least at frameRate            ARC
  27Nov20 bugfix: bad range check on dists values in getDist             ARC
  02Apr21 Drop the initFn use pathFn and time=0                          ARC
  04Apr21 Released as Version 9                                          ARC
  13Jun21 Added setAnimationProperty (from Cango.setPropertyDefault)     ARC
  26Jun21 Changed PathTweener to use SVGsegs array not Path object       ARC
  02Jul21 Released as Version 10                                         ARC
  05Jul21 Use SVGsegs path not Track (made private in SVGpathUtils-6v01) ARC
  08Jul21 Use getPointAtLength instead of distToPos                      ARC
 ===========================================================================*/

var Timeline, Tweener, PathTweener;

(function()  // Cango must be declared a global before this file is loaded
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

      if (typeof loopStr === 'string')
      {
        let loopParm = loopStr.toLowerCase();
        this.loop = (loopParm === 'loop');
        this.loopAll = (loopParm === 'loopall');
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

  PathTweener = class   
  {
    constructor(pth, delay, duration, loopStr)  // interpolates between values held in an array
    {
      if (!pth instanceof SVGsegs)
      {
        console.warn("Type Error: PathTweener argument 1 not an SVGsegs object");
        return;
      }
      this.track = pth;
      this.delay = delay || 0;
      this.dur = duration || 5000;
      this.reStartOfs = 0;
      this.loop = false;
      this.loopAll = false;

      if (typeof loopStr === 'string')
      {
        let loopParm = loopStr.toLowerCase();
        this.loop = (loopParm === 'loop');
        this.loopAll = (loopParm === 'loopall');
      }
    }

   /*========================================================
    * 'getDist' takes the 'time' the current time along the 
    * timeline and uses the keyTime values and corresponding 
    * dists values to calculate the % distance along the track 
    * this time corresponds to.
    * returns % distance along total track
    *-------------------------------------------------------*/
    getDist(time, dists=[], keyTimes)
    {
      if (time === 0)       // re-starting after a stop, otherwise this can increase forever (looping is handled here)
      {
        this.reStartOfs = 0;     // reset this to prevent negative times
      }
      let localTime = time - this.reStartOfs;       // handles local looping
      if ((localTime > this.dur+this.delay) && (this.dur > 0) && (this.loop || this.loopAll))
      {
        this.reStartOfs = this.loop? time - this.delay : time;      // we will correct external time to re-start
        localTime = 0;          // force re-start at frame 0 now too
      }
      let t = 0;    // t is the actual local time value used for interpolating
      if (localTime > this.delay)    // repeat initial frame (t=0) if there is a delay to start
      {
        t = localTime - this.delay;   // localTime is constrained to 0 < localTime < this.dur
      }

      if (typeof(dists) == "number")    // not an array, just a static value, return it every time
      {
        if (0<=dists && dists<=100)
        {
          return dists;
        }
        console.warn("Range Error: TrackTweener.getDist argument 2 (0 .. 100)");
        return 0;
      }
      if (!Array.isArray(dists))
      {
        console.warn("Type Error: TrackTweener.getDist argument 2");
        return 0;
      }
      if (!dists.length)
      {
        return 0;
      }
      if (dists.length === 1)
      {
        return dists[0];
      }
      // check all distances are percent of total
      for (let i=0; i<dists.length; i++)
      {
        if (dists[i]<0 || dists[i]>100)
        {
          console.warn("Range Error: TrackTweener.getDist argument 2 (0 .. 100)");
          return 0;
        }
      }
      // we have at least 2 element array of dists
      if (t === 0)
      {
        return dists[0];
      }
      if (t >= this.dur)
      {
        return dists[dists.length-1];  // freeze at end value
      }
      const numSlabs = dists.length-1;
      if (!Array.isArray(keyTimes) || (dists.length !== keyTimes.length))
      {
        let slabDur = this.dur/numSlabs;
        let slab = Math.floor(t/slabDur);
        let frac = (t - slab*slabDur)/slabDur;

        return dists[slab] + frac*(dists[slab+1] - dists[slab]);
      }

      // we have keyTimes to play work with copies of arrays
      const distances = [].concat(dists);
      const times = [].concat(keyTimes);
      // make sure times start with 0
      if (times[0] !== 0)
      {
        distances.unshift(distances[0]);
        times.unshift(0);
      }
      // make sure times end with 100
      if (times[times.length-1] !== 100)
      {
        distances.push(distances[distances.length-1]);
        times.push(100);
      }
      let tFrac = t/this.dur;
      let i = 0;
      while ((i < times.length-1) && (times[i+1]/100 < tFrac))
      {
        i++;
      }
      let slabDur = (times[i+1]-times[i])/100;
      let frac = (tFrac - times[i]/100)/slabDur;    // convert percentage time to fraction

      return distances[i] + frac*(distances[i+1] - distances[i]);
    }

   /*==============================================================
    * getPos calculates a position along a Track at some specified 
    * time along an animation timeline.
    * 'time' is the specified time (along a Timeline) 
    * 'dists' is an array of distances along track (% total track length), 
    * 'keyTimes' is an array of times to be at each 'dists' val 
    * getPos returns an object {x:, y:, gradient: } representing 
    * world coords of the track position and the track gradient 
    * at that point.
    *-------------------------------------------------------------*/
    getPos(time, dists, keyTimes)
    {
      const tLen = this.track.getTotalLength();
      // TrackTweener.getDist returns % distance travelled at time 'time' along total track
      const currDist = tLen*this.getDist(time, dists, keyTimes)/100;  // convert to world coord distance

      return this.track.getPointAtLength(currDist);   // convert to a world coord location and return
    }

  };

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

      if (typeof this.pathFn === "function")
      {
        this.pathFn.call(this, 0, this.options);   // put obj at 0 time position
      }
      // draw the object as setup by initFn (pathFn not called yet)
      if (typeof this.drawFn === "function")
      {
        this.drawFn.call(this, this.options);   // call user custom function
      }
      else
      {
        console.log("invalid animation draw function");
      }
      this.gc.ctx.restore();  // if initFn makes changes to ctx restore to pre-initFn state
      // now it has been drawn save the currState values (nextState values are generated by pathFn)
      for (let prop in this.nextState)   // if initFn creates new properties, make currState match
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
        if (timeline.frameRate)
        {
          let frameTime = at.currState.time + timeline.interval;  // minimum time until drawFn call
          while (frameTime+30 < localTime)   // give a 30 msec slack to avoid glitches
          {
            at.pathFn.call(at, frameTime, at.options);
            // now swap the currState and nextState vectors (pathFn may use currState to gen nextState)
            temp = at.currState;
            at.currState = at.nextState; // save current state vector, for next pathFn call 
            at.nextState = temp;
            at.currState.time = frameTime;  // save the time along the timeline where these calc done
            frameTime = at.currState.time + timeline.interval;
          }
        }
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
			at.currState.time = localTime;  // save the localTime along the timeline for use by pathFn
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
      this.frameRate = undefined;       // if undefined free run using RAF utility (set by Cango.setPropertyDefault)
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
          }
          this.timer = window.requestAnimationFrame(drawIt);   // go forever
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

  Cango.prototype.animation = function(draw, path, options)
  {
    const animId = this.cId+"_"+this.getUnique();
    const animObj = new AnimObj(animId, this, draw, path, options);

    // push this into the Cango animations array
    this.stopAnimation();   // make sure we are not still running an old animation
    this.bkgCanvas.timeline.animTasks.push(animObj);

    return animObj.id;   // so the animation just created can be deleted if required
  };

  Cango.prototype.pauseAnimation = function()
  {
    this.bkgCanvas.timeline.pauseAnimation();
  };

  Cango.prototype.playAnimation = function(startTime, stopTime)
  {
    this.bkgCanvas.timeline.playAnimation(startTime, stopTime);
  };

  Cango.prototype.stopAnimation = function()
  {
    this.bkgCanvas.timeline.stopAnimation();
  };

  Cango.prototype.stepAnimation = function()
  {
    this.bkgCanvas.timeline.stepAnimation();
  };

  Cango.prototype.redrawAnimation = function()
  {
    this.bkgCanvas.timeline.redrawAnimation();
  };

  Cango.prototype.deleteAnimation = function(animId)
  {
    this.pauseAnimation();   // pause all animations
    this.bkgCanvas.timeline.animTasks.forEach((task, idx)=>{
      if (task.id === animId)
      {
        this.bkgCanvas.timeline.animTasks.splice(idx, 1);       // delete the animation object
        return;
      }
    });
  };

  Cango.prototype.deleteAllAnimations = function()
  {
    this.stopAnimation();
    this.bkgCanvas.timeline.animTasks = [];
  };

  Cango.prototype.setAnimationProperty = function(propertyName, value)
  {
    if ((typeof propertyName !== "string")||(value === undefined)||(value === null))
    {
      return;
    }
    switch (propertyName.toLowerCase())
    {
      case "steptime":
        if ((value >= 15)&&(value <= 500))
        {
          this.bkgCanvas.timeline.stepTime = value;
        }
        break;
      case "minframerate":
      case "framerate":
          if (value && value === "auto")
        {
          this.bkgCanvas.timeline.frameRate = undefined;
        }
        else if (isNaN(value) || value > 30 || value < 0.5)  // 1 frame per 2 sec to 30 frames per sec
        {
          console.warn("Range Error: setPropertyDefault frameRate (0.5 .. 30)");
          return;
        }
        this.bkgCanvas.timeline.frameRate = value;
        break;
      default:
        break;
    }
  };

}());
