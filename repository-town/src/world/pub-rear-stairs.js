// Shared geometry for the pub's rear-door balcony and east-side return stair.
// Route faces the FRONT of the pub, never extending into the railway behind it.
export const PUB_REAR_STAIRS=Object.freeze({
 x:5.65,flightX:8.5,clearWidth:1.25,treadCount:28,
 going:.28,rise:4.8/28,upperY:4.8,
 topLandingZ:-11.8,firstTreadZ:-11.45,bottomLandingZ:-2.9
});
export function pubRearStairPoint(site,x,z){
 if(!Number.isFinite(site?.x)||!Number.isFinite(site?.originZ))throw new TypeError('Pub world origin required');
 const sign=site.side==='south'?-1:1;
 return {x:site.x+x*sign,z:site.originZ+z*sign};
}
export function pubRearStairFoot(site){return pubRearStairPoint(site,PUB_REAR_STAIRS.flightX,PUB_REAR_STAIRS.bottomLandingZ)}
export function pubRearStairTop(site){return pubRearStairPoint(site,PUB_REAR_STAIRS.x,PUB_REAR_STAIRS.topLandingZ)}
export function pubRearStairHeight(site,x,z){
 if(!Number.isFinite(x)||!Number.isFinite(z))return 0;
 const sign=site.side==='south'?-1:1,lx=(x-site.x)*sign,lz=(z-site.originZ)*sign,s=PUB_REAR_STAIRS;
 // The flat balcony outside the upper rear exit joins the top stair sideways.
 if(lx>=s.x-.6&&lx<=s.flightX+.25&&Math.abs(lz-s.topLandingZ)<=.45)return s.upperY;
 // Descend towards the front, away from the railway (no player under the treads).
 if(Math.abs(lx-s.flightX)>s.clearWidth/2)return 0;
 const end=s.firstTreadZ+s.treadCount*s.going;
 if(lz<s.firstTreadZ-.12||lz>end+.05)return 0;
 return s.upperY*Math.max(0,Math.min(1,(end-lz)/(end-s.firstTreadZ)));
}
export function pubRearStairAtUpperDoor(site,x,z){
 const sign=site.side==='south'?-1:1,s=PUB_REAR_STAIRS;
 return Math.abs((x-site.x)*sign-s.x)<.55 &&
  (z-site.originZ)*sign>s.topLandingZ+.1 &&
  (z-site.originZ)*sign<s.topLandingZ+.6;
}
