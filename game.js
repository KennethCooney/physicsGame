

// module aliases
var Engine = Matter.Engine,
Render = Matter.Render,
World = Matter.World,
Bodies = Matter.Bodies;

var hitCountA = 0;
var hitCountB = 0;

// create an engine
var engine = Engine.create({
	timing: {
		timeScale: 1.5
	},
	options: {
		enableSleeping: true,
		constraintIterations: 4,// default 2 
		positionIterations: 8, // default 6 
		velocityIterations: 6, // default 4 
	}
});

// create a renderer
var canvasContainer = document.getElementById('canvas')
var render = Render.create({
	element: document.body,
	canvas: canvasContainer,
	engine: engine,
	options: {
		background:"#f4f4f4",
		width: 600,
		height: 960,
		wireframes: false,
		showPositions: false,
		showAxes: false,
		hasBounds: false,
		showDebug: false
	}
});
Matter.Render.run(render)

// create objects and add to World
var wallRight = Bodies.rectangle(630, 480, 100, 960, {isStatic:true});
var wallLeft = Bodies.rectangle(-30, 480, 100, 960, {isStatic:true});
var spawner = Bodies.rectangle(300,50, 50, 50, {isStatic: true});
var colliderA = Bodies.rectangle(300, 700, 50, 50, {isStatic: true, isSensor: true});
var colliderB = Bodies.rectangle(200, 700, 100, 10, {isStatic: true, isSensor: true});
var spinnerA = Bodies.rectangle(75, 400, 50, 10, {isStatic:true});
var spinnerB = Bodies.rectangle(125, 400, 50, 10, {isStatic:true});
var spinnerC = Bodies.rectangle(175, 400, 50, 10, {isStatic:true});
var spinnerD = Bodies.rectangle(225, 400, 50, 10, {isStatic:true});
//var triangle = Bodies.fromVertices(300, 850, [{ x: 0, y: 0 }, { x: 300, y: -75 }, { x: 600, y: 0 }], {isStatic: true, friction: 0, restitution: 0}, [flagInternal=false], [removeCollinear=0.01], [minimumArea=10]);
var concaveTriangle = Bodies.fromVertices(300, 600, [{ x: 0, y: 0 }, { x: 300, y:100 }, { x: 600, y: 0 }, { x: 600, y: 200 }, { x: 0, y: 200 }], {isStatic: true, friction: 0, restitution: 0}, [flagInternal=false], [removeCollinear=0.01], [minimumArea=10]);
var ground = Bodies.circle(300, 1450, 600, { isStatic: true, friction:0, restitution:0 });
World.add(engine.world, [ wallRight, wallLeft, spawner, ground, colliderA, spinnerA, spinnerB, spinnerC, spinnerD]);

var ball = Bodies.circle(spawner.position.x, 100, 5, {restitution: .5, continuous: 2, friction:0}); // (x, y, radius)
// run the engine
Engine.run(engine); 

// run the renderer
Render.run(render);

// gravity
engine.world.gravity.y = 1;

// *****************************

// var counter = 0;
// var looper = setInterval(function() {
// 	counter++;
// 	console.log(counter);
// 	createElevator()
// 	if(counter >= 7) {
// 		clearInterval(looper)
// 	}
// }, 1000);

function createElevators(){
	var elevatorY = 0;
	for(var i = 0; i < 8; i++){
		animateElevator();
		elevatorY += 125;
	}

	function animateElevator(){
		var elevatorRight = Bodies.rectangle(600, elevatorY, 75, 10, {isStatic:true});
		var elevatorLeft = Bodies.rectangle(0, elevatorY, 75, 10, {isStatic:true});
		Matter.Composite.add(engine.world, [elevatorRight, elevatorLeft]);

		Matter.Events.on(engine, "afterUpdate", function(){
			Matter.Body.setPosition(elevatorRight, {x: 600, y: elevatorRight.position.y - 2.3});
			Matter.Body.setPosition(elevatorLeft, {x: 0, y: elevatorLeft.position.y - 2.3});
			if(elevatorRight.position.y < 0){
				Matter.Body.setPosition(elevatorRight, {x: 600, y: 1000});
			}
			if(elevatorLeft.position.y < 0){
				Matter.Body.setPosition(elevatorLeft, {x: 0, y: 1000});
			}
		});
	}
}


// animate spawner back and forth with cosine
function animateSpawner(){
	Matter.Events.on(engine, 'beforeUpdate', function() {
		Matter.Body.setPosition(spawner, {x: 300 +200 * Math.cos(engine.timing.timestamp * 0.002),y:625});
		Matter.Body.rotate(spinnerA, -.05);
		Matter.Body.rotate(spinnerB, .05);
		Matter.Body.rotate(spinnerC, -.05);
		Matter.Body.rotate(spinnerD, .05);

	});
}

// spawn new ball on mouse click and at mouse position
function clickListener(){
	$('canvas').on('click', function(){
		var ball = Bodies.circle(spawner.position.x, 100, 5, {restitution: .5, continuous: 2, friction:0}); // (x, y, radius)
		Matter.Composite.add(engine.world, [ball]);
	});
}

// create static pins
function createPins(){

	var pinStartX = 50;
	var pinStartX2 = 60;
	var pinStartY = 160;
	var pinStartY2 = pinStartY + 20;

	for(var i = 0; i < 4; i++){
		//create 1st row of pins
		for(var j = 0; j < 10; j++) {
			var pin = Bodies.circle(pinStartX, pinStartY, 5, {isStatic: true, restitution: 1});
			pinStartX = pinStartX + 20;
			Matter.Composite.add(engine.world, [pin]);
		}
		//create 2nd row of pins
		for(var k = 0; k < 10; k++) {
			var pin2 = Bodies.circle(pinStartX2, pinStartY2, 5, {isStatic: true, restitution: 1});
			pinStartX2 = pinStartX2 + 20;
			Matter.Composite.add(engine.world, [pin2]);
		}
		// reset x, increment y
		pinStartX = 50;
		pinStartX2 = 60;
		pinStartY = pinStartY + 40;
		pinStartY2 = pinStartY2 + 40;
	}
}

// detect collisions
Matter.Events.on(engine, 'collisionStart', function(event) {
	var pairs = event.pairs;

	for (var i = 0, j = pairs.length; i != j; ++i) {
		var pair = pairs[i];
		// remove ball when it collides with ground
		// if (pair.bodyA === ground) {	
		// 	Matter.World.remove(engine.world, pair.bodyB)
		// 	// console.log(pair.bodyA);
		// 	// console.log(pair.bodyB);
		// } 
		// add points to hitCountA
		if (pair.bodyA === colliderA) {
			hitCountA++;
			console.log('hitCountA: ' + hitCountA);
		}
		// add points to hitCountB
		if (pair.bodyA === colliderB) {
			hitCountB++;
			console.log('hitCountB: ' + hitCountB);
		}
	}
});

// var canvas = document.getElementById("canvas");
// var ctx = canvas.getContext("2d");

// ctx.font = "48px serif";
// ctx.fillText("Hello world", 50, 100);

//_sceneEvents.push(
Matter.Events.on(engine, 'afterRender', function(event) {
	var context = engine.render.context;
        //context.font = "45px 'Cabin Sketch'";
        context.fillText("THROW OBJECT HERE", 150, 80);
        return context;
    });
//);

function init(){
	createPins();
	clickListener();
	animateSpawner();
	createElevators()
}

init();

