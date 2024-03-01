/*============================================================================
  Filename: Cango3D-11v00.js
  By: A.R.Collins

  A basic 3D graphics interface for the canvas
  element using Right Handed coordinate system.

  Kindly give credit to Dr A R Collins <http://www.arc.id.au/>
  Report bugs to tony at arc.id.au

  Date   |Description                                                     |By
  ----------------------------------------------------------------------------
  05May13 First beta of Ver 3 after major re-write                         ARC
  17May13 Released as 3v19                                                 ARC
  09Sep13 Released as 4v00                                                 ARC
  04Jun14 Released as 5v00                                                 ARC
  28Jun14 Released as 6v00                                                 ARC
  16Aug14 Released as 7v00                                                 ARC
  25May17 Released as 8v00                                                 ARC
  20Aug19 Removed out of date JavaScript code                              ARC
  30Aug19 bugfix: Default lineWidth ignored                                ARC
  31Aug19 Added scaleNonUniform transform                                  ARC
  09Sep19 Expose RGBAColor as global                                       ARC
  13Sep19 Added rectangle to shapeDefs3D, added savWC for zoom and turn    ARC
  16Sep19 Added support to stroke border on Shape3D                        ARC
  23Sep19 Added support for world coordinate line width by lineWidthWC     ARC
  01Oct19 Convert to use Class, const, let etc                             ARC
  04Oct19 Match the order of applying hard and soft matrix transforms      ARC
  08Oct19 bugfix: Obj3D option backHidden not being honoured               ARC
  09Oct19 bugfix: Obj3D.disableDrag referencing Cango3D not Cango3D.cnvs   
          bugfix: Fix Drag3D.grabOfs for Group3D children                  ARC
  24Oct19 Clone copy with new object.constructor not {}                    ARC
  26Oct19 Removed Obj3DtoJSON, JSONtoObj3D, can't avoid too much recursion ARC
  29Oct19 Added x,y,z,xRot,yRot,zRot,scl to option properties              ARC
  09Nov19 Added Group3D.setProperty for recursive application to children  ARC
  11Nov19 Iterate over options in order of insertion (ok in ES 2015)
          Apply soft transforms in insertion order (delete REV tfm)        ARC
  12Nov19 Add rotateX, rotateY, rotateZ methods                            ARC
  13Nov19 Rename xRot, yRot, zRot to rotX, rotY, rotZ
          Added properties: trans, sclNonUniform                           ARC
  25Nov19 bugfix: objectOfRevolution had bad default fillColor
          Added objectOfExtrusion                                          ARC
  27Nov19 bugfix: revWinding clipping array length by 1                    ARC
  02Dec19 Added ObjOfExtrusion support for open paths                      ARC
  07Dec19 Delay hard transform execution                                   ARC
  08Dec19 Add Panel3D object 
          Rename grp.tagFirstChild to tagChildPanel and re-write           ARC
  12Dec19 Add fontSizeZC to handle zoom re-scaling                         ARC
  16Dec19 shapeDef3D renamed to shapeDefs and now output 2D SVG            ARC
  18Dec19 Use 2D SVG profile to make objectByRotation, drop 'offset' parm
          Added objectByExtrusion and surfaceByExtrusion made from 2D SVG  ARC
  22Dec19 Make ..Revolution, ..Extrusion etc functions not Cango3D methods ARC
  24Dec19 Re-write Cgo3Dsegs.joinPath to be similar to Cango SVGsegs.join  ARC
  27Dec19 Made toPixelCoords, toWorldCoords only applicable to XY plane    ARC
  30Dec19 Released as 9v00                                                 ARC
  18Jan20 bugfix: shapeDefs.ellipse invalid first coordinate               ARC
  01Mar20 Added support for Cango3DAnimation extension                     ARC
  10Mar20 bugfix: remove abs from scaleNonUniform factors                  ARC
  03Apr20 Add flatColor option
          Expand FOV values to 0 to 60 degrees                             ARC
  18Apr20 Add support for RadialGradient fill and stroke colors            ARC
  23Apr20 bugfix: normal for straight lines
          Move centroid of straight lines to the line start                ARC
  27Apr20 Added support for Sphere3D object                                ARC
  02May20 Added hard transform support to Sphere3D                         ARC
  10May20 Fixed the Sphere3D color change using oToSangle                  ARC
  20May20 bugfix: centroid not translated for lightSource (sun) Sphere3Ds  ARC
  29May20 Simplify by using spherical coords                               ARC
  30May20 Released as 10v00                                                ARC
  09Jun20 bugfix: avoid divide by 0 in 2D projections and gradient calcs
          bugfix: undeclared var in Cgo3Dsegs.appendPath                   ARC
  10Aug20 bugfix: calcSphereShading not called if no transforms applied    ARC
  11Aug20 Removed unused ofsTfm matrix                                     ARC
  15Nov20 Convert transforms to use DOMMatrix                              ARC
  21Jan21 Released as 11v00                                                ARC
  ============================================================================*/

  // exposed globals
  var Cango3D, Group3D, Path3D, Panel3D, Shape3D, Text3D, Sphere3D,
      Cgo3Dsegs,
      svgToCgo3D, // SVG path data conversion utility function
      calcNormal, calcIncAngle,
      objectByRevolution3D, objectByExtrusion3D, surfaceByExtrusion3D,
      RGBAColor,
      shapeDefs; // predefined geometric shapes in SVG format

(function()
{
  "use strict";

  const types = ["GROUP", "PATH", "PANEL", "SHAPE", "TEXT"];

function clone(obj)
{
  if (obj === null || obj === undefined)
  {
    return obj;
  }
  if (obj instanceof DOMMatrix)
  {
    return new DOMMatrix(obj);
  }
  const nObj = (Array.isArray(obj)) ? [] : new obj.constructor();

  for (let i in obj)
  {
    if (obj[i] && typeof obj[i] === "object")
    {
      nObj[i] = clone(obj[i]);
    }
    else
    {
      nObj[i] = obj[i];
    }
  }
  return nObj;
}

  /*=====================================================================
   * A 3D coordinate (right handed system)
   *
   * X +ve right
   * Y +ve up
   * Z +ve out screen
   *=====================================================================*/
  class Point {
    constructor(x=0, y=0, z=0)
    {
      this.x = x;
      this.y = y;
      this.z = z;
      // Translated, rotated, scaled
      this.tx = this.x;
      this.ty = this.y;
      this.tz = this.z;
      // tx, ty, tz, projected to 2D as seen from viewpoint
      this.fx = 0;
      this.fy = 0;
    }

    hardTransform(mat)
    {
      const p = new DOMPoint(this.x, this.y, this.z).matrixTransform(mat);
      this.tx = p.x;
      this.ty = p.y;
      this.tz = p.z;
      this.x = this.tx;
      this.y = this.ty;
      this.z = this.tz;
    }

    softTransform(mat)
    {
      const p = new DOMPoint(this.x, this.y, this.z).matrixTransform(mat);
      this.tx = p.x;
      this.ty = p.y;
      this.tz = p.z;
      // original x,y,z remain unchanged
    }
  }

  class DrawCmd3D {
    constructor(cmdStr, controlPoints=[], endPoint)
    {
      this.drawFn = cmdStr;       // String 'moveTo' etc, the canvas command to call
      this.cPts = controlPoints;  // Array [Point, Point ..] Bezier curve control points
      this.ep = endPoint;         // Final pen position (undefined for 'closePath' drawFn)
      this.parms = [];            // [x,y,x,y,x ..] 2D world coordinate version of cPts and ep
      this.parmsPx = [];          // [x,y,x,y,x ..] 2D pixel coordinate version of cPts and ep
    }
  }

  if (!SVGPathElement.prototype.getPathData || !SVGPathElement.prototype.setPathData) {
    // @info
    //   Polyfill for SVG getPathData() and setPathData() methods. Based on:
    //   - SVGPathSeg polyfill by Philip Rogers (MIT License)
    //     https://github.com/progers/pathseg
    //   - SVGPathNormalizer by Tadahisa Motooka (MIT License)
    //     https://github.com/motooka/SVGPathNormalizer/tree/master/src
    //   - arcToCubicCurves() by Dmitry Baranovskiy (MIT License)
    //     https://github.com/DmitryBaranovskiy/raphael/blob/v2.1.1/raphael.core.js#L1837
    // @author
    //   Jarosław Foksa
    // @source
    //   https://github.com/jarek-foksa/path-data-polyfill.js/
    // @license
    //   MIT License
    !function(){var e={Z:"Z",M:"M",L:"L",C:"C",Q:"Q",A:"A",H:"H",V:"V",S:"S",T:"T",z:"Z",m:"m",l:"l",c:"c",q:"q",a:"a",h:"h",v:"v",s:"s",t:"t"},t=function(e){this._string=e,this._currentIndex=0,this._endIndex=this._string.length,this._prevCommand=null,this._skipOptionalSpaces()},s=-1!==window.navigator.userAgent.indexOf("MSIE ")
    t.prototype={parseSegment:function(){var t=this._string[this._currentIndex],s=e[t]?e[t]:null
    if(null===s){if(null===this._prevCommand)return null
    if(s=("+"===t||"-"===t||"."===t||t>="0"&&"9">=t)&&"Z"!==this._prevCommand?"M"===this._prevCommand?"L":"m"===this._prevCommand?"l":this._prevCommand:null,null===s)return null}else this._currentIndex+=1
    this._prevCommand=s
    var r=null,a=s.toUpperCase()
    return"H"===a||"V"===a?r=[this._parseNumber()]:"M"===a||"L"===a||"T"===a?r=[this._parseNumber(),this._parseNumber()]:"S"===a||"Q"===a?r=[this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber()]:"C"===a?r=[this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber()]:"A"===a?r=[this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseArcFlag(),this._parseArcFlag(),this._parseNumber(),this._parseNumber()]:"Z"===a&&(this._skipOptionalSpaces(),r=[]),null===r||r.indexOf(null)>=0?null:{type:s,values:r}},hasMoreData:function(){return this._currentIndex<this._endIndex},peekSegmentType:function(){var t=this._string[this._currentIndex]
    return e[t]?e[t]:null},initialCommandIsMoveTo:function(){if(!this.hasMoreData())return!0
    var e=this.peekSegmentType()
    return"M"===e||"m"===e},_isCurrentSpace:function(){var e=this._string[this._currentIndex]
    return" ">=e&&(" "===e||"\n"===e||"	"===e||"\r"===e||"\f"===e)},_skipOptionalSpaces:function(){for(;this._currentIndex<this._endIndex&&this._isCurrentSpace();)this._currentIndex+=1
    return this._currentIndex<this._endIndex},_skipOptionalSpacesOrDelimiter:function(){return this._currentIndex<this._endIndex&&!this._isCurrentSpace()&&","!==this._string[this._currentIndex]?!1:(this._skipOptionalSpaces()&&this._currentIndex<this._endIndex&&","===this._string[this._currentIndex]&&(this._currentIndex+=1,this._skipOptionalSpaces()),this._currentIndex<this._endIndex)},_parseNumber:function(){var e=0,t=0,s=1,r=0,a=1,n=1,u=this._currentIndex
    if(this._skipOptionalSpaces(),this._currentIndex<this._endIndex&&"+"===this._string[this._currentIndex]?this._currentIndex+=1:this._currentIndex<this._endIndex&&"-"===this._string[this._currentIndex]&&(this._currentIndex+=1,a=-1),this._currentIndex===this._endIndex||(this._string[this._currentIndex]<"0"||this._string[this._currentIndex]>"9")&&"."!==this._string[this._currentIndex])return null
    for(var i=this._currentIndex;this._currentIndex<this._endIndex&&this._string[this._currentIndex]>="0"&&this._string[this._currentIndex]<="9";)this._currentIndex+=1
    if(this._currentIndex!==i)for(var l=this._currentIndex-1,h=1;l>=i;)t+=h*(this._string[l]-"0"),l-=1,h*=10
    if(this._currentIndex<this._endIndex&&"."===this._string[this._currentIndex]){if(this._currentIndex+=1,this._currentIndex>=this._endIndex||this._string[this._currentIndex]<"0"||this._string[this._currentIndex]>"9")return null
    for(;this._currentIndex<this._endIndex&&this._string[this._currentIndex]>="0"&&this._string[this._currentIndex]<="9";)s*=10,r+=(this._string.charAt(this._currentIndex)-"0")/s,this._currentIndex+=1}if(this._currentIndex!==u&&this._currentIndex+1<this._endIndex&&("e"===this._string[this._currentIndex]||"E"===this._string[this._currentIndex])&&"x"!==this._string[this._currentIndex+1]&&"m"!==this._string[this._currentIndex+1]){if(this._currentIndex+=1,"+"===this._string[this._currentIndex]?this._currentIndex+=1:"-"===this._string[this._currentIndex]&&(this._currentIndex+=1,n=-1),this._currentIndex>=this._endIndex||this._string[this._currentIndex]<"0"||this._string[this._currentIndex]>"9")return null
    for(;this._currentIndex<this._endIndex&&this._string[this._currentIndex]>="0"&&this._string[this._currentIndex]<="9";)e*=10,e+=this._string[this._currentIndex]-"0",this._currentIndex+=1}var v=t+r
    return v*=a,e&&(v*=Math.pow(10,n*e)),u===this._currentIndex?null:(this._skipOptionalSpacesOrDelimiter(),v)},_parseArcFlag:function(){if(this._currentIndex>=this._endIndex)return null
    var e=null,t=this._string[this._currentIndex]
    if(this._currentIndex+=1,"0"===t)e=0
    else{if("1"!==t)return null
    e=1}return this._skipOptionalSpacesOrDelimiter(),e}}
    var r=function(e){if(!e||0===e.length)return[]
    var s=new t(e),r=[]
    if(s.initialCommandIsMoveTo())for(;s.hasMoreData();){var a=s.parseSegment()
    if(null===a)break
    r.push(a)}return r},a=SVGPathElement.prototype.setAttribute,n=SVGPathElement.prototype.removeAttribute,u=window.Symbol?Symbol():"__cachedPathData",i=window.Symbol?Symbol():"__cachedNormalizedPathData",l=function(e,t,s,r,a,n,u,i,h,v){var p,_,c,o,d=function(e){return Math.PI*e/180},y=function(e,t,s){var r=e*Math.cos(s)-t*Math.sin(s),a=e*Math.sin(s)+t*Math.cos(s)
    return{x:r,y:a}},x=d(u),f=[]
    if(v)p=v[0],_=v[1],c=v[2],o=v[3]
    else{var I=y(e,t,-x)
    e=I.x,t=I.y
    var m=y(s,r,-x)
    s=m.x,r=m.y
    var g=(e-s)/2,b=(t-r)/2,M=g*g/(a*a)+b*b/(n*n)
    M>1&&(M=Math.sqrt(M),a=M*a,n=M*n)
    var S
    S=i===h?-1:1
    var V=a*a,A=n*n,C=V*A-V*b*b-A*g*g,P=V*b*b+A*g*g,N=S*Math.sqrt(Math.abs(C/P))
    c=N*a*b/n+(e+s)/2,o=N*-n*g/a+(t+r)/2,p=Math.asin(parseFloat(((t-o)/n).toFixed(9))),_=Math.asin(parseFloat(((r-o)/n).toFixed(9))),c>e&&(p=Math.PI-p),c>s&&(_=Math.PI-_),0>p&&(p=2*Math.PI+p),0>_&&(_=2*Math.PI+_),h&&p>_&&(p-=2*Math.PI),!h&&_>p&&(_-=2*Math.PI)}var E=_-p
    if(Math.abs(E)>120*Math.PI/180){var D=_,O=s,L=r
    _=h&&_>p?p+120*Math.PI/180*1:p+120*Math.PI/180*-1,s=c+a*Math.cos(_),r=o+n*Math.sin(_),f=l(s,r,O,L,a,n,u,0,h,[_,D,c,o])}E=_-p
    var k=Math.cos(p),G=Math.sin(p),T=Math.cos(_),Z=Math.sin(_),w=Math.tan(E/4),H=4/3*a*w,Q=4/3*n*w,z=[e,t],F=[e+H*G,t-Q*k],q=[s+H*Z,r-Q*T],j=[s,r]
    if(F[0]=2*z[0]-F[0],F[1]=2*z[1]-F[1],v)return[F,q,j].concat(f)
    f=[F,q,j].concat(f)
    for(var R=[],U=0;U<f.length;U+=3){var a=y(f[U][0],f[U][1],x),n=y(f[U+1][0],f[U+1][1],x),B=y(f[U+2][0],f[U+2][1],x)
    R.push([a.x,a.y,n.x,n.y,B.x,B.y])}return R},h=function(e){return e.map(function(e){return{type:e.type,values:Array.prototype.slice.call(e.values)}})},v=function(e){var t=[],s=null,r=null,a=null,n=null
    return e.forEach(function(e){var u=e.type
    if("M"===u){var i=e.values[0],l=e.values[1]
    t.push({type:"M",values:[i,l]}),a=i,n=l,s=i,r=l}else if("m"===u){var i=s+e.values[0],l=r+e.values[1]
    t.push({type:"M",values:[i,l]}),a=i,n=l,s=i,r=l}else if("L"===u){var i=e.values[0],l=e.values[1]
    t.push({type:"L",values:[i,l]}),s=i,r=l}else if("l"===u){var i=s+e.values[0],l=r+e.values[1]
    t.push({type:"L",values:[i,l]}),s=i,r=l}else if("C"===u){var h=e.values[0],v=e.values[1],p=e.values[2],_=e.values[3],i=e.values[4],l=e.values[5]
    t.push({type:"C",values:[h,v,p,_,i,l]}),s=i,r=l}else if("c"===u){var h=s+e.values[0],v=r+e.values[1],p=s+e.values[2],_=r+e.values[3],i=s+e.values[4],l=r+e.values[5]
    t.push({type:"C",values:[h,v,p,_,i,l]}),s=i,r=l}else if("Q"===u){var h=e.values[0],v=e.values[1],i=e.values[2],l=e.values[3]
    t.push({type:"Q",values:[h,v,i,l]}),s=i,r=l}else if("q"===u){var h=s+e.values[0],v=r+e.values[1],i=s+e.values[2],l=r+e.values[3]
    t.push({type:"Q",values:[h,v,i,l]}),s=i,r=l}else if("A"===u){var i=e.values[5],l=e.values[6]
    t.push({type:"A",values:[e.values[0],e.values[1],e.values[2],e.values[3],e.values[4],i,l]}),s=i,r=l}else if("a"===u){var i=s+e.values[5],l=r+e.values[6]
    t.push({type:"A",values:[e.values[0],e.values[1],e.values[2],e.values[3],e.values[4],i,l]}),s=i,r=l}else if("H"===u){var i=e.values[0]
    t.push({type:"H",values:[i]}),s=i}else if("h"===u){var i=s+e.values[0]
    t.push({type:"H",values:[i]}),s=i}else if("V"===u){var l=e.values[0]
    t.push({type:"V",values:[l]}),r=l}else if("v"===u){var l=r+e.values[0]
    t.push({type:"V",values:[l]}),r=l}else if("S"===u){var p=e.values[0],_=e.values[1],i=e.values[2],l=e.values[3]
    t.push({type:"S",values:[p,_,i,l]}),s=i,r=l}else if("s"===u){var p=s+e.values[0],_=r+e.values[1],i=s+e.values[2],l=r+e.values[3]
    t.push({type:"S",values:[p,_,i,l]}),s=i,r=l}else if("T"===u){var i=e.values[0],l=e.values[1]
    t.push({type:"T",values:[i,l]}),s=i,r=l}else if("t"===u){var i=s+e.values[0],l=r+e.values[1]
    t.push({type:"T",values:[i,l]}),s=i,r=l}else("Z"===u||"z"===u)&&(t.push({type:"Z",values:[]}),s=a,r=n)}),t},p=function(e){var t=[],s=null,r=null,a=null,n=null,u=null,i=null,h=null
    return e.forEach(function(e){if("M"===e.type){var v=e.values[0],p=e.values[1]
    t.push({type:"M",values:[v,p]}),i=v,h=p,n=v,u=p}else if("C"===e.type){var _=e.values[0],c=e.values[1],o=e.values[2],d=e.values[3],v=e.values[4],p=e.values[5]
    t.push({type:"C",values:[_,c,o,d,v,p]}),r=o,a=d,n=v,u=p}else if("L"===e.type){var v=e.values[0],p=e.values[1]
    t.push({type:"L",values:[v,p]}),n=v,u=p}else if("H"===e.type){var v=e.values[0]
    t.push({type:"L",values:[v,u]}),n=v}else if("V"===e.type){var p=e.values[0]
    t.push({type:"L",values:[n,p]}),u=p}else if("S"===e.type){var y,x,o=e.values[0],d=e.values[1],v=e.values[2],p=e.values[3]
    "C"===s||"S"===s?(y=n+(n-r),x=u+(u-a)):(y=n,x=u),t.push({type:"C",values:[y,x,o,d,v,p]}),r=o,a=d,n=v,u=p}else if("T"===e.type){var _,c,v=e.values[0],p=e.values[1]
    "Q"===s||"T"===s?(_=n+(n-r),c=u+(u-a)):(_=n,c=u)
    var y=n+2*(_-n)/3,x=u+2*(c-u)/3,f=v+2*(_-v)/3,I=p+2*(c-p)/3
    t.push({type:"C",values:[y,x,f,I,v,p]}),r=_,a=c,n=v,u=p}else if("Q"===e.type){var _=e.values[0],c=e.values[1],v=e.values[2],p=e.values[3],y=n+2*(_-n)/3,x=u+2*(c-u)/3,f=v+2*(_-v)/3,I=p+2*(c-p)/3
    t.push({type:"C",values:[y,x,f,I,v,p]}),r=_,a=c,n=v,u=p}else if("A"===e.type){var m=Math.abs(e.values[0]),g=Math.abs(e.values[1]),b=e.values[2],M=e.values[3],S=e.values[4],v=e.values[5],p=e.values[6]
    if(0===m||0===g)t.push({type:"C",values:[n,u,v,p,v,p]}),n=v,u=p
    else if(n!==v||u!==p){var V=l(n,u,v,p,m,g,b,M,S)
    V.forEach(function(e){t.push({type:"C",values:e})}),n=v,u=p}}else"Z"===e.type&&(t.push(e),n=i,u=h)
    s=e.type}),t}
    SVGPathElement.prototype.setAttribute=function(e,t){"d"===e&&(this[u]=null,this[i]=null),a.call(this,e,t)},SVGPathElement.prototype.removeAttribute=function(e,t){"d"===e&&(this[u]=null,this[i]=null),n.call(this,e)},SVGPathElement.prototype.getPathData=function(e){if(e&&e.normalize){if(this[i])return h(this[i])
    var t
    this[u]?t=h(this[u]):(t=r(this.getAttribute("d")||""),this[u]=h(t))
    var s=p(v(t))
    return this[i]=h(s),s}if(this[u])return h(this[u])
    var t=r(this.getAttribute("d")||"")
    return this[u]=h(t),t},SVGPathElement.prototype.setPathData=function(e){if(0===e.length)s?this.setAttribute("d",""):this.removeAttribute("d")
    else{for(var t="",r=0,a=e.length;a>r;r+=1){var n=e[r]
    r>0&&(t+=" "),t+=n.type,n.values&&n.values.length>0&&(t+=" "+n.values.join(" "))}this.setAttribute("d",t)}},SVGRectElement.prototype.getPathData=function(e){var t=this.x.baseVal.value,s=this.y.baseVal.value,r=this.width.baseVal.value,a=this.height.baseVal.value,n=this.hasAttribute("rx")?this.rx.baseVal.value:this.ry.baseVal.value,u=this.hasAttribute("ry")?this.ry.baseVal.value:this.rx.baseVal.value
    n>r/2&&(n=r/2),u>a/2&&(u=a/2)
    var i=[{type:"M",values:[t+n,s]},{type:"H",values:[t+r-n]},{type:"A",values:[n,u,0,0,1,t+r,s+u]},{type:"V",values:[s+a-u]},{type:"A",values:[n,u,0,0,1,t+r-n,s+a]},{type:"H",values:[t+n]},{type:"A",values:[n,u,0,0,1,t,s+a-u]},{type:"V",values:[s+u]},{type:"A",values:[n,u,0,0,1,t+n,s]},{type:"Z",values:[]}]
    return i=i.filter(function(e){return"A"!==e.type||0!==e.values[0]&&0!==e.values[1]?!0:!1}),e&&e.normalize===!0&&(i=p(i)),i},SVGCircleElement.prototype.getPathData=function(e){var t=this.cx.baseVal.value,s=this.cy.baseVal.value,r=this.r.baseVal.value,a=[{type:"M",values:[t+r,s]},{type:"A",values:[r,r,0,0,1,t,s+r]},{type:"A",values:[r,r,0,0,1,t-r,s]},{type:"A",values:[r,r,0,0,1,t,s-r]},{type:"A",values:[r,r,0,0,1,t+r,s]},{type:"Z",values:[]}]
    return e&&e.normalize===!0&&(a=p(a)),a},SVGEllipseElement.prototype.getPathData=function(e){var t=this.cx.baseVal.value,s=this.cy.baseVal.value,r=this.rx.baseVal.value,a=this.ry.baseVal.value,n=[{type:"M",values:[t+r,s]},{type:"A",values:[r,a,0,0,1,t,s+a]},{type:"A",values:[r,a,0,0,1,t-r,s]},{type:"A",values:[r,a,0,0,1,t,s-a]},{type:"A",values:[r,a,0,0,1,t+r,s]},{type:"Z",values:[]}]
    return e&&e.normalize===!0&&(n=p(n)),n},SVGLineElement.prototype.getPathData=function(){return[{type:"M",values:[this.x1.baseVal.value,this.y1.baseVal.value]},{type:"L",values:[this.x2.baseVal.value,this.y2.baseVal.value]}]},SVGPolylineElement.prototype.getPathData=function(){for(var e=[],t=0;t<this.points.numberOfItems;t+=1){var s=this.points.getItem(t)
    e.push({type:0===t?"M":"L",values:[s.x,s.y]})}return e},SVGPolygonElement.prototype.getPathData=function(){for(var e=[],t=0;t<this.points.numberOfItems;t+=1){var s=this.points.getItem(t)
    e.push({type:0===t?"M":"L",values:[s.x,s.y]})}return e.push({type:"Z",values:[]}),e}}()
  }

  /*========================================================
   * svgProtocol (a function for use with Array.reduce)
   * -------------------------------------------------------
   * Object holding definitions of each command with methods
   * to convert to Cgo2D for both cartesian and SVG 
   * coordinate systems
   *========================================================*/
  const svgProtocol = {
    "M": {
      parmCount3D: 3,
      extCmd: "L",
      toAbs3D: function(acc, curr) {
        let cmd = curr[0].toUpperCase(),  // uppercase command means absolute coords
            x = curr[1],
            y = curr[2],
            z = curr[3],
            currAbs;
        // Check if 'curr' was a relative (lowercase) command
        if (cmd !== curr[0]) {
          x += acc.px;
          y += acc.py;
          z += acc.pz;
        }
        currAbs = [cmd, x, y, z];
        acc.px = x;
        acc.py = y;
        acc.pz = z;
        return currAbs;
      },
      toDrawCmd: function(curr){
        let x = curr[1],
            y = curr[2],
            z = curr[3],
            cPts = [],
            ep = new Point(x, y, z);

        return new DrawCmd3D('moveTo', cPts, ep);
      }
    },
    "L": {
      parmCount3D: 3,
      extCmd: "L",
      toAbs3D: function(acc, curr) {
        let cmd = curr[0].toUpperCase(),  // uppercase command means absolute coords
            x = curr[1],
            y = curr[2],
            z = curr[3],
            currAbs;
        // Check if 'curr' was a relative (lowercase) command
        if (cmd !== curr[0]) {
          x += acc.px;
          y += acc.py;
          z += acc.pz;
        }
        currAbs = [cmd, x, y, z];
        acc.px = x;
        acc.py = y;
        acc.pz = z;
        return currAbs;
      },
      toDrawCmd: function(curr){
        let x = curr[1],
            y = curr[2],
            z = curr[3],
            cPts = [],
            ep = new Point(x, y, z);

        return new DrawCmd3D('lineTo', cPts, ep);
      }
    },
    "C": {       // Cubic Bezier curve
      parmCount3D: 9,
      extCmd: "C",
      toAbs3D: function(acc, curr) {
        let cmd = curr[0].toUpperCase(),  // uppercase command means absolute coords
            c1x = curr[1],
            c1y = curr[2],
            c1z = curr[3],
            c2x = curr[4],
            c2y = curr[5],
            c2z = curr[6],
            x = curr[7],
            y = curr[8],
            z = curr[9],
            currAbs;
        // Check if 'curr' was a relative (lowercase) command
        if (cmd !== curr[0]) {
          c1x += acc.px;
          c1y += acc.py;
          c1z += acc.pz;
          c2x += acc.px;
          c2y += acc.py;
          c2z += acc.pz;
          x += acc.px;
          y += acc.py;
          z += acc.pz;
        }
        currAbs = [cmd, c1x, c1y, c1z, c2x, c2y, c2z, x, y, z];
        acc.px = x;
        acc.py = y;
        acc.pz = z;
        return currAbs;
      },
      toDrawCmd: function(curr){
        let c1x = curr[1],
            c1y = curr[2],
            c1z = curr[3],
            c2x = curr[4],
            c2y = curr[5],
            c2z = curr[6],
            x = curr[7],
            y = curr[8],
            z = curr[9],
            cp1 = new Point(c1x, c1y, c1z),
            cp2 = new Point(c2x, c2y, c2z),
            cPts = [cp1, cp2],
            ep = new Point(x, y, z);

        return new DrawCmd3D('bezierCurveTo', cPts, ep);
      }
    },
    "Z": {
      parmCount3D: 0,
      toAbs3D: function(acc, curr) {
        let cmd = curr[0].toUpperCase(),
            currAbs = [cmd];
        // leave pen position where it is in case of multi-segment path
        return currAbs;
      },
      toDrawCmd: function(curr){
        return new DrawCmd3D("closePath");
      }
    }
  };

  /*========================================================
   * Cgo3DCmdCheck (a function for use with Array.reduce)
   * -------------------------------------------------------
   * Checks each array element, if its a string it must be
   * one of the cmd letters in the Cgo3D protocol. If no bad
   * cmds found then the array is returned without
   * alteration, if not an empty array is returned.
   *========================================================*/
  function Cgo3DCmdCheck(acc, current, idx)
  {
    var cgo3Dcmds = ["M", "L", "C", "Z"];

    // make a concession to SVG standard and allow all number array
    if (idx === 0)
    {
      if (typeof current !== 'string')
      {
        acc.push("M");
        // now we will fall through to normal checking
      }
    }
    // if we see a command string, check it is in SVG protocol
    if (typeof current === "string") {  // check each string element
      if (!cgo3Dcmds.includes(current.toUpperCase()))
      {
        console.warn("unknown command string '"+current+"'");
        acc.badCmdFound = true;
        acc.length = 0;   // any bad command will force empty array to be returned
      }
    }
    if (!acc.badCmdFound)
    {
      acc.push(current);
    }
    // always return when using reduce...
    return acc;
  }

  /*=================================================================
   * unExtend3D  (a function for use with Array.reduce)
   * ----------------------------------------------------------------
   * Undo the extension of commands given the svg protocol.
   * see description of 'unExtend above.
   * This version expects 3D coordinates eg.
   *
   * var a = ['M', 1, 2, 0, 'L', 3, 4, 0, 5, 6, 0, 7, 8, 0, 'Z']
   * var b = a.reduce(unExtend3D, [])
   *
   * >> ['M', 1, 2, 0, 'L', 3, 4, 0, 'L', 5, 6, 0, 'L', 7, 8, 0, 'Z']
   
   * This assumes no invalid commands are in the string -
   * so array should be sanitized before running unExtend3D
   *=================================================================*/
  function unExtend3D(acc, current, idx, ary)
  {
    if (idx === 0)
    {
      acc.nextCmdPos = 0;  // set expected position of next command string as first element
    }
    // Check if current is a command in the protocol (protocol only indexed by upperCase)
    if (typeof current === 'string')
    {
      if (idx < acc.nextCmdPos)
      {
        // we need another number but found a string
        console.warn("bad number of parameters for '"+acc.currCmd+"' at index "+idx);
        acc.badParameter = true;  // raise flag to bailout processing this
        acc.push(0);  // try to get out without crashing (acc data will be ditched any way)
        return acc;
      }
      // its a command the protocol knows, remember it across iterations of elements
      acc.currCmd = current.toUpperCase();  // save as a property of the acc Array object (not an Array element)
      acc.uc = (current.toUpperCase() === current);  // upperCase? true or false
      // calculate where the next command should be
      acc.nextCmdPos = idx + svgProtocol[acc.currCmd].parmCount3D + 1;
      acc.push(current);
    }
    else if (idx < acc.nextCmdPos)   // processing parameters
    {
      // keep shoving parameters
      acc.push(current);
    }
    else
    {
      // we have got a full set of parameters but hit another number
      // instead of a command string, it must be a command extension
      // push a the extension command (same as current except for M which extend to L)
      // into the accumulator
      acc.currCmd = svgProtocol[acc.currCmd].extCmd;  // NB: don't change the acc.uc boolean
      const newCmd = (acc.uc)? acc.currCmd: acc.currCmd.toLowerCase();
      acc.push(newCmd, current);
      // calculate where the next command should be
      acc.nextCmdPos = idx + svgProtocol[acc.currCmd].parmCount3D;
    }

    if (idx === ary.length-1)   // done processing check if all was ok
    {
      if (acc.badParameter)
      {
        acc.length = 0;
      }
    }
    // always return when using reduce...
    return acc;
  }

  /*========================================================
    * svgCmdSplitter (a function for use with Array.reduce)
    * ------------------------------------------------------
    * Split an array on a string type element, e.g.
    *
    * var a = ['a', 1, 2, 'b', 3, 4, 'c', 5, 6, 7, 8]
    * var b = a.reduce(svgCmdSplitter, [])
    *
    * >> [['a', 1, 2],['b', 3, 4], ['c', 5, 6, 7, 8]]
    *======================================================*/
  function svgCmdSplitter(acc, curr)
  {
    // if we see a command string, start a new array element
    if (typeof curr === "string") {
        acc.push([]);
    }
    // add this element to the back of the acc's last array
    acc[acc.length-1].push(curr);
    // always return when using reduce...
    return acc;
  }

  /*====================================================================
    * toAbsoluteCoords3D  (a function for use with Array.reduce)
    * -------------------------------------------------------------------
    * Version of the toAbsoluteCoords but expecting 3D coordinates
    * eg. ['M', 1, 2, 0, 'l', 3, 4, 1, 'm', 5, 6, 7, 'l', 8, 3, 0, 'z']
    * >>  ['M', 1, 2, 0, 'L', 4, 6, 1, 'M', 5, 6, 7, 'L', 13, 9, 7, 'Z']
    *====================================================================*/
  function toAbsoluteCoords3D(acc, current, idx)
  {
    if (acc.px === undefined)
    {
      acc.px = 0;
      acc.py = 0;
      acc.pz = 0;
    }
    // get protocol object for this command, indexed by uppercase only
    const currCmd = svgProtocol[current[0].toUpperCase()];
    // call protocol toAbs3D function for this command
    // it returns absolute coordinate version based on current
    // pen position stored in acc.px, acc.py, acc.pz
    const currAbs = currCmd.toAbs3D(acc, current, idx);
    acc.push(currAbs);
    // always return when using reduce...
    return acc;
  }

  svgToCgo3D = function(data2D, xOfs=0, yOfs=0)
  {
    const newCmds3D = [];
    let pathStr;
    let cmds2D = [];
    let svgPathElem;

    if ((typeof data2D === "string") && data2D.length)  // a string will be svg commands
    {
      pathStr = data2D;
      svgPathElem = document.createElementNS("http://www.w3.org/2000/svg", "path");
      svgPathElem.setAttribute("d", pathStr);
      cmds2D = svgPathElem.getPathData({normalize: true}); // returns segments converted to lines and Bezier curves 
  
      cmds2D.forEach((seg)=>{
        newCmds3D.push(seg.type);
        for (let j=0; j<seg.values.length; j+=2)   // step through the coord pairs
        {
          newCmds3D.push(seg.values[j]+xOfs, -seg.values[j+1]-yOfs, 0);
        }
      });
    }
    else if (Array.isArray(data2D) && data2D.length)  // array and not empty
    {
      if (typeof(data2D[0]) === "number")  // must be an Array of numbers
      {
        pathStr = "M "+data2D.join(" "); // insert 'M' command so its valid SVG
      }
      else
      {
        pathStr = data2D.join(" ");
      }
      svgPathElem = document.createElementNS("http://www.w3.org/2000/svg", "path");
      svgPathElem.setAttribute("d", pathStr);
      cmds2D = svgPathElem.getPathData({normalize: true}); // returns segments converted to lines and Bezier curves 
 
      if (cmds2D.length < 2) {
        console.error("Invalid SVG data");
        return [];
      };
      cmds2D.forEach((seg)=>{
        newCmds3D.push(seg.type);
        for (let j=0; j<seg.values.length; j+=2)   // step through the coord pairs
        {
          newCmds3D.push(seg.values[j]+xOfs, seg.values[j+1]+yOfs, 0);
        }
      });
    }
    else
    {
      console.warn("invalid input data");
      return [];
    }

    return newCmds3D;
  }

  /*===============================================================================
   * toDrawCmds3D  (a function for use with Array.reduce)
   * ------------------------------------------------------------------------------
   * Convert a Cgo3D data array to an array DrawCmd3D objects e.g.
   *
   * [['M', 0.1, 0.2, 0], ['L', 1, 2, 0], ['C', 3, 4, 5, 6, 2, 9, 0, 1, 2], ['Z']]
   *
   * will become
   * [{ drawFn: "moveTo",
   *    cPts: [], 
   *    ep: eP              // Point object
   *  },
   *  { drawFn: "lineTo",
   *    cPts: [], 
   *    ep: eP              // Point object
   *  },
   *  { drawFn: "cubicBezierTo",
   *    cPts: [cp1, cp2],  // cp1, cp2 are Point objects
   *    ep: eP
   *  }]
   *===============================================================================*/
  function toDrawCmd3D(acc, current)
  {
    // call protocol toDrawCmd function for this command
    // it returns a DrawCmd3D object made from the current cmd and parms
    const currCmd = svgProtocol[current[0].toUpperCase()],
           currDC = currCmd.toDrawCmd(current);
 
    if (currDC !== null)
    {
      acc.push(currDC);
    }
    // always return when using reduce...
    return acc;
  }
 
  /*======================================================================
   * Cgo3Dsegs: Converts an array of Cgo3D data in format
   * ['M',x,y,z, 'L',x,y,z, ... 'C',c1x,c1y,c1z,c2x,c2y,c2z,x,y,z, 'Z'] 
   * defining a path to an array of DrawCmd3D objects adding methods to 
   * transform the path; translate, rotate etc. 
   *======================================================================*/
  Cgo3Dsegs = class extends Array {
    constructor (cgo3Dary) 
    {
      let data;
      if (!Array.isArray(cgo3Dary) || (cgo3Dary.length === 0))
      {
        data = [];
      }
      else if (Array.isArray(cgo3Dary) && (cgo3Dary[0] instanceof DrawCmd3D))
      {
        data = drawCmd3DToCgo3D(cgo3Dary);
      }
      else
      {
        data = cgo3Dary;
      }
      const newCmdsAry = data.reduce(Cgo3DCmdCheck, [])
                             .reduce(unExtend3D, [])
                             .reduce(svgCmdSplitter, [])
                             .reduce(toAbsoluteCoords3D, [])
                             .reduce(toDrawCmd3D, []); 
      super(...newCmdsAry);
    }

    dup(){
      // convert each drawCmd3D to Cgo3D and generate new Cgo3D segs 
      const newCgo3D = [];
      const cmdType = {moveTo:"M", lineTo:"L", bezierCurveTo:"C", closePath:"Z"};
      this.forEach((seg)=>{
        newCgo3D.push(cmdType[seg.drawFn]);
        seg.cPts.forEach((pt)=>{
          newCgo3D.push(pt.x, pt.y, pt.z);
        });
        if (seg.ep)
        {
          newCgo3D.push(seg.ep.x, seg.ep.y, seg.ep.z);
        }
      });

      return new Cgo3Dsegs(newCgo3D);
    }

    translate(xOfs=0, yOfs=0, zOfs=0){
      const transMat = translateMatrix(xOfs, yOfs, zOfs);
      const newCgo3Dsegs = new Cgo3Dsegs();

      this.forEach((seg)=>{
        const newSeg = clone(seg);
        newSeg.cPts.forEach((pt)=>{
          pt.hardTransform(transMat);
        });
        if (newSeg.ep)
        {
          newSeg.ep.hardTransform(transMat);
        }
        newCgo3Dsegs.push(newSeg);
      });

      return newCgo3Dsegs;
    }

    rotate(vx=0, vy=0, vz=0, deg=0)
    {
      const rotMat = rotateMatrix(vx, vy, vz, deg);
      const newCgo3Dsegs = new Cgo3Dsegs();

      this.forEach((seg)=>{
        const newSeg = clone(seg);
        newSeg.cPts.forEach((pt)=>{
          pt.hardTransform(rotMat);
        });
        if (newSeg.ep)
        {
          newSeg.ep.hardTransform(rotMat);
        }
        newCgo3Dsegs.push(newSeg);
      });

      return newCgo3Dsegs;
    }

    rotateX(deg=0)
    {
      return this.rotate(1, 0, 0, deg);
    }

    rotateY(deg=0)
    {
      return this.rotate(0, 1, 0, deg);
    }

    rotateZ(deg=0)
    {
      return this.rotate(0, 0, 1, deg);
    }

    scale(scl=1)
    {
      const sclMat = scaleMatrix(scl);
      const newCgo3Dsegs = new Cgo3Dsegs();

      this.forEach((seg)=>{
        const newSeg = clone(seg);
        newSeg.cPts.forEach((pt)=>{
          pt.hardTransform(sclMat);
        });
        if (newSeg.ep)
        {
          newSeg.ep.hardTransform(sclMat);
        }
        newCgo3Dsegs.push(newSeg);
      });

      return newCgo3Dsegs;
    }

    scaleNonUniform(xScl, yScl, zScl)
    {
      const sclMat = scaleNonUniformMatrix(xScl, yScl, zScl);
      const newCgo3Dsegs = new Cgo3Dsegs();

      this.forEach((seg)=>{
        const newSeg = clone(seg);
        newSeg.cPts.forEach((pt)=>{
          pt.hardTransform(sclMat);
        });
        if (newSeg.ep)
        {
          newSeg.ep.hardTransform(sclMat);
        }
        newCgo3Dsegs.push(newSeg);
      });

      return newCgo3Dsegs;
    }

    appendPath(extensionData)
    {
      let pathSegs;
      const newSegs = new Cgo3Dsegs();
      if (extensionData instanceof Cgo3Dsegs)
      {
        pathSegs = extensionData;
      }
      else
      {
        pathSegs= new Cgo3Dsegs(extensionData);
      }

      this.forEach((seg)=>{
        const newSeg = clone(seg);
        newSegs.push(newSeg);
      });
      pathSegs.forEach((seg)=>{
        const newSeg = clone(seg);
        newSegs.push(newSeg);
      });

      return newSegs;
    }

    joinPath(extensionData)
    {
      const newPathSegs = new Cgo3Dsegs();
      let extSegs;
      if (extensionData instanceof Cgo3Dsegs)
      {
        extSegs = extensionData;
      }
      else
      {
        extSegs= new Cgo3Dsegs(extensionData);
      }
      let len = this.length;
      if (len == 0)  // just add the extra including the "M" command
      {
        extSegs.forEach((seg)=>{
          newPathSegs.push(clone(seg));
        });
      }
      else // 'this' has length
      {
        if (this[len-1].drawFn == "closePath")  
        {
          len += -1;   // delete the 'closePath'
        }
        // start with the org segs
        for (let i=0; i<len; i++)
        {
          newPathSegs.push(clone(this[i]));
        }
        // now tack on the extra commands skipping the initial "moveTo" segment
        for (let j=1; j<extSegs.length; j++)
        {
          newPathSegs.push(clone(extSegs[j]));
        }
      }

      return newPathSegs;  
    }

    revWinding(){
      // reverse the direction of drawing around a path, stops holes in shapes being filled
      let cmds = this,
          zCmd = null,
          k,
          dCmd,
          len = cmds.length;
      const newPathSegs = new Cgo3Dsegs();

      if (cmds[len-1].drawFn === "closePath")
      {
        zCmd = cmds[len-1];
        len -= 1;     // leave off 'closePath' cmd segment
      }

      // now step back along the path
      k = len-1;     // k points at the last segment in the path
      dCmd = new DrawCmd3D("moveTo", [], clone(cmds[k].ep));   // make a 'moveTo' command from final coord pair
      newPathSegs.push(dCmd);         // make this the first command of the output
      while (k>0)
      { 
        let revcPts = clone(cmds[k].cPts);   // use clone as original is altered by reverse
        dCmd = new DrawCmd3D(cmds[k].drawFn, revcPts.reverse(), clone(cmds[k-1].ep));  
        newPathSegs.push(dCmd); 
        k -= 1;
      }
      // add the 'closePath' if it was a closed path
      if (zCmd)
      {
        newPathSegs.push(zCmd);
      }

      return newPathSegs;
    }
  };

  function drawCmd3DToCgo3D(dCmds)
  {
    const ary = [];

    function rnd(val)
    {
      return val; //Math.round(val*1000)/1000;
    }

    function drawCmdtoCgo3D(drawCmd)
    {
      switch (drawCmd.drawFn)
      {
        case "moveTo":
          ary.push("M");
          ary.push(rnd(drawCmd.ep.x), rnd(drawCmd.ep.y), rnd(drawCmd.ep.z));
        break;
        case "lineTo":
          ary.push("L");
          ary.push(rnd(drawCmd.ep.x), rnd(drawCmd.ep.y), rnd(drawCmd.ep.z));
        break;
        case "bezierCurveTo":
          ary.push("C");
          ary.push(rnd(drawCmd.cPts[0].x), rnd(drawCmd.cPts[0].y), rnd(drawCmd.cPts[0].z));
          ary.push(rnd(drawCmd.cPts[1].x), rnd(drawCmd.cPts[1].y), rnd(drawCmd.cPts[1].z));
          ary.push(rnd(drawCmd.ep.x), rnd(drawCmd.ep.y), rnd(drawCmd.ep.z));
        break;
        case "closePath":
          ary.push("Z");
        break;
      }
    }

    if (Array.isArray(dCmds))
    {
      dCmds.forEach(drawCmdtoCgo3D);
    }
    else
    {
      drawCmdtoCgo3D(dCmds);
    }

    return ary;
  }

  shapeDefs = { 
    circle: function(dia=1, sectors=12)
    {
      const r = dia/2;
      const incAng = 360/sectors;

      function createCircularArc(r, incAngle)
      {
        // References:
        // 1. A. Riskus, "Approximation of a Cubic Bezier Curve by Circular Arcs and Vice Versa"
        // 2. Imre Juhasz, "Approximating the helix with rational cubic Bezier curves"
        const alpha = incAngle*Math.PI/360.0,  // half included angle
              ax = r*Math.cos(alpha),
              ay = r*Math.sin(alpha),
              b0 = {x:ax, y:-ay},
              b1 = {x:(4*r - ax)/3, y:-(r - ax)*(3*r - ax)/(3*ay)},
              b2 = {x:(4*r - ax)/3, y:(r - ax)*(3*r - ax)/(3*ay)},
              b3 = {x:ax, y:ay};

        return ["M", b0.x,b0.y, "C", b1.x,b1.y, b2.x,b2.y, b3.x,b3.y];
      }

      function rot(ary, degs)
      {
        // arc = [x0, y0, x1, y1, ...]
        // rotate array of x,y points by angle degs
        const A = Math.PI*degs/180.0,   // radians
              sinA = Math.sin(A),
              cosA = Math.cos(A);
        const rotAry = [];

        for (let i=0; i<ary.length; i+=2)
        {
          let x = ary[i],
              y = ary[i+1];
        
          rotAry[i] = x*cosA - y*sinA;
          rotAry[i+1] = x*sinA + y*cosA;
        }
        return rotAry;
      }

      let circ = createCircularArc(r, incAng);
      let arc = circ.slice(4);
      for (let s=1; s<sectors; s++)
      {
        circ = circ.concat(rot(arc, s*incAng));
      }
      circ.push("Z");

      return circ;
    },

    ellipse: function(w=1, height=0)
    {
      const h = (height)? height: w;
      return ["m", -0.5*w,0,
        "c", 0,-0.27614*h, 0.22386*w,-0.5*h, 0.5*w,-0.5*h,
        "c", 0.27614*w,0, 0.5*w,0.22386*h, 0.5*w,0.5*h,
        "c", 0,0.27614*h, -0.22386*w,0.5*h, -0.5*w,0.5*h,
        "c", -0.27614*w,0, -0.5*w,-0.22386*h, -0.5*w,-0.5*h, 'z'];},

    square: function(w=1){
      return ['m', 0.5*w,-0.5*w, 'l',0,w, -w,0, 0,-w, 'z'];},

    rectangle: function(w=1, height=0){
      const h = (height)? height: w;
      return ['m', 0.5*w,-0.5*h, 'l',0,h, -w,0, 0,-h, 'z'];},

    triangle: function(s=1){
      return ['m',0.5*s,-0.289*s, 'l',-0.5*s,0.866*s, -0.5*s,-0.866*s, 'z'];}
  };

  /**
   * A class to parse color values
   * @author Stoyan Stefanov <sstoo@gmail.com>
   * @link   http://www.phpied.com/rgb-color-parser-in-javascript/
   * @license Use it if you like it
   *
   * supplemented to handle rgba format (alpha 0 .. 1)  by ARC 04Sep09
   */
  RGBAColor = class {
    constructor(color_string)
    {
      const simple_colors = {
            aliceblue: 'f0f8ff',
            antiquewhite: 'faebd7',
            aqua: '00ffff',
            aquamarine: '7fffd4',
            azure: 'f0ffff',
            beige: 'f5f5dc',
            bisque: 'ffe4c4',
            black: '000000',
            blanchedalmond: 'ffebcd',
            blue: '0000ff',
            blueviolet: '8a2be2',
            brown: 'a52a2a',
            burlywood: 'deb887',
            cadetblue: '5f9ea0',
            chartreuse: '7fff00',
            chocolate: 'd2691e',
            coral: 'ff7f50',
            cornflowerblue: '6495ed',
            cornsilk: 'fff8dc',
            crimson: 'dc143c',
            cyan: '00ffff',
            darkblue: '00008b',
            darkcyan: '008b8b',
            darkgoldenrod: 'b8860b',
            darkgray: 'a9a9a9',
            darkgreen: '006400',
            darkkhaki: 'bdb76b',
            darkmagenta: '8b008b',
            darkolivegreen: '556b2f',
            darkorange: 'ff8c00',
            darkorchid: '9932cc',
            darkred: '8b0000',
            darksalmon: 'e9967a',
            darkseagreen: '8fbc8f',
            darkslateblue: '483d8b',
            darkslategray: '2f4f4f',
            darkturquoise: '00ced1',
            darkviolet: '9400d3',
            deeppink: 'ff1493',
            deepskyblue: '00bfff',
            dimgray: '696969',
            dodgerblue: '1e90ff',
            feldspar: 'd19275',
            firebrick: 'b22222',
            floralwhite: 'fffaf0',
            forestgreen: '228b22',
            fuchsia: 'ff00ff',
            gainsboro: 'dcdcdc',
            ghostwhite: 'f8f8ff',
            gold: 'ffd700',
            goldenrod: 'daa520',
            gray: '808080',
            green: '008000',
            greenyellow: 'adff2f',
            honeydew: 'f0fff0',
            hotpink: 'ff69b4',
            indianred : 'cd5c5c',
            indigo : '4b0082',
            ivory: 'fffff0',
            khaki: 'f0e68c',
            lavender: 'e6e6fa',
            lavenderblush: 'fff0f5',
            lawngreen: '7cfc00',
            lemonchiffon: 'fffacd',
            lightblue: 'add8e6',
            lightcoral: 'f08080',
            lightcyan: 'e0ffff',
            lightgoldenrodyellow: 'fafad2',
            lightgrey: 'd3d3d3',
            lightgreen: '90ee90',
            lightpink: 'ffb6c1',
            lightsalmon: 'ffa07a',
            lightseagreen: '20b2aa',
            lightskyblue: '87cefa',
            lightslateblue: '8470ff',
            lightslategray: '778899',
            lightsteelblue: 'b0c4de',
            lightyellow: 'ffffe0',
            lime: '00ff00',
            limegreen: '32cd32',
            linen: 'faf0e6',
            magenta: 'ff00ff',
            maroon: '800000',
            mediumaquamarine: '66cdaa',
            mediumblue: '0000cd',
            mediumorchid: 'ba55d3',
            mediumpurple: '9370d8',
            mediumseagreen: '3cb371',
            mediumslateblue: '7b68ee',
            mediumspringgreen: '00fa9a',
            mediumturquoise: '48d1cc',
            mediumvioletred: 'c71585',
            midnightblue: '191970',
            mintcream: 'f5fffa',
            mistyrose: 'ffe4e1',
            moccasin: 'ffe4b5',
            navajowhite: 'ffdead',
            navy: '000080',
            oldlace: 'fdf5e6',
            olive: '808000',
            olivedrab: '6b8e23',
            orange: 'ffa500',
            orangered: 'ff4500',
            orchid: 'da70d6',
            palegoldenrod: 'eee8aa',
            palegreen: '98fb98',
            paleturquoise: 'afeeee',
            palevioletred: 'd87093',
            papayawhip: 'ffefd5',
            peachpuff: 'ffdab9',
            peru: 'cd853f',
            pink: 'ffc0cb',
            plum: 'dda0dd',
            powderblue: 'b0e0e6',
            purple: '800080',
            red: 'ff0000',
            rosybrown: 'bc8f8f',
            royalblue: '4169e1',
            saddlebrown: '8b4513',
            salmon: 'fa8072',
            sandybrown: 'f4a460',
            seagreen: '2e8b57',
            seashell: 'fff5ee',
            sienna: 'a0522d',
            silver: 'c0c0c0',
            skyblue: '87ceeb',
            slateblue: '6a5acd',
            slategray: '708090',
            snow: 'fffafa',
            springgreen: '00ff7f',
            steelblue: '4682b4',
            tan: 'd2b48c',
            teal: '008080',
            thistle: 'd8bfd8',
            tomato: 'ff6347',
            transparent: 'rgba(0,0,0,0)',
            turquoise: '40e0d0',
            violet: 'ee82ee',
            violetred: 'd02090',
            wheat: 'f5deb3',
            white: 'ffffff',
            whitesmoke: 'f5f5f5',
            yellow: 'ffff00',
            yellowgreen: '9acd32'
      };
      // array of color definition objects
      const color_defs = [
        {
          re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*((1(\.0)?)|0?(\.\d*)?)\)$/,
          example: ['rgba(123, 234, 45, 0.5)', 'rgba(255,234,245,1)'],
          process: function (bits){
              return [
                  parseInt(bits[1], 10),
                  parseInt(bits[2], 10),
                  parseInt(bits[3], 10),
                  parseFloat(bits[4], 10)
              ];
          }
        },
        {
          re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
          example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
          process: function (bits){
              return [
                  parseInt(bits[1], 10),
                  parseInt(bits[2], 10),
                  parseInt(bits[3], 10)
              ];
          }
        },
        {
          re: /^(\w{2})(\w{2})(\w{2})$/,
          example: ['#00ff00', '336699'],
          process: function (bits){
              return [
                  parseInt(bits[1], 16),
                  parseInt(bits[2], 16),
                  parseInt(bits[3], 16)
              ];
          }
        },
        {
          re: /^(\w{1})(\w{1})(\w{1})$/,
          example: ['#fb0', 'f0f'],
          process: function (bits){
              return [
                  parseInt(bits[1] + bits[1], 16),
                  parseInt(bits[2] + bits[2], 16),
                  parseInt(bits[3] + bits[3], 16)
              ];
          }
        }
      ];

      this.ok = false;
      if (typeof color_string !== "string")       // bugfix: crashed if passed a number
      {
        console.warn("RGBAColor argument not a string");
        return;
      }
      // strip any leading #
      if (color_string.charAt(0) === '#')
      { // remove # if any
        color_string = color_string.substr(1,6);
      }

      color_string = color_string.replace(/ /g,'');
      color_string = color_string.toLowerCase();

      // before getting into regexps, try simple matches
      // and overwrite the input
      for (let key in simple_colors)
      {
        if (color_string === key)
        {
          color_string = simple_colors[key];
        }
      }

      // search through the definitions to find a match
      for (let i=0; i<color_defs.length; i++)
      {
        let re = color_defs[i].re;
        let processor = color_defs[i].process;
        let bits = re.exec(color_string);
        if (bits)
        {
          let channels = processor(bits);    // bugfix: was global. [ARC 17Jul12]
          this.r = channels[0];
          this.g = channels[1];
          this.b = channels[2];
          if (bits.length>3)
          {
            this.a = channels[3];
          }
          else
          {
            this.a = 1.0;
          }
          this.ok = true;
        }
      }
      // validate/cleanup values
      this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
      this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
      this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);
      this.a = (this.a < 0 || isNaN(this.a)) ? 1.0 : ((this.a > 1) ? 1.0 : this.a);      
    }

    toRGBA()
    {
      return 'rgba(' + this.r + ', ' + this.g + ', '  + this.b + ', ' + this.a + ')';
    }

    toRGB()
    {
      return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    }

    toHex()
    {
      let r = this.r.toString(16),
          g = this.g.toString(16),
          b = this.b.toString(16);
      if (r.length === 1)
      {
        r = '0' + r;
      }
      if (g.length === 1)
      {
        g = '0' + g;
      }
      if (b.length === 1)
      {
        b = '0' + b;
      }
      return '#' + r + g + b;
    }
  };

  class Drag3D {
    constructor(grabFn, dragFn, dropFn)
    {
      this.cgo = null;      // filled in by render
      this.target = null;   // the Obj3D or Group3D that is to be dragged, filled by enableDrag method
      this.grabCallback = grabFn || null;
      this.dragCallback = dragFn || null;
      this.dropCallback = dropFn || null;
      this.grabCsrPos = {x:0, y:0, z:0};
      this.dwgOrg = {x:0, y:0, z:0};   // target's drawing origin in world coords
      this.grabOfs = {x:0, y:0, z:0};  // csr offset from (relative) target dwgOrg
    }

    grab(evt)
    {
      const savThis = this;
      const event = evt||window.event;

      this.cgo.cnvs.onmouseup = function(e){savThis.drop(e);};
      this.cgo.cnvs.onmouseout = function(e){savThis.drop(e);};
      const csrPosWC = this.cgo.getCursorPosWC(event);  // world coords version of cursor position
      // save the cursor pos its very useful
      this.grabCsrPos.x = csrPosWC.x;
      this.grabCsrPos.y = csrPosWC.y;
      this.grabCsrPos.z = 0;
      // save the targets drawing origin (world coords)
      this.dwgOrg = {x:this.target.dwgOrg.tx,  // absolute coords, gets parent group dwgOrg added at render
                     y:this.target.dwgOrg.ty,
                     z:this.target.dwgOrg.tz};
      // save the cursor offset from the target drawing origin (relative to parent) for convenience
      // subtracting this from dragged cursor pos gives the distance the target should be moved
      if (this.target.parent)
      {
        // save cursor offset from drawing origin add parent Group offset (it will be inherited)
        this.grabOfs.x = csrPosWC.x - this.target.dwgOrg.tx + this.target.parent.dwgOrg.tx;
        this.grabOfs.y = csrPosWC.y - this.target.dwgOrg.ty + this.target.parent.dwgOrg.ty;
        this.grabOfs.z = csrPosWC.z - this.target.dwgOrg.tz + this.target.parent.dwgOrg.tz;
      }
      else
      {
        // no parent, so same as adding 0s
        this.grabOfs.x = csrPosWC.x - this.target.dwgOrg.tx;
        this.grabOfs.y = csrPosWC.y - this.target.dwgOrg.ty;
        this.grabOfs.z = csrPosWC.z - this.target.dwgOrg.tz;
      }
      if (this.grabCallback)
      {
        this.grabCallback(csrPosWC);    // call in the scope of dragNdrop object
      }
      this.cgo.cnvs.onmousemove = function(event){
        savThis.drag(event);
      };
      event.preventDefault();
      return false;
    }

    drag(event)
    {
      const csrPosWC = this.cgo.getCursorPosWC(event);
      if (this.dragCallback)
      {
        this.dragCallback(csrPosWC);
      }

      return false;
    }

    drop(event)
    {
      const csrPosWC = this.cgo.getCursorPosWC(event);
      this.cgo.cnvs.onmouseup = null;
      this.cgo.cnvs.onmouseout = null;
      this.cgo.cnvs.onmousemove = null;
      if (this.dropCallback)
      {
        this.dropCallback(csrPosWC);
      }
    }

    // version of drop that can be called from an app to stop a drag before the mouseup event
    cancelDrag(mousePos)
    {
      this.cgo.cnvs.onmouseup = null;
      this.cgo.cnvs.onmouseout = null;
      this.cgo.cnvs.onmousemove = null;
      if (this.dropCallback)
      {
        this.dropCallback(mousePos);
      }
    }
  }

  class TfmDescriptor {
    constructor(tfmType)
    {
      const argsAry = Array.prototype.slice.call(arguments, 1);
      let matrix;
      switch(tfmType)
      {
        case "TRN":
          matrix = translateMatrix(...argsAry);
          break;
        case "ROT":
          matrix = rotateMatrix(...argsAry);
          break;
        case "SCL":
          matrix = scaleMatrix(...argsAry);
          break;
        case "NUS":
          matrix = scaleNonUniformMatrix(...argsAry);
          break;
      }
      this.type = tfmType;
      this.args = argsAry;
      this.mat = matrix; 
    }
  }

  // Generate a 3D translation matrix
  function translateMatrix(x=0, y=0, z=0)
  {
    return new DOMMatrix([1, 0, 0, 0,
                          0, 1, 0, 0,
                          0, 0, 1, 0,
                          x, y, z, 1]);
  }

  // Generate a 3D rotate matrix, angle in degrees
  function rotateMatrix(vx=1, vy=0, vz=0, angle=0)
  {
    const mag = Math.sqrt(vx*vx + vy*vy + vz*vz),   // calc vector length
          x	= vx/mag,
          y	= vy/mag,
          z	= vz/mag,
          s	= Math.sin(-angle*Math.PI/180.0),
          c	= Math.cos(-angle*Math.PI/180.0),
          C	= 1-c;
    // ref: http://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation
    return new DOMMatrix([  (x*x*C+c), (y*x*C-z*s), (z*x*C+y*s), 0,
                          (x*y*C+z*s),   (y*y*C+c), (z*y*C-x*s), 0,
                          (x*z*C-y*s), (y*z*C+x*s),   (z*z*C+c), 0,
                                    0,           0,           0, 1]);
  }

  // Generate a 3D scale matrix
  function scaleMatrix(s=0.001)
  {
    const as = Math.abs(s);

    return new DOMMatrix([as,  0,  0, 0,
                           0, as,  0, 0,
                           0,  0, as, 0,
                           0,  0,  0, 1]);
  }

  // Generate a 3D scale matrix
  function scaleNonUniformMatrix(xScl, yScl, zScl)
  {
    // alow negative values to flip object
    const xs = xScl || 0.001,
          ys = yScl || xs,
          zs = zScl || xs;

    return new DOMMatrix([xs,  0,  0, 0 ,
                           0, ys,  0, 0 ,
                           0,  0, zs, 0 ,
                           0,  0,  0, 1]);
  }

  /*==========================================================
   * Generate the Normal to a plane, given 3 points (3D)
   * which define a plane.
   * The vector returned starts at 0,0,0
   * is 10 units long in direction perpendicular to the plane.
   * Calculates A X B where p2-p1=A, p3-p1=B
   *==========================================================*/
  calcNormal = function (p1, p2, p3)
  {
    const a = new Point(p2.x-p1.x, p2.y-p1.y, p2.z-p1.z),   // vector from p1 to p2
          b = new Point(p3.x-p1.x, p3.y-p1.y, p3.z-p1.z),   // vector from p1 to p3
          // a and b lie in the plane, a x b (cross product) is normal to both ie normal to plane
          nx = a.y*b.z - a.z*b.y,
          ny = a.z*b.x - a.x*b.z,
          nz = a.x*b.y - a.y*b.x,
          mag = Math.sqrt(nx*nx + ny*ny + nz*nz);   // calc vector length

    const n = (mag)? new Point(nx/mag, ny/mag, nz/mag): new Point(0, 0, 1); 
    
    return n;
  };

  /*==========================================================
   * Calculate the included angle between 2 vectors
   * a, from base p1 to p2, and b, from p1 to p3.
   *==========================================================*/
  calcIncAngle = function(p1, p2, p3)
  {
    const a = new Point(p2.x-p1.x, p2.y-p1.y, p2.z-p1.z),   // vector from p1 to p2
          b = new Point(p3.x-p1.x, p3.y-p1.y, p3.z-p1.z),   // vector from p1 to p3
          numerator = a.x*b.x + a.y*b.y + a.z*b.z,
          denominator	= Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z)*Math.sqrt(b.x*b.x + b.y*b.y + b.z*b.z);

    const angRads = (denominator)? Math.acos(numerator/denominator): 0;

    return angRads*180.0/Math.PI;
  };

  /*===============================================================================
  * objectByRevolution3D
  *-------------------------------------------------------------------------------
  * The profile described by 'svgData', an Array or String of 2D SVG commands
  * in the XY plane, will be used to form an object by rotating the profile
  * about the Y axis in 'segments' steps. 'svgData' coordinates will be in
  * world cordinates. The segments of the svgData are rotated by an angle
  * of 360/segments, the segment end points are joined to the previous segment's
  * profile by circular arcs (if 'straight' == false) or straight lines (if
  * 'straight' == true) at the top and bottom to define a Shape3D object. 
  * This Shape3D forms one segment of the final object like a segment of an
  * orange. To get correct color segment Shape3D's must traversed in a
  * CCW direction, so get the normal pointing out from the object.
  * Parameters:
  * svgData: Array of Cgo3D format commands defining the profile in the X,Y plane
  * segments: number of segments into which totalAngle is divided
  * straight: Use straight lines not circular arcs for top and bottom rims
  * options: standard options applied to all panels
  * returns: Group3D.
  *===============================================================================*/
  objectByRevolution3D = function(svgData, segments, straight, options)
  {
    const grp = new Group3D(),
          segs = segments || 6,
          segAng = 360 / segs,              // included angle of each segment
          segRad = segAng*Math.PI/180;
    
    if ((typeof(svgData) !== "string") &&  
        !(Array.isArray(svgData) && svgData.length && (typeof(svgData[0]) === "string") && (typeof(svgData[3]) === "string")))
    {
      console.warn("objectOfExtrusion outline data not an SVG path");
      return;
    }

    const pathSegs = new Cgo3Dsegs(svgToCgo3D(svgData));

    /*=========================================================
     * function genSvgArc()
     *---------------------------------------------------------
     * Generates an SVG format array defining a circular arc.
     * The arc center is at cx, cy. Arc starts from startAngle
     * and ends at endAngle. startAngle and endAngle are in
     * degrees. The arc radius is r (in world coords). If
     * antiClockwise is true the arc is traversed ccw, if false
     * it is traversed cw.
     * Assumes Cango coords, y +ve up, angles +ve CCW.
     *=========================================================*/
    function genSvgArc(cx, cy, r, startAngle, endAngle, antiClockwise)
    {
      const stRad = startAngle * Math.PI/180,
            edRad = endAngle * Math.PI/180,
            mj = 0.55228475,                 // magic number for drawing circle with 4 Bezier curve
            oy = cy + r*Math.sin(stRad),   // coords of start point for circular arc with center (cx,cy)
            ox = cx + r*Math.cos(stRad),
            ey = cy + r*Math.sin(edRad),   // coords of end point for circular arc with center (cx,cy)
            ex = cx + r*Math.cos(edRad),
            ccw = (antiClockwise? 1 : 0);
      let delta,
          svgData;

      const swp = ccw; 
      delta = ccw? edRad - stRad :stRad - edRad;
      if (delta < 0)
      {
        delta += 2*Math.PI;
      }
      if (delta > 2* Math.PI)
      {
        delta -= 2*Math.PI;
      }
      const lrgArc = delta > Math.PI? 1: 0;

      // dont try to draw full circle or no circle
      if ((Math.abs(delta) < 0.01) || (Math.abs(delta) > 2*Math.PI-0.01))
      {
        svgData = ["M",cx, cy-r,"C",cx+mj*r, cy-r, cx+r, cy-mj*r, cx+r, cy,
                                    cx+r, cy+mj*r, cx+mj*r, cy+r, cx, cy+r,
                                    cx-mj*r, cy+r, cx-r, cy+mj*r, cx-r, cy,
                                    cx-r, cy-mj*r, cx-mj*r, cy-r, cx, cy-r];
      }
      else
      {
        svgData = ["M", ox, oy, "A", r, r, 0, lrgArc, swp, ex, ey];
      }
      return svgData;
    }

    let st = 1;         // which segment to start building from
    let sp = pathSegs.length;
    // Check if top can be made in a single piece
    if ((pathSegs[0].ep.x == 0)&&(pathSegs[0].ep.y === pathSegs[1].ep.y))
    {
      // make the top
      let r = pathSegs[1].ep.x;
      let topObj;
      if (straight)
      {
        let topData = ['M',r,0];
        for (let i=1; i<segs; i++)
        {
          topData.push('L',r*Math.cos(i*segRad),r*Math.sin(i*segRad));
        }
        topData.push('Z');
        topObj = new Panel3D(topData, options);
      }
      else
      {
        topObj = new Panel3D(shapeDefs.circle(2*r, segs), options);
      }
      let topSegs = new Cgo3Dsegs(topObj.drawCmds);
      // flip over to xz plane
      topSegs = topSegs.rotate(1, 0, 0, -90)
                      .translate(0,pathSegs[0].ep.y,0); // lift up to startY
      topObj = new Shape3D(topSegs, options);
      grp.addObj(topObj);
      st = 2;  // skip the first section of the profile its done
    }
    // Check if bottom can be made in a single piece
    if ((pathSegs[sp-1].ep.x == 0)&&(pathSegs[sp-1].ep.y === pathSegs[sp-2].ep.y))
    {
      // make the bottom
      let r = pathSegs[sp-2].ep.x;
      let botObj;
      if (straight)
      {
        let botData = ['M',r,0];
        for (let i=1; i<segments; i++)
        {
          botData.push('L',r*Math.cos(i*segRad),r*Math.sin(i*segRad));
        }
        botData.push('Z');
        botObj = new Panel3D(botData, options);
      }
      else
      {
        botObj = new Panel3D(shapeDefs.circle(2*r, segs), options);
      }
      let botSegs = new Cgo3Dsegs(botObj.drawCmds);
      botSegs = botSegs.rotate(1, 0, 0, 90)     // flip over to xz plane
                      .translate(0,pathSegs[sp-1].ep.y,0);  // lift up to end Y
      botObj = new Shape3D(botSegs, options);
      grp.addObj(botObj);
      sp -= 1;  // skip the last section of the profile its done
    }
    const profile_0 = pathSegs.dup();
    const profile_1 = pathSegs.rotate(0, 1, 0, segAng);   // rotate by segAng to form the other side
    for (let n=0; n<segs; n++)
    {
      for (let m=st; m<sp; m++)
      {
        let panel, topRim, botRim;
        // construct a panel from top and bottom arcs and 2 copies of profile segment
        if (profile_0[m-1].ep.x == 0)   // truncate to 1st Quadrant
        {
          profile_0[m-1].ep.x = 0;
          profile_1[m-1].ep.x = 0;
        }
        let startX = profile_0[m-1].ep.x;
        let startY = profile_0[m-1].ep.y;
        let endX = profile_0[m].ep.x;
        let endY = profile_0[m].ep.y;

        if (startX > 0) // make a topRim if profile doesn't start at center
        {
          // top rim (drawn in xy), endpoint will be where this profile slice starts
          if (straight)
          {
            topRim = ['M',startX*Math.cos(segRad),startX*Math.sin(segRad), 'L',startX,0];
          }
          else
          {
            topRim = genSvgArc(0, 0, startX, segAng, 0, 0);  // generate SVG cmds for top arc
          }
          // shove them into an object to enable rotate and translate
          let topRimObj = new Cgo3Dsegs(svgToCgo3D(topRim));
          // topRim is in xy plane must be rotated to be in xz plane to join profile
          topRimObj = topRimObj.rotate(1, 0, 0, -90)      // flip top out of screen
                              .translate(0, startY, 0);  // move up from y=0 to top of profile slice
          panel = topRimObj;
        }
        else
        {
          // construct a moveTo command from end point of last command
          let topRimCmds = new DrawCmd3D("moveTo", [], profile_0[m-1].ep);
          panel = new Cgo3Dsegs([topRimCmds]);     // use this to start the panel DrawCmd3Ds array
        }
        // push this profile_0 segment DrawCmd3D into panel array
        panel.push(profile_0[m]);
        if (endX > 3)  // make the bottom rim if it has any size
        {
          if (straight)
          {
            botRim = ['M',endX,0, 'L',endX*Math.cos(-segRad),endX*Math.sin(-segRad)];
          }
          else
          {
            botRim = genSvgArc(0, 0, endX, 0, -segAng, 0);
          }
          // shove them into an object to enable rotate and translate
          let botRimObj = new Cgo3Dsegs(svgToCgo3D(botRim));
          // rim is in xy plane rotate to be in xz plane
          botRimObj = botRimObj.rotate(1, 0, 0, 90)       // flip bottom up to be out of screen
                              .translate(0, endY, 0);    // move down from y=0 to bottom of profile
          // now this is an moveTo and a bezierCurveTo, drop the 'moveTo'
          panel.push(botRimObj[1]);  // only 1 Bezier here
        }
        // construct a DrawCmd3D going backward up profile_1
        let pp1Cmds = new DrawCmd3D(profile_1[m].drawFn.slice(0), [], profile_1[m-1].ep);
        if (profile_1[m].cPts.length === 1)
        {
          pp1Cmds.cPts.push(profile_1[m].cPts[0]);
        }
        // change order of cPts if its a Cubic Bezier
        if (profile_1[m].cPts.length === 2)
        {
          pp1Cmds.cPts.push(profile_1[m].cPts[1]);
          pp1Cmds.cPts.push(profile_1[m].cPts[0]);
        }
        panel.push(pp1Cmds);  // now add retrace path to the panel commands
        // rotate to make way for the next panel
        panel = panel.rotate(0,1,0, -n*segAng);
        // make an Obj3D for this panel
        const panelObj = new Shape3D(panel, options);
        // now add the complete panel to the array which makes the final shape
        grp.addObj(panelObj);
      }
    }

    return grp; 
  }

  /*==============================================================================
   * objectByExtrusion3D
   *------------------------------------------------------------------------------
   * The profile described by 'svgData', an Array or String of 2D SVG commands
   * in the XY plane, is used to create a Panel3D to form the top of the 
   * returned object and a second Panel3D forming the bottom of the object.
   * The bottom shaped is translated by a distance 'len' along the -ve Z axis. 
   * The Bezier curve or straight lines of each segment of the top Panel3D  
   * are then used to form a segment of a path joining the corresponding 
   * segment of the bottom Panel3D by straight path segments. The 
   * resulting outline is used to create a Shape3D. The set of all these side
   * panels along with the top and bottom panels are added to a Group3D which
   * is returned.
   * Parameters:
   * svgData: Array of Cgo3D format commands defining the profile in the X,Y plane
   * len: the length in world coordinates by which the outline path is extruded
   * options: standard options applied to all panels
   * returns: Group3D.
   *==============================================================================*/
  objectByExtrusion3D = function(svgData, len=1, options)
  {
    let panelSegs, move, line, line2, line3, close, panelObj;

    if ((typeof(svgData) !== "string") &&  
        !(Array.isArray(svgData) && svgData.length && (typeof(svgData[0]) === "string") && (typeof(svgData[3]) === "string")))
    {
      console.warn("objectOfExtrusion outline data not an SVG path");
      return;
    }
    let pathSegs = new Cgo3Dsegs(svgToCgo3D(svgData));
    if (pathSegs[pathSegs.length-1].drawFn !== "closePath")
    {
      pathSegs.push(new DrawCmd3D("closePath"));
    }
    let revSegs = pathSegs.revWinding();
    let topObj = new Shape3D(pathSegs, options);
    // check that normal is out of the screen (ie outline traversed CCW)
    if (topObj.normal.z < 0)  // into screen so reverse winding
    {
      topObj = new Shape3D(revSegs, options);
      let tmp = pathSegs;   // swap the pointers
      pathSegs = revSegs;
      revSegs = tmp;
    } 
    topObj.type = "PANEL";  // must be a panel3D or tagging won't work
    topObj.setProperty("backhidden", true);
    const grp = new Group3D(topObj);
    const botSegs = pathSegs.translate(0, 0, -len);   // move back into screen
    const nSegs = pathSegs.length-2; 
    for (var seg=0; seg<nSegs; seg++)   // dont use last seg it is 'closePath'
    {
      panelSegs = new Cgo3Dsegs();
      move = new DrawCmd3D("moveTo", [], pathSegs[seg].ep)
      panelSegs.push(move);
      line = new DrawCmd3D("lineTo", [], botSegs[seg].ep)
      panelSegs.push(line);
      panelSegs.push(clone(botSegs[seg+1]));
      line2 = new DrawCmd3D("lineTo", [], pathSegs[seg+1].ep)
      panelSegs.push(line2);
      panelSegs.push(clone(revSegs[nSegs-seg]));
      close = new DrawCmd3D("closePath");
      panelSegs.push(close);
      panelObj = new Shape3D(panelSegs, options);
      panelObj.setProperty("backHidden", true);
      grp.addObj(panelObj);
    }
    panelSegs = new Cgo3Dsegs();
    move = new DrawCmd3D("moveTo", [], revSegs[nSegs-seg].ep)
    panelSegs.push(move);
    line = new DrawCmd3D("lineTo", [], botSegs[seg].ep)
    panelSegs.push(line);
    line2 = new DrawCmd3D("lineTo", [], botSegs[0].ep)
    panelSegs.push(line2);
    line3 = new DrawCmd3D("lineTo", [], pathSegs[0].ep)
    panelSegs.push(line3);
    close = new DrawCmd3D("closePath");
    panelSegs.push(close);
    panelObj = new Shape3D(panelSegs, options);
    panelObj.setProperty("backHidden", true);
    grp.addObj(panelObj);

    const botObj = new Shape3D(botSegs, options);
    botObj.type = "PANEL";  // must be a panel3D or tagging won't work
    botObj.setProperty("backhidden", false);
    botObj.flipNormal();
    grp.addObj(botObj);

    return grp;
  }    

  /*==============================================================================
   * surfaceByExtrusion3D
   * The profile described by 'svgData', an Array or String of 2D SVG commands
   * in the XY plane, is used to create an array of Cgo3D segments defining 
   * the top edge of the surface to be created.
   * The segments are duplicated forming the bottom edge of the object.
   * The bottom segments are translated by a distance 'len' along the 
   * -ve Z axis. The Bezier curve or straight lines of each segment of the top   
   * are then used to form a segment of a path joining the corresponding 
   * segment of the bottom by straight path segments. The 
   * resulting outline is used to create a Shape3D. The set of all these 
   * surface panels are added to a Group3D which is returned.
   * Parameters:
   * svgData: Array of Cgo3D format commands defining the profile in the X,Y plane
   * len: the length in world coordinates by which the outline path is extruded
   * options: standard options applied to all panels
   * returns: Group3D.
   *==============================================================================*/
  surfaceByExtrusion3D = function(svgData, len=1, options)
  {
    let panelSegs, move, line, line2, line3, close, panelObj;

    if ((typeof(svgData) !== "string") &&  
        !(Array.isArray(svgData) && svgData.length && (typeof(svgData[0]) === "string") && (typeof(svgData[3]) === "string")))
    {
      console.warn("objectOfExtrusion outline data not an SVG path");
      return;
    }
    let pathSegs = new Cgo3Dsegs(svgToCgo3D(svgData));
    const closed = pathSegs[pathSegs.length-1].drawFn === "closePath";
    let revSegs= pathSegs.revWinding();
    let topObj = new Shape3D(pathSegs, options);
    // check that normal is out of the screen (ie outline tranversed CCW)
    if (topObj.normal.z < 0)  // into screen so reverse winding
    {
      let tmp = pathSegs;   // swap the pointers
      pathSegs = revSegs;
      revSegs = tmp;
    }
    const botSegs = pathSegs.translate(0, 0, -len);   // move back into screen
    const grp = new Group3D();
    const nSegs = (closed)? pathSegs.length-2: pathSegs.length-1; 
    for (var seg=0; seg<nSegs; seg++)   // dont use last seg it is 'closePath'
    {
      panelSegs = new Cgo3Dsegs();
      move = new DrawCmd3D("moveTo", [], pathSegs[seg].ep)
      panelSegs.push(move);
      line = new DrawCmd3D("lineTo", [], botSegs[seg].ep)
      panelSegs.push(line);
      panelSegs.push(clone(botSegs[seg+1]));
      line2 = new DrawCmd3D("lineTo", [], pathSegs[seg+1].ep)
      panelSegs.push(line2);
      panelSegs.push(clone(revSegs[nSegs-seg]));
      close = new DrawCmd3D("closePath");
      panelSegs.push(close);
      panelObj = new Shape3D(panelSegs, options);
      grp.addObj(panelObj);
    }
    if (closed)
    {
      panelSegs = new Cgo3Dsegs();
      move = new DrawCmd3D("moveTo", [], revSegs[nSegs-seg].ep)
      panelSegs.push(move);
      line = new DrawCmd3D("lineTo", [], botSegs[seg].ep)
      panelSegs.push(line);
      line2 = new DrawCmd3D("lineTo", [], botSegs[0].ep)
      panelSegs.push(line2);
      line3 = new DrawCmd3D("lineTo", [], pathSegs[0].ep)
      panelSegs.push(line3);
      close = new DrawCmd3D("closePath");
      panelSegs.push(close);
      panelObj = new Shape3D(panelSegs, options);
      grp.addObj(panelObj);
    } 

    return grp;
  } 

  Group3D = class {
    constructor()
    {
      this.type = "GROUP";                  // enum of type to instruct the render method
      this.parent = null;                   // pointer to parent group if any
      this.children = [];                   // only Group3Ds have children
      this.dwgOrg = new Point(0, 0, 0);     // drawing origin (0,0,0) may get translated
      this.centroid = new Point();
      this.ofsTfmAry = [];
      this.netTfmAry = [];
      this.netTfm = new DOMMatrix();  // product of parent Group netTfm and this.netTfm
      this.dragNdropHandlers;               // array of DnD handlers to be passed to newly added children
      // add any objects passed by forwarding them to addObj
      this.addObj.apply(this, arguments);
    }

    setProperty(propertyName, value)
    {
      // set Obj3D property recursively
      function iterate(grp)
      {
        grp.children.forEach(function(childNode){
          if (childNode.type === "GROUP")
          {
            iterate(childNode);
          }
          else  // Obj3D
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
      if (idx !== -1)
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
          else   // Obj3D
          {
            if (!elem || (!types.includes(elem.type)))  // don't add undefined or non-Obj3D
            {
              console.warn("Group3D.addObj: argument Type Error", elem);
              return;
            }
            elem.parent = this;
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

      let xSum = 0,
          ySum = 0,
          zSum = 0,
          numPts = 0;    // total point counter for all commands
      for (let j=0; j<this.children.length; j++)
      {
        // add the objects centroid to calc group centroid
        xSum += this.children[j].centroid.x;
        ySum += this.children[j].centroid.y;
        zSum += this.children[j].centroid.z;
        numPts++;
      }
      if (numPts)
      {
        this.centroid.x = xSum/numPts;       // get recalculated several times but never if no Obj3Ds
        this.centroid.y = ySum/numPts;
        this.centroid.z = zSum/numPts;
      }
    }

    translate(x=0, y=0, z=0) 
    {
      this.ofsTfmAry.push(new TfmDescriptor("TRN", x, y, z));
    }

    scale(s=1)
    {
      this.ofsTfmAry.push(new TfmDescriptor("SCL", s));
      // lineWidth is in pixels (not world coords) so it soft scales
      this.lineWidth *= s;
    }

    scaleNonUniform(xScl=1, yScl, zScl)
    {
      this.ofsTfmAry.push(new TfmDescriptor("NUS", xScl, yScl, zScl));
      // lineWidth is in pixels (not world coords) so it soft scales
      this.lineWidth *= xScl;
    }

    rotate(vx, vy, vz, deg)
    {
      this.ofsTfmAry.push(new TfmDescriptor("ROT", vx, vy, vz, deg));
    }

    rotateX(deg=0)
    {
      this.ofsTfmAry.push(new TfmDescriptor("ROT", 1, 0, 0, deg));
    }

    rotateY(deg=0)
    {
      this.ofsTfmAry.push(new TfmDescriptor("ROT", 0, 1, 0, deg));
    }

    rotateZ(deg=0)
    {
      this.ofsTfmAry.push(new TfmDescriptor("ROT", 0, 0, 1, deg));
    }

    transformReset()
    {
      this.ofsTfmAry = [];  // clear out the pending transforms
    }

    /*======================================
    * Recursively add drag object to Obj3D
    * decendants.
    * When rendered all these Obj3D will be
    * added to _draggables to be checked on
    * mousedown
    *-------------------------------------*/
    enableDrag(grabFn, dragFn, dropFn)
    {
      const savThis = this;

      function iterate(grp)
      {
        grp.children.forEach(function(childNode){
          if (childNode.type === "GROUP")
          {
            iterate(childNode);
          }
          else  // Obj3D
          {
            if (childNode.dragNdrop === null)    // don't over-write if its already assigned a handler
            {
              childNode.enableDrag(grabFn, dragFn, dropFn);
              childNode.dragNdrop.target = savThis;     // the Group3D is the target being dragged
            }
          }
        });
      }

      this.dragNdropHandlers = arguments;
      iterate(this);
    }

    /*======================================
    * Disable dragging on Obj3D children
    *-------------------------------------*/
    disableDrag()
    {
      // Can't immediately remove from _draggables array (no Cango reference) but no harm
      function iterate(grp)
      {
        grp.children.forEach(function(childNode){
          if (childNode.type === "GROUP")
          {
            iterate(childNode);
          }
          else
          {
            childNode.disableDrag();
          }
        });
      }

      this.dragNdropHandlers = undefined;
      iterate(this);
    }

    tagChildPanel(idx, tagObj, xOfs, yOfs)
    {
      const dx = xOfs || 0,
            dy = yOfs || 0;
      let pnlObj = null;
      let tagGrp = null;

      if (idx <0 || idx >= this.children.length)
      {
        console.warn("tagChildPanel child index out of range")
        return;
      }
      if (this.children[idx].type === "PANEL")
      {
        pnlObj = this.children[idx].dup();
        const dnd = this.children[idx].dragNdrop;
        if (dnd)
        {
          pnlObj.enableDrag(dnd.grabCallback, dnd.dragCallback, dnd.dropCallback);
          pnlObj.dragNdrop.target = dnd.target;  // the Group3D is the target being dragged
        }
      }
      else if (this.children[idx].type === "GROUP" && this.children[idx].taggedPanelGrp)
      {
        tagGrp = this.children[idx]
        pnlObj = tagGrp.children[0];
      }
      if (pnlObj === null)
      {
        console.warn("tagChildPanel target child not a Panel3D")
        return;
      }
      if (tagObj.type !== 'PANEL' && tagObj.type !== 'TEXT')
      {
        console.warn("tagChildPanel tag object not a Panel3D or Text3D")
        return;
      }
      if (tagObj.parent !== null)       // already a member of a Group3D, use a copy
      {
        const tagObjDup = tagObj.dup();
        tagObj = tagObjDup();
      }

      tagObj.hardTfmAry = clone(pnlObj.hardTfmAry);
      tagObj.hardTfmAry.push(new TfmDescriptor("TRN", dx, dy, 0));
      tagObj.backHidden = true;
      tagObj.centroid.x = pnlObj.centroid.x;    // so sorting doesn't put shape in front
      tagObj.centroid.y = pnlObj.centroid.y;
      tagObj.centroid.z = pnlObj.centroid.z;
      tagObj.normal.x = pnlObj.normal.x;
      tagObj.normal.y = pnlObj.normal.y;
      tagObj.normal.z = pnlObj.normal.z;
      tagObj.dwgOrg.x = pnlObj.dwgOrg.x;
      tagObj.dwgOrg.y = pnlObj.dwgOrg.y;
      tagObj.dwgOrg.z = pnlObj.dwgOrg.z;
      // enable drag and drop if this group has drag
      if (pnlObj.dragNdrop)
      {
        tagObj.enableDrag(pnlObj.dragNdrop.grabCallback, pnlObj.dragNdrop.dragCallback, pnlObj.dragNdrop.dropCallback);
        tagObj.dragNdrop.target = pnlObj.dragNdrop.target; 
      }

      if (tagGrp)
      {
        // pnlObj is a previously tagged Panel so now a Group3D
        tagGrp.addObj(tagObj);
      }
      else  // pnlObj is plain Panel3D
      {
        tagGrp = new Group3D(pnlObj, tagObj);
        tagGrp.taggedPanelGrp = true;
        this.children[idx] = tagGrp;
        this.children[idx].parent = this;
      }
    } 
  } /*  Group3D */

  function RadialGradient()
  {
    this.cx = 0;
    this.cy = 0;
    this.radius = 1.05;     // dimension relative to radius
    this.spotRad = 0.06;
    this.colorStops = [];
    this.addColorStop = function(){this.colorStops.push(arguments);};
  }

  Sphere3D = class extends Group3D {
    constructor(diam=100, options)
    {
      super();

      this.diameter = diam;
      this.scaling = 1;
      this.baseRGB = {r:255, g:0, b:0};
      this.shine = 0.5;
      this.ambient = 0.7;
      this.hardTfmAry = [];   // accumulate hard transform requests to be applied at render
      this.lightColor = undefined;
      this.darkColor = undefined;
      this.darkBlur = undefined; 

      this.disc = new Panel3D(["M",0,0].concat(shapeDefs.circle(this.diameter, 4)), {
        fillColor: this.lightColor} );
      this.disc.centroid = new Point(0, 0, 0);
      // tag as a hilite object
      this.disc.hiliteFill = true;

      this.shader = new Panel3D(this.shadeOutline(this.diameter/2, this.diameter/2), {
        fillColor: this.darkColor});
      this.shader.centroid = new Point(0, 0, 0);
      // tag as a hilite object
      this.shader.hiliteFill = false;

      this.children.push(this.disc, this.shader);
      this.shader.parent = this;
      this.disc.parent = this;

      // disable unused methods
      this.scaleNonUniform = undefined;
      this.deleteObj = undefined;
      this.addObj = undefined;
      this.tagChildPanel = undefined;
      // only translate, scale, rotate, rotateX, rotateY, rotateZ are supported

      // handle user requested options
      const opt = (typeof options === 'object')? options: {};   // avoid undeclared object errors
      for (let prop in opt)
      {
        if (opt.hasOwnProperty(prop)) // own property, not inherited from prototype
        {
          this.setProperty(prop, opt[prop]);
        }
      }
 
      if (this.disc.fillColor === undefined)  // if fillColor not set as an option
      {
        this.genColors(this.baseRGB, this.shine, this.ambient);  // generate default colors
      }
    }

    shadeOutline(halfWid, halfHgt, degs=0)
    {
      const A = Math.PI*degs/180.0,   // radians
            sinA = Math.sin(A),
            cosA = Math.cos(A),
            c = 0.551915,
            w = halfWid,
            h = halfHgt;
      
      function rot(x, y)
      {
        return [x*cosA - y*sinA, x*sinA + y*cosA];
      }

      return ["M", 0,0,  // must start at 0,0 for radial gradient
              "M", ...rot(0,h), // CCW
              "C", ...rot(-c*h,h),  ...rot(-h,c*h), ...rot(-h,0),
              "C", ...rot(-h,-c*h), ...rot(-c*h,-h), ...rot(0,-h),
              "C", ...rot(c*w,-h), ...rot(w,-c*h), ...rot(w,0),
              "C", ...rot(w,c*h), ...rot(c*w,h), ...rot(0,h),
              "Z"];
    }
        
    genColors(baseRGB, shine, ambient)
    {
      const shadeRGB = {r:ambient*baseRGB.r, g:ambient*baseRGB.g, b:ambient*baseRGB.b};

      function genHiLiteGrad()
      {
        const rVal = baseRGB.r,
              gVal = baseRGB.g,
              bVal = baseRGB.b;
        const rSpec = rVal + shine*(255 - rVal),  // specular reflection add white components proportional to shininess
              gSpec = gVal + shine*(255 - gVal),
              bSpec = bVal + shine*(255 - bVal);
  
        const shading = new RadialGradient();

        shading.addColorStop(0, "rgba("+rSpec+","+gSpec+","+bSpec+",1)");
        shading.addColorStop(0.5, "rgba("+rVal+","+gVal+","+bVal+",1)");
        shading.addColorStop(0.78, "rgba("+Math.round(0.85*rVal)+","+Math.round(0.85*gVal)+","+Math.round(0.85*bVal)+",1)");
        shading.addColorStop(1, "rgba("+Math.round(0.6*rVal)+","+Math.round(0.6*gVal)+","+Math.round(0.6*bVal)+",1)");

        return shading;
      }

      function genGrad()
      {
        const shading = new RadialGradient();

        shading.addColorStop(0, "rgba("+shadeRGB.r+","+shadeRGB.g+","+shadeRGB.b+",1)");
        shading.addColorStop(0.35, "rgba("+shadeRGB.r+","+shadeRGB.g+","+shadeRGB.b+",1)");
        shading.addColorStop(0.78, "rgba("+Math.round(0.85*shadeRGB.r)+","+Math.round(0.85*shadeRGB.g)+","+Math.round(0.85*shadeRGB.b)+",1)");
        shading.addColorStop(1, "rgba("+Math.round(0.6*shadeRGB.r)+","+Math.round(0.6*shadeRGB.g)+","+Math.round(0.6*shadeRGB.b)+",1)");

        return shading;
      }

      this.lightColor = genHiLiteGrad();
      this.darkColor = genGrad();
      this.darkBlur = "rgba("+shadeRGB.r+","+shadeRGB.g+","+shadeRGB.b+",1)";

      this.disc.fillColor = this.lightColor;
      this.shader.fillColor = this.darkColor;
      this.shader.shadowColor = this.darkBlur;
    }

    setProperty(propertyName, value)
    {
      let color;

      if ((typeof propertyName !== "string")||(value === undefined)||(value === null))
      {
        return;
      }

      switch (propertyName.toLowerCase())
      {
        case "fillcolor":
          color = new RGBAColor(value);
          if (color.ok)
          {
            this.baseRGB = {r:color.r, g:color.g, b:color.b};
            this.genColors(this.baseRGB, this.shine, this.ambient);
          }
          else
          {
            console.warn("bad argument for 'fillColor' option");
          }   
          break;
        case "ambient":
          if (value <= 1 && value >= 0)
          {
            this.ambient = value;
            this.genColors(this.baseRGB, this.shine, this.ambient);
          }
          break;
        case "shine":
          if (value <= 1 && value >= 0)
          {
            this.shine = value;
            this.genColors(this.baseRGB, this.shine, this.ambient);
          }
          break;
        case "trans":
          if (Array.isArray(value) && value.length === 3)
          {
            this.hardTfmAry.unshift(new TfmDescriptor("TRN", value[0], value[1], value[2]));
          }
          else if (value instanceof Point)
          {
            this.hardTfmAry.unshift(new TfmDescriptor("TRN", value.x, value.y, value.z));
          }   
          else
          {
            console.warn("bad argument for 'trans' option");
          }    
          break;
        case "x":
          this.hardTfmAry.unshift(new TfmDescriptor("TRN", value, 0, 0));
          break;
        case "y":
          this.hardTfmAry.unshift(new TfmDescriptor("TRN", 0, value, 0));
          break;
        case "z":
          this.hardTfmAry.unshift(new TfmDescriptor("TRN", 0, 0, value));
          break;
        case "rot":
          if (Array.isArray(value) && value.length === 4)
          {
            this.hardTfmAry.unshift(new TfmDescriptor("ROT", value[0], value[1], value[2], value[3]));
          }
          else
          {
            console.warn("bad argument for 'rot' option");
          }    
          break;
        case "xrot":
        case "rotx":
          this.hardTfmAry.unshift(new TfmDescriptor("ROT", 1, 0, 0, value));
          break;
        case "yrot":
        case "roty":
          this.hardTfmAry.unshift(new TfmDescriptor("ROT", 0, 1, 0, value));
          break;
        case "zrot":
        case "rotz":
          this.hardTfmAry.unshift(new TfmDescriptor("ROT", 0, 0, 1, value));
          break;
        case "scl":
          const scl = (value != 0)? value: 1;
          this.hardTfmAry.unshift(new TfmDescriptor("SCL", scl));
          break;
      }
    }
  }

  class Obj3D {
    constructor(commands, objtype, options)
    {
      let xSum = 0,
          ySum = 0,
          zSum = 0,
          numPts = 0;    // total point counter for all commands

      this.type = objtype || "SHAPE";         // PATH, PANEL, SHAPE, TEXT
      this.parent = null;                     // parent Group3D
      this.drawCmds = [];                     // array of DrawCmd3D objects
      this.bBoxCmds = [];                     // DrawCmd3D array for the text bounding box
      this.dwgOrg = new Point(0, 0, 0);       // drawing origin (0,0,0) may get translated
      this.centroid = new Point(0, 0, 0);     // average of x, y, z coords
      this.normal = new Point(0, 0, 0);       // from centroid, normal to object plane
      this.dragNdrop = null;
      // properties handling transform inheritance
      this.hardTfmAry = [];                   // accumulate hard transform requests to be applied at render
      this.ofsTfmAry = [];                    // accumulate transform requests to be applied at render
      this.netTfm = new DOMMatrix();    // product of all soft and hard and ofs (soft) transforms
      // properties set by setProperty. If undefined render uses Cango3D default
      this.strokeColor = null;                // used for PATHs and TEXT or wireframe SHAPE
      this.fillColor = null;                  // used to fill SHAPEs
      this.backColor = null;                  //  "    "   "    "
      this.flatColor = false;                 // don't use the angle to sun to dim colors
      this.backHidden = false;                // don't draw if normal pointing away
      this.lineWidth = null;                  // in pixels
      this.lineWidthWC = null;                // in world coords has precedence over lineWidth
      this.width = 0;                         // TEXT only
      this.height = 0;                        // TEXT only
      this.lineCap = null;                    // TEXT only
      this.lineJoin = null;                   // TEXT only
      this.fontSize = null;                   // TEXT only
      this.fontWeight = null;                 // TEXT only
      this.lorg = 7;                          // TEXT only

      if (commands instanceof Cgo3Dsegs)
      {
        this.drawCmds = commands;
      }
      if (this.drawCmds.length)
      {
        this.drawCmds.forEach(function(dCmd){
          if (dCmd.ep !== undefined)  // check for Z command, has no coords
          {
            xSum += dCmd.ep.x;
            ySum += dCmd.ep.y;
            zSum += dCmd.ep.z;
            numPts++;
          }
        });
        this.centroid.x = xSum/numPts;
        this.centroid.y = ySum/numPts;
        this.centroid.z = zSum/numPts;

        if (this.drawCmds.length > 2)
        {
          // make the normal(o, a, b)  = aXb, = vector from centroid to data[0], b = centroid to data[1]
          this.normal = calcNormal(this.centroid, this.drawCmds[1].ep, this.drawCmds[2].ep);
          // NOTE: traverse CCW, normal is out of screen (+z), traverse path CW, normal is into screen (-z)
        }
        else
        {
          if (this.drawCmds.length === 2)    // if Bezier it will need a normal
          {
            if (this.drawCmds[1].cPts.length)
            {
              this.normal = calcNormal(this.centroid, this.drawCmds[1].ep, this.drawCmds[1].cPts[0]);
            }
            else
            {
              // straight line but make a normal for completeness
              this.centroid.x = this.drawCmds[0].ep.x;  // make centroid the start of the line
              this.centroid.y = this.drawCmds[0].ep.y;
              this.centroid.z = this.drawCmds[0].ep.z;
              if (!this.drawCmds[1].ep.z) 
                this.normal.z = 1;
              else if (!this.drawCmds[1].ep.y)
                this.normal.y = 1;
              else if (!this.drawCmds[1].ep.x)
                this.normal.x = 1;
              else
              {
                this.normal = calcNormal(this.centroid, new Point(0,0,1), this.drawCmds[1].cPts[0]);
              }
            }
          }
          else
          {
            return;
          }
        }
        // move normal to start from the centroid
        this.normal.x += this.centroid.x;
        this.normal.y += this.centroid.y;
        this.normal.z += this.centroid.z;
      }

      // handle user requested options
      const opt = (typeof options === 'object')? options: {};   // avoid undeclared object errors
      for (let prop in opt)
      {
        if (opt.hasOwnProperty(prop)) // own property, not inherited from prototype
        {
          this.setProperty(prop, opt[prop]);
        }
      }
    }

    /*======================================
    * Flips the normal to point in opposite
    * direction. Useful if object coordinates
    * track CW. The normal is into screen if
    * outline is traversed CW (RH rule).
    *-------------------------------------*/
    flipNormal()
    {
      const nx = this.normal.x,
            ny = this.normal.y,
            nz = this.normal.z;

      this.normal.x = 2*this.centroid.x - nx;
      this.normal.y = 2*this.centroid.y - ny;
      this.normal.z = 2*this.centroid.z - nz;
    }

    translate(x, y, z)
    {
      this.ofsTfmAry.push(new TfmDescriptor("TRN", x, y, z));
    }

    scale(scl=1)
    {
      this.ofsTfmAry.push(new TfmDescriptor("SCL", scl));
      // lineWidth is in pixels (not world coords) so it soft scales
      this.lineWidth *= scl;
    }

    scaleNonUniform(xScl, yScl, zScl)
    {
      const s = xScl || 1;

      this.ofsTfmAry.push(new TfmDescriptor("NUS", xScl, yScl, zScl));
      // lineWidth is in pixels (not world coords) so it soft scales
      this.lineWidth *= s;
    }

    rotate(vx, vy, vz, deg)
    {
      this.ofsTfmAry.push(new TfmDescriptor("ROT", vx, vy, vz, deg));
    }

    rotateX(deg=0)
    {
      this.ofsTfmAry.push(new TfmDescriptor("ROT", 1, 0, 0, deg));
    }

    rotateY(deg=0)
    {
      this.ofsTfmAry.push(new TfmDescriptor("ROT", 0, 1, 0, deg));
    }

    rotateZ(deg=0)
    {
      this.ofsTfmAry.push(new TfmDescriptor("ROT", 0, 0, 1, deg));
    }

    transformReset()
    {
      this.ofsTfmAry = [];  // clear out the pending transforms
    }

    enableDrag(grabFn, dragFn, dropFn)
    {
      this.dragNdrop = new Drag3D(grabFn, dragFn, dropFn);
      // fill in the Drag3D properties for use by callBacks
      this.dragNdrop.target = this;
    }

    disableDrag()
    {
      if ((!this.dragNdrop)||(!this.dragNdrop.cgo))
      {
        return;
      }
      // remove this object from array to be checked on mousedown
      const aidx = this.dragNdrop.cgo.cnvs.dragObjects.indexOf(this);
      this.dragNdrop.cgo.cnvs.dragObjects.splice(aidx, 1);
      this.dragNdrop = null;
    }

    setProperty(propertyName, value)
    {
      let color;

      if ((typeof propertyName !== "string")||(value === undefined)||(value === null))
      {
        return;
      }

      switch (propertyName.toLowerCase())
      {
        case "fillcolor":
          if (value instanceof RadialGradient)
          {
            this.fillColor = value;
          }
          else 
          {
            color = new RGBAColor(value);
            if (color.ok)
            {
              this.fillColor = color;
            }
            else
            {
              console.warn("bad argument for 'fillColor' option");
            }
          }   
          break;
        case "backcolor":
          if (value instanceof RadialGradient)
          {
            this.backColor = value;
          }
          else 
          {
            color = new RGBAColor(value);
            if (color.ok)
            {
              this.backColor = color;
            }
            else
            {
              console.warn("bad argument for 'backColor' option");
            }
          } 
          break;
        case "strokecolor":    // support for gradients is private (patch for Graph3D)
          if (value instanceof RadialGradient)
          {
            this.strokeColor = value;
          }
          else 
          {
            color = new RGBAColor(value);
            if (color.ok)
            {
              this.strokeColor = color;
            }
            else
            {
              console.warn("bad argument for 'strokeColor' option");
            }    
          }
          break;
        case "backhidden":
          this.backHidden = (value === true);
          break;
        case "flatcolor":
          this.flatColor = (value === true);
          break;
        case "border":
          this.border = (value === true);
          break;
        case "linewidth":
        case "strokewidth":                 // for backward compatibility
          this.lineWidth = value;
          break;
        case "linewidthwc":
          this.lineWidthWC = value;
          break;
        case "linecap":
          if (typeof value !== "string")
          {
            return;
          }
          if ((value === "butt")||(value === "round")||(value === "square"))
          {
            this.lineCap = value;
          }
          break;
        case "linejoin":
          if (typeof value !== "string")
          {
            return;
          }
          if ((value === "bevel")||(value === "round")||(value === "miter"))
          {
            this.lineJoin = value;
          }
          break;
        case "fontsize":
          this.fontSize = value;
          break;
        case "fontweight":
          if ((typeof value === "string")||((typeof value === "number")&&(value>=100)&&(value<=900)))
          {
            this.fontWeight = value;
          }
          break;
        case "lorg":
          if ([1, 2, 3, 4, 5, 6, 7, 8, 9].indexOf(value) !== -1)
          {
            this.lorg = value;
          }
          else
          {
            console.warn("bad argument for 'lorg' option");
          }    

          break;
        case "trans":
          if (Array.isArray(value) && value.length === 3)
          {
            this.hardTfmAry.unshift(new TfmDescriptor("TRN", value[0], value[1], value[2]));
          }
          else if (value instanceof Point)
          {
            this.hardTfmAry.unshift(new TfmDescriptor("TRN", value.x, value.y, value.z));
          }   
          else
          {
            console.warn("bad argument for 'trans' option");
          }    
          break;
        case "x":
          this.hardTfmAry.unshift(new TfmDescriptor("TRN", value, 0, 0));
          break;
        case "y":
          this.hardTfmAry.unshift(new TfmDescriptor("TRN", 0, value, 0));
          break;
        case "z":
          this.hardTfmAry.unshift(new TfmDescriptor("TRN", 0, 0, value));
          break;
        case "rot":
          if (Array.isArray(value) && value.length === 4)
          {
            this.hardTfmAry.unshift(new TfmDescriptor("ROT", value[0], value[1], value[2], value[3]));
          }
          else
          {
            console.warn("bad argument for 'rot' option");
          }    
          break;
        case "xrot":
        case "rotx":
          this.hardTfmAry.unshift(new TfmDescriptor("ROT", 1, 0, 0, value));
          break;
        case "yrot":
        case "roty":
          this.hardTfmAry.unshift(new TfmDescriptor("ROT", 0, 1, 0, value));
          break;
        case "zrot":
        case "rotz":
          this.hardTfmAry.unshift(new TfmDescriptor("ROT", 0, 0, 1, value));
          break;
        case "scl":
          const scl = (value != 0)? value: 1;
          this.hardTfmAry.unshift(new TfmDescriptor("SCL", scl));
          break;
        case "sclnonuniform":
          if (Array.isArray(value) && value.length === 3)
          {
            this.hardTfmAry.unshift(new TfmDescriptor("NUS", value[0], value[1], value[2]));
          }    
          else
          {
            console.warn("bad argument for 'sclNonUniform' option");
          }    
          break;
        default:
          break;
      }
    }

    dup()
    {
      const newObj = new Obj3D();

      newObj.parent = this.parent;
      newObj.type = this.type;
      newObj.drawCmds = clone(this.drawCmds);
      newObj.bBoxCmds = clone(this.bBoxCmds);
      newObj.dwgOrg = clone(this.dwgOrg);
      newObj.centroid = clone(this.centroid);
      newObj.normal = clone(this.normal);
      newObj.hardTfmAry = clone(this.hardTfmAry); 
      if (this.strokeColor) 
        newObj.setProperty("strokeColor", this.strokeColor.toRGBA());
      else
        newObj.strokeColor = null;
      if (this.fillColor) 
        newObj.setProperty("fillColor", this.fillColor.toRGBA());
      else
        newObj.fillColor = null;
      if (this.backColor) 
        newObj.setProperty("backColor", this.backColor.toRGBA());
      else
        newObj.backColor = null;
      newObj.backHidden = this.backHidden;
      newObj.flatColor = this.flatColor;
      newObj.lineWidth = this.lineWidth;
      newObj.lineWidthWC = this.lineWidthWC;
      newObj.lineCap = this.lineCap;
      newObj.lineJoin = this.lineJoin;
      newObj.fontSize = this.fontSize;
      newObj.fontWeight = this.fontWeight;
      newObj.lorg = this.lorg;
      newObj.width = this.width;
      newObj.height = this.height;

      return newObj;
    }
  } /*  Obj3D */

  Path3D = class extends Obj3D {
    constructor(commands, options)
    {
      let cmds;
      if (commands instanceof Cgo3Dsegs)
      {
        cmds = commands;
      }
      else if ((Array.isArray(commands)) && commands.length && typeof(commands[0]) === "string" && typeof(commands[4]) === "string") 
      {
        // convert Cgo3D (SVG) commands off to the canvas DrawCmd processor
        cmds = new Cgo3Dsegs(commands);
      }

      super(cmds, 'PATH', options);
    }
  };

  Panel3D = class extends Obj3D {
    constructor(commands, options)
    {
      let cmds;
      if ((typeof(commands) === "string") || 
          (Array.isArray(commands) && commands.length && typeof(commands[0]) === "string" && typeof(commands[3]) === "string"))
      {
        const cmds3D = svgToCgo3D(commands);  // 2D SVG commands
        cmds = new Cgo3Dsegs(cmds3D);
      }
      else 
      {
        // convert Cgo2D (SVG) commands off to Cgo3D 
        console.warn("descriptor for Panel3D not String or Array of 2D SVG commands");
      }

      super(cmds, 'PANEL', options);
    }
  };

  Shape3D = class extends Obj3D {
    constructor(commands, options)
    {
      let cmds;
      if (commands instanceof Cgo3Dsegs)
      {
        cmds = commands;
      }
      else if ((Array.isArray(commands)) && commands.length && typeof(commands[0]) === "string" && typeof(commands[4]) === "string") 
      {
        // convert Cgo3D (SVG) commands off to the canvas DrawCmd processor
        cmds = new Cgo3Dsegs(commands);
      }

      super(cmds, 'SHAPE', options);
    }
  };

  Text3D = class extends Obj3D {
    constructor (str, options)
    {
      const strData = hersheyFont.stringToCgo3D(str);
      const cmds = new Cgo3Dsegs(strData.cgoData);

      super(cmds, 'TEXT', options);

      this.width = strData.width;
      this.height = strData.height;
      this.lineCap = "round";

      // construct the DrawCmds for the text bounding box
      const dy = 0.25*strData.height,   // correct for alphabetic baseline, its offset about 0.25*char height
            ll = new Point(0, -dy, 0),
            lr = new Point(strData.width, -dy, 0),
            ul = new Point(0, strData.height-dy, 0),
            ur = new Point(strData.width, strData.height-dy, 0);
      // construct the DrawCmd3Ds for the text bounding box
      this.bBoxCmds[0] = new DrawCmd3D("moveTo", [], ul);
      this.bBoxCmds[1] = new DrawCmd3D("lineTo", [], ll);
      this.bBoxCmds[2] = new DrawCmd3D("lineTo", [], lr);
      this.bBoxCmds[3] = new DrawCmd3D("lineTo", [], ur);
      this.bBoxCmds[4] = new DrawCmd3D("closePath", []);
    }
  };

  /*==============================================================
   * This text code is based on Jim Studt, CanvasTextFunctions
   * see http://jim.studt.net/canvastext/
   * It has been adapted to output Cgo3D format and has had Greek
   * letters and a few symbols added from Hershey's original font
   *==============================================================*/
  const hersheyFont = {
    letters: {
      /*   */ ' ': {width:16, cdata:[]},
      /* ! */ '!': {width:10, cdata:['M',5,21,0,'L',5,7,0,'M',5,2,0,'L',4,1,0,5,0,0,6,1,0,5,2,0]},
      /* " */ '"': {width:16, cdata:['M',4,21,0,'L',4,14,0,'M',12,21,0,'L',12,14,0]},
      /* # */ '#': {width:21, cdata:['M',11,25,0,'L',4,-7,0,'M',17,25,0,'L',10,-7,0,'M',4,12,0,'L',18,12,0,'M',3,6,0,'L',17,6,0]},
      /* $ */ '$': {width:20, cdata:['M',8,25,0,'L',8,-4,0,'M',12,25,0,'L',12,-4,0,'M',17,18,0,'L',15,20,0,12,21,0,8,21,0,5,20,0,3,18,0,3,16,0,4,14,0,5,13,0,7,12,0,13,10,0,15,9,0,16,8,0,17,6,0,17,3,0,15,1,0,12,0,0,8,0,0,5,1,0,3,3,0]},
      /* % */ '%': {width:24, cdata:['M',21,21,0,'L',3,0,0,'M',8,21,0,'L',10,19,0,10,17,0,9,15,0,7,14,0,5,14,0,3,16,0,3,18,0,4,20,0,6,21,0,8,21,0,10,20,0,13,19,0,16,19,0,19,20,0,21,21,0,'M',17,7,0,'L',15,6,0,14,4,0,14,2,0,16,0,0,18,0,0,20,1,0,21,3,0,21,5,0,19,7,0,17,7,0]},
      /* & */ '&': {width:26, cdata:['M',23,12,0,'L',23,13,0,22,14,0,21,14,0,20,13,0,19,11,0,17,6,0,15,3,0,13,1,0,11,0,0,7,0,0,5,1,0,4,2,0,3,4,0,3,6,0,4,8,0,5,9,0,12,13,0,13,14,0,14,16,0,14,18,0,13,20,0,11,21,0,9,20,0,8,18,0,8,16,0,9,13,0,11,10,0,16,3,0,18,1,0,20,0,0,22,0,0,23,1,0,23,2,0]},
      /* ' */ '\'': {width:10, cdata:['M',5,19,0,'L',4,20,0,5,21,0,6,20,0,6,18,0,5,16,0,4,15,0]},
      /* ( */ '(': {width:14, cdata:['M',11,25,0,'L',9,23,0,7,20,0,5,16,0,4,11,0,4,7,0,5,2,0,7,-2,0,9,-5,0,11,-7,0]},
      /* ) */ ')': {width:14, cdata:['M',3,25,0,'L',5,23,0,7,20,0,9,16,0,10,11,0,10,7,0,9,2,0,7,-2,0,5,-5,0,3,-7,0]},
      /* * */ '*': {width:16, cdata:['M',8,15,0,'L',8,3,0,'M',3,12,0,'L',13,6,0,'M',13,12,0,'L',3,6,0]},
      /* + */ '+': {width:26, cdata:['M',13,18,0,'L',13,0,0,'M',4,9,0,'L',22,9,0]},
      /* , */ ',': {width:8, cdata:['M',5,4,0,'L',4,3,0,3,4,0,4,5,0,5,4,0,5,2,0,3,0,0]},
      /* - */ '-': {width:26, cdata:['M',4,9,0,'L',22,9,0]},
      /* . */ '.': {width:8, cdata:['M',4,5,0,'L',3,4,0,4,3,0,5,4,0,4,5,0]},
      /* / */ '/': {width:22, cdata:['M',20,25,0,'L',2,-7,0]},
      /* 0 */ '0': {width:20, cdata:['M',9,21,0,'L',6,20,0,4,17,0,3,12,0,3,9,0,4,4,0,6,1,0,9,0,0,11,0,0,14,1,0,16,4,0,17,9,0,17,12,0,16,17,0,14,20,0,11,21,0,9,21,0]},
      /* 1 */ '1': {width:20, cdata:['M',6,17,0,'L',8,18,0,11,21,0,11,0,0]},
      /* 2 */ '2': {width:20, cdata:['M',4,16,0,'L',4,17,0,5,19,0,6,20,0,8,21,0,12,21,0,14,20,0,15,19,0,16,17,0,16,15,0,15,13,0,13,10,0,3,0,0,17,0,0]},
      /* 3 */ '3': {width:20, cdata:['M',5,21,0,'L',16,21,0,10,13,0,13,13,0,15,12,0,16,11,0,17,8,0,17,6,0,16,3,0,14,1,0,11,0,0,8,0,0,5,1,0,4,2,0,3,4,0]},
      /* 4 */ '4': {width:20, cdata:['M',13,21,0,'L',3,7,0,18,7,0,'M',13,21,0,'L',13,0,0]},
      /* 5 */ '5': {width:20, cdata:['M',15,21,0,'L',5,21,0,4,12,0,5,13,0,8,14,0,11,14,0,14,13,0,16,11,0,17,8,0,17,6,0,16,3,0,14,1,0,11,0,0,8,0,0,5,1,0,4,2,0,3,4,0]},
      /* 6 */ '6': {width:20, cdata:['M',16,18,0,'L',15,20,0,12,21,0,10,21,0,7,20,0,5,17,0,4,12,0,4,7,0,5,3,0,7,1,0,10,0,0,11,0,0,14,1,0,16,3,0,17,6,0,17,7,0,16,10,0,14,12,0,11,13,0,10,13,0,7,12,0,5,10,0,4,7,0]},
      /* 7 */ '7': {width:20, cdata:['M',17,21,0,'L',7,0,0,'M',3,21,0,'L',17,21,0]},
      /* 8 */ '8': {width:20, cdata:['M',8,21,0,'L',5,20,0,4,18,0,4,16,0,5,14,0,7,13,0,11,12,0,14,11,0,16,9,0,17,7,0,17,4,0,16,2,0,15,1,0,12,0,0,8,0,0,5,1,0,4,2,0,3,4,0,3,7,0,4,9,0,6,11,0,9,12,0,13,13,0,15,14,0,16,16,0,16,18,0,15,20,0,12,21,0,8,21,0]},
      /* 9 */ '9': {width:20, cdata:['M',16,14,0,'L',15,11,0,13,9,0,10,8,0,9,8,0,6,9,0,4,11,0,3,14,0,3,15,0,4,18,0,6,20,0,9,21,0,10,21,0,13,20,0,15,18,0,16,14,0,16,9,0,15,4,0,13,1,0,10,0,0,8,0,0,5,1,0,4,3,0]},
      /* : */ ':': {width:8, cdata:['M',4,12,0,'L',3,11,0,4,10,0,5,11,0,4,12,0,'M',4,5,0,'L',3,4,0,4,3,0,5,4,0,4,5,0]},
      /* ; */ ';': {width:8, cdata:['M',4,12,0,'L',3,11,0,4,10,0,5,11,0,4,12,0,'M',5,4,0,'L',4,3,0,3,4,0,4,5,0,5,4,0,5,2,0,3,0,0]},
      /* < */ '<': {width:24, cdata:['M',20,18,0,'L',4,9,0,20,0,0]},
      /* = */ '=': {width:26, cdata:['M',4,12,0,'L',22,12,0,'M',4,6,0,'L',22,6,0]},
      /* > */ '>': {width:24, cdata:['M',4,18,0,'L',20,9,0,4,0,0]},
      /* ? */ '?': {width:18, cdata:['M',3,16,0,'L',3,17,0,4,19,0,5,20,0,7,21,0,11,21,0,13,20,0,14,19,0,15,17,0,15,15,0,14,13,0,13,12,0,9,10,0,9,7,0,'M',9,2,0,'L',8,1,0,9,0,0,10,1,0,9,2,0]},
      /* @ */ '@': {width:27, cdata:['M',18,13,0,'L',17,15,0,15,16,0,12,16,0,10,15,0,9,14,0,8,11,0,8,8,0,9,6,0,11,5,0,14,5,0,16,6,0,17,8,0,'M',12,16,0,'L',10,14,0,9,11,0,9,8,0,10,6,0,11,5,0,'M',18,16,0,'L',17,8,0,17,6,0,19,5,0,21,5,0,23,7,0,24,10,0,24,12,0,23,15,0,22,17,0,20,19,0,18,20,0,15,21,0,12,21,0,9,20,0,7,19,0,5,17,0,4,15,0,3,12,0,3,9,0,4,6,0,5,4,0,7,2,0,9,1,0,12,0,0,15,0,0,18,1,0,20,2,0,21,3,0,'M',19,16,0,'L',18,8,0,18,6,0,19,5,0]},
      /* A */ 'A': {width:18, cdata:['M',9,21,0,'L',1,0,0,'M',9,21,0,'L',17,0,0,'M',4,7,0,'L',14,7,0]},
      /* B */ 'B': {width:21, cdata:['M',4,21,0,'L',4,0,0,'M',4,21,0,'L',13,21,0,16,20,0,17,19,0,18,17,0,18,15,0,17,13,0,16,12,0,13,11,0,'M',4,11,0,'L',13,11,0,16,10,0,17,9,0,18,7,0,18,4,0,17,2,0,16,1,0,13,0,0,4,0,0]},
      /* C */ 'C': {width:21, cdata:['M',18,16,0,'L',17,18,0,15,20,0,13,21,0,9,21,0,7,20,0,5,18,0,4,16,0,3,13,0,3,8,0,4,5,0,5,3,0,7,1,0,9,0,0,13,0,0,15,1,0,17,3,0,18,5,0]},
      /* D */ 'D': {width:21, cdata:['M',4,21,0,'L',4,0,0,'M',4,21,0,'L',11,21,0,14,20,0,16,18,0,17,16,0,18,13,0,18,8,0,17,5,0,16,3,0,14,1,0,11,0,0,4,0,0]},
      /* E */ 'E': {width:19, cdata:['M',4,21,0,'L',4,0,0,'M',4,21,0,'L',17,21,0,'M',4,11,0,'L',12,11,0,'M',4,0,0,'L',17,0,0]},
      /* F */ 'F': {width:18, cdata:['M',4,21,0,'L',4,0,0,'M',4,21,0,'L',17,21,0,'M',4,11,0,'L',12,11,0]},
      /* G */ 'G': {width:21, cdata:['M',18,16,0,'L',17,18,0,15,20,0,13,21,0,9,21,0,7,20,0,5,18,0,4,16,0,3,13,0,3,8,0,4,5,0,5,3,0,7,1,0,9,0,0,13,0,0,15,1,0,17,3,0,18,5,0,18,8,0,'M',13,8,0,'L',18,8,0]},
      /* H */ 'H': {width:22, cdata:['M',4,21,0,'L',4,0,0,'M',18,21,0,'L',18,0,0,'M',4,11,0,'L',18,11,0]},
      /* I */ 'I': {width:8, cdata:['M',4,21,0,'L',4,0,0]},
      /* J */ 'J': {width:16, cdata:['M',12,21,0,'L',12,5,0,11,2,0,10,1,0,8,0,0,6,0,0,4,1,0,3,2,0,2,5,0,2,7,0]},
      /* K */ 'K': {width:21, cdata:['M',4,21,0,'L',4,0,0,'M',18,21,0,'L',4,7,0,'M',9,12,0,'L',18,0,0]},
      /* L */ 'L': {width:17, cdata:['M',4,21,0,'L',4,0,0,'M',4,0,0,'L',16,0,0]},
      /* M */ 'M': {width:24, cdata:['M',4,21,0,'L',4,0,0,'M',4,21,0,'L',12,0,0,'M',20,21,0,'L',12,0,0,'M',20,21,0,'L',20,0,0]},
      /* N */ 'N': {width:22, cdata:['M',4,21,0,'L',4,0,0,'M',4,21,0,'L',18,0,0,'M',18,21,0,'L',18,0,0]},
      /* O */ 'O': {width:22, cdata:['M',9,21,0,'L',7,20,0,5,18,0,4,16,0,3,13,0,3,8,0,4,5,0,5,3,0,7,1,0,9,0,0,13,0,0,15,1,0,17,3,0,18,5,0,19,8,0,19,13,0,18,16,0,17,18,0,15,20,0,13,21,0,9,21,0]},
      /* P */ 'P': {width:21, cdata:['M',4,21,0,'L',4,0,0,'M',4,21,0,'L',13,21,0,16,20,0,17,19,0,18,17,0,18,14,0,17,12,0,16,11,0,13,10,0,4,10,0]},
      /* Q */ 'Q': {width:22, cdata:['M',9,21,0,'L',7,20,0,5,18,0,4,16,0,3,13,0,3,8,0,4,5,0,5,3,0,7,1,0,9,0,0,13,0,0,15,1,0,17,3,0,18,5,0,19,8,0,19,13,0,18,16,0,17,18,0,15,20,0,13,21,0,9,21,0,'M',12,4,0,'L',18,-2,0]},
      /* R */ 'R': {width:21, cdata:['M',4,21,0,'L',4,0,0,'M',4,21,0,'L',13,21,0,16,20,0,17,19,0,18,17,0,18,15,0,17,13,0,16,12,0,13,11,0,4,11,0,'M',11,11,0,'L',18,0,0]},
      /* S */ 'S': {width:20, cdata:['M',17,18,0,'L',15,20,0,12,21,0,8,21,0,5,20,0,3,18,0,3,16,0,4,14,0,5,13,0,7,12,0,13,10,0,15,9,0,16,8,0,17,6,0,17,3,0,15,1,0,12,0,0,8,0,0,5,1,0,3,3,0]},
      /* T */ 'T': {width:16, cdata:['M',8,21,0,'L',8,0,0,'M',1,21,0,'L',15,21,0]},
      /* U */ 'U': {width:22, cdata:['M',4,21,0,'L',4,6,0,5,3,0,7,1,0,10,0,0,12,0,0,15,1,0,17,3,0,18,6,0,18,21,0]},
      /* V */ 'V': {width:18, cdata:['M',1,21,0,'L',9,0,0,'M',17,21,0,'L',9,0,0]},
      /* W */ 'W': {width:24, cdata:['M',2,21,0,'L',7,0,0,'M',12,21,0,'L',7,0,0,'M',12,21,0,'L',17,0,0,'M',22,21,0,'L',17,0,0]},
      /* X */ 'X': {width:20, cdata:['M',3,21,0,'L',17,0,0,'M',17,21,0,'L',3,0,0]},
      /* Y */ 'Y': {width:18, cdata:['M',1,21,0,'L',9,11,0,9,0,0,'M',17,21,0,'L',9,11,0]},
      /* Z */ 'Z': {width:20, cdata:['M',17,21,0,'L',3,0,0,'M',3,21,0,'L',17,21,0,'M',3,0,0,'L',17,0,0]},
      /* [ */ '[': {width:14, cdata:['M',4,25,0,'L',4,-7,0,'M',5,25,0,'L',5,-7,0,'M',4,25,0,'L',11,25,0,'M',4,-7,0,'L',11,-7,0]},
      /* \ */ '\\': {width:14, cdata:['M',0,21,0,'L',14,-3,0]},
      /* ] */ ']': {width:14, cdata:['M',9,25,0,'L',9,-7,0,'M',10,25,0,'L',10,-7,0,'M',3,25,0,'L',10,25,0,'M',3,-7,0,'L',10,-7,0]},
      /* ^ */ '^': {width:16, cdata:['M',8,23,0,'L',0,9,0,'M',8,23,0,'L',16,9,0]},
      /* _ */ '_': {width:18, cdata:['M',0,-7,0,'L',18,-7,0]},
      /* ` */ '`': {width:8, cdata:['M',5,16,0,'L',3,14,0,3,12,0,4,11,0,5,12,0,4,13,0,3,12,0]},
      /* a */ 'a': {width:19, cdata:['M',15,14,0,'L',15,0,0,'M',15,11,0,'L',13,13,0,11,14,0,8,14,0,6,13,0,4,11,0,3,8,0,3,6,0,4,3,0,6,1,0,8,0,0,11,0,0,13,1,0,15,3,0]},
      /* b */ 'b': {width:19, cdata:['M',4,21,0,'L',4,0,0,'M',4,11,0,'L',6,13,0,8,14,0,11,14,0,13,13,0,15,11,0,16,8,0,16,6,0,15,3,0,13,1,0,11,0,0,8,0,0,6,1,0,4,3,0]},
      /* c */ 'c': {width:18, cdata:['M',15,11,0,'L',13,13,0,11,14,0,8,14,0,6,13,0,4,11,0,3,8,0,3,6,0,4,3,0,6,1,0,8,0,0,11,0,0,13,1,0,15,3,0]},
      /* d */ 'd': {width:19, cdata:['M',15,21,0,'L',15,0,0,'M',15,11,0,'L',13,13,0,11,14,0,8,14,0,6,13,0,4,11,0,3,8,0,3,6,0,4,3,0,6,1,0,8,0,0,11,0,0,13,1,0,15,3,0]},
      /* e */ 'e': {width:18, cdata:['M',3,8,0,'L',15,8,0,15,10,0,14,12,0,13,13,0,11,14,0,8,14,0,6,13,0,4,11,0,3,8,0,3,6,0,4,3,0,6,1,0,8,0,0,11,0,0,13,1,0,15,3,0]},
      /* f */ 'f': {width:12, cdata:['M',10,21,0,'L',8,21,0,6,20,0,5,17,0,5,0,0,'M',2,14,0,'L',9,14,0]},
      /* g */ 'g': {width:19, cdata:['M',15,14,0,'L',15,-2,0,14,-5,0,13,-6,0,11,-7,0,8,-7,0,6,-6,0,'M',15,11,0,'L',13,13,0,11,14,0,8,14,0,6,13,0,4,11,0,3,8,0,3,6,0,4,3,0,6,1,0,8,0,0,11,0,0,13,1,0,15,3,0]},
      /* h */ 'h': {width:19, cdata:['M',4,21,0,'L',4,0,0,'M',4,10,0,'L',7,13,0,9,14,0,12,14,0,14,13,0,15,10,0,15,0,0]},
      /* i */ 'i': {width:8, cdata:['M',3,21,0,'L',4,20,0,5,21,0,4,22,0,3,21,0,'M',4,14,0,'L',4,0,0]},
      /* j */ 'j': {width:10, cdata:['M',5,21,0,'L',6,20,0,7,21,0,6,22,0,5,21,0,'M',6,14,0,'L',6,-3,0,5,-6,0,3,-7,0,1,-7,0]},
      /* k */ 'k': {width:17, cdata:['M',4,21,0,'L',4,0,0,'M',14,14,0,'L',4,4,0,'M',8,8,0,'L',15,0,0]},
      /* l */ 'l': {width:8, cdata:['M',4,21,0,'L',4,0,0]},
      /* m */ 'm': {width:30, cdata:['M',4,14,0,'L',4,0,0,'M',4,10,0,'L',7,13,0,9,14,0,12,14,0,14,13,0,15,10,0,15,0,0,'M',15,10,0,'L',18,13,0,20,14,0,23,14,0,25,13,0,26,10,0,26,0,0]},
      /* n */ 'n': {width:19, cdata:['M',4,14,0,'L',4,0,0,'M',4,10,0,'L',7,13,0,9,14,0,12,14,0,14,13,0,15,10,0,15,0,0]},
      /* o */ 'o': {width:19, cdata:['M',8,14,0,'L',6,13,0,4,11,0,3,8,0,3,6,0,4,3,0,6,1,0,8,0,0,11,0,0,13,1,0,15,3,0,16,6,0,16,8,0,15,11,0,13,13,0,11,14,0,8,14,0]},
      /* p */ 'p': {width:19, cdata:['M',4,14,0,'L',4,-7,0,'M',4,11,0,'L',6,13,0,8,14,0,11,14,0,13,13,0,15,11,0,16,8,0,16,6,0,15,3,0,13,1,0,11,0,0,8,0,0,6,1,0,4,3,0]},
      /* q */ 'q': {width:19, cdata:['M',15,14,0,'L',15,-7,0,'M',15,11,0,'L',13,13,0,11,14,0,8,14,0,6,13,0,4,11,0,3,8,0,3,6,0,4,3,0,6,1,0,8,0,0,11,0,0,13,1,0,15,3,0]},
      /* r */ 'r': {width:13, cdata:['M',4,14,0,'L',4,0,0,'M',4,8,0,'L',5,11,0,7,13,0,9,14,0,12,14,0]},
      /* s */ 's': {width:17, cdata:['M',14,11,0,'L',13,13,0,10,14,0,7,14,0,4,13,0,3,11,0,4,9,0,6,8,0,11,7,0,13,6,0,14,4,0,14,3,0,13,1,0,10,0,0,7,0,0,4,1,0,3,3,0]},
      /* t */ 't': {width:12, cdata:['M',5,21,0,'L',5,4,0,6,1,0,8,0,0,10,0,0,'M',2,14,0,'L',9,14,0]},
      /* u */ 'u': {width:19, cdata:['M',4,14,0,'L',4,4,0,5,1,0,7,0,0,10,0,0,12,1,0,15,4,0,'M',15,14,0,'L',15,0,0]},
      /* v */ 'v': {width:16, cdata:['M',2,14,0,'L',8,0,0,'M',14,14,0,'L',8,0,0]},
      /* w */ 'w': {width:22, cdata:['M',3,14,0,'L',7,0,0,'M',11,14,0,'L',7,0,0,'M',11,14,0,'L',15,0,0,'M',19,14,0,'L',15,0,0]},
      /* x */ 'x': {width:17, cdata:['M',3,14,0,'L',14,0,0,'M',14,14,0,'L',3,0,0]},
      /* y */ 'y': {width:16, cdata:['M',2,14,0,'L',8,0,0,'M',14,14,0,'L',8,0,0,6,-4,0,4,-6,0,2,-7,0,1,-7,0]},
      /* z */ 'z': {width:17, cdata:['M',14,14,0,'L',3,0,0,'M',3,14,0,'L',14,14,0,'M',3,0,0,'L',14,0,0]},
      /* { */ '{': {width:14, cdata:['M',9,25,0,'L',7,24,0,6,23,0,5,21,0,5,19,0,6,17,0,7,16,0,8,14,0,8,12,0,6,10,0,'M',7,24,0,'L',6,22,0,6,20,0,7,18,0,8,17,0,9,15,0,9,13,0,8,11,0,4,9,0,8,7,0,9,5,0,9,3,0,8,1,0,7,0,0,6,-2,0,6,-4,0,7,-6,0,'M',6,8,0,'L',8,6,0,8,4,0,7,2,0,6,1,0,5,-1,0,5,-3,0,6,-5,0,7,-6,0,9,-7,0]},
      /* | */ '|': {width:8, cdata:['M',4,25,0,'L',4,-7,0]},
      /* } */ '}': {width:14, cdata:['M',5,25,0,'L',7,24,0,8,23,0,9,21,0,9,19,0,8,17,0,7,16,0,6,14,0,6,12,0,8,10,0,'M',7,24,0,'L',8,22,0,8,20,0,7,18,0,6,17,0,5,15,0,5,13,0,6,11,0,10,9,0,6,7,0,5,5,0,5,3,0,6,1,0,7,0,0,8,-2,0,8,-4,0,7,-6,0,'M',8,8,0,'L',6,6,0,6,4,0,7,2,0,8,1,0,9,-1,0,9,-3,0,8,-5,0,7,-6,0,5,-7,0]},
      /* ~ */ '~': {width:24, cdata:['M',3,6,0,'L',3,8,0,4,11,0,6,12,0,8,12,0,10,11,0,14,8,0,16,7,0,18,7,0,20,8,0,21,10,0,'M',3,8,0,'L',4,10,0,6,11,0,8,11,0,10,10,0,14,7,0,16,6,0,18,6,0,20,7,0,21,10,0,21,12,0]},
      /* &Alpha; */   '\u0391': {width:18, cdata:['M',9,21,0,'L',1,0,0,'M',9,21,0,'L',17,0,0,'M',4,7,0,'L',14,7,0]},
      /* &Beta; */    '\u0392': {width:21, cdata:['M',4,21,0,'L',4,0,0,'M',4,21,0,'L',13,21,0,16,20,0,17,19,0,18,17,0,18,15,0,17,13,0,16,12,0,13,11,0,'M',4,11,0,'L',13,11,0,16,10,0,17,9,0,18,7,0,18,4,0,17,2,0,16,1,0,13,0,0,4,0,0]},
      /* &Chi; */     '\u03A7': {width:20, cdata:['M',3,21,0,'L',17,0,0,'M',3,0,0,'L',17,21,0]},
      /* &Delta; */   '\u0394': {width:18, cdata:['M',9,21,0,'L',1,0,0,'M',9,21,0,'L',17,0,0,'M',1,0,0,'L',17,0,0]},
      /* &Epsilon; */ '\u0395': {width:19, cdata:['M',4,21,0,'L',4,0,0,'M',4,21,0,'L',17,21,0,'M',4,11,0,'L',12,11,0,'M',4,0,0,'L',17,0,0]},
      /* &Phi; */     '\u03A6': {width:20, cdata:['M',10,21,0,'L',10,0,0,'M',8,16,0,'L',5,15,0,4,14,0,3,12,0,3,9,0,4,7,0,5,6,0,8,5,0,12,5,0,15,6,0,16,7,0,17,9,0,17,12,0,16,14,0,15,15,0,12,16,0,8,16,0]},
      /* &Gamma; */   '\u0393': {width:17, cdata:['M',4,21,0,'L',4,0,0,'M',4,21,0,'L',16,21,0]},
      /* &Eta; */     '\u0397': {width:22, cdata:['M',4,21,0,'L',4,0,0,'M',18,21,0,'L',18,0,0,'M',4,11,0,'L',18,11,0]},
      /* &Iota; */    '\u0399': {width:8, cdata:['M',4,21,0,'L',4,0,0]},
      /* &middot; */  '\u00B7': {width:5, cdata:['M',2,10,0,'L',2,9,0,3,9,0,3,10,0,2,10,0]},
      /* &Kappa; */   '\u039A': {width:21, cdata:['M',4,21,0,'L',4,0,0,'M',18,21,0,'L',4,7,0,'M',9,12,0,'L',18,0,0]},
      /* &Lambda; */  '\u039B': {width:18, cdata:['M',9,21,0,'L',1,0,0,'M',9,21,0,'L',17,0,0]},
      /* &Mu; */      '\u039C': {width:24, cdata:['M',4,21,0,'L',4,0,0,'M',4,21,0,'L',12,0,0,'M',20,21,0,'L',12,0,0,'M',20,21,0,'L',20,0,0]},
      /* &Nu; */      '\u039D': {width:22, cdata:['M',4,21,0,'L',4,0,0,'M',4,21,0,'L',18,0,0,'M',18,21,0,'L',18,0,0]},
      /* &Omicron; */ '\u039F': {width:22, cdata:['M',9,21,0,'L',7,20,0,5,18,0,4,16,0,3,13,0,3,8,0,4,5,0,5,3,0,7,1,0,9,0,0,13,0,0,15,1,0,17,3,0,18,5,0,19,8,0,19,13,0,18,16,0,17,18,0,15,20,0,13,21,0,9,21,0]},
      /* &Pi; */      '\u03A0': {width:22, cdata:['M',4,21,0,'L',4,0,0,'M',18,21,0,'L',18,0,0,'M',4,21,0,'L',18,21,0]},
      /* &Theta; */   '\u0398': {width:22, cdata:['M',9,21,0,'L',7,20,0,5,18,0,4,16,0,3,13,0,3,8,0,4,5,0,5,3,0,7,1,0,9,0,0,13,0,0,15,1,0,17,3,0,18,5,0,19,8,0,19,13,0,18,16,0,17,18,0,15,20,0,13,21,0,9,21,0,'M',8,11,0,'L',14,11,0]},
      /* &Rho; */     '\u03A1': {width:21, cdata:['M',4,21,0,'L',4,0,0,'M',4,21,0,'L',13,21,0,16,20,0,17,19,0,18,17,0,18,14,0,17,12,0,16,11,0,13,10,0,4,10,0]},
      /* &Sigma; */   '\u03A3': {width:18, cdata:['M',2,21,0,'L',9,11,0,2,0,0,'M',2,21,0,'L',16,21,0,'M',2,0,0,'L',16,0,0]},
      /* &Tau; */     '\u03A4': {width:16, cdata:['M',8,21,0,'L',8,0,0,'M',1,21,0,'L',15,21,0]},
      /* &upsih; */   '\u03A5': {width:18, cdata:['M',2,16,0,'L',2,18,0,3,20,0,4,21,0,6,21,0,7,20,0,8,18,0,9,14,0,9,0,0,'M',16,16,0,'L',16,18,0,15,20,0,14,21,0,12,21,0,11,20,0,10,18,0,9,14,0]},
      /* &deg; */     '\u00B0': {width:14, cdata:['M',6,21,0,'L',4,20,0,3,18,0,3,16,0,4,14,0,6,13,0,8,13,0,10,14,0,11,16,0,11,18,0,10,20,0,8,21,0,6,21,0]},
      /* &Omega; */   '\u03A9': {width:20, cdata:['M',3,0,0,'L',7,0,0,4,7,0,3,11,0,3,15,0,4,18,0,6,20,0,9,21,0,11,21,0,14,20,0,16,18,0,17,15,0,17,11,0,16,7,0,13,0,0,17,0,0]},
      /* &Xi; */      '\u039E': {width:18, cdata:['M',2,21,0,'L',16,21,0,'M',6,11,0,'L',12,11,0,'M',2,0,0,'L',16,0,0]},
      /* &Psi; */     '\u03A8': {width:22, cdata:['M',11,21,0,'L',11,0,0,'M',2,15,0,'L',3,15,0,4,14,0,5,10,0,6,8,0,7,7,0,10,6,0,12,6,0,15,7,0,16,8,0,17,10,0,18,14,0,19,15,0,20,15,0]},
      /* &Zeta; */    '\u0396': {width:20, cdata:['M',17,21,0,'L',3,0,0,'M',3,21,0,'L',17,21,0,'M',3,0,0,'L',17,0,0]},
      /* &alpha; */   '\u03B1': {width:21, cdata:['M',9,14,0,'L',7,13,0,5,11,0,4,9,0,3,6,0,3,3,0,4,1,0,6,0,0,8,0,0,10,1,0,13,4,0,15,7,0,17,11,0,18,14,0,'M',9,14,0,'L',11,14,0,12,13,0,13,11,0,15,3,0,16,1,0,17,0,0,18,0,0]},
      /* &beta; */    '\u03B2': {width:19, cdata:['M',12,21,0,'L',10,20,0,8,18,0,6,14,0,5,11,0,4,7,0,3,1,0,2,-7,0,'M',12,21,0,'L',14,21,0,16,19,0,16,16,0,15,14,0,14,13,0,12,12,0,9,12,0,'M',9,12,0,'L',11,11,0,13,9,0,14,7,0,14,4,0,13,2,0,12,1,0,10,0,0,8,0,0,6,1,0,5,2,0,4,5,0]},
      /* &chi; */     '\u03C7': {width:18, cdata:['M',2,14,0,'L',4,14,0,6,12,0,12,-5,0,14,-7,0,16,-7,0,'M',17,14,0,'L',16,12,0,14,9,0,4,-2,0,2,-5,0,1,-7,0]},
      /* &delta; */   '\u03B4': {width:18, cdata:['M',11,14,0,'L',8,14,0,6,13,0,4,11,0,3,8,0,3,5,0,4,2,0,5,1,0,7,0,0,9,0,0,11,1,0,13,3,0,14,6,0,14,9,0,13,12,0,11,14,0,9,16,0,8,18,0,8,20,0,9,21,0,11,21,0,13,20,0,15,18,0]},
      /* &epsilon; */ '\u03B5': {width:16, cdata:['M',13,12,0,'L',12,13,0,10,14,0,7,14,0,5,13,0,5,11,0,6,9,0,9,8,0,'M',9,8,0,'L',5,7,0,3,5,0,3,3,0,4,1,0,6,0,0,9,0,0,11,1,0,13,3,0]},
      /* &phi; */     '\u03C6': {width:22, cdata:['M',8,13,0,'L',6,12,0,4,10,0,3,7,0,3,4,0,4,2,0,5,1,0,7,0,0,10,0,0,13,1,0,16,3,0,18,6,0,19,9,0,19,12,0,17,14,0,15,14,0,13,12,0,11,8,0,9,3,0,6,-7,0]},
      /* &gamma; */   '\u03B3': {width:19, cdata:['M',1,11,0,'L',3,13,0,5,14,0,6,14,0,8,13,0,9,12,0,10,9,0,10,5,0,9,0,0,'M',17,14,0,'L',16,11,0,15,9,0,9,0,0,7,-4,0,6,-7,0]},
      /* &eta; */     '\u03B7': {width:20, cdata:['M',1,10,0,'L',2,12,0,4,14,0,6,14,0,7,13,0,7,11,0,6,7,0,4,0,0,'M',6,7,0,'L',8,11,0,10,13,0,12,14,0,14,14,0,16,12,0,16,9,0,15,4,0,12,-7,0]},
      /* &iota; */    '\u03B9': {width:11, cdata:['M',6,14,0,'L',4,7,0,3,3,0,3,1,0,4,0,0,6,0,0,8,2,0,9,4,0]},
      /* &times; */   '\u00D7': {width:22, cdata:['M',4,16,0,'L',18,2,0,'M',18,16,0,'L',4,2,0]},
      /* &kappa; */   '\u03BA': {width:18, cdata:['M',6,14,0,'L',2,0,0,'M',16,13,0,'L',15,14,0,14,14,0,12,13,0,8,9,0,6,8,0,5,8,0,'M',5,8,0,'L',7,7,0,8,6,0,10,1,0,11,0,0,12,0,0,13,1,0]},
      /* &lambda; */  '\u03BB': {width:16, cdata:['M',1,21,0,'L',3,21,0,5,20,0,6,19,0,14,0,0,'M',8,14,0,'L',2,0,0]},
      /* &mu; */      '\u03BC': {width:21, cdata:['M',7,14,0,'L',1,-7,0,'M',6,10,0,'L',5,5,0,5,2,0,7,0,0,9,0,0,11,1,0,13,3,0,15,7,0,'M',17,14,0,'L',15,7,0,14,3,0,14,1,0,15,0,0,17,0,0,19,2,0,20,4,0]},
      /* &nu; */      '\u03BD': {width:18, cdata:['M',3,14,0,'L',6,14,0,5,8,0,4,3,0,3,0,0,'M',16,14,0,'L',15,11,0,14,9,0,12,6,0,9,3,0,6,1,0,3,0,0]},
      /* &omicron; */ '\u03BF': {width:17, cdata:['M',8,14,0,'L',6,13,0,4,11,0,3,8,0,3,5,0,4,2,0,5,1,0,7,0,0,9,0,0,11,1,0,13,3,0,14,6,0,14,9,0,13,12,0,12,13,0,10,14,0,8,14,0]},
      /* &pi; */      '\u03C0': {width:22, cdata:['M',9,14,0,'L',5,0,0,'M',14,14,0,'L',15,8,0,16,3,0,17,0,0,'M',2,11,0,'L',4,13,0,7,14,0,20,14,0]},
      /* &thetasym; */'\u03D1': {width:21, cdata:['M',1,10,0,'L',2,12,0,4,14,0,6,14,0,7,13,0,7,11,0,6,6,0,6,3,0,7,1,0,8,0,0,10,0,0,12,1,0,14,4,0,15,6,0,16,9,0,17,14,0,17,17,0,16,20,0,14,21,0,12,21,0,11,19,0,11,17,0,12,14,0,14,11,0,16,9,0,19,7,0]},
      /* &rho; */     '\u03C1': {width:18, cdata:['M',4,8,0,'L',4,5,0,5,2,0,6,1,0,8,0,0,10,0,0,12,1,0,14,3,0,15,6,0,15,9,0,14,12,0,13,13,0,11,14,0,9,14,0,7,13,0,5,11,0,4,8,0,0,-7,0]},
      /* &sigma; */   '\u03C3': {width:20, cdata:['M',18,14,0,'L',8,14,0,6,13,0,4,11,0,3,8,0,3,5,0,4,2,0,5,1,0,7,0,0,9,0,0,11,1,0,13,3,0,14,6,0,14,9,0,13,12,0,12,13,0,10,14,0]},
      /* &tau; */     '\u03C4': {width:20, cdata:['M',11,14,0,'L',8,0,0,'M',2,11,0,'L',4,13,0,7,14,0,18,14,0]},
      /* &upsilon; */ '\u03C5': {width:20, cdata:['M',1,10,0,'L',2,12,0,4,14,0,6,14,0,7,13,0,7,11,0,5,5,0,5,2,0,7,0,0,9,0,0,12,1,0,14,3,0,16,7,0,17,11,0,17,14,0]},
      /* &divide; */  '\u00F7': {width:26, cdata:['M',13,18,0,'L',12,17,0,13,16,0,14,17,0,13,18,0,'M',4,9,0,'L',22,9,0,'M',13,2,0,'L',12,1,0,13,0,0,14,1,0,13,2,0]},
      /* &omega; */   '\u03C9': {width:23, cdata:['M',8,14,0,'L',6,13,0,4,10,0,3,7,0,3,4,0,4,1,0,5,0,0,7,0,0,9,1,0,11,4,0,'M',12,8,0,'L',11,4,0,12,1,0,13,0,0,15,0,0,17,1,0,19,4,0,20,7,0,20,10,0,19,13,0,18,14,0]},
      /* &xi; */      '\u03BE': {width:16, cdata:['M',10,21,0,'L',8,20,0,7,19,0,7,18,0,8,17,0,11,16,0,14,16,0,'M',11,16,0,'L',8,15,0,6,14,0,5,12,0,5,10,0,7,8,0,10,7,0,12,7,0,'M',10,7,0,'L',6,6,0,4,5,0,3,3,0,3,1,0,5,-1,0,9,-3,0,10,-4,0,10,-6,0,8,-7,0,6,-7,0]},
      /* &psi; */     '\u03C8': {width:23, cdata:['M',16,21,0,'L',8,-7,0,'M',1,10,0,'L',2,12,0,4,14,0,6,14,0,7,13,0,7,11,0,6,6,0,6,3,0,7,1,0,9,0,0,11,0,0,14,1,0,16,3,0,18,6,0,20,11,0,21,14,0]},
      /* &zeta; */    '\u03B6': {width:15, cdata:['M',10,21,0,'L',8,20,0,7,19,0,7,18,0,8,17,0,11,16,0,14,16,0,'M',14,16,0,'L',10,14,0,7,12,0,4,9,0,3,6,0,3,4,0,4,2,0,6,0,0,9,-2,0,10,-4,0,10,-6,0,9,-7,0,7,-7,0,6,-5,0]},
      /* &theta; */   '\u03B8': {width:21, cdata:['M',12,21,0,'L',9,20,0,7,18,0,5,15,0,4,13,0,3,9,0,3,5,0,4,2,0,5,1,0,7,0,0,9,0,0,12,1,0,14,3,0,16,6,0,17,8,0,18,12,0,18,16,0,17,19,0,16,20,0,14,21,0,12,21,0,'M',4,11,0,'L',18,11,0]}
    },

    strWidth: function(fontSize=12, str=[])
    {
      let total = 0,
          c;

      for (let i=0; i<str.length; i++)
      {
        c = hersheyFont.letters[str.charAt(i)];
        if (c)
        {
          total += c.width * fontSize / 25.0;
        }
      }

      return total;
    },

    stringToCgo3D: function(str=[])
    {
      /* Note: char cell is 33 pixels high, char size is 22 pixels (0 to 21), descenders go to -7 to 21.
        passing 'size' to a draw text function scales char height by size/33.
        Reference height for vertically alignment is charHeight = 29 of the fontSize in pixels. */
      let wid = 0,
          hgt = 29,
          cgoData = [];

      function shiftChar(cAry, d)    // cAry = Hershey Cgo3D array, d = shift required
      {
        const newAry = [];
        let x, y, z,
            j = 0;
        while (j<cAry.length)
        {
          if (typeof cAry[j] === "string")
          {
            newAry.push(cAry[j++]);      // push the command letter
          }
          x = cAry[j++] + d;   // j now index of x coord in x,y,z triplet
          y = cAry[j++];
          z = cAry[j++];
          newAry.push(x, y, z);
        }
        return newAry;
      }

      for (let i=0; i<str.length; i++)
      {
        const c = this.letters[str.charAt(i)];
        if (c)
        {
          let charData = shiftChar(c.cdata, wid);
          wid += c.width;               // add character width to total
          cgoData = cgoData.concat(charData);   // make a single array of drawCmds3D for the whole string
        }
      }

      return {"cgoData": cgoData, "width": wid, "height": hgt};
    }
  };

  Cango3D = class {
    constructor(canvasId)
    {
      this.cId = canvasId;
      this.cnvs = document.getElementById(canvasId);
      if (this.cnvs === null)
      {
        alert("can't find canvas "+canvasId);
        return;
      }
      this.rawWidth = this.cnvs.offsetWidth;
      this.rawHeight = this.cnvs.offsetHeight;
      this.aRatio = this.rawWidth/this.rawHeight;
      if (!this.cnvs.hasOwnProperty('dragObjects'))  // only 1st Cango instance makes the array
      {
        // create an array to hold all the draggable objects for this canvas
        this.cnvs.dragObjects = [];
      }
      if (!this.cnvs.hasOwnProperty('resized'))
      {
        // make canvas native aspect ratio equal style box aspect ratio.
        // Note: rawWidth and rawHeight are floats, assignment to ints will truncate
        this.cnvs.setAttribute('width', this.rawWidth);    // reset canvas pixels width
        this.cnvs.setAttribute('height', this.rawHeight);  // don't use style for this
        this.cnvs.resized = true;
      }
      this.ctx = this.cnvs.getContext('2d');    // draw direct to screen canvas
      this.vpW = this.rawWidth;         // vp width in pixels (no more viewport so use full canvas)
      this.vpH = this.rawHeight;        // vp height in pixels, canvas height = width/aspect ratio
      this.vpLLx = 0;                   // vp lower left of viewport (not used) from canvas left, in pixels
      this.vpLLy = this.rawHeight;      // vp lower left of viewport from canvas top
      this.xscl = 1;                    // world x axis scale factor, default: pixels
      this.yscl = -1;                   // world y axis scale factor, +ve up (always -xscl since isotropic)
      this.xoffset = 0;                 // world x origin offset from viewport left in pixels
      this.yoffset = 0;                 // world y origin offset from viewport bottom in pixels
      this.savWC = {"xscl":this.xscl,
                    "yscl":this.yscl,
                    "xoffset":this.xoffset,
                    "yoffset":this.yoffset};  // save world coords for zoom and turn
      this.ctx.textAlign = "left";      // all offsets are handled by lorg facility
      this.ctx.textBaseline = "top";
      this.penCol = new RGBAColor("black");
      this.penWid = 1;            // pixels
      this.lineCap = "butt";
      this.lineJoin = "round";
      this.paintCol = new RGBAColor("steelblue");
      this.backCol = new RGBAColor("gray");
      this.fontSize = 10;         // 10pt
      this.fontWeight = 400;      // 100 .. 900 (400 normal, 700 bold)
      this.fov = 45;              // 45 deg looks better. 60 is absolute max for good perspective effect
      this.viewpointDistance = this.rawWidth/(this.xscl*Math.tan(this.fov*Math.PI/360)); // world coords
      this.lightSource = {x:-250, y:250, z:500};     // world coords
      this.plotNormals = false;   // diagnostic, if true green (toward) or red (away) normals are drawn

      const savThis = this;
      function dragHandler(evt)
      {
        const event = evt || window.event;

        function getCursorPos(e)
        {
          // pass in any mouse event, returns the position of the cursor in raw pixel coords
          const rect = savThis.cnvs.getBoundingClientRect();

          return {x: e.clientX - rect.left, y: e.clientY - rect.top};
        }

        function hitTest(pathObj, csrX, csrY)
        {
          // create the path (don't stroke it - no-one will see) to test for hit
          savThis.ctx.beginPath();
          if (pathObj.type === 'TEXT')   // use bounding box not drawCmds
          {
            for (let i=0; i<pathObj.bBoxCmds.length; i++)
            {
              savThis.ctx[pathObj.bBoxCmds[i].drawFn].apply(savThis.ctx, pathObj.bBoxCmds[i].parmsPx);
            }
          }
          else
          {
            for (let i=0; i<pathObj.drawCmds.length; i++)
            {
              savThis.ctx[pathObj.drawCmds[i].drawFn].apply(savThis.ctx, pathObj.drawCmds[i].parmsPx);
            }
          }
  /*
      // for diagnostics on hit region, uncomment
      savThis.ctx.strokeStyle = 'red';
      savThis.ctx.lineWidth = 4;
      savThis.ctx.stroke();
  */
          return savThis.ctx.isPointInPath(csrX, csrY);
        }

        const csrPos = getCursorPos(event);  // savThis is any Cango ctx on the canvas
        // run through all the registered objects and test if cursor pos is inside their path
        for (let j = savThis.cnvs.dragObjects.length-1; j >= 0; j--)  // search from last down to first
        {
          let testObj = savThis.cnvs.dragObjects[j];
          if (hitTest(testObj, csrPos.x, csrPos.y))
          {
            // call the grab handler for this object (check it is still enabled)
            if (testObj.dragNdrop)
            {
              testObj.dragNdrop.grab(event);
              break;
            }
          }
        }
      }

      if (!this.cnvs.hasOwnProperty('unique'))
      {
        this.cnvs.unique = 0;
      }    
      if ((typeof Timeline !== "undefined") && !this.cnvs.hasOwnProperty('timeline'))
      {
        // create a single timeline for all animations on all layers
        this.cnvs.timeline = new Timeline();
      }

      this.cnvs.onmousedown = dragHandler;
    }

    toPixelCoords(x, y)
    {
      // transform x,y,z in world coords to canvas pixel coords (top left is 0,0,0 y axis +ve down)
      const xPx = this.vpLLx+this.xoffset+x*this.xscl,
            yPx = this.vpLLy+this.yoffset+y*this.yscl;

      return {x: xPx, y: yPx, z:0};
    }

    toWorldCoords(xPx, yPx)
    {
      // transform xPx,yPx,zPx in raw canvas pixels to world coords (lower left is 0,0 +ve up)
      const xW = (xPx - this.vpLLx - this.xoffset)/this.xscl,
            yW = (yPx - this.vpLLy - this.yoffset)/this.yscl;

      return {x: xW, y: yW, z:0};
    }

    getCursorPos(evt)
    {
      // pass in any mouse event, returns the position of the cursor in raw pixel coords
      const e = evt||window.event,
            rect = this.cnvs.getBoundingClientRect();

      return {x: e.clientX - rect.left, y: e.clientY - rect.top, z:0};
    }

    getCursorPosWC(evt)
    {
      // pass in any mouse event, returns the position of the cursor in raw pixel coords
      const e = evt||window.event,
            rect = this.cnvs.getBoundingClientRect(),
            xW = (e.clientX - rect.left - this.vpLLx - this.xoffset)/this.xscl,
            yW = (e.clientY - rect.top - this.vpLLy - this.yoffset)/this.yscl;

      return {x: xW, y: yW, z: 0};
    }

    clearCanvas(fillColor)
    {
      if (fillColor !== undefined)
      {
        this.ctx.save();            // going to change fillStyle, save current
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(0, 0, this.rawWidth, this.rawHeight);
        this.ctx.restore();
      }
      else
      {
        this.ctx.clearRect(0, 0, this.rawWidth, this.rawHeight);
      }
      // all drawing erased, but graphics contexts remain intact
      // clear the dragObjects array, draggables put back when rendered
      this.cnvs.dragObjects.length = 0;
    }

    setWorldCoords3D(leftX=0, lowerY=0, spanX=100)
    {
      if (spanX >0)
      {
        this.xscl = this.vpW/spanX;
        this.yscl = -this.xscl;
        this.xoffset = -leftX*this.xscl;
        this.yoffset = -lowerY*this.yscl;
      }
      else
      {
        this.xscl = this.rawWidth/100;    // makes xaxis = 100 native units
        this.yscl = -this.rawWidth/100;   // makes yaxis = 100*aspect ratio ie. square pixels
        this.xoffset = 0;
        this.yoffset = 0;
      }
      this.setFOV(this.fov);              // reset the viewpoint distance in world coords
      // save values to support resetting zoom and turn
      this.savWC = {"xscl":this.xscl, "yscl":this.yscl, "xoffset":this.xoffset, "yoffset":this.yoffset};
    }

    setPropertyDefault(propertyName, value)
    {
      let newCol;

      if ((typeof propertyName !== "string")||(value === undefined)||(value === null))
      {
        return;
      }
      switch (propertyName.toLowerCase())
      {
        case "backgroundcolor":
          newCol = new RGBAColor(value);
          if (newCol.ok)
          {
            this.cnvs.style.backgroundColor = newCol.toRGBA();
          }
          break;
        case "fillcolor":
          newCol = new RGBAColor(value);
          if (newCol.ok)
          {
            this.paintCol = newCol;
          }
          break;
        case "backcolor":
          newCol = new RGBAColor(value);
          if (newCol.ok)
          {
            this.backCol = newCol;
          }
          break;
        case "strokecolor":
          newCol = new RGBAColor(value);
          if (newCol.ok)
          {
            this.penCol = newCol;
          }
          break;
        case "strokewidth":
        case "linewidth":
          this.penWid = value;
          break;
        case "linecap":
          if (typeof value !== "string")
          {
            return;
          }
          if ((value === "butt")||(value === "round")||(value === "square"))
          {
            this.lineCap = value;
          }
          break;
        case "linejoin":
          if (typeof value !== "string")
          {
            return;
          }
          if ((value === "bevel")||(value === "round")||(value === "miter"))
          {
            this.lineJoin = value;
          }
          break;
        case "fontsize":
          if ((typeof(value) == "number") && (value >= 6)&&(value <= 60))
          {
            this.fontSize = value;
          }
          break;
        case "fontweight":
          if ((typeof(value) == "number") && (value >= 100)&&(value <= 900))
          {
            this.fontWeight = value;
          }
          break;
        default:
          return;
      }
    }

    setFOV(deg)  // viewpoint distance in world coords
    {
      const savThis = this;

      function fovToVPdist(fov)
      {
        const w = savThis.rawWidth;
        let ll = savThis.xoffset;

        if (ll<0)
        {
          ll = 0;
        }
        if  (ll>w)
        {
          ll = w;
        }

        let x = Math.abs(w/2 - ll) + w/2;
        x /= savThis.xscl;

        const fon2 = Math.PI*fov/(360);

        return x/Math.tan(fon2);
      }

      // set field of view <60deg for good perspective
      if ((deg <= 60)&&(deg>0))
      {
        this.fov = deg;
        this.viewpointDistance = fovToVPdist(this.fov);
      }
      if (deg == 0)
      {
        this.viewpointDistance = Math.pow(10, 100);
      }
    }

    setLightSource(x, y, z)    // x, y, z in world coords
    {
      if ((x !== undefined)&&(y !== undefined)&&(z !== undefined))
      {
        this.lightSource.x = x;
        this.lightSource.y = y;
        this.lightSource.z = z;
      }
    } 
    
    calcSphereShading(sphGrp)
    {
      function cartToSph(pos)
      {
        const r = Math.sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z),
              azim = 180*Math.atan2(pos.y, pos.x)/Math.PI,
              elev = 180*Math.acos(pos.z/r)/Math.PI;
      
        return {r, elev, azim};
      }

      const relSunPos = new Point(this.lightSource.x-sphGrp.centroid.tx, 
                                  this.lightSource.y-sphGrp.centroid.ty, 
                                  this.lightSource.z-sphGrp.centroid.tz)
      const sunPos = cartToSph(relSunPos);
      const sunElevDeg = sunPos.elev;
      const sunAzimDeg = sunPos.azim;
      if (sunPos.r < sphGrp.diameter)
      {
        sphGrp.disc.setProperty("fillColor", sphGrp.lightColor);
        sphGrp.shader.setProperty("fillColor", sphGrp.darkColor);  // fully transparent ie. no shade
        return null;
      }
      const calcSpecularOffset = (sAngDeg)=> Math.cos(Math.PI*(90 + sAngDeg)/360),
            ellipseHalfMinorAxis = (sAngDeg)=> -Math.sin(Math.PI*sAngDeg/180), // return ellipse half minor axis as fraction of radius
            specOffset = calcSpecularOffset(90+sunElevDeg),  // returns fraction of radius
            shadowOffset = ellipseHalfMinorAxis(-sunElevDeg-90),
            rad = sphGrp.diameter/2,    
            hw = shadowOffset*rad,
            sx = Math.abs(specOffset)*rad,
            azimUV = {x:Math.cos(Math.PI*sunAzimDeg/180), y:Math.sin(Math.PI*sunAzimDeg/180)}, // unit vector
            elevUV = {x:Math.cos(Math.PI*sunElevDeg/180), y:Math.sin(Math.PI*sunElevDeg/180)}; // unit vector

      // build the shadow shape 
      const shadeData = sphGrp.shadeOutline(-hw, rad, sunAzimDeg); 
      sphGrp.shader.drawCmds = new Cgo3Dsegs(svgToCgo3D(shadeData));

      if (sunElevDeg < 175)
      {
        sphGrp.disc.fillColor = sphGrp.lightColor;
        const dsb = 0.1*elevUV.y;   // gets fatter when side-on
        const dsx = dsb*azimUV.x;
        const dsy = dsb*azimUV.y;
        sphGrp.shader.shadowOffsetX = dsx;   // private properties
        sphGrp.shader.shadowOffsetY = -dsy;
        sphGrp.shader.shadowBlur = dsb;   
      }
      else
      {
        sphGrp.disc.fillColor = sphGrp.darkColor;
      }
      // calc the position of the specular reflection point
      const specPos = {x:sx*azimUV.x, y:sx*azimUV.y};
      sphGrp.lightColor.cx = specPos.x/rad;
      sphGrp.lightColor.cy = -specPos.y/rad;
    }

    /*=============================================
    * render will clear the canvas and draw
    * this Group3D or Obj3D, make sure it is only
    * called on the root object of the scene.
    * If an Obj3D is passed, update the netTfm
    * and render it.
    * If a Group3D is passed, recursively update
    * the netTfm of the group's family tree, put
    * all the tree's objects into one array,
    * sort according to z, then render all Obj3Ds.
    *--------------------------------------------*/
    render(rootObj)  // Obj3D or Group3D, 'wireframe', 'noclear' strings accepted
    {
      const savThis = this,
            drawableObjs = [];
      let clear = true,
          wireframe = false;

      function configTextObj(txtObj)
      {
        const wid = txtObj.width,
              hgt = txtObj.height,
              wid2 = wid/2,
              hgt2 = hgt/2,
              lorgWC = [0, [0, hgt],  [wid2, hgt],  [wid, hgt],
                           [0, hgt2], [wid2, hgt2], [wid, hgt2],
                           [0, 0],    [wid2, 0],    [wid, 0]];
        let dx = 0, 
            dy = 0;        // default is lorg = 7
        // calc lorg offset
        if (lorgWC[txtObj.lorg] !== undefined)  // check for out of bounds
        {
          dx = -lorgWC[txtObj.lorg][0];
          dy = -lorgWC[txtObj.lorg][1];
        }
        dy += 0.25*hgt;   // correct for alphabetic baseline, its offset about 0.25*char height
        const transMat = translateMatrix(dx, dy, 0);
        // scale by fontSize
        let size = txtObj.fontSize || savThis.fontSize;     // Cango3D instance current default
        // support for zoom and pan
        if (!txtObj.orgXscl)
        {
          // first time drawn save the scale
          txtObj.orgXscl = savThis.xscl;
        }
        const fntScl = savThis.xscl/txtObj.orgXscl;   // scale for any zoom factor
        txtObj.fontSizeZC = size*fntScl;
          
        txtObj.fontSizeZC /= savThis.xscl;     // size is in pixels, dividing by xscl compensates for world coord scaling
        const mag = txtObj.fontSizeZC/33;      // size/3 is scale factor to match Hershey font size to canvas font size
        const sclMat = scaleMatrix(mag);
        // now generate the transform matrix to implement the scale and lorg translate
        const lorgTfm = new DOMMatrix();
        lorgTfm.multiplySelf(sclMat);
        lorgTfm.multiplySelf(transMat);     

        return lorgTfm;
      }
      
      function transformDrawCmds(obj)
      {
        // apply the netTfm matrix to all the drawCmds coordinates
        obj.drawCmds.forEach(cmd => {
          for (let k=0; k < cmd.cPts.length; k++)   // transform each Point
          {
            cmd.cPts[k].softTransform(obj.netTfm);
          }
          // add the end point (check it exists since 'closePath' has no end point)
          if (cmd.ep !== undefined)
          {
            cmd.ep.softTransform(obj.netTfm);
          }
        });
        if (obj.type === "TEXT")
        {
          // now transform the text bounding box (just moveTo and lineTo, no cPts)
          for(let j=0; j < obj.bBoxCmds.length; j++)   // step through the draw segments
          {
            // check for ep since 'closePath' has no end point)
            if (obj.bBoxCmds[j].ep !== undefined)
            {
              obj.bBoxCmds[j].ep.softTransform(obj.netTfm);
            }
          }
        }
      }
      
      function applyXfms(obj)
      {
        const grpTfmAry = (obj.parent)? obj.parent.netTfmAry: [];
        const softTfmAry = grpTfmAry.concat(obj.ofsTfmAry.reverse());

        obj.netTfmAry = (obj.hardTfmAry)? softTfmAry.concat(obj.hardTfmAry): softTfmAry;   // Group3D dont have hardTfmAry
        // ofsTfms are dynamic so reset the ofsTfmAry array
        obj.ofsTfmAry.length = 0;

        if (obj instanceof Sphere3D)  // handle the extra tranforms needed for Sphere3D shading
        {
          if (obj.netTfmAry.length)
          {
            const newTfmAry = [];
            // set through the transforms and reduce them to a single translate
            obj.netTfmAry.reverse().forEach((tfm)=>{
              if (tfm.type == "TRN")
              {
                if (newTfmAry.length)  // already have a TRN at the start, just add the offsets
                {
                  const x = newTfmAry[0].args[0] + tfm.args[0],   
                        y = newTfmAry[0].args[1] + tfm.args[1],
                        z = newTfmAry[0].args[2] + tfm.args[2];
                  newTfmAry[0] = new TfmDescriptor("TRN", x, y, z);
                }
                else
                {
                  // else its the initial TRN
                  newTfmAry[0] = tfm;
                }
              }
              else if (tfm.type == "ROT")
              {
                if (newTfmAry.length) // we have a TRN so revolve the sphere
                { 
                  const x = newTfmAry[0].args[0],    // [ [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [x, y, z, 1] ];
                        y = newTfmAry[0].args[1],
                        z = newTfmAry[0].args[2];
                  const vToMsegs = new Cgo3Dsegs(["M",0,0,0, "L",x,y,z]); // fabricate a vector to rotate
                  const newVtoM = vToMsegs.rotate(...tfm.args);  // rotate to see where vector ends up
                  newTfmAry[0] = new TfmDescriptor("TRN", newVtoM[1].ep.x, newVtoM[1].ep.y, newVtoM[1].ep.z); 
                }
                // else its the first transform so no offset rotate is meaningless
              }
              else if (tfm.type == "SCL")
              {
                obj.scaling *= tfm.args[0];
              }
            });
            // there should only be 1 or 0 transforms in the netTfmAry now
            if (newTfmAry.length)
            {
              obj.netTfmAry = newTfmAry;
              // centroid position is needed for shade calc
              obj.centroid.tx = obj.netTfmAry[0].mat.m41;    // [3][0];
              obj.centroid.ty = obj.netTfmAry[0].mat.m42;    // [3][1];
              obj.centroid.tz = obj.netTfmAry[0].mat.m43;    // [3][2];
              savThis.calcSphereShading(obj);    
              obj.children.forEach(childNode => {
                if (obj.scaling != 1) 
                {
                  const sclTfm = new TfmDescriptor("SCL", obj.scaling);
                  childNode.ofsTfmAry.push(sclTfm);
                }
                childNode.ofsTfmAry.push(newTfmAry[0]);
              });
              // transforms inherited so delete from Group3D
              obj.netTfmAry.length = 0;            
            }
          }
          else
          {
            // no translate so centroid has moved 
            savThis.calcSphereShading(obj);  
          }
        }

        obj.netTfm = new DOMMatrix();
        obj.netTfmAry.forEach(xfmr => {
          obj.netTfm.multiplySelf(xfmr.mat);    // netTfmAry is array of {type: , args: , mat: } objects    
        });
        // calc the transformed dwgOrg coords, dwgOrg only moved by softTfm and group softTfms
        obj.dwgOrg = new Point();
        obj.dwgOrg.softTransform(obj.netTfm);
        // apply the netTfm to the centroid for painter's sort (not Sphere3D, theyre special)
        if (!(obj instanceof Sphere3D))
        {
          obj.centroid.softTransform(obj.netTfm);
        }
        if (obj.type !== "GROUP")
        {
          obj.normal.softTransform(obj.netTfm);   // Group3D doesn't have a normal 
          if (obj.type === "TEXT")
          {
            // Calc the scale and lorg translate matrix to apply to Text3D
            // must be applied before other transforms
            // don't apply to centroid or the taggedPanel3D and tagChildPanel may get z coord
            // transformed by inherited hardTfms and so not match Panel z.
            const lorgTfm = configTextObj(obj); 
            obj.netTfm.multiplySelf(lorgTfm);
          }
          transformDrawCmds(obj);
        }
      }

      function iterativeApplyXfms(obj)
      {
        applyXfms(obj);
        if (obj.type === "GROUP")
        {
          obj.children.forEach(childNode => iterativeApplyXfms(childNode));
        }
      }

      function obj3Dto2D(obj)
      {
        function project3D(point)
        {
          // projection is onto screen at z = 0,
          const s = (savThis.viewpointDistance - point.tz > 0.000001)? savThis.viewpointDistance/(savThis.viewpointDistance-point.tz): savThis.viewpointDistance/0.000001;
          // perspective projection
          point.fx = point.tx * s;
          point.fy = point.ty * s;
        }

        // make the 2D parameters for each DrawCmd3D in drawCmds array
        for(let j=0; j<obj.drawCmds.length; j++)   // step through the path segments
        {
          for (var k=0; k<obj.drawCmds[j].cPts.length; k++)   // extract flattened 2D coords from 3D Points
          {
            project3D(obj.drawCmds[j].cPts[k]);             // apply perspective to nodes
            obj.drawCmds[j].parms[2*k] = obj.drawCmds[j].cPts[k].fx;
            obj.drawCmds[j].parms[2*k+1] = obj.drawCmds[j].cPts[k].fy;
          }
          // add the end point (check it exists since 'closePath' has no end point)
          if (obj.drawCmds[j].ep !== undefined)
          {
            project3D(obj.drawCmds[j].ep);                    // apply perspective to end point
            obj.drawCmds[j].parms[2*k] = obj.drawCmds[j].ep.fx;
            obj.drawCmds[j].parms[2*k+1] = obj.drawCmds[j].ep.fy;
          }
        }
        // now the text bounding box
        if (obj.type === "TEXT")
        {
          // now project the text bounding box path
          for(let j=0; j<4; j++)   // step through the draw segments (ignore final 'closePath')
          {
            project3D(obj.bBoxCmds[j].ep);                  // apply perspective to end point
            obj.bBoxCmds[j].parms[0] = obj.bBoxCmds[j].ep.fx;
            obj.bBoxCmds[j].parms[1] = obj.bBoxCmds[j].ep.fy;
          }
        }
        project3D(obj.centroid);  // project in case they are going to be drawn for debugging
        project3D(obj.normal);
        // the object's drawCmds parms arrays now hold world coord 2D projection ready to be drawn
      }

      function sortDrawableObjs(grp)
      {
        function paintersSort(p1, p2){return p1.centroid.tz - p2.centroid.tz;}

        // Depth sorting (painters algorithm, draw from the back to front)
        grp.children.sort(paintersSort);
        // step through the children looking for groups (to sort)
        grp.children.forEach(childNode => {
          if (childNode.type === "GROUP") // skip Obj3D
          {
            if (childNode instanceof Sphere3D)
            {
              drawableObjs.push(...childNode.children)
            }
            else
              sortDrawableObjs(childNode);  // check if next group has drawables
          }
          else   // child Obj3D ready to paint
          {
            drawableObjs.push(childNode);
          }
        });
      }

      function iterativeReset(obj)
      {
        obj.transformReset();
        if (obj.type === "GROUP")    // find Obj3Ds to draw
        {
          obj.children.forEach(childNode => iterativeReset(childNode));
          // any Sphere3D dynamic scaling has been done so scale factor should be reset 
          if (obj instanceof Sphere3D)
            obj.scaling = 1;
        }
      }
  // ============ Start Here =====================================================

      // check arguments for 'wireframe' or 'noclear'
      const args = Array.prototype.slice.call(arguments); // grab array of arguments
      for(let i=0; i<arguments.length; i++)
      {
        if ((typeof args[i] === 'string')&&(args[i].toLowerCase() === 'wireframe'))
        {
          wireframe = true;
        }
        if ((typeof args[i] === 'string')&&(args[i].toLowerCase() === 'noclear'))
        {
          clear = false;
        }
      }
      if (clear)
      {
        this.clearCanvas();
      }

      iterativeApplyXfms(rootObj);  // recursively apply the object's accumulated transforms

      if (rootObj.type === "GROUP")
      {
        // depth sort and paint to the canvas
        sortDrawableObjs(rootObj);  // recursive depth sort group tree into drawableObjs array of Obj3D
      }
      else  // just one Obj3D, no sorting needed
      {
        drawableObjs[0] = rootObj;
      }
      // now draw them
      drawableObjs.forEach(drwObj => {
        obj3Dto2D(drwObj);
        // now render them onto the canvas checking for back is facing and backHidden
        if (wireframe)
        {
          this.paintObj3D(drwObj, true);
        }
        else
        {
          if (this.frontFacing(drwObj) || !drwObj.backHidden)
          {
            this.paintObj3D(drwObj, false);
          }
        }
      });
      // all rendering done so recursively reset the dynamic ofsTfmAry
      iterativeReset(rootObj);
    }

    /*========================================================
    * paintObj3D takes an Obj3D which has been transformed
    * and projected to 2D all the canvas commands are
    * formatted but in world coordinates.
    * Convert to canvas pixels and draw them onto the canvas
    *-------------------------------------------------------*/
    paintObj3D(pg, wireframe)
    {
      const savThis = this,
            fntSize = pg.fontSize || this.fontSize,
            fntWgt = pg.fontWeight || this.fontWeight;
      let stkCol, filCol;

      function genRadGradient(rgrad, p, pz)
      {
        // this is for drawing spheres only
        const s = savThis.xscl;
        const proj = (savThis.viewpointDistance - pz > 0.000001)? savThis.viewpointDistance/(savThis.viewpointDistance-pz): savThis.viewpointDistance/0.000001;

        const rad = s*proj*pg.parent.scaling*pg.parent.diameter/2;
        const grad = savThis.ctx.createRadialGradient(p[0]+rad*rgrad.cx, p[1]+rad*rgrad.cy, rad*rgrad.spotRad, 
                                                      p[0], p[1], rad*rgrad.radius);
        rgrad.colorStops.forEach((colStop)=>{grad.addColorStop(colStop[0], colStop[1]);});

        return grad;
      }
      
      function dropShadow(obj, pz)  // no argument will reset to no drop shadows 
      {
        const s = savThis.xscl;
        const proj = (savThis.viewpointDistance - pz > 0.000001)? savThis.viewpointDistance/(savThis.viewpointDistance-pz): savThis.viewpointDistance/0.000001;
        const rad = s*proj*pg.parent.scaling*pg.parent.diameter/2;
    
        savThis.ctx.shadowOffsetX = s*rad*obj.shadowOffsetX;
        savThis.ctx.shadowOffsetY = s*rad*obj.shadowOffsetY;
        savThis.ctx.shadowBlur = s*rad*obj.shadowBlur;
        savThis.ctx.shadowColor = obj.shadowColor;
      }

      this.ctx.save();   // save the current ctx we are going to change bits
      this.ctx.beginPath();
      // step through the Obj3D drawCmds array and draw each one
      for (let j=0; j < pg.drawCmds.length; j++)
      {
        // convert all parms to pixel coords
        for (let k=0; k<pg.drawCmds[j].parms.length; k+=2)   // step thru the coords in x,y pairs
        {
          pg.drawCmds[j].parmsPx[k] = this.vpLLx+this.xoffset+pg.drawCmds[j].parms[k]*this.xscl;
          pg.drawCmds[j].parmsPx[k+1] = this.vpLLy+this.yoffset+pg.drawCmds[j].parms[k+1]*this.yscl;
        }
        // now actually draw the path onto the canvas
        this.ctx[pg.drawCmds[j].drawFn].apply(this.ctx, pg.drawCmds[j].parmsPx);
      }
      if (pg.type === "TEXT")
      {
        // construct the bounding box pixel coords for drag and drop
        for (let j=0; j < pg.bBoxCmds.length; j++)
        {
          // all parms already in pixel coords
          for (let k=0; k<pg.bBoxCmds[j].parms.length; k+=2)   // step thru the coords in x,y pairs
          {
            pg.bBoxCmds[j].parmsPx[k] = this.vpLLx+this.xoffset+pg.bBoxCmds[j].parms[k]*this.xscl;
            pg.bBoxCmds[j].parmsPx[k+1] = this.vpLLy+this.yoffset+pg.bBoxCmds[j].parms[k+1]*this.yscl;
          }
  //  this.ctx[pg.bBoxCmds[j].drawFn].apply(this.ctx, pg.bBoxCmds[j].parmsPx);  // Draw Bounding box
        }
      }
      // fill and stroke the path
      if (pg.type === "SHAPE" || pg.type === "PANEL")
      {
        this.ctx.closePath();
        if (!wireframe)
        {
          if (pg.shadowBlur)
          {
            dropShadow(pg, pg.drawCmds[0].ep.tz);
          }
          if (pg.fillColor instanceof RadialGradient)
          {
            this.ctx.fillStyle = genRadGradient(pg.fillColor, pg.drawCmds[0].parmsPx, pg.drawCmds[0].ep.tz);
          }
          else 
          {
            this.ctx.fillStyle = this.calcShapeShade(pg);
          }
          if (this.frontFacing(pg))
            filCol = pg.fillColor || this.paintCol;
          else
            filCol = pg.backColor || this.backCol;
          this.ctx.fill();
          if (filCol.a > 0.9)    // only stroke if solid color (don't stroke see-through panels)
          {
            this.ctx.strokeStyle = this.ctx.fillStyle;
            this.ctx.lineJoin = "round";   // force this for shape3D to remove spike corners
            this.ctx.stroke();    // stroke outline with the fillColor
          }
          if (pg.border)
          {
            stkCol = pg.strokeColor || this.penCol;
            this.ctx.strokeStyle = stkCol.toRGBA();
            this.ctx.lineCap = pg.lineCap || this.lineCap;
            this.ctx.lineJoin = pg.lineJoin || this.lineJoin;
            this.ctx.lineWidth = pg.lineWidth || this.penWid; // lineWidth in pixels
            this.ctx.stroke();    // stroke outline
          }
        }
        else  // wireframe - just stroke outline
        {
          stkCol = pg.strokeColor || this.penCol;
          this.ctx.strokeStyle = stkCol.toRGBA();
          this.ctx.lineCap = pg.lineCap || this.lineCap;
          this.ctx.lineJoin = pg.lineJoin || this.lineJoin;
          this.ctx.lineWidth = pg.lineWidth || this.penWid;
          this.ctx.stroke();    // stroke outline
        }
      }
      else  // PATH or TEXT
      {
        stkCol = pg.strokeColor || this.penCol;
        if (stkCol instanceof RadialGradient)
        {
          this.ctx.strokeStyle = genRadGradient(stkCol, pg.drawCmds[0].parmsPx, pg.drawCmds[0].ep.tz);  // also sets lineWidth
        }
        else
        {
          this.ctx.strokeStyle = stkCol.toRGBA();
          // support for zoom and pan changing line width
          if (pg.lineWidthWC)
          {
            this.ctx.lineWidth = pg.lineWidthWC*this.xscl;   // lineWidth in world coords so scale to px
          }
          else
          {
            this.ctx.lineWidth = pg.lineWidth || this.penWid; // lineWidth in pixels
          }
        }
        if (pg.type === "TEXT")
        {
          // for TEXT, lineWidth just stores all softTransform scaling, so set lineWidth by fontWeight
          this.ctx.lineWidth *= 0.08*fntSize*fntWgt/400; // normal weight stroke width is saved
        }
        this.ctx.lineCap = pg.lineCap || this.lineCap;
        this.ctx.lineJoin = pg.lineJoin || this.lineJoin;
        this.ctx.stroke();    // stroke outline
      }

      if (this.plotNormals)      // draw the normal
      {     // convert the centroid and normal too
        const ox = this.vpLLx+this.xoffset+pg.centroid.fx*this.xscl,
              oy = this.vpLLy+this.yoffset+pg.centroid.fy*this.yscl,
              nx = this.vpLLx+this.xoffset+pg.normal.fx*this.xscl,
              ny = this.vpLLy+this.yoffset+pg.normal.fy*this.yscl;

        if (pg.centroid.tz < pg.normal.tz)    // +ve out of screen
        {
          this.ctx.strokeStyle = "green";   // pointing toward viewer
        }
        else
        {
          this.ctx.strokeStyle = "red";     // pointing away from viewer
        }

        this.ctx.beginPath();
        this.ctx.moveTo(ox, oy);
        this.ctx.lineTo(nx, ny);
        this.ctx.stroke();
      }
      this.ctx.restore();  // put things back the way they were

      if (pg.dragNdrop !== null)
      {
        pg.dragNdrop.cgo = this;
        // now push it into Cango.dragObjects array, its checked by canvas mousedown event handler
        if (!this.cnvs.dragObjects.includes(pg))
        {
          this.cnvs.dragObjects.push(pg);
        }
      }
    }

    frontFacing(obj)
    {
      // calc unit vector normal to the panel front
      let normX = obj.normal.tx-obj.centroid.tx,
          normY = obj.normal.ty-obj.centroid.ty,
          normZ = obj.normal.tz-obj.centroid.tz;
      const normMag = Math.sqrt(normX*normX + normY*normY + normZ*normZ);
            // calc unit vector from centroid to viewpoint
      let losX = -obj.centroid.tx,
          losY = -obj.centroid.ty,
          losZ = this.viewpointDistance - obj.centroid.tz;
      const losMag = Math.sqrt(losX*losX + losY*losY + losZ*losZ);
      normX /= normMag;
      normY /= normMag;
      normZ /= normMag;
      losX /= losMag;
      losY /= losMag;
      losZ /= losMag;
      /* Now calculate if we are looking at front or back
        if normal dot product with LOS is +ve its the front, -ve its the back */
// console.log(normX, normZ, "LOS", losX, losZ, (normX*losX + normY*losY + normZ*losZ > 0))
      return (normX*losX + normY*losY + normZ*losZ > 0);
    }

    calcShapeShade(obj)
    {
      let col;
      // calculate unit vector in direction of the sun
      let sunX = this.lightSource.x,
          sunY = this.lightSource.y,
          sunZ = this.lightSource.z,
          sunMag = Math.sqrt(sunX*sunX + sunY*sunY + sunZ*sunZ);
      sunX /= sunMag;
      sunY /= sunMag;
      sunZ /= sunMag;
      // calc unit vector normal to the panel front
      let normX = obj.normal.tx-obj.centroid.tx,
          normY = obj.normal.ty-obj.centroid.ty,
          normZ = obj.normal.tz-obj.centroid.tz,
          normMag = Math.sqrt(normX*normX + normY*normY + normZ*normZ);
      normX /= normMag;
      normY /= normMag;
      normZ /= normMag;
      // luminence is dot product of panel's normal and sun vector
      let lum = 0.6*(sunX*normX + sunY*normY + sunZ*normZ); // normalise to range 0..0.7
      lum = Math.abs(lum);   // normal can be up or down (back given same shading)
      lum += 0.4;            // shift range to 0.4..1 (so base level so its not too dark)
      if (this.frontFacing(obj))
      {
        col = obj.fillColor || this.paintCol;
        // front will be dark if normal is pointing away from lightSource
        if (normX*sunX + normY*sunY + normZ*sunZ < 0)
        {
          lum = 0.4;
        }
      }
      else
      {
        //  looking at back
        col = obj.backColor || this.backCol;
        // back will be dark if normal (front) is pointing toward the lightSource
        if (normX*sunX + normY*sunY + normZ*sunZ > 0)
        {
          lum = 0.4;
        }
      }
      if (obj.flatColor)
      {
        lum = 1;
      }

      // calc rgb color based on component of normal to polygon in direction on POV
      const cr = Math.round(lum*col.r),
            cg = Math.round(lum*col.g),
            cb = Math.round(lum*col.b),
            ca = (this.flatColor)? 1: col.a;

      return "rgba("+cr+","+cg+","+cb+","+ca+")";     // string format 'rgba(r,g,b,a)'
    }
  }  /*  Cango3D */

}());

