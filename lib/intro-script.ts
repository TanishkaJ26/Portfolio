/**
 * Runs blocking in <head>, before first paint, so the page never flashes a
 * preloader it is about to skip and never waits for hydration to decide.
 *
 * <html> is server-rendered with `data-intro="play"`, which is both the
 * common case and the correct no-JS fallback. This only ever rewrites it to
 * "skip" — already seen this session, or prefers-reduced-motion — and marks
 * the session as seen.
 *
 * Kept as a string constant: it must ship inline, not as a fetched module.
 */
export const INTRO_SCRIPT = `(function(){try{
var d=document.documentElement;
var seen=false;
try{seen=sessionStorage.getItem("intro-shown")==="1"}catch(e){}
var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if(seen||reduce){d.setAttribute("data-intro","skip");return}
try{sessionStorage.setItem("intro-shown","1")}catch(e){}
}catch(e){document.documentElement.setAttribute("data-intro","skip")}})();`;
