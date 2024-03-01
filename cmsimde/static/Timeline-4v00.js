/*==========================================================================
  Filename: Timeline-4v00.js
  By: A.R.Collins

  JavaScript animation library. Multiple objects are controlled by a master
  timeline. Each Animation object can have its own path and draw methods.

  Kindly give credit to Dr A R Collins <http://www.arc.id.au/>
  Report bugs to tony at arc.id.au

  Date   |Description                                                   |By
  --------------------------------------------------------------------------
  23Sep13 Version 2 using requestAnimationFrame                          ARC
  27Feb13 Ignore rAF callback parameter - not consistent in all browsers ARC
  13Mar13 Made anims and dur to being a properties not just local vars   ARC
  03May13 Added 'stepTime' property                                      ARC
  14Jun13 Tidy code to make JSLint happy                                 ARC
  15Jun13 Restrict globals                                               ARC
  14Nov15 Tidy, update JavaScript style, delete RAF shim                 ARC
  15Nov15 Use options object rather than arguments for optional parms
          bugfix: use correct 'this' in step                             ARC
  16Nov15 Add Timeline.redraw                                            ARC
  18Nov15 Give state objects a 'time' property and update it each frame  ARC
  22Nov15 Make currState clone of nextState after initFn called          ARC
  05Jun17 Allow options to the undefined                                 ARC
  27Jul17 Rename Animation to Animator avoiding clash with Mozilla-dev   ARC
  12Apr21 Refactor using ES5 features
          Dropped the initFn argument
          Released as Version 4                                          ARC
 ===========================================================================*/

"use strict";

class Timeline 
{
  constructor (animationObj, duration, looping)
  {
    this.loop = (looping == true),    // convert to boolean
    this.mode = "STOPPED",
    this.prevMode = "STOPPED",
    this.startTime = 0,    // system time when animation started
    this.currTime = 0,     // msecs along timeline when current frame drawn
    this.timer = null;
    this.stepTime = 50;   // msec time interval between single steps
    this.anims = animationObj;   // anims can be an array of animation objects or just one
    if (this.anims instanceof Array)
    {
      this.anims.forEach((an)=>{an.timeline = this;});  // save a reference to timeline
    }
    else
    {
      this.anims.timeline = this;
    }

    this.dur = -1;     // if 0 or negative value entered: go forever
    if (duration > 0)
    {
      this.dur = duration;
    }
    // draw the initial frame of the animation
    this.stepper();
  }

  stepper()
  {
    const time = Date.now();   // generate local time stamp, browsers pass different time types
    let localTime;

    if (this.prevMode == "STOPPED")
    {
      this.startTime = time;     // forces localTime = 0
    }
    localTime = time - this.startTime;    // millsecs along timeline
    if ((localTime > this.dur) && (this.dur > 0))
    {
      if (this.loop)
      {
        this.startTime = time;   // we will re-start
        localTime = 0;      // pass this to pathFn to re-initialize
      }
      else                  // end of the animation
      {
        this.stop();
        return;
      }
    }
    // now draw each animated object for the new frame
    if (this.anims instanceof Array)
    {
      this.anims.forEach((an)=>{an.nextFrame(localTime);});
    }
    else
    {
      this.anims.nextFrame(localTime);
    }
    // drawing done
    this.currTime = localTime;      // timestamp of what is currently on screen
    if (this.mode === "STEPPING")
    {
      this.prevMode = "PAUSED";
      this.mode = "PAUSED";
    }
    if (this.mode === "PLAYING")
    {
      this.prevMode = "PLAYING";
      this.timer = window.requestAnimationFrame(()=>{this.stepper()});
    }
  }

  play()
  {
    if (this.mode === "PLAYING")
    {
      return;
    }
    if (this.mode === "PAUSED")
    {
      this.startTime = Date.now() - this.currTime;  // move timeline as if currFrame just drawn
    }
    this.prevMode = this.mode;
    this.mode = "PLAYING";
    this.timer = window.requestAnimationFrame(()=>{this.stepper()});
  }

  step()
  {
    // equivalent to play for one frame and pause
    if (this.mode === "PLAYING")
    {
      return;
    }
    if (this.mode === "PAUSED")
    {
      this.startTime = Date.now() - this.currTime;  // move timeline as if currFrame just drawn
    }
    this.prevMode = this.mode;
    this.mode = "STEPPING";
    window.setTimeout(()=>{this.stepper()}, this.stepTime);
  }

  redraw()
  {
    // equivalent to play for one frame and pause
    if (this.mode === "PLAYING")
    {
      return;
    }
    this.startTime = Date.now() - this.currTime;  // move timeline as if currFrame just drawn
    stepper();
  }

  pause()
  {
    if (this.timer)
    {
      window.cancelAnimationFrame(this.timer);
    }
    this.prevMode = this.mode;
    this.mode = "PAUSED";
  }

  stop()
  {
    if (this.timer)
    {
      window.cancelAnimationFrame(this.timer);
    }
    this.prevMode = this.mode;
    this.mode = "STOPPED";
    // reset the currTime so play and step know to start again
    this.currTime = 0;
  }

}

class Animator 
{
  constructor(draw, path, options) // pass additional arguments in options object
  {
    this.timeline = null;           // Initialized by the parent Timeline constructor
    this.drawFn = draw;             // drawFn draws this.obj in this.nextSate
    this.pathFn = path;             // pathFn takes current time, calculates nextState vector
    this.options = options;
    this.currState = {time:0};      // current (as drawn) state vector
    this.nextState = {time:0};      // pathFn return next state vector here

    for (let i in this.nextState)   // if initFn creates new porperties make currState match
    {
      this.currState[i] = this.nextState[i];
    }
  }

  nextFrame(t)
  {
    this.pathFn(t, this.options);
    this.drawFn(this.obj, this.nextState, this.options); // pass the new state
    // swap state pointers
    const tmp = this.currState;
    this.currState = this.nextState; // save current state vector, pathFn will use it
    this.nextState = tmp;
    this.currState.time = t;     // save the frame draw time for use in next call to pathFn
  }
}
