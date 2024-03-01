/*==========================================================================
  Filename: Cango-24v03.js
  Rev: 24
  By: Dr A.R.Collins
  Description: A graphics library for the canvas element.

  Copyright 2012-2021 A.R.Collins
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

  Date   |Description                                                   |By
  --------------------------------------------------------------------------
  14Oct12 Rev 1.00 First release based on Cango0v43                      ARC
  29Nov12 Released as Cango2v00                                          ARC
  06May14 Released as Cango4v00                                          ARC
  14Jul14 Released as Cango-5v00                                         ARC
  09Feb15 Released as Cango-6v00                                         ARC
  20Mar15 Released as Cango-7v00                                         ARC
  21Dec15 Released as Cango-8v00                                         ARC
  28Mar17 Released as Cango-9v00                                         ARC
  10Jul17 Released as Cango-10v00                                        ARC
  22Jul17 Released as Cango-11v00                                        ARC
  15Aug17 Released as Cango-12v00                                        ARC
  02Mar18 Released as Cango-13v00                                        ARC
  12Aug19 Released as Cango-15v00 (no transform, no shapeDefs)           ARC 
  14Oct19 Sort obj.ofsTfmAry before making netTfm to preserve tfm order  ARC
  17Oct19 bugfix: Group enableDrag should be 'this' not childNode        ARC
  21Oct19 bugfix: Remove nonIsoScl correction from dwgOrg calculation    ARC
  23Oct19 bugfix: Several ClipMask options not being honoured            ARC
  11Nov19 Apply options in order of insertion (ok in ES 2015)
          Apply soft transforms in insertion order (delete REV tfm) 
          Added Group.setProperty method                                 ARC
  17Nov19 Convert to use ES2015 classes etc                              ARC
  18Nov19 Allow 'rot' as option equivalent to degs                       ARC
  19Nov19 Released as Cango-17v00                                        ARC
  02Jan20 bugfix: getUnique unique to context should be unique to canvas ARC
  18Jan20 Replace all commas in strings passed to SVGsegs constructor    ARC
  19Jan20 Added Track and TrackTweener classes                           ARC
  20Jan20 SVGsegs made private, shapeDefs now returns SVGsegs objects
          circle, square etd now become shapeDefs methods
          Added shapeDefs.svg method, equivalent to new SVGsegs
          Added shapeDefs.arc method                                     ARC
  20Feb20 Remove Animation methods to a separate extension               ARC
  16Mar20 Update with all changes to Ver 18 but not using Path2D         ARC
  01Feb20 Added warning if path Path2D descriptor has 0 length
          Animation option 'manualClear' required 'truthy' value         ARC
  03Feb20 bugfix: pathDefs.revWinding 'cmds' should be 'cmds.segs'
          bugfix: SVGsegs.joinPath clobbered the original                ARC
  07Mar20 Rename global function 'genSVGsegs' to 'segment'               ARC
  14Apr20 bugfix: ClipMask.fillColor should be fillCol                   ARC
  12May20 Added property lineJoin to Obj2D options                       ARC 
  07Jul20 Update to features of Cango-18v10 but not using Path2D
          Added drawTextOnPath                                           ARC
  09Jul20 Added SVGsegs.getPathLength method                             ARC
  10Jul20 Released as Cango-19v00                                        ARC
  11Jul20 Require TextOnPath to have a Path descriptor as arg not Path
          Support TextOnPath having all standard Text options
          Added sclX, sclY to transform options
          Added non iso scaling support to TextOnPath                    ARC
  12Jul20 Split drawTextOnPath off to CangoTextUtils                     ARC
  02Aug20 Use more ES6 features                                          ARC
  15Aug20 Refactor RadialGradient and LinearGradient                     ARC
  22Aug20 Added support for Sphere object                                ARC
  06Oct20 bugfix: Group & Obj netTfmAry not cleared after render
          Refactor apply transforms code                                 ARC
  08Oct20 Make dgwOrg transform a separate function, delete xfmFns       ARC
  17Oct20 Refactor netTfmAry creation and netTfm matrix                  ARC
  04Nov20 Switch from SVGMatrix to DOMMatrix for transforms
          Refactor clearCanvas and fillGridbox                           ARC
  07Nov20 Added gradient fill and stroke color support to Text objects   ARC 
  08Nov20 Released as Cango-21v00                                        ARC
  09Nov20 Workaround for Chromium ragged edge on 'destination-out' fill  ARC
  27Nov20 Restored timeline.minFrameRate property name to frameRate      ARC
  06Jun21 Added enableClick and disableClick                             ARC
  08Jun21 bugfix: dnd pathObj left in old dragObjects if on new layer    ARC
  11Jun21 Released as Cango-22v00                                        ARC
  12Jun21 Add Obj2D.getProperty method                                   ARC
  13Jun21 Moved animation default properties setting to Animation module ARC
  14Jun21 Renamed style property defaults to <name>Def                   ARC
  17Jun21 Added ImageSegment as a valid Img descriptor                   ARC
  25Jun21 Removed most of SVGsegs to a separate module                   ARC
  26Jun21 Switch to Path2D instead of raw canvas path methods            ARC
  02Jul21 Released as Cango-24v00                                        ARC
  28Jul21 bugfix: dupCtx didn't copy gridbox dimensions in worldCoords   ARC
  21Aug21 Patch to render to format TextOnPath class                     ARC
  ==========================================================================*/

// exposed globals
  var Cango,
      circle, arc, ellipse, square, rectangle, triangle, cross, ex,
      Path, Shape, Img, Text, ClipMask, Group,
      ImageSegment,
      LinearGradient, RadialGradient, 
      initZoomPan; 

(function() {
  "use strict";

  const types = ["GRP", "PATH", "SHAPE", "IMG", "TEXT", "CLIP"];
  
  function clone(orgItem)
  {
    return JSON.parse(JSON.stringify(orgItem));
  }

  function Path2DObj()
  {
    this.p2dWC = null;    // Path2D object with coords in world coordinates
    this.p2dPX = null;    // Path2D with coords scaled for canvas raw pixel coord system
    this.length = 0;
  }

  circle = function(d=1){
    return ["m", -0.5*d,0,
            "c", 0,-0.27614*d, 0.22386*d,-0.5*d, 0.5*d,-0.5*d,
            "c", 0.27614*d,0, 0.5*d,0.22386*d, 0.5*d,0.5*d,
            "c", 0,0.27614*d, -0.22386*d,0.5*d, -0.5*d,0.5*d,
            "c", -0.27614*d,0, -0.5*d,-0.22386*d, -0.5*d,-0.5*d, "z"];
  };

  arc = function(size, begDegs, endDegs){
    begDegs = begDegs % 360;
    endDegs = endDegs % 360;
    const swp = (endDegs > begDegs)? 1: 0;
    const lrg = (Math.abs(endDegs-begDegs)>180)? 1: 0;
    const secSrt = Math.PI*begDegs/180;
    const secEnd = Math.PI*endDegs/180;
    return ["M", size*Math.cos(secSrt), size*Math.sin(secSrt),
            "A", size, size, 0, lrg, swp, size*Math.cos(secEnd), size*Math.sin(secEnd)];
  };

  ellipse = function(width, height){
    const w = width || 1,
          h = height || w;

    return ["m", -0.5*w,0,
            "c", 0,-0.27614*h, 0.22386*w,-0.5*h, 0.5*w,-0.5*h,
            "c", 0.27614*w,0, 0.5*w,0.22386*h, 0.5*w,0.5*h,
            "c", 0,0.27614*h, -0.22386*w,0.5*h, -0.5*w,0.5*h,
            "c", -0.27614*w,0, -0.5*w,-0.22386*h, -0.5*w,-0.5*h, "z"];
  };

  square = function(w=1){
    return ["m", 0.5*w, -0.5*w, "l", 0, w, -w, 0, 0, -w, "z"];
  };

  rectangle = function(width, height, rad=0)
  {
    const w = width || 1,
          h = height || w;
    
    if (rad > 0)
    {
      const r = Math.min(w/2, h/2, rad);

      return ["m", -w/2+r,-h/2, "l",w-2*r,0, "a",r,r,0,0,1,r,r, "l",0,h-2*r,
              "a",r,r,0,0,1,-r,r, "l",-w+2*r,0, "a",r,r,0,0,1,-r,-r, "l",0,-h+2*r,
              "a",r,r,0,0,1,r,-r, "z"];
    }
    return ["m",-w/2,-h/2, "l",w,0, 0,h, -w,0, "z"];
  };

  triangle = function(s=1){
    return ["m", 0.5*s, -0.289*s, "l", -0.5*s, 0.866*s, -0.5*s, -0.866*s, "z"];
  };

  cross = function(w=1){
    return ["m", -0.5*w, 0, "l", w, 0, "m", -0.5*w, -0.5*w, "l", 0, w];
  };

  ex = function(d=1){
    return ["m", -0.3535*d,-0.3535*d, "l",0.707*d,0.707*d,
                  "m",-0.707*d,0, "l",0.707*d,-0.707*d];
  };

  function hitTest(gc, pathObj, csrX, csrY)
  {
    gc.ctx.save();       // save un-scaled
    pathObj.pthCmds.p2dPX = new Path2D();
    pathObj.pthCmds.p2dPX.addPath(pathObj.pthCmds.p2dWC, pathObj.netTfm);   // scaled to pixels for raw canvas coords
    const hit = gc.ctx.isPointInPath(pathObj.pthCmds.p2dPX, csrX, csrY);
/* 
// for diagnostics on hit region, uncomment
gc.ctx.strokeStyle = 'red';
gc.ctx.lineWidth = 3;
gc.ctx.stroke(pathObj.pthCmds.p2dPX);
 */
    gc.ctx.restore();

    return hit;
  };

  function initDragAndDrop(gc)
  {
    // calc top canvas at grab time since layers can come and go
    const nLrs = gc.bkgCanvas.layers.length;
    // find top canvas in the Stack, only top layer will catch events
    const topCvs = gc.bkgCanvas.layers[nLrs-1].cElem;

    function grabHandler(event){
      const rect = gc.cnvs.getBoundingClientRect();
      const csrX = event.clientX - rect.left;
      const csrY = event.clientY - rect.top;
      // run through all the registered objects and test if cursor pos is within their path
      loops:      // label to break out of nested loops
      for (let j = nLrs-1; j >= 0; j--)       // search top layer down the stack
      {
        let lyr = gc.bkgCanvas.layers[j];
        for (let k = lyr.dragObjects.length-1; k >= 0; k--)  // search from last drawn to first (underneath)
        {
          let testObj = lyr.dragObjects[k];
          if (hitTest(gc, testObj, csrX, csrY))
          {
            // call the grab handler for this object (check it is still enabled)
            if (testObj.dragNdrop)
            {
              testObj.dragNdrop.parent = testObj;
              testObj.dragNdrop.topCvs = topCvs;   // gc.bkgCanvas.layers[nLrs-1].cElem;
              testObj.dragNdrop.grab(event);
              break loops;
            }
          }
        }
      }
    }

    topCvs.onmousedown = (e)=>{grabHandler(e)};  
  } 

  class Drag2D 
  {
    constructor(type, grabFn, dragFn, dropFn) {
      this.dndType = type;                // "drag" or "click"
      this.cgo = null;                    // filled in by render
      this.layer = null;                  // filled in by render
      this.target = null;                 // filled by enableDrag method
      this.topCvs = null;
      this.grabCallback = grabFn || null;
      this.dragCallback = dragFn || null;
      this.dropCallback = dropFn || null;
      this.clickCallback = grabFn || null;// enableClick passes only one argument
      this.grabCsrPos = {x:0, y:0};
      this.grabDwgOrg = {x:0, y:0};       // target drawing origin in world coords
      this.grabOfs = {x:0, y:0};          // csr offset from target (maybe Obj or Group) drawing origin
    }

    mouseupHandler(event){
      const csrPosWC = this.cgo.getCursorPosWC(event);  // update mouse pos to pass to the owner

      this.topCvs.onmouseup = null;
      this.topCvs.onmouseout = null;
      this.topCvs.onmousemove = null;
      if (this.dndType === "click")
      {
        // check if mouse moved outside object after mousedown and before mouseup (ie cancel onclick)
        const rect = this.cgo.cnvs.getBoundingClientRect();  // find the canvas boundaries
        const csrX = event.clientX - rect.left;
        const csrY = event.clientY - rect.top;
        const inside = hitTest(this.cgo, this.target, csrX, csrY);
        if (!inside) return;  // cancelled, don't call the onclick callback 
      }
      if (this.dropCallback)
      {
        this.dropCallback(csrPosWC);
      }
    }

    grab(event){
      // calc top canvas at grab time since layers can come and go
      const nLrs = this.cgo.bkgCanvas.layers.length;
      this.topCvs = this.cgo.bkgCanvas.layers[nLrs-1].cElem;

      this.topCvs.onmouseup = (e)=>{this.mouseupHandler(e)};
      this.topCvs.onmouseout = (e)=>{this.drop(e)};
      const csrPosWC = this.cgo.getCursorPosWC(event);      // update mouse pos to pass to the owner
      // save the cursor pos its very useful
      this.grabCsrPos.x = csrPosWC.x;
      this.grabCsrPos.y = csrPosWC.y;
      // copy the parent drawing origin (for convenience)
      this.grabDwgOrg.x = this.target.dwgOrg.x;
      this.grabDwgOrg.y = this.target.dwgOrg.y;
      if (this.target.parent)
      {
        // save cursor offset from drawing origin add parent Group offset (it will be inherited)
        this.grabOfs.x = csrPosWC.x - this.grabDwgOrg.x + this.target.parent.dwgOrg.x;
        this.grabOfs.y = csrPosWC.y - this.grabDwgOrg.y + this.target.parent.dwgOrg.y;
      }
      else
      {
        this.grabOfs.x = csrPosWC.x - this.grabDwgOrg.x;
        this.grabOfs.y = csrPosWC.y - this.grabDwgOrg.y;
      }
      if (this.grabCallback)
      {
        this.grabCallback(csrPosWC);    // call in the scope of dragNdrop object
      }
      this.topCvs.onmousemove = (event)=>{this.drag(event);};
      event.preventDefault();
      return false;
    }

    drag(event){
      if (this.dragCallback)
      {
        const csrPosWC = this.cgo.getCursorPosWC(event);  // update mouse pos to pass to the owner
        this.dragCallback(csrPosWC);
      }
    }

    drop(event){
      this.topCvs.onmouseup = null;
      this.topCvs.onmouseout = null;
      this.topCvs.onmousemove = null;
      if (this.dropCallback)
      {
        const csrPosWC = this.cgo.getCursorPosWC(event);  // update mouse pos to pass to the owner
        this.dropCallback(csrPosWC);
      }
    }
  }

  LinearGradient = class 
  {
    constructor(p1x, p1y, p2x, p2y)
    {
      this.grad = {x1:p1x, y1:p1y, x2:p2x, y2:p2y};
      this.colorStops = [];
    }
    
    addColorStop(stop, color)
    {
      this.colorStops.push({stop:stop, color:color});
    }
  }

  RadialGradient = class 
  { 
    constructor(p1x, p1y, r1, p2x, p2y, r2)
    {
      this.grad = {x1:p1x, y1:p1y, r1:r1, x2:p2x, y2:p2y, r2:r2};
      this.colorStops = [];
    }

    addColorStop(stop, color)
    {
      this.colorStops.push({stop:stop, color:color});
    }
  }

  function transformPoint(p, xfmr, iso=true)   // p = {x: , y: }
  {
    if (xfmr.type === "TRN")
    {
      p.x += xfmr.args[0];
      p.y += xfmr.args[1];
    }
    else if (xfmr.type === "SCL")
    {
      p.x *= xfmr.args[0];
      p.y *= xfmr.args[1];
    }
    else if (xfmr.type === "ROT")
    {
      const angle = xfmr.args[0] || 0,
            rad = Math.PI/180.0,
            s	= Math.sin(-angle*rad),
            c	= Math.cos(-angle*rad),
            doX = p.x,
            doY = p.y;
      p.x = doX*c + doY*s;
      p.y = -doX*s + doY*c;
    }
    else if (xfmr.type === "SKW")
    {
      const isoScl = (iso)? 1: nonIsoScl,
            ha = xfmr.args[0],
            va = xfmr.args[1],
            rad = Math.PI/180.0,
            htn = Math.tan(-ha*rad)/isoScl,
            vtn = Math.tan(va*rad)*isoScl,
            doX = p.x,
            doY = p.y;

        p.x = doX + doY*htn;
        p.y = doX*vtn + doY;
    }
  }

  function matrixReset(m) // reset to the identity matrix
  { 
    m.a = 1;
    m.b = 0;
    m.c = 0;
    m.d = 1;
    m.e = 0;
    m.f = 0;
  }

  class Transformer
  {
    constructor(type, ...argAry)  // type and the rest
    {
      this.type = type;
      this.args = argAry;  // other args as an array
    }
  }

  Group = class 
  {
    constructor(...args)
    {
      this.type = "GRP";                    // enum of type to instruct the render method
      this.parent = null;                   // pointer to parent group if any
      this.children = [];                   // only Groups have children
      this.dwgOrg = {x:0, y:0};             // drawing origin (0,0) may get translated
      this.ofsTfmAry = [];                  // soft transform applied to just for this Group 
      this.netTfmAry = [];                  // ofsTfmAry concatenated with parent netTfmAry
      this.dragNdropHandlers = null;        // array of DnD handlers to be passed to newly added children
      // add any objects passed by forwarding them to addObj
      this.addObj(args);  // args is an array from the constructor 'rest'
    }

    setProperty(propertyName, value)
    {
      // set Obj2D property recursively
      const iterate = (grp)=>{
        grp.children.forEach((childNode)=>{
          if (childNode.type === "GRP")
          {
            iterate(childNode);
          }
          else   // Obj2D
          {
            childNode.setProperty(propertyName, value);
          }
        });
      }

      iterate(this);
    }

    deleteObj(obj)
    {
      // remove from children array
      const idx = this.children.indexOf(obj);

      if (idx >= 0)
      {
        this.children.splice(idx, 1);
        obj.parent = null;
      }
    }

    addObj(...args)  // the 'rest' returns an array
    {
      const iterate = (argAry)=>{
        argAry.forEach((elem)=>{
          if (Array.isArray(elem))
          {
            iterate(elem);
          }
          else   // Obj2D
          {
            if (!elem || (!types.includes(elem.type)))  // don't add undefined or non-Obj2D
            {
              console.warn("Type Error: Group.addObj: argument", elem);
              return;
            }
            elem.parent = this;            // now its a free agent link it to this group
            this.children.push(elem);
            // enable drag and drop if this group has drag
            if (!elem.dragNdrop && this.dragNdropHandlers)
            {
              elem.enableDrag.apply(elem, this.dragNdropHandlers);
              elem.dragNdrop.target = this;     // the Group is the target being dragged
            }
          }
        });
      }

      iterate(args);
    }

   /*====================================================
    * Recursively add a Drag object to Obj2D descendants 
    * of a Group.
    * When rendered all these Obj2D will be added to 
    * dragObjects to be checked for mousedown events
    *---------------------------------------------------*/
    enableDrag(grabFn, dragFn, dropFn)
    {
      const iterate = (grp)=>{
        grp.children.forEach((childNode)=>{
          if (childNode.type === "GRP")
          {
            iterate(childNode);
          }
          else if (childNode.dragNdrop === null)    // don't over-write if its already assigned a handler
          {
            childNode.enableDrag(grabFn, dragFn, dropFn);
            childNode.dragNdrop.target = this;     // the Group is the target being dragged
          }
        });
      }

      this.dragNdropHandlers = arguments;
      iterate(this);
    }

    /*======================================
    * Disable dragging on Obj2D descendants
    *-------------------------------------*/
    disableDrag()
    {
      const iterate = (grp)=>{
        grp.children.forEach((childNode)=>{
          if (childNode.type === "GRP")
          {
            iterate(childNode);
          }
          else
          {
            childNode.disableDrag();
          }
        });
      }

      this.dragNdropHandlers = null;
      iterate(this);
    }

   /*======================================================
    * Recursively add a Drag object to Obj2D descendants 
    * of a Group.
    * When rendered all these Obj2D will be added to 
    * dragObjects to be checked for mouseup (click) events
    *-----------------------------------------------------*/
    enableClick(clickFn)
    {
      const iterate = (grp)=>{
        grp.children.forEach((childNode)=>{
          if (childNode.type === "GRP")
          {
            iterate(childNode);
          }
          else if (childNode.dragNdrop === null)    // don't over-write if its already assigned a handler
          {
            childNode.enableClick(clickFn);
            childNode.dragNdrop.target = this;     // the Group is the target being clicked
          }
        });
      }

      this.dragNdropHandlers = arguments;
      iterate(this);
    }

   /*======================================
    * Disable onclick for Obj2D descendants
    *-------------------------------------*/
    disableClick()
    {
      const iterate = (grp)=>{
        grp.children.forEach((childNode)=>{
          if (childNode.type === "GRP")
          {
            iterate(childNode);
          }
          else
          {
            childNode.disableClick();
          }
        });
      }

      this.dragNdropHandlers = null;
      iterate(this);
    }

   /*=========================================================
    * Add a translation transform to the Group's OfsTfmAry.
    *--------------------------------------------------------*/
    translate(x=0, y=0)
    {
      const trnsDstr = new Transformer("TRN", x, y);
      this.ofsTfmAry.push(trnsDstr);
    }

   /*=========================================================
    * Add a scale transform to the Group's OfsTfmAry.
    *--------------------------------------------------------*/
    scale(xScl, yScl)
    {
      const sx = xScl || 0.001,
            sy = yScl || sx;

      const sclDstr = new Transformer("SCL", sx, sy);
      this.ofsTfmAry.push(sclDstr);
    }

   /*=========================================================
    * Add a rotation transform to the Group's OfsTfmAry.
    *--------------------------------------------------------*/
    rotate(degs=0)
    {
      const rotDstr = new Transformer("ROT", degs);
      this.ofsTfmAry.push(rotDstr);
    }

   /*=========================================================
    * Add a skew transform to the Group's OfsTfmAry.
    *--------------------------------------------------------*/
    skew(degH=0, degV=0)
    {
      const skwDstr = new Transformer("SKW", degH, degV);
      this.ofsTfmAry.push(skwDstr);
    }
  }

  function setPropertyFn(propertyName, value)
  {
    const lorgVals = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    if ((typeof propertyName !== "string")||(value === undefined))
    {
      return;
    }

    switch (propertyName.toLowerCase())
    {
      case "fillrule":
        if (typeof value !== "string")
        {
          return;
        }
        if ((value === "evenodd")||(value ==="nonzero"))
        {
          this.fillRule = value;
        }
        break;
      case "fillcolor":
        this.fillCol = value;
        break;
      case "strokecolor":
        this.strokeCol = value;
        break;
      case "linewidth":
      case "strokewidth":      // for backward compatibility
        if ((typeof value === "number")&&(value > 0))
        {
          this.lineWidth = value;
        }
        break;
      case "linewidthwc":
        if ((typeof value === "number")&&(value > 0))
        {
          this.lineWidthWC = value;
        }
        break;
      case "linecap":
        if (typeof value !== "string")
        {
          return;
        }
        if ((value === "butt")||(value ==="round")||(value === "square"))
        {
          this.lineCap = value;
        }
        break;
      case "linejoin":
        if (typeof value !== "string")
        {
          return;
        }
        if ((value === "bevel")||(value ==="round")||(value === "miter"))
        {
          this.lineJoin = value;
        }
        break;
      case "iso":
      case "isotropic":
        if ((value == true)||(value === 'iso')||(value === 'isotropic'))
        {
          this.iso = true;
        }
        else
        {
          this.iso = false;
        }
        break;
      case "dashed":
        if (Array.isArray(value) && value[0])
        {
          this.dashed = value;
        }
        else     // ctx.setLineDash([]) will clear dashed settings
        {
          this.dashed = [];
        }
        break;
      case "dashoffset":
        this.dashOffset = value || 0;
        break;
      case "border":
        if (value === true)
        {
          this.border = true;
        }
        if (value === false)
        {
          this.border = false;
        }
        break;
      case "fontsize":
        if ((typeof value === "number")&&(value > 0))
        {
          this.fontSize = value;
        }
        break;
      case "fontweight":
        if ((typeof value === "string")||((typeof value === "number")&&(value>=100)&&(value<=900)))
        {
          this.fontWeight = value;
        }
        break;
      case "fontfamily":
        if (typeof value === "string")
        {
          this.fontFamily = value;
        }
        break;
      case "bgfillcolor":
        this.bgFillColor = value;
        break;
      case "imgwidth":
        this.imgWidth = Math.abs(value);
        break;
      case "imgheight":
        this.imgHeight = Math.abs(value);
        break;
      case "lorg":
        if (lorgVals.indexOf(value) !== -1)
        {
          this.lorg = value;
        }
        break;
      case "shadowoffsetx":
        this.shadowOffsetX = value || 0;
        break;
      case "shadowoffsety":
        this.shadowOffsetY = value || 0;
        break;
      case "shadowblur":
        this.shadowBlur = value || 0;
        break;
      case "shadowcolor":
        this.shadowColor = value;
        break;
      case "x":
        const trnsXDstr = new Transformer("TRN", value, 0);
        this.hardTfmAry.push(trnsXDstr);
        break;
      case "y":
        const trnsYDstr = new Transformer("TRN", 0, value);
        this.hardTfmAry.push(trnsYDstr);
        break;
      case "rot":
      case "degs":
        const rotDstr = new Transformer("ROT", value);
        this.hardTfmAry.push(rotDstr);
        break;
      case "scl":
        const scl = (value != 0)? value: 0.001;   // limit to 1/1000th full size
        const sclDstr = new Transformer("SCL", scl, scl);
        this.hardTfmAry.push(sclDstr);
        break;
      case "sclx":
        const sclx = (value != 0)? value: 0.001;   // limit to 1/1000th full size
        const sclxDstr = new Transformer("SCL", sclx, 1);
        this.hardTfmAry.push(sclxDstr);
        break;
      case "scly":
        const scly = (value != 0)? value: 0.001;   // limit to 1/1000th full size
        const sclyDstr = new Transformer("SCL", 1, scly);
        this.hardTfmAry.push(sclyDstr);
        break;
      case "skewx":
        const skewXDstr = new Transformer("SKW", value, 0);
        this.hardTfmAry.push(skewXDstr);
        break;
      case "skewy":
        const skewYDstr = new Transformer("SKW", 0, value);
        this.hardTfmAry.push(skewYDstr);
        break;
      default:
        break;
    }
  }

  function getPropertyFn(propertyName)
  {
    if (typeof propertyName !== "string")
    {
      return undefined;
    }

    switch (propertyName.toLowerCase())
    {
      case "fillrule":
        return this.fillRule;
      case "fillcolor":
        return this.fillCol;
      case "strokecolor":
        return this.strokeCol;
      case "linewidth":
      case "strokewidth": 
        return this.lineWidth;
      case "linewidthwc":
        return  this.lineWidthWC;
      case "linecap":
        return this.lineCap;
      case "linejoin":
        return this.lineJoin;
      case "iso":
      case "isotropic":
        return this.iso;
      case "dashed":
        return this.dashed;
      case "dashoffset":
        return this.dashOffset;
      case "border":
        return this.border;
      case "fontsize":
        return this.fontSize;
      case "fontweight":
        return this.fontWeight;
      case "fontfamily":
        return this.fontFamily;
      case "bgfillcolor":
        return this.bgFillColor;
      case "imgwidth":
        return this.imgWidth;
      case "imgheight":
        return this.imgHeight;
      case "lorg":
        return this.lorg;
      case "shadowoffsetx":
        return this.shadowOffsetX;
      case "shadowoffsety":
        return this.shadowOffsetY;
      case "shadowblur":
        return this.shadowBlur;
      case "shadowcolor":
        return this.shadowColor;
      default:
        return undefined;
    }
  }

  class Obj2D
  { 
    constructor()
    {
      this.iso = true;                    // default for Shape, Img, Text
      this.parent = null;                 // pointer to parent Group if any
      this.dwgOrg = {x:0, y:0};           // drawing origin (0,0) may get translated
      this.hardTfmAry = [];               // hard offset not reset after render
      this.ofsTfmAry = [];                // soft transforms just for this object reset after render
      this.netTfmAry = [];                // ofsTfmAry concatenated with parent netTfmAry
      this.netTfm = new DOMMatrix();      // the transform matrix to be applied prior to rendering
      this.dragNdrop = null;
    }

    enableDrag(grabFn, dragFn, dropFn)
    {
      this.dragNdrop = new Drag2D("drag", grabFn, dragFn, dropFn);
      // fill in the Drag2D properties for use by callBacks
      this.dragNdrop.target = this;
    }

    disableDrag()
    {
      if (!this.dragNdrop)
      {
        return;
      }
      // remove this object from array to be checked on mousedown
      const aidx = this.dragNdrop.layer.dragObjects.indexOf(this);
      this.dragNdrop.layer.dragObjects.splice(aidx, 1);
      this.dragNdrop = null;
    }

    enableClick(clickFn)
    {
      this.dragNdrop = new Drag2D("click", null, null, clickFn);
      // fill in the Drag2D properties for use by callBacks
      this.dragNdrop.target = this;
    }

    disableClick()
    {
      disableDrag();
    }

   /*=========================================================
    * Add a translation transform to the Obj2D's OfsTfmAry.
    *--------------------------------------------------------*/
    translate(x=0, y=0)
    {
      const trnsDstr = new Transformer("TRN", x, y);
      this.ofsTfmAry.push(trnsDstr);
    }

   /*=========================================================
    * Add a scale transform to the Obj2D's OfsTfmAry.
    *--------------------------------------------------------*/
    scale(xScl, yScl)
    {
      const sx = xScl || 0.001,
            sy = yScl || sx;
      
      const sclDstr = new Transformer("SCL", sx, sy);
      this.ofsTfmAry.push(sclDstr);
    }
    
   /*=========================================================
    * Add a rotation transform to the Obj2D's OfsTfmAry.
    *--------------------------------------------------------*/
    rotate(degs=0)
    {
      const rotDstr = new Transformer("ROT", degs);
      this.ofsTfmAry.push(rotDstr);
    }

   /*=========================================================
    * Add a skew transform to the Obj2D's OfsTfmAry.
    *--------------------------------------------------------*/
    skew(degH=0, degV=0)
    {
      const skwDstr = new Transformer("SKW", degH, degV);
      this.ofsTfmAry.push(skwDstr);
    }
  }

  ClipMask = class extends Obj2D
  {  
    constructor(pathDef, opt = {})
    {
      super();
      this.type = "CLIP";
      this.pthCmds = new Path2DObj();   
      this.fillRule = "nonzero";
      this.fillCol = null;
      this.border = false;    // ClipMask can have a border (half width showing)
      this.strokeCol = null;
      this.lineWidth = null;
      this.lineWidthWC = null;
      this.lineCap = null;
      this.lineJoin = null;
      this.savScale = 1; 
      this.iso= false;    // default
      // drop shadow properties
      this.shadowOffsetX = 0;
      this.shadowOffsetY = 0;
      this.shadowBlur = 0;
      this.shadowColor = "#000000";
      // dashed line properties
      this.dashed = [];
      this.dashOffset = 0;
  
      this.setDescriptor(pathDef);   // sets this.pthCmds

      for (let prop in opt)
      {
        if (opt.hasOwnProperty(prop)) // own property, not inherited from prototype
        {
          this.setProperty(prop, opt[prop]);
        }
      }
    }

    setDescriptor(commands)
    {
      if (typeof(SVGsegs) !== "undefined" && commands instanceof SVGsegs)
      {
        const str = commands.toString(5); 
        this.pthCmds.p2dWC = new Path2D(str);  
        this.pthCmds.length = str.length;  // used for warning if length == 0
      }
      else if (commands instanceof Path2D)
      {
        this.pthCmds.p2dWC = commands;
        // to detect draw empty objects set the length pthCmds.length=0 this will generate a warning
        this.pthCmds.length = 1;
      }
      else if ((typeof commands === "string") && commands.length)  // a string will be svg commands
      {
        const pathStr = commands.replace(/\,/g, " ");  // commas cause trouble, replace with spaces
        this.pthCmds.p2dWC = new Path2D(pathStr);
        this.pthCmds.length = pathStr.length;    // used for warning if length == 0
      }
      else if (commands && commands.length)  // non-empty array 
      {
        // check typed Array views etc, convert to real Array
        if (ArrayBuffer.isView(commands))    
        {
          commands = Array.from(commands);  
        }
        if (Array.isArray(commands))
        {
          let str = "";
          if (typeof(commands[0]) === "number")  // its an Array of numbers
          {
            str = "M "+commands.join(" ");  // insert 'M' command so its valid SVG
            this.pthCmds.p2dWC = new Path2D(str);
          }
          else
          {
            str = commands.join(" "); 
            this.pthCmds.p2dWC = new Path2D(str);  // simple conversion to svg String
          }
          this.pthCmds.length = str.length;  // used for warning if length == 0
        }
      }
    }

    setProperty(...args)
    {
      setPropertyFn.apply(this, args);
    }

    getProperty(propName)
    {
      return getPropertyFn.call(this, propName);
    }

    dup()
    {
      const newObj = new ClipMask();

      newObj.type = this.type;
      if (this.pthCmds.p2dWC)
      {
        newObj.pthCmds.p2dWC = new Path2D(this.pthCmds.p2dWC);
        newObj.pthCmds.length = this.pthCmds.length;
      }
      newObj.parent = null;                       // pointer to parent group if any
      newObj.dwgOrg = clone(this.dwgOrg);
      newObj.hardTfmAry = clone(this.hardTfmAry);  // hard offset from any parent Group's transform
      newObj.ofsTfmAry = clone(this.ofsTfmAry);    // soft offset from any parent Group's transform
  
      newObj.fillRule = this.fillRule;   // for SHAPE
      newObj.fillCol = this.fillCol;     // for SHAPE
      newObj.border = this.border;
      newObj.strokeCol = this.strokeCol;
      newObj.lineWidth = this.lineWidth;
      newObj.lineWidthWC = this.lineWidthWC;
      newObj.lineCap = this.lineCap;
      newObj.lineJoin = this.lineJoin;
      newObj.iso = this.iso;
  
      newObj.shadowOffsetX = this.shadowOffsetX;
      newObj.shadowOffsetY = this.shadowOffsetY;
      newObj.shadowBlur = this.shadowBlur;
      newObj.shadowColor = this.shadowColor;
  
      newObj.dashed = clone(this.dashed);
      newObj.dashOffset = this.dashOffset;
      // The other objects are dynamic, calculated at render
  
      return newObj;         // return a object which inherits Obj2D properties
    }
  }

  Path = class extends ClipMask
  {
    constructor(commands, options)
    {
      super(commands, options);
      this.type = "PATH";               // type string to instruct the render method
    }
  }

  Shape = class extends Path
  {
    constructor(commands, opt = {})
    {
      super(commands, opt);
      this.type = "SHAPE";
      this.clearFlag = false;  // private flag for clearShape method
      // only other difference is the default value for 'iso' property
      if (opt.hasOwnProperty("iso"))
      {
        this.setProperty("iso", opt.iso);
      }
      else if (opt.hasOwnProperty("isotropic"))
      {
        this.setProperty("iso", opt.isotropic);
      }
      else
      {
        this.iso = true;   // default true = maintain aspect ratio
      }
    }
  }

  ImageSegment = class
  {
    constructor(imgData, sx=0, sy=0, sWid=0, sHgt=0)
    {
      this.cropDesc = imgData;  // String, Image or HTMLCanvas
      this.cropX = sx;
      this.cropY = sy;
      this.cropWid = sWid;  
      this.cropHgt = sHgt;  
      if (!(typeof imgData === "string"|| imgData instanceof Image  || imgData instanceof HTMLCanvasElement))
      {
        console.warn("Type Error: ImageSegment descriptor");
        this.imageDesc = undefined;
      }
    }
  } 

  Img = class extends Obj2D
  {
    constructor(imgDef, opt = {})
    {
      super();
      this.type = "IMG";

      this.srcX = 0;    // these get changed if descriptor is a ImageSegment
      this.srcY = 0;    // so they shouldn't be initialize after setDescriptor
      this.srcWid = 0;
      this.srcHgt = 0;

      this.setDescriptor(imgDef);

      this.pthCmds = new Path2DObj();   // Path2D holding the img bounding box
      this.width = 0;                   // only used for type = IMG, TEXT, set to 0 until image loaded
      this.height = 0;                  //     "
      this.imgWidth = 0;                // user requested width in WC
      this.imgHeight = 0;               // user requested height in WC
      this.imgLorgX = 0;                // only used for type = IMG, TEXT, set to 0 until image loaded
      this.imgLorgY = 0;                //     "
      this.lorg = 1;                    // used by IMG and TEXT to set drawing origin
      // properties set by setProperty method, if undefined render uses Cango default
      this.border = false;              // true = stroke outline with strokeColor & lineWidth
      this.strokeCol = null;            // render will stroke a path or border in this color
      this.lineWidthWC = null;          // path or border width world coords
      this.lineWidth = null;            // path or border width pixels
      this.lineCap = null;              // round, butt or square
      this.lineJoin = null;             // bevel, round, or miter
      this.savScale = 1;                // save accumulated scale factors for lineWidth of border
      // drop shadow properties
      this.shadowOffsetX = 0;
      this.shadowOffsetY = 0;
      this.shadowBlur = 0;
      this.shadowColor = "#000000";

      for (let prop in opt)
      {
        if (opt.hasOwnProperty(prop)) // own property, not inherited from prototype
        {
          this.setProperty(prop, opt[prop]);
        }
      }
    }

    setDescriptor(imgDesc)
    {
      let imgData;
  
      if (imgDesc instanceof ImageSegment)
      {
        this.srcX = imgDesc.cropX;
        this.srcY = imgDesc.cropY;
        this.srcWid = imgDesc.cropWid;
        this.srcHgt = imgDesc.cropHgt;
        imgData = imgDesc.cropDesc;
      }
      else
      {
        imgData = imgDesc;
      }
      if (typeof imgData === "string")
      {
        this.imgBuf = new Image();    // pointer to the Image object when image is loaded
        this.imgBuf.src = imgData;    // start loading the image immediately
        return;
      }
      if ((imgData instanceof Image)||(imgData instanceof HTMLCanvasElement))
      {
        this.imgBuf = imgData;
        return;
      }
      console.warn("Type Error: Img descriptor");
    }

    setProperty(...args)
    {
      setPropertyFn.apply(this, args);
    }

    dup()
    {
      const newObj = new Img(this.imgBuf);   // just copy reference

      newObj.type = this.type;
      if (this.pthCmds.p2dWC)
      {
        newObj.pthCmds.p2dWC = new Path2D(this.pthCmds.p2dWC);
        newObj.pthCmds.length = this.pthCmds.length;
      }
      newObj.dwgOrg = clone(this.dwgOrg);
      newObj.dragNdrop = null;
      newObj.hardTfmAry = clone(this.hardTfmAry);  // hard offset from any parent Group's transform
      newObj.ofsTfmAry = clone(this.ofsTfmAry);    // soft offset from any parent Group's transform
      newObj.border = this.border;
      newObj.strokeCol = this.strokeCol;
      newObj.lineWidth = this.lineWidth;
      newObj.lineWidthWC = this.lineWidthWC;
      newObj.lineCap = this.lineCap;
      newObj.lineJoin = this.lineJoin;
      newObj.iso = this.iso;
      newObj.dashed = clone(this.dashed);
      newObj.dashOffset = this.dashOffset;
      newObj.width = this.width;
      newObj.height = this.height;
      newObj.imgWidth = this.imgWidth;
      newObj.imgHeight = this.imgHeight;
      newObj.imgLorgX = this.imgLorgX;
      newObj.imgLorgY = this.imgLorgY;
      newObj.lorg = this.lorg;
      newObj.shadowOffsetX = this.shadowOffsetX;
      newObj.shadowOffsetY = this.shadowOffsetY;
      newObj.shadowBlur = this.shadowBlur;
      newObj.shadowColor = this.shadowColor;
      // The other objects are dynamic, calculated at render

      return newObj;         // return a object which inherits Obj2D properties
    }

    formatImg(gc)
    {
      const wcAspectRatio = Math.abs(gc.yscl/gc.xscl);
      let wid, hgt, 
          dx = 0,
          dy = 0;

      this.iso = true;   // over-ride any iso=false (rotation fials with no-iso pics)
      if (!this.imgBuf.width)
      {
        console.warn("Error: in image onload handler yet image NOT loaded!");
        return;
      }
      // setup the crop dimension if any
      let crpX = (this.srcX > 0)? Math.min(this.srcX, this.imgBuf.width-this.srcWid): 0;
      let crpY = (this.srcY > 0)? Math.min(this.srcY, this.imgBuf.height-this.srcHgt): 0;
      let crpWid = (this.srcWid > 0)? Math.min(this.imgBuf.width - crpX, this.srcWid): this.imgBuf.width;
      let crpHgt = (this.srcHgt > 0)? Math.min(this.imgBuf.height - crpY, this.srcHgt): this.imgBuf.height; 
      this.srcX = crpX;
      this.srcY = crpY;
      this.srcWid = crpWid;
      this.srcHgt = crpHgt;

      if (this.imgWidth && this.imgHeight)
      {
        wid = this.imgWidth;
        hgt = this.imgHeight*wcAspectRatio;
      }
      else if (this.imgWidth && !this.imgHeight)  // width only passed height is auto
      {
        wid = this.imgWidth;
        hgt = wid*this.imgBuf.height/this.imgBuf.width;  // keep aspect ratio, use x units
      }
      else if (this.imgHeight && !this.imgWidth)  // height only passed width is auto
      {
        hgt = this.imgHeight*wcAspectRatio;
        wid = hgt*this.imgBuf.width/this.imgBuf.height;    // keep aspect ratio
      }
      else    // no width or height default to natural size;
      {
        wid = this.imgBuf.width;    // default to natural width if none passed
        hgt = wid*this.imgBuf.height/this.imgBuf.width;  // keep aspect ratio, use x units
      }

      const wid2 = wid/2;
      const hgt2 = hgt/2;
      const lorgWC = [0, [0,    0], [wid2,    0], [wid,    0],
                        [0, hgt2], [wid2, hgt2], [wid, hgt2],
                        [0,  hgt], [wid2,  hgt], [wid,  hgt]];
      if (lorgWC[this.lorg] !== undefined)
      {
        dx = -lorgWC[this.lorg][0];
        dy = -lorgWC[this.lorg][1];
      }
      this.imgLorgX = dx;     // world coords offset to drawing origin
      this.imgLorgY = dy;
      this.width = wid;       // default to natural width if none passed
      this.height = hgt;      // default to natural height if none passed
      // construct the draw cmds for the Img bounding box
      const ulx = dx;
      const uly = dy;
      const llx = dx;
      const lly = dy+hgt;
      const lrx = dx+wid;
      const lry = dy+hgt;
      const urx = dx+wid;
      const ury = dy;
      const cmdsAry = "M"+ulx+" "+uly+" L"+llx+" "+lly+" "+lrx+" "+lry+" "+urx+" "+ury+" Z";
      this.pthCmds.p2dWC = new Path2D(cmdsAry);
      this.pthCmds.length = cmdsAry.length;
    }
  }

  Text = class extends Obj2D
  {
    constructor (txtString, opt = {})
    {
      super();
      this.type = "TEXT";               // type string to instruct the render method
      this.txtStr = "";                 // store the text String
      this.pthCmds = new Path2DObj();   // Path2D that draws the text bounding box
      this.width = 0;                   // only used for type = IMG, TEXT, set to 0 until image loaded
      this.height = 0;                  //     "
      this.imgLorgX = 0;                //     "
      this.imgLorgY = 0;                //     "
      this.lorg = 1;                    // used by IMG and TEXT to set drawing origin
      // properties set by setProperty method, if undefined render uses Cango default
      this.border = false;              // true = stroke outline with strokeColor & lineWidth
      this.fillCol = null;              // only used if type == SHAPE or TEXT
      this.bgFillColor = null;          // only used if type = TEXT
      this.strokeCol = null;            // render will stroke a path or border in this color
      this.fontSize = null;             // fontSize in pixels (TEXT only)
      this.fontSizeZC = null;           // fontSize zoom corrected, scaled for any change in context xscl
      this.fontWeight = null;           // fontWeight 100..900 (TEXT only)
      this.fontFamily = null;           // (TEXT only)
      this.lineWidthWC = null;          // path or border width world coords
      this.lineWidth = null;            // path or border width pixels
      this.lineCap = null;              // round, butt or square
      this.lineJoin = null;             // bevel, round or miter
      this.savScale = 1;                // save accumulated scale factors to scale lineWidth of border 
      // drop shadow properties
      this.shadowOffsetX = 0;
      this.shadowOffsetY = 0;
      this.shadowBlur = 0;
      this.shadowColor = "#000000";

      this.setDescriptor(txtString);

      for (let prop in opt)
      {
        if (opt.hasOwnProperty(prop))   // own property, not inherited from prototype
        {
          this.setProperty(prop, opt[prop]);
        }
      }
    }

    setDescriptor(str)
    {
      if (typeof str !== "string")
      {
        console.warn("Type Error: Text descriptor");
        return;
      }
      this.txtStr = str;
    }

    setProperty(...args)
    {
      setPropertyFn.apply(this, args);
    }

    dup()
    {
      const newObj = new Text(this.txtStr.slice(0));

      newObj.type = this.type;

      if (this.pthCmds.p2dWC)
      {
        newObj.pthCmds.p2dWC = new Path2D(this.pthCmds.p2dWC);
        newObj.pthCmds.length = this.pthCmds.length;
      }
      newObj.dwgOrg = clone(this.dwgOrg);
      newObj.hardTfmAry = clone(this.hardTfmAry);  
      newObj.ofsTfmAry = clone(this.ofsTfmAry);   
      newObj.border = this.border;
      newObj.strokeCol = this.strokeCol;
      newObj.fillCol = this.fillCol;
      newObj.bgFillColor = this.bgFillColor;
      newObj.lineWidth = this.lineWidth;
      newObj.lineWidthWC = this.lineWidthWC;
      newObj.lineCap = this.lineCap;
      newObj.lineJoin = this.lineJoin;
      newObj.dashed = clone(this.dashed);
      newObj.dashOffset = this.dashOffset;
      newObj.width = this.width;
      newObj.height = this.height;
      newObj.imgLorgX = this.imgLorgX;
      newObj.imgLorgY = this.imgLorgY;
      newObj.lorg = this.lorg;
      newObj.fontSize = this.fontSize;
      newObj.fontWeight = this.fontWeight;
      newObj.fontFamily = this.fontFamily;
      newObj.shadowOffsetX = this.shadowOffsetX;
      newObj.shadowOffsetY = this.shadowOffsetY;
      newObj.shadowBlur = this.shadowBlur;
      newObj.shadowColor = this.shadowColor;
      // The other properties are dynamic, calculated at render

      return newObj;
    }

    formatText(gc)
    {
      const fntSz = this.fontSize || gc.fontSizeDef,     // fontSize in pxls
            fntFm = this.fontFamily || gc.fontFamilyDef,
            fntWt = this.fontWeight || gc.fontWeightDef,
            lorg = this.lorg || 1;
      let wid, hgt,   // Note: char cell is ~1.4*fontSize pixels high
          dx = 0,
          dy = 0;

      // support for zoom and pan
      if (!this.orgXscl)
      {
        // first time drawn save the scale
        this.orgXscl = gc.xscl;
      }
      const fntScl = gc.xscl/this.orgXscl;   // scale for any zoom factor
      this.fontSizeZC = fntSz*fntScl;
      // set the drawing context to measure the size
      gc.ctx.save();
      gc.ctx.resetTransform();  // reset to identity matrix
      gc.ctx.font = fntWt+" "+fntSz+"px "+fntFm;
      wid = gc.ctx.measureText(this.txtStr).width;  // width in pixels
      gc.ctx.restore();

      // keep in pixel dimensions (Img and Text are drawn in px dimensions, avoiding font size rounding) 
      wid *= fntScl;   // handle zoom scaling
      hgt = fntSz;     // TEXT height from bottom of decender to top of capitals
      hgt *= fntScl;   // handle zoom scaling
      const wid2 = wid/2;
      const hgt2 = hgt/2;
      const lorgWC = [[0, 0], [0,  hgt], [wid2,  hgt], [wid,  hgt],
                              [0, hgt2], [wid2, hgt2], [wid, hgt2],
                              [0,    0], [wid2,    0], [wid,    0]];
      if (lorgWC[lorg] !== undefined)
      {
        dx = -lorgWC[lorg][0];
        dy = lorgWC[lorg][1];
      }
      this.imgLorgX = dx;           // pixel offsets to drawing origin
      this.imgLorgY = dy-0.25*hgt;  // correct for alphabetic baseline, its offset about 0.25*char height

      // construct the cmdsAry for the text bounding box (world coords)
      const ulx = dx;
      const uly = dy;
      const llx = dx;
      const lly = dy-hgt;
      const lrx = dx+wid;
      const lry = dy-hgt;
      const urx = dx+wid;
      const ury = dy;
      const cmdsAry = "M"+ulx+" "+uly+" L"+llx+" "+lly+" "+lrx+" "+lry+" "+urx+" "+ury+" Z";
      this.pthCmds.p2dWC = new Path2D(cmdsAry);
      this.pthCmds.length = cmdsAry.length;    // used for warning if length == 0
    }
  } 

  class Layer
  {
    constructor(canvasID, canvasElement)
    {
      this.id = canvasID;
      this.cElem = canvasElement;
      this.dragObjects = [];
    }
  }

  function getLayer(cgo)
  {
    let lyr = cgo.bkgCanvas.layers[0];

    for (let i=1; i < cgo.bkgCanvas.layers.length; i++)
    {
      if (cgo.bkgCanvas.layers[i].id === cgo.cId)
      {
        lyr = cgo.bkgCanvas.layers[i];
        break;
      }
    }
    return lyr;    // Layer object
  }

  Cango = class 
  {
    constructor(cvs)
    {
      const resizeLayers = ()=>
      {
        const t = this.bkgCanvas.offsetTop + this.bkgCanvas.clientTop,
              l = this.bkgCanvas.offsetLeft + this.bkgCanvas.clientLeft,
              w = this.bkgCanvas.offsetWidth,
              h = this.bkgCanvas.offsetHeight;

        // check if canvas is resized when window -resized, allow some rounding error in layout calcs
        if ((Math.abs(w - this.rawWidth)/w < 0.01) && (Math.abs(h - this.rawHeight)/h < 0.01))
        {
          // canvas size didn't change so return
          return;
        }
        // canvas has been resized so re0size all the overlay canvases
        // kill off any animations on resize (else they stil contiune along with any new ones)
        if (this.bkgCanvas.timeline && this.bkgCanvas.timeline.animTasks.length)
        {
          this.deleteAllAnimations();
        }
        // fix all Cango contexts to know about new size
        this.rawWidth = w;
        this.rawHeight = h;
        this.aRatio = w/h;
        // there may be multiple Cango contexts a layer, try to only fix actual canvas properties once
        if (this.bkgCanvas !== this.cnvs)
        {
          return;
        }
        this.cnvs.width = w;    // reset canvas pixels width
        this.cnvs.height = h;   // don't use style for this
        // step through the stack of canvases (if any)
        for (let j=1; j<this.bkgCanvas.layers.length; j++)  // bkg is layer[0]
        {
          let ovl = this.bkgCanvas.layers[j].cElem;
          if (ovl)
          {
            ovl.style.top = t+'px';
            ovl.style.left = l+'px';
            ovl.style.width = w+'px';
            ovl.style.height = h+'px';
            ovl.width = w;    // reset canvas attribute to pixel width
            ovl.height = h;  
          }
        }
      }

      if ((typeof cvs === "string") && document.getElementById(cvs))   // element ID was passed
      {
        this.cnvs = document.getElementById(cvs);
        this.cId = cvs;
        if (!(this.cnvs instanceof HTMLCanvasElement))  // not a canvas
        {
          console.warn("Type Error: Cango constructor argument not an HTMLCanvasElement");
          return;
        }
        // check if this is a context for an overlay
        if (this.cId.indexOf("_ovl_") !== -1)
        {
          this.cgoType = "OVL"; 
          // this is an overlay. get a reference to the backGround canvas
          const bkgId = this.cId.slice(0, this.cId.indexOf("_ovl_"));
          this.bkgCanvas = document.getElementById(bkgId);
        }
        else
        {
          this.cgoType = "BKG"; 
          this.bkgCanvas = this.cnvs;
        }
        this.rawWidth = this.cnvs.offsetWidth;    // ignore attribute, use the on screen pixel size
        this.rawHeight = this.cnvs.offsetHeight;
        if (!this.bkgCanvas.hasOwnProperty('unique'))
        {
          this.bkgCanvas.unique = 0;
        }    
      }
      else if (cvs instanceof HTMLCanvasElement)   // canvas element passed
      {
        this.cnvs = cvs;
        this.bkgCanvas = this.cnvs;
        this.rawWidth = this.cnvs.width;
        this.rawHeight = this.cnvs.height;
        if (!this.bkgCanvas.hasOwnProperty('unique'))
        {
          this.bkgCanvas.unique = 0;
        }    
        if (document.contains(cvs))  // element is part of the DOM
        {
          this.cId = this.cnvs.id;
          this.cgoType = "BKG"; 
          if (!this.cId)
          {
            this.cId = "_bkg_"+this.getUnique();
            this.cnvs.id = this.cId;    // set the attribute to match new id
          }
        }
        else  // off-screen canvas
        {
          this.cId = "_os_"+this.getUnique();  // over-ride any existing id
          this.cgoType = "OS";     
        }
      }
      else  // not a canvas element
      {
        console.warn("Type Error: Cango constructor argument 1");
        return;
      }

      this.aRatio = this.rawWidth/this.rawHeight;
      this.widthPW = 100;                 // width of canvas in Percent Width coords
      this.heightPW = 100/this.aRatio;    // height of canvas in Percent Width coords
      if (!this.bkgCanvas.hasOwnProperty('layers'))
      {
        // create an array to hold all the overlay canvases for this canvas
        this.bkgCanvas.layers = [];
        // make a Layer object for the bkgCanvas
        const bkgL = new Layer(this.cId, this.cnvs);
        this.bkgCanvas.layers[0] = bkgL;
        // make sure the overlay canvases always match the bkgCanvas size
        if (this.cgoType !== "OS")
        {
          let timer_id = undefined;
          window.addEventListener("resize", ()=>{
            if(timer_id != undefined) 
            {
              clearTimeout(timer_id);
              timer_id = undefined;
            }
            timer_id = setTimeout(()=>{
              timer_id = undefined;
              resizeLayers();
            }, 250);
          });
        }
      }
      if ((typeof Timeline !== "undefined") && !this.bkgCanvas.hasOwnProperty('timeline'))
      {
        // create a single timeline for all animations on all layers
        this.bkgCanvas.timeline = new Timeline();
      }
      if (!this.cnvs.hasOwnProperty('resized'))
      {
        // make canvas native aspect ratio equal style box aspect ratio.
        // Note: rawWidth and rawHeight are floats, assignment to ints will truncate
        this.cnvs.width = this.rawWidth;    // reset canvas pixels width
        this.cnvs.height = this.rawHeight;  // don't use style for this
        this.cnvs.resized = true;
      }
      this.ctx = this.cnvs.getContext('2d');    // draw direct to screen canvas
      this.vpW = this.rawWidth;         // vp width in pixels (no gridbox, use full canvas)
      this.vpH = this.rawHeight;        // vp height in pixels, canvas height = width/aspect ratio
      this.vpOrgX = 0;                  // gridbox origin in pixels (upper left for SVG, the default)
      this.vpOrgYsvg = 0;               // save vpOrgY, needed when switching between RHC and SVG and back
      this.vpOrgYrhc = this.rawHeight;  //   "
      this.vpOrgY = this.vpOrgYsvg;     // gridbox origin in pixels (upper left for SVG, the default)
      this.xscl = 1;                    // world x axis scale factor, default: pixels
      this.yscl = 1;                    // world y axis scale factor, +ve down (SVG style default)
      this.yDown = true;                // set by setWordlCoordsRHC & setWorldCoordsSVG (SVG is default)
      this.isoYscl = this.xscl;         // drawing is done with iso coords (updated prior to render)
      this.xoffset = 0;                 // world x origin offset from gridbox left in pixels
      this.yoffset = 0;                 // world y origin offset from gridbox bottom in pixels
      this.savWC = {"xscl":this.xscl,
                    "yscl":this.yscl,
                    "xoffset":this.xoffset,
                    "yoffset":this.yoffset};   // save world coords for zoom/pan
      this.ctx.textAlign = "left";             // all offsets are handled by lorg facility
      this.ctx.textBaseline = "alphabetic";
      this.strokeColDef = "rgba(0, 0, 0, 1.0)";      // black
      this.lineWidthDef = 1;                         // 1 pixel
      this.lineCapDef = "butt";
      this.lineJoinDef = "miter";
      this.fillColDef = "rgba(128,128,128,1.0)"; // gray
      this.fontSizeDef = 12;                      // pixels
      this.fontWeightDef = 400;                   // 100..900, 400 = normal,700 = bold
      this.fontFamilyDef = "Consolas, Monaco, 'Andale Mono', monospace";
      this.clipCount = 0;                      // count ClipMask calls for use by resetClip

      this.setWorldCoordsSVG();        // set default coordinate values (eqiv to raw pixels)
    }
  };

  Cango.prototype.getUnique = function()
  {
    this.bkgCanvas.unique += 1; 
    return this.bkgCanvas.unique;
  };

  Cango.prototype.toPixelCoords = function(x, y)
  {
    // transform x,y in world coords to canvas pixel coords (top left is 0,0 y axis +ve down)
    const xPx = this.vpOrgX+this.xoffset+x*this.xscl,
          yPx = this.vpOrgY+this.yoffset+y*this.yscl;

    return {x: xPx, y: yPx};
  };

  Cango.prototype.toWorldCoords = function(xPx, yPx)
  {
    // transform xPx,yPx in raw canvas pixels to world coords (lower left is 0,0 +ve up)
    const xW = (xPx - this.vpOrgX - this.xoffset)/this.xscl,
          yW = (yPx - this.vpOrgY - this.yoffset)/this.yscl;

    return {x: xW, y: yW};
  };

  Cango.prototype.getCursorPosWC = function(evt)
  {
    // pass in any mouse event, returns the position of the cursor in raw pixel coords
    const rect = this.cnvs.getBoundingClientRect();

    return this.toWorldCoords(evt.clientX-rect.left, evt.clientY-rect.top);
  };

  Cango.prototype.clearCanvas = function(fillColor)
  {
    if (fillColor)
    {
      const ul = this.toWorldCoords(0,0);
      const lr = this.toWorldCoords(this.rawWidth, this.rawHeight); 

      const nonIsoScl = Math.abs(this.yscl/this.xscl);
      const gbData = "M"+ul.x+","+lr.y*nonIsoScl+" h"+(lr.x-ul.x)+" v"+(ul.y-lr.y)*nonIsoScl+" h-"+(lr.x-ul.x)+" z";
      this.drawShape(gbData, {fillColor:fillColor});
    }
    else
    {
      this.ctx.clearRect(0, 0, this.rawWidth, this.rawHeight);
    }
    // all drawing erased, but graphics contexts remain intact
    // clear the dragObjects array, draggables put back when rendered
    const layerObj = getLayer(this);
    layerObj.dragObjects.length = 0;
    // in case the CangoHTMLtext extension is used
    if (this.cnvs.alphaOvl && this.cnvs.alphaOvl.parentNode)
    {
      this.cnvs.alphaOvl.parentNode.removeChild(this.cnvs.alphaOvl);
    }
  };

  Cango.prototype.gridboxPadding = function(left, bottom, right, top)
  {
    // left, bottom, right, top are the padding from the respective sides, 
    // all are in % of canvas width units, negative values are set to 0.
    const setDefault = ()=>{
      this.vpW = this.rawWidth;
      this.vpH = this.rawHeight;
      this.vpOrgX = 0;
      this.vpOrgY = 0;
      this.setWorldCoordsSVG(); // if new gridbox created, world coords are garbage, so reset to defaults
    }

    if (left === undefined)   // no error just reset to default
    {
      setDefault();
      return;
    }
    // check if only left defined
    if (bottom === undefined)  // only one parameter
    {
      if ((left >= 50) || (left < 0))
      {
        console.warn("Range Error: gridboxPadding right not greater than left");
        setDefault();
        return;
      }
      bottom = left;
    }
    if ((left < 0) || (left > 99))
    {
      left = 0;
    }
    // now we have a valid left and a bottom
    if ((bottom < 0) || (bottom > 99/this.aRatio))
    {
      bottom = 0;
    }
    if (right === undefined)   // right == 0 is OK
    {
      right = left;
    }
    else if (right < 0)
    {
      right = 0;
    }
    if (top === undefined)    // top == 0 is OK
    {
      top = bottom;
    }
    else if (top < 0)
    {
      top = 0;
    }
    // now we have all 4 valid padding values
    const width = 100 - left - right;
    const height = 100/this.aRatio - top - bottom;
    if ((width < 0) || (height < 0))
    {
      console.warn("Range Error: gridboxPadding invalid dimensions");
      setDefault();
      return;
    }

    this.vpW = width*this.rawWidth/100;
    this.vpH = height*this.rawWidth/100;
    // now calc upper left of gridbox in pixels = this is the vpOrg
    this.vpOrgX = left*this.rawWidth/100;
    this.vpOrgYsvg = top*this.rawWidth/100;  // SVG vpOrg is up at the top left
    this.vpOrgYrhc = this.vpOrgYsvg+this.vpH;// RHC vpOrg is down at the lower left
    this.vpOrgY = this.vpOrgYsvg;            // SVG is the default
    this.setWorldCoordsSVG(); // if new gridbox created, world coords are garbage, so reset to defaults
  };

  Cango.prototype.fillGridbox = function(fillColor)
  {
    const nonIsoScl = Math.abs(this.yscl/this.xscl);
    const gbData = "M"+this.vpOrgXWC+","+this.vpOrgYWC*nonIsoScl+" h"+this.spanX+" v"+this.spanY*nonIsoScl+" h-"+this.spanX+" z";
    this.drawShape(gbData, {fillColor:fillColor});
  };

  Cango.prototype.setWorldCoordsSVG = function(vpOrgXWC=0, vpOrgYWC=0, spanX=0, spanY=0)
  {
    // gridbox origin is upper left
    this.vpOrgXWC = vpOrgXWC;
    this.vpOrgYWC = vpOrgYWC;
    this.spanX = spanX;
    this.spanY = spanY;

    this.vpOrgY = this.vpOrgYsvg;       // switch vpOrg to upper left corner of gridbox
    if (spanX > 0)
    {
      this.xscl = this.vpW/spanX;
    }
    else
    {
      this.xscl = 1;                    // use pixel units
      this.spanX = this.vpW;
    }
    if (spanY > 0)
    {
      this.yscl = this.vpH/spanY;       // yscl is positive for SVG
    }
    else
    {
      this.yscl = this.xscl;            // square pixels
      this.spanY = this.vpH/this.xscl;
    }
    this.yDown = true;                  // flag true for SVG world coords being used
    this.xoffset = -vpOrgXWC*this.xscl;
    this.yoffset = -vpOrgYWC*this.yscl;   // reference to upper left of gridbox
    // save values to support resetting zoom and pan
    this.savWC = {"xscl":this.xscl, "yscl":this.yscl, "xoffset":this.xoffset, "yoffset":this.yoffset};
  };

  Cango.prototype.setWorldCoordsRHC = function(vpOrgXWC=0, vpOrgYWC=0, spanX=0, spanY=0)
  {
    this.vpOrgXWC = vpOrgXWC;
    this.vpOrgYWC = vpOrgYWC;
    this.spanX = spanX;
    this.spanY = spanY;

    this.vpOrgY = this.vpOrgYrhc;   // switch vpOrg to lower left corner of gridbox
    if (spanX > 0)
    {
      this.xscl = this.vpW/spanX;
    }
    else
    {
      this.xscl = 1;                   // use pixel units
      this.spanX = this.vpW;
    }
    if (spanY > 0)
    {
      this.yscl = -this.vpH/spanY;    // yscl is negative for RHC
    }
    else
    {
      this.yscl = -this.xscl;          // square pixels
      this.spanY = this.vpH/this.xscl;
    }
    this.yDown = false;             // flag false for RHC world coords
    this.xoffset = -vpOrgXWC*this.xscl;
    this.yoffset = -vpOrgYWC*this.yscl;
    // save these values to support resetting zoom and pan
    this.savWC = {"xscl":this.xscl, "yscl":this.yscl, "xoffset":this.xoffset, "yoffset":this.yoffset};
  };

  Cango.prototype.setPropertyDefault = function(propertyName, value)
  {
    if ((typeof propertyName !== "string")||(value === undefined)||(value === null))
    {
      return;
    }
    switch (propertyName.toLowerCase())
    {
      case "fillcolor":
        if ((typeof value === "string")||(typeof value === "object"))  // gradient will be an object
        {
          this.fillColDef = value;
        }
        break;
      case "strokecolor":
        if ((typeof value === "string")||(typeof value === "object"))  // gradient will be an object
        {
          this.strokeColDef = value;
        }
        break;
      case "linewidth":
      case "strokewidth":
        this.lineWidthDef = value;
        break;
      case "linecap":
        if ((typeof value === "string")&&((value === "butt")||(value ==="round")||(value === "square")))
        {
          this.lineCapDef = value;
        }
        break;
      case "linejoin":
        if ((typeof value === "string")&&((value === "bevel")||(value ==="round")||(value === "miter")))
        {
          this.lineJoinDef = value;
        }
        break;
        case "fontfamily":
        if (typeof value === "string")
        {
          this.fontFamilyDef = value;
        }
        break;
      case "fontsize":
        this.fontSizeDef = value;
        break;
      case "fontweight":
        if ((typeof value === "string")||((value >= 100)&&(value <= 900)))
        {
          this.fontWeightDef = value;
        }
        break;
      default:
        break;
    }
  };

  Cango.prototype.dropShadow = function(obj)  // no argument will reset to no drop shadows 
  {
    let xOfs = 0,
        yOfs = 0,
        radius = 0,
        color = "#000000",
        yScale = 1;

    if (obj != undefined)
    {
      xOfs = obj.shadowOffsetX || 0;
      yOfs = obj.shadowOffsetY || 0;
      radius = obj.shadowBlur || 0;
      color = obj.shadowColor || "#000000";
      if ((obj.type === "SHAPE")||((obj.type === "PATH") && !obj.iso)) 
      {
        yScale = this.yscl;  // scale for world coords
      }
      else 
      {
        yScale = (this.yDown)? this.xscl: -this.xscl;   // iso scaling
      }
    }
    this.ctx.shadowOffsetX = xOfs*this.xscl;
    this.ctx.shadowOffsetY = yOfs*yScale;
    this.ctx.shadowBlur = radius*this.xscl;
    this.ctx.shadowColor = color;
  };

  /*========================================================
   * render will draw a Group or Obj2D.
   * If an Obj2D is passed, update the netTfm and render it.
   * If a Group is passed, recursively update the netTfm of 
   * the group's family tree, then render all Obj2Ds.
   *-------------------------------------------------------*/
  Cango.prototype.render = function(rootObj, clear)
  {
    const nonIsoScl = Math.abs(this.yscl/this.xscl);
    this.isoYscl = (this.yDown)? this.xscl: -this.xscl;

    const genNetTfmMatrix = (obj)=>
    {
      matrixReset(obj.netTfm);  // clear out previous transforms
      obj.savScale = 1;         // reset the scale factor for re-calc

      obj.netTfm.translateSelf(this.vpOrgX + this.xoffset, this.vpOrgY + this.yoffset);
      obj.netTfm.scaleSelf(this.xscl, this.isoYscl);
      obj.netTfmAry.forEach((xfmr)=>{
        if (xfmr.type === "TRN")
        {
          // objects must translate according to yscl even if obj.iso true
          obj.netTfm.translateSelf(xfmr.args[0], xfmr.args[1]*nonIsoScl); 
        }
        else if (xfmr.type === "SCL")
        {
          obj.savScale *= Math.abs(xfmr.args[0]); // accumulate scaling to apply to lineWidth
          obj.netTfm.scaleSelf(xfmr.args[0], xfmr.args[1]);
        }
        else if (xfmr.type === "ROT")
        {
          obj.netTfm.rotateSelf(xfmr.args[0]);
        }
        else if (xfmr.type === "SKW")
        { 
          obj.netTfm.skewXSelf(-xfmr.args[0]);
          obj.netTfm.skewYSelf(xfmr.args[1]);    
        }
      });
    }

    const genNetTfmAry = (obj)=>
    {
      const grpTfmAry = (obj.parent)? obj.parent.netTfmAry : [];
      const softTfmAry = obj.ofsTfmAry.concat(grpTfmAry);
      // finished with ofsTfmAry reset it 
      obj.ofsTfmAry.length = 0;
      // apply the soft transforms to the dwgOrg of the Group or the Obj2D
      obj.dwgOrg = {x:0, y:0};
      softTfmAry.forEach((xfmr)=>{ 
        transformPoint(obj.dwgOrg, xfmr, obj.iso);
      });

      if (obj.type === "GRP")
      {
        obj.netTfmAry = softTfmAry;
      }
      else
      {
        obj.netTfmAry = obj.hardTfmAry.concat(softTfmAry).reverse();

        if (!obj.iso)
        { 
          obj.netTfmAry = obj.netTfmAry.concat(new Transformer("SCL", 1, nonIsoScl));
        }
        if (obj.type === "IMG" && !this.yDown)
        {
          obj.netTfmAry = obj.netTfmAry.concat(new  Transformer("SCL", 1, -1));
        }
        else if (obj.type === "TEXT")
        {
          obj.netTfmAry = obj.netTfmAry.concat(new  Transformer("SCL", 1/this.xscl, 1/this.isoYscl));
        }
      }
    }

    const recursiveGenNetTfmAry = (root)=>
    {
      const flatAry = [];

      const iterate = (obj)=>
      {
        genNetTfmAry(obj);
        if (obj.type === "GRP")    // find Obj2Ds to draw
        {
          if (typeof Sphere != "undefined" && obj instanceof Sphere) 
            obj.calcShading();
          if (typeof TextOnPath != "undefined" && (obj instanceof TextOnPath))
            obj.formatTextOnPath(this); // populate the Group with 1 char Text objects
          obj.children.forEach((childNode)=>{
            iterate(childNode);
          });
        }
        else
        {
          flatAry.push(obj);       // just push into the array to be drawn
        }
      }
      // now propagate the current grpXfm through the tree of children
      iterate(root);

      return flatAry;
    }

  	const recursiveNetTfmAryReset = (obj)=>
  	{
   	  if (obj.type === "GRP")
      {
        obj.netTfmAry.length = 0;
        obj.children.forEach((childNode)=>{
          recursiveNetTfmAryReset(childNode);
        });
      }
  	}

    const handleDnD = (pathObj)=>{
      // update dragNdrop layer to match this canvas
      const currLr = getLayer(this);
      if (currLr !== pathObj.dragNdrop.layer)
      {
        if (pathObj.dragNdrop.layer)  // if not the first time rendered
        {
          // remove the object reference from the old layer
          const aidx = pathObj.dragNdrop.layer.dragObjects.indexOf(pathObj);
          if (aidx !== -1)
          {
            pathObj.dragNdrop.layer.dragObjects.splice(aidx, 1);
          }
        }
      }
      pathObj.dragNdrop.cgo = this;
      pathObj.dragNdrop.layer = currLr;
      // now push it into Cango.dragObjects array, its checked by canvas mousedown event handler
      if (!pathObj.dragNdrop.layer.dragObjects.includes(pathObj))
      {
        pathObj.dragNdrop.layer.dragObjects.push(pathObj);
      }
    }

// ============ Start Here =====================================================

    if (!types.includes(rootObj.type))
    {
      console.warn("Type Error: render argument 1");
      return;
    }
    if (clear === true || clear === "clear")
    {
      this.clearCanvas();
    }
    // recursively apply transforms returning the family tree flattened to an array of Obj2D
    const objAry = recursiveGenNetTfmAry(rootObj);
    // now render the Obj2Ds onto the canvas
    objAry.forEach((obj)=>{

      const imgLoaded = ()=>{ 
        obj.formatImg(this); // 'this' will be the Cango object
        genNetTfmMatrix(obj);
        this.paintImg(obj);
        obj.netTfmAry = [];   // safe to reset netTfmAry it has been used
        if (obj.dragNdrop !== null)
        {
          initDragAndDrop(this);
          handleDnD(obj);
        }
      }

      if (obj.type === "IMG")
      {
        if (obj.imgBuf.complete || obj.imgBuf instanceof HTMLCanvasElement)    // see if already loaded
        {
          imgLoaded();
        }
        else
        {
          obj.imgBuf.addEventListener('load', imgLoaded);
        }
        return;
      }

      if (obj.type === "TEXT")
      {
        obj.formatText(this);
        genNetTfmMatrix(obj);
        this.paintText(obj);
        obj.netTfmAry = [];

        if (obj.dragNdrop !== null)
        {
          initDragAndDrop(this);
          handleDnD(obj);
        }
     
        return;
      }
      if (obj.type === "CLIP")
      {
        genNetTfmMatrix(obj);
        this.applyClipMask(obj);
        obj.netTfmAry = [];
        return;
      }
      // "PATH" or "SHAPE"
      genNetTfmMatrix(obj);
      this.paintPath(obj);
      obj.netTfmAry = [];
      if (obj.dragNdrop !== null)
      {
        initDragAndDrop(this);
        handleDnD(obj);
      }

    });
    // all rendering done so recursively reset the dynamic transforms
    recursiveNetTfmAryReset(rootObj);
    this.resetClip();         // clear all active masks
  };

  function matrixTransformPoint(px, py, m)
  {
    return {x:px*m.a + py*m.c + m.e, y:px*m.b + py*m.d + m.f};
  }

  Cango.prototype.genLinGradPX = function(lgrad, tfm)
  {
    const p1x = lgrad.grad.x1,
          p1y = lgrad.grad.y1,
          p2x = lgrad.grad.x2,
          p2y = lgrad.grad.y2,
          tp1 = matrixTransformPoint(p1x, p1y, tfm),
          tp2 = matrixTransformPoint(p2x, p2y, tfm);

    const grad = this.ctx.createLinearGradient(tp1.x, tp1.y, tp2.x, tp2.y);
    lgrad.colorStops.forEach((colStop)=>{
      grad.addColorStop(colStop.stop, colStop.color);
    });

    return grad;
  };

  Cango.prototype.genRadGradPX = function(rgrad, tfm, scl=1)
  {
    const p1x = rgrad.grad.x1,
          p1y = rgrad.grad.y1,
          r1 = rgrad.grad.r1*scl,
          p2x = rgrad.grad.x2,
          p2y = rgrad.grad.y2,
          r2 = rgrad.grad.r2*scl,
          tp1 = matrixTransformPoint(p1x, p1y, tfm),
          tp2 = matrixTransformPoint(p2x, p2y, tfm);
    
    const grad = this.ctx.createRadialGradient(tp1.x, tp1.y, r1, tp2.x, tp2.y, r2);
    rgrad.colorStops.forEach((colStop)=>{
      grad.addColorStop(colStop.stop, colStop.color);
    });

    return grad;
  };

  Cango.prototype.paintImg = function(imgObj)
  {
    // should only be called after image has been loaded into imgBuf
    const img = imgObj.imgBuf;  // this is the place the image is stored in object

    this.ctx.save();   // save raw pixels context, defaukt styles no dropShadow
    this.ctx.setTransform(imgObj.netTfm.a, imgObj.netTfm.b, imgObj.netTfm.c, imgObj.netTfm.d, imgObj.netTfm.e, imgObj.netTfm.f);

    this.dropShadow(imgObj);  // set up dropShadow if any
    // now insert the image canvas ctx will apply transforms (width etc in WC)
    this.ctx.drawImage(img, imgObj.srcX, imgObj.srcY, imgObj.srcWid, imgObj.srcHgt, imgObj.imgLorgX, imgObj.imgLorgY, imgObj.width, imgObj.height);
    if (imgObj.border)
    {
      this.dropShadow(); // clear dropShadow, dont apply to the border (it will be on top of fill)
      // create the path to stroke with transforms applied to Path2D, not to canvas, else lineWidth scales non-iso!
      imgObj.pthCmds.p2dPX = new Path2D();
      imgObj.pthCmds.p2dPX.addPath(imgObj.pthCmds.p2dWC, imgObj.netTfm);
      this.ctx.restore();   // revert to raw pixels ready to stroke border
      this.ctx.save();      // save context with default styles 
      if (!this.yDown)
      {
        // if image flipped for RHC, flip context back so gradient fills are not flipped
        imgObj.netTfm.scaleSelf(1, -1);  
      }
      const col = imgObj.strokeCol || this.strokeColDef;
      let stkCol = col;
      if (col instanceof LinearGradient)
      {
        stkCol = this.genLinGradPX(col, imgObj.netTfm);
      }
      else if (col instanceof RadialGradient)
      {
        stkCol = this.genRadGradPX(col, imgObj.netTfm, imgObj.savScale*this.xscl);
      }
      if (imgObj.lineWidthWC)
      {
        this.ctx.lineWidth = imgObj.lineWidthWC*imgObj.savScale*this.xscl;   // lineWidth in world coords so scale to px
      }
      else
      {
        this.ctx.lineWidth = imgObj.lineWidth || this.lineWidthDef; 
      }
      this.ctx.strokeStyle = stkCol;
      // if properties are undefined use Cango default
      this.ctx.lineCap = imgObj.lineCap || this.lineCapDef;
      this.ctx.lineJoin = imgObj.lineJoin || this.lineJoinDef;
      this.ctx.stroke(imgObj.pthCmds.p2dPX);
    }
    this.ctx.restore();    // back to raw pixels and default styles
  };

  Cango.prototype.paintPath = function(pathObj)
  {
    // used for type: PATH, SHAPE
    if (!pathObj.pthCmds.length)
    {
      console.warn("Type Error: render Path/Shape descriptor");
      return;
    }
    // set up all the colors
    let col = pathObj.fillCol || this.fillColDef;
    let filCol = col;
    if (col instanceof LinearGradient)
    {
      filCol = this.genLinGradPX(col, pathObj.netTfm);
    }
    else if (col instanceof RadialGradient)
    {
      filCol = this.genRadGradPX(col, pathObj.netTfm, pathObj.savScale*this.xscl);
    }

    col = pathObj.strokeCol || this.strokeColDef;
    let stkCol = col;
    if (col instanceof LinearGradient)
    {
      stkCol = this.genLinGradPX(col, pathObj.netTfm);
    }
    else if (col instanceof RadialGradient)
    {
      stkCol = this.genRadGradPX(col, pathObj.netTfm, pathObj.savScale*this.xscl);
    }
    this.ctx.save();   // save raw pixel context
    // apply the transforms and map from world to pixel coords
    pathObj.pthCmds.p2dPX = new Path2D();
    pathObj.pthCmds.p2dPX.addPath(pathObj.pthCmds.p2dWC, pathObj.netTfm);   // scale to pixels to use for stroke()
    this.ctx.restore();  // back to raw pixels
    
    this.ctx.save();   // save default sytles, still raw pixels
    this.dropShadow(pathObj);    // set up dropShadow if any
    if (pathObj.type === "SHAPE")
    {
      this.ctx.fillStyle = filCol;
      if (pathObj.clearFlag)
      {
        this.ctx.save();  
        this.ctx.globalCompositeOperation = "destination-out";  // clear canvas inside the pathObj
        this.ctx.fill(pathObj.pthCmds.p2dPX, pathObj.fillRule);
        //=============================================================================
        // Workaround for Chrome/Edge bug: "ragged edge on destination-out fill"
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke(); 
        //=============================================================================
        this.ctx.restore();
      }
      else
      {
        this.ctx.fill(pathObj.pthCmds.p2dPX, pathObj.fillRule);
      }
    }

    if ((pathObj.type === "PATH") || pathObj.border)
    {
      if (pathObj.border) // drop shadows for Path not border
      {
        // if Shape with border clear any drop shadow so not rendered twice
        this.dropShadow(); 
      }
      // handle dashed lines
      if (Array.isArray(pathObj.dashed) && pathObj.dashed.length)
      {
        this.ctx.setLineDash(pathObj.dashed);
        this.ctx.lineDashOffset = pathObj.dashOffset || 0;
      }
      // support for zoom and pan changing line width
      if (pathObj.lineWidthWC)
      {
        this.ctx.lineWidth = pathObj.lineWidthWC*pathObj.savScale*this.xscl;   // lineWidth in world coords so scale to px
      }
      else
      {
        this.ctx.lineWidth = pathObj.lineWidth || this.lineWidthDef; // lineWidth in pixels
      }
      this.ctx.strokeStyle = stkCol;
      this.ctx.lineCap = pathObj.lineCap || this.lineCapDef;
      this.ctx.lineJoin = pathObj.lineJoin || this.lineJoinDef;
      this.ctx.stroke(pathObj.pthCmds.p2dPX);
      this.ctx.setLineDash([]);   // clean up dashes (they are not reset by save/restore)
      this.ctx.lineDashOffset = 0;
    }
    this.ctx.restore();  // back to default styles, still raw pixels
  };

  Cango.prototype.applyClipMask = function(maskObj)
  {
    // if empty array was passed as mask definition then reset clip to full canvas
    if (!maskObj.pthCmds.length)
    {
      this.resetClip();
      return;
    }

    this.ctx.save();   // save context which has no clip mask (not restored locally)
    this.clipCount += 1;
    maskObj.pthCmds.p2dPX = new Path2D();
    maskObj.pthCmds.p2dPX.addPath(maskObj.pthCmds.p2dWC, maskObj.netTfm);   // scaled to pixels for raw canvas coords
    this.ctx.clip(maskObj.pthCmds.p2dPX, maskObj.fillRule);  // activate the clip mask, context is raw pixels default styles
    //============================================================================================
    // Workaround for Firefox 52 bug: "clip doesn't clip radial gradient fills"
    this.ctx.save();      // save context which default styles
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.0)";
    this.ctx.fillRect(0,0,1,1);   // any fill call will do
    this.ctx.restore();   // restore default sytyles
    //============================================================================================
  };

  Cango.prototype.resetClip = function()
  {
    // always called at end of render to ensure no stray clip masks
    while (this.clipCount > 0)
    {
      this.ctx.restore();   // restore raw pixel, default style saved at line 2818 
      this.clipCount--;
    }
  };

  Cango.prototype.genLinGradWC = function(lgrad)
  {
    const grad = this.ctx.createLinearGradient(lgrad.grad.x1, lgrad.grad.y1*this.isoYscl, 
                                               lgrad.grad.x2, lgrad.grad.y2*this.isoYscl);
    lgrad.colorStops.forEach((colStop)=>{
      grad.addColorStop(colStop.stop, colStop.color);
    });

    return grad;
  };

  Cango.prototype.genRadGradWC = function(rgrad)
  {
    const grad = this.ctx.createRadialGradient(rgrad.grad.x1, rgrad.grad.y1*this.isoYscl, rgrad.grad.r1, 
                                               rgrad.grad.x2, rgrad.grad.y2*this.isoYscl, rgrad.grad.r2);
    rgrad.colorStops.forEach((colStop)=>{
      grad.addColorStop(colStop.stop, colStop.color);
    });
    return grad;
  };

  Cango.prototype.paintText = function(txtObj)
  {
    // if Obj2D fontWeight or fontSize undefined use Cango default
    const fntWt = txtObj.fontWeight || this.fontWeightDef,
          fntFm = txtObj.fontFamily || this.fontFamilyDef,
          fntSz = txtObj.fontSizeZC;        // font size in pixels corrected for any zoom scaling factor
  
    // set up the fill and stroke colors, gradients will be rendered in world coords 
    let col = txtObj.strokeCol || this.strokeColDef;
    let stkCol = col;
    if (col instanceof LinearGradient)
    {
      stkCol = this.genLinGradWC(col);
    }
    else if (col instanceof RadialGradient)
    {
      stkCol = this.genRadGradWC(col); 
    }

    col = txtObj.fillCol || this.fillColDef;
    let filCol = col;
    if (col instanceof LinearGradient)
    {
      filCol = this.genLinGradWC(col);
    }
    else if (col instanceof RadialGradient)
    {
      filCol = this.genRadGradWC(col); 
    }

    let bkgCol;
    if (txtObj.bgFillColor)  // leave bkg = undefined if no bgFillColor set
    {
      col = txtObj.bgFillColor;
      if (typeof col === "string")
      {
        bkgCol = txtObj.bgFillColor;
      }
      else if (col instanceof LinearGradient)
      {
        bkgCol = this.genLinGradWC(col);
      }
      else if (col instanceof RadialGradient)
      {
        bkgCol = this.genRadGradWC(col); 
      }
    }
  
    this.ctx.save();   // save raw canvas no transforms no dropShadow
    this.ctx.setTransform(txtObj.netTfm.a, txtObj.netTfm.b, txtObj.netTfm.c, txtObj.netTfm.d, txtObj.netTfm.e, txtObj.netTfm.f);
    // if a bgFillColor is specified then fill the bounding box before rendering the text
    if (bkgCol)
    {
      // create the bounding box path
      this.ctx.save();
      this.ctx.fillStyle = bkgCol;
      this.ctx.strokeStyle = bkgCol;
      this.ctx.lineWidth = 0.10*fntSz;  // expand by 5% (10% width gives 5% outside outline)
      this.ctx.fill(txtObj.pthCmds.p2dWC);
      this.ctx.stroke(txtObj.pthCmds.p2dWC); // stroke the outline

      this.ctx.restore();
    }
    // now draw the text in world coords
    this.ctx.font = fntWt+" "+fntSz+"px "+fntFm;
    this.ctx.fillStyle = filCol;
    this.ctx.fillText(txtObj.txtStr, txtObj.imgLorgX, txtObj.imgLorgY); // imgLorgX,Y are in pixels for text
    if (txtObj.border)
    {
      this.dropShadow(); // clear dropShadow, dont apply to the border (it will be on top of fill)
      // support for zoom and pan changing lineWidth
      if (txtObj.lineWidthWC)
      {
        this.ctx.lineWidth = txtObj.lineWidthWC*this.xscl;
      }
      else
      {
        this.ctx.lineWidth = txtObj.lineWidth || this.lineWidthDef;
      }
      // if properties are undefined use Cango default
      this.ctx.strokeStyle = stkCol;
      this.ctx.lineCap = txtObj.lineCap || this.lineCapDef;
      this.ctx.lineJoin = txtObj.lineJoin || this.lineJoinDef;
      this.ctx.strokeText(txtObj.txtStr, txtObj.imgLorgX, txtObj.imgLorgY);
    }
    this.ctx.restore();  // back to raw pixels and default styles
  };

  Cango.prototype.drawPath = function(pathDef, options)
  {
    const pathObj = new Path(pathDef, options);

    this.render(pathObj);
  };

  Cango.prototype.drawShape = function(pathDef, options)
  {
    // outline the same as fill color
    const pathObj = new Shape(pathDef, options);

    this.render(pathObj);
  };

  Cango.prototype.drawText = function(str, options)
  {
    const txtObj = new Text(str, options);

    this.render(txtObj);
  };

  Cango.prototype.drawImg = function(imgRef, options)  // just load img then call render
  {
    const imgObj = new Img(imgRef, options);

    this.render(imgObj);
  };

  Cango.prototype.clearShape = function(pathDef, options)
  {
    // outline the same as fill color
    const pathObj = new Shape(pathDef, options);

    // set the clear flag for paintShape
    pathObj.clearFlag = true;
    this.render(pathObj);
  };

  Cango.prototype.createLayer = function()
  {
    const w = this.rawWidth,
          h = this.rawHeight,
          nLyrs = this.bkgCanvas.layers.length;  // bkg is layer 0 so at least 1

    // do not create layers on overlays or offscreen canvases - only an background canvases
    if (this.cgoType === "OVL" || this.cgoType === "OS")
    {
      // this is an overlay canvas - can't have overlays itself
      console.log("createLayer: offscreen canvases and layers cannot create layers");
      return "";
    }

    const ovlId = this.cId+"_ovl_"+this.getUnique();
    const ovlHTML = "<canvas id='"+ovlId+"' style='position:absolute' width='"+w+"' height='"+h+"'></canvas>";
    const topCvs = this.bkgCanvas.layers[nLyrs-1].cElem;  // eqv to this.cnvs.layers since only bkgCanavs can get here
    topCvs.insertAdjacentHTML('afterend', ovlHTML);
    const newCvs = document.getElementById(ovlId);
    newCvs.style.backgroundColor = "transparent";
    newCvs.style.left = (this.bkgCanvas.offsetLeft+this.bkgCanvas.clientLeft)+'px';
    newCvs.style.top = (this.bkgCanvas.offsetTop+this.bkgCanvas.clientTop)+'px';
    // make it the same size as the background canvas
    newCvs.style.width = this.bkgCanvas.offsetWidth+'px';
    newCvs.style.height = this.bkgCanvas.offsetHeight+'px';
    const newL = new Layer(ovlId, newCvs);
    // save the ID in an array to facilitate removal
    this.bkgCanvas.layers.push(newL);

    return ovlId;    // return the new canvas id for call to new Cango(id)
  };

  Cango.prototype.deleteLayer = function(ovlyId)
  {
    for (let i=1; i<this.bkgCanvas.layers.length; i++)
    {
      if (this.bkgCanvas.layers[i].id === ovlyId)
      {
        let ovlNode = this.bkgCanvas.layers[i].cElem;
        if (ovlNode)
        {
          // in case the CangoHTMLtext extension is used
          if (ovlNode.alphaOvl && ovlNode.alphaOvl.parentNode)
          {
            ovlNode.alphaOvl.parentNode.removeChild(ovlNode.alphaOvl);
          }
          ovlNode.parentNode.removeChild(ovlNode);
        }
        // now delete layers array element
        this.bkgCanvas.layers.splice(i,1);       // delete the id
      }
    }
  };

  Cango.prototype.deleteAllLayers = function()
  {
    for (let i = this.bkgCanvas.layers.length-1; i>0; i--)   // don't delete layers[0] its the bkg canvas
    {
      let ovlNode = this.bkgCanvas.layers[i].cElem;
      if (ovlNode)
      {
        // in case the CangoHTMLtext extension is used
        if (ovlNode.alphaOvl && ovlNode.alphaOvl.parentNode)
        {
          ovlNode.alphaOvl.parentNode.removeChild(ovlNode.alphaOvl);
        }
        ovlNode.parentNode.removeChild(ovlNode);
      }
      // now delete layers array element
      this.bkgCanvas.layers.splice(i,1);
    }
  };

  // copy the basic graphics context values (for an overlay)
  Cango.prototype.dupCtx = function(src_graphCtx)
  {
    // copy all the graphics context parameters into the overlay ctx.
    this.vpOrgXWC = src_graphCtx.vpOrgXWC;    // gridbox origin X in World Coords
    this.vpOrgYWC = src_graphCtx.vpOrgYWC;    // gridbox origin Y in World Coords
    this.spanX = src_graphCtx.spanX;          // gridbox width in World Coords
    this.spanY = src_graphCtx.spanY;          // gridbox height in World Coords
    this.vpW = src_graphCtx.vpW;              // gridbox (viewport) width in pixels
    this.vpH = src_graphCtx.vpH;              // gridbox height in pixels
    this.vpOrgYsvg = src_graphCtx.vpOrgYsvg;  // needed when switching between RHC and SVG and back
    this.vpOrgYrhc = src_graphCtx.vpOrgYrhc;  //   "
    this.vpOrgX = src_graphCtx.vpOrgX;        // gridbox origin X in pixels
    this.vpOrgY = src_graphCtx.vpOrgY;        // gridbox origin Y in pixels 
    this.xscl = src_graphCtx.xscl;            // world x axis scale factor
    this.yscl = src_graphCtx.yscl;            // world y axis scale factor
    this.yDown = src_graphCtx.yDown;          // set by setWorldCoordsRHC or setWorldCoordsSVG to signal coord system
    this.xoffset = src_graphCtx.xoffset;      // world x origin offset from viewport left in pixels
    this.yoffset = src_graphCtx.yoffset;      // world y origin offset from viewport bottom in pixels
    this.savWC = clone(src_graphCtx.savWC);
    this.strokeColDef = src_graphCtx.strokeColDef.slice(0);   // copy value not reference
    this.lineWidthDef = src_graphCtx.lineWidthDef;        // pixels
    this.lineCapDef = src_graphCtx.lineCapDef.slice(0);
    this.lineJoinDef = src_graphCtx.lineJoinDef.slice(0);
    this.fillColDef = src_graphCtx.fillColDef.slice(0);
    this.fontSizeDef = src_graphCtx.fontSizeDef;
    this.fontWeightDef = src_graphCtx.fontWeightDef;
    this.fontFamilyDef = src_graphCtx.fontFamilyDef.slice(0);
  };

  /*==========================================================
   * 'initZoomPan' creates a Cango context on the overlay
   * canvas whose ID is passed as 'zpControlId'.
   * All the Cango context that is to be zoomed or panned
   * is passed in 'gc'. 'gc' may be an array of Cango contexts
   * if more than one canvas layer needs zooming.
   * The user defined function 'redraw' will be called to
   * redraw all the Cobjs on all the canvases in the new
   * zoomed or panned size or position.
   *---------------------------------------------------------*/
  initZoomPan = function(zpControlsId, gc, redraw)
  {
    const gAry = (Array.isArray(gc))? gc : [gc],
          arw = ['m',-7,-2,'l',7,5,7,-5],
          crs = ['m',-6,-6,'l',12,12,'m',0,-12,'l',-12,12],
          pls = ['m',-7,0,'l',14,0,'m',-7,-7,'l',0,14],
          mns = ['m',-7,0,'l',14,0];

    function zoom(z)
    {
      gAry.forEach((g)=>{
        const org = g.toPixelCoords(0, 0),
              cx = g.rawWidth/2 - org.x,
              cy = g.rawHeight/2 - org.y;

        g.xoffset += cx - cx/z;
        g.yoffset += cy - cy/z;
        g.xscl /= z;
        g.yscl /= z;
      });
      redraw();
    }

    function pan(sx, sy)
    {
      gAry.forEach((g)=>{
        g.xoffset -= sx;
        g.yoffset -= sy;
      });
      redraw();
    }

    function resetZoomPan()
    {
      gAry.forEach((g)=>{
        g.xscl = g.savWC.xscl;
        g.yscl = g.savWC.yscl;
        g.xoffset = g.savWC.xoffset;
        g.yoffset = g.savWC.yoffset;
      });
      redraw();
    }

    const zpGC = new Cango(zpControlsId);
    // Zoom controls
    zpGC.clearCanvas();
    zpGC.setWorldCoordsRHC(-zpGC.rawWidth+44,-zpGC.rawHeight+44);

    // make a shaded rectangle for the controls
    zpGC.drawShape(rectangle(114, 80), {x:-17, y:0, fillColor: "rgba(0, 50, 0, 0.12)"});

    const rst = new Shape(rectangle(20, 20, 2), {fillColor:"rgba(0,0,0,0.2)"});
    rst.enableDrag(null, null, resetZoomPan);
    zpGC.render(rst);

    const rgt = new Shape(rectangle(20, 20, 2), {x:22, y:0, fillColor:"rgba(0,0,0,0.2)"});
    // must always enable DnD before rendering !
    rgt.enableDrag(null, null, function(){pan(50, 0);});
    zpGC.render(rgt);

    const up = new Shape(rectangle(20, 20, 2), {x:0, y:22, fillColor:"rgba(0,0,0,0.2)"});
    up.enableDrag(null, null, function(){pan(0, -50);});
    zpGC.render(up);

    const lft = new Shape(rectangle(20, 20, 2), {x:-22, y:0, fillColor:"rgba(0,0,0,0.2)"});
    lft.enableDrag(null, null, function(){pan(-50, 0);});
    zpGC.render(lft);

    const dn = new Shape(rectangle(20, 20, 2), {x:0, y:-22, fillColor:"rgba(0,0,0,0.2)"});
    dn.enableDrag(null, null, function(){pan(0, 50);});
    zpGC.render(dn);

    const zin = new Shape(rectangle(20, 20, 2), {x:-56, y:11, fillColor:"rgba(0,0,0,0.2)"});
    zin.enableDrag(null, null, function(){zoom(1/1.2);});
    zpGC.render(zin);

    const zout = new Shape(rectangle(20, 20, 2), {x:-56, y:-11, fillColor:"rgba(0,0,0,0.2)"});
    zout.enableDrag(null, null, function(){zoom(1.2);});
    zpGC.render(zout);

    zpGC.drawPath(arw, {x:0, y:22, strokeColor:"white", lineWidth:2});
    zpGC.drawPath(arw, {degs:-90, x:22, y:0, strokeColor:"white", lineWidth:2});
    zpGC.drawPath(arw, {degs:90, x:-22, y:0, strokeColor:"white", lineWidth:2});
    zpGC.drawPath(arw, {degs:180, x:0, y:-22, strokeColor:"white", lineWidth:2});
    zpGC.drawPath(pls, {x:-56, y:11, strokeColor:"white", lineWidth:2});
    zpGC.drawPath(mns, {x:-56, y:-11, strokeColor:"white", lineWidth:2});
    zpGC.drawPath(crs, {strokeColor:"white", lineWidth:2});
  };

}());
