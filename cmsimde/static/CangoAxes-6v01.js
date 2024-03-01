/*===================================================================
  Filename: CangoAxes-6v01.js
  Rev 6
  By: Dr A.R.Collins

  Requires Cango-15 or greater
  Description: Adds these drawing methods to Cango core:
    drawAxes
    drawBoxAxes 
    drawArrow 
    drawArrowArc
    drawHTMLText
    drawSciNotationText
    drawVectorText
  Also adds the global utility functions:
    sprintf, 
    toEngFixed, 
    toEngPrec, 
    toEngNotation, 
    toSciNotation

  License: Released into the public domain
  link to latest version at
  <http://www/arc.id.au/CanvasGraphics.html>
  Report bugs to tony(at)arc.id.au

  Date    Description                                            |By
  -------------------------------------------------------------------
  30Apr14 First beta                                              ARC
  11May14 Released as CangoAxes-1v00                              ARC
  08Feb15 Update to use Cango Ver 6                               ARC
  12Mar17 Update to use Cango Ver 9                               ARC
  28Mar17 Released as CangoAxes-2v00                              ARC
  08Jul17 Added drawVectorText as Cango method                    ARC
  10Jul17 Released as CangoAxes-3v00                              ARC
  12Jul17 Flip the Vector text if yDown is true                   ARC
  15Jul17 bugfix: vectorText lineCap must be "round"              ARC
  17Jun17 Update to use Cango Ver 11                              ARC
  30Oct17 bugfix: toEngPrec                                       ARC
  01Jun18 bugfix: maxX and maxY labels going past end of axis     ARC
  05Jun18 Avoid infinite 'while' loops: use 'for' loop
          and return ticStep=undefined for with bad Min, Mmax     ARC
  09Jun10 Use 1.0000001 allowance for floats noise error    ARC
  20Jul17 Update to use Cango Ver 12
          Released as CangoAxes-4v00                              ARC
  15May19 Remove 10ths and allow power over-ride in engNotation
          Set default values for fontSize etc                     
          Made gaps to labels relative to fontSize                ARC
  16May19 Added space between label and units
          Changed default font to Arial
          Use fontSize as the offset unit (not pixels)            ARC
  17May19 Measure tick label length to posiiton axis labels
          bugfix: tick labels on wrong side if y axis on right    ARC
  23May19 Added drawSciNotationText, toSciNotation                ARC
  25May19 Added preText % postText to drawSciNotationText         ARC
  26May19 Use inward ticks on side axes
          Allow single axis drawing                               ARC
  28May19 Add support for "out" ticks, default is "in"            ARC
  29May19 Released as CangoAxes Ver 5                             ARC
  29May19 bugfix: validate AxisTicsManual input
          bugfix: don't seek last label if lblStep=0              ARC
  04Jun19 Added support for "revXdirection" option                ARC
  05Jun19 bugfix: x labels on wrong side if SVG & bottom half     ARC
  17Jun19 Use const and let
          Build array of minor and major tics to clarify last tic ARC
  18Jun19 Use forEach and reduce to aviod ugly loop checks        ARC
  27Jun19 Take more care with const                               ARC
  22Jul19 Update to use Cango-15 or later                         ARC
  07Aug19 Add yet another patch against math noise                ARC
  12Aug19 Released as CangoAxes-6v00                              ARC
  24Aug19 bugfix: gridColor option not being honored              ARC
 ====================================================================*/

var sprintf, toEngFixed, toEngPrec, toEngNotation, toSciNotation;

Cango = (function(CangoCore)
{
  "use strict";
  toEngFixed = function(val, decPlaces)      // rounds to X dec places and no stripping of 0s
  {
    const unit = "pnum kMGT";
    let man = 0,
        exp = 0,
        str = "";

    if ((decPlaces === undefined)||(decPlaces<0)||(decPlaces>10))
    {
      decPlaces = 2;
    }
    if (Math.abs(val)>1.0E-12)
    {
      exp = Math.floor(Math.log(Math.abs(val))/(3.0*Math.LN10));
      man = val/Math.pow(1000.0, exp);
      exp *= 3;
    }
    // now force round to decPlaces
    str = man.toFixed(decPlaces);
    // now add the symbol for the exponent
    return str+unit.charAt(exp/3+4);
  };

  toEngPrec = function(val, sigFigs, showPlus)      // rounds to X significant figures, maintains returned string length
  {
    const unit = "pnum kMGT";
    let man = 0, 
        delta,
        exp = 0,
        str = "";

    if ((sigFigs === undefined)||(sigFigs<3)||(sigFigs>10))
    {
      sigFigs = 3;
    }
    delta = 1+Math.pow(10, -sigFigs);
    if (Math.abs(val)>1.0E-12)
    {
      exp = Math.floor(Math.log(Math.abs(delta*val))/(3.0*Math.LN10));
      man = val/Math.pow(1000.0, exp);
      exp *= 3;
    }
    // now force round to sigFigs
    str = man.toPrecision(sigFigs);
    if (man >= 0)  // add a space for the "-" sign so string length is constant regardless of the number
    {
      str = (showPlus)? "+"+str:  " "+str;
    }
    if (str.indexOf(".") === -1)   // no decimal just 3 digits, add a leading space to maintain string length
    {
      return " "+str+unit.charAt(exp/3+4); // adding the symbol for the exponent
    }
    else
    {
      return str+unit.charAt(exp/3+4);
    }
  };

  toEngNotation = function(val, exponent)        // rounds to 2 dec places and strips trailing 0s
  {
    const unit = "pnum kMGT";
    const retObj = {};
    let man = 0,
        exp = 0,
        manStr = "",
        expStr = "";

    if (Math.abs(val)>1.0E-12)  // 0 is special man = 0, exp = ""
    {
      if (exponent !== undefined && (exponent % 3 == 0))  // a forced exponent must be multiple of 3
      {
        exp = exponent;
        man = val/Math.pow(10.0, exp);
      }
      else
      {
        exp = Math.floor(Math.log(Math.abs(val))/(3.0*Math.LN10));  // alow exponent over-ride
        man = val/Math.pow(1000.0, exp);
        exp *= 3;
      }
    }
    // now force round to decPlaces
    manStr = man.toFixed(2);
    // now strip trailing 0s
    while (manStr.charAt(manStr.length-1) === '0')
    {
      manStr = manStr.substring(0,manStr.length-1);
    }
    if (manStr.charAt(manStr.length-1) === '.')
    {
      manStr = manStr.substring(0,manStr.length-1);
    }
    // now get the symbol for the exponent
    if (exp)
    {
      expStr = unit.charAt(exp/3+4);
    }

    retObj.man = parseFloat(manStr);
    retObj.manStr = manStr;
    retObj.exp = exp;
    retObj.expStr = expStr;

    return retObj;
  };

  toSciNotation = function(val, exponent)        // rounds to 2 dec places and strips trailing 0s
  {
    const retObj = {};
    let man = 0,
        exp = 0,
        manStr,
        expStr;
  
    if (Math.abs(val)>1.0E-12)
    {
      if (exponent !== undefined)
      {
        exp = exponent;
      }
      else
      {
        exp = Math.floor(Math.log(Math.abs(val))/Math.LN10);  // alow exponent over-ride
      }
      man = val/Math.pow(10.0, exp);
    }
    // now force round to decPlaces
    manStr = man.toFixed(2);
    // now strip trailing 0s
    while (manStr.charAt(manStr.length-1) === '0')
    {
      manStr = manStr.substring(0, manStr.length-1);
    }
    if (manStr.charAt(manStr.length-1) === '.')  // don't end with deciamal point
    {
      manStr = manStr.substring(0, manStr.length-1);
    }
    expStr = exp.toString();
  
    retObj.man = parseFloat(manStr);
    retObj.manStr = manStr;
    retObj.exp = exp;
    retObj.expStr = expStr;

    return retObj;
  };
  
  function AxisTicsAuto(mn, mx, majorStep)
  {
    /* Calculate the tic mark spacing for graph plotting
     * Given the minimum and maximum values of the axis
     * returns the first tic value and the tic spacing.
     * The algorithm gives tic spacing of 1, 2, 5, 10, 20 etc
     * and a number of ticks from ~5 to ~11
     */
    let mj = majorStep || 0,   // may be number, "auto", or undefined
        pwr, 
        spanman, spanexp, 
        stepval, stepman, stepexp;

    this.tic1 = undefined;
    this.ticStep = undefined;   // avoid ticStep = 0 to avoid stepping by zero creating infinite loops
    this.lbl1 = undefined;
    this.lblStep = undefined;
    this.minTics = [];
    this.majTics = [];

    if (mn>=mx)
    {
      console.error("Axes Ticks: Max must be greater than Min");
      return;
    }

    pwr = Math.log(mx-mn)/Math.LN10;
    if (pwr<0.0)
    {
      spanexp = Math.floor(pwr) - 1;
    }
    else
    {
      spanexp = Math.floor(pwr);
    }
    spanman = (mx-mn)/Math.pow(10.0, spanexp);
    if(spanman>=5.5)
    {
      spanexp += 1;
      spanman /= 10.0;
    }
    stepman = 0.5;
    if(spanman<2.2)
    {
      stepman = 0.2;
    }
    if(spanman<1.1)
    {
      stepman = 0.1;
    }
    stepexp = 3*Math.floor(spanexp/3);
    if((spanexp < 0)&&(spanexp%3 !== 0))
    {
      stepexp -= 3;
    }
    stepval = stepman*Math.pow(10.0, (spanexp-stepexp));
    this.ticStep = stepval*Math.pow(10.0, stepexp);

    if(mn>=0.0)
    {
      this.tic1 = (Math.floor((mn/this.ticStep)-0.01)+1)*this.ticStep;   // avoid math noise
    }
    else
    {
      this.tic1 = -Math.floor((-mn/this.ticStep)+0.01)*this.ticStep;   // avoid math noise
    }

    // Calc the step size between major/labeled tics, it must be a multiple of ticStep
    if (mj === "auto")
    {
      this.lblStep = (stepman === 0.2)? this.ticStep*5: this.ticStep*2;
    }
		else if (mj)
		{
			this.lblStep = this.ticStep*Math.round(mj/this.ticStep);
		}
    const dx = 0.001*this.ticStep;
    if (this.lblStep)
    {
      this.lbl1 = this.lblStep*Math.ceil((mn-dx)/this.lblStep);
    }
    // build the tic arrays
    for (let i=0, x=this.tic1; x<mx+0.000000001; x+=this.ticStep)
    {
      let str = "";
      if (Math.abs(x-(this.lbl1+i*this.lblStep)) < 0.0001*this.ticStep )
      {
        if (Math.abs(x)<0.000000001) 
          x = 0;
        str = x.toPrecision(4);
        this.majTics.push(parseFloat(str));
        i++;
      }
      else
      {
        if (Math.abs(x)<0.000000001) 
          x = 0;
        str = x.toPrecision(4);
        this.minTics.push(parseFloat(str));
      }
    }
  }

  function AxisTicsManual(xmin, xmax,	xMn, xMj)
	{
    this.tic1 = undefined;
    this.ticStep = undefined;
    this.lbl1 = undefined;
    this.lblStep = undefined;
    this.minTics = [];
    this.majTics = [];

    // check for valid inputs, limit ticks to 1 < tickStep < 50
		if (xmin===undefined || xmax===undefined || xMn===undefined || xMn < (xmax-xmin)/50 || xMn >= (xmax-xmin))
    {
			return;
    }

		const dx = 0.01*xMn;
		this.tic1 = xMn*Math.ceil((xmin-dx)/xMn);
    this.ticStep = xMn;

		if (xMj !== undefined && xMj >= xMn && xMj < (xmax-xmin))
		{
			this.lblStep = this.ticStep*Math.round(xMj/xMn);
			this.lbl1 = this.lblStep*Math.ceil((xmin-dx)/this.lblStep);
    }

    for (let i=0, x=this.tic1; x<xmax+0.00000001; x+=this.ticStep)
    {
      if (Math.abs(x-(this.lbl1+i*this.lblStep)) < 0.0001*this.ticStep )
      {
        this.majTics.push(x);
        i++;
      }
      else
      {
        this.minTics.push(x);
      }
    }
	}

  function setPropertyValue(propertyName, value)
  {
    if ((typeof propertyName !== "string")||(value === undefined))  // null is OK, forces default
    {
      return;
    }
    switch (propertyName.toLowerCase())
    {
      case "xonly":
        if (value === true || value === "true")
        {
          this.xonly = true;
        }
        break;
      case "yonly":
        if (value === true || value === "true")
        {
          this.yonly = true;
        }
        break;
      case "xorigin":
        this.xOrg = value;
        break;
      case "yorigin":
        this.yOrg = value;
        break;
      case "xmin":
        this.xMin = value;
        break;
      case "xmax":                 // for backward compatability
        this.xMax = value;
        break;
      case "ymin":
        this.yMin = value;
        break;
      case "ymax":
        this.yMax = value;
        break;
      case "xunits":
        if (typeof value === "string")
        {
          this.xUnits = value;
        }
        break;
      case "yunits":
        if (typeof value === "string")
        {
          this.yUnits = value;
        }
        break;
      case "xlabel":
      case "xaxislabel":
        if (typeof value === "string")
        {
          this.xLabel = value;
        }
        break;
      case "ylabel":
      case "yaxislabel":
        if (typeof value === "string")
        {
          this.yLabel = value;
        }
        break;
      case "xtickinterval":
      case "xminortickinterval":
        this.xMinTic = value;
        break;
      case "ytickinterval":
      case "yminortickinterval":
        this.yMinTic = value;
        break;
      case "xlabelinterval":
      case "xmajortickinterval":
        this.xMajTic = value;
        break;
      case "ylabelinterval":               
      case "ymajortickinterval":
        this.yMajTic = value;
        break;
      case "tickdirection":
        if (value === "out")  // defaults to "in"
        {
          this.tickDir = value;
        }
        break;
      case "strokecolor":
        this.strokeColor = value;
        break;
      case "fillcolor":
        this.fillColor = value;
        break;
      case "fontsize":
        this.fontSize = Math.abs(value);
        break;
      case "fontweight":
        if (typeof value === "string" || ((typeof value === "number")&&(value>=100)&&(value<=900)))
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
      case "revxdirection":
        if (value === true || value === "true")
        {
          this.revX = true;
        }
        break;
      default:
        return;
    }
  }

  function setBoxAxesProperties(propertyName, value)
  {
    if ((typeof propertyName !== "string")||(value === undefined))  // null is OK, forces default
    {
      return;
    }
    switch (propertyName.toLowerCase())
    {
      case "xunits":
        if (typeof value === "string")
        {
          this.xUnits = value;
        }
        break;
      case "yunits":
        if (typeof value === "string")
        {
          this.yUnits = value;
        }
        break;
      case "title":
        if (typeof value === "string")
        {
          this.title = value;
        }
        break;
      case "xtickinterval":
        this.xMinTic = value;
        break;
      case "ytickinterval":
        this.yMinTic = value;
        break;
      case "strokecolor":
        this.strokeColor = value;
        break;
      case "fillcolor":
        this.fillColor = value;
        break;
      case "gridcolor":
        this.gridColor = value;
        break;
      case "fontsize":
        this.fontSize = Math.abs(value);
        break;
      case "fontweight":
        if (typeof value === "string"||(typeof value === "number" && value>=100 && value<=900))
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
      default:
        return;
    }
  }

  CangoCore.prototype.drawAxes = function(xMin, xMax, yMin, yMax, options)
  {
    const savThis = this,
          opts = (typeof options === 'object')? options: {},   // avoid undeclared object errors
          parms = {
          xonly: false,
          yonly: false,
          xOrg: undefined,
          yOrg: undefined,
          xMinTic: "auto",
          yMinTic: "auto",
          xMajTic: "auto",
          yMajTic: "auto",
          tickDir: "in",
          xUnits: "",
          yUnits: "",
          xLabel: "",
          yLabel: "",
          strokeColor: "dimgray",
          fillColor: "black",
          fontSize: 11,
          fontWeight: "normal",
          fontFamily: "Arial, Verdana",
          revX: false,
          setProperty: setPropertyValue };
    let ticLen,
        majTicLen,
        lorg = 1,
        side = 1,                // 1 or -1 depending on the side of the axis to label
        tickObj, lftTick, rgtTick, midTick,
        majTickObj, lftMajTick, rgtMajTick, midMajTick,
        revXorg,
        ll, ur,
        xmin, xmax, ymin, ymax,
        fntStyle,
        exWid, exHgt;            // char dimensions
  
    function getTextWidth(txt, styleStr)
    {
      let wid = 0;

      savThis.ctx.save();
      savThis.ctx.font = styleStr;
      wid = savThis.ctx.measureText(txt).width;  // width in pixels
      savThis.ctx.restore();

      return wid;
    }

    function buildXaxis()
    {  
      var x;
      let xTkLbOfs = 0.8*exHgt/savThis.yscl,   // convert pixel lengths to world coords
          xAxLbOfs = 1.9*exHgt/savThis.yscl,   
          xL = "", 
          xU = "",
          xTics,
          lastx;
      
      if ((parms.xMinTic === undefined)||(parms.xMinTic === null)||(parms.xMinTic === "auto"))  // xMinTic===0 means no x ticks
      {
        xTics = new AxisTicsAuto(xmin, xmax, parms.xMajTic);
      }
      else
      {
        xTics = new AxisTicsManual(xmin, xmax, parms.xMinTic, parms.xMajTic);
      }
      // draw axis
      savThis.drawPath(['M', xmin, parms.yOrg, 'L', xmax, parms.yOrg], {
        lineWidth:1.5,
        lineCap:"round",
        strokeColor:parms.strokeColor
      });

      // X axis tick marks
      if (xTics.ticStep)
      {
        if (parms.yOrg == yMin) // x axes at ymin, use inward ticks
        {
          tickObj = (parms.tickDir == "out")? rgtTick: lftTick;
          majTickObj = (parms.tickDir == "out")? rgtMajTick: lftMajTick;
        }
        else if (parms.yOrg == yMax)  // x axes at ymax, use inward ticks
        {
          tickObj = (parms.tickDir == "out")? lftTick: rgtTick;
          majTickObj = (parms.tickDir == "out")? lftMajTick: rgtMajTick;
        }
        else  // x axes somewhere internal, use cross ticks
        {
          tickObj = midTick;
          majTickObj = midMajTick;
          xTkLbOfs *= 1.3;    // allow for half tick being on same side as label
        }

        xTics.minTics.forEach(function(x){
          let xpos = (parms.revX)? xmin+(xmax-x): x;
          tickObj.rotate(90);
          tickObj.translate(xpos, parms.yOrg);
          savThis.render(tickObj);     // maintain aspect ratio, rotate 90deg
        });
        xTics.majTics.forEach(function(x){
          let xpos = (parms.revX)? xmin+(xmax-x): x;
          majTickObj.rotate(90);
          majTickObj.translate(xpos, parms.yOrg);
          savThis.render(majTickObj);
        });
      }
      
      // label X axis major ticks (only if lblStep !-- 0)
      if (xTics.lblStep)
      {
        // calc x exponent of last tick and use for all label values
        lastx = toEngNotation(xTics.minTics[xTics.minTics.length-1]);
        // X axis, decide whether to label above or below X axis
        if (savThis.yDown)  // SVG
        {
          if (parms.yOrg<ymin+0.55*(ymax-ymin))
          {   // x axis in top half of screen
            side = 1;
            lorg = 8;
          }
          else  // bottom half
          {
            side = -1;
            lorg = 2;
          }
        }
        else // RHC
        {
          if (parms.yOrg < ymin + 0.55*(ymax - ymin))
          {   // x axis on bottom half of screen
            side = -1;
            lorg = 2;
          }
          else
          {
            side = 1;
            lorg = 8;
          }
        }
        if (parms.tickDir == "out" && (parms.yOrg == ymin || parms.yOrg == ymax))
        { // ticks will be between axis and label, make gap bigger
          xTkLbOfs += 0.6*ticLen*savThis.xscl/savThis.yscl;
        }     
        xTics.majTics.forEach(function(x){
          // skip label at the origin if it would be on the other axis
          if ((x == parms.xOrg && parms.yOrg>ymin && parms.yOrg<ymax)
           || (x == revXorg && parms.yOrg>ymin && parms.yOrg<ymax)) 
          {
            return;
          }
          let xpos = (parms.revX)? xmin+(xmax-x): x;
          savThis.drawText(toEngNotation(x, lastx.exp).manStr, {
            x: xpos,
            y: parms.yOrg - side*xTkLbOfs,
            lorg: lorg,
            fillColor: parms.fillColor,
            fontSize: parms.fontSize,
            fontWeight: parms.fontWeight,
            fontFamily: parms.fontFamily });
        });
      }

      // X axis label and units
      if (savThis.yDown)
      {
        if (parms.yOrg<ymin+0.55*(ymax-ymin))
        {
          side = 1;
          if ((revXorg != xmin && revXorg != xmax)&& parms.yOrg != ymax)
          { // label xmax
            lorg = 9;
            x = xmax;
          }
          else
          {  // label center
            lorg = 8;
            x = (xmin+xmax)/2;
          }
        }
        else
        {
          side = -1;
          if ((revXorg != xmin && revXorg != xmax)&& parms.yOrg != ymin)
          { // label xmax
            lorg = 3;
            x = xmax;
          }
          else
          {  // label center
            lorg = 2;
            x = (xmin+xmax)/2;
          }
        }
      }
      else
      {
        if (parms.yOrg<ymin+0.55*(ymax-ymin))
        {
          side = -1;
          if ((revXorg != xmin && revXorg != xmax)&& parms.yOrg != ymin)
          { // label xmax
            lorg = 3;
            x = xmax;
          }
          else
          {  // label center
            lorg = 2;
            x = (xmin+xmax)/2;
          }
        }
        else
        {
          side = 1;
          if ((revXorg != xmin && revXorg != xmax)&& parms.yOrg != ymax)
          { // label xmax
            lorg = 9;
            x = xmax;
          }
          else
          {  // label center
            lorg = 8;
            x = (xmin+xmax)/2;
          }
        }
      }

      xL = xL+parms.xLabel;
      if (!xTics.lblStep)  // we may have an axis label and no tick labels or units
      {
        if (xL.length>0)
        {
          savThis.drawText(xL, {
            x: x, 
            y: parms.yOrg - side*xAxLbOfs,
            lorg: lorg,
            fillColor: parms.fillColor,
            fontSize: parms.fontSize*1.1,
            fontWeight: parms.fontWeight,
            fontFamily: parms.fontFamily });
        }
        return;
      }
      xAxLbOfs += 1.2*xTkLbOfs;
      if (parms.xUnits.length>0) // add units if we have any
      {
        xL = xL+" ("+lastx.expStr+parms.xUnits+")";
        savThis.drawText(xL, {
          x: x, 
          y: parms.yOrg - side*xAxLbOfs,
          lorg: lorg,
          fillColor: parms.fillColor,
          fontSize: parms.fontSize*1.1,
          fontWeight: parms.fontWeight,
          fontFamily: parms.fontFamily });
      }   
      else   // we have no units, use scientific notation
      { 
        xU = toSciNotation(10, lastx.exp);  // object 
        if (xU.expStr == "0") // dont draw sciNotation units if 10^0 
        {
          if (xL.length>0) // just draw the xlabel (if any)
          {
            savThis.drawText(xL, {
              x: x, 
              y: parms.yOrg - side*xAxLbOfs,
              lorg: lorg,
              fillColor: parms.fillColor,
              fontSize: parms.fontSize*1.1,
              fontWeight: parms.fontWeight,
              fontFamily: parms.fontFamily });
          }
        }
        else  // we have sciNotation units to draw (not == 10^0)
        {
          savThis.drawSciNotationText(10, xU.expStr, {
            x: x, 
            y: parms.yOrg - side*xAxLbOfs,
            preText: xL+"  \uff08",     // prepend the axis label + "("
            postText: "\uff09",         // append ")"
            lorg: lorg,
            fillColor: parms.fillColor,
            fontSize: parms.fontSize*1.1,
            fontWeight: parms.fontWeight,
            fontFamily: parms.fontFamily });
        }
      }
    }

    function buildYaxis()
    {
      var y;
      let yTkLbOfs = 0.8*exWid/savThis.xscl,
          yAxLbOfs = 1.1*exWid/savThis.xscl,  // add label length etc later
          yL = "", 
          yU = "",
          yTics,
          lasty;   

      if ((parms.yMinTic === undefined)||(parms.yMinTic === null)||(parms.yMinTic === "auto"))  // yMinTic===0 means no y ticks
      {
        yTics = new AxisTicsAuto(ymin, ymax, parms.yMajTic);
      }
      else
      {
        yTics = new AxisTicsManual(ymin, ymax, parms.yMinTic, parms.yMajTic);
      }
      // draw axis
      savThis.drawPath(['M', revXorg, ymin, 'L', revXorg, ymax], {
        lineWidth:1.5,
        lineCap:"round",
        strokeColor:parms.strokeColor
      });

      // Y axis tick marks
      if (yTics.ticStep)
      {
        if (revXorg == xMin) // y axes at xmin, use inward ticks
        {
          tickObj = (parms.tickDir == "out")? rgtTick: lftTick;
          majTickObj = (parms.tickDir == "out")? rgtMajTick: lftMajTick;
        }
        else if (revXorg == xMax)  // y axes at xmax, use inward ticks
        {
          tickObj = (parms.tickDir == "out")? lftTick: rgtTick;
          majTickObj = (parms.tickDir == "out")? lftMajTick: rgtMajTick;
        }
        else  // y axes somewhere internal, use cross ticks
        {
          tickObj = midTick;
          majTickObj = midMajTick;
          yTkLbOfs *= 1.3;    // allow for half tick being on same side as label
        }

        yTics.minTics.forEach(function(y){
          tickObj.translate(revXorg, y);
          savThis.render(tickObj);
        })
        yTics.majTics.forEach(function(y){
          majTickObj.translate(revXorg, y);
          savThis.render(majTickObj);
        })
      }

      // Y axis major tick labels (only if lblStep !-- 0)
      if (yTics.lblStep)
      {
        // calc x exponent of last tick and use for all label values
        lasty = toEngNotation(yTics.minTics[yTics.minTics.length-1]);
        // Y axis, decide whether to label to right or left of Y axis
        if (revXorg < xmin+0.5*(xmax-xmin))
        {  // y axis on left half of screen
          side = -1;
          lorg = 6;
        }
        else
        {
          side = +1;
          lorg = 4;
        }

        if (parms.tickDir == "out" && (revXorg == xmin || revXorg > xmax*0.999999))
        { // ticks will be between axis and label, make gap bigger
          yTkLbOfs += ticLen/2;
        } 

        yTics.majTics.forEach(function(y){
          // skip label at the origin if it would be on the other axis
          if (y == parms.yOrg && revXorg > xmin && revXorg < xmax)
          {
            return;
          } 
          savThis.drawText(toEngNotation(y, lasty.exp).manStr, {
            x:revXorg + side*yTkLbOfs,
            y:y,
            lorg:lorg,
            fillColor:parms.fillColor,
            fontSize:parms.fontSize,
            fontWeight:parms.fontWeight,
            fontFamily:parms.fontFamily});
        }); 
      }

      // Y axis label and units
      // Y axis, decide whether to label to right or left of Y axis
      if (revXorg < xmin+0.5*(xmax-xmin))
      {
        // y axis on left half of screen
        side = -1;
        if (parms.yOrg != ymin && parms.yOrg != ymax)
        { // label ymax
          lorg = (savThis.yDown)? 7: 9;
          y = ymax;
        }
        else
        { // label center
          lorg = 8;
          y = (ymin+ymax)/2;
        }
      }
      else
      {
        // y axis on right half of screen
        side = 1;
        if (parms.yOrg != ymin && parms.yOrg != ymax)
        { 
          lorg = (savThis.yDown)? 1: 3;
          y = ymax;
        }
        else
        { // label center
          lorg = 2;
          y = (ymin+ymax)/2;
        }
      }

      yL = yL+parms.yLabel;
      if (!yTics.lblStep)  // we may have an axis label and no tick labels or units
      {
        if (yL.length>0)
        {
          savThis.drawText(yL, {
            x: revXorg + side*yAxLbOfs, 
            y: y,
            degs: (savThis.yDown)? -90: 90,
            lorg:lorg,
            fillColor:parms.fillColor,
            fontSize:parms.fontSize*1.1,
            fontWeight:parms.fontWeight,
            fontFamily: parms.fontFamily });
        }
        return;
      }
      // we have ticks, find width of longest tick label to position axis label
      let maxWid = yTics.majTics.reduce(function(acc, curr){
        return Math.max(acc, getTextWidth(toEngNotation(curr, lasty.exp).manStr, fntStyle));
      }, 0);
      yAxLbOfs += maxWid/savThis.xscl;

      if (parms.tickDir == "out" && (revXorg == xmin || revXorg > xmax*0.999999))
      { // ticks will be between axis and label, make gap bigger
        yAxLbOfs += yTkLbOfs;
      } 
      if (parms.yUnits.length>0) // add units if we have any
      { 
        yL = yL+" ("+lasty.expStr+parms.yUnits+")";
        savThis.drawText(yL, {
          x: revXorg + side*yAxLbOfs, 
          y: y,
          degs: (savThis.yDown)? -90: 90,
          lorg:lorg,
          fillColor:parms.fillColor,
          fontSize:parms.fontSize*1.1,
          fontWeight:parms.fontWeight,
          fontFamily: parms.fontFamily });
      }
      else   // we have no units, use scientific notation
      { // use sciNotation
        yU = toSciNotation(10, lasty.exp);  // object 
        if (yU.expStr == "0") // dont draw if 10^0 
        {
          if (yL.length>0) // just draw the xlabel (if any)
          {
            savThis.drawText(yL, {
              x: revXorg + side*yAxLbOfs, 
              y: y,
              degs: (savThis.yDown)? -90: 90,
              lorg:lorg,
              fillColor:parms.fillColor,
              fontSize:parms.fontSize*1.1,
              fontWeight:parms.fontWeight,
              fontFamily: parms.fontFamily });
          }
        }
        else // we have sciNotation units to draw (not == 10^0)
        {
          savThis.drawSciNotationText(10, yU.expStr, {
            x: revXorg + side*yAxLbOfs, 
            y: y,
            preText: yL+"  \uff08",       // prepend the axis label + "("
            postText: "\uff09",           // append ")"
            degs: (savThis.yDown)? -90: 90,
            lorg:lorg,
            fillColor:parms.fillColor,
            fontSize:parms.fontSize*1.1,
            fontWeight:parms.fontWeight,
            fontFamily: parms.fontFamily });
        }
      }
    }

    // get WC of the gridbox to default to edge of plot area
    if (this.yDown) // SVG vpOrg is upper left of gridbox
    {
      ll = this.toWorldCoords(this.vpOrgX, this.vpOrgY+this.vpH);
      ur = this.toWorldCoords(this.vpOrgX+this.vpW, this.vpOrgY);
      ymin = (yMin === undefined)? ur.y : yMin;
      ymax = (yMax === undefined)? ll.y : yMax;
    }
    else // RHC vpOrg is lower left of gridbox
    {
      ll = this.toWorldCoords(this.vpOrgX, this.vpOrgY);
      ur = this.toWorldCoords(this.vpOrgX+this.vpW, this.vpOrgY-this.vpH); // px -ve UP the screen so -vpH
      ymin = (yMin === undefined)? ll.y : yMin;
      ymax = (yMax === undefined)? ur.y : yMax;
    }
    xmin = (xMin === undefined)? ll.x : xMin;
    xmax = (xMax === undefined)? ur.x : xMax;
    parms.yOrg = ymin;
    // check for all supported options
    for (let prop in opts)
    {
      // check that this is opts's own property, not inherited from prototype
      if (opts.hasOwnProperty(prop))
      {
        parms.setProperty(prop, opts[prop]);
      }
    }
    if (parms.xOrg === undefined)
    {
      parms.xOrg = (parms.revX)? xmax : xmin;
    }
    revXorg = (parms.revX)? xmin+(xmax-parms.xOrg) : parms.xOrg;

    // find the size of chars in the selected font
    fntStyle = parms.fontWeight+" "+parms.fontSize+"px "+parms.fontFamily;
    exWid = getTextWidth("X", fntStyle);
    exHgt = exWid;
    // draw all ticks defined in pixels and drawn in world coords (convert px/cgo.xscl with iso=true)
    ticLen = exWid/this.xscl;   
    majTicLen = 1.7*ticLen; 
    midTick = new Path(['M', -ticLen/3, 0, 'L', ticLen/3, 0], {
      iso:true,
      lineWidth:1.5,
      lineCap:"round",
      strokeColor:parms.strokeColor});
    midMajTick = new Path(['M', -majTicLen/3.5, 0, 'L', majTicLen/3.5, 0], {
      iso:true,
      lineWidth:1.5,
      lineCap:"round",
      strokeColor:parms.strokeColor});
    lftTick = new Path(['M', 0, 0, 'L', ticLen/2, 0], {
      iso:true,
      lineWidth:1.5,
      lineCap:"round",
      strokeColor:parms.strokeColor});
    lftMajTick = new Path(['M', 0, 0, 'L', majTicLen/2, 0], {
      iso:true,
      lineWidth:1.5,
      lineCap:"round",
      strokeColor:parms.strokeColor});
    rgtTick = new Path(['M', -ticLen/2, 0, 'L', 0, 0], {
      iso:true,
      lineWidth:1.5,
      lineCap:"round",
      strokeColor:parms.strokeColor});
    rgtMajTick = new Path(['M', -majTicLen/2, 0, 'L', 0, 0], {
      iso:true,
      lineWidth:1.5,
      lineCap:"round",
      strokeColor:parms.strokeColor});


    if (!parms.yonly)
      buildXaxis();
    if (!parms.xonly)
      buildYaxis();
  };

  CangoCore.prototype.drawBoxAxes = function(xMin, xMax, yMin, yMax, options)
  {
    const savThis = this,
          ticLen = 4/this.xscl,     // will be 4 when converted to pixels
          tickRot = (this.yDown)? -90: 90,
          parms = { xMinTic: "auto",
                    yMinTic: "auto",
                    xUnits: "",
                    yUnits: "",
                    title: "",
                    strokeColor: '#ffffff',
                    fillColor: '#cccccc',
                    gridColor: 'rgba(255,255,255,0.2)',
                    fontSize: 11,
                    fontWeight: null,
                    fontFamily: "Arial, Verdana",
                    setProperty: setBoxAxesProperties };
    let xTkLbOfs = 8/this.yscl,    // pixels
        yTkLbOfs = 8/this.xscl,    // pixels
        lbl, 
        lbl2 = "/div",
        xTics, 
        yTics;
  
    if (!this.yDown)
    {
      xTkLbOfs *= -1;
    }
    const opts = (typeof options === 'object')? options: {};   // avoid undeclared object errors
    // check for all supported options
    for (let prop in opts)
    {
      // check that this is opts's own property, not inherited from prototype
      if (opts.hasOwnProperty(prop))
      {
        parms.setProperty(prop, opts[prop]);
      }
    }

    const tickCmds = new Path(['M', 0, 0, 'L', -ticLen, 0], {"strokeColor":parms.strokeColor, 'iso':true});

    if ((!parms.xMinTic)||(parms.xMinTic === "auto"))
    {
      xTics = new AxisTicsAuto(xMin, xMax);
    }
    else
    {
      xTics = new AxisTicsManual(xMin, xMax, parms.xMinTic);
    }
    if ((!parms.yMinTic)||(parms.yMinTic === "auto"))
    {
      yTics = new AxisTicsAuto(yMin, yMax);
    }
    else
    {
      yTics = new AxisTicsManual(yMin, yMax, parms.yMinTic);
    }
		// Draw box axes
    const data = ['M', xMin, yMin, 'L', xMin, yMax, xMax, yMax, xMax, yMin, 'z'];
    this.drawPath(data, {strokeColor:parms.strokeColor});

    xTics.minTics.forEach(function(x){
  	  tickCmds.rotate(tickRot);
  	  tickCmds.translate(x, yMin);
      savThis.render(tickCmds);  // just draw the tick mark
      if ((x !== xMin)&&(x !== xMax))        // no dots on the box
      {
        savThis.drawPath(['M', x, yMin, 'L', x, yMax], {strokeColor:parms.gridColor});
      }
    });
    yTics.minTics.forEach(function(y){
  	  tickCmds.translate(xMin, y);
      savThis.render(tickCmds);      // just draw the tick mark
      if ((y !== yMin)&&(y !== yMax))
      {
        savThis.drawPath(['M', xMin, y, 'L', xMax, y], {strokeColor:parms.gridColor});
      }
    });
    
		// Now labels, X axis, label only first and last tic below X axis
    // get the exponent of the step size, use this for all label
    const xstep = toEngNotation(xTics.ticStep);  // tick step as engNotation obj
    this.drawText(toEngNotation(xTics.tic1, xstep.exp).manStr, {
      x: xTics.tic1,
      y: yMin - xTkLbOfs,
      fillColor:parms.fillColor,
      lorg: (this.yDown)? 7: 1,
      fontSize: parms.fontSize,
      fontWeight: parms.fontWeight,
      fontFamily: parms.fontFamily });
    // find the last tick
    const lastx = xTics.minTics[xTics.minTics.length-1];
    this.drawText(toEngNotation(lastx, xstep.exp).manStr, {
      x: lastx,
      y: yMin - xTkLbOfs,
      fillColor: parms.fillColor,
      lorg: (this.yDown)? 9: 3,
      fontSize: parms.fontSize,
      fontWeight: parms.fontWeight,
      fontFamily: parms.fontFamily });

    // x axis label  
    lbl = xstep.manStr+" "+xstep.expStr+parms.xUnits+"/div";
    this.drawText(lbl, {
      x: xMin+(xMax-xMin)/2,
      y: yMin - xTkLbOfs,
      fillColor: parms.fillColor,
      lorg: (this.yDown)? 8: 2,
      fontSize: parms.fontSize,
      fontWeight: parms.fontWeight,
      fontFamily: parms.fontFamily });

    // Y axis, label bottom and top tics to left of Y axis
    // get the exponent of the step size, use this for all label
    const ystep = toEngNotation(yTics.ticStep);
    this.drawText(toEngNotation(yTics.tic1, ystep.exp).manStr, {
      x: xMin - yTkLbOfs,
      y: yTics.tic1,
      fillColor: parms.fillColor,
      lorg: 6,
      fontSize: parms.fontSize,
      fontWeight: parms.fontWeight,
      fontFamily: parms.fontFamily });
    // find the last tick
    const lasty = yTics.minTics[yTics.minTics.length-1];
    this.drawText(toEngNotation(lasty, ystep.exp).manStr, {
      x: xMin - yTkLbOfs,
      y: lasty,
      fillColor: parms.fillColor,
      lorg: 6,
      fontSize: parms.fontSize,
      fontWeight: parms.fontWeight,
      fontFamily: parms.fontFamily });

    // y axis label
    lbl = ystep.manStr+" "+ystep.expStr+parms.yUnits;
    if (!this.yDown)
    {
      lbl2 = lbl.slice(0);       // copy lbl
      lbl = "/div";              // swap them
    }
    const ymid = yMin+(yMax-yMin)/2;
    this.drawText(lbl, {
      x: xMin - yTkLbOfs,
      y: ymid - xTkLbOfs,
      fillColor: parms.fillColor,
      lorg: 6,
      fontSize: parms.fontSize,
      fontWeight: parms.fontWeight,
      fontFamily: parms.fontFamily });
    this.drawText(lbl2, {
      x: xMin - yTkLbOfs,
      y: ymid + xTkLbOfs,
      fillColor: parms.fillColor,
      lorg: 6,
      fontSize: parms.fontSize,
      fontWeight: parms.fontWeight,
      fontFamily: parms.fontFamily });
    // title
    if (typeof parms.title === "string")
    {
      this.drawText(parms.title, {
        x: xMin,
        y: yMax + xTkLbOfs,
        fillColor: parms.fillColor,
        lorg: (this.yDown)? 1: 7,
        fontSize: parms.fontSize,
        fontWeight: parms.fontWeight,
        fontFamily: parms.fontFamily });
    }
	};

  CangoCore.prototype.drawHTMLText = function(str, options)
  {
    const opts = (typeof options === 'object')? options: {},   // avoid undeclared object errors
          xOfs = opts.x || 0,
          yOfs = opts.y || 0,
          txtCol = opts.fillColor || opts.fillcolor || this.penCol,
          size = opts.fontSize || opts.fontsize || this.fontSize,         // fontSize in pxs
          weight = opts.fontWeight || opts.fontweight || this.fontWeight, // weight in string or number 100..900
          family = opts.fontFamily || opts.fontFamily || this.fontFamily,
          deg = opts.degs || 0,
          lorgWC = ["", " transform-origin:0% 0%; transform: translate(0%,0%)",
          " transform-origin:50% 0%; transform: translate(-50%,0%)",
          " transform-origin:100% 0%; transform: translate(-100%,0%)",
          " transform-origin:0% 50%; transform: translate(0%,-50%)",
          " transform-origin:50% 50%; transform: translate(-50%,-50%)",
          " transform-origin:100% 50%; transform: translate(-100%,-50%)",
          " transform-origin:0% 100%; transform: translate(0%,-100%)",
          " transform-origin:50% 100%; transform: translate(-50%,-100%)",
          " transform-origin:100% 100%; transform: translate(-100%,-100%)"];
    let lorg = 1,
        styleTxt = "";

    function createHTMLoverlay(gc)
    {
      const ovlId = gc.cId+"_aovl_";
      const cvs = gc.cnvs;
      // create 1px square DIV place at top left to give position reference to HTML children
      const ovlHTML = "<div id='"+ovlId+"' style='position:absolute; width:1px; height:1px;'></div>";

      if (document.getElementById(ovlId))
      {
        let currOvl = document.getElementById(ovlId);
        currOvl.parentNode.removeChild(currOvl);
      }
      cvs.insertAdjacentHTML('afterend', ovlHTML);
      // make it the same size as the background canvas
      const newOvl = document.getElementById(ovlId);
      newOvl.style.backgroundColor = 'transparent';
      newOvl.style.left = gc.cnvs.offsetLeft+'px';
      newOvl.style.top = gc.cnvs.offsetTop+'px';
      newOvl.style.fontFamily = gc.fontFamily;
      newOvl.style.lineHeight = '1.4em';

      return newOvl;
    }

    if (typeof str !== 'string')
    {
      return;
    }
    if (document.getElementById(this.cId+"_aovl_") === null)
    {
      this.cnvs.alphaOvl = createHTMLoverlay(this);
    }
    if (typeof(opts.lorg) == "number" && [1,2,3,4,5,6,7,8,9].indexOf(opts.lorg) != -1)
    {
      lorg = opts.lorg;
    }

    const divNode = document.createElement("div");
    divNode.style.position = "absolute";
    divNode.style.backgroundColor = "transparent";
    // to calc label top position
    const p = this.toPixelCoords(xOfs, yOfs);
    // style the div depending of the lorg value eg set text-align to left right or center
    const topPx = p.y.toFixed(0);
    const leftPx = p.x.toFixed(0);
    styleTxt += "top:"+topPx+"px; left:"+leftPx+"px; color:"+txtCol+"; font-family:"+family+"; font-size:"+size+"px; font-weight:"+weight+";"+lorgWC[lorg];
    if (deg)
    {
      styleTxt += " rotate("+(-deg)+"deg); ";
    }

    divNode.style.cssText += styleTxt;
    divNode.innerHTML = str;
    this.cnvs.alphaOvl.appendChild(divNode);
  };

  /*-------------------------------------------------------------
   This text code is based on Jim Studt, CanvasTextFunctions
   see http://jim.studt.net/canvastext/
   It has been adapted to output Cgo2D format and has had Greek
   letters and a few symbols added to Hershey's original font
   -------------------------------------------------------------*/
  const hersheyFont = {};

  hersheyFont.letters = {
/*   */ ' ': {width:16, cdata:[]},
/* ! */ '!': {width:10, cdata:['M',5,21,'L',5,7,'M',5,2,'L',4,1,5,0,6,1,5,2]},
/* " */ '"': {width:16, cdata:['M',4,21,'L',4,14,'M',12,21,'L',12,14]},
/* # */ '#': {width:21, cdata:['M',11,25,'L',4,-7,'M',17,25,'L',10,-7,'M',4,12,'L',18,12,'M',3,6,'L',17,6]},
/* $ */ '$': {width:20, cdata:['M',8,25,'L',8,-4,'M',12,25,'L',12,-4,'M',17,18,'L',15,20,12,21,8,21,5,20,3,18,3,16,4,14,5,13,7,12,13,10,15,9,16,8,17,6,17,3,15,1,12,0,8,0,5,1,3,3]},
/* % */ '%': {width:24, cdata:['M',21,21,'L',3,0,'M',8,21,'L',10,19,10,17,9,15,7,14,5,14,3,16,3,18,4,20,6,21,8,21,10,20,13,19,16,19,19,20,21,21,'M',17,7,'L',15,6,14,4,14,2,16,0,18,0,20,1,21,3,21,5,19,7,17,7]},
/* & */ '&': {width:26, cdata:['M',23,12,'L',23,13,22,14,21,14,20,13,19,11,17,6,15,3,13,1,11,0,7,0,5,1,4,2,3,4,3,6,4,8,5,9,12,13,13,14,14,16,14,18,13,20,11,21,9,20,8,18,8,16,9,13,11,10,16,3,18,1,20,0,22,0,23,1,23,2]},
/* ' */ '\'': {width:10, cdata:['M',5,19,'L',4,20,5,21,6,20,6,18,5,16,4,15]},
/* ( */ '(': {width:14, cdata:['M',11,25,'L',9,23,7,20,5,16,4,11,4,7,5,2,7,-2,9,-5,11,-7]},
/* ) */ ')': {width:14, cdata:['M',3,25,'L',5,23,7,20,9,16,10,11,10,7,9,2,7,-2,5,-5,3,-7]},
/* * */ '*': {width:16, cdata:['M',8,15,'L',8,3,'M',3,12,'L',13,6,'M',13,12,'L',3,6]},
/* + */ '+': {width:26, cdata:['M',13,18,'L',13,0,'M',4,9,'L',22,9]},
/* , */ ',': {width:8, cdata:['M',5,4,'L',4,3,3,4,4,5,5,4,5,2,3,0]},
/* - */ '-': {width:26, cdata:['M',4,9,'L',22,9]},
/* . */ '.': {width:8, cdata:['M',4,5,'L',3,4,4,3,5,4,4,5]},
/* / */ '/': {width:22, cdata:['M',20,25,'L',2,-7]},
/* 0 */ '0': {width:20, cdata:['M',9,21,'L',6,20,4,17,3,12,3,9,4,4,6,1,9,0,11,0,14,1,16,4,17,9,17,12,16,17,14,20,11,21,9,21]},
/* 1 */ '1': {width:20, cdata:['M',6,17,'L',8,18,11,21,11,0]},
/* 2 */ '2': {width:20, cdata:['M',4,16,'L',4,17,5,19,6,20,8,21,12,21,14,20,15,19,16,17,16,15,15,13,13,10,3,0,17,0]},
/* 3 */ '3': {width:20, cdata:['M',5,21,'L',16,21,10,13,13,13,15,12,16,11,17,8,17,6,16,3,14,1,11,0,8,0,5,1,4,2,3,4]},
/* 4 */ '4': {width:20, cdata:['M',13,21,'L',3,7,18,7,'M',13,21,'L',13,0]},
/* 5 */ '5': {width:20, cdata:['M',15,21,'L',5,21,4,12,5,13,8,14,11,14,14,13,16,11,17,8,17,6,16,3,14,1,11,0,8,0,5,1,4,2,3,4]},
/* 6 */ '6': {width:20, cdata:['M',16,18,'L',15,20,12,21,10,21,7,20,5,17,4,12,4,7,5,3,7,1,10,0,11,0,14,1,16,3,17,6,17,7,16,10,14,12,11,13,10,13,7,12,5,10,4,7]},
/* 7 */ '7': {width:20, cdata:['M',17,21,'L',7,0,'M',3,21,'L',17,21]},
/* 8 */ '8': {width:20, cdata:['M',8,21,'L',5,20,4,18,4,16,5,14,7,13,11,12,14,11,16,9,17,7,17,4,16,2,15,1,12,0,8,0,5,1,4,2,3,4,3,7,4,9,6,11,9,12,13,13,15,14,16,16,16,18,15,20,12,21,8,21]},
/* 9 */ '9': {width:20, cdata:['M',16,14,'L',15,11,13,9,10,8,9,8,6,9,4,11,3,14,3,15,4,18,6,20,9,21,10,21,13,20,15,18,16,14,16,9,15,4,13,1,10,0,8,0,5,1,4,3]},
/* : */ ':': {width:8, cdata:['M',4,12,'L',3,11,4,10,5,11,4,12,'M',4,5,'L',3,4,4,3,5,4,4,5]},
/* ; */ ';': {width:8, cdata:['M',4,12,'L',3,11,4,10,5,11,4,12,'M',5,4,'L',4,3,3,4,4,5,5,4,5,2,3,0]},
/* < */ '<': {width:24, cdata:['M',20,18,'L',4,9,20,0]},
/* = */ '=': {width:26, cdata:['M',4,12,'L',22,12,'M',4,6,'L',22,6]},
/* > */ '>': {width:24, cdata:['M',4,18,'L',20,9,4,0]},
/* ? */ '?': {width:18, cdata:['M',3,16,'L',3,17,4,19,5,20,7,21,11,21,13,20,14,19,15,17,15,15,14,13,13,12,9,10,9,7,'M',9,2,'L',8,1,9,0,10,1,9,2]},
/* @ */ '@': {width:27, cdata:['M',18,13,'L',17,15,15,16,12,16,10,15,9,14,8,11,8,8,9,6,11,5,14,5,16,6,17,8,'M',12,16,'L',10,14,9,11,9,8,10,6,11,5,'M',18,16,'L',17,8,17,6,19,5,21,5,23,7,24,10,24,12,23,15,22,17,20,19,18,20,15,21,12,21,9,20,7,19,5,17,4,15,3,12,3,9,4,6,5,4,7,2,9,1,12,0,15,0,18,1,20,2,21,3,'M',19,16,'L',18,8,18,6,19,5]},
/* A */ 'A': {width:18, cdata:['M',9,21,'L',1,0,'M',9,21,'L',17,0,'M',4,7,'L',14,7]},
/* B */ 'B': {width:21, cdata:['M',4,21,'L',4,0,'M',4,21,'L',13,21,16,20,17,19,18,17,18,15,17,13,16,12,13,11,'M',4,11,'L',13,11,16,10,17,9,18,7,18,4,17,2,16,1,13,0,4,0]},
/* C */ 'C': {width:21, cdata:['M',18,16,'L',17,18,15,20,13,21,9,21,7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5]},
/* D */ 'D': {width:21, cdata:['M',4,21,'L',4,0,'M',4,21,'L',11,21,14,20,16,18,17,16,18,13,18,8,17,5,16,3,14,1,11,0,4,0]},
/* E */ 'E': {width:19, cdata:['M',4,21,'L',4,0,'M',4,21,'L',17,21,'M',4,11,'L',12,11,'M',4,0,'L',17,0]},
/* F */ 'F': {width:18, cdata:['M',4,21,'L',4,0,'M',4,21,'L',17,21,'M',4,11,'L',12,11]},
/* G */ 'G': {width:21, cdata:['M',18,16,'L',17,18,15,20,13,21,9,21,7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5,18,8,'M',13,8,'L',18,8]},
/* H */ 'H': {width:22, cdata:['M',4,21,'L',4,0,'M',18,21,'L',18,0,'M',4,11,'L',18,11]},
/* I */ 'I': {width:8, cdata:['M',4,21,'L',4,0]},
/* J */ 'J': {width:16, cdata:['M',12,21,'L',12,5,11,2,10,1,8,0,6,0,4,1,3,2,2,5,2,7]},
/* K */ 'K': {width:21, cdata:['M',4,21,'L',4,0,'M',18,21,'L',4,7,'M',9,12,'L',18,0]},
/* L */ 'L': {width:17, cdata:['M',4,21,'L',4,0,'M',4,0,'L',16,0]},
/* M */ 'M': {width:24, cdata:['M',4,21,'L',4,0,'M',4,21,'L',12,0,'M',20,21,'L',12,0,'M',20,21,'L',20,0]},
/* N */ 'N': {width:22, cdata:['M',4,21,'L',4,0,'M',4,21,'L',18,0,'M',18,21,'L',18,0]},
/* O */ 'O': {width:22, cdata:['M',9,21,'L',7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5,19,8,19,13,18,16,17,18,15,20,13,21,9,21]},
/* P */ 'P': {width:21, cdata:['M',4,21,'L',4,0,'M',4,21,'L',13,21,16,20,17,19,18,17,18,14,17,12,16,11,13,10,4,10]},
/* Q */ 'Q': {width:22, cdata:['M',9,21,'L',7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5,19,8,19,13,18,16,17,18,15,20,13,21,9,21,'M',12,4,'L',18,-2]},
/* R */ 'R': {width:21, cdata:['M',4,21,'L',4,0,'M',4,21,'L',13,21,16,20,17,19,18,17,18,15,17,13,16,12,13,11,4,11,'M',11,11,'L',18,0]},
/* S */ 'S': {width:20, cdata:['M',17,18,'L',15,20,12,21,8,21,5,20,3,18,3,16,4,14,5,13,7,12,13,10,15,9,16,8,17,6,17,3,15,1,12,0,8,0,5,1,3,3]},
/* T */ 'T': {width:16, cdata:['M',8,21,'L',8,0,'M',1,21,'L',15,21]},
/* U */ 'U': {width:22, cdata:['M',4,21,'L',4,6,5,3,7,1,10,0,12,0,15,1,17,3,18,6,18,21]},
/* V */ 'V': {width:18, cdata:['M',1,21,'L',9,0,'M',17,21,'L',9,0]},
/* W */ 'W': {width:24, cdata:['M',2,21,'L',7,0,'M',12,21,'L',7,0,'M',12,21,'L',17,0,'M',22,21,'L',17,0]},
/* X */ 'X': {width:20, cdata:['M',3,21,'L',17,0,'M',17,21,'L',3,0]},
/* Y */ 'Y': {width:18, cdata:['M',1,21,'L',9,11,9,0,'M',17,21,'L',9,11]},
/* Z */ 'Z': {width:20, cdata:['M',17,21,'L',3,0,'M',3,21,'L',17,21,'M',3,0,'L',17,0]},
/* [ */ '[': {width:14, cdata:['M',4,25,'L',4,-7,'M',5,25,'L',5,-7,'M',4,25,'L',11,25,'M',4,-7,'L',11,-7]},
/* \ */ '\\': {width:14, cdata:['M',0,21,'L',14,-3]},
/* ] */ ']': {width:14, cdata:['M',9,25,'L',9,-7,'M',10,25,'L',10,-7,'M',3,25,'L',10,25,'M',3,-7,'L',10,-7]},
/* ^ */ '^': {width:16, cdata:['M',8,23,'L',0,9,'M',8,23,'L',16,9]},
/* _ */ '_': {width:18, cdata:['M',0,-7,'L',18,-7]},
/* ` */ '`': {width:8, cdata:['M',5,16,'L',3,14,3,12,4,11,5,12,4,13,3,12]},
/* a */ 'a': {width:19, cdata:['M',15,14,'L',15,0,'M',15,11,'L',13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3]},
/* b */ 'b': {width:19, cdata:['M',4,21,'L',4,0,'M',4,11,'L',6,13,8,14,11,14,13,13,15,11,16,8,16,6,15,3,13,1,11,0,8,0,6,1,4,3]},
/* c */ 'c': {width:18, cdata:['M',15,11,'L',13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3]},
/* d */ 'd': {width:19, cdata:['M',15,21,'L',15,0,'M',15,11,'L',13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3]},
/* e */ 'e': {width:18, cdata:['M',3,8,'L',15,8,15,10,14,12,13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3]},
/* f */ 'f': {width:12, cdata:['M',10,21,'L',8,21,6,20,5,17,5,0,'M',2,14,'L',9,14]},
/* g */ 'g': {width:19, cdata:['M',15,14,'L',15,-2,14,-5,13,-6,11,-7,8,-7,6,-6,'M',15,11,'L',13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3]},
/* h */ 'h': {width:19, cdata:['M',4,21,'L',4,0,'M',4,10,'L',7,13,9,14,12,14,14,13,15,10,15,0]},
/* i */ 'i': {width:8, cdata:['M',3,21,'L',4,20,5,21,4,22,3,21,'M',4,14,'L',4,0]},
/* j */ 'j': {width:10, cdata:['M',5,21,'L',6,20,7,21,6,22,5,21,'M',6,14,'L',6,-3,5,-6,3,-7,1,-7]},
/* k */ 'k': {width:17, cdata:['M',4,21,'L',4,0,'M',14,14,'L',4,4,'M',8,8,'L',15,0]},
/* l */ 'l': {width:8, cdata:['M',4,21,'L',4,0]},
/* m */ 'm': {width:30, cdata:['M',4,14,'L',4,0,'M',4,10,'L',7,13,9,14,12,14,14,13,15,10,15,0,'M',15,10,'L',18,13,20,14,23,14,25,13,26,10,26,0]},
/* n */ 'n': {width:19, cdata:['M',4,14,'L',4,0,'M',4,10,'L',7,13,9,14,12,14,14,13,15,10,15,0]},
/* o */ 'o': {width:19, cdata:['M',8,14,'L',6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3,16,6,16,8,15,11,13,13,11,14,8,14]},
/* p */ 'p': {width:19, cdata:['M',4,14,'L',4,-7,'M',4,11,'L',6,13,8,14,11,14,13,13,15,11,16,8,16,6,15,3,13,1,11,0,8,0,6,1,4,3]},
/* q */ 'q': {width:19, cdata:['M',15,14,'L',15,-7,'M',15,11,'L',13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3]},
/* r */ 'r': {width:13, cdata:['M',4,14,'L',4,0,'M',4,8,'L',5,11,7,13,9,14,12,14]},
/* s */ 's': {width:17, cdata:['M',14,11,'L',13,13,10,14,7,14,4,13,3,11,4,9,6,8,11,7,13,6,14,4,14,3,13,1,10,0,7,0,4,1,3,3]},
/* t */ 't': {width:12, cdata:['M',5,21,'L',5,4,6,1,8,0,10,0,'M',2,14,'L',9,14]},
/* u */ 'u': {width:19, cdata:['M',4,14,'L',4,4,5,1,7,0,10,0,12,1,15,4,'M',15,14,'L',15,0]},
/* v */ 'v': {width:16, cdata:['M',2,14,'L',8,0,'M',14,14,'L',8,0]},
/* w */ 'w': {width:22, cdata:['M',3,14,'L',7,0,'M',11,14,'L',7,0,'M',11,14,'L',15,0,'M',19,14,'L',15,0]},
/* x */ 'x': {width:17, cdata:['M',3,14,'L',14,0,'M',14,14,'L',3,0]},
/* y */ 'y': {width:16, cdata:['M',2,14,'L',8,0,'M',14,14,'L',8,0,6,-4,4,-6,2,-7,1,-7]},
/* z */ 'z': {width:17, cdata:['M',14,14,'L',3,0,'M',3,14,'L',14,14,'M',3,0,'L',14,0]},
/* { */ '{': {width:14, cdata:['M',9,25,'L',7,24,6,23,5,21,5,19,6,17,7,16,8,14,8,12,6,10,'M',7,24,'L',6,22,6,20,7,18,8,17,9,15,9,13,8,11,4,9,8,7,9,5,9,3,8,1,7,0,6,-2,6,-4,7,-6,'M',6,8,'L',8,6,8,4,7,2,6,1,5,-1,5,-3,6,-5,7,-6,9,-7]},
/* | */ '|': {width:8, cdata:['M',4,25,'L',4,-7]},
/* } */ '}': {width:14, cdata:['M',5,25,'L',7,24,8,23,9,21,9,19,8,17,7,16,6,14,6,12,8,10,'M',7,24,'L',8,22,8,20,7,18,6,17,5,15,5,13,6,11,10,9,6,7,5,5,5,3,6,1,7,0,8,-2,8,-4,7,-6,'M',8,8,'L',6,6,6,4,7,2,8,1,9,-1,9,-3,8,-5,7,-6,5,-7]},
/* ~ */ '~': {width:24, cdata:['M',3,6,'L',3,8,4,11,6,12,8,12,10,11,14,8,16,7,18,7,20,8,21,10,'M',3,8,'L',4,10,6,11,8,11,10,10,14,7,16,6,18,6,20,7,21,10,21,12]},
/*      &deg; */ '\u00B0': {width:14, cdata:['M',6,21,'L',4,20,3,18,3,16,4,14,6,13,8,13,10,14,11,16,11,18,10,20,8,21,6,21]},
/*   &middot; */ '\u00B7': {width:5, cdata:['M',2,10,'L',2,9,3,9,3,10,2,10]},
/*    &times; */ '\u00D7': {width:22, cdata:['M',4,16,'L',18,2,'M',18,16,'L',4,2]},
/*   &divide; */ '\u00F7': {width:26, cdata:['M',13,18,'L',12,17,13,16,14,17,13,18,'M',4,9,'L',22,9,'M',13,2,'L',12,1,13,0,14,1,13,2]},
/*    &Alpha; */ '\u0391': {width:18, cdata:['M',9,21,'L',1,0,'M',9,21,'L',17,0,'M',4,7,'L',14,7]},
/*     &Beta; */ '\u0392': {width:21, cdata:['M',4,21,'L',4,0,'M',4,21,'L',13,21,16,20,17,19,18,17,18,15,17,13,16,12,13,11,'M',4,11,'L',13,11,16,10,17,9,18,7,18,4,17,2,16,1,13,0,4,0]},
/*    &Gamma; */ '\u0393': {width:17, cdata:['M',4,21,'L',4,0,'M',4,21,'L',16,21]},
/*    &Delta; */ '\u0394': {width:18, cdata:['M',9,21,'L',1,0,'M',9,21,'L',17,0,'M',1,0,'L',17,0]},
/*  &Epsilon; */ '\u0395': {width:19, cdata:['M',4,21,'L',4,0,'M',4,21,'L',17,21,'M',4,11,'L',12,11,'M',4,0,'L',17,0]},
/*     &Zeta; */ '\u0396': {width:20, cdata:['M',17,21,'L',3,0,'M',3,21,'L',17,21,'M',3,0,'L',17,0]},
/*      &Eta; */ '\u0397': {width:22, cdata:['M',4,21,'L',4,0,'M',18,21,'L',18,0,'M',4,11,'L',18,11]},
/*    &Theta; */ '\u0398': {width:22, cdata:['M',9,21,'L',7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5,19,8,19,13,18,16,17,18,15,20,13,21,9,21,'M',8,11,'L',14,11]},
/*     &Iota; */ '\u0399': {width:8, cdata:['M',4,21,'L',4,0]},
/*    &Kappa; */ '\u039A': {width:21, cdata:['M',4,21,'L',4,0,'M',18,21,'L',4,7,'M',9,12,'L',18,0]},
/*   &Lambda; */ '\u039B': {width:18, cdata:['M',9,21,'L',1,0,'M',9,21,'L',17,0]},
/*       &Mu; */ '\u039C': {width:24, cdata:['M',4,21,'L',4,0,'M',4,21,'L',12,0,'M',20,21,'L',12,0,'M',20,21,'L',20,0]},
/*       &Nu; */ '\u039D': {width:22, cdata:['M',4,21,'L',4,0,'M',4,21,'L',18,0,'M',18,21,'L',18,0]},
/*       &Xi; */ '\u039E': {width:18, cdata:['M',2,21,'L',16,21,'M',6,11,'L',12,11,'M',2,0,'L',16,0]},
/*  &Omicron; */ '\u039F': {width:22, cdata:['M',9,21,'L',7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5,19,8,19,13,18,16,17,18,15,20,13,21,9,21]},
/*       &Pi; */ '\u03A0': {width:22, cdata:['M',4,21,'L',4,0,'M',18,21,'L',18,0,'M',4,21,'L',18,21]},
/*      &Rho; */ '\u03A1': {width:21, cdata:['M',4,21,'L',4,0,'M',4,21,'L',13,21,16,20,17,19,18,17,18,14,17,12,16,11,13,10,4,10]},
/*    &Sigma; */ '\u03A3': {width:18, cdata:['M',2,21,'L',9,11,2,0,'M',2,21,'L',16,21,'M',2,0,'L',16,0]},
/*      &Tau; */ '\u03A4': {width:16, cdata:['M',8,21,'L',8,0,'M',1,21,'L',15,21]},
/*  &Upsilon; */ '\u03A5': {width:18, cdata:['M',2,16,'L',2,18,3,20,4,21,6,21,7,20,8,18,9,14,9,0,'M',16,16,'L',16,18,15,20,14,21,12,21,11,20,10,18,9,14]},
/*      &Phi; */ '\u03A6': {width:20, cdata:['M',10,21,'L',10,0,'M',8,16,'L',5,15,4,14,3,12,3,9,4,7,5,6,8,5,12,5,15,6,16,7,17,9,17,12,16,14,15,15,12,16,8,16]},
/*      &Chi; */ '\u03A7': {width:20, cdata:['M',3,21,'L',17,0,'M',3,0,'L',17,21]},
/*      &Psi; */ '\u03A8': {width:22, cdata:['M',11,21,'L',11,0,'M',2,15,'L',3,15,4,14,5,10,6,8,7,7,10,6,12,6,15,7,16,8,17,10,18,14,19,15,20,15]},
/*    &Omega; */ '\u03A9': {width:20, cdata:['M',3,0,'L',7,0,4,7,3,11,3,15,4,18,6,20,9,21,11,21,14,20,16,18,17,15,17,11,16,7,13,0,17,0]},
/*    &alpha; */ '\u03B1': {width:21, cdata:['M',9,14,'L',7,13,5,11,4,9,3,6,3,3,4,1,6,0,8,0,10,1,13,4,15,7,17,11,18,14,'M',9,14,'L',11,14,12,13,13,11,15,3,16,1,17,0,18,0]},
/*     &beta; */ '\u03B2': {width:19, cdata:['M',12,21,'L',10,20,8,18,6,14,5,11,4,7,3,1,2,-7,'M',12,21,'L',14,21,16,19,16,16,15,14,14,13,12,12,9,12,'M',9,12,'L',11,11,13,9,14,7,14,4,13,2,12,1,10,0,8,0,6,1,5,2,4,5]},
/*    &gamma; */ '\u03B3': {width:19, cdata:['M',1,11,'L',3,13,5,14,6,14,8,13,9,12,10,9,10,5,9,0,'M',17,14,'L',16,11,15,9,9,0,7,-4,6,-7]},
/*    &delta; */ '\u03B4': {width:18, cdata:['M',11,14,'L',8,14,6,13,4,11,3,8,3,5,4,2,5,1,7,0,9,0,11,1,13,3,14,6,14,9,13,12,11,14,9,16,8,18,8,20,9,21,11,21,13,20,15,18]},
/*  &epsilon; */ '\u03B5': {width:16, cdata:['M',13,12,'L',12,13,10,14,7,14,5,13,5,11,6,9,9,8,'M',9,8,'L',5,7,3,5,3,3,4,1,6,0,9,0,11,1,13,3]},
/*     &zeta; */ '\u03B6': {width:15, cdata:['M',10,21,'L',8,20,7,19,7,18,8,17,11,16,14,16,'M',14,16,'L',10,14,7,12,4,9,3,6,3,4,4,2,6,0,9,-2,10,-4,10,-6,9,-7,7,-7,6,-5]},
/*      &eta; */ '\u03B7': {width:20, cdata:['M',1,10,'L',2,12,4,14,6,14,7,13,7,11,6,7,4,0,'M',6,7,'L',8,11,10,13,12,14,14,14,16,12,16,9,15,4,12,-7]},
/*     &theta */ '\u03B8': {width:21, cdata:['M',12,21,'L',9,20,7,18,5,15,4,13,3,9,3,5,4,2,5,1,7,0,9,0,12,1,14,3,16,6,17,8,18,12,18,16,17,19,16,20,14,21,12,21,'M',4,11,'L',18,11]},
/*     &iota; */ '\u03B9': {width:11, cdata:['M',6,14,'L',4,7,3,3,3,1,4,0,6,0,8,2,9,4]},
/*    &kappa; */ '\u03BA': {width:18, cdata:['M',6,14,'L',2,0,'M',16,13,'L',15,14,14,14,12,13,8,9,6,8,5,8,'M',5,8,'L',7,7,8,6,10,1,11,0,12,0,13,1]},
/*   &lambda; */ '\u03BB': {width:16, cdata:['M',1,21,'L',3,21,5,20,6,19,14,0,'M',8,14,'L',2,0]},
/*       &mu; */ '\u03BC': {width:21, cdata:['M',7,14,'L',1,-7,'M',6,10,'L',5,5,5,2,7,0,9,0,11,1,13,3,15,7,'M',17,14,'L',15,7,14,3,14,1,15,0,17,0,19,2,20,4]},
/*       &nu; */ '\u03BD': {width:18, cdata:['M',3,14,'L',6,14,5,8,4,3,3,0,'M',16,14,'L',15,11,14,9,12,6,9,3,6,1,3,0]},
/*       &xi; */ '\u03BE': {width:16, cdata:['M',10,21,'L',8,20,7,19,7,18,8,17,11,16,14,16,'M',11,16,'L',8,15,6,14,5,12,5,10,7,8,10,7,12,7,'M',10,7,'L',6,6,4,5,3,3,3,1,5,-1,9,-3,10,-4,10,-6,8,-7,6,-7]},
/*  &omicron; */ '\u03BF': {width:17, cdata:['M',8,14,'L',6,13,4,11,3,8,3,5,4,2,5,1,7,0,9,0,11,1,13,3,14,6,14,9,13,12,12,13,10,14,8,14]},
/*       &pi; */ '\u03C0': {width:22, cdata:['M',9,14,'L',5,0,'M',14,14,'L',15,8,16,3,17,0,'M',2,11,'L',4,13,7,14,20,14]},
/*      &rho; */ '\u03C1': {width:18, cdata:['M',4,8,'L',4,5,5,2,6,1,8,0,10,0,12,1,14,3,15,6,15,9,14,12,13,13,11,14,9,14,7,13,5,11,4,8,0,-7]},
/*    &sigma; */ '\u03C3': {width:20, cdata:['M',18,14,'L',8,14,6,13,4,11,3,8,3,5,4,2,5,1,7,0,9,0,11,1,13,3,14,6,14,9,13,12,12,13,10,14]},
/*      &tau; */ '\u03C4': {width:20, cdata:['M',11,14,'L',8,0,'M',2,11,'L',4,13,7,14,18,14]},
/*  &upsilon; */ '\u03C5': {width:20, cdata:['M',1,10,'L',2,12,4,14,6,14,7,13,7,11,5,5,5,2,7,0,9,0,12,1,14,3,16,7,17,11,17,14]},
/*      &phi; */ '\u03C6': {width:22, cdata:['M',8,13,'L',6,12,4,10,3,7,3,4,4,2,5,1,7,0,10,0,13,1,16,3,18,6,19,9,19,12,17,14,15,14,13,12,11,8,9,3,6,-7]},
/*      &chi; */ '\u03C7': {width:18, cdata:['M',2,14,'L',4,14,6,12,12,-5,14,-7,16,-7,'M',17,14,'L',16,12,14,9,4,-2,2,-5,1,-7]},
/*      &psi; */ '\u03C8': {width:23, cdata:['M',16,21,'L',8,-7,'M',1,10,'L',2,12,4,14,6,14,7,13,7,11,6,6,6,3,7,1,9,0,11,0,14,1,16,3,18,6,20,11,21,14]},
/*    &omega; */ '\u03C9': {width:23, cdata:['M',8,14,'L',6,13,4,10,3,7,3,4,4,1,5,0,7,0,9,1,11,4,'M',12,8,'L',11,4,12,1,13,0,15,0,17,1,19,4,20,7,20,10,19,13,18,14]},
/* &thetasym; */ '\u03D1': {width:21, cdata:['M',1,10,'L',2,12,4,14,6,14,7,13,7,11,6,6,6,3,7,1,8,0,10,0,12,1,14,4,15,6,16,9,17,14,17,17,16,20,14,21,12,21,11,19,11,17,12,14,14,11,16,9,19,7]}
  };

  hersheyFont.strWidth = function(fontSize, str)
  {
    var total = 0,
        i, c;

    for (i=0; i<str.length; i++)
    {
    	c = hersheyFont.letters[str.charAt(i)];
    	if (c)
      {
        total += c.width;
      }
    }

    return total;
  };

  hersheyFont.stringToCgo2D = function(strg, x, y, fontSz, lorg)
  {
    const xOfs = x || 0,
          yOfs = y || 0,
          size = fontSz || 12,
          mag = size/33,    // size/33 is scale factor to give requested font size in pixels
          lorigin = lorg || 1;
    let lorgX, lorgY,
        charData,
        cgoData = [];

    function shiftChar(cAry, xof, yof, dx, dy, scl)    // cAry = Hershey Cgo2D array, d = shift required
    {
      const newAry = [];
      let x, y,
          j = 0;

      while (j<cAry.length)
      {
        if (typeof cAry[j] === "string")
        {
          newAry.push(cAry[j++]);      // push the command letter
        }
        x = xof + scl*(cAry[j++] + dx);   // j now index of x coord in x,y pair
        y = yof + scl*(cAry[j++] + dy);
        newAry.push(+x.toFixed(3), +y.toFixed(3));   // the '+' coverts string back to number
      }
      return newAry;
    }

    if (typeof strg !== 'string')
    {
      return {"cgoData": [], "width": 0, "height": 0};
    }
    /* Note: char cell is 33 pixels high, M char size is 21 pixels (0 to 21), descenders go from -7 to 21.
       to convert this data to fontSize (pixels) scale array data by fontSize/33.
       Reference height for vertically alignment is charHeight = 29 pixels. */
    const wid = this.strWidth(size, strg)
    const hgt = 29;           // default font size in pixels,  wid = string width in pixels
    const wid2 = wid/2;
    const hgt2 = hgt/2;
    const lorgWC = [0, [0, hgt],  [wid2, hgt],  [wid, hgt],
                   [0, hgt2], [wid2, hgt2], [wid, hgt2],
                   [0, 0],    [wid2, 0],    [wid, 0]];
    // calc lorg offset
    if (lorgWC[lorigin] !== undefined)  // check for out of bounds
    {
      lorgX = -lorgWC[lorigin][0];
      lorgY = -lorgWC[lorigin][1]+0.25*hgt;   // correct for alphabetic baseline, its offset about 0.25*char height ;
    }
    // sft is the shift to move each letter into place
    for (let i=0, sft=0, c; i<strg.length; i++)
    {
      c = hersheyFont.letters[strg.charAt(i)];
      if (c)
      {
        charData = shiftChar(c.cdata, xOfs, yOfs, sft+lorgX, lorgY, mag);
        sft += c.width;               // add character width to total
        cgoData = cgoData.concat(charData);   // make a single array of cgo2D for the whole string
      }
    }

    return {"cgoData": cgoData, "width": wid*mag, "height": hgt*mag, "weight":2.5*mag};
  };

  CangoCore.prototype.drawSciNotationText = function(manStr, expStr, options) 
  {
    const savThis = this;
    let   man = (typeof manStr === 'string')? manStr: manStr.toString();
    const exp = (typeof expStr === 'string')? expStr: expStr.toString(),
          opts = (typeof options === 'object')? options: {},   // avoid undeclared object errors
          // options honoured: fillColor, fontSize, fontWeight, fontFamily, lorg
          fntSz = opts.fontSize || opts.fontsize || this.fontSize,
          fntWt = opts.fontWeight || opts.fontweight || this.fontWeight, // weight in string or number 100..900
          fntFm = opts.fontFamily || opts.fontfamily || this.fontFamily, 
          txtCol = opts.fillColor || opts.fillcolor || this.penCol,
          bgColor = opts.bgFillColor || opts.bgfillcolor || null,
          preTxt = opts.preText || opts.pretext, 
          postTxt = opts.postText || opts.posttext, 
          x = opts.x || 0,
          y = opts.y || 0,
          scl = opts.scl || 1,
          degs = opts.degs || 0,
          lorg = opts.lorg || 7,
          txtGrp = new Group();
    let lorigin = 7,               // locate origin
        dx, dy, 
        expObj, postTxtObj;   
    
    function getTextWidth(txt, styleStr)
    {
      savThis.ctx.save();
      savThis.ctx.font = styleStr;
      let wid = savThis.ctx.measureText(txt).width;  // width in pixels
      savThis.ctx.restore();

      return wid;
    }

    if (typeof(preTxt) === "string")
    {
      man = preTxt+man;
    }
    // set the drawing context to measure the size
    const fntStyle = fntWt+" "+fntSz+"px "+fntFm;
    const manWid = 1.05*getTextWidth(man, fntStyle)/this.xscl; // convert to World Coords lengths
    const manHgt = 1.1*fntSz/-this.yscl;     // TEXT height, -ve to ensure +ve value for hgt in RHC and SVG
    const expWid = getTextWidth(exp, fntWt+" "+0.7*fntSz+"px "+fntFm)/this.xscl;
    const expHgt = 0.7*fntSz/-this.yscl;
    // mantissa bounding box
    const manBB = {ul:{x: 0, y: manHgt},
                   ll:{x: 0, y: 0},
                   lr:{x:manWid, y: 0},
                   ur:{x:manWid, y: manHgt}};   
    // make the mantissa Object
    const manObj = new Text(man, {    
      lorg: 7,                        // must use 7 to allow fiddling with height to posiiton the exponent
      fillColor: txtCol,
      fontSize: fntSz,
      fontWeight: fntWt,
      fontFamily: fntFm });

    // now make the exponent Object
    if (exp != "")
    {
      expObj = new Text(exp, {    
        lorg: 7,
        fillColor: txtCol,
        fontSize: 0.7*fntSz,
        fontWeight: fntWt,
        fontFamily: fntFm });
      // shift exp to upper right of mantissa (we are moving a lorg 7 so shift down by expHgt)
      expObj.translate(manBB.ur.x, manBB.ur.y-expHgt);
    }

    // now make the postText object
    if (postTxt)
    {
      postTxtObj = new Text(postTxt, {    
        lorg: 7,                        // must use 7 to allow fiddling with height to posiiton the exponent
        fillColor: txtCol,
        fontSize: fntSz,
        fontWeight: fntWt,
        fontFamily: fntFm });
      // shift exp to upper right of mantissa (we are moving a lorg 7 so shift down by expHgt)
      postTxtObj.translate(manBB.lr.x+1.1*expWid, manBB.lr.y);
    }

    // lorg offset calcs
    if ([1,2,3,4,5,6,7,8,9].indexOf(lorg) !== -1)
    {
      lorigin = lorg;
    }
    const wid = manWid+expWid;
    const hgt = manHgt;  
    const wid2 = wid/2;
    const hgt2 = hgt/2;
    const lorgWC = [0, [0, hgt],  [wid2, hgt],  [wid, hgt],
                 [0, hgt2], [wid2, hgt2], [wid, hgt2],
                 [0, 0],    [wid2, 0],    [wid, 0]];
    dx = -lorgWC[lorigin][0];
    dy = -lorgWC[lorigin][1];
  
    if (typeof bgColor === "string") // a color has been defined)
    {
      const nonISOscl = (Math.abs(this.yscl/this.xscl));  // undo any non-isotropic WC scaling
      // construct the cmdsAry for the text bounding box (world coords)
      const bboxData = ["M", manBB.ll.x, manBB.ll.y, "l", 0, hgt*nonISOscl, "l", wid, 0, "l", 0, -hgt*nonISOscl, "z"]
      const bboxObj = new Shape(bboxData, {iso:true, fillColor:bgColor});
  
      txtGrp.addObj(bboxObj);
    }
    txtGrp.addObj(manObj);
    if (expObj) txtGrp.addObj(expObj);
    if (postTxtObj) txtGrp.addObj(postTxtObj);
    txtGrp.translate(dx, dy); 
    // save the width & height as a properties (used for axes label positioning)
    txtGrp.width = wid; 
    txtGrp.height = hgt;

    if (degs)
    {
      txtGrp.rotate(degs);
    }
    if (scl !== 1)
    {
      txtGrp.scale(scl);
    }
    if (x || y)
    {
      txtGrp.translate(x, y);
    }
    this.render(txtGrp); 
  };

  CangoCore.prototype.drawVectorText = function(str, options)
  {
    const opts = (typeof options === 'object')? options: {},   // avoid undeclared object errors
        // options honoured: x, y, strokeColor, fontSize, fontWeight, lorg, bgFillColor,
        size = opts.fontSize || opts.fontsize || this.fontSize,
        lorg = opts.lorg || 1,
        txtCol = opts.strokeColor || opts.strokecolor || this.penCol,
        fontWt = opts.fontWeight || opts.fontweight || this.fontWeight, // weight in string or number 100..900
        bgColor = opts.bgFillColor || opts.bgfillcolor || null,
        x = opts.x || 0,
        y = opts.y || 0,
        scl = opts.scl || 1,
        degs = opts.degs || 0,
        txtGrp = new Group();
    let lnWid,
        lorigin = 1,               // locate origin
        weight = this.fontWeight,
        dx, dy;
  
    if ([1,2,3,4,5,6,7,8,9].indexOf(lorg) !== -1)
    {
      lorigin = lorg;
    }
    const pathData = hersheyFont.stringToCgo2D(str, 0, 0, size/this.xscl, lorigin);   // convert px size to WC
  
    // handle fontWeight using lineWidth
    if (typeof fontWt === "number" && (fontWt > 99) && (fontWt < 901))
    {
      weight = fontWt;
    }
    lnWid = 0.08*size*weight/400;
    // If box text is requested (by bgFillColor) then create the bounding box and fill it
    if (typeof bgColor === "string") // a color has been defined)
    {
      const wid = pathData.width;
      const hgt = pathData.height;
      const wid2 = wid/2;
      const hgt2 = hgt/2;
      const lorgWC = [0, [0, hgt],  [wid2, hgt],  [wid, hgt],
                   [0, hgt2], [wid2, hgt2], [wid, hgt2],
                   [0, 0],    [wid2, 0],    [wid, 0]];
      // calc lorg offsets
      if (lorgWC[lorg] !== undefined)  // check for out of bounds
      {
        dx = -lorgWC[lorg][0];
        dy = -lorgWC[lorg][1];
      }
      const bboxData = new SVGsegs(["M",dx,dy,"v",hgt,"h",wid,"v",-hgt,"z"]);
      // expand the bounding box 10% using a border the same color
      if (this.yDown)
      {
        bboxData.scale(1, -1);
      }
      const bbox = new Shape(bboxData, {
          fillColor:bgColor, 
          border: true, 
          lineWidth:0.2*size, 
          strokeColor:bgColor
        });
      txtGrp.addObj(bbox);
    }
    // now create the vector Cango object
    const txtData = new SVGsegs(pathData.cgoData);
    if (this.yDown)
    {
      txtData.scale(1, -1);
    }
    const txtObj = new Path(txtData, {iso:true, strokeColor:txtCol, lineWidth: lnWid, lineCap:"round"});
  
    txtGrp.addObj(txtObj);
  
    if (degs)
    {
      txtGrp.rotate(degs);
    }
    if (scl !== 1)
    {
      txtGrp.scale(scl);
    }
    if (x || y)
    {
      txtGrp.translate(x, y);
    } 
    this.render(txtGrp);
  };
  
  CangoCore.prototype.drawArrow = function(headX, headY, options)
  {
    // added properties: x, y, shaftWidth, shaftWidthWC, headSize
    const opts = (typeof options === 'object')? options: {}, 
          deg = opts.degs || 0,
          sx = opts.x || 0,   // start coords
          sy = opts.y || 0,
          ex = headX || 0,    // end (head) coords
          ey = headY || 0,
          hdSize = opts.headSize || 4,
          y2xUnits = Math.abs(this.yscl/this.xscl), // converts world coords Y axis units to X axis units
          dx = (ex-sx),                             // x component of shaft length
          dy = (ey-sy)*y2xUnits,                    // y component
          headAng = 21*Math.PI/180.0;               // half included angle of arrow head = 21deg
    let lineWid = this.penWid/this.xscl;          // default lineWidth (in pixels) convert to WC

    function Point(px, py)
    { 
      return {x:px, y:py}; 
    }
    function dist(p1, p2)
    { 
      return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y)); 
    }
    function rotatePoint(p, rads)
    {   // rotate a 2D point by 'rads' radians
      const sinA = Math.sin(rads),
            cosA = Math.cos(rads);
      return {x: p.x*cosA - p.y*sinA, y: p.x*sinA + p.y*cosA};
    }

    // support for zoom and pan changing shaft width
    if (opts.shaftWidthWC)
    {
      lineWid = opts.shaftWidthWC;
    }
    else if (opts.shaftWidth)
    {
      lineWid = opts.shaftWidth/this.xscl;
    }
    const ds = 0.5*lineWid;
    const theta = Math.atan2(dy, dx);           // angle of the arrow to x axis
    const edgeLen = hdSize*lineWid;
    const headLen = edgeLen*Math.cos(headAng);  // length of arrow head along shaft
    // work in X axis units - and always draw with 'iso' true
    const org = new Point(sx, sy*y2xUnits);
    const tip = new Point(ex, ey*y2xUnits);
    const len = dist(org, tip);
    // draw the arrow along the x axis
    const p1 = new Point(0, ds);
    const p2 = new Point(len-headLen, ds);
    const p3 = new Point(p2.x, edgeLen*Math.sin(headAng));
    const t = new Point(len, 0);
    const p4 = new Point(p3.x, -p3.y);
    const p5 = new Point(p2.x, -p2.y);
    const p6 = new Point(p1.x, -p1.y);
    const arwData = [p1, p2, p3, t, p4, p5, p6];
    // rotate array of points by theta then translate drawing origin to sx, sy
    const arwRotated = arwData.map(function(p){ return rotatePoint(p, theta)});
    // convert to array ['M', x0, y0, x1, y1, x2, y2 ...]
    const arrowDef = arwRotated.reduce(function(acc, curr){
                                acc.push(curr.x, curr.y);
                                return acc; }, ["M"]);     // start with an 'M' command
    // insert the "L" at start of the line segments just for clarity (works fine without this)
    arrowDef.splice(3, 0, "L");
    arrowDef.push("Z");  // close the path for future filling
    const arrowObj = new Shape(arrowDef, options);
    arrowObj.setProperty("iso", true);      // needed to keep shape in non-isotropic coords
  //  arrowObj.rotate(deg);
  //  arrowObj.translate(sx, sy);
    this.render(arrowObj);     // x,y scl, degs are ignored they are built into arrowDef
  };

  CangoCore.prototype.drawArrowArc = function(radius, startAngle, stopAngle, options)
  {
    // This will create an arc centred on (0,0) radius r, from angle 'startAngle' to 'stopAngle' (deg)
    // arrow head will be at stop end only, arrow head in proportion to shaft width
    const opts = (typeof options === 'object')? options: {},   // avoid undeclared object errors
          deg = opts.degs || 0,
          cx = opts.x || 0,
          cy = opts.y || 0,
          r = radius || 1,
          clockwise = opts.clockwise,
          hdSize = opts.headSize || 4,
          startA = to360(startAngle),   // move angle to 0..360
          stopA = to360(stopAngle),
          angSweep = (startA > stopA)? 1: 0,  // 1 = CW 0 = CCW
          rad = Math.PI/180;
    let lineWid = this.penWid/this.xscl,
        sweep = clockwise? 1: 0,
        sgnY = -1;

    function to360(a)
    {
      while (a<0)
      {
        a += 360;
      }
      while (a>=360)
      {
        a -= 360;
      }
      return parseFloat(a);    // force a float
    }

    // support for zoom and pan changing shaft width
    if (opts.shaftWidthWC)
    {
      lineWid = opts.shaftWidthWC;
    }
    else if (opts.shaftWidth)
    {
      lineWid = opts.shaftWidth/this.xscl;
    }
    const ds = 0.5*lineWid;
    const r1 = r-ds;
    const r2 = r+ds;
    const headSpanWC = 0.95*hdSize*lineWid; // length of arrow head along arc (in world coords)
    let headSpanRad = headSpanWC/r;         // length of arrow head in radians
    let span = angSweep? startA - stopA: stopA - startA;
    if ((angSweep && !sweep)||(!angSweep && sweep))     // XOR = going the wrong way round
    {
      // default is the wrong direction switch direction
      span = 360 - span;
    }
    const spanRad = rad*span;
    let lrg = (span>180)? 1: 0;
    // make sure spna is bigger than arrow head
    if (headSpanRad > spanRad)   // make arc at least as big as the requested head size
    {
      headSpanRad = spanRad;
    }
    // handle the inverted coord where Cango must reverse direction to maintain the sweep=CW convention
    if (this.yDown)
    {
      lrg = 1 - lrg;
      sgnY = 1;
    }
    else
    {
      sweep = 1 - sweep;
    }
    // construct the nodes of the arrow shape
    const stopRad = sgnY*rad*stopA;
    const startRad = sgnY*rad*startA;
    const baseA = sweep? stopRad-sgnY*headSpanRad: stopRad+sgnY*headSpanRad;  // angle at base of arrow head
    const qr1 = r-0.35*headSpanWC,             // 0.35 is sin(21) deg tilt angle of head sides
          qr2 = r+0.35*headSpanWC,
          b1x = r1*Math.cos(startRad),
          b1y = r1*Math.sin(startRad)*sgnY,
          e1x = r1*Math.cos(baseA),
          e1y = r1*Math.sin(baseA)*sgnY,
          b2x = r2*Math.cos(startRad),
          b2y = r2*Math.sin(startRad)*sgnY,
          e2x = r2*Math.cos(baseA),
          e2y = r2*Math.sin(baseA)*sgnY,
          tx = r*Math.cos(stopRad),
          ty = r*Math.sin(stopRad)*sgnY,
          q1x = qr1*Math.cos(baseA),
          q1y = qr1*Math.sin(baseA)*sgnY,
          q2x = qr2*Math.cos(baseA),
          q2y = qr2*Math.sin(baseA)*sgnY;

    const arrowDef = ["M", b2x,b2y, "A",r2,r2,0,lrg,sweep,e2x,e2y, "L", q2x,q2y, "A",qr2,qr2,0,0,sweep,tx,ty, "A",qr1,qr1,0,0,1-sweep,q1x,q1y, "L",e1x,e1y, "A",r1,r1,0,lrg,1-sweep,b1x,b1y, "Z"];
    const arrowObj = new Shape(arrowDef, options);
    arrowObj.setProperty("iso", true);      // needed to keep shape in non-isotropic coords
 //   arrowObj.rotate(deg);
 //   arrowObj.translate(cx, cy);
    this.render(arrowObj);
  };



 /* ==========================================================================
  // http://kevin.vanzonneveld.net
  // +   original by: Ash Searle (http://hexmen.com/blog/)
  // + namespaced by: Michael White (http://getsprink.com)
  // +    tweaked by: Jack
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Paulo Freitas
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Dj
  // +   improved by: Allidylls
  // *     example 1: sprintf("%01.2f", 123.1);
  // *     returns 1: 123.10
  // *     example 2: sprintf("[%10s]", 'monkey');
  // *     returns 2: '[    monkey]'
  // *     example 3: sprintf("[%'#10s]", 'monkey');
  // *     returns 3: '[####monkey]'
  // *     example 4: sprintf("%d", 123456789012345);
  // *     returns 4: '123456789012345'
 *==========================================================================*/
  sprintf = function()
  {
    var regex = /%%|%(\d+\$)?([\-\+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g,
        a = arguments,
        i = 0,
        format = a[i++];

    function pad(str, len, chr, leftJustify)
    {
      var padding;

      if (!chr)
      {
        chr = ' ';
      }
      padding = (str.length >= len) ? '' : new Array(1 + len - str.length).join(chr);
      return leftJustify ? str + padding : padding + str;
    }

    // justify()
    function justify(value, prefix, leftJustify, minWidth, zeroPad, customPadChar)
    {
      var diff = minWidth - value.length;
      if (diff > 0)
      {
        if (leftJustify || !zeroPad)
        {
          value = pad(value, minWidth, customPadChar, leftJustify);
        }
        else
        {
          value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
        }
      }
      return value;
    }

    // formatBaseX()
    function formatBaseX(value, base, prefix, leftJustify, minWidth, precision, zeroPad)
    {
      // Note: casts negative numbers to positive ones
      var number = value >> 0;
      prefix = prefix && number && ({'2': '0b','8': '0', '16': '0x'}[base] || '');
      value = prefix + pad(number.toString(base), precision || 0, '0', false);
      return justify(value, prefix, leftJustify, minWidth, zeroPad);
    }

    // formatString()
    function formatString(value, leftJustify, minWidth, precision, zeroPad, customPadChar)
    {
      if (precision !== null)
      {
        value = value.slice(0, precision);
      }
      return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    }

    // doFormat()
    function doFormat(substring, valueIndex, flags, minWidth, _, precision, type)
    {
      var number,
          prefix,
          method,
          textTransform,
          value,
          leftJustify = false,
          positivePrefix = '',
          zeroPad = false,
          prefixBaseX = false,
          customPadChar = ' ',
          flagsl = flags.length,
          j;

      if (substring === '%%')
      {
        return '%';
      }

      for (j = 0; flags && j < flagsl; j++)
      {
        switch (flags.charAt(j))
        {
          case ' ':
            positivePrefix = ' ';
            break;
          case '+':
            positivePrefix = '+';
            break;
          case '-':
            leftJustify = true;
            break;
          case "'":
            customPadChar = flags.charAt(j + 1);
            break;
          case '0':
            zeroPad = true;
            break;
          case '#':
            prefixBaseX = true;
            break;
        }
      }

      // parameters may be null, undefined, empty-string or real valued
      // we want to ignore null, undefined and empty-string values
      if (!minWidth)
      {
        minWidth = 0;
      }
      else if (minWidth === '*')
      {
        minWidth = +a[i++];
      }
      else if (minWidth.charAt(0) === '*')
      {
        minWidth = +a[minWidth.slice(1, -1)];
      }
      else
      {
        minWidth = +minWidth;
      }

      // Note: undocumented perl feature:
      if (minWidth < 0)
      {
        minWidth = -minWidth;
        leftJustify = true;
      }

      if (!isFinite(minWidth))
      {
        throw new Error('sprintf: (minimum-)width must be finite');
      }

      if (!precision)
      {
        precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined;
      }
      else if (precision === '*')
      {
        precision = +a[i++];
      }
      else if (precision.charAt(0) === '*')
      {
        precision = +a[precision.slice(1, -1)];
      }
      else
      {
        precision = +precision;
      }

      // grab value using valueIndex if required?
      value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

      switch (type)
      {
        case 's':
          return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
        case 'c':
          return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
        case 'b':
          return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'o':
          return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'x':
          return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'X':
          return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
        case 'u':
          return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'i':
        case 'd':
          number = +value || 0;
          number = Math.round(number - number % 1); // Plain Math.round doesn't just truncate
          prefix = number < 0 ? '-' : positivePrefix;
          value = prefix + pad(String(Math.abs(number)), precision, '0', false);
          return justify(value, prefix, leftJustify, minWidth, zeroPad);
        case 'e':
        case 'E':
        case 'f': // Should handle locales (as per setlocale)
        case 'F':
        case 'g':
        case 'G':
          number = +value;
          prefix = number < 0 ? '-' : positivePrefix;
          method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
          textTransform = ['toString', 'toUpperCase'][('eEfFgG'.indexOf(type)) % 2];
          value = prefix + Math.abs(number)[method](precision);
          return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
        default:
          return substring;
      }
    }

    return format.replace(regex, doFormat);
  };

  return CangoCore;    // return the augmented Cango object, over-writing the existing

}(Cango));    // Take the existing Cango object and add Axes drawing methods

