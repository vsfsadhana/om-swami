import './global.css'
import './home.css'
import * as THREE from 'three'
// import * as dat from 'dat.gui'
import $ from 'jquery'
// import Stats from 'three/examples/js/libs/stats.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
var Flickity = require('flickity');


let container, fov, controls, scene, camera, camera2, renderer, renderer2, stats, gui, loadingManager, textureLoader;
let activeSection = 1;
let mouseX = 0;
let mouseY = 0;
let mouseZ = 0;
let isInit = false;
let isReady = false;
let isMenuClosed = true;
let isMenu = false;
let isDragging = false;
let isExp = false;
let canScroll = false;
let canRenderA = true;
let canRenderB = false;
let canRenderC = false;
let canRenderD = false;
let isMuted = false;
let isAudio = false;
let isFocus;
let audio;
let audioIntrvl;
let foucsTO;
let audioLevel = {
	val: 1
}
let mainTL;
let isStopped;
let glProgTL;
let opacityMesh = [];
let transition = [];
let transition2;
let timer;
let siteIntrvl;
let imagesLoaded = false;
let ts;
let ts2;
let isMobile;
let sceneGroup = [];
let clock;
let perspective = 800
let ratio = {
	width: 1920,
	height: 1080
}
let glParams = {
	'transSceneA': 1,
	'transSceneB': 1,
	'transSceneC': 1,
}
let transitionParams = {
	'transition2': 0,
}
let sizes = {
	width: window.innerWidth,
	height: window.innerHeight
}
let vh = sizes.height * 0.01;
let lastWindowWidth = 0;
let vertexShader = `
	varying vec2 vUv;
	void main() {
		vUv = vec2( uv.x, uv.y );
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	}
`;
let fragmentShader = `
	uniform float mixRatio;
	uniform sampler2D tDiffuse1;
	uniform sampler2D tDiffuse2;
	uniform sampler2D tMixTexture;
	uniform int useTexture;
	uniform float threshold;
	varying vec2 vUv;
	void main() {
		vec4 texel1 = texture2D( tDiffuse1, vUv );
		vec4 texel2 = texture2D( tDiffuse2, vUv );
		vec4 transitionTexel = texture2D( tMixTexture, vUv );
		float r = mixRatio * (1.0 + threshold * 2.0) - threshold;
		float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);
		gl_FragColor = mix( texel1, texel2, mixf );
	}
`;
		
(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? isMobile = true : isMobile = false

$(window).on('load', function(){

	$.ready.then(function(){

		$('body').addClass('progress wait')

		if (isMobile == true) {

			$('body').addClass('isMobile');

		} else {

			$('body').addClass('isDesktop');

		};

		onWindowResize()

		appendImgs();

		// Temp

		// init();

		// animate();

		// $('body').removeClass('progress wait')

		// transitionParams.transition = 1

		// transitionParams.sceneC = 0

		// transitionParams.sceneD = 0

		// opacityMesh.material.opacity = 0

		// canRenderC = false;

		// canRenderD = false;

		// setOpacity(3, 0)

		// setOpacity(4, 0)

		// opacityMesh.visible = false

	});

})

function appendImgs(){

	var appendBGs = $('body').find('.load_bg'),
		altBGs = $('body').find('.load_bg_alt'),
		loaded = 0;

	altBGs.each(function(i){

		var t = $(this),
			s = t.attr('data-src');

		t.css({ 'background-image': 'url('+ support_format_webp(s) +')' })

		t.removeClass('load_bg_alt')

	});

	appendBGs.each(function(i){

		var t = $(this),
			s = t.attr('data-src');

		t.css({ 'background-image': 'url('+ support_format_webp(s) +')' })

		$('<img src="'+ support_format_webp(s) +'">').on('load',function(){

			if(loaded == appendBGs.length - 1) {

				init();

				gsap.to('.clouds_set', 1, {autoAlpha: 1, ease: "power3.out", delay: 0.5, onComplete: fire})

			}

			loaded ++

		})

	});

}

function support_format_webp(img) {

	var elem = document.createElement('canvas')

	if (!!(elem.getContext && elem.getContext('2d'))) { return img.substr(0, img.lastIndexOf(".")) + ".webp" } else { return img}
}


function fire() {

	var fireTL = new gsap.timeline();
	var loadedTL = new gsap.timeline({paused: true});

	fireTL

	.call(function(){

		$('body').removeClass('progress')

		$('.clouds').addClass('opened')

	})

	.to('.spinner', 1, {autoAlpha: 1, ease: "power3.out"}, 1)

	.set('.cloud_text', {autoAlpha: 1}, 1)

	.staggerFrom('.cloud_text p > span > span', 1, {autoAlpha: 0, y: '100%', ease: "power3.out"}, 0.1, 1)

	.call(function(){

		$('body').addClass('progress')

		$('header').addClass('loaded')

		animate()

		onWindowResize()

		siteIntrvl = setInterval(function () {

			if(imagesLoaded) {

				clearInterval(siteIntrvl);

				loadedTL.play()
			};

		}, 50);

	})

	loadedTL.to('.spinner', 0.5, {autoAlpha: 0, ease: "power3.out"}, 0)

	.from('.clouds .site_button', 1, {autoAlpha: 0, y: 140, ease: "power3.out"}, 0.5)

	.call(function(){

		$('body').removeClass('wait')

	})



	$('.clouds .site_button').click(function(){

		if(!$('body').hasClass('wait')) {

			$(this).addClass('active')

			music()

			var vanishTL = new gsap.timeline();

			vanishTL

			.staggerTo('.cloud_text p > span > span', 1, {autoAlpha: 0, y: '-100%', ease: "power3.out"}, 0.1, 0)

			.to('.clouds .site_button', 1, {autoAlpha: 0, ease: "power3.out"}, 0)

			.to(opacityMesh[1].material, 2, {opacity: 0, ease: "power3.out"}, 1)

			.from(sceneGroup[1].position, 2, {z: 200, ease: "power3.out", onStart: function(){

				$('body').removeClass('progress')

				$('.clouds').addClass('vanish')

			}}, 1)

			.call(function(){

				isReady = true

				isExp = true

				$('.clouds').remove()

				opacityMesh[1].visible = false

				canScroll = true;

			})

			.to('.lb_set, header, .tip', 1, {autoAlpha: 1, ease: "power3.out"})

			.call(function(){

				glProgTL.play()

			})
		}

	})

	$('a').on('click', function () {

		let $this = $(this),
			link = $this.attr('href');

		if($('body').hasClass('wait')) {

			return false;

		} else {

			if(!$this.attr('target')) {

				$('body').addClass('wait')

				openLink(link, $this.hasClass('main_logo'))

				return false;

			}

		}

	})

	if(isMobile) {
		$('.tip > span').html('Swipe to navigate')
	} else {

		let cerchio = document.querySelectorAll('.mg');

		cerchio.forEach(function(elem){
			$(document).on('mousemove', function(e){
				magnetize(elem, e);
			});
		})

		function magnetize(el, e){

			var getx = e.pageX,
				getY = e.pageY;

			const item = $(el);
			const customDist = item.data('dist') * 20 || 120;
			const centerX = item.offset().left + (item.width()/2);
			const centerY = item.offset().top + (item.height()/2);

			var deltaX = Math.floor((centerX - getx)) * -0.45;
			var deltaY = Math.floor((centerY - getY)) * -0.45;

			var distance = calculateDistance(item, getx, getY);

			if(distance < customDist){

				if(item.hasClass('mg')) {
					gsap.to(item, 0.5, {y: deltaY, x: deltaX, scale:1.1});
					item.addClass('magnet');
				}

			} else {
				gsap.to(item, 0.6, {y: 0, x: 0, scale:1});
				item.removeClass('magnet');
			}
		}

		function calculateDistance(elem, mouseX, mouseY) {
			return Math.floor(Math.sqrt(Math.pow(mouseX - (elem.offset().left+(elem.width()/2)), 2) + Math.pow(mouseY - (elem.offset().top+(elem.height()/2)), 2)));
		}

		function lerp(a, b, n) {
			return (1 - n) * a + n * b
		}


	}
}

function flickity_handle_wheel_event(e, flickity_instance) {

	var normalized;

	if (event.wheelDelta) {

		normalized = (event.wheelDelta % 120 - 0) == -0 ? event.wheelDelta / 120 : event.wheelDelta / 12;

	} else {

		var rawAmmount = event.deltaY ? event.deltaY : event.detail;

		normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);

	}

	normalized < 0 ? flickity_instance.next() : flickity_instance.previous();

	isDragging = false;

}

function init() {

	// initGUI();

	clock = new THREE.Clock();
	loadingManager = new THREE.LoadingManager()
	textureLoader = new THREE.TextureLoader(loadingManager)

	loadingManager.onLoad = function() { imagesLoaded = true }

	container = document.querySelector( '.container' );

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( ratio.width, ratio.height );
	container.appendChild( renderer.domElement );

	renderer2 = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer2.setPixelRatio( window.devicePixelRatio );
	renderer2.setSize( ratio.width, ratio.height );
	container.appendChild( renderer2.domElement );

	fov = (180 * (2 * Math.atan(ratio.height / 2 / perspective))) / Math.PI

	const sceneA = new FXScene(1);
	const sceneB = new FXScene(2);
	const sceneC = new FXScene(3);
	const sceneD = new FXScene(4);

	const sceneEmpty = new FXScene2( 0x000000, '1' );
	const sceneMenu = new FXScene2( 0x000000, '2' );

	transition[0] = new Transition( sceneA, sceneB, 0 );
	transition[1] = new Transition( sceneB, sceneC, 1 );
	transition[2] = new Transition( sceneC, sceneD, 2 );
	transition2 = new Transition2( sceneEmpty, sceneMenu );

	// stats = new Stats();
	// document.body.appendChild( stats.dom );

	window.addEventListener( 'resize', onWindowResize );
	document.addEventListener( 'mousemove', onDocumentMouseMove );

	var menuCur = new Flickity( '.menu_items nav', {
		prevNextButtons: false,
		accessibility: true,
		pageDots: false,
		percentPosition: false,
		cellAlign: 'left',
		contain: true
	});

	document.onwheel = function(e) {
		if(isMenu) {
			flickity_handle_wheel_event(e, menuCur);
		}
	}

	menuCur.on('dragStart', () => menuCur.slider.childNodes.forEach(slide => slide.style.pointerEvents = "none") );
	menuCur.on('dragEnd', () => menuCur.slider.childNodes.forEach(slide => slide.style.pointerEvents = "all") );

	var menuTL = new gsap.timeline({paused: true});

	menuTL

	.set('.menu_wrap', {autoAlpha: 1}, 0)

	.call(function(){

		isMenuClosed = true

		$('.menu_items').removeClass('ready')

	})

	.call(function(){

		isMenuClosed = false

	})

	.to('.lb_inner, .tip', 1, {autoAlpha: 0, ease: 'power3.inOut'}, 0)

	.to(transitionParams, 2, {transition2: 1, ease: 'power3.inOut'}, 0)

	.set('.sub_nav', {autoAlpha: 1}, 0)

    .staggerFrom('.sub_nav ._ele', 0.5, {y: 30, autoAlpha: 0, ease: "power3.out"}, 0.05, 1)

	.call(function(){

		$('.menu_items').addClass('ready')

	})

    .staggerFrom('.menu_items li a', 0.7, {x: 200, autoAlpha: 0, ease: "power3.out"}, 0.1, 0.8)

    .staggerFrom('.menu_items li ._ele', 0.7, {y: 50, autoAlpha: 0, ease: "power3.out"}, 0.1, 0.8)

	$('.isDesktop .menu_items a').on('mousemove', function(){

		if($('.menu_items').hasClass('ready')) {

			$('.menu_items, .menu_items li').removeClass('hover')

			$(this).closest('li').addClass('hover active')

			$('.menu_items').addClass('hover active')
		}

	}).on('mouseleave', function(){

		let $this = $(this);

		clearTimeout(window.menuTimer);

		window.menuTimer = setTimeout(function(){

			if(!$this.hasClass('active')) {

				$this.closest('li').removeClass('hover')

			}

			if( $('li.active').length == 0 ) {

				$('.menu_items').removeClass('hover')

			}

		}, 300);

		$('.menu_items, .menu_items li').removeClass('active')

	})


	$('.menu_button').click(function(){

		if(!isMenu) {

			isMenuClosed = false
			isMenu = true
			isReady = false
			canScroll = false;
			glProgTL.pause()
			menuTL.play()
			$('header').addClass('opened')
			$('.lb_set').css('pointer-events', 'none')

		} else {

			isMenu = false
			isReady = true
			canScroll = true;
			menuTL.reverse()
			glProgTL.play()
			$('header').removeClass('opened')
			$('.lb_set').css('pointer-events', 'all')
		}

	})

	isInit = true;

	window.onblur = function(){

		if(audioIntrvl) {clearInterval(audioIntrvl)}

		audioIntrvl = setInterval(function () {

			audioLevel.val -= 0.1

			if(audioLevel.val <= 0) {

				audioLevel.val = 0

				clearInterval(audioIntrvl);

			} else {

				if(audioLevel.val >= 0 &&  audioLevel.val <= 1) {

					if(audio) { audio.volume = parseFloat((audioLevel.val).toFixed(2)) }
				}
			}

		}, 100)

	}

	window.onfocus = function(){
	
		if(audioIntrvl) {clearInterval(audioIntrvl)}

		audioIntrvl = setInterval(function () {

			audioLevel.val += 0.1

			if(audioLevel.val >= 1) {

				audioLevel.val = 1

				clearInterval(audioIntrvl);

			} else {

				if(audioLevel.val >= 0 &&  audioLevel.val <= 1) {

					if(audio) { audio.volume = parseFloat((audioLevel.val).toFixed(2)) }

				}
			}

		}, 100)

	}

}

function FXScene( number ) {

	const scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( fov, ratio.width / ratio.height, 10, 10000 );
	camera.position.set( 0, 0, perspective );

	const renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
	this.fbo = new THREE.WebGLRenderTarget( ratio.width, ratio.height, renderTargetParameters );

	sceneGroup[number] = new THREE.Group()
	scene.add( sceneGroup[number] );

	this.render = function ( delta, rtt ) {

		camera.lookAt( new THREE.Vector3(0, 0, 0));

		if(transitionParams.transition2 < 1) {

			if(isExp && !isMobile) {
				camera.position.z += ( mouseZ - camera.position.z ) * .05;
				camera.position.x += ( mouseX - camera.position.x ) * .05;
				camera.position.y += ( - mouseY - camera.position.y ) * .05;
			}

			if ( rtt ) {

				renderer.setRenderTarget( this.fbo );
				renderer.clear();
				renderer.render( scene, camera );

			} else {

				renderer.setRenderTarget( null );
				renderer.render( scene, camera );

			}

		}

	}

	if(number == 4) {

		controls = new OrbitControls( camera, renderer.domElement );
		controls.enabled = false

		initPlans()

	}

}

function FXScene2( clearColor, number ) {

	const scene = new THREE.Scene();
	camera2 = new THREE.PerspectiveCamera( fov, ratio.width / ratio.height, 10, 10000 );
	camera2.position.set( 0, 0, perspective );

	const renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
	this.fbo = new THREE.WebGLRenderTarget( ratio.width, ratio.height, renderTargetParameters );

	this.render = function ( delta, rtt ) {

		camera2.lookAt( new THREE.Vector3(0, 0, 0));

		if ( rtt ) {

			renderer2.setRenderTarget( this.fbo );
			renderer2.clear();
			renderer2.render( scene, camera2 );

		} else {

			renderer2.setRenderTarget( null );
			renderer2.render( scene, camera2 );

		}

	};

	if(number == 1){

		scene.add( new THREE.Mesh( new THREE.PlaneGeometry( ratio.width , ratio.height ), new THREE.MeshBasicMaterial({ color: 0x040404 }) ) );

	}
}

function initPlans() {

	let planes = [],
		meshes = [],
		textures = [],
		materials = [],
		filename;

	for( let i=1; i<=25; i++ ) {

		planes[i] = new THREE.PlaneGeometry(ratio.width , ratio.height );

		if(i <= 6 ) {
			filename = '1-' + i
		} else if(i > 6 && i <= 12 ) {
			filename = '2-' + i
		} else if(i > 12 && i <= 19 ) {
			filename = '3-' + i
		} else {
			filename = '4-' + i
		}
    	
    	textures[i] = textureLoader.load( support_format_webp('images/'+filename+'.png') );
		materials[i] = new THREE.MeshBasicMaterial({ map: textures[i], transparent: true });
		meshes[i] = new THREE.Mesh( planes[i], materials[i] );

		if(i <= 6 ) {

		    sceneGroup[1].add( meshes[i] );

		} else if(i > 6 && i <= 12 ) {

			sceneGroup[2].add( meshes[i] );

		} else if(i > 12 && i <= 19 ) {

			sceneGroup[3].add( meshes[i] );

		} else if( i > 19) {

			sceneGroup[4].add( meshes[i] );

		}

		if(i < 3) {

			setMesh(meshes[i], 200 * (i-1), 'pos')
			setMesh(meshes[i], 1 - (0.24 * (i - 1)), 'scale')

		} else {

			if(i == 5 || i == 3) {

				setMesh(meshes[i], 100 * (i), 'pos')
				setMesh(meshes[i], 0.87 - (0.12 * (i - 1)), 'scale')

			} else if(i == 13 || i == 20) {

				setMesh(meshes[i], 100, 'pos')
				setMesh(meshes[i], 0.87, 'scale')

			} else if(i == 8 || i == 14) {

				setMesh(meshes[i], 200, 'pos')
				setMesh(meshes[i], 0.76, 'scale')

			} else if(i == 9 || i == 16 || i == 21) {

				setMesh(meshes[i], 300, 'pos')
				setMesh(meshes[i], 0.63, 'scale')

			} else if(i == 4 || i == 10 || i == 15) {

				setMesh(meshes[i], 340, 'pos')
				setMesh(meshes[i], 0.59, 'scale')

			} else if(i == 6 || i == 11 || i == 17 || i == 18 || i == 22) {

				setMesh(meshes[i], 380, 'pos')
				setMesh(meshes[i], 0.54, 'scale')

			} else if(i == 23) {

				setMesh(meshes[i], 460, 'pos')
				setMesh(meshes[i], 0.46, 'scale')

			} else if(i == 12 || i == 19 || i == 24) {

				setMesh(meshes[i], 500, 'pos')
				setMesh(meshes[i], 0.39, 'scale')

			} else if(i == 25) {

				setMesh(meshes[i], 540, 'pos')
				setMesh(meshes[i], 0.35, 'scale')

			}

		}

	}

	for( let i=1; i<=2; i++ ) {

		opacityMesh[i] = new THREE.Mesh( new THREE.PlaneGeometry(ratio.width , ratio.height ), new THREE.MeshBasicMaterial({ color: 0x1F1F1F, transparent: true }) );
		setMesh(opacityMesh[i], 550, 'pos')
		setMesh(opacityMesh[i], 0.4, 'scale')
		if(i == 2) {
			opacityMesh[i].visible = false
			opacityMesh[i].material.opacity = 0
		}
	}

	sceneGroup[1].add(opacityMesh[1])
	sceneGroup[4].add(opacityMesh[2])

	glProgTL = new gsap.timeline({paused: true})

	glProgTL.fromTo('#gl_progress i', 8, {scaleX: 0}, {scaleX: 1, ease: "power0.none"})

	.call(function(){

		getSection('next')

	})

	var next = {

		sec2: function() { 

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale(1.3)

			.call(function(){

				resetScene(2)

				canRenderA = true

				glParams.transSceneA = 1

			})

			.to('.lb_set', 1, {autoAlpha: 0, ease: 'power3.out'}, 0)

			.call(function(){

				setText('author','Author', 'scene_a', 'scene_b')

			})

			.to('#gl_progress i', 2, {scaleX: 1, ease: "power3.inOut"}, 0)

			.to(sceneGroup[1].position, 2, {y: 30, z: 70, ease: 'power3.inOut'}, 0)

			.to(sceneGroup[1].rotation, 2, {z: 0.1, ease: 'power3.inOut'}, 1)

			.to(sceneGroup[1].position, 2, {x: -200, ease: 'power3.inOut'}, 1)

			.to(glParams, 2, {transSceneA: 0, ease: 'power3.inOut'}, 1)

			.from(sceneGroup[2].position, 2, { x: 200, ease: 'power3.inOut'}, 1)

			.from(sceneGroup[2].rotation, 2, {z: -0.15, ease: 'power3.inOut'}, 1)

			.from(sceneGroup[2].position, 2, {y: 30, z: 70, ease: 'power3.inOut'}, 2)

			.to('#gl_progress i', 2, {scaleX: 0, ease: "power3.inOut"}, 2)

			.call(function(){

				canRenderA = false
				canRenderB = true
				setActive(2)

			})

			.to('.lb_set', 2, {autoAlpha: 1, ease: 'power3.out'}, 3)

			.call(function(){

				bind()

			})

		},

		sec3: function() {

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale(1.3)

			.call(function(){

				resetScene(3)

				canRenderB = true

				glParams.transSceneB = 1

			})

			.to('.lb_set', 1, {autoAlpha: 0, ease: 'power3.out'}, 0)

			.call(function(){

				setText('journey','Journey', 'scene_b', 'scene_c')

			})

			.to('#gl_progress i', 2, {scaleX: 1, ease: "power3.inOut"}, 0)

			.to(sceneGroup[2].position, 2, {y: 30, z: 70, ease: 'power3.inOut'}, 0)

			.to(sceneGroup[2].rotation, 2, {z: 0.1, ease: 'power3.inOut'}, 1)

			.to(sceneGroup[2].position, 2, {x: -200, ease: 'power3.inOut'}, 1)

			.to(glParams, 2, {transSceneB: 0, ease: 'power3.inOut'}, 1)

			.from(sceneGroup[3].position, 2, { x: 200, ease: 'power3.inOut'}, 1)

			.from(sceneGroup[3].rotation, 2, {z: -0.15, ease: 'power3.inOut'}, 1)

			.from(sceneGroup[3].position, 2, {y: 30, z: 70, ease: 'power3.inOut'}, 2)

			.to('#gl_progress i', 2, {scaleX: 0, ease: "power3.inOut"}, 2)

			.call(function(){

				canRenderB = false
				canRenderC = true
				setActive(3)

			})

			.to('.lb_set', 2, {autoAlpha: 1, ease: 'power3.out'}, 3)

			.call(function(){

				bind()

			})

		},

		sec4: function() {

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale(1.3)

			.call(function(){

				resetScene(4)

				canRenderC = true

				glParams.transSceneC = 1

			})

			.to('.lb_set', 1, {autoAlpha: 0, ease: 'power3.out'}, 0)

			.call(function(){

				setText('entrepreneur','Entrepreneur', 'scene_c', 'scene_d')

			})

			.to('#gl_progress i', 2, {scaleX: 1, ease: "power3.inOut"}, 0)

			.to(sceneGroup[3].position, 2, {y: 30, z: 70, ease: 'power3.inOut'}, 0)

			.to(sceneGroup[3].rotation, 2, {z: 0.1, ease: 'power3.inOut'}, 1)

			.to(sceneGroup[3].position, 2, {x: -200, ease: 'power3.inOut'}, 1)

			.to(glParams, 2, {transSceneC: 0, ease: 'power3.inOut'}, 1)

			.from(sceneGroup[4].position, 2, { x: 200, ease: 'power3.inOut'}, 1)

			.from(sceneGroup[4].rotation, 2, {z: -0.15, ease: 'power3.inOut'}, 1)

			.from(sceneGroup[4].position, 2, {y: 30, z: 70, ease: 'power3.inOut'}, 2)

			.to('#gl_progress i', 2, {scaleX: 0, ease: "power3.inOut"}, 2)

			.call(function(){

				setActive(4)

			})

			.to('.lb_set', 2, {autoAlpha: 1, ease: 'power3.out'}, 3)

			.call(function(){

				bind()

			})

		},

		sec1: function() {

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale( 1.2 )

			.call(function(){

				canRenderC = true

				opacityMesh.forEach(function(e, i){
					e.visible = true
				})
			})

			.to('.lb_set', 1, {autoAlpha: 0, ease: 'power3.in'}, 0)

			.fromTo(opacityMesh[2].material, 1, {opacity: 0}, {opacity: 1, ease: 'power3.in'}, 0)

			.call(function(){

				setText('monk', 'Monk', 'scene_c', 'scene_a')

				resetScene(1)

				glParams.transSceneA = 1
				glParams.transSceneB = 1
				glParams.transSceneC = 1
				canRenderA = true
				canRenderB = false
				canRenderC = false

			})

			.fromTo(opacityMesh[1].material, 1, {opacity: 1}, {opacity: 0, ease: 'power3.out'})

			.call(function(){
				opacityMesh.forEach(function(e, i){
					e.visible = false
					e.material.opacity = 0
				})
			})

			.to('#gl_progress i', 2, {scaleX: 0, ease: "power3.inOut"}, 0)

			.call(function(){

				setActive(1)

			})

			.to('.lb_set', 2, {autoAlpha: 1, ease: 'power3.out'}, 2)

			.call(function(){

				bind()

			})

		}

	}


	var prev = {

		sec1: function() { 

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale( 1.2 )

			.call(function(){

				canRenderA = true
				canRenderB = false
				glParams.transSceneA = 0

				resetScene(1)

			})

			.to('.lb_set', 1, {autoAlpha: 0, ease: 'power3.out'}, 0)

			.call(function(){

				setText('monk','Monk', 'scene_b', 'scene_a')

			})

			.to('#gl_progress i', 2, {scaleX: 0, ease: "power3.inOut"}, 0)

			.to(glParams, 2, {transSceneA: 1, ease: 'power3.inOut'}, 0)

			.to('.lb_set', 2, {autoAlpha: 1, ease: 'power3.out'}, 1)

			.call(function(){

				setActive(1)

			})

		},

		sec2: function() {

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale( 1.2 )

			.call(function(){

				canRenderB = true
				canRenderC = false
				glParams.transSceneB = 0

				resetScene(2)

			})

			.to('.lb_set', 1, {autoAlpha: 0, ease: 'power3.out'}, 0)

			.call(function(){

				setText('author','Author', 'scene_c', 'scene_b')

			})

			.to('#gl_progress i', 2, {scaleX: 0, ease: "power3.inOut"}, 0)

			.to(glParams, 2, {transSceneB: 1, ease: 'power3.inOut'}, 0)

			.to('.lb_set', 2, {autoAlpha: 1, ease: 'power3.out'}, 1)

			.call(function(){

				setActive(2)

			})

		},

		sec3: function() {

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale( 1.2 )

			.call(function(){

				canRenderC = true

				resetScene(3)

			})

			.to('.lb_set', 1, {autoAlpha: 0, ease: 'power3.out'}, 0)

			.call(function(){

				setText('journey','Journey', 'scene_a', 'scene_c')

			})

			.to('#gl_progress i', 2, {scaleX: 0, ease: "power3.inOut"}, 0)

			.to(glParams, 2, {transSceneC: 1, ease: 'power3.inOut'}, 0)

			.to('.lb_set', 2, {autoAlpha: 1, ease: 'power3.out'}, 1)

			.call(function(){

				setActive(3)

			})

		},

		sec4: function() {

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale( 1.2 )

			.call(function(){
				opacityMesh.forEach(function(e, i){
					e.visible = true
				})
			})

			.to('.lb_set', 1, {autoAlpha: 0, ease: 'power3.in'}, 0)

			.fromTo(opacityMesh[1].material, 1, {opacity: 0}, {opacity: 1, ease: 'power3.in'}, 0)

			.to('#gl_progress i', 2, {scaleX: 0, ease: "power3.inOut"}, 0)

			.call(function(){

				setText('entrepreneur','Entrepreneur', 'scene_a', 'scene_d')

				resetScene(4)

				glParams.transSceneA = 1
				glParams.transSceneB = 1
				glParams.transSceneC = 0
				canRenderA = false
				canRenderB = false
				canRenderC = true

			})

			.fromTo(opacityMesh[2].material, 1, {opacity: 1}, {opacity: 0, ease: 'power3.out'}, 1)

			.call(function(){
				opacityMesh.forEach(function(e, i){
					e.visible = false
					e.material.opacity = 0
				})
			})

			.to('.lb_set', 2, {autoAlpha: 1, ease: 'power3.out'}, 2)

			.call(function(){

				setActive(4)

			})

		}
	}

	if(!isMobile) {

		$(window).on('mousewheel DOMMouseScroll', function (e) {

			if(canScroll) {

				glProgTL.pause()

				canScroll = false

				var direction = (function () {

					var delta = (e.type === 'DOMMouseScroll' ? e.originalEvent.detail * -40 : e.originalEvent.wheelDelta);

					return delta > 0 ? 0 : 1;

				}());

				if(direction === 1) {

					getSection('next')

				}

				if(direction === 0) {

					getSection('prev')

				}

			}

		});

	} else {

		$(window).on('touchstart', function (e){

			if(canScroll) {

				glProgTL.pause()

				ts = e.originalEvent.touches[0].clientY;
				ts2 = e.originalEvent.touches[0].clientX;

			}

		});

		$(window).on('touchend', function (e){

			if(canScroll) {

				glProgTL.pause()

				var te = e.originalEvent.changedTouches[0].clientY;
				var te2 = e.originalEvent.changedTouches[0].clientX;

				if(ts > te + 25 || ts2 > te2 + 25){

					canScroll = false

					getSection('next')

				} else if(ts < te - 25 || ts2 < te2 - 25){

					canScroll = false

					getSection('prev')

				}

			}

		});

	}

	function getSection(dir){

		isReady = false;

		if(dir == 'next') {

			console.log(activeSection)

			if(activeSection == 1){

				next.sec2()

			} else if(activeSection == 2){

				next.sec3()

			} else if(activeSection == 3){

				next.sec4()

			} else if(activeSection == 4){

				next.sec1()

			}

		} else {

			if(activeSection == 4){

				prev.sec3()

			} else if(activeSection == 3){

				prev.sec2()

			} else if(activeSection == 2){

				prev.sec1()

			} else if(activeSection == 1){

				prev.sec4()

			}

		}

	}

}

function bind() {
	canScroll = true
	isReady = true;
}

function setActive(number) {

	activeSection = number;

	$('#counter').html(activeSection + '/4')

	glProgTL.restart()

}

function resetScene(number) {

	sceneGroup[number].rotation.set(0,0,0)
	sceneGroup[number].position.set(0,0,0)

}

function setText(a, b, oldClass, newClass) {

	$('.lb_set').attr('href', a)

	$('.lb_text strong').html(b)

	$('.lb_set').removeClass(oldClass)

	$('.lb_set').addClass(newClass)

}

function setMesh(element, value, type) {

	if(type == 'pos') {

		element.position.z = value

	} else {

		element.scale.x = element.scale.y = element.scale.z = value

	}
}

function setOpacity(section, value){

	// sceneGroup[section].traverse((child) => {

	// 	if(child instanceof THREE.Mesh && child.material) {

	// 		child.material.opacity = value

	// 	}
	// })

}

function initGUI() {

	gui = new dat.GUI();

	// gui.close()

	gui.add( transitionParams, 'transition', 0, 1, 0.01 ).listen();
	gui.add( transitionParams, 'transition2', 0, 1, 0.01 ).listen();

}

function Transition( sceneA, sceneB ) {

	const scene = new THREE.Scene();

	const textures = textureLoader.load( support_format_webp('images/transition.png') );

	this.material = new THREE.ShaderMaterial({
		uniforms: {
			tDiffuse1: { value: null },
			tDiffuse2: { value: null },
			mixRatio: { value: 0.0 },
			threshold: { value: 0.1 },
			useTexture: { value: 1 },
			tMixTexture: { value: textures }
		},
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	});

	const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), this.material );

	mesh.scale.set(ratio.width, ratio.height, 1)

	scene.add( mesh );

	this.material.uniforms.tDiffuse1.value = sceneA.fbo.texture;
	this.material.uniforms.tDiffuse2.value = sceneB.fbo.texture;
	this.render = function ( delta ) {
		transition[0].material.uniforms.mixRatio.value = glParams.transSceneA;
		transition[1].material.uniforms.mixRatio.value = glParams.transSceneB;
		transition[2].material.uniforms.mixRatio.value = glParams.transSceneC;
		sceneA.render( delta, true );
		sceneB.render( delta, true );
		renderer.setRenderTarget( null );
		renderer.clear();
		renderer.render( scene, camera );
	};

}

function Transition2( sceneEmpty, sceneMenu ) {

	const scene = new THREE.Scene();

	const textures = textureLoader.load( support_format_webp('images/transition2.png') );

	this.material = new THREE.ShaderMaterial(
		{
			uniforms: {tDiffuse1: {value: null},
			tDiffuse2: {value: null},
			mixRatio: {value: 0.0},
			threshold: {value: 0.3},
			useTexture: {value: 1},
			tMixTexture: {value: textures}
		},
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	});

	const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), this.material );

	mesh.scale.set(ratio.width, ratio.height, 1)

	scene.add( mesh );


	this.material.uniforms.tDiffuse1.value = sceneEmpty.fbo.texture;
	this.material.uniforms.tDiffuse2.value = sceneMenu.fbo.texture;

	this.needsTextureChange = false;

	this.render = function ( delta ) {

		this.material.uniforms.mixRatio.value = transitionParams.transition2;

		if ( transitionParams.transition2 == 0 ) {

			sceneMenu.render( delta, false );

		} else {

			sceneEmpty.render( delta, true );
			sceneMenu.render( delta, false );
			renderer2.setRenderTarget( null );
			renderer2.clear();
			renderer2.render( scene, camera2 );


		}

	};

}

function onDocumentMouseMove( event ) {

	if(!isMobile) {

		isStopped = false;

		if(isReady) {

			mouseX = ( event.clientX - (sizes.width/2) ) / 50
			mouseY = ( event.clientY - (sizes.height/2) ) / 50
			mouseZ = (perspective-20)

		} else {

			mouseX = 0
			mouseY = 0
			mouseZ = perspective

		}

		if(timer) { clearTimeout(timer) }
		timer=setTimeout(function(){
			isStopped = true
			mouseX = 0
			mouseY = 0
			mouseZ = perspective
		},200)
	}
}

function openLink(url){

	$('body').append('<div class="siteLoader" style="background: #040404; position: fixed; width: 100vw; height: 100vh; z-index: 99999;visibility: hidden;"></div>')

	gsap.to(audioLevel, 0.5, {val: 0, onUpdate: function(){
		if(isAudio && !isMuted) {
			audio.volume = audioLevel.val
		}
	} });

	gsap.to('.siteLoader', 0.5, {autoAlpha: 1, ease: "power3.out", onComplete: function(){ setTimeout(function(){ location.href = url; }, 500) } });

}

function onWindowResize() {

	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	if(isInit) {

		if((sizes.width / sizes.height) > (ratio.width/ratio.height)){
			renderer.setSize( sizes.width, sizes.width / (ratio.width/ratio.height) );
			renderer2.setSize( sizes.width, sizes.width / (ratio.width/ratio.height) );
		} else {
			renderer.setSize( sizes.height * (ratio.width/ratio.height), sizes.height );
			renderer2.setSize( sizes.height * (ratio.width/ratio.height), sizes.height );
		}

	}

	vh = sizes.height * 0.01;

	if(isMobile) {

		if(sizes.width != lastWindowWidth) {

			$('body').addClass('progress');

			setH();

		}

	} else {

		setH();

		$('body').addClass('progress');

	}

	lastWindowWidth = sizes.width

	function setH(){

		document.documentElement.style.setProperty('--vh', `${vh}px`);

	}

	clearTimeout(window.resizedFinished);

	window.resizedFinished = setTimeout(function(){

		$('body').removeClass('progress');

	}, 500);

}

function animate() {

	requestAnimationFrame( animate );

	// stats.update();

	render();

}

function render() {

	if(canRenderA){
		transition[0].render( clock.getDelta() );
	}

	if(canRenderB){
		transition[1].render( clock.getDelta() );
	}

	if(canRenderC){
		transition[2].render( clock.getDelta() );
	}

	if(!isMenuClosed) {
		transition2.render( clock.getDelta() );
	}

}

function music(){

	audio = new Audio('music/music.mp3');
	audio.loop = true;

	const promise = audio.play();

	if(promise !== undefined){

		promise.then(() => {

			isAudio = true;

			isMuted = false;

			$('.equalizer').addClass('active')

		}).catch(error => {

		});
	}

	$('.equalizer').click(function(){

		if(!isMuted) {

			isMuted = true

			audio.pause();
	
			$(this).removeClass('active')

		} else {

			isMuted = false

			audio.play();

			$(this).addClass('active')

		}

	})
}