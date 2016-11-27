
// module aliases
var Engine = Matter.Engine,
Render = Matter.Render,
World = Matter.World,
Bodies = Matter.Bodies;

var hitCount = 0;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		width: 600,
		height: 960,
		wireframes: true,
		//showDebug: true,
		showPositions: true,
		hasBounds: true
	}
});
Matter.Render.run(render)

// create objects and add to World
var spawner = Bodies.rectangle(0, 0, 1, 1, {isStatic: true, inertia: Infinity});
var collider = Bodies.rectangle(300, 500, 200, 20, {isStatic: true, isSensor: true});
var ground = Bodies.rectangle(300, 800, 600, 40, { isStatic: true, friction:0, restitution:1 });
World.add(engine.world, [spawner, ground, collider]);

// run the engine
Engine.run(engine); 

// run the renderer
Render.run(render);

// gravity
engine.world.gravity.y = 1;

// *****************************

// spawn new ball on mouse click and at mouse position
function createBalls(){
	$('canvas').on('click', function(){
	var ball = Bodies.circle(spawner.position.x, 40, 5, {friction:0, restitution:.5}); // (x, y, radius)
	Matter.Composite.add(engine.world, [ball]);
});
}

// create static pins
function createPins(){
	var pinStartX = 100;
	var pinStartX2 = 110;
	var pinStartY = 100;
	var pinStartY2 = 120;

	for(var i = 0; i < 8; i++){
		//create 1st row of pins
		for(var j = 0; j < 21; j++) {
			var pin = Bodies.circle(pinStartX, pinStartY, 5, {isStatic: true});
			pinStartX = pinStartX + 20;
			Matter.Composite.add(engine.world, [pin]);
		}
		//create 2nd row of pins
		for(var k = 0; k < 20; k++) {
			var pin2 = Bodies.circle(pinStartX2, pinStartY2, 5, {isStatic: true});
			pinStartX2 = pinStartX2 + 20;
			Matter.Composite.add(engine.world, [pin2]);
		}
		// reset x, increment y
		pinStartX = 100;
		pinStartX2 = 110;
		pinStartY = pinStartY + 40;
		pinStartY2 = pinStartY2 + 40;
	}
}

// detect collision
Matter.Events.on(engine, 'collisionStart', function(event) {
	var pairs = event.pairs;

	for (var i = 0, j = pairs.length; i != j; ++i) {
		var pair = pairs[i];

		if (pair.bodyA === collider) {
			hitCount++;
			console.log(hitCount);
		} 
	}
});

// animate spawner back and forth with cosine
function draw(){
	requestAnimationFrame(draw);
	var spawnerX = spawner.position.x;
	spawner.position.x = Math.cos(engine.timing.timestamp/500)*200+300; //speed, width, startX
	spawner.position.y = 40;
	return
	spawner.position.x
}


createPins();
createBalls();
draw();
