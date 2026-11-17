/* Header + menu for v3 inner pages (same behavior as the home page header) */
(function(){"use strict";
var $=function(s){return document.querySelector(s)};
var yr=$("#yr");if(yr)yr.textContent=new Date().getFullYear();
var head=$("#siteHead"),lastY=0;
function onScroll(){var y=window.scrollY;head.classList.toggle("is-hidden",y>lastY&&y>300);lastY=y}
window.addEventListener("scroll",onScroll,{passive:true});
var menu=$("#menu"),openBtn=$(".menu-btn"),closeBtn=$(".menu-close");
if(menu&&openBtn&&closeBtn){
 function setMenu(o){menu.classList.toggle("is-open",o);openBtn.setAttribute("aria-expanded",String(o));document.body.style.overflow=o?"hidden":"";if(o)setTimeout(function(){closeBtn.focus()},50);else openBtn.focus()}
 openBtn.addEventListener("click",function(){setMenu(true)});closeBtn.addEventListener("click",function(){setMenu(false)});
 document.addEventListener("keydown",function(e){if(e.key==="Escape"&&menu.classList.contains("is-open"))setMenu(false)});
}})();
