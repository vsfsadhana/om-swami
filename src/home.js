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
let isInit = false;
let isReady = false;
let isMenuClosed = true;
let isMenu = false;
let isDragging = false;
let canScroll = false;
let canRenderD = true;
let canRenderC = true;
let canRenderB = true;
let isMuted = false;
let isAudio = false;
let isFocus;
let audio;
let foucsTO;
let audioLevel = {
	val: 1
}
let opacityMesh;
let transition;
let transition2;
let siteIntrvl;
let imagesLoaded = false;
let ts;
let isMobile;
let sceneGroup = [];
let clock;
let perspective = 800
let meshT = 800
let ratio = {
	width: 1680,
	height: 946
}
let transitionParams = {
	'sceneC' : 1,
	'sceneD' : 1,
	'transition': 0,
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
		loaded = 0;

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

var glProgTL = new gsap.timeline({paused: true});

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

		transitionParams.transition = 1

		transitionParams.sceneC = 0

		canRenderC = false;

		canRenderD = false;

		setOpacity(3, 0)

		setOpacity(4, 0)

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

			// music()

			var vanishTL = new gsap.timeline();

			vanishTL

			.staggerTo('.cloud_text p > span > span', 1, {autoAlpha: 0, y: '-100%', ease: "power3.out"}, 0.1, 0)

			.to('.clouds .site_button', 1, {autoAlpha: 0, ease: "power3.out"}, 0)

			.to(opacityMesh.material, 2, {opacity: 0, ease: "power3.out"}, 1)

			.from(sceneGroup[1].position, 2, {z: 200, ease: "power3.out", onStart: function(){

				$('body').removeClass('progress')

				$('.clouds').addClass('vanish')

				isReady = true

			}}, 1)

			.to('.lb_set, header, .tip', 1, {autoAlpha: 1, ease: "power3.out"})

			.call(function(){

				$('.clouds').remove()

				opacityMesh.visible = false

				canScroll = true;

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

				if(!isDragging) {

					$('body').addClass('wait')

					openLink(link, $this.hasClass('main_logo'))
				}

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

	loadingManager.onLoad = function ( ) {

		imagesLoaded = true

	};

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

	const sceneA = new FXScene( 0x000000, '1' );
	const sceneB = new FXScene( 0x000000, '2' );
	const sceneC = new FXScene( 0x000000, '3' );
	const sceneD = new FXScene( 0x000000, '4' );

	const sceneEmpty = new FXScene2( 0x000000, '1' );
	const sceneMenu = new FXScene2( 0x000000, '2' );

	transition = new Transition( sceneA, sceneB, sceneC, sceneD );
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

	menuCur.on( 'scroll', function( event, progress ) {

		isDragging = true;

	});

	menuCur.on( 'dragStart', function( event, pointer ) {

		isDragging = true;

	});

	menuCur.on( 'settle', function( event, index ) {

		isDragging = false;

	})

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

	.to('.lb_set', 1, {autoAlpha: 0, ease: 'power3.inOut'}, 0)

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
			menuTL.play()
			$('header').addClass('opened')

		} else {

			isMenu = false
			isReady = true
			canScroll = true;
			menuTL.reverse()
			$('header').removeClass('opened')
		}

	})

	isInit = true;

	window.onblur = function(){

		if(foucsTO) { clearTimeout(foucsTO) }

		foucsTO = setTimeout(function () {

			isFocus = false;

		}, 250)

		if(isAudio && !isMuted) {
			audio.pause();
		}
	}

	window.onfocus = function(){

		if(foucsTO) { clearTimeout(foucsTO) }

		isFocus = true;
	
		if(isAudio && !isMuted) {
			audio.play();
		}
	}
}

function FXScene( clearColor, number ) {

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

			if(isReady) {
				// camera.position.x += ( mouseX - camera.position.x ) * .05;
				// camera.position.y += ( - mouseY - camera.position.y ) * .05;
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

	};

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

		scene.add( new THREE.Mesh( new THREE.PlaneGeometry( 1920 , 1080 ), new THREE.MeshBasicMaterial({ color: 0x040404 }) ) );

	}
}

function initPlans() {

	let planes = [],
		meshes = [],
		textures = [],
		materials = [],
		filename;

	for( let i=1; i<=20; i++ ) {

		planes[i] = new THREE.PlaneGeometry(1920 , 1080 );

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
			meshes[i].material.opacity = transitionParams.sceneC

		} else if( i > 19) {

			sceneGroup[4].add( meshes[i] );
			meshes[i].material.opacity = transitionParams.sceneD

		}

		if(i < 3) {

			setMesh(meshes[i], 200 * (i-1), 'pos')
			setMesh(meshes[i], 1 - (0.24 * (i - 1)), 'scale')

		} else {

			if(i == 5 || i == 3) {

				setMesh(meshes[i], 100 * (i), 'pos')
				setMesh(meshes[i], 0.87 - (0.12 * (i - 1)), 'scale')

			} else if(i == 4 || i == 10 || i == 15) {

				setMesh(meshes[i], 340, 'pos')
				setMesh(meshes[i], 0.59, 'scale')

			} else if(i == 6 || i == 11 || i == 17 || i == 18) {

				setMesh(meshes[i], 380, 'pos')
				setMesh(meshes[i], 0.54, 'scale')

			} else if(i == 8 || i == 14) {

				setMesh(meshes[i], 200, 'pos')
				setMesh(meshes[i], 0.76, 'scale')

			} else if(i == 9 || i == 16) {

				setMesh(meshes[i], 300, 'pos')
				setMesh(meshes[i], 0.63, 'scale')

			} else if(i == 12 || i == 19) {

				setMesh(meshes[i], 500, 'pos')
				setMesh(meshes[i], 0.39, 'scale')

			} else if(i == 13) {

				setMesh(meshes[i], 100, 'pos')
				setMesh(meshes[i], 0.87, 'scale')

			}

		}

	}

	opacityMesh = new THREE.Mesh( new THREE.PlaneGeometry(1920 , 1080 ), new THREE.MeshBasicMaterial({ color: 0x1F1F1F, transparent: true }) );
	setMesh(opacityMesh, 550, 'pos')
	setMesh(opacityMesh, 0.4, 'scale')
	sceneGroup[1].add(opacityMesh)

	var mainTL = new gsap.timeline({paused: true});

	var next = {

		sec2: function() { 

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			gsap.to('.lb_set', 0.5, {autoAlpha: 0, ease: "power3.out", onComplete: function(){

				// $('.tip').remove();

				setText('author.html','Author', 'scene_a', 'scene_b')

			}}, 0)

			mainTL

			.timeScale( 1.2 )

			.call(function(){

				setOpacity(2, 1)

				resetScene(2)

				transitionParams.transition = 1


			})

			.to(transitionParams, 2, {transition: 0, ease: 'power3.inOut'}, 0)

			.to(sceneGroup[1].rotation, 2, {z: 0.1, ease: 'power3.inOut'}, 0)

			.to(sceneGroup[1].position, 2, {z: 200, x: -500, ease: 'power3.inOut'}, 0)

			.from(sceneGroup[2].position, 2, { x: 400, ease: 'power3.inOut'}, 0)

			.from(sceneGroup[2].rotation, 2, {z: -0.2, ease: 'power3.inOut'}, 0)

			.from(sceneGroup[2].position, 2, {y: 100, z: 150, ease: 'power3.inOut'}, 0.8)

			.call(function(){

				gsap.to('.lb_set', 1, {autoAlpha: 1, ease: "power3.out"}, 0)

				setOpacity(1, 0)

				setActive(2)

			})

		},

		sec3: function() {

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale( 1.2 )

			.call(function(){

				canRenderC = true;

				gsap.to('.lb_set', 1, {autoAlpha: 0, ease: "power3.out", onComplete: function(){

					setText('journey.html','Journey', 'scene_b', 'scene_c')

				}}, 0)

			})

			.to(sceneGroup[2].position, 2, {z: 200, ease: 'power3.inOut'}, 0)

			.to(sceneGroup[2].position, 2, {y: 150, ease: 'power3.inOut'}, 1)

			.to(transitionParams, 1, {sceneC: 1, ease: 'power3.inOut', onUpdate: function(val){

				setOpacity(3, transitionParams.sceneC)


			}}, 1.5)

			.call(function(){

				canRenderB = false;

			})

			.from(sceneGroup[3].position, 2, {y: -150, ease: 'power3.inOut'}, 1)

			.fromTo(sceneGroup[3].position, 2, {z: 200}, {z: 5, ease: 'power3.inOut'}, 2.5)

			.call(function(){

				gsap.to('.lb_set', 1, {autoAlpha: 1, ease: "power3.out"}, 0)

				setActive(3)

			})

		},

		sec4: function() {

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale( 1.2 )

			.call(function(){

				canRenderD = true;

				gsap.to('.lb_set', 1, {autoAlpha: 0, ease: "power3.out", onComplete: function(){

					setText('entrepreneur.html','Entrepreneur', 'scene_c', 'scene_d')

				}}, 0)

			})


			.to(sceneGroup[3].position, 2, {z: 200, ease: 'power3.inOut'}, 0)

			.to(sceneGroup[3].position, 2, {x: -150, ease: 'power3.inOut'}, 1)

			.to(transitionParams, 1, {sceneD: 1, ease: 'power3.inOut', onUpdate: function(val){

				setOpacity(4, transitionParams.sceneD)


			}}, 1.5)

			.call(function(){

				canRenderC = false;

			})

			.from(sceneGroup[4].position, 2, {x: 250, ease: 'power3.inOut'}, 1)

			.fromTo(sceneGroup[4].position, 2, {z: 350}, {z: 5, ease: 'power3.inOut'}, 2.5)

			.call(function(){

				gsap.to('.lb_set', 1, {autoAlpha: 1, ease: "power3.out"}, 0)

				setActive(4)

			})

		},

		sec1: function() {

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale( 1.2 )

			.call(function(){

				gsap.to('.lb_set', 0.5, {autoAlpha: 0, ease: "power3.in", onComplete: function(){

					setText('author.html','Author', 'scene_a', 'scene_b')

				}}, 0)

			})

			.to(transitionParams, 0.5, {sceneD: 0, ease: 'power3.in', onUpdate: function(val){

				canRenderB = true;

				resetScene(1)
				resetScene(2)
				resetScene(3)
				resetScene(4)

				transitionParams.transition = 1

				setOpacity(4, transitionParams.sceneD)


			}}, 0)

			.to(transitionParams, 0.5, {sceneA: 1, ease: 'power3.out', onUpdate: function(val){

				setOpacity(1, transitionParams.sceneA)


			}}, 0.5)

			.call(function(){

				gsap.to('.lb_set', 1, {autoAlpha: 1, ease: "power3.out"}, 0)

				setOpacity(2, 0)

				setActive(1)

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

				setOpacity(1, 1)

				resetScene(1)

				transitionParams.transition = 0

				gsap.to('.lb_set', 1, {autoAlpha: 0, ease: "power3.out", onComplete: function(){

					setText('monk.html','Monk', 'scene_b', 'scene_a')

				}}, 0)

			})

			.to(transitionParams, 2, {transition: 1, ease: 'power3.inOut'}, 0)

			.to(sceneGroup[2].position, 2, { x: 400, ease: 'power3.inOut'}, 0)

			.to(sceneGroup[2].rotation, 2, {z: -0.2, ease: 'power3.inOut'}, 0)

			.from(sceneGroup[1].position, 2, {z: 200, x: -500, ease: 'power3.inOut'}, 0)

			.from(sceneGroup[1].rotation, 2, {z: -0.1, ease: 'power3.inOut'}, 0)

			.call(function(){

				gsap.to('.lb_set', 1, {autoAlpha: 1, ease: "power3.out"}, 0)

				setOpacity(2, 0)

				setActive(1)

			})
		},

		sec2: function() {

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale( 1.4 )

			.call(function(){

				canRenderB = true;

				resetScene(2)

				gsap.to('.lb_set', 0.5, {autoAlpha: 0, ease: "power3.out", onComplete: function(){

					setText('author.html','Author', 'scene_c', 'scene_b')

				}}, 0)

			})

			.to(sceneGroup[3].position, 2, {z: 200, ease: 'power3.inOut'}, 0)

			.to(sceneGroup[3].position, 2, {y: -150, ease: 'power3.inOut'}, 1)

			.from(sceneGroup[2].position, 2, {y: 150, ease: 'power3.inOut'}, 1)

			.to(transitionParams, 0.3, {sceneC: 0, ease: 'power3.inOut', onUpdate: function(val){

				setOpacity(3, transitionParams.sceneC)

			}}, 1.7)

			.from(sceneGroup[2].position, 2, {z: 200, ease: 'power3.inOut'}, 2)

			.call(function(){

				gsap.to('.lb_set', 1, {autoAlpha: 1, ease: "power3.out"}, 0)

				setActive(2)

				resetScene(3)

				canRenderC = false

			})

		},

		sec3: function() {

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale( 1.4 )

			.call(function(){

				canRenderC = true;

				resetScene(3)

				gsap.to('.lb_set', 0.5, {autoAlpha: 0, ease: "power3.out", onComplete: function(){

					setText('author.html','Author', 'scene_c', 'scene_b')

				}}, 0)

			})

			.to(sceneGroup[4].position, 2, {z: 200, ease: 'power3.inOut'}, 0)

			.to(sceneGroup[4].position, 2, {x: 250, ease: 'power3.inOut'}, 1)

			.from(sceneGroup[3].position, 2, {x: -150, ease: 'power3.inOut'}, 1)

			.to(transitionParams, 0.3, {sceneD: 0, ease: 'power3.inOut', onUpdate: function(val){

				setOpacity(4, transitionParams.sceneD)

			}}, 1.7)

			.from(sceneGroup[3].position, 2, {z: 200, ease: 'power3.inOut'}, 2)

			.call(function(){

				gsap.to('.lb_set', 1, {autoAlpha: 1, ease: "power3.out"}, 0)

				setActive(3)

				resetScene(4)

				canRenderD = false

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

			}

		});

		$(window).on('touchend', function (e){

			if(canScroll) {

				glProgTL.pause()

				var te = e.originalEvent.changedTouches[0].clientY;

				if(ts > te + 25){

					canScroll = false

					getSection('next')

				} else if(ts < te - 25){

					canScroll = false

					getSection('prev')

				}

			}

		});

	}

	glProgTL.fromTo('#gl_progress i', 8, {scaleX: 0}, {scaleX: 1, ease: "power0.none"})

	.call(function(){

		getSection('next')

	})

	function getSection(dir){

		if(dir == 'next') {

			if(activeSection == 1){

				next.sec2()

			} else if(activeSection == 2){

				next.sec3()

			} else if(activeSection == 3){

				next.sec4()

			} else if(activeSection == 4){

				// next.sec1()
				canScroll = true

			}

		} else {

			if(activeSection == 4){

				prev.sec3()

			} else if(activeSection == 3){

				prev.sec2()

			} else if(activeSection == 2){

				prev.sec1()

			} else if(activeSection == 1){

				// prev.sec4()
				canScroll = true

			}

		}

	}

}

function setActive(number) {

	activeSection = number;
	canScroll = true

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

	sceneGroup[section].traverse((child) => {

		if(child instanceof THREE.Mesh && child.material) {

			child.material.opacity = value

		}
	})

}

function initGUI() {

	gui = new dat.GUI();

	// gui.close()

	gui.add( transitionParams, 'transition', 0, 1, 0.01 ).listen();
	gui.add( transitionParams, 'transition2', 0, 1, 0.01 ).listen();

}

function Transition( sceneA, sceneB, sceneC, sceneD ) {

	const scene = new THREE.Scene();

	const textures = textureLoader.load( support_format_webp('images/transition.png') );

	const material = new THREE.ShaderMaterial(
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

	meshT = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), material );

	meshT.scale.set(sizes.width, sizes.height, 1)

	scene.add( meshT );

	material.uniforms.tDiffuse1.value = sceneA.fbo.texture;
	material.uniforms.tDiffuse2.value = sceneB.fbo.texture;

	this.needsTextureChange = false;

	this.render = function ( delta ) {

		material.uniforms.mixRatio.value = transitionParams.transition;

		if ( transitionParams.transition == 0 ) {

			if(canRenderB) {
				sceneB.render( delta, false );
			}

			if(canRenderC) {

				renderer.autoClear = false;
				renderer.clearDepth();
				sceneC.render( delta, false );

			}

			if(canRenderD) {

				renderer.autoClear = false;
				renderer.clearDepth();
				sceneD.render( delta, false );

			}

		} else if ( transitionParams.transition == 1 ) {

			sceneA.render( delta, false );

		} else {

			sceneA.render( delta, true );
			sceneB.render( delta, true );

			renderer.setRenderTarget( null );
			renderer.clear();
			renderer.render( scene, camera );

		}

	};

}

function Transition2( sceneEmpty, sceneMenu ) {

	const scene = new THREE.Scene();

	const textures = textureLoader.load( support_format_webp('images/transition2.png') );

	const material = new THREE.ShaderMaterial(
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

	const mesh = new THREE.Mesh( new THREE.PlaneGeometry( ratio.width, ratio.height ), material );

	scene.add( mesh );


	material.uniforms.tDiffuse1.value = sceneEmpty.fbo.texture;
	material.uniforms.tDiffuse2.value = sceneMenu.fbo.texture;

	this.needsTextureChange = false;

	this.render = function ( delta ) {

		material.uniforms.mixRatio.value = transitionParams.transition2;

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

	mouseX = ( event.clientX - (sizes.width/2) ) / 30
	mouseY = ( event.clientY - (sizes.height/2) ) / 30

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
		    camera.aspect = camera2.aspect = sizes.width/ (sizes.width / (ratio.width/ratio.height));
		    console.log('1')
		} else {
			renderer.setSize( sizes.width, sizes.height );
			renderer2.setSize( sizes.width, sizes.height );
		    camera.aspect = camera2.aspect = sizes.width/ sizes.height;
		    console.log('2')
		}

		meshT.scale.set(sizes.width, sizes.height, 1)
		camera.updateProjectionMatrix();
		camera2.updateProjectionMatrix();

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

	transition.render( clock.getDelta() );
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
