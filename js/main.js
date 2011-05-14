
var WIDTH = 0;
var HEIGHT = 0;
var FPS = 40;
var BG_COLOR = '#000000';
var COLORS = ['#0099ff', '#00ccff', '#00ffcc', '#00ff66', '#19aa19', '#7fe533', '#b9f724', '#ffff00', '#ffcc00', '#ff6600', '#ff0000', '#e5337f', '#ff00cc', '#e500ff', '#9900ff', '#6633cc', '#1d45b6'];

var c = null;
var drawQueue = [];
var drawTimeout = null;
var starFieldTimer = null;
var FF3 = false;
var canPlayThrough = false;

$(init);

function init() {
	var navHack = document.createElement('nav');
	
	if (typeof IE == 'undefined' && (typeof document.body.style.MozTransition != 'undefined' || typeof document.body.style.WebkitTransition != 'undefined')) {
		starField();
	}
	
	if (window.navigator.userAgent.match(/Firefox\/./)) {
		var version = parseInt(window.navigator.userAgent.match(/Firefox\/(.)/)[1]);
		
		if (version < 4) {
			FF3 = true;
			alert('If you are going to view this site in Firefox, it is recommended that you use the latest version (Firefox 4). You can still try it out with your current version, though it might be a little sluggish and out of sync...')
		}
	}
	
	var canvasCheck = document.createElement('canvas');
	
	if (typeof canvasCheck.getContext == 'undefined') {
		$('#loading').remove();
		$('<p id="noCanvas"><strong>!</strong>We\'re sorry to say that this site requires a browser with the latest HTML5 technology (Chrome 11, Safari 5, Firefox 4, or Internet Explorer 9). If you\'d really like to see it (and you really should) you should download one of those and try again.</p>').appendTo('body');
	}
	else {
		loadSoundData();
	}
}

function loadSoundData() {
	$.getScript('js/data_da_funk.js', loadSoundDataCallback);
	$.getScript('js/data_aerodynamic.js', loadSoundDataCallback);
	$.getScript('js/data_too_long.js', loadSoundDataCallback);
	$.getScript('js/data_oh_yeah.js', loadSoundDataCallback);
	$.getScript('js/data_steam_machine.js', loadSoundDataCallback);
	$.getScript('js/data_television_rules_the_nation.js', loadSoundDataCallback);
	$.getScript('js/data_tron_legacy.js', loadSoundDataCallback);
	$.getScript('js/data_alive.js', loadSoundDataCallback);
	$.getScript('js/data_burnin.js', loadSoundDataCallback);
	$.getScript('js/data_around_the_world.js', loadSoundDataCallback);
	$.getScript('js/data_voyager.js', loadSoundDataCallback);
	$.getScript('js/data_crescendolls.js', loadSoundDataCallback);
	$.getScript('js/data_mothership_reconnection.js', loadSoundDataCallback);
	$.getScript('js/data_digital_love.js', loadSoundDataCallback);
	$.getScript('js/data_harder_better_faster.js', loadSoundDataCallback);
	$.getScript('js/data_human_after_all.js', loadSoundDataCallback);
	$.getScript('js/data_face_to_face.js', loadSoundDataCallback);
	$.getScript('js/data_short_circuit.js', loadSoundDataCallback);
	$.getScript('js/data_daftendirekt.js', loadSoundDataCallback);
	$.getScript('js/data_da_funk2.js', loadSoundDataCallback);
	$.getScript('js/data_revolution_909.js', loadSoundDataCallback);
	$.getScript('js/data_technologic.js', loadSoundDataCallback);
	$.getScript('js/data_chord_memory.js', loadSoundDataCallback);
	$.getScript('js/data_one_more_time.js', loadSoundDataCallback);
	$.getScript('js/data_aerodynamic2.js', loadSoundDataCallback);
}

function loadSoundDataCallback() {
	var defined = 0;
	
	for (var i = 0; i < data.length; i++) {
		if (typeof data[i] != 'undefined') {
			defined++;
		}
	}
	
	if (defined == 25) {
		$('#loading').text('Loaded 100% of sound data');
		
		soundDataLoaded();
	}
	else {
		$('#loading').text('Loaded ' + Math.round(defined / 25 * 100) + '% of sound data');
	}
}

function soundDataLoaded() {
	var lastTime = 410000;
	
	for (var i = 0; i < data.length; i++) {
		var segment = $('<div class="segment" title="' + data[i]['title'] + '"></div>');
		segment
			.css('left', data[i]['timecode'][0].t / lastTime * 100 + '%')
			.css('right', (lastTime - data[i]['timecode'][data[i]['timecode'].length - 1].t) / lastTime * 100 + '%')
			.css('top', i * 5)
			.css('backgroundColor', COLORS[i % (COLORS.length - 1)])
			.appendTo('#timeline')
	}
	
	$('.segment').each(function() {
		var segmentTitle = $('<div class="segmentTitle"><span class="pointer"></span>' + $(this).attr('title') + '</div>')
		segmentTitle.appendTo('body');
		
		$(this).mousemove(function(event) {
			$('.segmentTitle').each(function() {
				if (this != segmentTitle.get(0)) {
					$(this)
						.stop()
						.css('left', -9999)
						.css('top', -9999)
				}
			});
			
			segmentTitle
				.css('opacity', 1)
				.css('left', event.clientX - segmentTitle.outerWidth() / 2)
				.css('top', $(this).offset().top - segmentTitle.outerHeight() - 13)
		});
		
		$(this).mouseout(function() {
			segmentTitle.animate({opacity: 0}, 500, function() {
				$(this)
					.css('left', -9999)
					.css('top', -9999)
					.css('opacity', 0)
			});
		})
	});
	
	$('#timeline')
		.click(function(event) {
			initCanvas(event.clientX / $(this).width() * 410);
			
			return false;
		})

	$('h1').animate({marginTop: -190}, 600, function() {
		$('#timeline, #bestViewed, #part1, #part2, #buffering')
			.css('display', 'block')
			.animate({opacity: 1}, 1000, function() {
				setTimeout(checkSoundFileLoaded, 1000);
			})
	});
	
	$('#loading').animate({marginTop: 70, opacity: 0}, 600, function() {
		$(this).remove();
	});
	
	$('nav a').click(function(event) {
		event.stopPropagation();
	});
}

function checkSoundFileLoaded() {
	var music = document.getElementById('music');

	// Needed to kick IE 9 into realising that the audio has been downloaded, in conjunction with the oncanplaythrough handler in the HTML #mysteriousmysteriesoftheinternet
	try {
		music.buffered.end(0);
	}
	catch (error) {
	}

	if (canPlayThrough || music.readyState >= 4 || (FF3 && music.readyState >= 3)) {
		if ($('#button').hasClass('hidden')) {
			soundFileLoaded();
		}
	}
	else {
		setTimeout(checkSoundFileLoaded, 1000);
	}
}

function canIndeedPlayThrough() {
	canPlayThrough = true;
}

function soundFileLoaded() {
	$('#button')
		.click(function(event) {
			event.preventDefault();
		})
		.removeClass('hidden');

	$('body').click(function() {
		var music = document.getElementById('music');
		
		$('h1, #part1, #part2, #bestViewed, #buffering').animate({opacity: 0}, 700, function(){$(this).remove();});
		
		if (music.paused) {
			playMusic();
		}
		else {
			pauseMusic();
		}
	});
	
	$(window).resize(function() {
		if ($('canvas').length > 0) {
			var music = document.getElementById('music');
			
			$('canvas').remove();
			
			initCanvas(music.currentTime);
		}
	});
	
}

function playMusic() {
	if ($('canvas').length == 0) {
		initCanvas();
	}
	
	var music = document.getElementById('music');

	// Firefox can't handle the starField animation + the canvas
	if (typeof document.body.style.MozTransition != 'undefined') {
		clearTimeout(starFieldTimer);
		
		$('.starBlur').remove();
	}
	
	if (music.currentTime == 0 && $('#bass').length > 0) {
		$('#bass')
			.css('display', 'block')
			.animate({opacity: 1}, 500)
		
		setTimeout(function() {
			$('#mid')
				.css('display', 'block')
				.animate({opacity: 1}, 500)
		}, 1000);
		
		setTimeout(function() {
			$('#high')
				.css('display', 'block')
				.animate({opacity: 1}, 500, function() {
					setTimeout(function() {
						$('.eq').animate({opacity: 0}, 2000, function() {
							$(this).remove();
						});
					}, 1500);
				})
		}, 2000);
		
		setTimeout(function() {
			music.play();
		}, 2000);
	}
	else {
		music.play();
	}

	$('#button').addClass('playing');

	$('nav')
		.css('display', 'block')
		.animate({opacity: 1}, 12000)
}

function pauseMusic() {
	var music = document.getElementById('music');
	
	music.pause();

	$('#button').removeClass('playing');
}

function initCanvas(startTime) {
	if (startTime == null) {
		startTime = 0;
	}
	
	$('canvas, .title').remove();
	drawQueue = [];
	
	if (drawTimeout != null) {
		clearTimeout(drawTimeout);
	}
	
	HEIGHT = $(window).height() - $('#timeline').height() / 2;
//	WIDTH = $(window).width();
	WIDTH = HEIGHT;

	var canvas = $('<canvas></canvas>');
	canvas.get(0).width = WIDTH;
	canvas.get(0).height = HEIGHT;
	canvas
		.css('marginLeft', -WIDTH / 2)
		.appendTo('body');
	
	c = canvas.get(0).getContext('2d');
	
	for (var i = 0; i < data.length; i++) {
		drawQueue.push(new Ring(data[i].title, data[i].timecode.slice(0), i));
	}
	
	var music = document.getElementById('music');
	music.currentTime = startTime;
//	music.volume = 0;

	draw();
}

function draw() {
	c.clearRect(0, 0, WIDTH, HEIGHT);
	
	for (var i = drawQueue.length - 1; i >= 0; i--) {
		drawQueue[i].draw();
	}
	
	var music = document.getElementById('music');
	var time = $('#time');
	var timeString = music.currentTime;
	var minutes = Math.floor(music.currentTime / 60);
	var seconds = Math.floor(music.currentTime % 60);
	
	if (seconds < 10) {
		seconds = '0' + seconds;
	}

	if (music.currentTime > 410) {
		pauseMusic();
		
		$('canvas').remove();
		
		music.currentTime = 0;
	}
	
	time.html(minutes + ':' + seconds);
	
	$('#playhead').css('width', music.currentTime / 410 * 100 + '%');

	drawTimeout = setTimeout(draw, 1000 / FPS);
}

function Ring(title, data, order) {
	var titleElement = null;
	var originalOrder = order;
	var prevPoints = [];
	var radius = 0;
	setRadius();
	var radiusTimer = null;
	var circumference = 0;
	var color = COLORS[order % (COLORS.length - 1)];
	var INIT_TIME = 2000;
	var TITLE_OFFSET = 12;
	var ending = false;
	
	function changeOrder(newOrder) {
		order = newOrder;
		
		if (radiusTimer != null) {
			clearTimeout(radiusTimer);
		}
		
		setRadius();
	}
	
	function setRadius() {
		var MIN_RADIUS = 50;
		var RING_SIZE = Math.min(WIDTH, HEIGHT) / 28;
		
		var targetRadius = (order + 1) * RING_SIZE + MIN_RADIUS;
		
		if (radius == 0 || Math.round(radius) == targetRadius) {
			radius = targetRadius;
		}
		// Don't resize the very last songs
		else if ((originalOrder != 22 && originalOrder != 23 && originalOrder != 24) || document.getElementById('music').currentTime < 396) {
			radius += (targetRadius - radius) / 30;
			
			setTimeout(setRadius, 1000/FPS);
		}
	}
	
	function draw() {
		if (titleElement != null && titleElement != false) {
			titleElement
					.css('-webkit-transform', 'rotate(' + (originalOrder * 15) + 'deg) translateX(' + (radius + TITLE_OFFSET) + 'px)')
					.css('-moz-transform', 'rotate(' + (originalOrder * 15) + 'deg) translateX(' + (radius + TITLE_OFFSET) + 'px)')
					.css({msTransform: 'rotate(' + (originalOrder * 15) + 'deg) translateX(' + (radius + TITLE_OFFSET) + 'px)'})
					.css('transform', 'rotate(' + (originalOrder * 15) + 'deg) translateX(' + (radius + TITLE_OFFSET) + 'px)')
		}
		
		var VALUE_MULTIPLIER = Math.min(WIDTH, HEIGHT) / 20000;
		var RING_THICKNESS = 1.4;
		var CX = WIDTH/2;
		var CY = HEIGHT/2;
		var MAX_MOVE = 0.6;
		var BEZIER_WIDTH = radius * 0.05;
		
		var music = document.getElementById('music');
		var now = music.currentTime * 1000 + 60;
		
		if (data[data.length - 1].t > now) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].t > now) {
					break;
				}
			}
		}
		else {
			ending = true;
		}
		
		if (ending) {
			var allZeros = true;
			
			// Outer shape
			c.fillStyle = '#7f7f7f';
			c.globalCompositeOperation = 'source-over';
			c.beginPath();

			for (var j = 0; j < prevPoints.length; j++) {
				if (prevPoints[j].amp > 0) {
					allZeros = false;
				}
				
				var angle = Math.PI*2 / prevPoints.length * j + Math.PI/2;
				var newAmp = prevPoints[j].amp - MAX_MOVE;
			
				var x = CX + Math.cos(angle) * (radius + RING_THICKNESS / 2 + newAmp);
				var y = CY + Math.sin(angle) * (radius + RING_THICKNESS / 2 + newAmp);
				
				prevPoints[j] = {x: x, y: y, amp: newAmp};
	
				if (j == 0) {
					c.moveTo(x, y);
				}
				else {
					var prevAngle = Math.PI*2 / prevPoints.length * (j - 1) + Math.PI/2;
					var cp1x = prevPoints[j - 1].x + Math.cos(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp1y = prevPoints[j - 1].y + Math.sin(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp2x = x + Math.cos(angle - Math.PI / 2) * BEZIER_WIDTH;
					var cp2y = y + Math.sin(angle - Math.PI / 2) * BEZIER_WIDTH;
					c.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
				}
				
				if (j == prevPoints.length - 1) {
					var prevAngle = angle;
					var angle = Math.PI/2;
					var cp1x = x + Math.cos(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp1y = y + Math.sin(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp2x = prevPoints[0].x + Math.cos(angle - Math.PI / 2) * BEZIER_WIDTH;
					var cp2y = prevPoints[0].y + Math.sin(angle - Math.PI / 2) * BEZIER_WIDTH;
					c.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, prevPoints[0].x, prevPoints[0].y);
				}
			}
			
			if (allZeros && originalOrder != 24) {
				drawQueue.splice(order, 1);
				
				for (var j = order; j < drawQueue.length; j++) {
					drawQueue[j].changeOrder(j);
				}
			}
			else if (originalOrder == 24) {
				$('canvas').animate({opacity: 0}, 5000);
			}
			
			c.closePath();
			c.fill();
	
			// Inner shape
			c.fillStyle = BG_COLOR;
			c.globalCompositeOperation = 'xor';
			c.beginPath();
			
			for (var j = 0; j < prevPoints.length; j++) {
				var angle = Math.PI*2 / prevPoints.length * j + Math.PI/2;
				var newAmp = prevPoints[j].amp;
				
				var x = CX + Math.cos(angle) * (radius - RING_THICKNESS / 3 * 5 - newAmp);
				var y = CY + Math.sin(angle) * (radius - RING_THICKNESS / 3 * 5 - newAmp);
				
				prevPoints[j] = {x: x, y: y, amp: Math.max(0, newAmp)};
	
				if (j == 0) {
					c.moveTo(x, y);
				}
				else {
					var prevAngle = Math.PI*2 / prevPoints.length * (j - 1) + Math.PI/2;
					var cp1x = prevPoints[j - 1].x + Math.cos(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp1y = prevPoints[j - 1].y + Math.sin(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp2x = x + Math.cos(angle - Math.PI / 2) * BEZIER_WIDTH;
					var cp2y = y + Math.sin(angle - Math.PI / 2) * BEZIER_WIDTH;
					c.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
				}
	
				if (j == prevPoints.length - 1) {
					var prevAngle = angle;
					var angle = Math.PI/2;
					var cp1x = x + Math.cos(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp1y = y + Math.sin(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp2x = prevPoints[0].x + Math.cos(angle - Math.PI / 2) * BEZIER_WIDTH;
					var cp2y = prevPoints[0].y + Math.sin(angle - Math.PI / 2) * BEZIER_WIDTH;
					c.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, prevPoints[0].x, prevPoints[0].y);
				}
			}
			
			c.closePath();
			c.fill();
		}
		// Animate the initialisation line, INIT_TIME milliseconds before sound starts
		else if (i == 0 && data[0].t < now + INIT_TIME) {
			circumference = 1 - (data[0].t - now) / INIT_TIME;
			circumference = Math.min(1, circumference);
			// Draw line
			c.strokeStyle = color;
			c.lineWidth = RING_THICKNESS;
			c.globalCompositeOperation = 'source-over';
			c.beginPath();
			c.arc(CX, CY, radius - RING_THICKNESS/2, Math.PI/2 * circumference, Math.PI*2 * circumference + Math.PI/2 * circumference, false);
			c.stroke();
		}
		else if (i > 0) {
			if (titleElement == null) {
				titleElement = $('<div class="title"><span class="pointer"></span><span class="text">' + title + '</span></div>');
				
				if (originalOrder > 6 && originalOrder < 19) {
					titleElement.addClass('reverse');
				}
				
				titleElement
					.css('-webkit-transform', 'rotate(' + (originalOrder * 15) + 'deg) translateX(' + (radius + TITLE_OFFSET) + 'px)')
					.css('-moz-transform', 'rotate(' + (originalOrder * 15) + 'deg) translateX(' + (radius + TITLE_OFFSET) + 'px)')
					.css({msTransform: 'rotate(' + (originalOrder * 15) + 'deg) translateX(' + (radius + TITLE_OFFSET) + 'px)'})
					.css('transform', 'rotate(' + (originalOrder * 15) + 'deg) translateX(' + (radius + TITLE_OFFSET) + 'px)')
					.appendTo('body')
				
				titleElement.animate({opacity: 0}, 4000, function() {
					$(this).remove();
				});
			}
			
			var points = data[i - 1].p;
	
			// Outer shape
			c.fillStyle = color;
			c.globalCompositeOperation = 'source-over';
			c.beginPath();
			
			for (var j = 0; j < points.length; j++) {
				var angle = Math.PI*2 / points.length * j + Math.PI/2;
				var newAmp = points[j] * VALUE_MULTIPLIER;
				
				// If new movement is greater than MAX_MOVE, throttle it
				if (prevPoints[j] != null && prevPoints[j].amp > newAmp + MAX_MOVE) {
					newAmp = prevPoints[j].amp - MAX_MOVE;
				}
			
				var x = CX + Math.cos(angle) * (radius + newAmp);
				var y = CY + Math.sin(angle) * (radius + newAmp);
				
				prevPoints[j] = {x: x, y: y, amp: newAmp};
	
				if (j == 0) {
					c.moveTo(x, y);
				}
				else {
					var prevAngle = Math.PI*2 / points.length * (j - 1) + Math.PI/2;
					var cp1x = prevPoints[j - 1].x + Math.cos(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp1y = prevPoints[j - 1].y + Math.sin(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp2x = x + Math.cos(angle - Math.PI / 2) * BEZIER_WIDTH;
					var cp2y = y + Math.sin(angle - Math.PI / 2) * BEZIER_WIDTH;
					c.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
				}
				
				if (j == points.length - 1) {
					var prevAngle = angle;
					var angle = Math.PI/2;
					var cp1x = x + Math.cos(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp1y = y + Math.sin(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp2x = prevPoints[0].x + Math.cos(angle - Math.PI / 2) * BEZIER_WIDTH;
					var cp2y = prevPoints[0].y + Math.sin(angle - Math.PI / 2) * BEZIER_WIDTH;
					c.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, prevPoints[0].x, prevPoints[0].y);
				}
			}
			
			c.closePath();
			c.fill();

			// Inner shape
			c.fillStyle = BG_COLOR;
			c.globalCompositeOperation = 'xor';
			c.beginPath();
			
			for (var j = 0; j < points.length; j++) {
				var angle = Math.PI*2 / points.length * j + Math.PI/2;
				var newAmp = prevPoints[j].amp;
				
				var x = CX + Math.cos(angle) * (radius - RING_THICKNESS - newAmp);
				var y = CY + Math.sin(angle) * (radius - RING_THICKNESS - newAmp);
				
				prevPoints[j] = {x: x, y: y, amp: newAmp};
	
				if (j == 0) {
					c.moveTo(x, y);
				}
				else {
					var prevAngle = Math.PI*2 / points.length * (j - 1) + Math.PI/2;
					var cp1x = prevPoints[j - 1].x + Math.cos(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp1y = prevPoints[j - 1].y + Math.sin(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp2x = x + Math.cos(angle - Math.PI / 2) * BEZIER_WIDTH;
					var cp2y = y + Math.sin(angle - Math.PI / 2) * BEZIER_WIDTH;
					c.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
				}
	
				if (j == points.length - 1) {
					var prevAngle = angle;
					var angle = Math.PI/2;
					var cp1x = x + Math.cos(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp1y = y + Math.sin(prevAngle + Math.PI / 2) * BEZIER_WIDTH;
					var cp2x = prevPoints[0].x + Math.cos(angle - Math.PI / 2) * BEZIER_WIDTH;
					var cp2y = prevPoints[0].y + Math.sin(angle - Math.PI / 2) * BEZIER_WIDTH;
					c.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, prevPoints[0].x, prevPoints[0].y);
				}
			}
			
			c.closePath();
			c.fill();
			
			data.splice(0, i - 1);
		}
		
		// Sample has ended, remove ring
		if (data.length == 1) {
			ending = true;
		}
	}
	
	return {
		changeOrder: changeOrder,
		draw: draw
	}
}

function starField() {
	var MAX_CREATION_DELAY = 350;
	
	var random = Math.random();
	var starType = 3;
	
	if (random > 0.7) {
		starType = 1;
	}
	else if (random > 0.4) {
		starType = 2;
	}

	var starBlur = $('<div class="starBlur starBlur' + starType + '"></div>');
	
	var angle = Math.round(Math.random() * 360);
	
	starBlur
		.css('-webkit-transform', 'rotate(' + angle + 'deg) scale(0.001)')
		.css('-moz-transform', 'rotate(' + angle + 'deg) scale(0.001)')
		.css({msTransform: 'rotate(' + angle + 'deg) scale(0.001)'})
		.css('transform', 'rotate(' + angle + 'deg) scale(0.001)')
		.appendTo('body')
		
	setTimeout(function() {
		var maxDimension = Math.max($(window).width(), $(window).height()) * 0.65;
		var angleRads = angle / 180 * Math.PI;
		var translateX = Math.cos(angleRads) * maxDimension;
		var translateY = Math.sin(angleRads) * maxDimension;
		starBlur
			.css('-webkit-transform', 'translate(' + translateX + 'px, ' + translateY + 'px) rotate(' + angle + 'deg) scale(1)')
			.css('-moz-transform', 'translate(' + translateX + 'px, ' + translateY + 'px) rotate(' + angle + 'deg) scale(1)')
			.css({msTransform: 'translate(' + translateX + 'px, ' + translateY + 'px) rotate(' + angle + 'deg) scale(1)'})
			.css('transform', 'translate(' + translateX + 'px, ' + translateY + 'px) rotate(' + angle + 'deg) scale(1)')
		
		setTimeout(function() {
			starBlur.remove();
		}, 30000);
	}, 1);
	
	starFieldTimer = setTimeout(starField, Math.random() * MAX_CREATION_DELAY);
}
