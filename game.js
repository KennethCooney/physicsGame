
// *************** FIREBASE START ***************
var config = {
	apiKey: "AIzaSyDs_psHy8ODUPpLXYJcQsyCZxZ-77A5NdE",
	authDomain: "cooindrop.firebaseapp.com",
	databaseURL: "https://cooindrop.firebaseio.com",
	storageBucket: "cooindrop.appspot.com",
	messagingSenderId: "719139779180"
};
firebase.initializeApp(config);

// connect to your Firebase
var firebaseRef = firebase.database();
var firebaseUsers = firebase.database().ref('users');
$(document).ready(function() {
	//console.log(firebase);

	//var topUserPostsRef = firebaseUsers.orderByChild('score');

	// receive users and scores and upload to firebase
	$('#score-form').submit(function(event) { 
		event.preventDefault();
        var userName = $('#user-name').val(); //grab user's message
        $('#user-name').val(""); //clear the message input field
        $('#modal').fadeOut();
        // send message to firebase
        firebaseUsers.push({
        	name: userName, // create name node
        	score: score // create score node
        });
    });


//	var myUserId = firebase.auth().currentUser;
//	var topUserPostsRef = firebaseRef.orderByChild('score');

	// get user names and scores and post to DOM
	var messageClass = (function() {
		function getUserNamesScores() {
		//var orderedByScore = firebaseUsers.orderByChild('score');
		firebaseRef.ref("users").on("value", function(results){
			var messages = [];
			var $messageBoard = $('.user-list');
			// Get results from the database
			var allMessages = results.val();
			// loop through the object and convert to array
			allMessages = $.map(allMessages, function(value, index) {
			    return [value];
			});

			// Sort the messages by score
			allMessages = allMessages.sort(function(a,b) {return (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0);} ); 
			
			// Loops through and adds them to the page
			allMessages.forEach(function(message){
				var name = message.name;
				var votes = message.score;
				var $messageListElement = $('<li></li>');
				$messageListElement.html(name);
				$messageListElement.append('<div class="score-column">' + votes + '</div>');

				messages.push($messageListElement);
				
			})
				//console.log(results);
		
			$messageBoard.empty();
			for (var element in messages) {
				$messageBoard.append(messages[element]);
			}
		});
	}
	return {
		getUserNamesScores: getUserNamesScores
	}
})();
messageClass.getUserNamesScores();
});
// *************** FIREBASE END ***************

// *************** MATTER.JS SETUPD START ***************
// module aliases
var Engine = Matter.Engine,
Render = Matter.Render,
World = Matter.World,
Bodies = Matter.Bodies;

var score = 0;
var ballCounter = 5;

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
	//element: document.body,
	canvas: document.querySelector('#myCanvas'),
	engine: engine,
	options: {
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
var wallRight = Bodies.rectangle(650, 480, 100, 960, {isStatic:true});
var wallLeft = Bodies.rectangle(-50, 480, 100, 960, {isStatic:true});
var spawner = Bodies.rectangle(0, 0, 20, 40, {isStatic: true});
var colliderTop = Bodies.rectangle(300, -30, 600, 50, {isStatic: true, isSensor: true});
var collider100 = Bodies.rectangle(300, 800, 30, 20, {isStatic: true, isSensor: true});
var collider50Left = Bodies.rectangle(200, 760, 30, 20, {isStatic: true, isSensor: true});
var collider50Right = Bodies.rectangle(400, 760, 30, 20, {isStatic: true, isSensor: true});
var spinnerA = Bodies.rectangle(270, 480, 45, 10, {isStatic:true});
var spinnerB = Bodies.rectangle(330, 480, 45, 10, {isStatic:true});
var spinnerC = Bodies.rectangle(270, 560, 45, 10, {isStatic:true});
var spinnerD = Bodies.rectangle(330, 560, 45, 10, {isStatic:true});
var spinnerE = Bodies.rectangle(120, 300, 120, 10, {isStatic:true});
var ground = Bodies.circle(300, 1370, 480, { isStatic: true, friction:0, restitution:0, render: {
	fillStyle: '#2b2b2b'
}});

World.add(engine.world, [ ground, wallRight, wallLeft, spawner, colliderTop, collider100, collider50Left, collider50Right, spinnerA, spinnerB, spinnerC, spinnerD, spinnerE]);
// run the engine
Engine.run(engine); 
// run the renderer
Render.run(render);
// gravity
engine.world.gravity.y = 1;
// *************** MATTER.JS SETUPD END ***************

// *************** CREATE ELEVATORS START ***************
function createElevatorsY(){
	var elevatorY = 0;

	for(var i = 0; i < 18; i++){
		animateElevatorY();
		elevatorY += 55;
	};

	function animateElevatorY(){
		var elevatorRight= Bodies.rectangle(600, elevatorY, 80, 10, {isStatic:true, render: {
			fillStyle: '#ffffff'
		}});
		var elevatorLeft = Bodies.rectangle(0, elevatorY, 80, 10, {isStatic:true, render: {
			fillStyle: '#ffffff'
		}});
		Matter.Composite.add(engine.world, [elevatorRight, elevatorLeft]);

		Matter.Events.on(engine, "afterUpdate", function(){
			Matter.Body.setPosition(elevatorRight, {x: 600, y: elevatorRight.position.y - 2}); // speed of elevators
			Matter.Body.setPosition(elevatorLeft, {x: 0, y: elevatorLeft.position.y - 2}); // speed of elevators
			if(elevatorRight.position.y < 0){
				Matter.Body.setPosition(elevatorRight, {x: 600, y: 1000});
			};
			if(elevatorLeft.position.y < 0){
				Matter.Body.setPosition(elevatorLeft, {x: 600, y: 1000});
			};
		});
	};
};
// *************** CREATE ELEVATORS END ***************

// *************** ANIMATE SPAWNER START ***************
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
// *************** ANIMATE SPAWNER END ***************

// *************** SPAWN COIN ON CLICK START ***************
function clickListener(){
	$('canvas').on('click', function(){
		if(ballCounter > 0){
			//createBall();
			playAudioPop();
			ballCounter --;

			var ball = Bodies.circle(spawner.position.x, 80, 5, {restitution: .5, continuous: 2, friction:0, render: {
				fillStyle: '#65f1ff', 
					strokeStyle: '#65f1ff', // blue #65f1ff
					lineWidth: 0
					}}); // (x, y, radius)
			Matter.Composite.add(engine.world, [ball]);

			Matter.Events.on(engine, "afterUpdate", function(){  // remove if y < 0
				if(ball.position.y < 0 || ball.position.y > 960){
					Matter.Composite.remove(engine.world, [ball]);
				};
			});
		};

		if (ballCounter <= 0){
			console.log('game over');
			$('#modal').fadeIn();
		}

		console.log(ballCounter);
	});
}; 

function createBall(){
	var ball = Bodies.circle(spawner.position.x, 80, 5, {restitution: .5, continuous: 2, friction:0, render: {
		fillStyle: '#65f1ff', 
					strokeStyle: '#65f1ff', // blue #65f1ff
					lineWidth: 0
					}}); // (x, y, radius)
	Matter.Composite.add(engine.world, [ball]);

	// Matter.Events.on(engine, "afterUpdate", function(){ 
	// 	if(ball.position.y > 800){
	// 		console.log('game over');
	// 		$('#restartGameDiv').fadeIn();
	// 	};
	// });
};
// *************** SPAWN COIN ON CLICK END ***************

// *************** PINS START ***************
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
// *************** PINS END ***************

// *************** COLLISION START ***************
Matter.Events.on(engine, 'collisionStart', function(event) {
	var pairs = event.pairs;
	$('#scoreDiv').html('Score ' + score);
	$('#coinDiv').html('Coins ' + ballCounter); 

	for (var i = 0, j = pairs.length; i != j; ++i) {
		var pair = pairs[i];

		if (pair.bodyA === collider100) { // if spawned ball collides with collider100
			score += 100;
			ballCounter += 5;
			collider100.render.fillStyle = '#65f1ff';
			collider100.render.strokeStyle = '#65f1ff';
			playAudioSuccess();
			console.log('score: ' + score);

		}
		else{
			collider100.render.fillStyle = 'white';
			collider100.render.strokeStyle = 'white';
		};

		if (pair.bodyA === collider50Left){ // if spawned ball collides with collider100
			score += 50;
			ballCounter += 1;
			collider100.render.fillStyle = '#65f1ff';
			collider100.render.strokeStyle = '#65f1ff';
			playAudioSuccess();
		}
		if (pair.bodyA === collider50Right){ // if spawned ball collides with collider100
			score += 50;
			ballCounter += 1;
			collider100.render.fillStyle = '#65f1ff';
			collider100.render.strokeStyle = '#65f1ff';
			playAudioSuccess();
		}
		// if (pair.bodyA === ground) { 
		// 	Matter.Events.on(engine, "afterUpdate", function(){ 
		// 		if(ballCounter <= 0){
		// 			console.log('game over');
		// 			$('#restartGameDiv').fadeIn();
		// 		};
		// 	});
		// };

	}
});
// *************** COLLISION END ***************

// *************** AUDIO START ***************
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
// *************** AUDIO END ***************


//$('#scoreDiv').html('Score ');
$('#scoreDiv').html('Score ' + score);
$('#coinDiv').html('Coins ' + ballCounter);

$('#restartGameDiv').on('click', function(e) {
	e.preventDefault();
	score = 0;
	ballCounter = 5;
	$('#restartGameDiv').fadeOut();
	playAudioSuccess()
});



function init(){
	createPins();
	clickListener();
	animateSpawner();
	//createElevatorsY();
};

init();

