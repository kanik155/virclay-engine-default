var CharacterController=pc.createScript("characterController");CharacterController.attributes.add("speed",{type:"number",default:5}),CharacterController.attributes.add("jumpImpulse",{type:"number",default:400}),CharacterController.prototype.initialize=function(){this.groundCheckRay=new pc.Vec3(0,-1.2,0),this.rayEnd=new pc.Vec3,this.groundNormal=new pc.Vec3,this.onGround=!0,this.jumping=!1},CharacterController.prototype.move=function(t){if(this.onGround&&!this.jumping){var r=new pc.Vec3,e=t.length();e>0&&(r.cross(this.groundNormal,t).cross(r,this.groundNormal),r.normalize().scale(e*this.speed)),this.entity.rigidbody.linearVelocity=r}},CharacterController.prototype.jump=function(){this.onGround&&!this.jumping&&(this.entity.rigidbody.applyImpulse(0,this.jumpImpulse,0),this.onGround=!1,this.jumping=!0,setTimeout(function(){this.jumping=!1}.bind(this),500))},CharacterController.prototype.update=function(t){var r=this.entity.getPosition();this.rayEnd.add2(r,this.groundCheckRay);var e=this.app.systems.rigidbody.raycastFirst(r,this.rayEnd);this.onGround=!!e,e&&this.groundNormal.copy(e.normal)};var VirtualJoystick=pc.createScript("virtualJoystick");VirtualJoystick.attributes.add("stick",{type:"entity"}),VirtualJoystick.attributes.add("enableEvent",{type:"string"}),VirtualJoystick.attributes.add("moveEvent",{type:"string"}),VirtualJoystick.attributes.add("disableEvent",{type:"string"}),VirtualJoystick.prototype.initialize=function(){var t=this.app;t.on(this.enableEvent,(function(t,i){this.entity.setLocalPosition(t,-i,0),this.stick.setLocalPosition(t,-i,0),this.entity.element.enabled=!0,this.stick.element.enabled=!0}),this),t.on(this.moveEvent,(function(t,i){this.stick.setLocalPosition(t,-i,0)}),this),t.on(this.disableEvent,(function(){this.entity.element.enabled=!1,this.stick.element.enabled=!1}),this)};var FirstPersonView=pc.createScript("firstPersonView");FirstPersonView.attributes.add("camera",{type:"entity"}),FirstPersonView.prototype.initialize=function(){var e=this.app;this.x=new pc.Vec3,this.z=new pc.Vec3,this.heading=new pc.Vec3,this.magnitude=new pc.Vec2,this.azimuth=0,this.elevation=0;var t=this.camera.forward.clone();t.y=0,t.normalize(),this.azimuth=Math.atan2(-t.x,-t.z)*(180/Math.PI),(new pc.Mat4).setFromAxisAngle(pc.Vec3.UP,-this.azimuth).transformVector(this.camera.forward,t),this.elevation=Math.atan(t.y,t.z)*(180/Math.PI),this.forward=0,this.strafe=0,this.jump=!1,this.cnt=0,e.on("firstperson:forward",(function(e){this.forward=e}),this),e.on("firstperson:strafe",(function(e){this.strafe=e}),this),e.on("firstperson:look",(function(e,t){this.azimuth+=e,this.elevation+=t,this.elevation=pc.math.clamp(this.elevation,-90,90)}),this),e.on("firstperson:jump",(function(){this.jump=!0}),this),e.on("firstperson:resetCamera",this.resetCamera(),this),e.on("firstperson:setCamera",(function(e,t){this.azimuth=e,this.elevation=t}),this)},FirstPersonView.prototype.postUpdate=function(e){this.camera.setEulerAngles(this.elevation,this.azimuth,0),this.z.copy(this.camera.forward),this.z.y=0,this.z.normalize(),this.x.copy(this.camera.right),this.x.y=0,this.x.normalize(),this.heading.set(0,0,0),0!==this.forward&&(this.z.scale(this.forward),this.heading.add(this.z)),0!==this.strafe&&(this.x.scale(this.strafe),this.heading.add(this.x)),this.heading.length()>1e-4&&(this.magnitude.set(this.forward,this.strafe),this.heading.normalize().scale(this.magnitude.length())),this.jump&&(this.entity.script.characterController.jump(),this.jump=!1),this.entity.script.characterController.move(this.heading);var t=this.camera.getPosition();this.app.fire("cameramove",t)},FirstPersonView.prototype.resetCamera=function(){this.azimuth=0,this.elevation=0};var KeyboardInput=pc.createScript("keyboardInput");KeyboardInput.prototype.initialize=function(){var e=this.app,updateMovement=function(t,i){switch(t){case 38:case 87:e.fire("firstperson:forward",-i);break;case 40:case 83:e.fire("firstperson:forward",i);break;case 37:case 65:e.fire("firstperson:strafe",i);break;case 39:case 68:e.fire("firstperson:strafe",-i)}},keyDown=function(t){t.repeat||(updateMovement(t.keyCode,1),32===t.keyCode&&e.fire("firstperson:jump"))},keyUp=function(e){updateMovement(e.keyCode,0)},addEventListeners=function(){window.addEventListener("keydown",keyDown,!0),window.addEventListener("keyup",keyUp,!0)};this.on("enable",addEventListeners),this.on("disable",(function(){window.addEventListener("keydown",keyDown,!0),window.addEventListener("keyup",keyUp,!0)})),addEventListeners()};var MouseInput=pc.createScript("mouseInput");function applyRadialDeadZone(e,t,i,s){var a=e.length();if(a>i){var n=1-s-i,r=Math.min(1,(a-i)/n)/a;t.copy(e).scale(r)}else t.set(0,0)}MouseInput.prototype.initialize=function(){var e=this.app,t=(e.graphicsDevice.canvas,function(e){this.isDragging=!0}),mouseMove=function(t){if(!0===this.isDragging){var i=event.movementX||event.webkitMovementX||event.mozMovementX||0,s=event.movementY||event.webkitMovementY||event.mozMovementY||0;e.fire("firstperson:look",-i/5,s/5)}},mouseUp=function(e){this.isDragging=!1},addEventListeners=function(){window.addEventListener("mousedown",t,!1),window.addEventListener("mousemove",mouseMove,!1),window.addEventListener("mouseup",mouseUp,!1)};this.on("enable",addEventListeners),this.on("disable",(function(){window.removeEventListener("mousedown",t,!1),window.removeEventListener("mousemove",mouseMove,!1),window.removeEventListener("mouseup",mouseUp,!1)})),addEventListeners()};var TouchInput=pc.createScript("touchInput");TouchInput.attributes.add("deadZone",{title:"Dead Zone",description:"Radial thickness of inner dead zone of the virtual joysticks. This dead zone ensures the virtual joysticks report a value of 0 even if a touch deviates a small amount from the initial touch.",type:"number",min:0,max:.4,default:.3}),TouchInput.attributes.add("turnSpeed",{title:"Turn Speed",description:"Maximum turn speed in degrees per second",type:"number",default:150}),TouchInput.attributes.add("radius",{title:"Radius",description:"The radius of the virtual joystick in CSS pixels.",type:"number",default:50}),TouchInput.attributes.add("doubleTapInterval",{title:"Double Tap Interval",description:"The time in milliseconds between two taps of the right virtual joystick for a double tap to register. A double tap will trigger a jump.",type:"number",default:300}),TouchInput.prototype.initialize=function(){var e=this.app,t=e.graphicsDevice,i=t.canvas;this.remappedPos=new pc.Vec2,this.leftStick={identifier:-1,center:new pc.Vec2,pos:new pc.Vec2},this.rightStick={identifier:-1,center:new pc.Vec2,pos:new pc.Vec2},this.lastRightTap=0;var s=function(s){s.preventDefault();for(var a=t.width/i.clientWidth,n=t.height/i.clientHeight,r=s.changedTouches,o=0;o<r.length;o++){var h=r[o];if(h.pageX<=i.clientWidth/2&&-1===this.leftStick.identifier)this.leftStick.identifier=h.identifier,this.leftStick.center.set(h.pageX,h.pageY),this.leftStick.pos.set(0,0),e.fire("leftjoystick:enable",h.pageX*a,h.pageY*n);else if(h.pageX>i.clientWidth/2&&-1===this.rightStick.identifier){this.rightStick.identifier=h.identifier,this.rightStick.center.set(h.pageX,h.pageY),this.rightStick.pos.set(0,0),e.fire("rightjoystick:enable",h.pageX*a,h.pageY*n);var d=Date.now();d-this.lastRightTap<this.doubleTapInterval&&e.fire("firstperson:jump"),this.lastRightTap=d}}}.bind(this),a=function(s){s.preventDefault();for(var a=t.width/i.clientWidth,n=t.height/i.clientHeight,r=s.changedTouches,o=0;o<r.length;o++){var h=r[o];h.identifier===this.leftStick.identifier?(this.leftStick.pos.set(h.pageX,h.pageY),this.leftStick.pos.sub(this.leftStick.center),this.leftStick.pos.scale(1/this.radius),e.fire("leftjoystick:move",h.pageX*a,h.pageY*n)):h.identifier===this.rightStick.identifier&&(this.rightStick.pos.set(h.pageX,h.pageY),this.rightStick.pos.sub(this.rightStick.center),this.rightStick.pos.scale(1/this.radius),e.fire("rightjoystick:move",h.pageX*a,h.pageY*n))}}.bind(this),n=function(t){t.preventDefault();for(var i=t.changedTouches,s=0;s<i.length;s++){var a=i[s];a.identifier===this.leftStick.identifier?(this.leftStick.identifier=-1,e.fire("firstperson:forward",0),e.fire("firstperson:strafe",0),e.fire("leftjoystick:disable")):a.identifier===this.rightStick.identifier&&(this.rightStick.identifier=-1,e.fire("rightjoystick:disable"))}}.bind(this),addEventListeners=function(){i.addEventListener("touchstart",s,!1),i.addEventListener("touchmove",a,!1),i.addEventListener("touchend",n,!1)};this.on("enable",addEventListeners),this.on("disable",(function(){i.removeEventListener("touchstart",s,!1),i.removeEventListener("touchmove",a,!1),i.removeEventListener("touchend",n,!1)})),addEventListeners()},TouchInput.prototype.update=function(e){var t=this.app;if(-1!==this.leftStick.identifier){applyRadialDeadZone(this.leftStick.pos,this.remappedPos,this.deadZone,0);var i=this.remappedPos.x;this.lastStrafe!==i&&(t.fire("firstperson:strafe",i),this.lastStrafe=i);var s=-this.remappedPos.y;this.lastForward!==s&&(t.fire("firstperson:forward",s),this.lastForward=s)}if(-1!==this.rightStick.identifier){applyRadialDeadZone(this.rightStick.pos,this.remappedPos,this.deadZone,0);var a=-this.remappedPos.x*this.turnSpeed*e,n=-this.remappedPos.y*this.turnSpeed*e;t.fire("firstperson:look",a,n)}};var GamePadInput=pc.createScript("gamePadInput");GamePadInput.attributes.add("deadZoneLow",{title:"Low Dead Zone",description:"Radial thickness of inner dead zone of pad's joysticks. This dead zone ensures that all pads report a value of 0 for each joystick axis when untouched.",type:"number",min:0,max:.4,default:.1}),GamePadInput.attributes.add("deadZoneHigh",{title:"High Dead Zone",description:"Radial thickness of outer dead zone of pad's joysticks. This dead zone ensures that all pads can reach the -1 and 1 limits of each joystick axis.",type:"number",min:0,max:.4,default:.1}),GamePadInput.attributes.add("turnSpeed",{title:"Turn Speed",description:"Maximum turn speed in degrees per second",type:"number",default:90}),GamePadInput.prototype.initialize=function(){this.app;this.lastStrafe=0,this.lastForward=0,this.lastJump=!1,this.remappedPos=new pc.Vec2,this.leftStick={center:new pc.Vec2,pos:new pc.Vec2},this.rightStick={center:new pc.Vec2,pos:new pc.Vec2};var addEventListeners=function(){window.addEventListener("gamepadconnected",(function(e){})),window.addEventListener("gamepaddisconnected",(function(e){}))};this.on("enable",addEventListeners),this.on("disable",(function(){window.removeEventListener("gamepadconnected",(function(e){})),window.removeEventListener("gamepaddisconnected",(function(e){}))})),addEventListeners()},GamePadInput.prototype.update=function(e){for(var t=this.app,i=navigator.getGamepads?navigator.getGamepads():[],s=0;s<i.length;s++){var a=i[s];if(a&&"standard"===a.mapping&&a.axes.length>=4){this.leftStick.pos.set(a.axes[0],a.axes[1]),applyRadialDeadZone(this.leftStick.pos,this.remappedPos,this.deadZoneLow,this.deadZoneHigh);var n=this.remappedPos.x;this.lastStrafe!==n&&(t.fire("firstperson:strafe",n),this.lastStrafe=n);var r=-this.remappedPos.y;this.lastForward!==r&&(t.fire("firstperson:forward",r),this.lastForward=r),this.rightStick.pos.set(a.axes[2],a.axes[3]),applyRadialDeadZone(this.rightStick.pos,this.remappedPos,this.deadZoneLow,this.deadZoneHigh);var o=-this.remappedPos.x*this.turnSpeed*e,h=-this.remappedPos.y*this.turnSpeed*e;t.fire("firstperson:look",o,h),a.buttons[0].pressed&&!this.lastJump&&t.fire("firstperson:jump"),this.lastJump=a.buttons[0].pressed}}};let SceneManager=pc.createScript("sceneManager");SceneManager.attributes.add("sceneRootEntity",{type:"entity"}),SceneManager.attributes.add("playerTemplate",{type:"asset",assetType:"template"}),SceneManager.prototype.initialize=function(){this.app.scenes.list().length>1&&this.loadSpace(this.app.scenes.list()[1].name)},SceneManager.prototype.update=function(){this.player&&this.player.getPosition().y<this.despawnHeight&&this.spawnPlayer(this.player)},SceneManager.prototype.loadSpace=function(e){let t=this.app.scenes.find(e);this.app.scenes.loadSceneHierarchy(t.url,((e,t)=>{e?console.error(e):(t.reparent(this.sceneRootEntity),this.initComponent(),this.player=this.instantiatePlayer(),this.player&&this.spawnPlayer(this.player))}))},SceneManager.prototype.initComponent=function(){this.spawnPoint=this.sceneRootEntity.findByName("SpawnPoint"),this.despawnHeight=this.sceneRootEntity.findByName("DespawnHeight").getPosition().y},SceneManager.prototype.instantiatePlayer=function(){let e=this.playerTemplate.resource.instantiate();return this.app.root.addChild(e),e},SceneManager.prototype.spawnPlayer=function(e){let t=new pc.Vec3(0,1,0);e.rigidbody.teleport(this.spawnPoint.getPosition().add(t)),this.app.fire("firstperson:resetCamera");let a=this.spawnPoint.forward.clone();a.y=0,a.normalize();let n=Math.atan2(-a.x,-a.z)*(180/Math.PI);(new pc.Mat4).setFromAxisAngle(pc.Vec3.UP,-n).transformVector(this.spawnPoint.forward,a);let i=Math.atan(a.y,a.z)*(180/Math.PI);this.app.fire("firstperson:setCamera",n,i)};var UiManager=pc.createScript("uiManager");UiManager.attributes.add("css",{type:"asset",assetType:"css"}),UiManager.attributes.add("html",{type:"asset",assetType:"html"}),UiManager.prototype.initialize=function(){var e=this,t=document.createElement("style");t.type="text/css",document.head.appendChild(t),t.innerHTML=this.css.resource||"",this.div=document.createElement("div"),this.div.classList.add("container"),this.div.innerHTML=this.html.resource||"",document.body.appendChild(this.div);new Vue({el:"#app",data:{fullscreen:window.document.fullscreenElement},created(){document.addEventListener("fullscreenchange",this.fullscreenChange,!1)},methods:{requestFullscreen:function(){document.body.requestFullscreen()},exitFullscreen:function(){document.exitFullscreen()},fullscreenChange:function(){document.webkitFullscreenElement&&null!==document.webkitFullscreenElement?this.fullscreen=!0:this.fullscreen=!1},takeScreenshot:function(){e.app.fire("ui:takeScreenshot")},showHelp:function(e){let t=e.currentTarget.getAttribute("data-target");document.getElementById(t).classList.add("is-active")},closeHelp:function(e){e.currentTarget.parentElement.classList.remove("is-active")}}})};var Screenshot=pc.createScript("screenshot");Screenshot.prototype.initialize=function(){this._triggerScreenshot=!1,this._window=null,this.app.on("ui:takeScreenshot",(function(){this._triggerScreenshot=!0,this._window=window.open("",""),this._window.document.title="Screenshot",this._window.document.body.style.margin="0",this._window.close()}),this),this.app.on("postrender",this.postRender,this)},Screenshot.prototype.takeScreenshot=function(){var t=this.app.graphicsDevice.canvas;let e=document.createElement("a");e.href=t.toDataURL(),e.download="Screenshot.png",e.click()},Screenshot.prototype.postRender=function(){this._triggerScreenshot&&(this.takeScreenshot(),this._triggerScreenshot=!1)};

//# sourceMappingURL=__game-scripts.js.map