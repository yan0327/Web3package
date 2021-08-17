(function(t){function e(e){for(var n,r,o=e[0],c=e[1],l=e[2],h=0,d=[];h<o.length;h++)r=o[h],s[r]&&d.push(s[r][0]),s[r]=0;for(n in c)Object.prototype.hasOwnProperty.call(c,n)&&(t[n]=c[n]);u&&u(e);while(d.length)d.shift()();return a.push.apply(a,l||[]),i()}function i(){for(var t,e=0;e<a.length;e++){for(var i=a[e],n=!0,o=1;o<i.length;o++){var c=i[o];0!==s[c]&&(n=!1)}n&&(a.splice(e--,1),t=r(r.s=i[0]))}return t}var n={},s={index:0},a=[];function r(e){if(n[e])return n[e].exports;var i=n[e]={i:e,l:!1,exports:{}};return t[e].call(i.exports,i,i.exports,r),i.l=!0,i.exports}r.m=t,r.c=n,r.d=function(t,e,i){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},r.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(r.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)r.d(i,n,function(e){return t[e]}.bind(null,n));return i},r.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="/vue-particle-line/";var o=window["webpackJsonp"]=window["webpackJsonp"]||[],c=o.push.bind(o);o.push=e,o=o.slice();for(var l=0;l<o.length;l++)e(o[l]);var u=c;a.push([0,"chunk-vendors"]),i()})({0:function(t,e,i){t.exports=i("c31f")},"1b6c":function(t,e,i){"use strict";var n=i("782a"),s=i.n(n);s.a},"4d1c":function(t,e,i){"use strict";var n=i("d9f7"),s=i.n(n);s.a},"56d2":function(t,e,i){"use strict";var n=i("9730"),s=i.n(n);s.a},"782a":function(t,e,i){},9069:function(t,e,i){},9730:function(t,e,i){},c31f:function(t,e,i){"use strict";i.r(e);i("9f35"),i("b46d"),i("bf22");var n=i("3a00"),s=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{attrs:{id:"app"}},[i("vue-particle-line",{staticClass:"banner-wraper"},[i("banner",{attrs:{text:t.title}})],1),i("usage"),i("foot")],1)},a=[],r=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"banner"},[i("h2",[t._v(t._s(t.text))])])},o=[],c={name:"banner",props:["text"]},l=c,u=(i("56d2"),i("048f")),h=Object(u["a"])(l,r,o,!1,null,"0d427fa4",null);h.options.__file="banner.vue";var d=h.exports,v=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"main-section"},[i("h3",{staticClass:"section-title white"},[t._v("How to use")]),t._m(0),i("br"),t._m(1),i("br"),i("div",{staticClass:"wrap-code text-left"},[i("h4",{staticClass:"white"},[t._v("App.vue file - Simple example")]),i("pre",{staticClass:"language-html"},[i("code",[t._v("\n"+t._s(t.appCode)+"\n        ")])])]),i("br"),t._m(2)])},p=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("pre",{staticClass:"npm-code white"},[t._v("              "),i("code",[t._v("\nnpm install vue-particle-line --save\n              ")]),t._v("\n     ")])},function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"wrap-code text-left"},[i("h4",{staticClass:"white"},[t._v("Main.js file")]),i("pre",{staticClass:"language-js"},[i("code",[t._v("\nimport Vue from 'vue'\nimport vueParticleLine from 'vue-particle-line'\nimport 'vue-particle-line/dist/vue-particle-line.css'\nVue.use(vueParticleLine)\n        ")])])])},function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"wrap-table"},[i("h4",{staticClass:"white text-left"},[t._v("Props")]),i("pre",{staticClass:"language-html"},[t._v("编写中")])])}],f=i("566d"),m=i.n(f);const y='<template>\n  <div id="app">\n    <vue-particle-line>\n      <router-view />\n    </vue-particle-line>\n  </div>\n</template>';var b={name:"usage",data(){return{appCode:y}},mounted(){m.a.highlightAll()}},_=b,x=(i("e73f"),Object(u["a"])(_,v,p,!1,null,"e468db4c",null));x.options.__file="usage.vue";var g=x.exports,w=function(){var t=this,e=t.$createElement;t._self._c;return t._m(0)},C=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("footer",{staticClass:"footer text-center"},[i("p",{staticClass:"white"},[t._v("created by hzzly")])])}],M={name:"footer"},j=M,P=Object(u["a"])(j,w,C,!1,null,null,null);P.options.__file="footer.vue";var S=P.exports,O={name:"app",components:{banner:d,usage:g,foot:S},data(){return{title:"vue-particle-line"}}},$=O,D=(i("4d1c"),Object(u["a"])($,s,a,!1,null,null,null));D.options.__file="App.vue";var E=D.exports,V=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"vue-particle-line"},[i("div",{staticClass:"slot-wraper"},[t._t("default")],2),i("canvas",{staticClass:"canvas",attrs:{id:"canvas"}})])},T=[];class k{constructor(t){this.min=t||0,this._init(this.min)}_init(t){this.r=this.colorValue(t),this.g=this.colorValue(t),this.b=this.colorValue(t),this.style=this.createColorStyle(this.r,this.g,this.b)}colorValue(t){return Math.floor(255*Math.random()+t)}createColorStyle(t,e,i){return`rgba(${t}, ${e}, ${i}, .8)`}}class W{constructor(t,e,i,n,s){this.ctx=t,this.x=n||Math.random()*e,this.y=s||Math.random()*i,this._init()}_init(){this.vx=-.5+Math.random(),this.vy=-.5+Math.random(),this.radius=3*Math.random(),this.color=new k}draw(){this.ctx.beginPath(),this.ctx.fillStyle=this.color.style,this.ctx.arc(this.x,this.y,this.radius,0,2*Math.PI,!1),this.ctx.fill()}}const z=1200,A=700;class H{constructor(t,e){this.tagId=t,this.options=e}init(){const t=document.querySelector(this.tagId),e=t.getContext("2d");t.width=document.body.clientWidth>z?document.body.clientWidth:z,t.height=document.body.clientHeight>A?document.body.clientHeight:A,e.lineWidth=this.options&&this.options.lineWidth||.3,e.strokeStyle=new k(150).style,this.mousePosition={x:30*t.width/100,y:30*t.height/100},this.dots={nb:100,distance:80,d_radius:10,array:[]},this.canvas=t,this.ctx=e,this.color=new k,this.createDots(e,t.width,t.height),requestAnimationFrame(this.animateDots.bind(this))}resize(){const t=document.body.clientWidth>z?document.body.clientWidth:z,e=document.body.clientHeight>A?document.body.clientHeight:A;this.canvas.width=t,this.canvas.height=e,this.createDots(this.ctx,t,e)}mixComponents(t,e,i,n){return(t*e+i*n)/(e+n)}averageColorStyles(t,e){const i=t.color,n=e.color,s=this.mixComponents(i.r,t.radius,n.r,e.radius),a=this.mixComponents(i.g,t.radius,n.g,e.radius),r=this.mixComponents(i.b,t.radius,n.b,e.radius);return this.color.createColorStyle(Math.floor(s),Math.floor(a),Math.floor(r))}createDots(t,e,i){this.dots.array=[];for(let n=0;n<this.dots.nb;n++)this.dots.array.push(new W(t,e,i))}moveDots(){for(let t=0;t<this.dots.nb;t++){const e=this.dots.array[t];e.y<0||e.y>this.canvas.height?(e.vx=e.vx,e.vy=-e.vy):(e.x<0||e.x>this.canvas.width)&&(e.vx=-e.vx,e.vy=e.vy),e.x+=e.vx,e.y+=e.vy}}connectDots(){for(let t=0;t<this.dots.nb;t++)for(let e=0;e<this.dots.nb;e++){const i=this.dots.array[t],n=this.dots.array[e];i.x-n.x<this.dots.distance&&i.y-n.y<this.dots.distance&&i.x-n.x>-this.dots.distance&&i.y-n.y>-this.dots.distance&&(this.ctx.beginPath(),this.ctx.strokeStyle=this.averageColorStyles(i,n),this.ctx.moveTo(i.x,i.y),this.ctx.lineTo(n.x,n.y),this.ctx.stroke(),this.ctx.closePath())}}drawDots(){for(let t=0;t<this.dots.nb;t++){const e=this.dots.array[t];e.draw()}}animateDots(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.moveDots(),this.connectDots(),this.drawDots(),requestAnimationFrame(this.animateDots.bind(this))}}function q(t,e){let i;return function(...n){i&&clearTimeout(i),i=setTimeout(()=>{t.apply(this,n)},e)}}var I={name:"vue-particle-line",mounted(){const t=new H("canvas");t.init(),window.onresize=q(()=>t.resize(),500)}},L=I,F=(i("1b6c"),Object(u["a"])(L,V,T,!1,null,"06c79e02",null));F.options.__file="vue-particle-line.vue";var J=F.exports;J.install=function(t){t.component(J.name,J)};var R=J;const B=[R],G=function(t){G.installed||B.map(e=>t.component(e.name,e))};"undefined"!==typeof window&&window.Vue&&G(window.Vue);var K={install:G,vueParticleLine:R};i("84bd");n["a"].use(K),n["a"].config.productionTip=!1,new n["a"]({render:t=>t(E)}).$mount("#app")},d9f7:function(t,e,i){},e73f:function(t,e,i){"use strict";var n=i("9069"),s=i.n(n);s.a}});
//# sourceMappingURL=index.36f4a334.js.map