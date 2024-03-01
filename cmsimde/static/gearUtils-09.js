/*==========================================================================
  Filename: gearUtils-09.js
  By: Dr A.R.Collins

  JavaScript involute gear drawing utilities.
  Requires:
  'involuteBezCoeffs' can stand alone,
  'createGearTooth' and 'createIntGearTooth' generate SVG path data draw 
  commands defing the gear tooth profile.

  Kindly give credit to Dr A.R.Collins <http://www.arc.id.au/>
  Report bugs to tony at arc.id.au

  Date   |Description                                                   |By
  --------------------------------------------------------------------------
  20Feb13 First public release                                           ARC
  21Feb13 Clarified variable names of start and end parameters           ARC
  06Mar13 Fixed Rf and filletAngle calculations                          ARC
  25Jun13 Code tidy for JSLint, use strict                               ARC
  16Mar15 Convert sweep direction of "A" commands for RHC coordinates    ARC
  05Apr19 Add createGearOutline and createIntGearOutline                 ARC
  06Apr19 Added shaft circle to the outline path data                    ARC
  ==========================================================================*/

  // exposed globals
  var involuteBezCoeffs, 
      createGearTooth, createIntGearTooth, 
      createGearOutline, createIntGearOutline;

(function()
{
  "use strict";
  /* ----------------------------------------------------------
   * involuteBezCoeffs
   *
   * JavaScript calculation of Bezier coefficients for
   * Higuchi et al. approximation to an involute.
   * ref: YNU Digital Eng Lab Memorandum 05-1
   *
   * Parameters:
   * module - sets the size of teeth (see gear design texts)
   * numTeeth - number of teeth on the gear
   * pressure angle - angle in degrees, usually 14.5 or 20
   * order - the order of the Bezier curve to be fitted [3, 4, 5, ..]
   * fstart - fraction of distance along tooth profile to start
   * fstop - fraction of distance along profile to stop
   *-----------------------------------------------------------*/
  involuteBezCoeffs = function(module, numTeeth, pressureAngle, order, fstart, fstop)
  {
    var PI = Math.PI,
        Rpitch = module*numTeeth/2,       // pitch circle radius
        phi = pressureAngle || 20,        // pressure angle
        Rb = Rpitch*Math.cos(phi*PI/180), // base circle radius
        Ra = Rpitch+module,               // addendum radius (outer radius)
        p = order || 3,                   // order of Bezier approximation
        ta = Math.sqrt(Ra*Ra-Rb*Rb)/Rb,   // involute angle at addendum
        stop = fstop || 1,
        start = 0.01,
        te, ts,
        bzCoeffs = [],
        i, bcoeff;

    function chebyExpnCoeffs(j, func)
    {
      var N = 50,      // a suitably large number  N>>p
          c = 0,
          k;

      for (k=1; k<=N; k++)
      {
        c += func(Math.cos(PI*(k-0.5)/N)) * Math.cos(PI*j*(k-0.5)/N);
      }
      return 2*c/N;
    }

    function chebyPolyCoeffs(p, func)
    {
      var coeffs = [],
          fnCoeff = [],
          T = [[], []],
          i, j, k, pwr;

      // populate 1st 2 rows of T
      for (i=0; i<p+1; i++)
      {
        T[0][i] = 0;
        T[1][i] = 0;
      }
      T[0][0] = 1;
      T[1][1] = 1;
      /* now generate the Chebyshev polynomial coefficient using
         formula T(k+1) = 2xT(k) - T(k-1) which yields
      T = [ [ 1,  0,  0,  0,  0,  0],    // T0(x) =  +1
            [ 0,  1,  0,  0,  0,  0],    // T1(x) =   0  +x
            [-1,  0,  2,  0,  0,  0],    // T2(x) =  -1  0  +2xx
            [ 0, -3,  0,  4,  0,  0],    // T3(x) =   0 -3x    0   +4xxx
            [ 1,  0, -8,  0,  8,  0],    // T4(x) =  +1  0  -8xx       0  +8xxxx
            [ 0,  5,  0,-20,  0, 16],    // T5(x) =   0  5x    0  -20xxx       0  +16xxxxx
            ...                     ];
      */
      for (k=1; k<p+1; k++)
      {
        T[k+1] = [0];
        for (j=0; j<T[k].length-1; j++)
        {
          T[k+1][j+1] = 2*T[k][j];
        }
        for (j=0; j<T[k-1].length; j++)
        {
          T[k+1][j] -= T[k-1][j];
        }
      }
      // convert the chebyshev function series into a simple polynomial
      // and collect like terms, out T polynomial coefficients
      for (k=0; k<=p; k++)
      {
        fnCoeff[k] = chebyExpnCoeffs(k, func);
        coeffs[k] = 0;
      }
      for (k=0; k<=p; k++)
      {
        for (pwr=0; pwr<=p; pwr++)    // loop thru powers of x
        {
          coeffs[pwr] += fnCoeff[k]*T[k][pwr];
        }
      }
      coeffs[0] -= chebyExpnCoeffs(0, func)/2;  // fix the 0th coeff

      return coeffs;
    }

    // Equation of involute using the Bezier parameter t as variable
    function involuteXbez(t)
    {
      // map t (0 <= t <= 1) onto x (where -1 <= x <= 1)
      var x = t*2-1;
      //map theta (where ts <= theta <= te) from x (-1 <=x <= 1)
      var theta = x*(te-ts)/2 + (ts + te)/2;
      return Rb*(Math.cos(theta)+theta*Math.sin(theta));
    }

    function involuteYbez(t)
    {
          // map t (0 <= t <= 1) onto x (where -1 <= x <= 1)
      var x = t*2-1,
          //map theta (where ts <= theta <= te) from x (-1 <=x <= 1)
          theta = x*(te-ts)/2 + (ts + te)/2;

      return Rb*(Math.sin(theta)-theta*Math.cos(theta));
    }

    function binom(n, k)
    {
      var coeff = 1,
          i;

      for (i = n-k+1; i <= n; i++)
      {
        coeff *= i;
      }
      for (i = 1; i <= k; i++)
      {
        coeff /= i;
      }

      return coeff;
    }

    function bezCoeff(i, func)
    {
      // generate the polynomial coeffs in one go
      var polyCoeffs = chebyPolyCoeffs(p, func),
          bc, j;

      for (bc=0, j=0; j<=i; j++)
      {
        bc += binom(i,j)*polyCoeffs[j]/binom(p,j);
      }
      return bc;
    }

    if ((fstart !== undefined)&&(fstart<stop))
    {
      start = fstart;
    }
    te = Math.sqrt(stop)*ta;          // involute angle, theta, at end of approx
    ts = Math.sqrt(start)*ta;         // involute angle, theta, at start of approx
    // calc Bezier coeffs
    for (i=0; i<=p; i++)
    {
      bcoeff = {};
      bcoeff.x = bezCoeff(i, involuteXbez);
      bcoeff.y = bezCoeff(i, involuteYbez);
      bzCoeffs.push(bcoeff);
    }

    return bzCoeffs;
  };

  function rotate(pt, rads)  // rotate pt {x: , y: } by rads radians about origin
  {
    var sinA = Math.sin(rads),
        cosA = Math.cos(rads);

    return {x: pt.x*cosA - pt.y*sinA,
            y: pt.x*sinA + pt.y*cosA};
  }

  function toCartesian(radius, angle)   // convert polar coords to cartesian
  {
    return {x: radius*Math.cos(angle),
            y: radius*Math.sin(angle)};
  }

  function genInvolutePolar(Rb, R)  // Rb = base circle radius
  {
    // returns the involute angle as function of radius R.
    return (Math.sqrt(R*R - Rb*Rb)/Rb) - Math.acos(Rb/R);
  }

  /*----------------------------------------------------------
    genGearToothData
    Creates an array of drawing commands and their coordinates
    to draw a single spur gear tooth based on a circle
    involute using the metric gear standards. Pseudo SVG path 
    data array is returned. Each coord is an object {x: , y: } 
    suitable for rotation by later processing if required.
   ----------------------------------------------------------*/
  function genGearToothData(m, Z, phi)
  {
    // ****** external gear specifications
    var addendum = m,                                   // distance from pitch circle to tip circle
        dedendum = 1.25*m,                              // pitch circle to root, sets clearance
        clearance = dedendum - addendum,
        // Calculate radii
        Rpitch = Z*m/2,                                 // pitch circle radius
        Rb = Rpitch*Math.cos(phi*Math.PI/180),          // base circle radius
        Ra = Rpitch + addendum,                         // tip (addendum) circle radius
        Rroot = Rpitch - dedendum,                      // root circle radius
        fRad = 1.5*clearance,                           // fillet radius, max 1.5*clearance
        Rf,                                             // radius at top of fillet
        // ****** calculate angles (all in radians)
        pitchAngle = 2*Math.PI/Z,                       // angle subtended by whole tooth (rads)
        baseToPitchAngle = genInvolutePolar(Rb, Rpitch),
        pitchToFilletAngle = baseToPitchAngle,          // profile starts at base circle
        filletAngle = Math.atan(fRad/(fRad+Rroot)),     // radians
        fe, fs, fm,
        dedBz, addBz, inv, invR,
        fillet, filletR, filletNext,
        rootR, rootNext,
        pt, i, data;
 
    Rf = Math.sqrt((Rroot+fRad)*(Rroot+fRad)-(fRad*fRad)); // radius at top of fillet
    if (Rb < Rf)
    {
      Rf = Rroot+clearance;
    }
    if (Rf > Rb)                   // start profile at top of fillet (if its greater)
    {
      pitchToFilletAngle -= genInvolutePolar(Rb, Rf);
    }
    // ****** generate Higuchi involute approximation
    fe = 1;                    // fraction of profile length at end of approx
    fs = 0.01;                 // fraction of length offset from base to avoid singularity
    if (Rf > Rb)
    {
      fs = (Rf*Rf-Rb*Rb)/(Ra*Ra-Rb*Rb);  // offset start to top of fillet
    }
    // approximate in 2 sections, split 25% along the involute
    fm = fs+(fe-fs)/4;         // fraction of length at junction (25% along profile)
    dedBz = involuteBezCoeffs(m, Z, phi, 3, fs, fm);
    addBz = involuteBezCoeffs(m, Z, phi, 3, fm, fe);
    // join the 2 sets of coeffs (skip duplicate mid point)
    inv = dedBz.concat(addBz.slice(1));
    //create the back profile of tooth (mirror image)
    invR = [];                // involute profile along back of tooth
    for (i=0; i<inv.length; i++)
    {
      // rotate all points to put pitch point at y = 0
      pt = rotate(inv[i], -baseToPitchAngle-pitchAngle/4);
      inv[i] = pt;
      // generate the back of tooth profile nodes, mirror coords in X axis
      invR[i] = {x:pt.x, y:-pt.y};
    }
    // ****** calculate section junction points R=back of tooth, Next=front of next tooth)
    fillet = toCartesian(Rf, -pitchAngle/4-pitchToFilletAngle); // top of fillet
    filletR = {x:fillet.x, y:-fillet.y};   // flip to make same point on back of tooth
    rootR = toCartesian(Rroot, pitchAngle/4+pitchToFilletAngle+filletAngle);
    rootNext = toCartesian(Rroot, 3*pitchAngle/4-pitchToFilletAngle-filletAngle);
    filletNext = rotate(fillet, pitchAngle);  // top of fillet, front of next tooth
    // ****** create the drawing command data array for the tooth
    data = [];
    data.push("M", fillet);           // start at top of fillet
    if (Rf < Rb)
    {
      data.push("L", inv[0]);         // line from fillet up to base circle
    }
    data.push("C", inv[1], inv[2], inv[3], inv[4], inv[5], inv[6]);
    data.push("A", Ra, Ra, 0, 0, 1, invR[6]); // arc across addendum circle, sweep 1 for RHC, 0 for SVG
    data.push("C", invR[5], invR[4], invR[3], invR[2], invR[1], invR[0]);
    if (Rf < Rb)
    {
      data.push("L", filletR);       // line down to top of fillet
    }
    if (rootNext.y > rootR.y)    // is there a section of root circle between fillets?
    {
      data.push("A", fRad, fRad, 0, 0, 0, rootR); // back fillet, sweep 0 for RHC, 1 for SVG
      data.push("A", Rroot, Rroot, 0, 0, 1, rootNext); // root circle arc, sweep 1 for RHC, 0 for SVG
    }
    data.push("A", fRad, fRad, 0, 0, 0, filletNext); // sweep 0 for RHC, 1 for SVG
 
    return data;  // return an array of pseudo SVG path data
  }
 
  createGearTooth = function(module, teeth, pressureAngle, rotRads)
  {
    // ****** external gear specifications
    var m = module,                                     // Module = mm of pitch diameter per tooth
        Z = teeth,                                      // Number of teeth
        phi = pressureAngle || 20,                      // pressure angle (degrees)
        rot = rotRads || 0,
        pt,
        inData = genGearToothData(m, Z, phi),   // generate the tooth profile
        outData = [],
        i;

    // apply arbitrary rotation "rot" to each data point
    for (i=0; i<inData.length; i++)
    {
      if (inData[i].x !== undefined)  // skip strings get coords
      {
        pt = rotate(inData[i], rot);  // rotate the point
        outData.push(pt.x, pt.y);     // add the rotated coords to output
      }
      else
      {
        outData.push(inData[i]);  // string commands go straight to the output
      }
    }

    return outData;  // return an array of SVG format draw commands
  };

  /*----------------------------------------------------------
    genIntGearToothData
    Create an array of drawing commands and their coordinates
    to draw a single internal (ring)gear tooth based on a
    circle involute using the metric gear standards. Pseudo SVG 
    path data array is returned. Each coord is an object {x: , y: } 
    suitable for rotation by later processing if required.
   ----------------------------------------------------------*/
  function genIntGearToothData(m, Z, phi)
  {
    // ****** gear specifications
    var addendum = 0.6*m,                         // pitch circle to tip circle (ref G.M.Maitra)
        dedendum = 1.25*m,                        // pitch circle to root radius, sets clearance
        // Calculate radii
        Rpitch = Z*m/2,                           // pitch radius
        Rb = Rpitch*Math.cos(phi*Math.PI/180),    // base radius
        Ra = Rpitch - addendum,                   // addendum radius
        Rroot = Rpitch + dedendum,                // root radius
        clearance = 0.25*m,                       // gear dedendum - pinion addendum
        Rf = Rroot - clearance,                   // radius of top of fillet (end of profile)
        fRad = 1.5*clearance,                     // fillet radius, 1 .. 1.5*clearance
        pitchAngle,                               // angle between teeth (rads)
        baseToPitchAngle,
        tipToPitchAngle,
        pitchToFilletAngle,
        filletAngle,
        fe, fs, fm,
        addBz, dedBz,
        inv, invR,
        pt, i, data,
        fillet, filletNext,
        tip, tipR,
        rootR, rootNext;

    // ****** calculate subtended angles
    pitchAngle = 2*Math.PI/Z;                       // angle between teeth (rads)
    baseToPitchAngle = genInvolutePolar(Rb, Rpitch);
    tipToPitchAngle = baseToPitchAngle;             // profile starts from base circle
    if (Ra > Rb)
    {
      tipToPitchAngle -= genInvolutePolar(Rb, Ra);  // start profile from addendum
    }
    pitchToFilletAngle = genInvolutePolar(Rb, Rf) - baseToPitchAngle;
    filletAngle = 1.414*clearance/Rf;               // to make fillet tangential to root
    // ****** generate Higuchi involute approximation
    fe = 1;                   // fraction of involute length at end of approx (fillet circle)
    fs = 0.01;                 // fraction of length offset from base to avoid singularity
    if (Ra > Rb)
    {
      fs = (Ra*Ra-Rb*Rb)/(Rf*Rf-Rb*Rb);    // start profile from addendum (tip circle)
    }
    // approximate in 2 sections, split 25% along the profile
    fm = fs+(fe-fs)/4;        //
    addBz = involuteBezCoeffs(m, Z, phi, 3, fs, fm);
    dedBz = involuteBezCoeffs(m, Z, phi, 3, fm, fe);
    // join the 2 sets of coeffs (skip duplicate mid point)
    invR = addBz.concat(dedBz.slice(1));
    //create the front profile of tooth (mirror image)
    inv = [];         // back involute profile
    for (i=0; i<invR.length; i++)
    {
      // rotate involute to put center of tooth at y = 0
      pt = rotate(invR[i], pitchAngle/4-baseToPitchAngle);
      invR[i] = pt;
      // generate the back of tooth profile, flip Y coords
      inv[i] = {x:pt.x, y:-pt.y};
    }
    // ****** calculate coords of section junctions
    fillet = {x:inv[6].x, y:inv[6].y};    // top of fillet, front of tooth
    tip = toCartesian(Ra, -pitchAngle/4+tipToPitchAngle);  // tip, front of tooth
    tipR = {x:tip.x, y:-tip.y};  // addendum, back of tooth
    rootR = toCartesian(Rroot, pitchAngle/4+pitchToFilletAngle+filletAngle);
    rootNext = toCartesian(Rroot, 3*pitchAngle/4-pitchToFilletAngle-filletAngle);
    filletNext = rotate(fillet, pitchAngle);  // top of fillet, front of next tooth
    // ****** create the drawing command data array for the tooth
    data = [];
    data.push("M", inv[6]);  // start at top of front profile
    data.push("C", inv[5], inv[4], inv[3], inv[2], inv[1], inv[0]);
    if (Ra < Rb)
    {
      data.push("L", tip);  // line from end of involute to addendum (tip)
    }
    data.push("A", Ra, Ra, 0, 0, 1, tipR); // arc across tip circle, sweep 1 for RHC, 0 for SVG
    if (Ra < Rb)
    {
      data.push("L", invR[0]);  // line from addendum to start of involute
    }
    data.push("C", invR[1], invR[2], invR[3], invR[4], invR[5], invR[6]);
    if (rootR.y < rootNext.y)    // there is a section of root circle between fillets
    {
      data.push("A", fRad, fRad, 0, 0, 1, rootR); // fillet on back of tooth, sweep 1 for RHC, 0 for SVG
      data.push("A", Rroot, Rroot, 0, 0, 1, rootNext); // root circle arc, sweep 1 for RHC, 0 for SVG
    }
    data.push("A", fRad, fRad, 0, 0, 1, filletNext); // fillet on next, sweep 1 for RHC, 0 for SVG 

    return data;  // return an array of SVG format draw commands
  }

  createIntGearTooth = function(module, teeth, pressureAngle, rotRads)
  {
    // ****** external gear specifications
    var m = module,                                     // Module = mm of pitch diameter per tooth
        Z = teeth,                                      // Number of teeth
        phi = pressureAngle || 20,                      // pressure angle (degrees)
        rot = rotRads || 0,
        pt,
        inData = genIntGearToothData(m, Z, phi),   // generate the tooth profile
        outData = [],
        i;

    // apply arbitrary rotation "rot" to each data point
    for (i=0; i<inData.length; i++)
    {
      if (inData[i].x !== undefined)  // skip strings get coords
      {
        pt = rotate(inData[i], rot);  // rotate the point
        outData.push(pt.x, pt.y);     // add the rotated coords to output
      }
      else
      {
        outData.push(indata[i]);  // string commands go straight to the output
      }
    }

    return outData;  // return an array of SVG format draw commands
  };

  function rotateTooth(inData, rotRads)
  {
    var rot = rotRads || 0,
        outData = [],
        pt,
        i;
    // apply arbitrary rotation "rot" to each data point
    for (i=0; i<inData.length; i++)
    {
      if (inData[i].x !== undefined) // skip strings get coords
      {
        pt = rotate(inData[i], rot);  // rotate the point
        outData.push(pt.x, pt.y);     // add the rotated coords to output
      }
      else
      {
        outData.push(inData[i]);  // string commands go straight to the output
      }
    }
    return outData;  // return an array of SVG format draw commands
  }

  createGearOutline = function(module, teeth, pressureAngle, shaftRadius)
  {
    var m = module,                                     // Module = mm of pitch diameter per tooth
        Z = teeth,                                      // Number of teeth
        phi = pressureAngle || 20,                      // pressure angle (degrees)
        toothData = genGearToothData(m, Z, phi),   // generate the tooth profile
        rotToothData,
        gearData,
        r,
        i;                      

    rotToothData = rotateTooth(toothData); // convert the first tooth into SVG data format
    gearData = [].concat(rotToothData);    // add the unrotated first tooth (including initial "M",x,y)
    for (i=1; i<Z; i++)
    {
      rotToothData = rotateTooth(toothData, 2*Math.PI*i/teeth); // rotate the tooth to its postiton
      gearData.push(...rotToothData.slice(3));  // skip the intial "M",x,y command to make path continuos
    }
    gearData.push("Z");  // close the path so it will fill correctly
    if (shaftRadius && shaftRadius>0)
    {
      r = shaftRadius;
      gearData.push("M",-r,0, "a", r,r, 0,1,0, r*2,0, "a", r,r, 0,1,0, -r*2,0, "z");
    }

    return gearData;
  };

  createIntGearOutline = function(module, teeth, pressureAngle, rimRadius)
  {
    var m = module,                                     // Module = mm of pitch diameter per tooth
        Z = teeth,                                      // Number of teeth
        phi = pressureAngle || 20,                      // pressure angle (degrees)
        toothData = genIntGearToothData(m, Z, phi),   // generate the tooth profile
        rotToothData,
        gearData, 
        r,
        i;               

    rotToothData = rotateTooth(toothData); // convert the first tooth into SVG dta format
    gearData = [].concat(rotToothData);    // add the unrotated first tooth (including initial "M",x,y)
    for (i=1; i<Z; i++)
    {
      rotToothData = rotateTooth(toothData, 2*Math.PI*i/teeth); // rotate the tooth to its postiton
      gearData.push(...rotToothData.slice(3));  // skip the intial "M",x,y command to make path continuos
    }
    gearData.push("Z");  // close the path so it will fill correctly
    if (rimRadius && rimRadius>0)
    {
      r = rimRadius;
      gearData.push("M", -r,0, "a", r,r, 0,1,0, r*2,0, "a", r,r, 0,1,0, -r*2,0, "z");
    }

    return gearData;
  };

}());
