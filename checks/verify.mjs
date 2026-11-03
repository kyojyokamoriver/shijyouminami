import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const base=new URL('../',import.meta.url);
let now=0;
const source=fs.readFileSync(new URL('selfie/sense.js',base),'utf8');
const FaceFinder=vm.runInNewContext(source.slice(source.indexOf('export class FaceFinder')).replace('export class','class')+';FaceFinder',{document:{createElement:()=>({getContext:()=>({})})},performance:{now:()=>now}});
const finder=new FaceFinder({});finder.start();
const box=(x,y=.5)=>({boundingBox:{xCenter:x,yCenter:y,width:.15,height:.2}});
finder._results({detections:[box(.2),box(.5),box(.8)]});assert.equal(finder.faces.length,3);
const ids=finder.faces.map(f=>f.id);now=90;
finder._results({detections:[box(.8),box(.2),box(.5)]});
assert.deepEqual(Array.from(finder.faces,f=>f.id),Array.from(ids));
assert.ok(Math.abs(finder.faces[0].cx-.2)<.001);
now=600;finder._results({detections:[]});assert.equal(finder.faces.length,0);
finder._results({detections:[box(.1),box(.3),box(.6),box(.9)]});assert.equal(finder.faces.length,3);
finder.stop();assert.equal(finder.faces.length,0);
const app=fs.readFileSync(new URL('selfie/app.js',base),'utf8');
const homes=app.slice(app.indexOf('function updateHomes()'),app.indexOf('\nfunction spawnAll()'));
const state={isFront:()=>true,headFaces:[],mons:Array.from({length:3},()=>({group:{visible:false},sizeK:1})),ONI_FRAC:.112,SPRITE_ASPECT:1.25,Math,Map};
vm.createContext(state);vm.runInContext(homes,state);
for(const count of [1,2,3,2,1,0]){
 state.headFaces=Array.from({length:count},(_,i)=>({id:i+1,x:(i-1)*.5,y:0,w:.3,h:.4}));
 vm.runInContext('updateHomes()',state);
 assert.equal(state.mons.filter(m=>m.group.visible).length,count);
 if(count){for(const f of state.headFaces)assert.ok(state.mons.some(m=>m.faceId===f.id));for(const m of state.mons.filter(m=>m.group.visible)){assert.ok(m.hy>.32);assert.ok(m.headScale>0);}}
}
state.headFaces=[{id:1,x:0,y:.9,w:.3,h:.4}];vm.runInContext('updateHomes()',state);assert.ok(state.mons.every(m=>!m.group.visible));
let request,zoom;
const cam={getCapabilities:()=>({zoom:{min:.5,max:5}}),applyConstraints:async c=>zoom=c.advanced[0].zoom};
const cameraContext={window:{},navigator:{mediaDevices:{getUserMedia:async c=>{request=c;return {getVideoTracks:()=>[cam]};}}}};
vm.runInNewContext(fs.readFileSync(new URL('camera-source.js',base),'utf8'),cameraContext);
for(const facing of ['user','environment']){await cameraContext.window.openDeviceCamera(facing);assert.equal(request.video.facingMode.exact,facing);assert.equal(zoom,1);}
console.log('PASS: up to 3 stable faces, head-only layout, lost-face cleanup, both cameras at 1x.');
