/* Both modes use the phone's camera stream, without digital magnification. */
window.openDeviceCamera=async function(facing){
 const base={width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30,max:30}};
 let stream;
 try{stream=await navigator.mediaDevices.getUserMedia({video:{...base,facingMode:{exact:facing}},audio:false});}
 catch(e){if(e.name==='NotAllowedError'||e.name==='SecurityError')throw e;stream=await navigator.mediaDevices.getUserMedia({video:{...base,facingMode:{ideal:facing}},audio:false});}
 const track=stream.getVideoTracks()[0],caps=track.getCapabilities?.();
 if(caps?.zoom&&Number.isFinite(caps.zoom.min)&&Number.isFinite(caps.zoom.max)){
  const zoom=Math.max(caps.zoom.min,Math.min(caps.zoom.max,1));
  try{await track.applyConstraints({advanced:[{zoom}]});}catch{}
 }
 return stream;
};
