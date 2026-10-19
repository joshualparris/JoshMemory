// Lightweight regression for the 3D chat and 2D lounge without starting WebGL.
// Run from repository-town/: node tests/npc-viewport.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/ui/npc-chat.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/npc.css',import.meta.url),'utf8');
const people=readFileSync(new URL('../src/people.html',import.meta.url),'utf8');
const index=readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
assert(source.includes("window.visualViewport?.addEventListener('resize',syncNpcViewport)"));
assert(source.includes("window.visualViewport?.addEventListener('scroll',syncNpcViewport)"));
assert(source.includes("window.addEventListener('resize',syncNpcViewport)"));
assert(source.includes("el.style.setProperty('--npc-vh',height+'px')"));
assert(source.includes("el.style.setProperty('--npc-top',Math.max(0,top)+'px')"));
assert(source.includes("el.classList.add('npc-typing')"));
assert(source.includes("el.classList.remove('npc-typing')"));
assert(source.includes("if(!window.matchMedia('(pointer: coarse)').matches)input.focus()"));
assert(!source.includes("input.disabled=true;send.disabled=true"),'Sending should not bounce the mobile keyboard');
assert(css.includes('#npc-messages{flex:1 1 auto;min-height:0'));
assert(css.includes('#npc-chat.npc-typing .npc-activities'));
assert(css.includes('#npc-chat.npc-typing small'));
assert(css.includes('body.npc-lounge #npc-chat.npc-typing{'));
assert(css.includes('height:calc(var(--npc-vh,100dvh)'));
assert(css.includes('top:calc(var(--npc-top,0px)'));
for(const html of [people,index]) { for(const id of ['npc-chat','npc-messages','npc-input','npc-form'])assert(html.includes('id="'+id+'"'),id+' missing'); assert(!html.includes('id="npc-code"'),'Deprecated PIN input must not return'); }
const residentSource=readFileSync(new URL('../src/ui/npc.js',import.meta.url),'utf8');
const residentCss=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
assert(residentSource.includes("window.visualViewport?.addEventListener('resize', syncViewport)"));
assert(residentSource.includes("window.visualViewport?.addEventListener('scroll', syncViewport)"));
assert(residentSource.includes("window.addEventListener('orientationchange', syncViewport)"));
assert(residentSource.includes("panel.classList.add('chat-typing')"));
assert(residentSource.includes("panel.classList.remove('chat-typing')"));
assert(residentCss.includes('#panel.chat-typing .chat-chips, #panel.chat-typing .chat-brain, #panel.chat-typing #panel-actions { display: none; }'));
assert(residentCss.includes('#panel.chat-typing {'));
console.log('PASS: visualViewport wiring, PIN-free resident focus mode, flex composer and mobile lounge layout');
