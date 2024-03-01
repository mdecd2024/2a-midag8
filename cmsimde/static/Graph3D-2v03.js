/*===================================================================
  Filename: Graph3D-2v03.js
  Rev 2
  By: Dr A.R.Collins

  Requires Cango3D-8v18 or greater
  Description: Library for plotting graphs of 3D data on the canvas
    element using the Cango3D graphics engine.

  Date    Description                                            |By
  -------------------------------------------------------------------
  01Sep19 First beta                                              ARC
  07Nov19 Beta02 release candidate for Graph3D-2v00               ARC
  10Dec19 Released as Graph3D-2v00                                ARC
  18Dec19 Updated for changes to Cango-9                          ARC
  04May20 Updated to support Sphere3D object                      ARC
 ====================================================================*/

"use strict";

var Graph3D, toEngNotation, toSciNotation;

(function(){
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
      if (this.lblStep < this.ticStep || (mx-mn)/this.lblStep > 12)
      {
        console.warn("Requested major tick interval too small");
        this.lblStep = (stepman === 0.2)? this.ticStep*5: this.ticStep*2;
      }
      if (this.lblStep > mx - mn)
      {
        console.warn("Requested major tick interval too large");
        this.lblStep = (stepman === 0.2)? this.ticStep*5: this.ticStep*2;
      }
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

    // check for valid inputs, limit ticks to 1 < tickStep < 25
    if (xmin===undefined || xmax===undefined || !xMn)  // xMn == 0 means no tics
    {
      return;
    }

    if (xMn < (xmax-xmin)/25)
    {
      console.warn("Requested tick interval too small");
      return new AxisTicsAuto(xmin, xmax, "auto");
    }
    if (xMn > xmax - xmin)
    {
      console.warn("Requested tick interval too large");
      return new AxisTicsAuto(xmin, xmax, "auto");
    }

    const dx = 0.01*xMn;
    this.tic1 = xMn*Math.ceil((xmin-dx)/xMn);
    this.ticStep = xMn;

    if (xMj < xMn)
    {
      console.warn("Requested major tick interval too small");
      this.lblStep = this.ticStep;
      this.lbl1 = this.tic1;
    }
    else if (xMj >= (xmax-xmin))
    {
      console.warn("Requested major tick interval too large");
    }
    else
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

  function makeSphere(rad, ballColor)
  {
    return new Sphere3D(rad*2, {fillColor:ballColor, relShine:0.7, relAmbient:0.8});
  }

  function makeTetrahedron(sideLen, color)
  {
    const d = sideLen;
    const faces = new Group3D();
    const phi = 1/Math.sqrt(2);
    const coords = [[d, 0, -d*phi],    // now do circular permutations
                    [-d, 0, -d*phi],
                    [0, d, d*phi],
                    [0, -d, d*phi]];

    function addFace(i, j, k)
    {
      let triangle = ["M",coords[i][0],coords[i][1],coords[i][2], 
                      "L",coords[j][0],coords[j][1],coords[j][2],
                      "L",coords[k][0],coords[k][1],coords[k][2], "z"];

      let tri = new Shape3D(triangle, {fillColor:color});  // backColor irrelevant */
      faces.addObj(tri);
    }

    addFace(0, 1, 2);
    addFace(2, 1, 3);
    addFace(2, 3, 0);
    addFace(0, 3, 1);

    faces.rotateX(54.74);

    return faces;
  }

  function makeCube(sideLen, color)
  {
    const d = 0.7*sideLen;
    const faces = new Group3D();
    const coords = [[d, d, d], [d, d, -d], [d, -d, d], [d, -d, -d],
                    [-d, d, d], [-d, d, -d], [-d, -d, d], [-d, -d, -d]];

    function addFace(i, j, k, l)
    {
      let square = ["M",coords[i][0],coords[i][1],coords[i][2], 
                    "L",coords[j][0],coords[j][1],coords[j][2],
                    "L",coords[k][0],coords[k][1],coords[k][2],
                    "L",coords[l][0],coords[l][1],coords[l][2], "z"];

      let sqr = new Shape3D(square, {fillColor: color});  // backColor irrelevant */
      faces.addObj(sqr);
    }

    addFace(0, 2, 3, 1); 
    addFace(1, 3, 7, 5); 
    addFace(1, 5, 4, 0); 
    addFace(4, 5, 7, 6); 
    addFace(6, 7, 3, 2); 
    addFace(6, 2, 0, 4);

    return faces;
  }

  function makeIcosahedron(sideLen, color)
  {
    const d = sideLen/2;
    const faces = new Group3D();
    const phi = (1+Math.sqrt(5))/2;
    const coords = [[0, d, d*phi], [0, d, -d*phi], [0, -d, d*phi], [0, -d, -d*phi],
                    [d*phi, 0, d], [d*phi, 0, -d], [-d*phi, 0, d], [-d*phi, 0, -d],    
                    [d, d*phi, 0], [d, -d*phi, 0], [-d, d*phi, 0], [-d, -d*phi, 0]];

    function addFace(i, j, k)
    {
      let triangle = ["M",coords[i][0],coords[i][1],coords[i][2], 
                      "L",coords[j][0],coords[j][1],coords[j][2],
                      "L",coords[k][0],coords[k][1],coords[k][2], "z"];

      let tri = new Shape3D(triangle, {fillColor: color});  // backColor irrelevant */
      faces.addObj(tri);
    }

    addFace(0, 2, 4);
    addFace(0, 4, 8);
    addFace(0, 8, 10);
    addFace(0, 10, 6);
    addFace(0, 6, 2);
    addFace(9, 4, 2);
    addFace(4, 9, 5);
    addFace(4, 5, 8);
    addFace(8, 5, 1);
    addFace(8, 1, 10);
    addFace(10, 1, 7);
    addFace(10, 7, 6);
    addFace(6, 7, 11);
    addFace(6, 11, 2);
    addFace(2, 11, 9);
    addFace(3, 9, 11);
    addFace(3, 11, 7);
    addFace(3, 7, 1);
    addFace(3, 1, 5);
    addFace(3, 5, 9);

    return faces;
  }

  function makeDodecahedron(sideLen, color)
  {
    const d = 0.6*sideLen || 100;
    const faces = new Group3D();
    const phi = (1+Math.sqrt(5))/2;
    const coords = [[d, d, d,], [d, d, -d,], [d, -d, d,], [d, -d, -d,],
                    [-d, d, d,], [-d, d, -d,], [-d, -d, d,], [-d, -d, -d,],
                    [0, d*phi, d/phi], [0, d*phi, -d/phi], [0, -d*phi, d/phi], [0, -d*phi, -d/phi],
                    [d/phi, 0, d*phi], [d/phi, 0, -d*phi], [-d/phi, 0, d*phi], [-d/phi, 0, -d*phi],
                    [d*phi, d/phi, 0], [d*phi, -d/phi, 0], [-d*phi, d/phi, 0], [-d*phi, -d/phi, 0]];

    function addFace(i, j, k, l, m)
    {
      const penta = ["M",coords[i][0],coords[i][1],coords[i][2], 
                     "L",coords[j][0],coords[j][1],coords[j][2],
                     "L",coords[k][0],coords[k][1],coords[k][2],
                     "L",coords[l][0],coords[l][1],coords[l][2],
                     "L",coords[m][0],coords[m][1],coords[m][2], "z"];

      const pentagon = new Shape3D(penta, {fillColor:color});  // backColor irrelevant */
      faces.addObj(pentagon);
    }

    addFace(0, 8, 4, 14, 12); 
    addFace(12, 14, 6, 10, 2); 
    addFace(12, 2, 17, 16, 0); 
    addFace(0, 16, 1, 9, 8); 
    addFace(8, 9, 5, 18, 4); 
    addFace(4, 18, 19, 6, 14); 
    addFace(3, 11, 7, 15, 13); 
    addFace(13, 15, 5, 9, 1); 
    addFace(13, 1, 16, 17, 3); 
    addFace(3, 17, 2, 10, 11); 
    addFace(11, 10, 6, 19, 7); 
    addFace(7, 19, 18, 5, 15); 

    return faces;
  }

  class Parameters {
    constructor (options) {
      this.xMinTic = "auto";
      this.yMinTic = "auto";
      this.zMinTic = "auto";
      this.xMajTic = "auto";
      this.yMajTic = "auto";
      this.zMajTic = "auto";
      this.xUnits = "";
      this.yUnits = "";
      this.zUnits = "";
      this.xLabel = "";
      this.yLabel = "";
      this.zLabel = "";
      this.strokeColor = "black";
      this.gridColor = "dimgray";
      this.fontSize = 11;
      this.fontWeight = 400;
      this.lineWidth = 1;
  
      const opts = (typeof options === 'object')? options: {};   // avoid undeclared object errors
      // check for all supported options
      for (let prop in opts)
      {
        // check that this is opts's own property, not inherited from prototype
        if (opts.hasOwnProperty(prop))
        {
          this.setProperty(prop, opts[prop]);
        }
      }
    }

    setProperty(propertyName, value) {
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
        case "zunits":
          if (typeof value === "string")
          {
            this.zUnits = value;
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
        case "zlabel":
        case "zaxislabel":
          if (typeof value === "string")
          {
            this.zLabel = value;
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
        case "ztickinterval":
        case "zminortickinterval":
          this.zMinTic = value;
          break;
        case "xmajortickinterval":
          this.xMajTic = value;
          break;
        case "ymajortickinterval":
          this.yMajTic = value;
          break;
        case "zmajortickinterval":
          this.zMajTic = value;
          break;
        case "strokecolor":  
          this.strokeColor = value;
          break;
        case "linewidth":  
          this.lineWidth = value;
          break;
        case "gridcolor":  
          this.gridColor = value;
          break;
        case "fontsize":
          if ( typeof value === "number" && value>=8 && value<=50)
          {
            this.fontSize = value;
          }
          else
          {
            console.warn("invalid font size:", value);
          }
          break;
        case "fontweight":
          if (typeof value === "string" && value == "bold")
          {
            this.fontWeight = 700;
          }
          else if (typeof value === "string" && value == "normal")
          {
            this.fontWeight = 400;
          }
          else if (typeof value === "string" && value == "light")
          {
            this.fontWeight = 200;
          }
          else if ( typeof value === "number" && value>=100 && value<=900)
          {
            this.fontWeight = value;
          }
          else
          {
            console.warn("invalid font weight:", value);
          }
          break;
        default:
          console.warn("unrecognized option key:", propertyName);
          return;
      }
    }
  }

  Graph3D = class {
    constructor (cvsID){
      this.gc = new Cango3D(cvsID);
      this.cId = cvsID;
      this.xRot = 20;
      this.zRot = 35;  // actually Y axis rotation but the axes get rotated 90 before plotting
      this.gc.setWorldCoords3D(-50, -50/this.gc.aRatio, 100);   // put the origin in center of canvas
      this.gc.setFOV(35);
      this.gc.setLightSource(-500, 300, 500);
      this.setGridbox();  // setup the default
      this.setGraphCoords();

      this.data = new Group3D();   // objects to be graphed, to be transformed and draw as a single group 
      this.axesGrp = undefined;
      this.wireframe = "";
      // Matlab Jet ref: stackoverflow.com grayscale-to-red-green-blue-matlab-jet-color-scale
      this.colMap = [[  0,   0, 128, 255], [  0,   0, 131, 255], [  0,   0, 135, 255], [  0,   0, 139, 255], 
                      [  0,   0, 143, 255], [  0,   0, 147, 255], [  0,   0, 151, 255], [  0,   0, 155, 255], 
                      [  0,   0, 159, 255], [  0,   0, 163, 255], [  0,   0, 167, 255], [  0,   0, 171, 255], 
                      [  0,   0, 175, 255], [  0,   0, 179, 255], [  0,   0, 183, 255], [  0,   0, 187, 255], 
                      [  0,   0, 191, 255], [  0,   0, 195, 255], [  0,   0, 199, 255], [  0,   0, 203, 255], 
                      [  0,   0, 207, 255], [  0,   0, 211, 255], [  0,   0, 215, 255], [  0,   0, 219, 255], 
                      [  0,   0, 223, 255], [  0,   0, 227, 255], [  0,   0, 231, 255], [  0,   0, 235, 255], 
                      [  0,   0, 239, 255], [  0,   0, 243, 255], [  0,   0, 247, 255], [  0,   0, 251, 255], 
                      [  0,   0, 255, 255], [  0,   4, 255, 255], [  0,   8, 255, 255], [  0,  12, 255, 255], 
                      [  0,  16, 255, 255], [  0,  20, 255, 255], [  0,  24, 255, 255], [  0,  28, 255, 255], 
                      [  0,  32, 255, 255], [  0,  36, 255, 255], [  0,  40, 255, 255], [  0,  44, 255, 255], 
                      [  0,  48, 255, 255], [  0,  52, 255, 255], [  0,  56, 255, 255], [  0,  60, 255, 255], 
                      [  0,  64, 255, 255], [  0,  68, 255, 255], [  0,  72, 255, 255], [  0,  76, 255, 255], 
                      [  0,  80, 255, 255], [  0,  84, 255, 255], [  0,  88, 255, 255], [  0,  92, 255, 255], 
                      [  0,  96, 255, 255], [  0, 100, 255, 255], [  0, 104, 255, 255], [  0, 108, 255, 255], 
                      [  0, 112, 255, 255], [  0, 116, 255, 255], [  0, 120, 255, 255], [  0, 124, 255, 255], 
                      [  0, 128, 255, 255], [  0, 131, 255, 255], [  0, 135, 255, 255], [  0, 139, 255, 255], 
                      [  0, 143, 255, 255], [  0, 147, 255, 255], [  0, 151, 255, 255], [  0, 155, 255, 255], 
                      [  0, 159, 255, 255], [  0, 163, 255, 255], [  0, 167, 255, 255], [  0, 171, 255, 255], 
                      [  0, 175, 255, 255], [  0, 179, 255, 255], [  0, 183, 255, 255], [  0, 187, 255, 255], 
                      [  0, 191, 255, 255], [  0, 195, 255, 255], [  0, 199, 255, 255], [  0, 203, 255, 255], 
                      [  0, 207, 255, 255], [  0, 211, 255, 255], [  0, 215, 255, 255], [  0, 219, 255, 255], 
                      [  0, 223, 255, 255], [  0, 227, 255, 255], [  0, 231, 255, 255], [  0, 235, 255, 255], 
                      [  0, 239, 255, 255], [  0, 243, 255, 255], [  0, 247, 255, 255], [  0, 251, 255, 255], 
                      [  0, 255, 255, 255], [  4, 255, 251, 255], [  8, 255, 247, 255], [ 12, 255, 243, 255], 
                      [ 16, 255, 239, 255], [ 20, 255, 235, 255], [ 24, 255, 231, 255], [ 28, 255, 227, 255], 
                      [ 32, 255, 223, 255], [ 36, 255, 219, 255], [ 40, 255, 215, 255], [ 44, 255, 211, 255], 
                      [ 48, 255, 207, 255], [ 52, 255, 203, 255], [ 56, 255, 199, 255], [ 60, 255, 195, 255], 
                      [ 64, 255, 191, 255], [ 68, 255, 187, 255], [ 72, 255, 183, 255], [ 76, 255, 179, 255], 
                      [ 80, 255, 175, 255], [ 84, 255, 171, 255], [ 88, 255, 167, 255], [ 92, 255, 163, 255], 
                      [ 96, 255, 159, 255], [100, 255, 155, 255], [104, 255, 151, 255], [108, 255, 147, 255], 
                      [112, 255, 143, 255], [116, 255, 139, 255], [120, 255, 135, 255], [124, 255, 131, 255], 
                      [128, 255, 128, 255], [131, 255, 124, 255], [135, 255, 120, 255], [139, 255, 116, 255], 
                      [143, 255, 112, 255], [147, 255, 108, 255], [151, 255, 104, 255], [155, 255, 100, 255], 
                      [159, 255,  96, 255], [163, 255,  92, 255], [167, 255,  88, 255], [171, 255,  84, 255], 
                      [175, 255,  80, 255], [179, 255,  76, 255], [183, 255,  72, 255], [187, 255,  68, 255], 
                      [191, 255,  64, 255], [195, 255,  60, 255], [199, 255,  56, 255], [203, 255,  52, 255], 
                      [207, 255,  48, 255], [211, 255,  44, 255], [215, 255,  40, 255], [219, 255,  36, 255], 
                      [223, 255,  32, 255], [227, 255,  28, 255], [231, 255,  24, 255], [235, 255,  20, 255], 
                      [239, 255,  16, 255], [243, 255,  12, 255], [247, 255,   8, 255], [251, 255,   4, 255], 
                      [255, 255,   0, 255], [255, 251,   0, 255], [255, 247,   0, 255], [255, 243,   0, 255], 
                      [255, 239,   0, 255], [255, 235,   0, 255], [255, 231,   0, 255], [255, 227,   0, 255], 
                      [255, 223,   0, 255], [255, 219,   0, 255], [255, 215,   0, 255], [255, 211,   0, 255], 
                      [255, 207,   0, 255], [255, 203,   0, 255], [255, 199,   0, 255], [255, 195,   0, 255], 
                      [255, 191,   0, 255], [255, 187,   0, 255], [255, 183,   0, 255], [255, 179,   0, 255], 
                      [255, 175,   0, 255], [255, 171,   0, 255], [255, 167,   0, 255], [255, 163,   0, 255], 
                      [255, 159,   0, 255], [255, 155,   0, 255], [255, 151,   0, 255], [255, 147,   0, 255], 
                      [255, 143,   0, 255], [255, 139,   0, 255], [255, 135,   0, 255], [255, 131,   0, 255], 
                      [255, 128,   0, 255], [255, 124,   0, 255], [255, 120,   0, 255], [255, 116,   0, 255], 
                      [255, 112,   0, 255], [255, 108,   0, 255], [255, 104,   0, 255], [255, 100,   0, 255], 
                      [255,  96,   0, 255], [255,  92,   0, 255], [255,  88,   0, 255], [255,  84,   0, 255], 
                      [255,  80,   0, 255], [255,  76,   0, 255], [255,  72,   0, 255], [255,  68,   0, 255], 
                      [255,  64,   0, 255], [255,  60,   0, 255], [255,  56,   0, 255], [255,  52,   0, 255], 
                      [255,  48,   0, 255], [255,  44,   0, 255], [255,  40,   0, 255], [255,  36,   0, 255], 
                      [255,  32,   0, 255], [255,  28,   0, 255], [255,  24,   0, 255], [255,  20,   0, 255], 
                      [255,  16,   0, 255], [255,  12,   0, 255], [255,   8,   0, 255], [255,   4,   0, 255], 
                      [255,   0,   0, 255], [251,   0,   0, 255], [247,   0,   0, 255], [243,   0,   0, 255], 
                      [239,   0,   0, 255], [235,   0,   0, 255], [231,   0,   0, 255], [227,   0,   0, 255], 
                      [223,   0,   0, 255], [219,   0,   0, 255], [215,   0,   0, 255], [211,   0,   0, 255], 
                      [207,   0,   0, 255], [203,   0,   0, 255], [199,   0,   0, 255], [195,   0,   0, 255], 
                      [191,   0,   0, 255], [187,   0,   0, 255], [183,   0,   0, 255], [179,   0,   0, 255], 
                      [175,   0,   0, 255], [171,   0,   0, 255], [167,   0,   0, 255], [163,   0,   0, 255], 
                      [159,   0,   0, 255], [155,   0,   0, 255], [151,   0,   0, 255], [147,   0,   0, 255], 
                      [143,   0,   0, 255], [139,   0,   0, 255], [135,   0,   0, 255], [131,   0,   0, 255],
                      [  0,   0,   0,   0]];
  
    }

    setGridbox(xLen, yLen, zLen) {
      let xLn = 50,
          yLn = 50,
          zLn = 40;

      if (xLen && xLen>=10 && xLen<= 100)
      {
        xLn = xLen;
      }
      if (yLen && yLen>=10)
      {
        yLn = yLen;
      }
      if (zLen && zLen>=10)
      {
        zLn = zLen;
      }
      this.gbX = xLn;
      this.gbY = yLn;
      this.gbZ = zLn;
    }

    setGraphCoords(xMin, xMax, yMin, yMax, zMin, zMax) {
      this.xmin = xMin || 0,
      this.xmax = xMax || 100,
      this.ymin = yMin || 0,
      this.ymax = yMax || 100,
      this.zmin = zMin || 0,
      this.zmax = zMax || 100;

      if (this.xmax <= this.xmin){
        console.error("xMax must be greater than xMin", this.xmax, this.xmin);
        return;
      }
      if (this.ymax <= this.ymin){
        console.error("yMax must be greater than yMin");
        return;
      }
      if (this.zmax <= this.zmin){
        console.error("zMax must be greater than zMin");
        return;
      }
      const spanX = this.xmax-this.xmin,
            spanY = this.ymax-this.ymin,
            spanZ = this.zmax-this.zmin;

      this.xScale = this.gbX/spanX,
      this.yScale = this.gbY/spanY,
      this.zScale = this.gbZ/spanZ;

      this.xOffset = this.xScale*(this.xmin+spanX/2);
      this.yOffset = this.yScale*(this.ymin+spanY/2);
      this.zOffset = this.zScale*(this.zmin+spanZ/2);
    }

    drawGraph(){
      this.data.rotateX(-90);
      this.data.rotateY(this.zRot);
      this.data.rotateX(this.xRot);
      if (this.axesGrp !== undefined) 
      {
        this.axesGrp.rotateX(-90);
        this.axesGrp.rotateY(this.zRot);
        this.axesGrp.rotateX(this.xRot);
        this.gc.render(this.axesGrp);
        this.gc.render(this.data, "noclear", this.wireframe);
      }
      else
      {

        this.gc.render(this.data);
      }
    }

    toRawCoords(x, y, z){
      let px = -this.xOffset+x*this.xScale;
      let py = -this.yOffset+y*this.yScale;
      let pz = -this.zOffset+z*this.zScale;

      return [px, py, pz];
    }

    plotPoints(pts, options){
      const opts = (typeof options === 'object')? options: {},   // avoid undeclared object errors
            fillCol = opts.fillColor || opts.fillcolor || this.gc.paintCol.toRGBA(),
            size = opts.symbolSize || opts.symbolsize || 3,
            symSize = 0.5*size/this.xScale, 
            symName = opts.symbol || "sphere";
      let points = [],
          sym = null;

      if (Array.isArray(pts))
      {
        if (Array.isArray(pts[0]) && pts[0].length == 3)   // data point = [x,y,z] 
        {
          for (let i=0; i < pts.length; i++) 
          {
            points[i] = {x: pts[i][0], y: pts[i][1], z: pts[i][2]};
          }
        }
        else if (typeof(pts[0]) == "object" && pts[0].x != undefined)   // data point = {x: , y: , z: }
        {
          points = pts;  // already in the right format
        }
        else if (typeof(pts[0]) == "number"  && pts.length == 3)
        {
          points[0] = {x: pts[0], y: pts[1], z: pts[2]};
        }
        else
        {
          console.log("Graph3D: plotPoints not passed an array of coordinates");
          return;
        }
      }
      else
      {
        console.log("Graph3D: plotPoints not passed an array of coordinates");
        return;
      }

      points.forEach((pt)=>{ 
        switch (symName)
        {
          default:
          case "sphere":
            sym = makeSphere(symSize, fillCol);
            break;
          case "cube":
            sym = makeCube(symSize, fillCol);
            break;
          case "tetra":
          case "tetrahedron":
            sym = makeTetrahedron(symSize, fillCol);
            break;
          case "dodeca":
          case "dodecahedron":
            sym = makeDodecahedron(symSize, fillCol);
            break;
          case "icos":
          case "icosahedron":
            sym = makeIcosahedron(symSize, fillCol);
            break;
        }
        const p = this.toRawCoords(pt.x, pt.y, pt.z);
        sym.setProperty("x", p[0]);
        sym.setProperty("y", p[1]);
        sym.setProperty("z", p[2]);
        // now add this to the Group3D to be plotted
        this.data.addObj(sym);
      });

     this.drawGraph();
    }

    plotLine(lnData, options){
      const opts = (typeof options === 'object')? options: {},   // avoid undeclared object errors
            lineWd = opts.lineWidth || this.gc.penWid, 
            strokeCol = opts.strokeColor || this.gc.penCol;
      let lnDataGC = ["M"],
          nPts,
          lnNodes;

      // test for data format and convert to objects
      if (Array.isArray(lnData))
      {
        nPts = lnData.length;
      }
      else 
      {
        console.error("unknown data format");
        return;
      }
      if (Array.isArray(lnData[0]) && lnData[0].length == 3)   // data point = [x,y,z] 
      {
        for (let c=0; c < nPts; c++) 
        {
          lnNodes[c] = {x: lnData[c][0], y: lnData[c][1], z: lnData[c][2]};
        }
      }
      else if (typeof(lnData[0]) == "object" && lnData[0].x != undefined)   // data point = {x: , y: , z: }
      {
        lnNodes = lnData;  // already in the right format
      }
      else if (lnData[0] === "M" || lnData[0] === "m") // already in Cgo3D format
      {
        const line = new Path3D(lnData, {
          strokeColor:strokeCol, 
          lineWidth:lineWd,
          sclNonUniform: [this.xScale, this.yScale, this.zScale],
          trans: [-this.xOffset, -this.yOffset, -this.zOffset]
        });
        this.data.addObj(line);
        this.drawGraph();
        return
      }
      else 
      {
        console.error("unknown data format");
        return;
      }
      for (let c=0; c<nPts; c++) 
      {
        let ptPX = this.toRawCoords(lnNodes[c].x, lnNodes[c].y, lnNodes[c].z);
        lnDataGC.push(ptPX[0], ptPX[1], ptPX[2]);
      }
      this.data.addObj(new Path3D(lnDataGC, {strokeColor:strokeCol, lineWidth:lineWd}));
      this.drawGraph();
    }

    plotMesh(mshData, options){ 
      const opts = (typeof options === 'object')? options: {},
            strokeCol = opts.meshColor || this.gc.penCol;

      opts.strokeColor = strokeCol;
      const mshObjs = this.buildMesh(mshData, opts);

      this.wireframe = "wireframe";
      this.data.addObj(mshObjs);  
      this.drawGraph();
    }

    plotSurface(mshData, options){
      const opts = (typeof options === 'object')? options: {};

      opts.strokeColor = opts.meshColor || "colorMap";
      const mshObjs = this.buildMesh(mshData, options);

      this.data.addObj(mshObjs);  
      this.wireframe = "";
      this.drawGraph();
    }
          
    buildMesh(mshData, options){ 
      // mshData is an array of lines formats:
      // 1. [ [[x,y,z], [x,y,z], [x,....], [[x,y,z], [x,y,z] ...], ...]
      // 2. [ [{x:_, y:_, z:_}, {x:_,y:_,z:_}, ...], [{x:_,y:_,z:_}, {x:_,y:_,z:_} ...], ...]
      const savThis = this,
            opts = (typeof options === 'object')? options: {},   // avoid undeclared object errors
            lineWd = opts.lineWidth || this.gc.penWid, // weight in string or number 100..900
            fillCol = opts.fillColor || "colorMap";
      let strokeCol = opts.strokeColor,
          mshNodes,
          nRows,
          nCols,
          fcol, 
          mcol;

      function getColor(z)
      {
        if (z>savThis.zmax) 
          z = savThis.zmax
        else if (z<savThis.zmin) 
          z = savThis.zmin;

        const idx = Math.round(256*(z-savThis.zmin)/(savThis.zmax - savThis.zmin));
        const rgb = savThis.colMap[idx];
        return "rgba("+rgb[0]+","+rgb[1]+","+rgb[2]+", 1)";
      }

      if (Array.isArray(mshData) && Array.isArray(mshData[0]))
      {
        nRows = mshData.length;
        nCols = mshData[0].length;
      }
      else 
      {
        console.error("unknown data format");
        return;
      }
      // test for data format and convert to objects
      if (Array.isArray(mshData[0][0]) && mshData[0][0].length == 3)   // data point = [x,y,z] 
      {
        mshNodes = [];
        for (let r=0; r<nRows; r++)   // step up the rows
        {
          mshNodes[r] = [];
          for (let c=0; c<nCols; c++) // step along the data points of a row (skip the "M")
          {
            mshNodes[r][c] = {x: mshData[r][c][0], y: mshData[r][c][1], z: mshData[r][c][2]};
          }
        }
      }
      else if (typeof(mshData[0][0]) == "object" && mshData[0][0].x != undefined)   // data point = {x: , y: , z: }
      {
        mshNodes = mshData;  // already in the right format
      }
      else 
      {
        console.error("unknown data format");
        return;
      }

      // now build the shape for each grid 'square'
      const rwSqrs = [];
      for (let r=0; r<nRows-1; r++)
      {
        for (let c=0; c<nCols-1; c++) 
        {
          let pGC0 = this.toRawCoords(mshNodes[r][c].x, mshNodes[r][c].y, mshNodes[r][c].z),
              pGC1 = this.toRawCoords(mshNodes[r][c+1].x, mshNodes[r][c+1].y, mshNodes[r][c+1].z),
              pGC2 = this.toRawCoords(mshNodes[r+1][c+1].x, mshNodes[r+1][c+1].y, mshNodes[r+1][c+1].z),
              pGC3 = this.toRawCoords(mshNodes[r+1][c].x, mshNodes[r+1][c].y, mshNodes[r+1][c].z);
          let zAvg = (mshNodes[r][c].z + mshNodes[r][c+1].z + mshNodes[r+1][c+1].z + mshNodes[r+1][c].z)/4;
          let sqData = ["M", pGC0[0], pGC0[1], pGC0[2], 
                        "L", pGC1[0], pGC1[1], pGC1[2], 
                             pGC2[0], pGC2[1], pGC2[2], 
                             pGC3[0], pGC3[1], pGC3[2], "z"];
          if (fillCol === "colorMap" || fillCol === "colormap")
          {
            fcol = getColor(zAvg);
          }
          else
          {
            fcol = fillCol;
          }
          if (strokeCol === "colorMap" || strokeCol === "colormap")
          {
            mcol = getColor(zAvg);
          }
          else
          {
            mcol = strokeCol;
          }

          rwSqrs.push(new Shape3D(sqData, {
            fillColor: fcol,
            backColor: fcol, 
            border: (mcol != fcol),
            strokeColor: mcol, 
            strokeWidth: lineWd}));
        }
      }

      return rwSqrs;
    }
    
    drawGraphAxes(options)
    {
      const savThis = this,
            parms = new Parameters(options),
            xMin = this.xmin, 
            xMax = this.xmax, 
            yMin = this.ymin, 
            yMax = this.ymax, 
            zMin = this.zmin, 
            zMax = this.zmax, 
            xAxisGrp = new Group3D(), 
            yAxisGrp = new Group3D(), 
            zAxisGrp = new Group3D(), 
            exSize = getTextDimensions("X"), 
            exWid = exSize.width,
            xToPx = 1/(this.xScale*this.gc.xscl),
            yToPx = -1/(this.yScale*this.gc.yscl),
            txtCol = parms.strokeColor,
            lineWid = parms.lineWidth;
      let lorg = 1,
          side = 1,                // 1 or -1 depending on the side of the axis to label
          rot = 0,
          xAxisObj,
          yAxisObj,
          zAxisObj,
          xAxisLblObj,
          yAxisLblObj,
          zAxisLblObj;
      
      function getTextDimensions(txt)
      {
        const tmpTxt = new Text3D(txt, {fontSize: parms.fontSize, fontWeight: parms.fontWeight}),
              sizeRatio = parms.fontSize/33,  // size/33 is scale factor to match Hershey font size to canvas font size
              wid = tmpTxt.width*sizeRatio,
              hgt = tmpTxt.height*sizeRatio;

        return {width:wid, height:hgt};  // width and height in pixels
      }

      function buildXaxis()
      {
        const exWidWC = exWid*yToPx,  // ticks are in y axis direction in world coords
              ticLen = 1.0*exWidWC,     // ticks defined in pixels and drawn in world coords 
              majTicLen = 1.8*exWidWC;  
        let x,
            xTkLbOfs = 1.0*exWidWC,     // world coords
            xAxLbOfs = 1.5*exWidWC,   
            xL = "", 
            xU = "",
            xTics,
            lastx,
            tickAryObj, 
            majTickAryObj, 
            majTickLblAry = []; 
          
        if (parms.xMinTic === null || parms.xMinTic === "auto")  // xMinTic===0 means no x ticks
        {
          xTics = new AxisTicsAuto(xMin, xMax, parms.xMajTic);
        }
        else
        {
          xTics = new AxisTicsManual(xMin, xMax, parms.xMinTic, parms.xMajTic);
        }
        // draw axis
        xAxisObj = new Path3D(['M', xMin, 0, 0, 'L', xMax, 0, 0], {
          lineWidth: 1.5*lineWid,
          lineCap:"round",
          strokeColor:parms.gridColor
        });

        xAxisGrp.addObj(xAxisObj);

        // X axis tick marks
        if (xTics.ticStep)
        {
          let ticData = [];
          xTics.minTics.forEach(function(currX){
            ticData = ticData.concat(['M', currX, 0, 0, 'l', 0, -ticLen/2, 0]);
          })
          tickAryObj = new Path3D(ticData, {
            lineWidth: 1.5,
            lineCap: "round",
            strokeColor: parms.gridColor});

          ticData = [];
          xTics.majTics.forEach(function(currX){
            ticData = ticData.concat(['M', currX, 0, 0, 'l', 0, -majTicLen/2, 0])
          })
          majTickAryObj = new Path3D(ticData, {
            lineWidth:1.5*lineWid,
            lineCap:"round",
            strokeColor:parms.gridColor});
            
          xAxisGrp.addObj(tickAryObj, majTickAryObj);

          // Draw the full grid
          if (true)
          {
            let gridData = [];
            xTics.majTics.forEach(function(currX){
              gridData = gridData.concat(['M', currX, 0, 0, 'l', 0, yMax-yMin, 0,
                                          'M', currX, yMax-yMin, 0, 'l', 0, 0, zMax-zMin])
            })
            let gridAryObj = new Path3D(gridData, {
              lineWidth: 0.5*lineWid,
              lineCap:"round",
              strokeColor:parms.gridColor});
            xAxisGrp.addObj(gridAryObj);
          }
          // calc x exponent of last tick and use for all label values (if any)
          lastx = toEngNotation(xTics.minTics[xTics.minTics.length-1]);
        }

        side = -1;
        // label X axis major ticks (only if lblStep !-- 0)
        if (xTics.lblStep)
        {
          // x axis on bottom half of screen
          lorg = 2;
          xTkLbOfs += 0.6*ticLen;

          xTics.majTics.forEach(function(x){
            // skip label at the origin if it would be on the other axis
            const lbl = new Text3D(toEngNotation(x, lastx.exp).manStr, {
              lorg: lorg,
              strokeColor: txtCol,
              fontSize: parms.fontSize,
              fontWeight: parms.fontWeight,
              sclNonUniform: [1/savThis.xScale, 1/savThis.yScale, -90],
              trans: [x, side*xTkLbOfs, 0]
            });
            majTickLblAry.push(lbl);
          });
          xAxisGrp.addObj(majTickLblAry);
        }

        // X axis label and units
        lorg = 2;
   //     rot = 0;
        x = (xMin+xMax)/2; // label center
        if (xTics.lblStep)  // we may have an axis label and no tick labels
        {
          // we have ticks, find width of longest tick label to position axis label
          let maxWid = xTics.majTics.reduce(function(acc, curr){
            let txtSize = getTextDimensions(toEngNotation(curr, lastx.exp).manStr);
            return Math.max(acc, txtSize.width);
          }, 0);
          xAxLbOfs += maxWid*yToPx; 
          // ticks will be between axis and label, make gap bigger
          xAxLbOfs += ticLen;
          if (parms.xUnits.length>0) // add units if we have any
          {
            xL = parms.xLabel+" ("+lastx.expStr+parms.xUnits+")";
          }
          else  // no units use scientific notation unless exponent ==0
          {
            xU = toSciNotation(10, lastx.exp);  // object 
            if (xU.expStr != "0") // dont draw sciNotation units if 10^0 
            {  // we have sciNotation units to draw (not == 10^0)
              xAxisLblObj = savThis.genSciNotationText(10, xU.expStr, {
                preText: parms.xLabel+"  (",  // prepend the axis label + "("
                postText: ")",                // append ")"
                lorg: lorg,
                strokeColor: txtCol,
                fontSize: parms.fontSize*1.1,
                fontWeight: parms.fontWeight,
                sclNonUniform: [1/savThis.xScale, 1/savThis.yScale, 1],
                trans: [x, side*xAxLbOfs, 0],
              });
            }
            else
            {
              xL = parms.xLabel;
            }
          }
        }
        else if (parms.xLabel.length>0) // just draw the xlabel (if any)
        {
          xL = parms.xLabel;
        }
        if (xL.length>0) 
        {
          xAxisLblObj = new Text3D(xL, {
            lorg: lorg,
            strokeColor: txtCol,
            fontSize: parms.fontSize*1.1,
            fontWeight: parms.fontWeight,
            sclNonUniform: [1/savThis.xScale, 1/savThis.yScale, 1],
            rotZ: rot,
            trans: [x, side*xAxLbOfs, 0]
          });
        }

        if (xAxisLblObj) xAxisGrp.addObj(xAxisLblObj); // If no Label and exponent == 0 then no label

        xAxisGrp.setProperty("z", zMin);
        xAxisGrp.setProperty("y", yMin);
      }  /*  buildXaxis */

      function buildYaxis()
      {
        const exWidWC = exWid*xToPx,   // ticks are in x axis direction in world coords
              ticLen = 1.0*exWidWC, // ticks defined in pixels and drawn in world coords  
              majTicLen = 1.8*exWidWC;  
        let y,
            yTkLbOfs = 1.0*exWidWC,
            yAxLbOfs = 1.5*exWidWC,  // add label length etc later
            yL = "", 
            yU = "",
            yTics,
            lasty,  
            tickAryObj, 
            majTickAryObj, 
            majTickLblAry = []; 
        if (parms.yMinTic === null || parms.yMinTic === "auto")  // yMinTic===0 means no y ticks
        {
          yTics = new AxisTicsAuto(yMin, yMax, parms.yMajTic);
        }
        else
        {
          yTics = new AxisTicsManual(yMin, yMax, parms.yMinTic, parms.yMajTic);
        }
        // draw axis
        yAxisObj = new Path3D(['M', 0, yMin, 0, 'L', 0, yMax, 0], {
          lineWidth:1.5*lineWid,
          lineCap:"round",
          strokeColor:parms.gridColor
        });

        yAxisGrp.addObj(yAxisObj); 

        // Y axis tick marks
        if (yTics.ticStep)
        {
          let ticData = [];
          yTics.minTics.forEach(function(currY){
            ticData = ticData.concat(['M', 0, currY, 0, 'L', -ticLen/2, currY, 0]);
          })
          tickAryObj = new Path3D(ticData, {
            lineWidth: 1.5*lineWid,
            lineCap: "round",
            strokeColor: parms.gridColor});

          ticData = [];
          yTics.majTics.forEach(function(currY){
            ticData = ticData.concat(['M', 0, currY, 0, 'L', -majTicLen/2, currY, 0])
          })
          majTickAryObj = new Path3D(ticData, {
            lineWidth:1.5*lineWid,
            lineCap:"round",
            strokeColor:parms.gridColor});
            
          yAxisGrp.addObj(tickAryObj, majTickAryObj);

          // Draw the full grid
          if (true)
          {
            let gridData = [];
            yTics.majTics.forEach(function(currY){
              gridData = gridData.concat(['M', 0, currY, 0, 'l', xMax-xMin, 0, 0,
                                          'M', xMax-xMin, currY, 0, 'l', 0, 0, zMax-zMin])
            })
            let gridAryObj = new Path3D(gridData, {
              lineWidth:0.5*lineWid,
              lineCap:"round",
              strokeColor:parms.gridColor});
            yAxisGrp.addObj(gridAryObj);
          }
          // calc x exponent of last tick and use for all label values
          lasty = toEngNotation(yTics.minTics[yTics.minTics.length-1]);
        }

        side = -1;
        // Y axis major tick labels (only if lblStep !-- 0)
        if (yTics.lblStep)
        {
          // Y axis, decide whether to label to right or left of Y axis
          lorg = 6;
          yTkLbOfs += 0.6*ticLen;

          yTics.majTics.forEach(function(y){
            // skip label at the Y max it would clash with Z axis label
            if (y > yMax-0.0000001)
            {
              return;
            } 
            const lbl = new Text3D(toEngNotation(y, lasty.exp).manStr, {
              lorg: lorg,
              strokeColor: txtCol,
              fontSize: parms.fontSize,
              fontWeight: parms.fontWeight,
              sclNonUniform: [1/savThis.xScale, 1/savThis.yScale, 1],
              trans: [side*yTkLbOfs, y, 0]
            });
            majTickLblAry.push(lbl);
          }); 
          yAxisGrp.addObj(majTickLblAry);
        }

        // Y axis label and units
        lorg = 2;    
        rot = -90;
        y = (yMin+yMax)/2;  // label center
        if (yTics.lblStep)  // we may have an axis label and no tick labels
        {
          // we have ticks, find width of longest tick label to position axis label
          let maxWid = yTics.majTics.reduce(function(acc, curr){
            let txtSize = getTextDimensions(toEngNotation(curr, lasty.exp).manStr);
            return Math.max(acc, txtSize.width);
          }, 0);
          yAxLbOfs += maxWid*xToPx;
          // ticks will be between axis and label, make gap bigger
          yAxLbOfs += ticLen;
          if (parms.yUnits.length>0) // add units if we have any
          { 
            yL = parms.yLabel+" ("+lasty.expStr+parms.yUnits+")";
          }
          else  // no units use scientific notation unless exponent ==0
          {
            yU = toSciNotation(10, lasty.exp);  // object 
            if (yU.expStr != "0") // dont draw sciNotation units if 10^0 
            {  // we have sciNotation units to draw (not == 10^0)
              yAxisLblObj = savThis.genSciNotationText(10, yU.expStr, {
                preText: parms.yLabel+"  (",       // prepend the axis label + "("
                postText: ")",           // append ")"
                lorg: lorg,
                strokeColor: txtCol,
                fontSize: parms.fontSize*1.1,
                fontWeight: parms.fontWeight,
                sclNonUniform: [1/savThis.yScale, 1/savThis.xScale, 1],
                zRot: rot,
                trans: [side*yAxLbOfs, y, 0]
              });
            }
            else
            {
              yL = parms.yLabel;
            }
          }
        }
        else if (parms.yLabel.length>0)  // just draw the ylabel (if any)
        {
          yL = parms.yLabel;
        }
        if (yL.length>0)
        {
          yAxisLblObj = new Text3D(yL, {
            lorg: lorg,
            strokeColor: txtCol,
            fontSize: parms.fontSize*1.1,
            fontWeight: parms.fontWeight,
            sclNonUniform: [1/savThis.yScale, 1/savThis.xScale, 1],
            zRot: rot,
            trans: [side*yAxLbOfs, y, 0]
          });
        }

        if (yAxisLblObj) yAxisGrp.addObj(yAxisLblObj); // If no Label and exponent == 0 then no label

        yAxisGrp.setProperty("z", zMin);
        yAxisGrp.setProperty("x", xMin);

      } /*  buildYaxis */

      function buildZaxis()
      {
        const exWidWC = exWid*xToPx,   // ticks are in x axis direction in world coords
              ticLen = 1.0*exWidWC, // ticks defined in pixels and drawn in world coords  
              majTicLen = 1.8*exWidWC;  
        let z,
            zTkLbOfs = 1.0*exWidWC,
            zAxLbOfs = 1.5*exWidWC,  // add label length etc later
            zL = "", 
            zU = "",
            zTics,
            lastz,   
            tickAryObj, 
            majTickAryObj, 
            majTickLblAry = []; 

        if (parms.zMinTic === null || parms.zMinTic === "auto")  // zMinTic===0 means no z ticks
        {
          zTics = new AxisTicsAuto(zMin, zMax, parms.zMajTic);
        }
        else
        {
          zTics = new AxisTicsManual(zMin, zMax, parms.zMinTic, parms.zMajTic);
        }
        // draw axis
        zAxisObj = new Path3D(['M', 0, 0, zMin, 'L', 0, 0, zMax], {
          lineWidth:1.5*lineWid,
          lineCap:"round",
          strokeColor:parms.gridColor
        }); 

        zAxisGrp.addObj(zAxisObj); 

        // Z axis tick marks
        if (zTics.ticStep)
        {
          let ticData = [];
          zTics.minTics.forEach(function(currZ){
            ticData = ticData.concat(['M', 0, 0, currZ, 'l', -ticLen/2, 0, 0]);
          })
          tickAryObj = new Path3D(ticData, {
            lineWidth: 1.5*lineWid,
            lineCap: "round",
            strokeColor: parms.gridColor});

          ticData = [];
          zTics.majTics.forEach(function(currZ){
            ticData = ticData.concat(['M', 0, 0, currZ, 'l', -majTicLen/2, 0, 0])
          })
          majTickAryObj = new Path3D(ticData, {
            lineWidth:1.5*lineWid,
            lineCap:"round",
            strokeColor:parms.gridColor});

          zAxisGrp.addObj(tickAryObj, majTickAryObj);

          // Draw the full grid
          if (true)
          {
            let gridData = [];
            zTics.majTics.forEach(function(currZ){
              gridData = gridData.concat(['M', 0, 0, currZ, 'l', xMax-xMin, 0, 0,
                                          'M', xMax-xMin, 0, currZ, 'l', 0, -(yMax-yMin), 0])
            })
            let gridAryObj = new Path3D(gridData, {
              lineWidth:0.5*lineWid,
              lineCap:"round",
              strokeColor:parms.gridColor});
            zAxisGrp.addObj(gridAryObj);
          }
          // calc y exponent of last tick and use for all label values
          lastz = toEngNotation(zTics.minTics[zTics.minTics.length-1]);
        }

        side = -1;
        // Z axis major tick labels (only if lblStep !-- 0)
        if (zTics.lblStep)
        {
          // Z axis, decide whether to label to right or left of Z axis
          lorg = 6;
          zTkLbOfs += 0.6*ticLen;

          zTics.majTics.forEach(function(z){
            // skip label at the origin if it would be on the other axis
            const lbl = new Text3D(toEngNotation(z, lastz.exp).manStr, {
              lorg:lorg,
              strokeColor: txtCol,
              fontSize: parms.fontSize,
              fontWeight: parms.fontWeight,
              fontFamily: parms.fontFamily,
              sclNonUniform: [1/savThis.xScale, 1/savThis.zScale, 1],  
              xRot: 90,
              trans: [side*zTkLbOfs, 0, z]
            });
            majTickLblAry.push(lbl);
          }); 
          zAxisGrp.addObj(majTickLblAry);
        }

        // Z axis label and units
        lorg = 2;
        rot = 90;    
        z = (zMin+zMax)/2; // label center
        if (zTics.lblStep)  // we may have an axis label and no tick labels or units
        {
          // we have ticks, find width of longest tick label to position axis label
          let maxWid = zTics.majTics.reduce(function(acc, curr){
            let txtSize = getTextDimensions(toEngNotation(curr, lastz.exp).manStr);
            return Math.max(acc, txtSize.width);
          }, 0);
          zAxLbOfs += maxWid*xToPx;
          // ticks will be between axis and label, make gap bigger
          zAxLbOfs += ticLen;
          if (parms.zUnits.length>0) // add units if we have any
          { 
            zL = parms.zLabel+" ("+lastz.expStr+parms.zUnits+")";
          }
          else
          {
            zU = toSciNotation(10, lastz.exp);  // object 
            if (zU.expStr != "0") // dont draw if sciNotation units 10^0 
            {  // we have sciNotation units to draw (not == 10^0)
              zAxisLblObj = savThis.genSciNotationText(10, zU.expStr, {
                preText: zL+"  (",       // prepend the axis label + "("
                postText: ")",           // append ")"
                lorg: lorg,
                strokeColor: txtCol,
                fontSize: parms.fontSize*1.1,
                fontWeight: parms.fontWeight,
                sclNonUniform: [1/savThis.zScale, 1/savThis.xScale, 1],
                rotX: rot,
                rotY: rot,
                trans: [side*zAxLbOfs, 0, z]
              });
            }
            else
            {  
              zL = parms.zLabel;
            }
          }
        }
        else if (parms.zLabel.length>0) // just draw the zlabel (if any)
        {
          zL = parms.zLabel;
        }
        if (zL.length>0)
        {
          zAxisLblObj = new Text3D(zL, {
            lorg: lorg,
            strokeColor: txtCol,
            fontSize: parms.fontSize*1.1,
            fontWeight: parms.fontWeight,
            sclNonUniform: [1/savThis.zScale, 1/savThis.xScale, 1],
            xRot: rot,
            yRot: rot,
            trans: [side*zAxLbOfs, 0, z]
          });
        }

        if (zAxisLblObj) zAxisGrp.addObj(zAxisLblObj); // If no Label and exponent == 0 then no label

        zAxisGrp.setProperty("x", xMin);
        zAxisGrp.setProperty("y", yMax);

      } /*  buildZaxis */

      // build the gridbox outline
      const gbEdgeObj = new Path3D(
        [ "M", xMin, yMax, zMin, "l",xMax - xMin,0,0, "M", xMin, yMax, zMax, "l",xMax - xMin,0,0,
          "M", xMax, yMin, zMin, "l",0,yMax - yMin,0, "M", xMax, yMin, zMax, "l",0,yMax - yMin,0,
          "M", xMax, yMin, zMin, "l",0,0,zMax - zMin, "M", xMax, yMax, zMin, "l",0,0,zMax - zMin], 
        {strokeColor:parms.gridColor});

      buildXaxis();
      buildYaxis();
      buildZaxis();
  
      this.axesGrp = new Group3D;
      this.axesGrp.addObj(gbEdgeObj, xAxisGrp, yAxisGrp, zAxisGrp);
      this.axesGrp.setProperty("sclNonUniform", [this.xScale, this.yScale, this.zScale]);
      this.axesGrp.setProperty("trans", [-this.xOffset, -this.yOffset, -this.zOffset]);

      this.gc.render(this.axesGrp);
    }

    genSciNotationText(manStr, expStr, options) 
    {
      let   man = (typeof manStr === 'string')? manStr: manStr.toString();
      const exp = (typeof expStr === 'string')? expStr: expStr.toString(),
            opts = (typeof options === 'object')? options: {},   // avoid undeclared object errors
            fntSz = opts.fontSize || this.gc.fontSize,
            fntWt = opts.fontWeight || this.gc.fontWeight, // weight in string or number 100..900
            txtCol = opts.strokeColor || this.gc.penCol,
            preTxt = opts.preText || "", 
            postTxt = opts.postText || "", 
            lorg = opts.lorg || 7,
            sizeRatio = fntSz/33,       // size/33 is scale factor to match Hershey font size to canvas font size
            txtGrp = new Group3D();
      let lorigin = 7,               // locate origin
          dx, dy, 
          expObj, 
          expWid = 0, 
          expHgt = 0,
          postTxtObj;   
      
      if (typeof(preTxt) === "string")
      {
        man = preTxt+man;
      }
  
      // make the mantissa Object
      const manObj = new Text3D(man, {    
        lorg: 7,                        // must use 7 to allow fiddling with height to posiiton the exponent
        strokeColor: txtCol,
        fontSize: fntSz,
        fontWeight: fntWt });
      const manWid = sizeRatio*manObj.width/this.gc.xscl; // convert to World Coords lengths
      const manHgt = -sizeRatio*manObj.height/this.gc.yscl;    
      // mantissa bounding box
      const manBB = { ul:{x: 0, y: manHgt},
                      ll:{x: 0, y: 0},
                      lr:{x:manWid, y: 0},
                      ur:{x:manWid, y: manHgt} };   
  
      // now make the exponent Object
      if (exp != "")
      {
        expObj = new Text3D(exp, {    
          lorg: 7,
          strokeColor: txtCol,
          fontSize: 0.7*fntSz,
          fontWeight: fntWt,
          x: manBB.ur.x, // shift exp to upper right of mantissa (we are moving a lorg 7 so shift down
          y: manBB.ur.y-expHgt });
        expWid = 0.7*sizeRatio*expObj.width/this.gc.xscl;
        expHgt = 0.7*-sizeRatio*expObj.height/this.gc.yscl;
      }
      // now make the postText object
      if (postTxt)
      {
        postTxtObj = new Text3D(postTxt, {    
          lorg: 7,               // must use 7 to allow fiddling with height to position the exponent
          strokeColor: txtCol,
          fontSize: fntSz,
          fontWeight: fntWt,
          x: manBB.lr.x + expWid, // shift exp to upper right of mantissa (we are moving a lorg 7 so shift down by expHgt)
          y: manBB.lr.y });
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
    
      txtGrp.addObj(manObj);
      if (expObj) txtGrp.addObj(expObj);
      if (postTxtObj) txtGrp.addObj(postTxtObj);
      txtGrp.setProperty("x", dx);
      txtGrp.setProperty("y", dy); 
      // save the width & height as a properties (used for axes label positioning)
      txtGrp.width = wid; 
      txtGrp.height = hgt;
  
      return txtGrp; 
    }
  
    initZoomTurn()
    {
      const savThis = this,
            arw = ['m',-7,-2,0,'l',7,5,0,7,-5,0],
            crs = ['m',-6,-6,0,'l',12,12,0,'m',0,-12,0,'l',-12,12,0],
            pls = ['m',-7,0,0,'l',14,0,0,'m',-7,-7,0,'l',0,14,0],
            mns = ['m',-7,0,0,'l',14,0,0],
            g = this.gc,
            zGrp = new Group3D();

      function zoom(z)
      {
        const org = g.toPixelCoords(0, 0, 0),
              cx = g.rawWidth/2 - org.x,
              cy = g.rawHeight/2 - org.y;
  
        g.xoffset += cx - cx/z;
        g.yoffset += cy - cy/z;
        g.xscl /= z;
        g.yscl /= z;
        savThis.drawGraph();
      }
  
      function turn(sy, sx)
      {
        savThis.xRot += sx;
        savThis.zRot += sy;
        if (savThis.xRot > 90) savThis.xRot = 90;
        if (savThis.xRot < 0) savThis.xRot = 0;
        if (savThis.zRot > 90) savThis.zRot = 90;
        if (savThis.zRot < 0) savThis.zRot = 0;
        savThis.drawGraph();
      }
  
      function resetZoomPan()
      {
        g.xscl = g.savWC.xscl;
        g.yscl = g.savWC.yscl;
        g.xoffset = g.savWC.xoffset;
        g.yoffset = g.savWC.yoffset;
        savThis.xRot = 20;
        savThis.zRot = 35;
  
        savThis.drawGraph();
      }
  
      const cvsStk = new CanvasStack(g.cId);
      cvsStk.deleteAllLayers();
      const ovlId = cvsStk.createLayer();     // create a layer for the zoom controls
      // modify the size of the controls canvas so as not to block events on bkgCanvas
      const w = 111;
      const h = 78;
      const ctrlCvs = document.getElementById(ovlId);
      ctrlCvs.style.left = (g.cnvs.offsetLeft+g.cnvs.clientLeft+g.cnvs.offsetWidth-w-3)+'px';
      ctrlCvs.style.top = (g.cnvs.offsetTop+g.cnvs.clientTop+3)+'px';
      ctrlCvs.style.width = w+'px';
      ctrlCvs.style.height = h+'px';

      // setup zpGC as the drawing context for zoom controls layer
      const zpGC = new Cango3D(ovlId);
      zpGC.setWorldCoords3D(-zpGC.rawWidth+40, -zpGC.rawHeight+40, zpGC.rawWidth);

      // make a shaded rectangle for the controls
      const bkg = new Panel3D(shapeDefs.rectangle(w,h), {x:-17, fillColor: "rgba(0, 50, 0, 0.12)"});
      const rst = new Panel3D(shapeDefs.rectangle(20, 20), {fillColor:"rgba(0,0,0,0.2)"});
      rst.enableDrag(null, null, resetZoomPan);
      const rgt = new Panel3D(shapeDefs.rectangle(20, 20), {x:22, fillColor:"rgba(0,0,0,0.2)"});
      rgt.enableDrag(null, null, function(){turn(5, 0);});
      const up = new Panel3D(shapeDefs.rectangle(20, 20), {y:22, fillColor:"rgba(0,0,0,0.2)"});
      up.enableDrag(null, null, function(){turn(0, -5);});
      const lft = new Panel3D(shapeDefs.rectangle(20, 20, 2), {x:-22, fillColor:"rgba(0,0,0,0.2)"});
      lft.enableDrag(null, null, function(){turn(-5, 0);});
      const dn = new Panel3D(shapeDefs.rectangle(20, 20, 2), {y:-22, fillColor:"rgba(0,0,0,0.2)"});
      dn.enableDrag(null, null, function(){turn(0, 5);});
      const zin = new Panel3D(shapeDefs.rectangle(20, 20, 2), {x:-56, y:11, fillColor:"rgba(0,0,0,0.2)"});
      zin.enableDrag(null, null, function(){zoom(1/1.2);});
      const zout = new Panel3D(shapeDefs.rectangle(20, 20, 2), {x:-56, y:-11, fillColor:"rgba(0,0,0,0.2)"});
      zout.enableDrag(null, null, function(){zoom(1.2);});
      const arwU = new Path3D(arw, {y:22, strokeColor:"white", lineWidth:2});
      const arwR = new Path3D(arw, {rotZ:-90, x:22, strokeColor:"white", lineWidth:2});
      const arwL = new Path3D(arw, {rotZ:90, x:-22, strokeColor:"white", lineWidth:2});
      const arwD = new Path3D(arw, {rotZ:180, y:-22, strokeColor:"white", lineWidth:2});
      const plsObj = new Path3D(pls, {x:-56, y:11, strokeColor:"white", lineWidth:2});
      const mnsObj = new Path3D(mns, {x:-56, y:-11, strokeColor:"white", lineWidth:2});
      const crsObj = new Path3D(crs, {strokeColor:"white", lineWidth:2});
      zGrp.addObj(bkg, rst, rgt, up, lft, dn, zin, zout, arwU, arwR, arwL, arwD, plsObj, mnsObj, crsObj);

      // handle canvas resize 
      function resizeHandler()
      {
        ctrlCvs.style.left = (g.cnvs.offsetLeft+g.cnvs.clientLeft+g.cnvs.offsetWidth-w-3)+'px';
        ctrlCvs.style.top = (g.cnvs.offsetTop+g.cnvs.clientTop+3)+'px';
        ctrlCvs.style.width = w+'px';
        ctrlCvs.style.height = h+'px';
        ctrlCvs.width = w;
        ctrlCvs.height = h;
        zpGC.render(zGrp, "noclear");
      }
      cvsStk.addResizeCallback(resizeHandler);
      zpGC.render(zGrp, "noclear");
    }

  }  // Graph3D
}())