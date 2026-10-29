// Real DOM gesture lifecycle: cancelling input must invalidate old fingers/drags.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const url = process.env.TOWN_URL || 'http://localhost:8091/';
const browser = await chromium.launch();
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({viewport:{width:390,height:844},hasTouch:mobile,isMobile:mobile});
    const page = await context.newPage();
    // Serve a lightweight harness at the build's origin, using its actual Input module.
    await page.route('**/input-reset-harness.html',route=>route.fulfill({contentType:'text/html',body:'<meta name="viewport" content="width=device-width, initial-scale=1"><canvas id="canvas"></canvas><div id="touch"><div id="stick"><div id="knob"></div></div><button id="t-jump"></button><button id="t-use"></button><button id="t-view"></button><button id="t-run"></button><button id="t-crouch"></button></div>'}));
    await page.goto(new URL('input-reset-harness.html',url).href);
    const result = await page.evaluate(async () => {
      const {Input}=await import('./engine/input.js');
      const canvas=document.querySelector('canvas');
      const input=new Input(canvas,document.querySelector('#touch'));
      const touch=(type,x,y)=>{
        const t=new Touch({identifier:1,target:canvas,clientX:x,clientY:y});
        canvas.dispatchEvent(new TouchEvent(type,{changedTouches:[t],bubbles:true,cancelable:true}));
      };
      touch('touchstart',40,500);touch('touchmove',40,450);
      const walking=input.movement().z;
      input.reset();
      const stickCleared=!document.querySelector('#stick').classList.contains('on') && document.querySelector('#knob').style.transform==='';
      touch('touchmove',40,430); // old finger still down after a menu closed
      const staleFinger=input.movement().z;
      touch('touchend',40,430);
      touch('touchstart',40,500);touch('touchmove',40,450);
      const freshFinger=input.movement().z;
      dispatchEvent(new Event('blur'));
      touch('touchmove',40,420);
      const afterBlur=input.movement().z;
      touch('touchend',40,420);
      touch('touchstart',300,500);touch('touchmove',320,500);
      const touchLook=input.takeLook().dx;
      input.reset();touch('touchmove',350,500);
      const staleTouchLook=input.takeLook().dx;
      touch('touchend',350,500);
      canvas.dispatchEvent(new MouseEvent('mousedown',{clientX:220,clientY:400,bubbles:true}));
      dispatchEvent(new MouseEvent('mousemove',{clientX:240,clientY:400}));
      const dragging=input.takeLook().dx;
      input.reset();
      dispatchEvent(new MouseEvent('mousemove',{clientX:280,clientY:400}));
      const staleDrag=input.takeLook().dx;
      dispatchEvent(new MouseEvent('mouseup'));
      canvas.dispatchEvent(new MouseEvent('mousedown',{clientX:220,clientY:400,bubbles:true}));
      dispatchEvent(new MouseEvent('mousemove',{clientX:240,clientY:400}));
      const freshDrag=input.takeLook().dx;
      dispatchEvent(new Event('blur'));
      dispatchEvent(new MouseEvent('mousemove',{clientX:280,clientY:400}));
      const dragAfterBlur=input.takeLook().dx;
      touch('touchstart',300,500);
      await new Promise(resolve=>setTimeout(resolve,450));
      touch('touchend',300,500);
      const delayedTap=input.takeTaps().length;
      touch('touchstart',300,500);touch('touchmove',340,500);touch('touchend',340,500);
      const dragTaps=input.takeTaps().length;
      touch('touchstart',300,500);touch('touchcancel',300,500);
      const cancelledTaps=input.takeTaps().length;
      return {walking,stickCleared,staleFinger,freshFinger,afterBlur,dragging,staleDrag,freshDrag,dragAfterBlur,touchLook,staleTouchLook,delayedTap,dragTaps,cancelledTaps};
    });
    assert.equal(result.walking,-1,'gesture starts walking');
    assert.equal(result.staleFinger,0,'reset must reject the old finger until a fresh touchstart');
    assert(result.stickCleared,'reset must hide and centre joystick');
    assert.equal(result.freshFinger,-1,'fresh touch still works');
    assert.equal(result.afterBlur,0,'blur must invalidate touch gesture');
    assert.equal(result.touchLook,28,'right-side touch turns camera');
    assert.equal(result.staleTouchLook,0,'reset must cancel touch look');
    assert.equal(result.dragging,20);
    assert.equal(result.staleDrag,0,'reset must cancel mouse drag');
    assert.equal(result.freshDrag,20,'fresh mouse drag still works');
    assert.equal(result.dragAfterBlur,0,'blur must cancel mouse drag');
    assert.equal(result.delayedTap,1,'a stationary touch delayed beyond 350ms must still walk');
    assert.equal(result.dragTaps,0,'a drag must never become tap-to-walk');
    assert.equal(result.cancelledTaps,0,'a cancelled touch must never become tap-to-walk');
    console.log(`PASS ${mobile?'touch phone':'desktop'}: reset/blur cancel stale gestures, fresh gestures work`);
    await context.close();
  }
} finally { await browser.close(); }
