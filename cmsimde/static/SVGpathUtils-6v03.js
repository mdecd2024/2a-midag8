/*============================================================================
  Filename: SVGpathUtils-6v03.js
  Rev 6
  By: A.R.Collins
  Description: This file augments the core Cango object with
               methods to manipulate the path and shape outlines

  Copyright 2021 A.R.Collins
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

  Date    Description                                               |By
  ---------------------------------------------------------------------------
  14Jul19 First beta based on Cango-14v11 shapeDefs                       ARC
  18Jul19 Use SVG angle convention +ve clockwise                          ARC
  25Jul19 Use segment style {type: , values:[]}                           ARC
  27Jul19 Methods return a new svgPath, not reuse original                ARC
  28Jul19 bugfix: don't corrupt original when transforming                ARC
  30Jul19 Drop the pre-defined svgPath shapes, leave to Cango             ARC
  05Aug19 Use SVGsegs with getPathData format instead of simple array     ARC
  12Aug19 Released as SVGpathUtils-5v00.js                                ARC  
  18Jun21 Ver 6 beta with Track for animation along a path                ARC                                            ARC
  20Jun21 Don't make Track object global just use SVGsegs.toTrack         ARC
  02Jul21 Released as SVGpathUtils-6v00                                   ARC
  04Jul21 Allow Track to have discontinuous sections
          Drop nonIsoScl (function moved to CangoTextUtils)               
          Add getTotalLength and distToPos to SVGsegs methods (not Track)
          _gradientAtPoint returns dy and dx as well as the angle         ARC
  08Jul21 Rename distToPos with SVG standard 'getPointAtLength'           ARC 
 ============================================================================*/

var SVGsegs, segment;

if (!SVGPathElement.prototype.getPathData || !SVGPathElement.prototype.setPathData) 
{
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

(function() {
  "use strict";

  SVGsegs = class extends Array
  {
    constructor (d)
    {
      function toSegs(pathStr)
      {
        const svgPathElem = document.createElementNS("http://www.w3.org/2000/svg", "path");
        svgPathElem.setAttribute("d", pathStr);
        const segs = svgPathElem.getPathData({normalize: true}); // returns segments converted to lines and Bezier curves 

        return segs;
      }

      if (!d || d.length === 0)
      {
        super();
      }
      else if (typeof d === 'string')
      {
        const pathStr = d.replace(/\,/g, " ");
        const svgData = toSegs(pathStr);  
        super(...svgData);
      }
      else if (Array.isArray(d))
      {
        // check typed Array views etc, convert to real Array
        if (ArrayBuffer.isView(d))    
        {
          d = Array.from(d);  
        }
        let pathStr = "";
        if (typeof(d[0]) === "number")  // its an Array of numbers
        {
          pathStr = "M "+d.join(" ");  // insert 'M' command so its valid SVG
        }
        else
        {
          pathStr = d.join(" "); 
        }
        const svgData = toSegs(pathStr);
        super(...svgData);
      }
      else
      {
        console.warn("Type Error: SVGsegs constructor argument 1");
        super();   // return an empty array
      }
      this.track = null;
    }

    toString(sigFigs=4){
      let str = "";
      this.forEach((seg)=>{
        str = str.concat(seg.type);
        for (let i=0; i<seg.values.length; i+=2)
        {
          str = str.concat(seg.values[i].toPrecision(sigFigs) +","+ seg.values[i+1].toPrecision(sigFigs)+" ");
        }
      });
      return str.trim();
    }

    dup(){
      const newPathSegs = [];
      this.forEach((seg)=>{
        newPathSegs.push(seg.type, ...seg.values);
      });

      return new SVGsegs(newPathSegs);
    }
  }

  class BezTrack
  {
    constructor(segVals)  // SVGsegs.values array
    {
      const c = segVals;
      this.segPoints = [{x:c[0], y:c[1]}, {x:c[2], y:c[3]}, {x:c[4], y:c[5]}, {x:c[6], y:c[7]}];
      this.segLength = this._length(this.segPoints);
    }

   /*=============================================================================
    * _pointOnCubicBez calculates coords of a point on a cubic Bezier curve.
    * 'curve' is an array of 4 control points, 
    * eg [{x:10,y:20}, {x:50,y:50}, {x:100,y:100}, {x:120,y:100}]. 
    * 'location' is a decimal indicating the fractional distance along the curve. 
    * It should be a number from 0 to 1, inclusive.
    *----------------------------------------------------------------------------*/
    _pointOnCubicBez(curve, location) 
    {	
      let bezx = (t)=>curve[0].x*(1 - t)*(1 - t)*(1 - t)+curve[1].x*3*t*(1 - t)*(1 - t)+
                      curve[2].x*3*t*t*(1 - t)+curve[3].x*t*t*t;
      let bezy = (t)=>curve[0].y*(1 - t)*(1 - t)*(1 - t)+curve[1].y*3*t*(1 - t)*(1 - t)+
                      curve[2].y*3*t*t*(1 - t)+curve[3].y*t*t*t;

      return {x:bezx(location), y:bezy(location)};
    }

    _dist(p1, p2) 
    {
      return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y));
    }

    _length(curve) 
    {
      var prev = this._pointOnCubicBez(curve, 0),
          tally = 0,
          curLoc = 0,
          direction = 1,
          cur = null;

      while (curLoc < 1) 
      {
        curLoc += (0.005 * direction);
        cur = this._pointOnCubicBez(curve, curLoc);
        tally += this._dist(cur, prev);	
        prev = cur;
      }
      return tally;
    }

   /*=======================================================================
    * _gradientAtPoint
    * returns the gradient and dy,dx components of the curve at the point. 
    *----------------------------------------------------------------------*/
    _gradientAtPoint(curve, location) 
    {
      let p1,	p2;

      if (location > 0.994)
      {
        p1 = this._pointOnCubicBez(curve, location-0.005);
        p2 = this._pointOnCubicBez(curve, location);
      }
      else
      {
        p1 = this._pointOnCubicBez(curve, location);
        p2 = this._pointOnCubicBez(curve, location+0.005);
      }
      const dy = p2.y - p1.y; 
      const dx = p2.x - p1.x;
      const dLen = Math.sqrt(dx*dx + dy*dy);
  
      return {angRad: Math.atan2(dy, dx), dx: dx/dLen, dy: dy/dLen};	
    }

   /*================================================================================
    * _pointAlongPath finds the point that is 'distance' along the path from start. 
    * This method returns both the x,y location of the point and also its 'location' 
    * (fractional distance along the path).
    *-------------------------------------------------------------------------------*/
    _pointAlongPath(curve, location, distance) 
    {
      const direction = distance > 0 ? 1 : -1,
            step = (0.005 * direction);      // 200 steps (0..1)
      let prev = this._pointOnCubicBez(curve, location),
          tally = 0,
          curLoc = location,
          cur = this._pointOnCubicBez(curve, location);

      while (tally < Math.abs(distance)) 
      {
        curLoc += step;
        cur = this._pointOnCubicBez(curve, curLoc);
        tally += this._dist(cur, prev);	
        prev = cur;
      }

      return {point:cur, location:curLoc, distance:distance};
    }
  }

  class LineTrack
  {
    constructor(segVals)   // SVGsegs.values array
    {
      const c = segVals;
      this.segPoints = [{x:c[0], y:c[1]}, {x:c[2], y:c[3]}];
      this.segLength = Math.sqrt((c[2]-c[0])*(c[2]-c[0]) + (c[3]-c[1])*(c[3]-c[1]));
    }

   /*=======================================================================
    * _gradientAtPoint
    * returns the gradient and dy,dx components of the curve at point.
    *----------------------------------------------------------------------*/
    _gradientAtPoint() 
    {
      const p = this.segPoints,
            dy = p[1].y - p[0].y, 
            dx = p[1].x - p[0].x;

      const dLen = Math.sqrt(dx*dx + dy*dy);

      return {angRad:Math.atan2(dy, dx), dx: dx/dLen, dy: dy/dLen};	
    }

   /*================================================================================
    * _pointAlongPath finds the point that is 'distance' along the path from start. 
    * This method returns both the x,y location of the point and also its 'location' 
    * (fractional distance along the path).
    *-------------------------------------------------------------------------------*/
    _pointAlongPath(line, location, distance) 
    {
      const p = this.segPoints;
      const frac = (distance - location)/this.segLength;
      const cur = {x: p[0].x+frac*(p[1].x - p[0].x), y: p[0].y+frac*(p[1].y - p[0].y)};

      return {point:cur, location:frac, distance:distance};
    }
  }

  class Track 
  {
    constructor(svgSegsAry)  // type SVGsegs
    {
      this.segs = [];
      let initPos; 
      let pen;  // pen is following the current reference point
      for (let i=0; i<svgSegsAry.length; i++)
      {
        let pts;
        let seg = svgSegsAry[i];
        if (seg.type === "C")
        {
          pts = pen.concat(seg.values);  // give each segment a first 
          this.segs.push(new BezTrack(pts));
          pen = [seg.values[4], seg.values[5]];   // move pen to last bez end point
        }
        else if (seg.type === "L")
        {
          pts = pen.concat(seg.values);
          this.segs.push(new LineTrack(pts));
          pen = seg.values;
        }
        else if (seg.type === "Z")  
        {
          // check if the path was closed anyway
          if (pen[0] == initPos[0] && pen[1] == initPos[1]) 
            break;
          // make a line segment to close the path
          pts = pen.concat(initPos);
          this.segs.push(new LineTrack(pts));
          break;// should be last segment but if not, make it the last
        }
        else if (seg.type === "M")
        {
          initPos = svgSegsAry[i].values;  // restart a track section values is just [x,y]
          pen = svgSegsAry[i].values.slice(0);  // pen is following the current reference point
        } 
      }
      const add = (acc, curr)=>acc + curr.segLength;
      this.totalLength = this.segs.reduce(add, 0);

      // calculate lengths of each segment to know which segment keyTimes are in
      this.segEndDist = [];
      let endDist = 0;
      this.segs.forEach((seg)=>{
        endDist += seg.segLength;
        this.segEndDist.push(endDist);
      });
    }
   
    trkDistToPos(currDist)  // distance in world coords
    {
      // convert a distance along track into a world coord location (get grad too)
      const tLen = this.totalLength;
      let currSeg,
          currStart = 0,
          currEnd = 0;
      for (let i=0; i<this.segEndDist.length; i++)
      {
        currSeg = this.segs[i];
        currEnd += currSeg.segLength;
        if (currEnd >= currDist) 
          break;
        currStart = currEnd; 
        if (currStart >= tLen)
        {
          // after resetting to start at seg0 the for loop is exited
          currSeg = this.segs[0];
          currEnd = currSeg.segLength;
          currStart = 0;
          currDist -= tLen;  
        }
      }
      // calc distance into segment
      const segDist = currDist - currStart;
      const posObj = currSeg._pointAlongPath(currSeg.segPoints, 0, segDist);
      const grad = currSeg._gradientAtPoint(currSeg.segPoints, posObj.location);
      
      return {x:posObj.point.x, y:posObj.point.y, gradient:grad.angRad, dx:grad.dx, dy:grad.dy};
    }
  }

  // function to create the SVGsegs without the 'new' word
  segment = function(d)
  {
    return new SVGsegs(d);
  }

  SVGsegs.prototype.getPathLength = function(){
    const trk = new Track(this);    // this.toTrack();
    return trk.totalLength;
  }

  SVGsegs.prototype.translate = function(x=0, y=0){
    const newPathSegs = [];

    this.forEach((seg)=>{
      newPathSegs.push(seg.type);
      for (let j=0; j<seg.values.length; j+=2)   // step through the coord pairs
      {
        newPathSegs.push(seg.values[j] + x, seg.values[j+1] + y);
      }
    });

    return new SVGsegs(newPathSegs);
  }

  SVGsegs.prototype.scale = function(xScl, yScl){
    const newPathSegs = [];
    const sx = xScl || 0.001,
          sy = yScl || sx;

    this.forEach((seg)=>{
      newPathSegs.push(seg.type);
      for (let j=0; j<seg.values.length; j+=2)   // step through the coord pairs
      {
        newPathSegs.push(seg.values[j] * sx, seg.values[j+1] * sy);
      }
    });

    return new SVGsegs(newPathSegs);
  }

  SVGsegs.prototype.rotate = function(degs){
    const newPathSegs = [];
    const angle = degs || 0,
          toRad = Math.PI/180.0,
          s	= Math.sin(angle*toRad),
          c	= Math.cos(angle*toRad);

    this.forEach((seg)=>{
      newPathSegs.push(seg.type);
      for (let j=0; j<seg.values.length; j+=2)   // step through the coord pairs
      {
        let orgX = seg.values[j];
        let orgY = seg.values[j+1];
        newPathSegs.push(orgX*c + orgY*s, -orgX*s + orgY*c);
      }
    });

    return new SVGsegs(newPathSegs);
  }

  SVGsegs.prototype.skew = function(hDegs, vDegs){
    const newPathSegs = [];
    const ha = hDegs || 0,
          va = vDegs || 0,
          toRad = Math.PI/180.0,
          htn	= Math.tan(-ha*toRad),
          vtn	= Math.tan(va*toRad);

    this.forEach((seg)=>{
      newPathSegs.push(seg.type);
      for (let j=0; j<seg.values.length; j+=2)   // step through the coord pairs
      {
        let orgX = seg.values[j];
        let orgY = seg.values[j+1];
        newPathSegs.push(orgX + orgY*htn, orgX*vtn + orgY);
      }
    });

    return new SVGsegs(newPathSegs);
  }

  SVGsegs.prototype.appendPath = function(extensionData){
    let extAry = [];
    let orgAry = [];
    if (!extensionData instanceof SVGsegs)
    {
      console.warn("Type Error: SVGsegs.appendPath argument 1");
      return;
    }
    extensionData.forEach((seg)=>{
      extAry.push(seg.type, ...seg.values);
    });
    this.forEach((seg)=>{
      orgAry.push(seg.type, ...seg.values);
    });
    // concatenate the segments
    const newPathSegs = orgAry.concat(extAry);

    return new SVGsegs(newPathSegs);
  }

  SVGsegs.prototype.joinPath = function(extensionData){
    const org = this.dup();   // don't damage the original
    const newPathSegs = [];
    let extSegs;
    if (!extensionData instanceof SVGsegs)
    {
      console.warn("Type Error: SVGsegs.joinPath argument 1");
      return;
    }
    extSegs = extensionData;
    if (org.length == 0)  // just add the extra including the "M" command
    {
      extSegs.forEach((seg)=>{
        newPathSegs.push(seg.type, ...seg.values);
      });
    }
    else // this has length
    {
      if (org[org.length-1].type == "Z")  // closed path
      {
        org.length = org.length-1;   // delete the 'closePath'
      }
      // start with the org segs
      org.forEach((seg)=>{
        newPathSegs.push(seg.type, ...seg.values);
      });
      // now tack on the extra commands skipping the initial "M" segment
      for (let j=1; j<extSegs.length; j++)
      {
        newPathSegs.push(extSegs[j].type, ...extSegs[j].values);
      }
    }

    return new SVGsegs(newPathSegs);
  }

  SVGsegs.prototype.revWinding = function(){
    // reverse the direction of drawing around a path
    let cmds = this.dup(),
        zCmd = null,
        k, len,
        dCmd;
    const newPathSegs = [];  
    const newPathData = [];  

    function revPairs(ary)
    {
      // return a single array of x,y coords made by taking array of [x,y] arrays and reversing the order
      // eg. [1,2, 3,4, 5,6] returns [5,6, 3,4, 1,2]
      const opAry = [];

      for (let i=ary.length; i>0; i-=2)
      {
        opAry.push(ary[i-2], ary[i-1]);
      }
      return opAry;
    }

    if (cmds[cmds.length-1].type === "Z")
    {
      zCmd = cmds[cmds.length-1];
      cmds.length = cmds.length-1;     // leave off 'Z' cmd segment
    }
    // now step back along the path
    k = cmds.length-1;     // k points at the last segment in the path
    len = cmds[k].values.length;  // length of last seg coords array
    dCmd = {type:"M", values:[cmds[k].values[len-2], cmds[k].values[len-1]]};   // make a 'M' command from final coord pair
    newPathSegs.push(dCmd);         // make this the first command of the output
    cmds[k].values = cmds[k].values.slice(0,-2);  // last coord pair (we've used them)
    while (k>0)
    {
      dCmd = {type:cmds[k].type, values:revPairs(cmds[k].values)};  
      len = cmds[k-1].values.length;     // needed to find the last coord pair of the next segment back
      dCmd.values.push(cmds[k-1].values[len-2], cmds[k-1].values[len-1]); // add the last point of next cmd
      newPathSegs.push(dCmd); 
      // shove it out
      cmds[k-1].values = cmds[k-1].values.slice(0,-2);  // we've used the last point so slice it off
      k -= 1;
    }
    // add the 'z' if it was a closed path
    if (zCmd)
    {
      newPathSegs.push(zCmd);
    }
    newPathSegs.forEach((seg)=>{
      newPathData.push(seg.type, ...seg.values);
    });

    return new SVGsegs(newPathData);
  }

  SVGsegs.prototype.getPointAtLength = function(distWC)  // distance in world coords
  {
    if (this.track === null)
    {
      this.track = new Track(this);
    }
    return this.track.trkDistToPos(distWC) 
  }

  SVGsegs.prototype.getTotalLength = function() 
  {
    if (this.track === null)
    {
      this.track = new Track(this);
    }
    return this.track.totalLength; 
  }

}());
