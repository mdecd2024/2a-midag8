/*===================================================================
  Filename: CangoAxes-9v02.js
  Rev 9
  By: Dr A.R.Collins

  Requires Cango-16 or greater
  Description: Adds these drawing methods to Cango core:
    drawAxes
    drawBoxAxes 
    drawArrow 
    drawArrowArc
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
  28Mar17 Released as CangoAxes-2v00                              ARC
  08Jul17 Added drawVectorText as Cango method                    ARC
  10Jul17 Released as CangoAxes-3v00                              ARC
  12Jul17 Flip the Vector text if yDown is true                   ARC
  15Jul17 bugfix: vectorText lineCap must be "round"              ARC
  20Jul17 Released as CangoAxes-4v00                              ARC
  29May19 Released as CangoAxes Ver 5                             ARC
  29May19 bugfix: validate AxisTicsManual input
          bugfix: don't seek last label if lblStep=0              ARC
  04Jun19 Added support for "revXdirection" option                ARC
  05Jun19 bugfix: x labels on wrong side if SVG & bottom half     ARC
  17Jun19 Use const and let
          Build array of minor and major tics to clarify last tic ARC
  18Jun19 Use forEach and reduce to avoid ugly loop checks        ARC
  27Jun19 Take more care with const                               ARC
  22Jul19 Update to use Cango-15 or later                         ARC
  07Aug19 Add yet another patch against math noise                ARC
  12Aug19 Released as CangoAxes-6v00                              ARC
  24Aug19 bugfix: gridColor option not being honored              ARC
  09Nov19 Force hard transforms follow in insertion order
          Force drawHTMLtext options also follow insertion order  ARC
  11Nov19 Released as CangoAxes-7v00                              ARC
  12Jul20 Split off Text methods into CangoTextUtils              ARC
  12Jul20 Released as CangoAxes-8v00                              ARC
  14Jun21 Upgrade to uses Cango-22                                ARC
  28Jun21 Simplify immediate execute wrapper                      ARC
 ====================================================================*/

var sprintf, toEngFixed, toEngPrec, toEngNotation, toSciNotation;

(function()
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

  Cango.prototype.drawAxes = function(xMin, xMax, yMin, yMax, options)
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
                    setProperty: setPropertyValue 
                  };
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
            degs: (savThis.yDown)? -90: 90,
            x: revXorg + side*yAxLbOfs, 
            y: y,
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
          degs: (savThis.yDown)? -90: 90,
          x: revXorg + side*yAxLbOfs, 
          y: y,
          lorg:lorg,
          fillColor:parms.fillColor,
          fontSize: parms.fontSize*1.1,
          fontWeight: parms.fontWeight,
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
              degs: (savThis.yDown)? -90: 90,
              x: revXorg + side*yAxLbOfs, 
              y: y,
              lorg:lorg,
              fillColor: parms.fillColor,
              fontSize: parms.fontSize*1.1,
              fontWeight: parms.fontWeight,
              fontFamily: parms.fontFamily });
          }
        }
        else // we have sciNotation units to draw (not == 10^0)
        {
          savThis.drawSciNotationText(10, yU.expStr, {
            degs: (savThis.yDown)? -90: 90,
            x: revXorg + side*yAxLbOfs, 
            y: y,
            preText: yL+"  \uff08",       // prepend the axis label + "("
            postText: "\uff09",           // append ")"
            lorg:lorg,
            fillColor: parms.fillColor,
            fontSize: parms.fontSize*1.1,
            fontWeight: parms.fontWeight,
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

  Cango.prototype.drawBoxAxes = function(xMin, xMax, yMin, yMax, options)
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

  Cango.prototype.drawArrow = function(headX, headY, options)
  {
    // added properties: x, y, shaftWidth, shaftWidthWC, headSize
    const opts = (typeof options === 'object')? options: {}, 
          sx = opts.x || 0,   // start coords
          sy = opts.y || 0,
          ex = headX || 0,    // end (head) coords
          ey = headY || 0,
          hdSize = opts.headSize || 4,
          y2xUnits = Math.abs(this.yscl/this.xscl), // converts world coords Y axis units to X axis units
          dx = (ex-sx),                             // x component of shaft length
          dy = (ey-sy)*y2xUnits,                    // y component
          headAng = 21*Math.PI/180.0;               // half included angle of arrow head = 21deg
    let lineWid = this.lineWidthDef/this.xscl;    // default lineWidth (in pixels) convert to WC

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

  Cango.prototype.drawArrowArc = function(radius, startAngle, stopAngle, options)
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
    let lineWid = this.lineWidthDef/this.xscl,
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
}()); 

