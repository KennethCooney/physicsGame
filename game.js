
// module aliases
var Engine = Matter.Engine,
Render = Matter.Render,
World = Matter.World,
Bodies = Matter.Bodies;

var hitCountA = 0;
var ballCounter = 20;

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
var render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		//background:"#283a33",
		background:"#2b2b2b",
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
var spawner = Bodies.rectangle(0, 0, 20, 40, {isStatic: true});
var colliderTop = Bodies.rectangle(300, 0, 600, 50, {isStatic: true, isSensor: true});
var colliderA = Bodies.rectangle(300, 800, 50, 20, {isStatic: true, isSensor: true});
var spinnerA = Bodies.rectangle(270, 480, 45, 10, {isStatic:true});
var spinnerB = Bodies.rectangle(330, 480, 45, 10, {isStatic:true});
var spinnerC = Bodies.rectangle(270, 560, 45, 10, {isStatic:true});
var spinnerD = Bodies.rectangle(330, 560, 45, 10, {isStatic:true});
var spinnerE = Bodies.rectangle(180, 300, 120, 10, {isStatic:true});

//var triangle = Bodies.fromVertices(300, 850, [{ x: 0, y: 0 }, { x: 300, y: -75 }, { x: 600, y: 0 }], {isStatic: true, friction: 0, restitution: 0}, [flagInternal=false], [removeCollinear=0.01], [minimumArea=10]);
var concaveTriangle = Bodies.fromVertices(300, 600, [{ x: 0, y: 0 }, { x: 300, y:100 }, { x: 600, y: 0 }, { x: 600, y: 200 }, { x: 0, y: 200 }], {isStatic: true, friction: 0, restitution: 0}, [flagInternal=false], [removeCollinear=0.01], [minimumArea=10]);
var ground = Bodies.circle(300, 1450, 600, { isStatic: true, friction:0, restitution:0 });

World.add(engine.world, [ wallRight, wallLeft, spawner, ground, colliderTop, colliderA, spinnerA, spinnerB, spinnerC, spinnerD, spinnerE]);
// run the engine
Engine.run(engine); 
// run the renderer
Render.run(render);
// gravity
engine.world.gravity.y = 1;

// *****************************

function createElevators(){
	var elevatorY = 0;
	for(var i = 0; i < 8; i++){
		animateElevator();
		elevatorY += 125;
	};

	function animateElevator(){
		var elevatorRight = Bodies.rectangle(600, elevatorY, 55, 10, {isStatic:true});
		var elevatorLeft = Bodies.rectangle(0, elevatorY, 55, 10, {isStatic:true});
		Matter.Composite.add(engine.world, [elevatorRight, elevatorLeft]);

		Matter.Events.on(engine, "afterUpdate", function(){
			Matter.Body.setPosition(elevatorRight, {x: 600, y: elevatorRight.position.y - 2.3}); // speed of elevators
			Matter.Body.setPosition(elevatorLeft, {x: 0, y: elevatorLeft.position.y - 2.3});
			if(elevatorRight.position.y < 0){
				Matter.Body.setPosition(elevatorRight, {x: 600, y: 1000});
			};
			if(elevatorLeft.position.y < 0){
				Matter.Body.setPosition(elevatorLeft, {x: 0, y: 1000});
			};
		});
	};
};

// animate spawner back and forth with cosine
function animateSpawner(){
	Matter.Events.on(engine, 'beforeUpdate', function() {
		Matter.Body.setPosition(spawner, {x: 300 + 240 * Math.cos(engine.timing.timestamp * 0.002),y:40}); // x + width * speed
		Matter.Body.rotate(spinnerA, -.05);
		Matter.Body.rotate(spinnerB, .05);
		Matter.Body.rotate(spinnerC, -.05);
		Matter.Body.rotate(spinnerD, .05);
		Matter.Body.rotate(spinnerE, .01);
	});
}

// spawn new ball on mouse click and at mouse position
function clickListener(){
	$('canvas').on('click', function(){
		if(ballCounter > 0){
			playAudioPop();
			var ball = Bodies.circle(spawner.position.x, 80, 5, {restitution: .5, continuous: 2, friction:0, render: {
				fillStyle: '#65f1ff', 
				strokeStyle: '#65f1ff', // blue #65f1ff
				lineWidth: 0
				}}); // (x, y, radius)
			Matter.Composite.add(engine.world, [ball]);
			ballCounter --;
			console.log(ballCounter);
			
			Matter.Events.on(engine, "afterUpdate", function(){
				if(ball.position.y < 0){
					Matter.Composite.remove(engine.world, [ball]);
				};
			});
		};
	});
};


// create static pins
function createPins(){

	var pinStartX = 50;
	var pinStartX2 = 60;
	var pinStartY = 160;
	var pinStartY2 = pinStartY + 20;

	for(var i = 0; i < 12; i++){ // height of pins container
		//create 1st row of pins
		for(var j = 0; j < 26; j++) {
			var pin = Bodies.circle(pinStartX, pinStartY, 5, {isStatic: true, restitution: 1, render: {
				fillStyle: 'black',
				strokeStyle: 'white',
				lineWidth: 1
			}});
			pinStartX = pinStartX + 20;
			Matter.Composite.add(engine.world, [pin]);
		}
		//create 2nd row of pins
		for(var k = 0; k < 25; k++) {
			var pin2 = Bodies.circle(pinStartX2, pinStartY2, 5, {isStatic: true, restitution: 1, render: {
				fillStyle: 'black',
				strokeStyle: 'white',
				lineWidth: 1
			}});
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
	$('#scoreDiv').html('Score ' + hitCountA);
	$('#coinDiv').html('Balls ' + ballCounter); 

	for (var i = 0, j = pairs.length; i != j; ++i) {
		var pair = pairs[i];

		if (pair.bodyA === colliderA) {
			hitCountA++;
			colliderA.render.fillStyle = '#65f1ff';
			colliderA.render.strokeStyle = '#65f1ff';
			playAudioSuccess();
			console.log('hitCountA: ' + hitCountA);
		}
		else{
			colliderA.render.fillStyle = 'white';
			colliderA.render.strokeStyle = 'white';
		}
		// add points to hitCountB
		if (pair.bodyA === colliderTop) {
			ballCounter++;
			playAudioThud();
			console.log('ballCounter: ' + ballCounter);
		}
	}
});

function playAudioSuccess(){
	var audioSuccess = document.getElementById("audioSuccess");
	audioSuccess.play();
};
function playAudioPop(){
	var audioPop = document.getElementById("audioPop");
	audioPop.play();
};
function playAudioThud(){
	var audioThud = document.getElementById("audioThud");
	audioThud.play();
};

$('#scoreDiv').html('Score ');
$('#coinDiv').html('Balls ' + ballCounter);

$('#restartGameDiv').on('click', function(e) {
	e.preventDefault();
	$('#restartGameDiv').hide();
});



function init(){
	createPins();
	clickListener();
	animateSpawner();
	createElevators();
};

init();

