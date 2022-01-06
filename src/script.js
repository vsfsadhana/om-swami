import './style.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import $ from 'jquery'
import Stats from 'three/examples/js/libs/stats.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap'
var Flickity = require('flickity');

let container, fov, controls, scene, camera, renderer, stats, gui, loadingManager, textureLoader;
let activeSection = 1;
let mouseX = 0;
let mouseY = 0;
let isReady = false;
let isMenu = false;
let isMusic = true;
let canScroll = true;
let transition;
let isAnimation;
let ts;
let isTween;
let isMobile;
let sceneGroup = [];
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
}
const transitionParams = {
	'transition': 1,
}
const clock = new THREE.Clock();
const perspective = 800
let windowHalfX = sizes.width / 2;
let windowHalfY = sizes.height / 2;

(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? isMobile = true : isMobile = false

$(window).on('load', function(){

	$.ready.then(function(){

		$('body').addClass('progress wait')

		appendImgs();

		// init();

		// animate();

	});

});

function appendImgs(){

	var appendBGs = $('body').find('.load_bg'),
		loaded = 0;

	appendBGs.each(function(i){

		var t = $(this),
			s = t.attr('data-src');

		t.css({ 'background-image': 'url('+ support_format_webp(s) +')' })

		$('<img src="'+ support_format_webp(s) +'">').on('load',function(){

			if(loaded == appendBGs.length - 1) {

				gsap.to('.clouds_set', 1, {autoAlpha: 1, ease: "power3.out", delay: 0.5, onComplete: fire})

			}

			loaded ++

		})

	});

};

function support_format_webp(img) {

	var elem = document.createElement('canvas')

	if (!!(elem.getContext && elem.getContext('2d'))) { return img.substr(0, img.lastIndexOf(".")) + ".webp" } else { return img}
}

function fire() {

	var fireTL = new gsap.timeline({delay: 0.5});

	fireTL

	.call(function(){

		$('body').removeClass('progress wait')

		$('.clouds').addClass('opened')

	})

	.from('.clouds .site_button', 1, {autoAlpha: 0, y: 140, ease: "power3.out"}, 0.5)

	.set('.cloud_text', {autoAlpha: 1}, 0.5)

	.staggerFrom('.cloud_text p span', 1, {autoAlpha: 0, y: 140, ease: "power3.out"}, 0.1, 0.5)

	.call(function(){

		$('body').addClass('progress')

		init();

		animate();

	})

	$('.clouds .site_button').click(function(){

		var vanishTL = new gsap.timeline();

		vanishTL

		.staggerTo('.cloud_text p span', 1, {autoAlpha: 0, y: -100, ease: "power3.out"}, 0.1, 0)

		.to('.clouds .site_button', 1, {autoAlpha: 0, ease: "power3.out"}, 0)

		.to('.clouds i', 2, {autoAlpha: 0, ease: "power3.out"}, 1)

		.from(camera.position, 2, {z: camera.position.z - 200, ease: "power3.out", onStart: function(){

			$('body').removeClass('progress')

			$('.clouds').addClass('vanish')

			isReady = true

		}}, 1)

		.to('.lb_set, header, .tip', 1, {autoAlpha: 1, ease: "power3.out"})

		.call(function(){

			$('.clouds').remove()

		})

	})

	if(isMobile) {
		$('.tip').html('Swipe to navigate')
	}
}

function init() {

	// initGUI();

	loadingManager = new THREE.LoadingManager()
	textureLoader = new THREE.TextureLoader(loadingManager)

	container = document.querySelector( '.container' );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( 1680, 946 );
	container.appendChild( renderer.domElement );
	fov = (180 * (2 * Math.atan(946 / 2 / perspective))) / Math.PI

	const sceneA = new FXScene( 0xedbda5, '1' );
	const sceneB = new FXScene( 0x4e6a73, '2' );

	transition = new Transition( sceneA, sceneB );

	// stats = new Stats();
	// document.body.appendChild( stats.dom );

	onWindowResize()

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

	var menuTL = new gsap.timeline({paused: true});

	menuTL

	.set('.menu_wrap', {autoAlpha: 1}, 0)

	.call(function(){

		$('header').removeClass('active')

	})

	.to('.menu_wrap > i', 0.5, {scaleY: 1, ease: "power3.inOut", onStart: function(){

		$('header').addClass('active')

	}}, 0)




	.set('.sub_nav', {autoAlpha: 1}, 0)

	.staggerFrom('.sub_nav ._ele', 0.5, {y: -30, autoAlpha: 0, ease: "power3.out"}, 0.05, 0.5)

	.staggerFrom('.menu_items li', 1, {x: 200, autoAlpha: 0, ease: "power3.out"}, 0.1, 0.5)

	.staggerFrom('.menu_items li ._ele', 1, {y: 50, autoAlpha: 0, ease: "power3.out"}, 0.1, 0.5)

	$('.menu_button').click(function(){

		if(!isMenu) {

			isMenu = true
			isReady = false
			menuTL.timeScale(1).play()
			$('header').addClass('opened')

		} else {

			isMenu = false
			isReady = true
			menuTL.timeScale(1.3).reverse()
			$('header').removeClass('opened')
		}

	})

	$('.equalizer').click(function(){

		if(!isMusic) {

			isMusic = true

			$(this).addClass('active')

		} else {

			isMusic = false
	
			$(this).removeClass('active')

		}

	})
}

function FXScene( clearColor, number ) {

	this.clearColor = clearColor;

	// Setup scene
	const scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( fov, 1680 / 946, 10, 10000 );
	camera.position.set( 0, 0, perspective );

	const renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
	this.fbo = new THREE.WebGLRenderTarget( 1680, 946, renderTargetParameters );

	sceneGroup[number] = new THREE.Group()
	scene.add( sceneGroup[number] );

	this.render = function ( delta, rtt ) {

		renderer.setClearColor( this.clearColor );

		if(!isAnimation && isReady) {
			camera.position.x += ( mouseX - camera.position.x ) * .05;
			camera.position.y += ( - mouseY - camera.position.y ) * .05;
		} else {
			if(!isTween) {
				isTween = true
				gsap.to(camera.position, 1, {x: 0, y: 0, ease: "power3.inOut"})
			}
		}
		camera.lookAt( new THREE.Vector3(0, 0, 0));

		if ( rtt ) {

			renderer.setRenderTarget( this.fbo );
			renderer.clear();
			renderer.render( scene, camera );

		} else {

			renderer.setRenderTarget( null );
			renderer.render( scene, camera );

		}

	};

	if(number == 2) {

		sceneGroup[3] = new THREE.Group()
		scene.add( sceneGroup[3] );

		controls = new OrbitControls( camera, renderer.domElement );
		controls.enabled = false

		initPlans()

	}

}

function initPlans() {

   let planes = [],
    	meshes = [],
    	textures = [],
    	materials = [],
		sceneOpacity = {
			sceneA : 1,
			sceneB : 1,
			sceneC : 0
		},
		filename;

    for( let i=1; i<=19; i++ ) {

    	planes[i] = new THREE.PlaneGeometry(1920 , 1080 );

		if(i <= 6 ) {
			filename = '1-' + i
		} else if(i > 6 && i <= 12 ) {
			filename = '2-' + i
		} else if(i > 12 && i <= 19 ) {
			filename = '3-' + i
		}
    	
    	textures[i] = textureLoader.load( support_format_webp('images/'+filename+'.png') );
		materials[i] = new THREE.MeshBasicMaterial({ map: textures[i], transparent: true });
    	meshes[i] = new THREE.Mesh( planes[i], materials[i] );

		if(i <= 6 ) {

		    sceneGroup[1].add( meshes[i] );
			meshes[i].material.opacity = sceneOpacity.sceneA

		} else if(i > 6 && i <= 12 ) {

			sceneGroup[2].add( meshes[i] );
			meshes[i].material.opacity = sceneOpacity.sceneB

		} else if(i > 12 && i <= 19 ) {

			sceneGroup[3].add( meshes[i] );
			meshes[i].material.opacity = sceneOpacity.sceneC
			if(sceneOpacity.sceneC == 0) {
				meshes[i].visible = false
			}
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


	var mainTL = new gsap.timeline({paused: true});

	var next = {

		sec2: function() { 

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale( 1.2 )

			.call(function(){

				setOpacity(2, 1)

				resetScene(2)

				transitionParams.transition = 1

				gsap.to('.lb_set, .tip', 0.5, {autoAlpha: 0, ease: "power3.out", onComplete: function(){

					$('.tip').remove();

					setText('Bestselling','Author', 'scene_a', 'scene_b')

				}}, 0)

			})

			.to(transitionParams, 2, {transition: 0, ease: "power3.inOut"}, 0)

			.to(sceneGroup[1].rotation, 2, {z: 0.1, ease: "power3.inOut"}, 0)

			.to(sceneGroup[1].position, 2, {z: 200, x: -500, ease: "power3.inOut"}, 0)

			.from(sceneGroup[2].position, 2, { x: 400, ease: "power3.inOut"}, 0)

			.from(sceneGroup[2].rotation, 2, {z: -0.2, ease: "power3.inOut"}, 0)

			.from(sceneGroup[2].position, 2, {y: 100, z: 220, ease: "power3.inOut"}, 0.8)

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

			.timeScale( 1.4 )

			.call(function(){

				isAnimation = true;

				setVis(3, true)

				gsap.to('.lb_set', 0.5, {autoAlpha: 0, ease: "power3.out", onComplete: function(){

					setText('Spiritual','Journey', 'scene_b', 'scene_c')

				}}, 0)

			})

			.to(sceneGroup[2].position, 2, {z: 300, ease: "power3.inOut"}, 0)

			.to(sceneGroup[2].position, 2, {y: 200, ease: "power3.inOut"}, 1)

			.to(sceneOpacity, 0.3, {sceneB: 0, ease: "power3.inOut", onUpdate: function(val){

				setOpacity(2, sceneOpacity.sceneB)

			}}, 1.7)

			.to(sceneOpacity, 0.3, {sceneC: 1, ease: "power3.inOut", onUpdate: function(val){

				setOpacity(3, sceneOpacity.sceneC)


			}}, 1.7)

			.call(function(){

				isAnimation = false

				isTween = false
			})


			.from(sceneGroup[3].position, 2, {y: -200, ease: "power3.inOut"}, 1)

			.fromTo(sceneGroup[3].position, 2, {z: 500}, {z: 5, ease: "power3.inOut"}, 2)

			.call(function(){

				gsap.to('.lb_set', 1, {autoAlpha: 1, ease: "power3.out"}, 0)

				setActive(3)

				setVis(2, false)

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

				gsap.to('.lb_set', 0.5, {autoAlpha: 0, ease: "power3.out", onComplete: function(){

					setText('Unconventional','Monk', 'scene_b', 'scene_a')

				}}, 0)

			})

			.to(transitionParams, 2, {transition: 1, ease: "power3.inOut"}, 0)

			.to(sceneGroup[2].position, 2, { x: 400, ease: "power3.inOut"}, 0)

			.to(sceneGroup[2].rotation, 2, {z: -0.2, ease: "power3.inOut"}, 0)

			.from(sceneGroup[1].position, 2, {z: 200, x: -500, ease: "power3.inOut"}, 0)

			.from(sceneGroup[1].rotation, 2, {z: -0.1, ease: "power3.inOut"}, 0)

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

				isAnimation = true;

				resetScene(2)

				setVis(2, true)

				gsap.to('.lb_set', 0.5, {autoAlpha: 0, ease: "power3.out", onComplete: function(){

					setText('Bestselling','Author', 'scene_c', 'scene_b')

				}}, 0)

			})


			.to(sceneGroup[3].position, 2, {z: 500, ease: "power3.inOut"}, 0)

			.to(sceneGroup[3].position, 2, {y: -200, ease: "power3.inOut"}, 1)

			.from(sceneGroup[2].position, 2, {y: 200, ease: "power3.inOut"}, 1)

			.to(sceneOpacity, 0.3, {sceneB: 1, ease: "power3.inOut", onUpdate: function(val){

				setOpacity(2, sceneOpacity.sceneB)

			}}, 1.7)

			.to(sceneOpacity, 0.3, {sceneC: 0, ease: "power3.inOut", onUpdate: function(val){

				setOpacity(3, sceneOpacity.sceneC)


			}}, 1.7)

			.call(function(){

				isAnimation = false

				isTween = false
			})

			.from(sceneGroup[2].position, 2, {z: 300, ease: "power3.inOut"}, 2)

			.call(function(){

				gsap.to('.lb_set', 1, {autoAlpha: 1, ease: "power3.out"}, 0)

				setActive(2)

				resetScene(3)

				setVis(3, false)

			})

		}

	}

	// gui.add(next, "sec2").name("To Sec 2");
	// gui.add(next, "sec3").name("To Sec 3");

	if(!isMobile) {

		$(window).on('mousewheel DOMMouseScroll', function (e) {

			if(canScroll) {

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

				ts = e.originalEvent.touches[0].clientY;

			}

		});

		$(window).on('touchend', function (e){

			if(canScroll) {

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


	function getSection(dir){

		if(dir == 'next') {

			if(activeSection == 1){

				next.sec2()

			} else if(activeSection == 2){

				next.sec3()

			} else {

				canScroll = true

			}

		} else {

			if(activeSection == 3){

				prev.sec2()

			} else if(activeSection == 2){

				prev.sec1()

			} else {

				canScroll = true

			}

		}

	}

}

function setActive(number) {

	activeSection = number;
	canScroll = true
}

function resetScene(number) {

	sceneGroup[number].rotation.set(0,0,0)
	sceneGroup[number].position.set(0,0,0)

}

function setText(a, b, oldClass, newClass) {

	$('.lb_text span').html(a)

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

function setVis(section, value){

	sceneGroup[section].traverse((child) => {

		if(child instanceof THREE.Mesh && child.material) {

			child.visible = value

		}
	})
}

function setOpacity(section, value){

	sceneGroup[section].traverse((child) => {

		if(child instanceof THREE.Mesh && child.material) {

			child.material.opacity = value

		}
	})

}

function onDocumentMouseMove( event ) {

	mouseX = ( event.clientX - windowHalfX ) / 10
	mouseY = ( event.clientY - windowHalfY ) / 10

}

function initGUI() {

	gui = new dat.GUI();

	gui.close()

	gui.add( transitionParams, 'transition', 0, 1, 0.01 ).listen();

}

function Transition( sceneA, sceneB ) {

	const scene = new THREE.Scene();

	const width = 1680;
	const height = 946;

	const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, - 10, 10 );

	const textures = textureLoader.load( support_format_webp('images/transition.png') );

	const material = new THREE.ShaderMaterial( {

		uniforms: {

			tDiffuse1: {
				value: null
			},
			tDiffuse2: {
				value: null
			},
			mixRatio: {
				value: 0.0
			},
			threshold: {
				value: 0.3
			},
			useTexture: {
				value: 1
			},
			tMixTexture: {
				value: textures
			}
		},
		vertexShader: [

			'varying vec2 vUv;',

			'void main() {',

			'vUv = vec2( uv.x, uv.y );',
			'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

			'}'

		].join( '\n' ),
		fragmentShader: [

			'uniform float mixRatio;',

			'uniform sampler2D tDiffuse1;',
			'uniform sampler2D tDiffuse2;',
			'uniform sampler2D tMixTexture;',

			'uniform int useTexture;',
			'uniform float threshold;',

			'varying vec2 vUv;',

			'void main() {',

			'	vec4 texel1 = texture2D( tDiffuse1, vUv );',
			'	vec4 texel2 = texture2D( tDiffuse2, vUv );',


			'	vec4 transitionTexel = texture2D( tMixTexture, vUv );',
			'	float r = mixRatio * (1.0 + threshold * 2.0) - threshold;',
			'	float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);',

			'	gl_FragColor = mix( texel1, texel2, mixf );',


			'}'

		].join( '\n' )

	} );

	const geometry = new THREE.PlaneGeometry( 1680, 946 );
	const mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	material.uniforms.tDiffuse1.value = sceneA.fbo.texture;
	material.uniforms.tDiffuse2.value = sceneB.fbo.texture;

	this.needsTextureChange = false;

	this.render = function ( delta ) {

		material.uniforms.mixRatio.value = transitionParams.transition;

		// Prevent render both scenes when it's not necessary
		if ( transitionParams.transition == 0 ) {

			sceneB.render( delta, false );

		} else if ( transitionParams.transition == 1 ) {

			sceneA.render( delta, false );

		} else {

			// When 0<transition<1 render transition between two scenes

			sceneA.render( delta, true );
			sceneB.render( delta, true );

			renderer.setRenderTarget( null );
			renderer.clear();
			renderer.render( scene, camera );

		}

	};

}


function onWindowResize() {

	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	if(sizes.width > 1680) {

		renderer.setSize( sizes.width, sizes.width / 1.7778 );

		camera.fov = (180 * (2 * Math.atan(((1680 - (sizes.width - 1680)) / 1.7778) / 2 / perspective))) / Math.PI

	} else {

		renderer.setSize( 1680, 946 );
		camera.fov = fov

	}

	windowHalfX = sizes.width / 2;
	windowHalfY = sizes.height / 2;

}

function animate() {


	requestAnimationFrame( animate );

	// stats.update();

	render();

}

function render() {

	transition.render( clock.getDelta() );

}