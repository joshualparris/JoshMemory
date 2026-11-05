// A real Chromium/WebGL smoke-test: inspect the actual game-world building
// colliders, then drive the production Player and CollisionWorld at fixed
// physics ticks. No fabricated roof rectangle is used for acceptance.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const pageUrl = process.env.GAME_URL || 'http://127.0.0.1:8091/';
const browser = await chromium.launch({ headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
try {
  for (const mode of ['desktop','mobile']) {
    const mobile = mode === 'mobile';
    const context = await browser.newContext({
      viewport: mobile ? {width:393,height:852} : {width:1280,height:800},
      isMobile:mobile, hasTouch:mobile,
    });
    try {
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pageUrl, {waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(() => window.__town &&
        document.getElementById('loading')?.hidden &&
        window.__town.state().triangles > 1000, null,{timeout:90000});
      const evidence = await page.evaluate(async () => {
        const {Player} = await import('./engine/player.js');
        const {CollisionWorld} = await import('./engine/collision.js');
        const seek = (centre, span, step) => {
          const seen = new Set(), found = [];
          for (let x = centre.x - span; x <= centre.x + span; x += step) {
            for (let z = centre.z - span; z <= centre.z + span; z += step) {
              const c = window.__town.probeStatic(x,z,.18);
              if (!c || !Number.isFinite(c.top) || c.top < 3 || c.top > 25) continue;
              const w=c.x1-c.x0,d=c.z1-c.z0;
              if (w<7 || w>22 || d<6 || d>17) continue;
              const key=[c.x0,c.x1,c.z0,c.z1,c.top].join(':');
              if (seen.has(key)) continue;
              seen.add(key); found.push({box:{...c}, x, z, width:w,depth:d});
            }
          }
          return found;
        };
        const shops = window.__town.shops();
        const shop = shops.find(s=>s.id==='store');
        const sectors = [
          {id:'civic', candidates: seek(shop?.door || {x:0,z:161},24,2)},
          {id:'estate', candidates: seek({x:-150,z:270},110,9)},
          {id:'narromine', candidates: seek({x:-4800,z:-760},85,7)},
        ];
        const sampleResults = [];
        for (const sector of sectors) {
          const c = sector.candidates.find(c =>
            // Ensure a usable point within the real polygon for roof support.
            new CollisionWorld([c.box]).groundAt(c.x,c.z,.3,c.box.top+1)>=c.box.top-.01);
          if(!c) {
            sampleResults.push({sector:sector.id,status:'not-found',candidateCount:sector.candidates.length});
            continue;
          }
          const collision = new CollisionWorld([c.box]);
          const camera = {position:{set(){}},rotation:{set(){}}};
          const create = (height,running) => {
            const player = new Player(camera);
            player.place(c.x,c.box.z0-2.3,Math.PI);
            if(height>0)player.jumpSpeed=Math.sqrt(2*22*height);
            const st={run:running,jump:height>0};
            const input={takeLook:()=>({dx:0,dy:0}),
              movement:()=>({x:0,z:-1,running:st.run,crouching:false}),
              consume:k=>k==='jump'&&st.jump?(st.jump=false,true):false};
            let maximum=0,blocked=false;
            for(let frame=0;frame<330;frame++){
              const status=player.update(1/60,input,collision);
              blocked ||= status.blocked;
              maximum=Math.max(maximum,player.y);
              if(player.pos.z>c.box.z1+1)break;
            }
            return {z:player.pos.z,y:player.y,maximum,blocked};
          };
          const normal=create(0,true);
          const superJump=create(Math.max(24,Math.ceil(c.box.top+7)),true);
          sampleResults.push({sector:sector.id,status:'tested',source:c.box.source || null,
            height:c.box.top,width:c.width,depth:c.depth,
            normal,superJump,box:{x0:c.box.x0,x1:c.box.x1,z0:c.box.z0,z1:c.box.z1}});
        }
        return {sampleResults,renderedTriangles:window.__town.state().triangles};
      });
      const hits=evidence.sampleResults.filter(x=>x.status==='tested');
      assert(hits.length>=2, mode+' needs actual city plus Narromine/estate building sources: '+JSON.stringify(evidence));
      for (const sample of hits) {
        assert(sample.normal.z < sample.box.z0,
          mode+' normal sprint bypassed wall of '+sample.sector+': '+JSON.stringify(sample));
        assert(sample.superJump.maximum > sample.height+.2,
          mode+' jump never cleared roof height '+sample.sector+': '+JSON.stringify(sample));
        assert(sample.superJump.z > sample.box.z1+.5,
          mode+' sprint superjump blocked inside '+sample.sector+': '+JSON.stringify(sample));
      }
      assert.deepEqual(errors,[],mode+' browser page errors');
      console.log('PASS '+mode+' actual rendered game source and world colliders: '+JSON.stringify(evidence));
    } finally {await context.close();}
  }
} finally {await browser.close();}
