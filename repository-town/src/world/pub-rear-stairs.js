// Shared, pure geometry for the pub's exterior rear escape stair.
// Dimensions in game metres. The flat outdoor collision engine uses this profile
// to place the walker's camera on the authored tread surfaces.
export const PUB_REAR_STAIRS = Object.freeze({
  x: 5.65, width: 1.4, clearWidth: 1.25, treadCount: 28,
  going: .28, rise: 4.8/28, upperY: 4.8,
  topLandingZ: -11.8, firstTreadZ: -12.1,
  bottomLandingZ: -20.55,
});
export function pubRearStairPoint(site,x,z) {
  if (!Number.isFinite(site?.x)||!Number.isFinite(site?.originZ)) throw new TypeError('Pub world origin required');
  const sign = site.side==='south' ? -1 : 1;
  return {x:site.x+x*sign,z:site.originZ+z*sign};
}
export function pubRearStairFoot(site) {
  return pubRearStairPoint(site,PUB_REAR_STAIRS.x,PUB_REAR_STAIRS.bottomLandingZ);
}
export function pubRearStairTop(site) {
  return pubRearStairPoint(site,PUB_REAR_STAIRS.x,PUB_REAR_STAIRS.topLandingZ);
}
export function pubRearStairHeight(site,x,z) {
  if (!Number.isFinite(x)||!Number.isFinite(z)) return 0;
  const sign=site.side==='south'?-1:1;
  const lx=(x-site.x)*sign,lz=(z-site.originZ)*sign,s=PUB_REAR_STAIRS;
  // An actual ground-level approach remains possible from the yard, not
  // a giant collision box around both flights. Side guards prevent shortcuts.
  if (Math.abs(lx-s.x)>s.clearWidth/2) return 0;
  const lower=s.firstTreadZ-s.treadCount*s.going;
  if (lz<lower-.12||lz>s.topLandingZ+.12) return 0;
  return s.upperY*Math.max(0,Math.min(1,(lz-lower)/(s.firstTreadZ-lower)));
}
export function pubRearStairAtUpperDoor(site,x,z) {
  const sign=site.side==='south'?-1:1,s=PUB_REAR_STAIRS;
  return Math.abs((x-site.x)*sign-s.x)<s.clearWidth/2-.04 &&
    (z-site.originZ)*sign>s.topLandingZ+.1 &&
    (z-site.originZ)*sign<s.topLandingZ+.6;
}
