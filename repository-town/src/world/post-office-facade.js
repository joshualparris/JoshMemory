// Fictional country Post Office street fitout: non-colliding facade trim, not real post branding.
export const POST_FRONTAGE=Object.freeze({width:11,depth:9,entranceGap:{x0:-1.05,x1:1.05},letterboxX:4.6,poBoxBankX:-3.75,parcelHatchX:3.18});
export function decoratePostFacade(b){
  for(const x of [-5.2,5.2])b.box(0xf4e8d2,0.36,3.85,0.18,x,2.34,9.04);
  b.box(0xc43c32,10.15,0.60,0.14,0,3.87,9.05);
  b.box(0xf7f4ea,9.7,0.09,0.15,0,3.51,9.10);
  b.box(0x8d9398,10.25,0.12,0.80,0,3.25,9.42);
  // Post-office-box facade; numbered doors are representational, not a promised 24h service.
  b.box(0xd6dadd,2.35,1.75,0.13,-3.75,1.84,9.10);
  for(let row=0;row<4;row++)for(let col=0;col<5;col++){
    b.box(0xa5b1bc,0.39,0.32,0.015,-4.58+col*0.42,1.21+row*0.39,9.18);
    b.box(0x6f757b,0.09,0.035,0.018,-4.45+col*0.42,1.30+row*0.39,9.20);
  }
  b.box(0xe7e5df,1.58,1.18,0.11,3.18,1.95,9.11);
  b.box(0x343941,1.05,0.12,0.10,3.18,1.55,9.21);
  b.box(0xb8413a,1.65,0.40,0.12,3.18,2.66,9.17);
  b.box(0xf7f1e0,0.80,1.05,0.08,5.16,1.55,9.11);
  for(let i=0;i<5;i++)b.box(0x828587,0.61,0.035,0.09,5.16,1.84-i*0.13,9.18);
}
