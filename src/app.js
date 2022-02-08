import './global.css'
import './app.css'
import * as THREE from 'three'
import $ from 'jquery'
// import Stats from 'three/examples/js/libs/stats.min.js'
import LocomotiveScroll from 'locomotive-scroll';
import AjaxPageLoader from '@lyssal/ajax-page-loader/lib/ajax-page-loader.amd';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import SplitText from "gsap/dist/SplitText";

import header from './includes/header.html'
import glHTML from './gl.html'
import monkHTML from './monk/template.html'
import authorHTML from './author/template.html'
import entrepreneurHTML from './entrepreneur/template.html'
import journeyHTML from './journey/template.html'
import contactHTML from './contact/template.html'
import faqHTML from './faq/template.html'

import monkContent1 from './monk/views1.html'
import monkContent2 from './monk/views2.html'
import monkContent3 from './monk/views3.html'
import monkContent4 from './monk/views4.html'

import enContent1 from './entrepreneur/black-lotus-app/views.html'
import enContent2 from './entrepreneur/serial-entrepreneur/views.html'
import enContent3 from './entrepreneur/sadhana-app/views.html'
import enContent4 from './entrepreneur/life-coaching/views.html'
import enContent5 from './entrepreneur/wildr/views.html'
import enContent6 from './entrepreneur/sri-badrika-ashram/views.html'

gsap.registerPlugin(SplitText)
gsap.config({ nullTargetWarn: false })

let container, fov, controls, scene, camera, camera2, renderer, renderer2, stats, gui, loadingManager, textureLoader;
let isMuted = true;
let isAudio = false;
let isFocus;
let audio;
let audioIntrvl;
let audioLevel = {
	val: 1
}
let mainTL;
let isStopped;
let isGL;
let glProgTL;
let opacityMesh = [];
let transition2;
let transition = [];
let timer;
let imagesLoaded = false;
let ts2;
let sceneGroup = [];
let clock;
let perspective = 800
let sizes = {
	width: window.innerWidth,
	height: window.innerHeight
}
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
	
var page = $('body').attr('id'),
	dataID = $('body').attr('data-id'),
	Flickity = require('flickity'),
	ajaxPageLoader,
	lastWindowWidth = 0,
	isPageReady = false,
	isColsFlickity = false,
	isDragging = false,

	activeGL = 1,
	mouseX = 0,
	mouseY = 0,
	mouseZ = 0,
	isInit = false,
	glActive = false,
	isReady = false,
	isExp = false,
	isMenuClosed = true,
	isMenu = false,
	canScroll = false,
	canRenderA = false,
	canRenderB = false,
	canRenderC = false,
	canRenderD = false,

	nGridWrap,
	nGrid,
	nGridInner,
	nGridSide,
	coords = [0,0],
	box_area = {x1:0, y1:0, x2:0, y2:0},
	buttonArea = {x1:0, y1:0, x2:0, y2:0},
	sideBox,
	sideBoxLeft,
	sideBoxTop,
	authorCarousel,
	contentTL,
	lastHovered = -1,
	mPadd = 60,
	damp = 20,
	mX = 0,
	mX2 = 0,
	posX = 0,
	mY = 0,
	mY2 = 0,
	posY = 0,
	next,
	prev,
	galW,
	galH,
	galSW,
	galSH,
	wDiff,
	hDiff,
	mmAA,
	mmAAr,
	mmBB,
	mmBBr,
	boxTL,
	eventFired = [],
	isClosed = true,
	authorStarted = false,
	fluid = true,
	isStep = false,
	canHover = false,
	canMove = false,
	canSwitch = true,
	canClose = false,
	inBound = false,
	isMouseIn = false,

	$imgs1,
	$imgs2,
	slidesTotal,
	slidesTL,
	activeSection,
	getActive,
	navCarousel,
	isClicked = false,
	isAnimation = false,
	canHideHeader = false,
	isButtonLoaded = false,
	isButtonHidden = false,
	loaded = false,
	pageTitle,
	splitWords = [],
	splitLines = [],

	isHorizontal,
	tabsCarousel,
	pos = { left: 0, x: 0 },
	current = false,
	isFirstBuild = true,
	isMouseDown = false,
	resizing = false,
	tagSection,

	labTL,
	enCarousel,
	lastActive = 1,
	isEntrepreneurActive = false,
	isFirstHover = true,

	ts,
	curX,
	curY,
	ajaxTL,
	menuTL,
	split0,
	split1,
	split2,
	splitDone = false,
	animationTL,
	scroll,
	scrollVal = 0,
	siteIntrvl,
	vh,
	isSafari,
	isMobile;

$('body').append(header);

switch(page) {
	case 'home':
	$('#page').append(glHTML);
	break;
	case 'monk':
	$('#page').append(monkHTML);
	break;
	case 'author':
	$('#page').append(authorHTML);
	break;
	case 'entrepreneur':
	$('#page').append(entrepreneurHTML);
	break;
	case 'journey':
	$('#page').append(journeyHTML);
	break;
	case 'contact':
	$('#page').append(contactHTML);
	break;
	case 'faq':
	$('#page').append(faqHTML);
	break;
}

if(page == 'entrepreneur-inner') {

	switch(dataID) {
		case '1':
		$('.reloadWrap').append(enContent1);
		break;
		case '2':
		$('.reloadWrap').append(enContent2);
		break;
		case '3':
		$('.reloadWrap').append(enContent3);
		break;
		case '4':
		$('.reloadWrap').append(enContent4);
		break;
		case '5':
		$('.reloadWrap').append(enContent5);
		break;
		case '6':
		$('.reloadWrap').append(enContent6);
		break;
	}

}
 
window.addEventListener('popstate', function(event) {

	window.location.href = window.location.pathname;

}, false);


(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? isMobile = true : isMobile = false

if(/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {isSafari = true;} else {isSafari = false;}

$(window).on('load', function(){

	$.ready.then(function(){

		if (isMobile == true) {

			$('body').addClass('isMobile');

		} else {

			$('body').addClass('isDesktop');

		};

		$('body').addClass('wait')

		if(page == 'home') {

			onWindowResize()

		} else {

			transitionParams.transition2 = 1

			isMenuClosed = false

			init();

			animate();

		}

		appendImgs(true);

	});

})

$.fn.isInViewport = function() {
	var elementTop = $(this).offset().top;
	var elementBottom = elementTop + $(this).outerHeight();
	var viewportTop = $(window).scrollTop();
	var viewportBottom = viewportTop + $(window).height();
	return elementBottom > viewportTop && elementTop < viewportBottom;
}

$.fn.isInViewportH = function() {
	var elementTop = $(this).offset().left;
	var elementBottom = elementTop + $(this).outerWidth();
	var viewportTop = $(window).scrollTop();
	var viewportBottom = viewportTop + $(window).width();
	return elementBottom > viewportTop && elementTop < viewportBottom;
}

function appendImgs(val){

	var appendBGs = $('body').find('.load_bg'),
		altBGs = $('body').find('.load_bg_alt'),
		iMGs = $('body').find('.load_img'),
		totalLoaded = 0;

	loaded = false

	altBGs.each(function(i){

		var t = $(this),
			s = t.attr('data-src');

		t.css({ 'background-image': 'url('+ support_format_webp(s) +')' })

		t.removeClass('load_bg_alt')

	});

	iMGs.each(function(i){

		var t = $(this),
			s = t.attr('data-src');

		t.removeAttr('data-src').attr("src", support_format_webp(s)).removeClass('load_img');

		t.removeClass('load_img')

		$('<img src="'+ support_format_webp(s) +'">').on('load',function(){

			if(page != 'home') {

				clearTimeout(window.scrollUpdate);

				window.scrollUpdate = setTimeout(function(){

					if(scroll) { scroll.update(); }

				}, 500)

			}

		})

	});

	appendBGs.each(function(i){

		var t = $(this),
		s = t.attr('data-src');

		t.css({ 'background-image': 'url('+ support_format_webp(s) +')' })

		$('<img src="'+ support_format_webp(s) +'">').on('load',function(){

			if(totalLoaded == appendBGs.length - 1) {

				appendBGs.removeClass('load_bg')

				if(val) {

					if(page == 'home') {

						init();

						gsap.to('.clouds_set', 1.5, {autoAlpha: 1, ease: "power3.out", delay: 0.5, onComplete: launchGL})

					} else {

						pageReady();

					}

				} else {

					if(page == 'home') {
						initGL()
					}
					loaded = true

				}

			}

			totalLoaded ++

		})

	});

	if(appendBGs.length == 0 && val) {

		pageReady()

	}

}

function pageReady() {

	gsap.to(transitionParams, 1, {transition2: 0, ease: 'power3.out', onComplete: function(){

		isPageReady = true

		$('body').removeClass('wait')

		$('header').addClass('loaded')

		animationTL.play()

	}}, 0)

	fire()

}

function launchGL(){

	activeSection = 1

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

		canRenderA = true

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

		animate()

		$('body').removeClass('wait')

	})


	$('.clouds .site_button').click(function(){

		if(!$('body').hasClass('wait')) {

			$(this).addClass('active')

			music()

			var vanishTL = new gsap.timeline();

			vanishTL

			.staggerTo('.cloud_text p > span > span', 1, {autoAlpha: 0, y: '-100%', ease: "power3.out"}, 0.05, 0)

			.to('.clouds .site_button', 1, {autoAlpha: 0, ease: "power3.out"}, 0)

			.to(opacityMesh[1].material, 3, {opacity: 0, ease: "power3.out"}, 1)

			.from(sceneGroup[1].position, 3, {z: 200, ease: "power3.out", onStart: function(){

				$('body').removeClass('progress')

				$('.clouds').addClass('vanish')

			}}, 1)

			.call(function(){

				isReady = true

				isExp = true

				glActive = true

				$('.clouds').remove()

				opacityMesh[1].visible = false

				canScroll = true;

			})

			.to('.lb_set, header, .tip', 1, {autoAlpha: 1, ease: "power3.out"}, 3)

			.call(function(){

				glProgTL.play()

			})
		}

	})

}

function fireGL(){

	activeSection = 1

	menu()

	canRenderA = true

	onWindowResize()

	opacityMesh[1].material.opacity = 0
	opacityMesh[1].visible = false

	glActive = true

	isReady = true

	isExp = true

	isMenu = false

	gsap.set($('.container > canvas').eq(1), {autoAlpha: 1})

	gsap.to(transitionParams, 1, {transition2: 0, ease: 'power3.out', delay: 1,

		onStart: function(){

			$('.siteLoader').remove()

		},
		onComplete: function(){

			gsap.to('.lb_set, .tip', 1, {autoAlpha: 1, ease: "power3.out"})

			glProgTL.play()

			canScroll = true;

			isMenuClosed = true

			$('body').removeClass('wait')

	}})

}

function fire(){

	if(page != 'journey') { buildScroll(true); }

	callPage()

	$('.siteLoader').remove();

	gsap.set('main, header', {autoAlpha: 1})

}

function support_format_webp(img) {

	var elem = document.createElement('canvas')

	if (!!(elem.getContext && elem.getContext('2d'))) { return img.substr(0, img.lastIndexOf(".")) + ".webp" } else { return img}

	return img
}


function menuGL() {

	container = document.querySelector( '.container' );

	renderer2 = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	// renderer2.setPixelRatio( window.devicePixelRatio );
	renderer2.setSize( ratio.width, ratio.height );
	container.appendChild( renderer2.domElement );

	fov = (180 * (2 * Math.atan(ratio.height / 2 / perspective))) / Math.PI

	const sceneEmpty = new FXScene2( 0x000000, '1' );
	const sceneMenu = new FXScene2( 0x000000, '2' );
	transition2 = new Transition2( sceneEmpty, sceneMenu );

}

function init() {

	clock = new THREE.Clock();
	ajaxPageLoader = new AjaxPageLoader();
	loadingManager = new THREE.LoadingManager()
	textureLoader = new THREE.TextureLoader(loadingManager)

	menuGL();

	if(page == 'home') {
		initGL()
	} else {
		if(!audio) {music()}
	}

	// stats = new Stats();
	// document.body.appendChild( stats.dom );

	onWindowResize()

	document.addEventListener( 'mousemove', onDocumentMouseMove );
	window.addEventListener( 'resize', onWindowResize );
	window.addEventListener( 'orientationchange', onOrientationChange);

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

	$('.main_logo').click(function(){

		if(!$('body').hasClass('wait')) {

			global.history.pushState({}, null, '/');

			document.title = 'Om Swami – Official Website'

			if(isGL) {

				if(page != 'home') {

					$('body').addClass('wait hidden').removeClass('opened')

					$('header').removeClass('opened').addClass('light')

					if(isMenu) {

						gsap.to('.menu_wrap', 0.5, {autoAlpha: 0, ease: 'power3.out'})

						$('header').removeClass('active')

					}

					if( $('.siteLoader').length == 0 ) {
						$('body').append('<div class="siteLoader" style="background: #040404; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 2900; top: 0; visibility: hidden;"></div>')
					}

					gsap.to('.siteLoader', 0.5, {autoAlpha: 1, ease: 'power3.out', onComplete: function(){

						isMenuClosed = false

						page = 'home'

						dataID = null

						$('#page').html(glHTML);

						$('body').removeAttr('data-id').attr('id', page).removeClass('no-color')

						$('.en_bg').css('background-color', '')

						gsap.set('main', {autoAlpha: 1})

						if(scroll) {
							scroll.destroy()
							scroll = null
						}

						transitionParams.transition2 = 1

						appendImgs(false);

						if(!isGL) {

							siteIntrvl = setInterval(function () {

								if(imagesLoaded) {

									imagesLoaded = false;

									clearInterval(siteIntrvl);

									fireGL()

								};

							}, 50);

						} else {

							fireGL()

						}

					}})

				}

			} else {

				if( $('.siteLoader').length == 0 ) {
					$('body').append('<div class="siteLoader" style="background: #1F1F1F; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999;visibility: hidden;"></div>')
				}

				gsap.to('.siteLoader', 0.5, {autoAlpha: 1, ease: "power3.out", onComplete: function(){
					setTimeout(function(){ location.href = '/';}, 500)
				} });

			}

		}

		return false

	})

	ajaxPageLoader.setDefaultTarget('#page');

	ajaxPageLoader.setBeforeContentSettingEvent((ajaxLink) => {

		if(isMenu) {

			gsap.to('.menu_wrap', 0.5, {autoAlpha: 0, ease: 'power3.out'})

		}

	})

	ajaxPageLoader.setAfterAjaxLoadingEvent((ajaxLink) => {

		if(!$('body').hasClass('wait')) {

			$('body').addClass('wait hidden')

			$('body, header').removeClass('opened')

			$('.menu_items').removeClass('ready')

			$('body').removeAttr('data-id')

			dataID = null

			if(ajaxTL) { ajaxTL.kill() }

			ajaxTL = new gsap.timeline({paused: true});

			if(scroll) {
				scroll.destroy()
				scroll = null
			}

			splitDone = false

			const url = ajaxLink.getUrl();

			global.history.pushState({}, null, url.substring(0,url.lastIndexOf("/")+1));

			page = url.substring(0,url.lastIndexOf("/")).replace(/\//g, "")

			appendImgs(false)				

			if(page != 'journey') { buildScroll(true); }

			if($('body').find('.load_bg').length != 0) {

				siteIntrvl = setInterval(function () {

					if(loaded) {

						loaded = false;

						clearInterval(siteIntrvl);

						ajaxTL.play()

					};

				}, 50);

			} else {

				ajaxTL.play()
			}

			excute()

		}

	});

	function excute(){

		onWindowResize(null, true);

		document.title = $('#getMeta').attr('data-title')

		$('body').attr('id', page)

		ajaxTL.call(callPage)

		.to(transitionParams, 1, {transition2: 0, ease: 'power3.out', onStart: function(){

			$('.siteLoader').remove()

			gsap.set('main', {autoAlpha: 1})

			$('body').removeClass('no-color')

			$('.en_bg').css('background-color', '')

			if(isGL && glActive) {

				canRenderA = false
				canRenderB = false
				canRenderC = false
				isReady = false
				isExp = false
				glActive = false

				resetScene(1)
				resetScene(2)
				resetScene(3)
				resetScene(4)
				setActive(1)

				glParams.transSceneA = 1
				glParams.transSceneB = 1
				glParams.transSceneC = 1

				setText('author','Author', 'scene_a', 'scene_b')

				glProgTL.pause();

				gsap.set('#gl_progress i', {scaleX: 1})

				gsap.set($('.container > canvas').eq(1), {autoAlpha: 0})

			}

		}, onUpdate:function(val){

			if(this.progress() >= 0.3 ) {

				$('header').removeClass('active light')

			}

		}}, 0.5)

		.call(function(){

			isPageReady = true

			isMenuClosed = true

			isMenu = false

			$('header').addClass('loaded')

			$('body').removeClass('wait')

			animationTL.play()

			menu();

		})

	}

	menu()

	$('.header_side').on('mousemove', function(){

		if(page == 'home') {

			isReady = false

		}

	}).on('mouseleave', function(){

		if(page == 'home' && !isMenu) {

			isReady = true

		}

	})

	$('.menu_button').click(function(){

		if(!$('body').hasClass('wait')) {
			if(!isMenu) {

				if(page == 'home') {
					isReady = false
					canScroll = false;
					glProgTL.pause()
					$('.lb_set').css('pointer-events', 'none')
				}

				isMenu = true
				menuTL.timeScale(1).play()
				$('header').addClass('opened')
				stopScroll()

			} else {

				if(page == 'home') {
					isReady = true
					canScroll = true;
					glProgTL.play()
					$('.lb_set').css('pointer-events', 'all')
				}

				isMenu = false
				menuTL.timeScale(1.3).reverse()
				$('header').removeClass('opened')
				startScroll()

			}
		}
	})


	$(document).on('click', 'a', function(e){ 

		let $this = $(this),
			link = $this.attr('href');

		if(!$this.hasClass('main_logo')) {

			if($('body').hasClass('wait')) {

				return false;

			} else {

				if(!$this.attr('target') && !$this.attr('data-ajax')) {

					$('body').addClass('wait hidden')

					nonMenu(link)

					return false;

				}

			}

		}

	})

	function nonMenu(url){

		if( $('.siteLoader').length == 0 ) {

			$('header').removeClass('loaded')

			$('body').append('<div class="siteLoader" style="background: #040404; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 2900; top: 0; visibility: hidden;"></div>')

			isMenuClosed = false;

			gsap.to('.siteLoader', 0.5, {autoAlpha: 1, ease: 'power3.out', onComplete: function(){

				$('body').removeAttr('data-id')

				dataID = null

				if(scroll) {
					scroll.destroy()
					scroll = null
				}

				page = url.replace(/\//g, "")

				global.history.pushState({}, null, url);

				switch(page) {
					case 'monk':
					$('#page').html(monkHTML);
					break;
					case 'author':
					$('#page').html(authorHTML);
					break;
					case 'entrepreneur':
					$('#page').html(entrepreneurHTML);
					break;
					case 'journey':
					$('#page').html(journeyHTML);
					break;
					case 'contact':
					$('#page').html(contactHTML);
					break;
				}

				if(page != 'journey') { buildScroll(true); }

				appendImgs(false)				

				if(ajaxTL) { ajaxTL.kill() }

				ajaxTL = new gsap.timeline({paused: true});

				transitionParams.transition2 = 1

				excute()

				ajaxTL.play()

			}})
		}

	}

	var menuCur = new Flickity( '.menu_items nav', {
		prevNextButtons: false,
		accessibility: true,
		pageDots: false,
		percentPosition: false,
		cellAlign: 'left',
		contain: true
	});

	function wheel(e){

		if(isMenu) { flickity_handle_wheel_event(e, menuCur) }
	}

	document.addEventListener('wheel', wheel);

	menuCur.on('dragStart', () => menuCur.slider.childNodes.forEach(slide => slide.style.pointerEvents = "none") );
	menuCur.on('dragEnd', () => menuCur.slider.childNodes.forEach(slide => slide.style.pointerEvents = "all") );

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
}

function initGL() {
	
	if(!isGL) {

		isGL = true
		loadingManager.onLoad = function() { imagesLoaded = true }

		renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
		// renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( ratio.width, ratio.height );
		container.appendChild( renderer.domElement );

		const sceneA = new FXScene(1);
		const sceneB = new FXScene(2);
		const sceneC = new FXScene(3);
		const sceneD = new FXScene(4);

		transition[0] = new Transition( sceneA, sceneB, 0 );
		transition[1] = new Transition( sceneB, sceneC, 1 );
		transition[2] = new Transition( sceneC, sceneD, 2 );

	} else {

		imagesLoaded = true
	}

	glActive = true

	if(isMobile) {
		$('.tip > span').html('Swipe to navigate')
	}

	if(glProgTL) {glProgTL.kill()}

	glProgTL = new gsap.timeline({paused: true})

	glProgTL.fromTo('#gl_progress i', 5, {scaleX: 0}, {scaleX: 1, ease: "power0.none"})

	.call(function(){

		getSection('next')

	})

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

		if(glActive) {

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
    	
    	textures[i] = textureLoader.load( support_format_webp('/images/'+filename+'.png') );
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

	next = {

		sec2: function() { 

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale(1.5)

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

			.timeScale(1.5)

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

			.timeScale(1.5)

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

			.timeScale(1.5)

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

	prev = {

		sec1: function() { 

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale(1.5)

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

			.call(function(){

				bind()

			})

		},

		sec2: function() {

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale(1.5)

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

			.call(function(){

				bind()

			})

		},

		sec3: function() {

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale(1.5)

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

			.call(function(){

				bind()

			})

		},

		sec4: function() {

			if(mainTL) {mainTL.kill()}

			mainTL = new gsap.timeline();

			mainTL

			.timeScale(1.5)

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
				setActive(4)
			})

			.to('.lb_set', 2, {autoAlpha: 1, ease: 'power3.out'}, 2)

			.call(function(){

				bind()

			})


		}
	}

	if(!isMobile) {

		$(window).on('mousewheel DOMMouseScroll', function (e) {

			if(glActive && canScroll) {

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

		document.onkeydown = function(e) {

			if(glActive && canScroll) {

				if(e.which == 37 || e.which == 38) {
					glProgTL.pause()
					canScroll = false
					getSection('prev');
				}

				if(e.which == 39 || e.which == 40) {
					glProgTL.pause()
					canScroll = false
					getSection('next');
				}

			}

		}

	} else {

		$(window).on('touchstart', function (e){

			if(glActive && canScroll) {

				glProgTL.pause()

				ts = e.originalEvent.touches[0].clientY;
				ts2 = e.originalEvent.touches[0].clientX;

			}

		});

		$(window).on('touchend', function (e){

			if(glActive && canScroll) {

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

}

function getSection(dir){

	isReady = false;

	if(dir == 'next') {

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

	$('.lb_set').attr({'href': a, 'data-url': '/'+a+'/template.html'})

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

function initGUI() {

	// gui = new dat.GUI();

	// gui.close()

	// gui.add( transitionParams, 'transition', 0, 1, 0.01 ).listen();
	// gui.add( transitionParams, 'transition2', 0, 1, 0.01 ).listen();

}

function Transition( sceneA, sceneB ) {

	const scene = new THREE.Scene();

	const textures = textureLoader.load( support_format_webp('/images/transition.png') );

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
		if(glActive) {
			transition[0].material.uniforms.mixRatio.value = glParams.transSceneA;
			transition[1].material.uniforms.mixRatio.value = glParams.transSceneB;
			transition[2].material.uniforms.mixRatio.value = glParams.transSceneC;
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

	const textures = textureLoader.load( support_format_webp('/images/transition2.png') );

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

function setOpacity(section, value){

	sceneGroup[section].traverse((child) => {

		if(child instanceof THREE.Mesh && child.material) {

			child.material.opacity = value

		}
	})

}

function onDocumentMouseMove( event ) {

	if(!isMobile) {

		curX = event.clientX
		curY = event.clientY

		isStopped = false;

		if(isReady) {

			mouseX = ( event.clientX - (sizes.width/2) ) / 100
			mouseY = ( event.clientY - (sizes.height/2) ) / 100
			mouseZ = (perspective-15)

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

function onWindowResize(e, value) {

	let val

	if(value) {
		val = value
	} else {
		val = false
	}

	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	if((sizes.width / sizes.height) > (ratio.width/ratio.height)){
		if(renderer) { renderer.setSize( sizes.width, sizes.width / (ratio.width/ratio.height) ) }
		if(renderer2) { renderer2.setSize( sizes.width, sizes.width / (ratio.width/ratio.height) ) }
	} else {
		if(renderer) { renderer.setSize( sizes.height * (ratio.width/ratio.height), sizes.height ) }
		if(renderer2) { renderer2.setSize( sizes.height * (ratio.width/ratio.height), sizes.height ) }
	}

	vh = sizes.height * 0.01;

	if(isMobile) {

		if(sizes.width != lastWindowWidth) {

			if(!val && !isAnimation) {$('body').addClass('progress');}

			setH();

		}

	} else {

		setH();
			
		if(!val && !isAnimation) { $('body').addClass('progress');  }

	}


	clearTimeout(window.scrollUpdate);

	window.scrollUpdate = setTimeout(function(){

		if(scroll){scroll.update()};

	}, 500);

	function setH(){

		document.documentElement.style.setProperty('--vh', `${vh}px`);

	}

	clearTimeout(window.resizedFinished);

	window.resizedFinished = setTimeout(function(){

		if(!val) { $('body').removeClass('progress') }

		if(!isMobile) { setH(); }

		isDragging = false;

	}, 500);


	lastWindowWidth = sizes.width

}

function onOrientationChange(){

	clearTimeout(window.resizedFinished);

	window.resizedFinished = setTimeout(function(){

		onWindowResize();

	}, 250);

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

	let prx = $(document).find('.prx')

	if(prx.length != 0) {

		let rect = $('.prx')[0].getBoundingClientRect();
		let xPos = ((curX - rect.left) - rect.width / 2) / rect.width * -30;
		let yPos = ((curY - rect.top) - rect.height / 2) / rect.height * -30;
		gsap.to('.prx', 0.6, {x: xPos, ease: 'power3.out'});

	}

	if(page == 'monk' && isPageReady) {

		if(!isClicked) {

			if(!isButtonLoaded) {

				isButtonLoaded = true;

				gsap.to('.explore_btn', 0.5, { x: sizes.width/2, y: sizes.height/2, autoAlpha: 1})

			}
			gsap.to('.explore_btn', 0.3, {
				x:function(index, target) {
					return curX - (target.offsetWidth/2);
				},
				y:function(index, target) {
					return curY - (target.offsetHeight/2);
				}
			})

		}

	}

}

function music(){

	var isPlaying = false;

	audio = new Audio('../../music/music.mp3');
	audio.loop = true;

	const promise = audio.play();

	if(promise !== undefined){

		promise.then(() => {

			playing()

		}).catch(error => {

			$('body').click(function(){

				if(!isPlaying) {

					playing()

					audio.play()

				}

			})

		});
	}

	function playing() {

		isAudio = true;

		isMuted = false;

		isPlaying = true

		$('.equalizer').addClass('active')

	}

	$('.equalizer').click(function(){

		console.log('hey')

		if(!$('body').hasClass('wait')) {

			if(!isMuted) {

				isMuted = true

				audio.pause();
		
				$(this).removeClass('active')

			} else {

				isMuted = false

				audio.play();

				$(this).addClass('active')

			}
		}

	})
}


function buildScroll(val){

	if(scroll) {scroll.destroy(); scroll = null;}

	scroll = new LocomotiveScroll(
	{
		el: document.querySelector('[data-scroll-container]'),
		smooth: true,
		scrollFromAnywhere: true,
		getDirection: true,
		smartphone: {
			smooth: page == 'author' ? true : false,
			lerp: 0
		},
		tablet: {
			smooth: page == 'author' ? true : false,
			lerp: 0
		}
	});

	scroll.on('scroll', (func, speed) => {

		if(val && canHideHeader) {
			pageScroll(func);
		}

	});

}

function pageScroll(val){

	let eleWrap = $('._eleWrap');

	if( eleWrap.length != 0 ) {

		eleWrap.each(function(i){

			let $this = $(this),
				eleY = $this.find('._eleY'),
				eleX = $this.find('._eleX');

			if(isHorizontal == false) {
				if($this.isInViewport()) {
					animateEle($this, eleY, eleX)
				}
			} else {
				if($this.isInViewportH()) {
					animateEle($this, eleY, eleX)
				}
			}

		})

	}

	let splitWrap = $('._splitWrap');

	if( splitWrap.length != 0 ) {

		splitWrap.each(function(i){

			let $this = $(this),
				getWords = $this.find('._splitWords'),
				getLines = $this.find('._splitLines');

			if(isHorizontal == false) {
				if($this.isInViewport()) {
					split($this, getWords, getLines, i)
				}
			} else {
				if($this.isInViewportH()) {
					split($this, getWords, getLines, i)
				}
			}

		})

	}

	if(page != 'journey') {

		scrollVal = 0

		if(val != 0 ) {

			scrollVal = val.scroll.y;

		}

	}

	if(scrollVal > 100) {

		if(canHideHeader && page != 'author') {

			if(val.direction == 'down') {

				$('header').addClass('invisble')

			} else {

				$('header').removeClass('invisble')

			}
		}

	}

}

function split($this, getWords, getLines, i) {

	if(!$this.hasClass('inview') ) {

		$this.addClass('inview');

		if(getWords.length != 0) {
			splitWords[i] = new SplitText(getWords, {type:"words", wordsClass:"SplitClass"});
			gsap.set(getWords, {autoAlpha: 1})
			if(getWords.hasClass('dirX')) {
				gsap.set(splitWords[i].words, { x: 20, autoAlpha: 0})
				gsap.to(splitWords[i].words, 0.5, { x: 0, autoAlpha: 1, ease: 'power3.out', stagger: 0.1, onComplete: function(){
					splitWords[i].revert()
				} })
			} else {
				gsap.set(splitWords.words, { y: 20, autoAlpha: 0})
				gsap.to(splitWords.words, 0.5, { y: 0, autoAlpha: 1, ease: 'power3.out', stagger: 0.1, onComplete: function(){
					splitWords[i].revert()
				} })
			}
		}

		if(getLines.length != 0) {
			gsap.set(getLines, {autoAlpha: 1, delay: 0.5})
			splitLines[i] = new SplitText(getLines, {type:"lines", linesClass:"SplitClass"});
			gsap.set(splitLines[i].lines, { y: 20, autoAlpha: 0})
			gsap.to(splitLines[i].lines, 0.5, { y: 0, autoAlpha: 1, ease: 'power3.out', delay: 0.5, stagger: 0.1, onComplete: function(){
				splitLines[i].revert()
			} })
		}

	}
}

function animateEle($this, eleY, eleX) {

	if(!$this.hasClass('inview') ) {

		$this.addClass('inview');

		gsap.set($this, {autoAlpha: 1}, 0)

		if(eleY.length != 0) {
			gsap.set(eleY, { y: 100, autoAlpha: 0})
			gsap.to(eleY, 1, { y: 0, autoAlpha: 1, ease: 'power3.out', delay: 0.4, stagger: 0.15 })
		}

		if(eleX.length != 0) {

			gsap.set(eleX, { x: 100, autoAlpha: 0})
			gsap.to(eleX, 1, { x: 0, autoAlpha: 1, ease: 'power3.out', delay: 0.4, stagger: 0.15 })
		}
	}

}

function flickity_handle_wheel_event(e, flickity_instance, stop) {

	if(stop) {

		var direction = (Math.abs(e.deltaX) > Math.abs(e.deltaY)) ? e.deltaX : e.deltaY;

		direction > 0 ? flickity_instance.next() : flickity_instance.previous()

	} else {

		window.wheeldelta = {}

		if (!window.wheeling) {

			if(e.deltaX > 0 || e.deltaY < 0){

				flickity_instance.previous();

			} else if(e.deltaX < 0 || e.deltaY > 0){

				flickity_instance.next();

			}

		}

		clearTimeout(window.wheeling);

		window.wheeling = setTimeout(function() {

			delete window.wheeling;

			window.wheeldelta.x = 0;
			window.wheeldelta.y = 0;

		}, 50);

		window.wheeldelta.x += e.deltaFactor * e.deltaX;
		window.wheeldelta.y += e.deltaFactor * e.deltaY;

		if(window.wheeldelta.x > 500 || window.wheeldelta.y > 500 || window.wheeldelta.x < -500 || window.wheeldelta.y < -500){

			window.wheeldelta.x = 0;
			window.wheeldelta.y = 0;

			if(e.deltaX > 0 || e.deltaY < 0){
				flickity_instance.previous();
			} else if(e.deltaX < 0 || e.deltaY > 0){
				flickity_instance.next();
			}

		}

	}

	isDragging = false;

}

function menu(){

	if(menuTL) { menuTL.kill() }

	menuTL = new gsap.timeline({paused: true});

	menuTL

	.call(function(){

		$('.menu_items').removeClass('ready')

		isMenuClosed = true

	})

	.call(function(){

		isMenuClosed = false

	})

	.to('.lb_inner, .tip', 1, {autoAlpha: 0, ease: 'power3.inOut'}, 0)

	.set('.menu_wrap', {autoAlpha: 1}, 0)

	.to(transitionParams, 2, {transition2: 1, ease: 'power3.inOut', onStart: function(){

	}, onUpdate:function(val){

		if(this.progress() <= 0.5 ) {

			$('header').removeClass('active')

		} else {

			$('header').addClass('active')

		}

	}}, 0)

	.set('.sub_nav', {autoAlpha: 1}, 0)

	.fromTo('.sub_nav ._ele', 0.5, {y: 30, autoAlpha: 0}, {y: 0, autoAlpha: 1, ease: 'power3.out', stagger: 0.05}, 1)

	.call(function(){

		$('.menu_items').addClass('ready')

	})

	.fromTo('.menu_items li a', 0.7, {x: 200, autoAlpha: 0}, {x: 0, autoAlpha: 1, ease: 'power3.out', stagger: 0.1}, 0.8)

	.fromTo('.menu_items li ._ele', 0.7, {y: 50, autoAlpha: 0}, {y: 0, autoAlpha: 1, ease: 'power3.out', stagger: 0.1}, 0.8)

}

function cerchio(){

	if(!isMobile){

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

function callPage(){

	cerchio()

	if(page == 'monk') {

		if(dataID) {

			monkPage(true, dataID)

		} else {

			monkPage()

		}

	} else if(page == 'entrepreneur') {

		entrepreneurPage()

	} else if(page == 'journey') {

		journeyPage()

	} else if(page == 'author') {

		dataID ? authorPage(true) : authorPage(false)

	} else if(page == 'entrepreneur-inner') {

		innerEntrepreneur()

	} else {

		staticPage()

	}

	$('body').attr('id', page)

}

function stopScroll(){

	$('body').addClass('hidden')

	if(scroll) { scroll.stop() }

}

function startScroll(){

	$('body').removeClass('hidden')

	if(scroll) { scroll.start() }

}

function hexToRgbA(hex,a){
	var c;
	if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
		c= hex.substring(1).split('');
		if(c.length== 3){
			c= [c[0], c[0], c[1], c[1], c[2], c[2]];
		}
		c= '0x'+c.join('');
		return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+a+')';
	}
	throw new Error('Bad Hex');
}

function toSeoUrl(url) {
	return url
	.toString()
	.replace('<br>','')
	.normalize('NFD')
	.replace(/[\u0300-\u036f]/g,'')
	.replace(/\s+/g,'-')
	.toLowerCase()
	.replace(/&/g,'-and-')
	.replace(/[^a-z0-9\-]/g,'')
	.replace(/-+/g,'-')
	.replace(/^-*/,'')
	.replace(/-*$/,'');
}

function monkPage(val, id){

	$imgs1 = $('.monk_visuals i.a')
	$imgs2 = $('.monk_visuals i.b')
	slidesTotal = $('.monk_slide').length
	getActive = $('.monk_slide').eq(0)
	activeSection = 0

	isAnimation = false
	isButtonLoaded = false
	isButtonHidden = false
	loaded = false
	isClicked = false

	isHorizontal = false

	stopScroll()

	getActive.find('.monk_visuals').addClass('prx')

	canScroll = true

	if(val) {
		canScroll = false;
		isClicked = true;
		gsap.set('.explore_btn', { scale: 0 })
		$('.getContent').show()
		startScroll()
		loadContent(id-1, true);
	}

	function nextSlide(val){

		let currentSlide = $('.monk_nav_item.active').index(),
			newSlide;

		currentSlide == slidesTotal - 1 ? newSlide = 0 : newSlide = currentSlide + 1

		if(!val) {
			setSlide(newSlide, -1)
		} else {
			gsap.to('.getContent', 0.5, {autoAlpha: 0, ease: 'power3.out', onComplete: function(){ loadContent(newSlide, true) } })
		}

	}

	function prevSlide(val){

		let currentSlide = $('.monk_nav_item.active').index(),
			newSlide;

		currentSlide == 0 ? newSlide = slidesTotal - 1 : newSlide = currentSlide - 1

		if(!val) {
			setSlide(newSlide, 1)
		} else {
			gsap.to('.getContent', 0.5, {autoAlpha: 0, ease: 'power3.out', onComplete: function(){ loadContent(newSlide, true) } })
		}

	}

	function setSlide(newSlideIndex, dir){

		let curSlide = $('.monk_slide.active'),
			curVis1 = curSlide.find($imgs1),
			curVis2 = curSlide.find($imgs2),
			newSlide = $('.monk_slide').eq(newSlideIndex),
			newVis1 = newSlide.find($imgs1),
			newVis2 = newSlide.find($imgs2);

		canScroll = false

		navCarousel.select(newSlideIndex);

		$('.monk_nav_item.active').removeClass('active')

		$('.monk_nav_item').eq(newSlideIndex).addClass('active')

		if(slidesTL) { slidesTL.kill() }

		slidesTL = new gsap.timeline()

		slidesTL

		.to('.monk_nav_progress i', 1, {scaleX: ( ( (sizes.width / (slidesTotal - 1) ) * newSlideIndex) ) / sizes.width, ease: 'power3.out'}, 0)

		.to(curSlide.find('.monk_text ._ele.alt_h2 i'), 0.5, {autoAlpha: 0, ease: 'power3.in'}, 0)

		.staggerTo(curSlide.find('.monk_text ._ele:not(.alt_h2) i'), 0.7, {y: 150 * dir + '%', ease: 'power3.in'}, 0.1 * -dir, 0.3)

		.to(curSlide.find('.monk_text .mobile_explore'), 0.7, {y: 20 * dir, autoAlpha: 0, ease: 'power3.in'}, 0.3)

		.to(curVis1, 1, {x: -100, autoAlpha: 0, ease: 'power3.in'}, 0)

		.to(curVis2, 1, {
			x: function(index, target){
				let val;
				sizes.width > 768 || newSlideIndex == 3 ? val = 100 : val = 0;
				return val;
			},
			y: function(index, target){
				let val;
				sizes.width <= 768 && newSlideIndex != 3 ? val = 100 * dir : val = 0;
				return val;
			},
			autoAlpha: 0, ease: 'power3.in'
		}, 0)

		.set('.monk_slide', {autoAlpha: 0}, 1)

		.set(newSlide, {autoAlpha: 1}, 1)

		.fromTo(newVis1, 1, {x: -100, autoAlpha: 0}, {x: 0, autoAlpha: 1, ease: 'power3.out'}, 1)

		.fromTo(newVis2, 1, {
			x: function(index, target){
				let val;
				sizes.width > 768 || newSlideIndex == 3 ? val = 100 : val = 0;
				return val;
			},
			y: function(index, target){
				let val;
				sizes.width <= 768 && newSlideIndex != 3 ? val = -100 * dir : val = 0;
				return val;
			},
			autoAlpha: 0}, {x: 0, y: 0, autoAlpha: 1, ease: 'power3.out'
		}, 1)

		.fromTo(newSlide.find('.monk_text ._ele.alt_h2 i'), 1, {autoAlpha: 0}, {autoAlpha: 1, ease: 'power3.out'}, 1.3)

		.fromTo(newSlide.find('.monk_text ._ele:not(.alt_h2) i'), 0.7, {y: 150 * -dir + '%'}, {y: '0%', ease: 'power3.out', stagger: 0.1 * -dir}, 1)

		.fromTo(newSlide.find('.monk_text .mobile_explore'), 0.7, {y: 20 * -dir, autoAlpha: 0}, {y: 0, autoAlpha: 1, ease: 'power3.out'}, 1.5)

		.call(function(){

			$('.monk_slide.active').removeClass('active').find('.monk_visuals').removeClass('prx')

			newSlide.addClass('active').find('.monk_visuals').addClass('prx')

			canScroll = true

		})

	}

	function clicked(){

		if(!isClicked && !isMenu) {

			canScroll = false;

			isClicked = true;

			gsap.to('.explore_btn', 0.5, { scale: 0, ease: 'back.inOut'})

			$('.getContent').show()

			startScroll()

			loadContent();

		}

	}

	function loadContent(index, val){

		loaded = false;

		var activeIndex = index

		if(val) {

			$('.monk_nav_item.active').removeClass('active')

			$('.monk_nav_item').eq(index).addClass('active')

			$('header').removeClass('invisble')

		}

		var title = $('.monk_nav_item.active').find('.item_lable').html();

		global.history.pushState({}, null, '/monk/' + toSeoUrl(title));

		document.title = title

		if(!index) {

			activeIndex = $('.monk_nav_item.active').index()

		}

		getActive = $('.monk_slide').eq(activeIndex)

		$('body').addClass('wait').attr('data-id', activeIndex+1)

		switch(activeIndex) {
			case 0:
			$('.getContent').html(monkContent1);
			break;
			case 1:
			$('.getContent').html(monkContent2);
			break;
			case 2:
			$('.getContent').html(monkContent3);
			break;
			case 3:
			$('.getContent').html(monkContent4);
			break;
		}

		appendImgs(false)

		scroll.update()

		gsap.to('.monk_nav_progress', 0.5, {autoAlpha: 0, ease: 'power3.out'})

		if(!val) {
			gsap.set('.getContent', {autoAlpha: 1})
		}

		siteIntrvl = setInterval(function () {

			if(loaded) {

				loaded = false;

				clearInterval(siteIntrvl);

				gsap.to('.monk_layers', 1, {autoAlpha: 1, ease: 'power3.out' })

			};

		}, 50);

		excute()

		function excute() {

			$('.monk_nav').addClass('has_close transition')

			scroll.scrollTo('.getContent', {
				duration: val ? 0 : 400,
				disableLerp: val ? true : false,
				callback: function(){

					canScroll = false;

					stopScroll()

					pageScroll(0)

					if(val) {

						gsap.to('.getContent', 0.5, {autoAlpha: 1, ease: 'power3.out' })

					}

					setTimeout(function(){

						navCarousel.resize();

						$('#monkSlides').hide();

						scroll.scrollTo(0, {duration: 0, disableLerp: true})

						scroll.update()

						setTimeout(function(){

							startScroll()

							$('.monk_visuals').removeClass('prx')

							$('body').removeClass('wait')

							canHideHeader = true

							isDragging = false

							$('.monk_nav').removeClass('transition')

						}, 500)

					}, 1000)

				}

			})

		}

	}

	if(navCarousel) {navCarousel.destroy(); navCarousel = null;}

	navCarousel = new Flickity( '.monk_nav_items', {
		prevNextButtons: false,
		accessibility: true,
		pageDots: false,
		contain: true,
		cellAlign: 'left',
		selectedAttraction: 0.08,
		friction:  1,
		on: {
			ready: function() {
				setTimeout(function(){
					navCarousel.resize()					
				}, 1000)
			}
		}
	});

	navCarousel.on( 'dragStart', function( event, pointer ) { isDragging = true })
	navCarousel.on( 'settle', function( event, index ) { isDragging = false })

	if(!isMobile) {

		$(window).on('mousewheel DOMMouseScroll', function (e) {

			if(canScroll && page == 'monk') {

				var direction = (function () {

					var delta = (e.type === 'DOMMouseScroll' ? e.originalEvent.detail * -40 : e.originalEvent.wheelDelta);

					return delta > 0 ? 0 : 1;

				}());

				direction == 1 ? nextSlide() : prevSlide()

			}

		});

	} else {

		$(window).on('touchstart', function (e){

			if(canScroll && page == 'monk') {

				ts = e.originalEvent.touches[0].clientX;

			}

		});

		$(window).on('touchend', function (e){

			if(canScroll && page == 'monk') {

				var te = e.originalEvent.changedTouches[0].clientX;

				if(ts > te + 25){

					nextSlide()

				} else if(ts < te - 25){

					prevSlide()

				}

			}

		});

	}

	$(document).on('click', function(){

		if(page == 'monk') {
			if(sizes.width > 768) {
				clicked()
			}
		}

	})

	$('.arrow').on( 'click', function() {

		if(canScroll) {

			if($(this).hasClass('next')) {

				nextSlide()

			} else {

				prevSlide()

			}
		}

		if(isClicked && canHideHeader) {

			canHideHeader = false;

			if($(this).hasClass('next')) {

				nextSlide(isClicked)

			} else {

				prevSlide(isClicked)

			}
		}

	});

	$('.monk_nav_item').click(function(){

		var index = $(this).index()

		if(!$(this).hasClass('active') && !isDragging) {

			if(canScroll) {

				setSlide(index, -1)

			}
			if(isClicked && canHideHeader) {

				canHideHeader = false;

				gsap.to('.getContent', 0.5, {autoAlpha: 0, ease: 'power3.out', onComplete: function(){ loadContent(index, true) } })
				
				navCarousel.select(index);

			}

		}

	})

	$('a, .header_side, .monk_nav_set').click(function(e){

		e.stopPropagation();

	})

	$('.mobile_explore').on('click', function(){

		clicked()

	})

	$('a, .header_side, .monk_nav_set').on('mouseenter', function(){

		if(!isButtonHidden && !isClicked && !isMenu && page == 'monk') {

			isButtonHidden = true;

			gsap.to('.explore_btn', 0.5, { scale: 0, ease: 'back.inOut'})
		}

	}).on('mouseleave', function(){

		if(isButtonHidden && !isClicked && !isMenu && page == 'monk') {

			isButtonHidden = false;

			gsap.to('.explore_btn', 0.5, { scale: 1, ease: 'back.inOut'})
		}

	})

	$('.monk_nav_close').on('click', function(){

		if(!canScroll) {

			canScroll = true

			canHideHeader = false

			isButtonHidden = false

			isClicked = false

			global.history.pushState({}, null, '/monk/');

			document.title = 'Om Swami - Unconventional Monk'

			let newSlideIndex = getActive.index()

			$('header').removeClass('invisble')

			$('.monk_nav').addClass('transition')

			$('.monk_nav').removeClass('has_close')

			$('body').addClass('wait')

			stopScroll()

			gsap.to('.getContent', 0.5, {autoAlpha: 0, ease: 'power3.out', onComplete: excute})

			gsap.to('.monk_nav_progress', 0.5, {autoAlpha: 1, ease: 'power3.out'})

			gsap.set('#monkSlides', {autoAlpha: 0})

			gsap.set('.monk_slide', {autoAlpha: 0})

			gsap.set('.monk_nav_progress i', {scaleX: ( ( (sizes.width / (slidesTotal - 1) ) * newSlideIndex) ) / sizes.width})

			gsap.set('.monk_text ._ele.alt_h2 i', {autoAlpha: 1})

			gsap.set('.monk_text ._ele:not(.alt_h2) i', {y: 0})

			gsap.set($imgs1, {x: -100, autoAlpha: 0})

			gsap.set($imgs2, {
				x: function(index, target){
					let val;
					sizes.width > 768 || newSlideIndex == 3 ? val = 100 : val = 0;
					return val;
				},
				y: function(index, target){
					let val;
					sizes.width <= 768 && newSlideIndex != 3 ? val = 100 : val = 0;
					return val;
				},
				autoAlpha: 0
			})

			$('.monk_slide').removeClass('active')

			getActive.addClass('active').find('.monk_visuals').addClass('prx')
		}

		function excute() {

			scroll.update()

			scroll.scrollTo(0, {
				duration: 0,
				disableLerp: true,
				callback: function(){

					$('.getContent').hide().html('')

					$('#monkSlides').show()

					$('body').removeClass('wait')

					navCarousel.resize();

					isDragging = false

					canHideHeader = true

					gsap.set(getActive, {autoAlpha: 1}, 1)

					$('.monk_nav').removeClass('transition')

					gsap.to('.explore_btn', 0.5, { scale: 1, ease: 'back.inOut'})

					gsap.set('#monkSlides', {autoAlpha: 1})

					gsap.from(getActive.find('.monk_text ._ele.alt_h2 i'), 0.5, {autoAlpha: 0, ease: 'power3.out'})

					gsap.from(getActive.find('.monk_text ._ele:not(.alt_h2) i'), 0.7, {y: '150%', ease: 'power3.out', stagger: 0.1})

					gsap.from(getActive.find('.monk_text .mobile_explore'), 0.7, {y: 20, autoAlpha: 0, ease: 'power3.out', delay: 0.5})

					gsap.fromTo(getActive.find($imgs1), 1, {x: -100, autoAlpha: 0}, {x: 0, autoAlpha: 1, ease: 'power3.out'})

					gsap.fromTo(getActive.find($imgs2), 1, {
						x: function(index, target){
							let val;
							sizes.width > 768 ? val = 100 : val = 0;
							return val;
						},
						y: function(index, target){
							let val;
							sizes.width <= 768 ? val = 100 : val = 0;
							return val;
						},
						autoAlpha: 0}, {x: 0, y: 0, autoAlpha: 1, ease: 'power3.out'
					})

				}

			})

		}

	})

	if(animationTL) {animationTL.kill()}

	animationTL = gsap.timeline({paused: true});

	animationTL.set(getActive, {autoAlpha: 1})

	.from(getActive.find('.monk_text ._ele.alt_h2 i'), 0.5, {autoAlpha: 0, ease: 'power3.in'}, 0)

	.from(getActive.find('.monk_text ._ele:not(.alt_h2) i'), 0.7, {y: '150%', ease: 'power3.out', stagger: 0.1}, 0)

	.fromTo(getActive.find($imgs1), 1, {x: -100, autoAlpha: 0}, {x: 0, autoAlpha: 1, ease: 'power3.out', delay: 1}, 0)

	.fromTo(getActive.find($imgs2), 1, {
		x: function(index, target){
			let val;
			sizes.width > 768 ? val = 100 : val = 0;
			return val;
		},
		y: function(index, target){
			let val;
			sizes.width <= 768 ? val = 100 : val = 0;
			return val;
		},
		autoAlpha: 0}, {x: 0, y: 0, autoAlpha: 1, ease: 'power3.out', delay: 1
	}, 0)

	.from(getActive.find('.monk_text .mobile_explore'), 0.7, {y: 20, autoAlpha: 0, ease: 'power3.out', delay: 1.5}, 0.5)

}

function entrepreneurPage(){

	enCarousel
	lastActive = 1
	isEntrepreneurActive = false
	isFirstHover = true
	isColsFlickity = false
	canHideHeader = false
	isHorizontal = false

	function resize(){

		if(page == 'entrepreneur') {

			if(!isEntrepreneurActive){
				enColsFlic()
			}
			if(splitDone) {
				if(split1) { split1.revert() }
				if(split2) { split2.revert() }
			}

		}

	} resize();

	function scrollFunc(){

	}

	function wheel(e){

		if(page == 'entrepreneur') {
			if(!isMenu && isColsFlickity) {
				flickity_handle_wheel_event(e, enCarousel);
			}
		}

	}

	function showContent(index){

		appendImgs(false)

		$('#epSection').remove();

		$('.getContent').show();

		canHideHeader = true;

		let contentTL = new gsap.timeline()

		split1 = new SplitText('._sp1', {type:"chars", charsClass:"SplitClass"})
		split2 = new SplitText('._sp2', {type:"lines", linesClass:"SplitClass"})

		var target1 = split1.chars,
			target2 = split2.lines;

		contentTL.set('.en_head', {autoAlpha: 1}, 0)

		.from('.en_shape', 0.5, {x: 400, autoAlpha: 0, ease: 'power3.Out', stagger: 0.5}, 0)

		.from('.en_head .alt_h1', 0.5, {x: 100, autoAlpha: 0, ease: 'power3.out'}, 0)

		.from(target1, 0.5, {x: 100, autoAlpha: 0, ease: 'power3.out', stagger: 0.07}, 0)

		.from(target2, 0.5, {y: 50, autoAlpha: 0, ease: 'power3.out', stagger: 0.1}, 0.5)

		.set('.en_scroll', {autoAlpha: 1}, 1)

		.call(function(){

			$('body').removeClass('add-transit');

			startScroll()

			scroll.update()

			splitDone = true
		})

		.from('.en_scroll span', 1, {x: 30, autoAlpha: 0, ease: 'power3.out'}, 1)

		.from('.en_scroll i', 1, {scaleX: 0, ease: 'power3.out'}, 1.2)

	}

	function updateLab(title, index){

		if(labTL) {
			labTL.kill()
		}

		labTL = new gsap.timeline()

		var labWords = $('.en_lab > span')

		labTL

		.to(labWords, 0.6, { y: '-110%', ease: "power4.in" })

		.call(function(){

			$('.en_lab > span').html(title)

		})

		.set(labWords, { y: '110%' })

		.to(labWords, 0.6, { y: '0%', ease: 'power4.out' })

	}

	function enColsFlic() {

		if((sizes.width / sizes.height) < (3/2)){

			if ( isColsFlickity == false ) {

				build();

			};

		} else {

			if ( isColsFlickity == true ) {

				lastActive = 1

				$('.en_col_set').removeClass('bigger').css('width', '')

				isColsFlickity = false;

				enCarousel.destroy();

				enCarousel = null

			}

		}

		function build(){

			isColsFlickity = true;

			enCarousel = new Flickity('.en_wrap', {
				prevNextButtons: false,
				accessibility: true,
				pageDots: false,
				percentPosition: false,
				contain: false,
				groupCells: false,
				cellAlign: 'left',
				selectedAttraction: 0.3,
				friction: 0.8
			});

			if(lastActive != 1) {
				lastActive = -1
				updateLab($('.en_col_set').eq(1).attr('data-title'), 1)
			}

			$('.en_col_set').removeClass('hover')

			enCarousel.on('dragStart', () => enCarousel.slider.childNodes.forEach(slide => slide.style.pointerEvents = "none") );
			enCarousel.on('dragEnd', () => enCarousel.slider.childNodes.forEach(slide => slide.style.pointerEvents = "all") );

			enCarousel.on( 'settle', function( index ) {

				let selected = $('.en_col_set').eq(index),
					title = selected.attr('data-title');

				if(lastActive != index) {

					lastActive = index

					updateLab(title, index)

				}

				$('.en_col_set').each(function(i){
					let $this = $(this);
					if( i != index ) {
						gsap.to($this, 0.3, {width: parseFloat(20 * sizes.height) / 100, ease: 'power3.out' })
					}
				})

				gsap.to(selected, 0.7, {width: parseFloat(40 * sizes.height) / 100, ease: 'power4.out', onUpdate: function(){enCarousel.resize()}, onComplete: function(){
					enCarousel.resize()
					$('.en_col_set').removeClass('bigger').css('width', '')
					selected.addClass('bigger')
				} })

			})

		}

	}

	if(!eventFired.includes("3")) {

		eventFired.push("3")

		window.addEventListener('resize', resize)
		document.addEventListener('wheel', wheel)

	}

	scroll.on('scroll', (func, speed) => { scrollFunc() })

	$('.en_col_set').each(function(){

		let color = $(this).attr('data-color')

		$(this).find('.en_col > i').css('background-color', hexToRgbA(color, 0.7))

	})

	$('.en_col_set').on('mouseenter', function(){

		if(!isColsFlickity && !isEntrepreneurActive && !$('body').hasClass('wait') && !$('body').hasClass('progress')) {

			let title = $(this).attr('data-title'),
				index = $(this).index();

			if(lastActive != index) {

				lastActive = index

				updateLab(title, index)

			}

			$('.en_col_set').removeClass('hover')

			$(this).addClass('hover')
		}

	}).on('click', function(){

		if(!isDragging && !isEntrepreneurActive && !$('body').hasClass('wait') && !$('body').hasClass('progress')) {

			isEntrepreneurActive = true;

			var activeIndex = $(this).index(),
				activeURL = $(this).attr('href')

			enContent(activeIndex, '#enContent', activeURL)

			if(isColsFlickity) {

				enCarousel.select(activeIndex)
			}

			$(this).addClass('no-tranist')

			$('.en_col_set').each(function(i){

				let $this = $(this);

				if(!$this.hasClass('no-tranist')) {

					$this.addClass('hide')

				} else {

					$this.addClass('target')

				}

			})

			$('.en_col_set').addClass('no-tranist')

			gsap.to('.en_lab_set', 0.5, {autoAlpha: 0, ease: 'power3.out'})

			gsap.to('.hide', 0.5, {autoAlpha: 0, y: -50, ease: 'power3.inOut', stagger: 0.1, onComplete: function(){

				let $this = $('.target'),
					width = $this.outerWidth(),
					posX = $this.offset().left,
					posY = $this.offset().top;

				if(isColsFlickity) {

					isColsFlickity = false;

					enCarousel.destroy();

					enCarousel = null;

				}

				$('.hide').remove();

				$('.en_wrap').css('display', 'block');

				$this.css('position', 'fixed');

				$this.css({ 'width': width, "-webkit-transform": "translate(" + posX + "px, " + posY + "px)", 'top': 0, 'left': - parseFloat($('.en_wrap').css('padding-left')) })

			  	fillDiv($this, true);

				let color = $($this).attr('data-color')

				$('.en_bg').css('background-color', hexToRgbA(color, 1))

				function fillDiv(div, proportional) {

					var currentWidth = div.outerWidth();
					var currentHeight = div.outerHeight();

					var availableHeight = window.innerHeight;
					var availableWidth = window.innerWidth;

					var scaleX = availableWidth / currentWidth;
					var scaleY = availableHeight / currentHeight;

					if (proportional) {

						scaleY = Math.min(scaleX, scaleY);
						scaleX = scaleX;

						var translationX = Math.round((availableWidth - (currentWidth * scaleX)) / 2);
						var translationY = Math.round((availableHeight - (currentHeight * scaleY)) / 2);

						$('body').addClass('add-transit no-color');

						gsap.to(div.find('.en_col_shape'), 0.5, {autoAlpha: 0, ease: 'power3.out' })

						gsap.to(div, 0.5, {x: '-50%', y: '-50%', scale: scaleX + 0.6, left: '50%', top: '50%', ease: 'power3.in', onComplete: showContent })

						$('header').addClass('light')

					}

				}

			}})

		}

		return false;

	})

	$('.en_wrap').on('mouseleave', function(){

		if(!isEntrepreneurActive && !$('body').hasClass('wait') && !$('body').hasClass('progress')) {

			if(lastActive != 1) {
				lastActive = -1
				updateLab($('.en_col_set').eq(1).attr('data-title'), 1)
			}

			if(!isColsFlickity) {

				$('.en_col_set').removeClass('hover')

			}

		}

	})

	$('.en_borders').append('<div class="en_border left"><svg width="9" height="650" viewBox="0 0 9 650" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.06166 564.789C3.26751 542.412 3.4633 521.128 3.4633 497.313C3.4633 476.378 3.66321 455.533 4.64366 434.673C5.18715 423.109 5.00603 411.352 4.82519 399.614C4.73494 393.755 4.64475 387.9 4.64475 382.077C4.64475 368.769 4.93983 355.402 5.23524 342.039L5.23654 341.98C5.53143 328.64 5.8262 315.306 5.8262 302.064C5.8262 296.45 6.40803 290.803 6.99831 285.074L7.00243 285.034C7.59231 279.308 8.1891 273.502 8.1891 267.669C8.1891 261.349 7.89247 255.018 7.59728 248.734L7.59495 248.685C7.30018 242.41 7.00765 236.183 7.00766 230.015L7.00766 189.134C8.41333 180.698 8.30767 177.505 8.13235 172.208C8.06241 170.095 7.98138 167.646 7.9808 164.397C8.86759 151.956 8.39145 137.638 7.69786 122.658C7.57785 120.065 7.45132 117.453 7.3241 114.827C6.71473 102.246 6.0895 89.3389 6.08876 76.7352C7.02187 56.1879 7.01704 48.9367 7.00918 37.1692C7.00844 36.052 7.00766 34.8942 7.00766 33.6803L7.00767 0.9923C7.00767 0.444302 6.56343 6.12955e-05 6.01543 6.12715e-05C5.46743 6.12476e-05 5.02319 0.444301 5.02319 0.992299L5.02319 33.6803C5.02319 34.8958 5.02396 36.0549 5.02471 37.173C5.03258 48.9266 5.03742 56.1477 4.1053 76.6676L4.10428 76.6902L4.10428 76.7127C4.10428 89.3763 4.73278 102.349 5.34264 114.938C5.46969 117.561 5.59593 120.166 5.71551 122.749C6.41005 137.751 6.87968 151.973 5.99885 164.291L5.99632 164.326L5.99632 164.361C5.99632 167.74 6.07927 170.24 6.14993 172.37C6.32347 177.599 6.42283 180.594 5.03675 188.888L5.02318 188.97L5.02318 230.015C5.02318 236.23 5.31753 242.496 5.61156 248.754L5.61499 248.827C5.91053 255.118 6.20462 261.403 6.20462 267.669C6.20462 273.383 5.61997 279.089 5.0284 284.83L5.01904 284.921C4.43234 290.616 3.84173 296.348 3.84173 302.064C3.84173 315.284 3.54736 328.6 3.25231 341.947L3.25124 341.995C2.95592 355.354 2.66028 368.744 2.66028 382.077C2.66028 387.967 2.75114 393.855 2.84179 399.73C3.02235 411.43 3.20207 423.075 2.66137 434.579C1.67872 455.486 1.47882 476.368 1.47882 497.313C1.47882 521.119 1.28311 542.394 1.07725 564.772L1.04358 568.436C0.82593 592.17 0.608249 617.348 0.608248 648.224C0.608248 648.772 1.05249 649.216 1.60049 649.216C2.14848 649.216 2.59272 648.772 2.59272 648.224C2.59273 617.358 2.81033 592.187 3.02797 568.454L3.06166 564.789Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M0.76118 481.282C1.09127 485.844 1.30408 490.336 0.852552 494.748C0.381985 499.346 0.408209 503.896 0.536746 508.407C0.57155 509.628 0.613722 510.844 0.655802 512.058C0.769788 515.345 0.883099 518.613 0.847475 521.911C0.770378 529.05 0.793238 535.204 0.818843 542.096C0.832726 545.833 0.847417 549.788 0.847417 554.235C0.847417 558.385 0.86426 562.475 0.881092 566.532L0.881469 566.623C0.898177 570.65 0.914749 574.644 0.914749 578.636C0.914749 584.852 0.818026 591.095 0.720457 597.393L0.718365 597.528C0.620131 603.869 0.521743 610.265 0.521743 616.73C0.521743 617.278 0.965984 617.722 1.51398 617.722C2.06198 617.722 2.50622 617.278 2.50622 616.73C2.50622 610.283 2.60434 603.902 2.7026 597.559L2.70481 597.416C2.8023 591.124 2.89923 584.868 2.89923 578.636C2.89923 574.64 2.88264 570.642 2.86594 566.617L2.86555 566.524C2.84872 562.466 2.83189 558.38 2.83189 554.235C2.83189 549.771 2.81716 545.809 2.80326 542.07C2.77767 535.188 2.75488 529.058 2.83184 521.933C2.86799 518.586 2.75233 515.25 2.63782 511.949C2.59606 510.744 2.55445 509.544 2.52042 508.35C2.39251 503.861 2.36967 499.416 2.82672 494.95C3.29702 490.355 3.07169 485.716 2.74048 481.139C2.67442 480.226 2.60426 479.316 2.53435 478.41C2.2518 474.747 1.97323 471.136 1.98482 467.554C2.0013 462.464 2.31904 457.452 2.63884 452.408L2.65059 452.223C2.97372 447.126 3.29515 441.995 3.29515 436.774C3.29515 436.226 2.85091 435.782 2.30291 435.782C1.75491 435.782 1.31067 436.226 1.31067 436.774C1.31067 441.922 0.993735 446.992 0.670093 452.097L0.656707 452.309C0.338008 457.335 0.017028 462.397 0.000355745 467.547C-0.011525 471.217 0.275032 474.929 0.55838 478.599C0.62764 479.496 0.696709 480.391 0.76118 481.282Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.08852 53.5722C5.22317 40.2538 5.05255 27.0594 7.77094 14.653C7.88823 14.1177 7.54937 13.5887 7.01407 13.4714C6.47877 13.3541 5.94974 13.693 5.83245 14.2283C3.0521 26.9174 3.24017 40.3409 4.10822 53.7008C4.3826 57.9238 4.72399 62.1331 5.06299 66.3129C5.80059 75.4074 6.52686 84.3621 6.52686 93.0137L6.52685 172.682C6.52685 191.58 5.89713 211.806 5.26671 232.051L5.26643 232.06C4.63632 252.295 4.00561 272.549 4.00561 291.481C4.00561 292.029 4.44985 292.473 4.99785 292.473C5.54585 292.473 5.99009 292.029 5.99009 291.481C5.99009 272.583 6.61981 252.357 7.25023 232.112L7.25051 232.103C7.88062 211.868 8.51133 191.613 8.51133 172.682L8.51133 93.0137C8.51133 84.2805 7.77436 75.1904 7.03356 66.053C6.69628 61.8928 6.3582 57.7228 6.08852 53.5722Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M1.82166 523.787C2.36957 523.797 2.82179 523.361 2.83172 522.813C4.23636 445.333 5.65135 367.271 5.65135 289.761C5.65135 289.213 5.20711 288.769 4.65911 288.769C4.11112 288.769 3.66688 289.213 3.66688 289.761C3.66687 367.25 2.25227 445.294 0.847568 522.777C0.837635 523.325 1.27375 523.777 1.82166 523.787Z" fill="#373636"/><path d="M2.00854 620.148C4.48914 576.49 2.50466 535.237 2.50466 493.398" stroke="#373636" stroke-width="2.97671" stroke-linecap="round"/></svg></div><div class="en_border right"><svg width="12" height="650" viewBox="0 0 12 650" fill="none" xmlns="http://www.w3.org/2000/svg"preserveAspectRatio="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.55202 2.00995C3.09944 1.9848 3.56358 2.4082 3.58871 2.95563C5.84852 52.1932 6.63649 103.391 6.63649 153.614C6.63649 174.549 6.83639 195.394 7.81684 216.254C8.36033 227.818 8.17921 239.574 7.99837 251.313C7.90812 257.172 7.81793 263.026 7.81793 268.85C7.81793 282.157 8.11301 295.525 8.40841 308.888L8.40972 308.947C8.7046 322.286 8.99937 335.621 8.99937 348.863C8.99937 354.477 9.58119 360.124 10.1715 365.853L10.1756 365.893C10.7655 371.619 11.3623 377.425 11.3623 383.258C11.3623 389.578 11.0656 395.909 10.7705 402.193L10.7681 402.242C10.4733 408.517 10.1808 414.744 10.1808 420.911L10.1808 461.875C10.1808 464.852 10.049 467.957 9.91689 471.068C9.82386 473.258 9.73071 475.452 9.68338 477.607C9.56741 482.886 9.71712 488.077 10.7501 492.961L10.7715 493.063L10.7715 493.166C10.7715 508.777 10.3937 521.677 10.0163 534.353L10.0007 534.878C9.62934 547.346 9.26355 559.629 9.26191 574.117C10.6421 581.107 10.8681 588.414 10.7538 595.684C10.7033 598.896 10.588 602.069 10.4741 605.208C10.3264 609.274 10.1808 613.283 10.1808 617.246C10.1808 622.704 10.0857 627.924 9.99086 633.133L9.99078 633.137C9.89583 638.351 9.80109 643.555 9.80109 648.992C9.80109 649.54 9.35685 649.985 8.80885 649.985C8.26085 649.985 7.81661 649.54 7.81661 648.992C7.81661 643.535 7.91168 638.315 8.00656 633.105L8.00664 633.101C8.10159 627.888 8.19633 622.684 8.19633 617.246C8.19633 613.288 8.34455 609.181 8.4934 605.057C8.60686 601.913 8.7207 598.759 8.76954 595.652C8.88362 588.397 8.65274 581.221 7.29653 574.408L7.27743 574.312L7.27743 574.214C7.27743 559.655 7.64479 547.319 8.01681 534.827L8.03269 534.294C8.40926 521.646 8.7854 508.801 8.78706 493.27C7.72607 488.191 7.58313 482.855 7.69938 477.563C7.74888 475.31 7.84376 473.09 7.93745 470.897C8.06804 467.841 8.19634 464.839 8.19634 461.875L8.19634 420.911C8.19634 414.697 8.4907 408.431 8.78473 402.172L8.78816 402.099C9.0837 395.808 9.37779 389.524 9.37779 383.258C9.37779 377.543 8.79313 371.838 8.20157 366.097L8.19222 366.006C7.60551 360.311 7.0149 354.579 7.0149 348.863C7.0149 335.643 6.72053 322.327 6.42548 308.98L6.42442 308.932C6.1291 295.573 5.83345 282.183 5.83345 268.85C5.83345 262.959 5.92432 257.071 6.01497 251.197C6.19553 239.497 6.37525 227.852 5.83455 216.347C4.85191 195.441 4.65201 174.559 4.65201 153.614C4.65201 103.41 3.8643 52.2444 1.60632 3.04663C1.58119 2.49921 2.0046 2.0351 2.55202 2.00995Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2.24211 139.729C2.50053 135.958 2.7549 132.246 2.71558 128.605C2.67536 124.881 2.71375 121.477 2.75175 118.107C2.82689 111.445 2.90049 104.92 2.36184 96.331L2.35607 96.239L2.36736 96.1474C3.35344 88.1551 4.0871 80.2808 4.0871 72.2905C4.0871 69.5316 4.11468 66.7796 4.14221 64.0336C4.24039 54.2373 4.33783 44.5156 3.1797 34.8192C3.11471 34.275 3.50313 33.7812 4.04727 33.7162C4.5914 33.6513 5.08519 34.0397 5.15018 34.5838C6.32503 44.4203 6.22538 54.3113 6.12648 64.1274C6.099 66.8551 6.07158 69.5771 6.07158 72.2905C6.07158 80.3677 5.33279 88.3038 4.34818 96.2989C4.88485 104.911 4.81067 111.538 4.73587 118.221C4.69832 121.575 4.66062 124.943 4.69994 128.584C4.74019 132.311 4.4789 136.121 4.21987 139.898C4.15986 140.773 4.09996 141.646 4.04397 142.516C3.74468 147.167 3.55423 151.75 4.00901 156.194C4.93595 165.252 5.12789 174.329 5.15717 183.373C5.17979 190.36 5.17192 198.254 5.16437 205.829C5.1607 209.503 5.15712 213.101 5.15712 216.486C5.15712 217.034 4.71288 217.478 4.16488 217.478C3.61688 217.478 3.17264 217.034 3.17264 216.486C3.17264 213.097 3.17623 209.496 3.17989 205.821C3.18745 198.248 3.19531 190.363 3.1727 183.379C3.14348 174.352 2.95158 165.354 2.03485 156.396C1.56202 151.776 1.76354 147.051 2.06359 142.389C2.12084 141.499 2.18158 140.613 2.24211 139.729Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9.26162 597.354C8.39627 610.672 8.22564 623.867 10.944 636.273C11.0613 636.809 10.7225 637.338 10.1872 637.455C9.65187 637.572 9.12284 637.233 9.00555 636.698C6.2252 624.009 6.41327 610.585 7.28131 597.225C7.5557 593.002 7.89709 588.793 8.23609 584.613C8.97369 575.519 9.69996 566.564 9.69996 557.913L9.69996 478.244C9.69996 459.343 9.22951 441.61 8.75862 423.862L8.75848 423.857C8.28772 406.114 7.81658 388.357 7.81658 369.428C7.81658 368.88 8.26082 368.435 8.80882 368.435C9.35682 368.435 9.80106 368.88 9.80106 369.428C9.80106 388.329 10.2715 406.062 10.7424 423.81L10.7425 423.815C11.2133 441.558 11.6844 459.315 11.6844 478.244L11.6844 557.913C11.6844 566.646 10.9475 575.736 10.2067 584.873C9.86938 589.033 9.5313 593.203 9.26162 597.354Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4.31167 125.617C4.85958 125.607 5.3118 126.043 5.32173 126.591C5.65948 145.221 6.03735 163.974 6.41653 182.792C7.61406 242.222 8.82451 302.294 8.8245 361.166C8.8245 361.714 8.38026 362.158 7.83227 362.158C7.28427 362.158 6.84003 361.714 6.84003 361.166C6.84003 302.316 5.63016 242.272 4.43272 182.846C4.05349 164.025 3.67549 145.266 3.33758 126.627C3.32765 126.079 3.76376 125.627 4.31167 125.617Z" fill="#373636"/><path d="M1.9214 1.99802C1.9214 6.5113 1.9214 11.0246 1.9214 15.5379C1.9214 17.5704 1.88141 19.9323 2.31082 21.9184C2.99963 25.1041 2.75275 28.2382 3.0597 31.4442C3.35237 34.5009 3.80859 37.4644 3.80859 40.5506C3.80859 42.5047 4.02042 44.5327 4.09316 46.4968C4.23858 50.4229 4.22954 54.3543 4.36276 58.2842C4.49721 62.2505 4.73042 66.2121 4.872 70.1765C4.95039 72.3714 4.84435 74.5712 4.88698 76.7667C4.92685 78.8203 3.80859 86.2196 3.80859 88.2942" stroke="#373636" stroke-width="2.97671" stroke-linecap="round"/></svg></div><div class="en_border top"><svg viewBox="0 0 251 6" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M250.581 4.44217C250.511 4.98562 250.013 5.36903 249.47 5.29855C235.772 3.52207 219.647 3.69167 204.752 3.84834C200.637 3.89162 196.615 3.93392 192.765 3.93392C191.373 3.93392 189.966 4.248 188.454 4.59519L188.342 4.62074C186.905 4.95098 185.357 5.30679 183.822 5.30679C183.073 5.30679 182.248 5.33415 181.366 5.36344C181.291 5.36592 181.216 5.36842 181.14 5.37091C180.18 5.40258 179.163 5.43363 178.149 5.42836C176.145 5.41794 174.046 5.26759 172.334 4.63509C172.206 4.58788 172.003 4.57237 171.6 4.59396C171.552 4.59653 171.499 4.59988 171.442 4.60348C171.115 4.62422 170.655 4.65334 170.237 4.59013C169.688 4.50718 169.154 4.39509 168.661 4.29162C168.466 4.25086 168.278 4.21143 168.098 4.17565C167.439 4.0445 166.819 3.94615 166.148 3.93375C164.053 3.89504 161.943 3.74329 159.863 3.59365C159.693 3.58147 159.524 3.56931 159.355 3.55722C157.1 3.3958 154.879 3.24748 152.683 3.24748L139.888 3.24748C136.201 3.24748 132.627 3.54077 128.992 3.83905C127.163 3.98906 125.32 4.14033 123.439 4.25619C122.107 4.33825 120.774 4.42444 119.441 4.51069C113.296 4.90819 107.134 5.30679 100.906 5.30678C96.8127 5.30678 92.8003 4.78583 88.858 4.274L88.8185 4.26887C84.8431 3.75273 80.9378 3.24748 76.9672 3.24748L76.8522 3.24747C73.5515 3.24732 70.8734 3.2472 67.9982 4.3797C67.2577 4.6714 66.3038 4.74445 65.3615 4.73695C64.3919 4.72923 63.3105 4.63287 62.2515 4.51271C61.593 4.438 60.9191 4.35104 60.2802 4.2686C59.9003 4.21958 59.5328 4.17215 59.1883 4.12985C58.2341 4.0127 57.4492 3.93391 56.8992 3.93391C55.2005 3.93391 53.8576 4.08842 52.5444 4.23951C52.0854 4.29231 51.6301 4.3447 51.1645 4.38993C49.3712 4.56412 47.5509 4.6114 45.1343 4.08258C44.2041 3.87904 43.252 3.8982 42.1825 3.91973C41.8365 3.9267 41.4781 3.93391 41.1043 3.93391C38.735 3.93391 36.304 3.72167 33.9402 3.51528C32.8006 3.41578 31.6766 3.31765 30.5827 3.24531C20.9816 2.61046 11.429 2.33919 1.78938 2.21774C1.24142 2.21084 0.802811 1.76104 0.809723 1.21308C0.81662 0.665127 1.26642 0.226518 1.81438 0.233422C11.4734 0.355119 21.0643 0.627118 30.7136 1.26516C31.8984 1.34351 33.0689 1.44599 34.2306 1.5477C36.5422 1.7501 38.8189 1.94943 41.1043 1.94943C41.3816 1.94943 41.6767 1.94308 41.984 1.93647C43.0984 1.91248 44.3751 1.885 45.5585 2.14398C47.7101 2.6148 49.3097 2.57628 50.9726 2.41475C51.3819 2.375 51.8027 2.32652 52.2409 2.27604C53.5779 2.12203 55.0762 1.94943 56.8992 1.94943C57.5872 1.94943 58.4859 2.04424 59.4301 2.16017C59.8009 2.2057 60.179 2.25451 60.5627 2.30407C61.1872 2.38471 61.8268 2.46731 62.4753 2.54089C63.5134 2.65868 64.5129 2.74565 65.3773 2.75253C66.269 2.75963 66.9022 2.67856 67.271 2.5333C70.5004 1.26126 73.5128 1.26208 76.715 1.26295L76.9672 1.263C81.0798 1.263 85.1046 1.78554 89.0531 2.29819L89.0741 2.30091C93.0498 2.81709 96.9485 3.32231 100.906 3.32231C107.063 3.32231 113.148 2.92885 119.291 2.53168C120.63 2.4451 121.971 2.35835 123.317 2.27547C125.111 2.16494 126.912 2.01747 128.72 1.86934C132.405 1.56752 136.123 1.263 139.888 1.263L152.683 1.263C154.959 1.263 157.245 1.41663 159.497 1.5778C159.663 1.5897 159.829 1.60164 159.995 1.61357C162.087 1.76393 164.145 1.91192 166.184 1.94961C167.028 1.96521 167.782 2.08935 168.486 2.22929C168.708 2.27347 168.919 2.31792 169.127 2.3614C169.597 2.46014 170.043 2.55386 170.533 2.62796C170.724 2.65677 170.932 2.64463 171.263 2.62534C171.334 2.62122 171.411 2.61677 171.493 2.61233C171.886 2.5913 172.468 2.56889 173.022 2.77367C174.389 3.27896 176.194 3.43369 178.16 3.44391C179.131 3.44896 180.114 3.41922 181.075 3.38751C181.152 3.38496 181.23 3.38238 181.307 3.37982C182.18 3.3508 183.038 3.32231 183.822 3.32231C185.129 3.32231 186.488 3.01032 188.01 2.66104C189.487 2.32179 191.111 1.94944 192.765 1.94944C196.565 1.94944 200.55 1.90735 204.642 1.86413C219.554 1.70664 235.875 1.53428 249.725 3.33056C250.269 3.40104 250.652 3.89872 250.581 4.44217Z" fill="#373636"/></svg></div><div class="en_border bottom"><svg viewBox="0 0 262 6" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M261.801 4.9921C261.801 5.5401 261.357 5.98434 260.809 5.98434C249.335 5.98434 237.631 5.44407 226.512 4.90513C225.91 4.87595 225.309 4.84677 224.711 4.81769C214.245 4.30908 204.352 3.82824 195.671 3.82824C194.174 3.82824 192.739 4.04008 191.246 4.26548L191.154 4.27937C189.712 4.4973 188.205 4.72497 186.654 4.72497L174.598 4.72497L174.414 4.64817C174.294 4.59816 174.098 4.57882 173.681 4.60412C173.633 4.60706 173.579 4.61093 173.52 4.61513C173.181 4.63953 172.691 4.67476 172.247 4.59867C171.945 4.54703 171.288 4.50562 170.376 4.47876C169.489 4.45264 168.426 4.44151 167.354 4.4375C166.392 4.4339 165.414 4.43613 164.559 4.43809C163.531 4.44044 162.681 4.44239 162.246 4.43331C160.03 4.38698 158.587 4.24785 157.217 4.11579C157.127 4.10714 157.038 4.09852 156.948 4.08996C155.512 3.95223 154.094 3.82823 151.815 3.82823C149.628 3.82823 147.773 3.92218 145.894 4.01751L145.886 4.0179C144.011 4.113 142.112 4.20935 139.871 4.20935C137.843 4.20935 135.966 4.16202 134.144 4.11608C130.664 4.02834 127.382 3.94562 123.632 4.20695C116.164 4.72739 109.521 4.7263 102.132 4.72509C101.773 4.72503 101.413 4.72497 101.051 4.72497C96.8362 4.72497 92.8212 4.49983 88.8339 4.27625L88.8124 4.27504C84.8108 4.05066 80.8366 3.82823 76.6648 3.82823C75.2012 3.82823 74.4809 3.89732 73.4369 3.99744C73.2866 4.01186 73.1295 4.02692 72.9626 4.04251C71.6389 4.16614 69.7604 4.31596 65.8412 4.42807C65.0935 4.70852 64.1739 4.78051 63.271 4.77238C62.2586 4.76326 61.1311 4.64949 60.0298 4.50811C59.345 4.4202 58.6432 4.31775 57.9786 4.22074C57.584 4.16313 57.2025 4.10745 56.8456 4.05786C55.8534 3.92005 55.0429 3.82823 54.4776 3.82823C52.0417 3.82823 50.7083 3.67894 49.3657 3.52863L49.2536 3.51609C47.9075 3.36559 46.5059 3.21623 43.8175 3.21623L43.6965 3.21623L43.579 3.18715C43.0025 3.04443 41.8723 2.99124 40.5927 2.98647C39.9748 2.98416 39.3536 2.99269 38.7909 3.00193C38.6898 3.00359 38.5902 3.00528 38.4926 3.00694C38.0532 3.01441 37.6552 3.02117 37.3475 3.02117C36.1754 3.02117 35.0483 3.05136 33.9311 3.08128C31.7144 3.14065 29.5367 3.19897 27.123 3.01841C22.1763 2.64834 18.3271 2.7314 14.4492 2.89086C13.774 2.91862 13.097 2.94876 12.4127 2.97923C9.16734 3.12372 5.75665 3.27557 1.58682 3.21613C1.03888 3.20832 0.601013 2.75779 0.608826 2.20985C0.616638 1.66191 1.06714 1.22405 1.61508 1.23186C5.72174 1.29039 9.06779 1.14153 12.3101 0.997287C12.9985 0.966658 13.6823 0.936239 14.3676 0.908057C18.2802 0.747175 22.2152 0.661234 27.2711 1.03946C29.5903 1.21296 31.5946 1.15835 33.7444 1.09979C34.8819 1.0688 36.0603 1.03669 37.3475 1.03669C37.6367 1.03669 38.0125 1.03032 38.451 1.02288C38.5504 1.02119 38.6529 1.01945 38.7583 1.01772C39.3233 1.00844 39.9612 0.999622 40.6001 1.00201C41.7751 1.00639 43.077 1.0468 43.9307 1.23184C46.6439 1.23603 48.1022 1.39052 49.4741 1.5439L49.5903 1.5569C50.9025 1.70383 52.1521 1.84375 54.4776 1.84376C55.1989 1.84376 56.1379 1.95604 57.1186 2.09226C57.5051 2.14595 57.8984 2.20341 58.2974 2.2617C58.9457 2.35642 59.609 2.45333 60.2824 2.53978C61.3604 2.67816 62.3954 2.77993 63.2889 2.78798C64.2111 2.79629 64.8568 2.70133 65.2301 2.53497L65.4098 2.45491L65.6064 2.44944C69.6093 2.33788 71.4815 2.18773 72.778 2.06663C72.9408 2.05144 73.0955 2.03658 73.245 2.02223C74.3034 1.92063 75.1042 1.84375 76.6648 1.84376C80.8997 1.84376 84.9272 2.06959 88.9207 2.29352L88.9235 2.29368C92.9253 2.51807 96.8929 2.74049 101.051 2.74049C101.407 2.74049 101.761 2.74055 102.113 2.7406C109.517 2.74176 116.097 2.74278 123.494 2.22727C127.332 1.95982 130.775 2.04576 134.318 2.13418C136.121 2.1792 137.951 2.22487 139.871 2.22487C142.059 2.22487 143.914 2.13092 145.793 2.03559L145.801 2.0352C147.675 1.9401 149.574 1.84375 151.815 1.84375C154.183 1.84376 155.671 1.97388 157.138 2.11454C157.227 2.12305 157.315 2.13159 157.404 2.14014C158.766 2.27139 160.147 2.40451 162.288 2.44927C162.707 2.45802 163.512 2.45609 164.507 2.4537C165.361 2.45165 166.355 2.44927 167.361 2.45304C168.439 2.45707 169.522 2.46827 170.434 2.49514C171.322 2.52127 172.119 2.56353 172.581 2.64261C172.77 2.67482 172.975 2.66133 173.318 2.63878C173.392 2.63391 173.473 2.62862 173.561 2.62328C173.921 2.60143 174.446 2.57752 174.968 2.74049L186.654 2.74049C188.055 2.74049 189.435 2.53207 190.923 2.30726L190.95 2.30325C192.426 2.08028 194.003 1.84376 195.671 1.84376C204.402 1.84376 214.341 2.32686 224.788 2.83463C225.393 2.86402 226 2.8935 226.608 2.92298C237.731 3.46209 249.389 3.99987 260.809 3.99987C261.357 3.99987 261.801 4.44411 261.801 4.9921Z" fill="#373636"/></svg></div>')

	if(animationTL) {animationTL.kill()}

	animationTL = gsap.timeline({paused: true});

	animationTL

	.call(function(){

		$('body').addClass('progress')

	})

	.from('.en_lab_set', 1, {y: 50, autoAlpha: 0, ease: 'power3.out'}, 0.5)

	.from('.en_col_ani', 1, {
		x: function(index, target){
			var	wrapWidth = sizes.width,
			getOffset = target.offsetLeft;

			return wrapWidth - (getOffset)
		},
	 stagger: 0.1, ease: 'power3.out'}, 0)

	.call(function(){

		// $('.en_col_set').removeAttr('style')
		if(isColsFlickity) {
			// enCarousel.select(1)
		}
		$('body').removeClass('progress')

	})

}

function innerEntrepreneur(){

	behaviours()

	animateContent(true)

	function resize(){

		if(page == 'entrepreneur-inner') {

			if (splitDone) {
				if(split1) { split1.revert() }
				if(split2) { split2.revert() }
			}

		}

	} resize();

	function scrollFunc(){

	}

	scroll.on('scroll', (func, speed) => { scrollFunc() })

	if(!eventFired.includes("3-2")) {

		eventFired.push("3-2")

		window.addEventListener('resize', resize)

	}

}

function animateContent(val) {

	split1 = new SplitText('._sp1', {type:"chars", charsClass:"SplitClass"})
	split2 = new SplitText('._sp2', {type:"lines", linesClass:"SplitClass"})

	if(!val) { appendImgs(false) }

	var target1 = split1.chars,
		target2 = split2.lines;

	if(animationTL) {animationTL.kill()}

	animationTL = gsap.timeline({paused: val});

	animationTL.set('.en_head', {autoAlpha: 1}, 0)

	.from('.en_shape', 0.5, {x: 400, autoAlpha: 0, ease: 'power3.Out', stagger: 0.5}, 0)

	.from('.en_head .alt_h1', 0.5, {x: 100, autoAlpha: 0, ease: 'power3.out'}, 0)

	.from(target1, 0.5, {x: 100, autoAlpha: 0, ease: 'power3.out', stagger: 0.07}, 0)

	.from(target2, 0.5, {y: 50, autoAlpha: 0, ease: 'power3.out', stagger: 0.1}, 0.5)

	.call(function(){

		startScroll()

	})

	.set('.en_scroll', {autoAlpha: 1}, 1)

	.from('.en_scroll span', 1, {x: 30, autoAlpha: 0, ease: 'power3.out'}, 1)

	.from('.en_scroll i', 1, {scaleX: 0, ease: 'power3.out'}, 1.2)

	.call(function(){

		splitDone = true

		$('body').removeClass('add-transit');

		scroll.update()

	})

}

function behaviours(){

	isHorizontal = false

	canHideHeader = true

	stopScroll()

	$('.en_scroll').click(function(){

		scroll.scrollTo('.scroll_to', {
			duration: 400,
			disableLerp: false,
		})

	})

	$('.reload').click(function(){

		var activeIndex = $(this).attr('data-id'),
			activeURL = $(this).attr('href')

		reloadInit(activeIndex, activeURL)

		return false

	})

}

function enContent(index, wrap, url){

	switch(Number(index)) {
		case 0:
		$(wrap).html(enContent1);
		break;
		case 1:
		$(wrap).html(enContent2);
		break;
		case 2:
		$(wrap).html(enContent3);
		break;
		case 3:
		$(wrap).html(enContent4);
		break;
		case 4:
		$(wrap).html(enContent5);
		break;
		case 5:
		$(wrap).html(enContent6);
		break;
	}

	behaviours()

	global.history.pushState({}, null, url);

	document.title = $('#getTitle').attr('data-title');

}

function reloadInit(index, url){

	$('body').append('<div class="siteLoader" style="background: #040404; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999; top: 0; visibility: hidden;"></div>')

	gsap.to('.siteLoader', 0.5, {autoAlpha: 1, ease: 'power3.out', onComplete: function(){

		scroll.scrollTo(0, { duration: 0, disableLerp: true})

		enContent(index, '.reloadWrap', url)

		let color = $('.en_head_wrap').attr('data-color')

		$('.en_bg').css('background-color', hexToRgbA(color, 1))

		transitionParams.transition2 = 1

		gsap.to(transitionParams, 1.5, {transition2: 0, ease: 'power3.out', delay: 0.5, onStart: function(){

			$('header').removeClass('invisble')

			$('.siteLoader').remove();

			animateContent(false)

		}, onComplete: function(){


		}})

	}})

}

function journeyPage(){

	tagSection = $('.jus_tab')

	isHorizontal = -1
	pos = { left: 0, x: 0 }
	current = false
	isFirstBuild = true
	isMouseDown = false
	resizing = false

	canHideHeader = false

	if(tabsCarousel) { tabsCarousel.destroy() }

	gsap.from('._in', 1, {x: 100, autoAlpha: 0, ease: 'power3.out', stagger: 0.2, delay: 1})

	tabsCarousel = new Flickity( '.monk_nav_items', {
		prevNextButtons: false,
		accessibility: true,
		pageDots: false,
		contain: true,
		cellAlign: 'left',
	});

	function resize(){

		if(page == 'journey') {

			if(tabsCarousel) {
				clearTimeout(window.jTimer);
				window.jTimer = setTimeout(function(){
					tabsCarousel.resize()
				}, 500);
			}

			if(sizes.width > 768) {

				if(isHorizontal == false || isFirstBuild) {

					isHorizontal = true

					canHideHeader = false

					$('.jus_text ._splitWords').addClass('dirX')

					if(scroll) {
						stopScroll()
						scroll.destroy();
						scroll = null
					}

					$('.journey_bg').attr('data-scroll-direction', 'horizontal')

					scroll = new LocomotiveScroll(
					{
						el: document.querySelector('[data-scroll-container]'),
						smooth: true,
						direction: 'horizontal',
						scrollFromAnywhere: true,
						getDirection: true,
						lerp: 0.08,
						smartphone: {
							smooth: true,
							direction: 'horizontal',
							breakpoint: 0,
							getDirection: true,
						},
						tablet: {
							smooth: true,
							direction: 'horizontal',
							breakpoint: 0,
							getDirection: true,
						},
					});

					if(isFirstBuild) {

						pageScroll(0);
						journeyScroll(0);
					}

					scroll.on('scroll', (func, speed) => {

						scrollVal = func.scroll.x

						gsap.set('.monk_nav_progress i', {scaleX: scrollVal / ( ( ( $('.ju_wrap').innerWidth() - sizes.width ) )) })

						if(!isClicked) {tagsAdj()}

						pageScroll(func);
						journeyScroll(func);

					});

				}

				if(sizes.width == lastWindowWidth) {
					resizing = true
					$('.monk_nav_item.active').click()

				}

			} else {


				if(isHorizontal == true || isFirstBuild) {

					isHorizontal = false

					canHideHeader = true

					$('.jus_text ._splitWords').removeClass('dirX')

					if(scroll) { 
						stopScroll()
						scroll.destroy();
						scroll = null
					}

					$('.journey_bg').attr('data-scroll-direction', 'vertical')

					if(isFirstBuild) {

						clearTimeout(window.jTimer);

						window.jTimer = setTimeout(function(){

							pageScroll(0);
							journeyScroll(0);

						}, 1000);

					}

					scroll = new LocomotiveScroll(
					{
						el: document.querySelector('[data-scroll-container]'),
						smooth: true,
						scrollFromAnywhere: true,
						direction: 'vertical',
						getDirection: true,
						smartphone: {
							smooth: false
						},
						tablet: {
							smooth: false
						}
					});

					startScroll()

					scroll.on('scroll', (func, speed) => {

						scrollVal = func.scroll.y

						gsap.set('.monk_nav_progress i', {scaleX: scrollVal / ( ( ( $(document).height() - sizes.height ) )) })

						if(!isClicked) {tagsAdj()}

						pageScroll(func);
						journeyScroll(func);

					});

				}

			}

			isFirstBuild = false

			pageScroll(0);
			journeyScroll(0)

		}

	} resize()

	function journeyScroll(val){

		if(isHorizontal == false) {

			scrollVal = 0

			if(val != 0 ) {

				scrollVal = val.scroll.y;


			}
		}

	}

	function tagsAdj() {

		tagSection.each(function(i){

			let $this = $(this);

			if(isHorizontal) {

				if(i >= tagSection.length-2) {

					if($this.offset().left <= (sizes.width) - $this.innerWidth()) {
						$this.addClass('active')

						current = $('.jus_tab.active:last');

					} else {

						$('.jus_tab, .monk_nav_item').removeClass('active')

					}

				} else {

					if($this.offset().left <= (sizes.width/2) - ($this.innerWidth()/2)) {

						$this.addClass('active')

						current = $('.jus_tab.active:last');

					} else {

						$('.jus_tab, .monk_nav_item').removeClass('active')

					}

				}


			} else {

				if($this.isInViewport()) {

					$this.addClass('active')

					current = $('.jus_tab.active:last');

				} else {

					$this.removeClass('active')

				}

			}

		})

		if(current) {

			let id = current.attr('id');

			if($('.monk_nav_item:not([data-id='+id+'])').hasClass('active')) {
				$('.monk_nav_item:not([data-id='+id+'])').removeClass('active')
			}

			if(!$('.monk_nav_item[data-id='+id+']').hasClass('active')) {
				$('.monk_nav_item[data-id='+id+']').addClass('active')
			}

			if(isHorizontal) {

				current = false
			}

		}

		if(tabsCarousel) { tabsCarousel.select( $('.monk_nav_item.active:last').index(), false) }

	}

	const mouseDownHandler = function (e) {


		if(isHorizontal && !isMenu) {

			if(isMobile) {
				pos = { left: scrollVal, x: (e.touches[0].clientX * 1.5) }
			} else {
				pos = { left: scrollVal, x: (e.clientX * 1.5) }
			}

			isMouseDown = true

		}

    }

	var dx = 0;

	const mouseMoveHandler = function (e) {

		if(isHorizontal && !isMenu) {

			if(isMouseDown) {
				if(isMobile) {
					dx = pos.left - ( (e.touches[0].clientX * 1.5) - pos.x)
				} else {
					dx = pos.left - ( (e.clientX * 1.5) - pos.x)
				}
				scroll.scrollTo(dx, { duration: 1 })
			}

		}

	}

    const mouseUpHandler = function () {

		isMouseDown = false

    }

	if(!eventFired.includes("4")) {

		eventFired.push("4")

		if(isMobile) {
			document.addEventListener('touchmove', mouseMoveHandler)
			document.addEventListener('touchstart', mouseDownHandler);
			document.addEventListener('touchend', mouseUpHandler)
		} else {
			document.addEventListener('mousemove', mouseMoveHandler)
			document.addEventListener('mousedown', mouseDownHandler);
			document.addEventListener('mouseup', mouseUpHandler)
		}
		window.addEventListener('resize', resize)

	}

	resizing = false

	$('.monk_nav_item').on('click', function(){

		var index = $(this).index(),
			id = $(this).attr('data-id'),
			offset;

		if(isHorizontal) {

			if(index >= $('.monk_nav_item').length-2) {

				offset = scrollVal + $('#' + id).offset().left - (sizes.width) + ($('#' + id).innerWidth()) + 3

			} else {

				offset = scrollVal + $('#' + id).offset().left - (sizes.width/2) + ($('#' + id).innerWidth()/2) + 3

			}

		} else {
			offset = $('#' + id).offset().top - (sizes.width/2) + ($('#' + id).innerHeight()/2) + 5

		}

		$('.monk_nav_item').removeClass('active')

		$(this).addClass('active')

		scroll.scrollTo(offset, { duration: resizing ? 0 : 200, disableLerp: resizing ? true : false })

		resizing = false

	})

	$('.anchor_btn').on('click', function(){

		$('.monk_nav_item').eq(0).click()

	})

	if(sizes.width > 768) {

		$('.jus_text ._splitWords').addClass('dirX')

	}

	$('.line_v').append('<span><svg width="4" height="14" viewBox="0 0 4 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.57579 17.5335C2.57579 5.75526 3.00003 1.60612 3.00003 1.3009e-08L1.00003 3.68579e-08C1.00003 1.60612 1.48488 5.75526 1.48488 17.5335C1.48488 29.2447 1.00003 33.3939 1.00003 35L3.00004 35C3.00004 33.3939 2.57579 29.2447 2.57579 17.5335Z" fill="#373636"/></svg></span><span><svg viewBox="0 0 4 1" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M2.57579 4.59656C2.57579 -29.392 3.00003 -41.3652 3.00003 -46L1.00003 -46C1.00003 -41.3652 1.48488 -29.392 1.48488 4.59656C1.48488 38.392 1.00003 50.3652 1.00003 55L3.00004 55C3.00004 50.3652 2.57579 38.392 2.57579 4.59656Z" fill="#373636"/></svg></span><span><svg width="4" height="14" viewBox="0 0 4 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.57579 17.5335C2.57579 5.75526 3.00003 1.60612 3.00003 1.3009e-08L1.00003 3.68579e-08C1.00003 1.60612 1.48488 5.75526 1.48488 17.5335C1.48488 29.2447 1.00003 33.3939 1.00003 35L3.00004 35C3.00004 33.3939 2.57579 29.2447 2.57579 17.5335Z" fill="#373636"/></svg></span>')
	$('.jus_year').append('<i class="line line_h before"><span><svg width="10" height="4" viewBox="0 0 10 4" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.5335 1.42421C5.75526 1.42421 1.60612 0.999965 1.30094e-08 0.999965L1.30085e-08 2.99997C1.60612 2.99997 5.75526 2.51512 17.5335 2.51512C29.2447 2.51512 33.3939 2.99997 35 2.99997V0.999965C33.3939 0.999965 29.2447 1.42421 17.5335 1.42421Z" fill="#373636"/></svg></span><span><svg viewBox="0 0 1 4" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M2.09656 1.42421C-31.892 1.42421 -43.8652 0.999965 -48.5 0.999965L-48.5 2.99997C-43.8652 2.99997 -31.892 2.51512 2.09656 2.51512C35.892 2.51512 47.8652 2.99997 52.5 2.99997V0.999965C47.8652 0.999965 35.892 1.42421 2.09656 1.42421Z" fill="#373636"/></svg></span></i><i class="line line_h after"><span><svg width="10" height="4" viewBox="0 0 10 4" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.5335 1.42421C5.75526 1.42421 1.60612 0.999965 1.30094e-08 0.999965L1.30085e-08 2.99997C1.60612 2.99997 5.75526 2.51512 17.5335 2.51512C29.2447 2.51512 33.3939 2.99997 35 2.99997V0.999965C33.3939 0.999965 29.2447 1.42421 17.5335 1.42421Z" fill="#373636"/></svg></span><span><svg viewBox="0 0 1 4" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M2.09656 1.42421C-31.892 1.42421 -43.8652 0.999965 -48.5 0.999965L-48.5 2.99997C-43.8652 2.99997 -31.892 2.51512 2.09656 2.51512C35.892 2.51512 47.8652 2.99997 52.5 2.99997V0.999965C47.8652 0.999965 35.892 1.42421 2.09656 1.42421Z" fill="#373636"/></svg></span></i>')

	if(animationTL) {animationTL.kill()}

	animationTL = gsap.timeline({paused: true});

}

function authorPage(val){

	nGridWrap = $('.n_grid_wrap')
	nGrid = $('.n_grid')
	nGridInner = $('.n_grid_inner')
	nGridSide = $('.au_grid_side_items')

	canHideHeader = true

	stopScroll()

	function store_boundary() {
		var B = nGridSide,
			G = $('.au_content a'),
			GO = G.offset(),
			O = B.offset();
		box_area = { 
			x1: O.left, 
			y1: O.top,
			x2: O.left + B.width(),
			y2: O.top + B.height()
		};
		buttonArea = { 
			x1: GO.left, 
			y1: GO.top,
			x2: GO.left + G.width(),
			y2: GO.top + G.height()
		};
	}

	function is_mouse_in_area(val) {
		var C = coords,
			B = val;

		if (C[0] >= B.x1 && C[0] <= B.x2) {
			if (C[1] >= B.y1 && C[1] <= B.y2) {
				return true;
				}
			}
		return false;
	}

	function reset(){

		isClosed = true;
		authorStarted = false;
		fluid = true;
		isStep = false;
		canHover = false;
		canMove = false;
		canSwitch = true;
		canClose = false;
		inBound = false;
		isMouseIn = false;

		nGridReset()

		gsap.set('.fluid_close', { scale: 0})

		gsap.set('.au_content', {autoAlpha: 0})

	};

	if(!val) { reset() }

	function closeBox(){

		if(!isClosed && canClose) {

			canClose = false;

			isClosed = true;

			global.history.pushState({}, null, '/author/');

			document.title = 'Om Swami – A Bestselling Author';

			$('body').removeClass('opened')

			$('.author_nav_set').removeClass('hidden')

			$('.au_grid_box').removeClass('active moved no-transition').css({"transform":""})

			$('.au_side_box').show()

			gsap.to('.fluid_close', 0.5, { scale: 0, ease: 'back.inOut'})

			gsap.to('.au_content', 0.5, {autoAlpha: 0, ease: 'power3.out', onComplete: function(){

				$('#getYear').html('');

				$('#getTitle').html('').attr('aria-label', '')

				$('#getText').html('');

				$('.au_btn').attr('href', '#');

			}})

			clearTimeout(window.boxTimer);

			window.boxTimer = setTimeout(function(){

				if(scroll) {
					scroll.update()
					scroll.scrollTo(0, {duration: 0, disableLerp: true})
					scroll.stop()
					canSwitch = true
					canMove = true
					nGridReset()
					$('.au_grid_box').addClass('no-transition')
					$('.au_grid_side_items').removeClass('audio physical')
				}

			}, 800);

		}

	}

	function clearBoxes(){

		clearTimeout(window.boxTimer);

		window.boxTimer = setTimeout(function(){

			$('.au_grid_box').addClass('no-transition')

			startScroll()

			if(scroll){scroll.update()};

		}, 800);

	}

	function setContent($this){

		if(contentTL) { contentTL.kill(); }

		var getURL = $this.attr('data-url'),
			getYear = $this.attr('data-year'),
			getTitle = $this.attr('data-title'),
			getTitleLong = $this.attr('aria-label'),
			getText = $this.attr('data-text'),
			target1,
			target2;

		splitDone = false

		if(isClosed) {

			nGridReset();

			canMove = false;

			contentTL = new gsap.timeline();

			isClosed = false;

			$('#getYear').html(getYear);

			$('#getTitle').html(getTitle).attr('aria-label', getTitleLong)

			$('#getText').html(getText);

			$('.au_btn').attr('href', getURL);

			$('.au_text').addClass('split')

			split0 = new SplitText('#getTitle', {type:"lines", linesClass:"SplitClass"})

			split1 = new SplitText(split0.lines, {type:"lines", linesClass:"SplitClass"})
			target1 = split1.lines
			split2 = new SplitText('#getText', {type:"lines", linesClass:"SplitClass"})
			target2 = split2.lines

			contentTL.set('.au_content', {autoAlpha: 1}, 0)

			.from(target1, 1, {y: '100%', ease: 'power4.out', stagger: 0.1 }, 0)

			.from(target2, 1, {y: '40', autoAlpha: 0, ease: 'power4.out', stagger: 0.05}, 0)

			.call(function(){

				canSwitch = true

				splitDone = true

				scroll.update();

			})

			.fromTo('#getYear', 1, {autoAlpha: 0}, {autoAlpha: 1, ease: 'power4.out'}, 0)

			.fromTo('.au_btn', 1, {y: '40', autoAlpha: 0}, {y: '0', autoAlpha: 1, ease: 'power4.out'}, 0)


		} else {

			split0.revert()
			split1.revert()
			split2.revert()

			split0 = new SplitText('#getTitle', {type:"lines", linesClass:"SplitClass"})
			split1 = new SplitText('#getTitle > div', {type:"lines", linesClass:"SplitClass"})
			target1 = split1.lines
			split2 = new SplitText('#getText', {type:"lines", linesClass:"SplitClass"})
			target2 = split2.lines
			contentTL = new gsap.timeline();

			$('.au_text').addClass('split')

			contentTL

			.to('#getYear', 0.5, {autoAlpha: 0, ease: 'power4.in'}, 0)

			.to(target1, 0.5, {y: '-100%', ease: 'power4.in', stagger: 0.1}, 0)

			.to('.au_btn', 0.5, {y: '-40', autoAlpha: 0, ease: 'power4.in'}, 0)

			.call(function(){

				$('#getYear').html(getYear);

				$('#getTitle').html(getTitle).attr('aria-label', getTitleLong)

				$('.au_btn').attr('href', getURL);

				split0 = new SplitText('#getTitle', {type:"lines", linesClass:"SplitClass"})
				split1 = new SplitText('#getTitle > div', {type:"lines", linesClass:"SplitClass"})
				target1 = split1.lines

				gsap.from(target1, 1, {y: '100%', ease: 'power4.out', stagger: 0.1})

			})

			.to(target2, 0.5, {y: '-100%', autoAlpha: 0, ease: 'power4.in'}, 0.05, 0)

			.call(function(){

				$('#getText').html(getText);

				split2 = new SplitText('#getText', {type:"lines", linesClass:"SplitClass"})
				target2 = split2.lines

				gsap.from(target2, 1, {y: '40', autoAlpha: 0, ease: 'power4.out', stagger: 0.05, onComplete: function(){

					canSwitch = true

					if(scroll) { scroll.update() }

					splitDone = true

				}})

			})

			// .fromTo('#getYear', 1, {autoAlpha: 0}, {autoAlpha: 1, ease: 'power4.out'}, 0)

			.set('.au_btn', {y: '40'})

			.to('.au_btn', 1, {y: 0, autoAlpha: 1, ease: 'power4.out'})

		}

	}

	function nGridReset(){

		posX = (sizes.width/2);
		posY = (sizes.height/2);
		galW = nGridWrap.outerWidth(true)
		galH = nGridWrap.outerHeight(true)
		galSW = nGridWrap[0].scrollWidth
		galSH = nGridWrap[0].scrollHeight
		wDiff = (galSW / galW) - 1
		hDiff = (galSH / galH) - 1
		mmAA = galW - (mPadd * 2)
		mmAAr = (galW / mmAA)
		mmBB = galH - (mPadd * 2)
		mmBBr = (galH / mmBB)

		nGridWrap.scrollTop(nGrid.position().top);
		nGridWrap.scrollLeft(nGrid.position().left);

	}

	function matchBoxes($this, val){

		$this.addClass('moved')

		var id = $this.attr('data-id'),
			getW,
			getH,
			offsetLeft = $this.offset().left,
			offsetTop = $this.offset().top;

		sizes.width > 1200 ? getW = 135 : getW = 50

		if($this.hasClass('sizeA')){
			sideBox = $('.au_side_box.sizeA[data-id='+id+']');
			sizes.width > 1200 ? getH = 135 : getH = 50
		} else {
			sideBox = $('.au_side_box.sizeB[data-id='+id+']');
			sizes.width > 1200 ? getH = 209 : getH = 65
		}

		sideBoxLeft = sideBox.offset().left;
		sideBoxTop = sideBox.offset().top;

		var currentWidth = $this.outerWidth();
		var currentHeight = $this.outerHeight();

		var scaleX = getW / currentWidth;
		var scaleY = getH / currentHeight;

		scaleY = Math.min(scaleX, scaleY);

		gsap.set($this, {x: 0 - (sizes.width/2) + (getW/2) + sideBoxLeft, y: 0 - (sizes.height/2) + (getH/2) + sideBoxTop, scale: scaleY, rotate: 0 })

		setActive(false)

	}

	function authorFlic(argument) {

		if(sizes.width <= 1200) {

			if ( isColsFlickity == false ) {

				build();

			};

		} else {

			if ( isColsFlickity == true ) {

				isColsFlickity = false;

				authorCarousel.destroy();

			};

		};

		function build(){

			isColsFlickity = true;

			authorCarousel = new Flickity( '.au_grid_side_items', {
				prevNextButtons: false,
				accessibility: true,
				pageDots: false,
				percentPosition: false,
				freeScroll: true,
				contain: true,
				cellAlign: 'left',
			});

			authorCarousel.on('dragStart', () => authorCarousel.slider.childNodes.forEach(slide => slide.style.pointerEvents = "none") );
			authorCarousel.on('dragEnd', () => authorCarousel.slider.childNodes.forEach(slide => slide.style.pointerEvents = "all") );

			authorCarousel.on( 'scroll', function( event, progress ) {

				if($('.au_grid_box.moved').length != 0) {

					$('.au_grid_box').each(function(){

						var $this = $(this)

						if(!$this.hasClass('active')) {

							matchBoxes($this, true);

						}

					})
				}

			})

			authorCarousel.on( 'settle', function( event, index ) {

				isDragging = false;

				startScroll()

			});

			authorCarousel.on( 'dragStart', function( event, pointer ) {

				isDragging = true;

				stopScroll()

			});

		}

	}

	function setActive(reposition){

		let $this = $('.au_grid_box.active'),
			getW = $this.outerWidth(),
			getH = $this.outerHeight();

		if($this.length != 0) {

			let W = $('.au_current_cover').innerWidth(),
				H = $('.au_current_cover').innerHeight();

			var offsetLeft = $this.offset().left,
				offsetLeft = $this.offset().left,
				offsetTop = $this.offset().top,
				getX = $('.au_current_cover').offset().left,
				getY = $('.au_current_cover').offset().top;

			var scaleX = W / getW;
			var scaleY = H / getH;

			scaleY = Math.min(scaleX, scaleY);

			gsap.set($this, {x: 0 - (sizes.width/2) + (W/2) + getX, y: 0 - (sizes.height/2) + (H/2) + getY, scale: scaleY, rotate: 0 })

			if(sizes.width <= 1200) {

				if(reposition) {

					authorCarousel.resize();

				}

			}
		}

	}

	function fillWrap(div) {

		var currentWidth = div.outerWidth();
		var currentHeight = div.outerHeight();

		var availableHeight = window.innerHeight;
		var availableWidth = window.innerWidth;

		var scaleX = availableWidth / currentWidth;
		var scaleY = availableHeight / currentHeight;

		scaleY = Math.min(scaleX, scaleY);

		gsap.set(div, {scale: scaleY })

	}

	function setBooks(){

		gsap.set('.au_grid_box', {
			x: function(index, target){
				var	element = document.querySelector('.n_grid'),
				wrapWidth = element.getBoundingClientRect().width,
				getWidth = target.getBoundingClientRect().width,
				getScale = wrapWidth / element.offsetWidth,
				getOffset = target.offsetLeft,
				ofVal;
				return - (getWidth/getScale) - getOffset + (((wrapWidth - sizes.width)/2) / getScale)
			},
			scale: 0.5,
			y: 300
		})
	}

	function bookClick($this, id) {

		if(canSwitch) {

			var title = $this.attr('data-title')

			global.history.pushState({}, null, '/author/' + toSeoUrl(title));

			document.title = 'Om Swami – ' + title;

			canSwitch = false

			if(scroll) { scroll.stop() }

			if(!$this.hasClass('moved')) {

				canClose = true

				if(!$this.hasClass('active')) {

					isClosed = true;

					$('.author_nav_item').removeClass('active').eq(0).addClass('active')

					$('.n_grid_blocks').removeClass('audio physical')

					$('.au_grid_box').removeClass('no-transition')

					gsap.to('.au_grid_box', 0.5, {autoAlpha: 1, ease: 'power3.out'})

					gsap.to('.fluid_close', 0.5, { scale: 1, ease: 'back.inOut' })

					$('body').addClass('opened')

					authorFlic();

					$this.addClass('active')

					$('.au_current_cover').removeClass('sizeA sizeB')

					if($this.hasClass('sizeA')) {

						$('.au_side_box.sizeA[data-id='+id+']').hide()

						$('.au_current_cover').addClass('sizeA')

					} else {

						$('.au_side_box.sizeB[data-id='+id+']').hide()

						$('.au_current_cover').addClass('sizeB')

					}

					setContent($this)

					$('.au_grid_box').each(function(i){

						var $this = $(this);

						if(!$this.hasClass('active')) {

							matchBoxes($this, true)

						} else {

							setActive(true)

						}

						if(i == $('.au_grid_box').length - 1) {
							clearBoxes()
						}

					})

				}

			} else {

				if(sizes.width <= 768) {

					scroll.scrollTo(0, {duration: 0.3})

					setContent($this)

					clearTimeout(window.switch);

					window.switch = setTimeout(function(){

						update(false)

					}, 1500);

				} else {

					setContent($this)

					update(true)
				}

				function update(val){

					let oldActive = $('.au_grid_box.active'),
						oldActiveID = oldActive.attr('data-id');

					var curDivContent,
						newDivContent;

					$('.au_current_cover').removeClass('sizeA sizeB')

					if($this.hasClass('sizeA')) {

						$('.au_side_box.sizeA[data-id='+id+']').hide().addClass('newActive')

						$('.au_current_cover').addClass('sizeA')

					} else {

						$('.au_side_box.sizeB[data-id='+id+']').hide().addClass('newActive')

						$('.au_current_cover').addClass('sizeB')

					}

					if(oldActive.hasClass('sizeA')) {

						$('.au_side_box.sizeA[data-id='+oldActiveID+']').show().addClass('oldActive')

					} else {

						$('.au_side_box.sizeB[data-id='+oldActiveID+']').show().addClass('oldActive')

					}

					$('.oldActive').insertAfter('.newActive');


					$('.au_grid_box').removeClass('moved no-transition');
					$('.au_side_box').removeClass('newActive oldActive');

					oldActive.removeClass('active')

					$this.addClass('active')

					setActive(true)

					$('.au_grid_box').each(function(i){

						var $this = $(this);

						if(!$this.hasClass('active')) {

							matchBoxes($this, true)

						}

						if(i == $('.au_grid_box').length - 1) {
							clearBoxes()
						}

					})

				}

			}

		}

	}

	function step() {


		if(page == 'author') {

			if(isStep) {

				posX += (mX2 - posX) / damp;
				posY += (mY2 - posY) / damp;

				if(canMove) {

					nGridWrap.scrollTop(posY * hDiff);
					nGridWrap.scrollLeft(posX * wDiff);
				}

				window.requestAnimationFrame(step);
			}

		}

	}

	function resize(){

		if(page == 'author') {

			if(!isAnimation) {

				if(step){window.cancelAnimationFrame(step)}
				isStep = false;
				galW = nGridWrap.outerWidth(true)
				galH = nGridWrap.outerHeight(true)
				galSW = nGridWrap[0].scrollWidth
				galSH = nGridWrap[0].scrollHeight
				wDiff = (galSW / galW) - 1
				hDiff = (galSH / galH) - 1
				mmAA = galW - (mPadd * 2)
				mmAAr = (galW / mmAA)
				mmBB = galH - (mPadd * 2)
				mmBBr = (galH / mmBB)

				$('.au_grid_box').addClass('no-transition')

				nGridReset();

				authorFlic();

				if(!authorStarted) {

					authorStarted = true

					if(!val) {

						fillWrap(nGridInner)

						setBooks()

					}

				} else {

					if($('.au_grid_box.moved').length != 0) {

						$('.au_grid_box').each(function(){

							var $this = $(this)

							if(!$this.hasClass('active')) {

								matchBoxes($this, true);

							}

						})

					}

				}
			}

			if(splitDone) {
				if(split0) { split0.revert() }
				if(split1) { split1.revert() }
				if(split2) { split2.revert() }
				$('.au_text').removeClass('split')
			}
		}

	} resize();


	function scrollFunc(){

		if($('.au_grid_box.moved').length != 0) {
			$('.au_grid_box').each(function(){

				var $this = $(this)

				if(!$this.hasClass('active')) {

					if(sizes.width > 1200) {
						matchBoxes($this, true);
					}

				} else {
					setActive(false)
				}

			})

		}

	}

	function wheel(e){

		if(page == 'author') {
			if(!isMenu && inBound && sizes.width <= 1200 && page == 'author') {
				flickity_handle_wheel_event(e, authorCarousel, true);
				stopScroll()
			}
		}

	}

	scroll.on('scroll', (func, speed) => { scrollFunc() })

	if(!eventFired.includes("2")) {

		eventFired.push("2")

		window.addEventListener( 'resize', resize);

		document.addEventListener('wheel', wheel);

		if(!isMobile) {

			$(window).on('mousemove', function(e) {

				if(page == 'author') {

					var C = coords;

					C[0] = e.pageX;
					C[1] = e.pageY;

					if(!isClosed) {

						store_boundary()

						if(sizes.width > 1200) {
							if(is_mouse_in_area(buttonArea)){
								$('body').css('cursor', 'pointer')
								$('.au_text a').addClass('hover')
							} else {
								$('body').css('cursor', 'default')
								$('.au_text a').removeClass('hover')
							}
						}

						if(is_mouse_in_area(box_area) || is_mouse_in_area(buttonArea)){

							if(fluid) {

								fluid = false

								canClose = false

								$('.fluid_close').css('pointer-events', 'none')

								gsap.to('.fluid_close', 0.5, { scale: 0, ease: 'back.inOut'})

								inBound = true

								if(sizes.width <= 1200) {
									stopScroll()
								}

							}

						} else {

							if(!fluid) {

								fluid = true

								canClose = true

								gsap.to('.fluid_close', 0.5, { scale: 1, ease: 'back.inOut' })

								$('.fluid_close').css('pointer-events', 'all')

								inBound = false

								if(sizes.width <= 1200) {
									startScroll()
								}

							}

						}

					}

					gsap.to('.fluid_close', 0.3, {
						x:function(index, target) {
							return e.pageX - (target.offsetWidth/2);
						},
						y:function(index, target) {
							return e.pageY - (target.offsetHeight/2);
						}
					})
					if(!$('body').hasClass('wait') && canMove) {

						mX = e.pageX - nGridWrap.parent().offset().left - nGridWrap.offset().left;
						mY = e.pageY - nGridWrap.parent().offset().top - nGridWrap.offset().top;

						mX2 = Math.min(Math.max(0, mX - mPadd), mmAA) * mmAAr;
						mY2 = Math.min(Math.max(0, mY - mPadd), mmBB) * mmBBr;

						if(!isStep) {

							isStep = true;

							step();

						}

					}

				}

			});

		}

	}

	$('.header_side').on('mouseenter', function () {

		if(!isClosed) {

			gsap.to('.fluid_close', 0.5, { scale: 0, ease: 'back.inOut'})

		}

	}).on('mouseleave', function () {

		if(!isClosed) {

			gsap.to('.fluid_close', 0.5, { scale: 1, ease: 'back.inOut'})

		}

	})

	$('body').on('click', function () {

		if(!isMenu) {

			if(sizes.width > 1200) {

				if(is_mouse_in_area(buttonArea)){

					let url = $('.au_link a').attr('href')

					window.open(url, '_blank').focus();

				}

			}

		}

	})

	$('.au_side_box').on('click', function () {

		let $this = $(this),
			id = $this.attr('data-id');

		if(sizes.width <= 1200) {

			if($this.hasClass('sizeA')) {
			
				$('.au_grid_box.sizeA[data-id='+id+']').click()

			} else {

				$('.au_grid_box.sizeB[data-id='+id+']').click()

			}

		}

	})

	$('.close').on('click', function () {

		if(!isMenu) {

			lastHovered = -1

			isMouseIn = false;

			closeBox();

		}

	})

	$('.author_nav_item').on('click', function () {

		let $this = $(this),
			id = $this.attr('data-id');

		if(!$('body').hasClass('wait') && !$this.hasClass('active')) {

			$('.author_nav_item').removeClass('active')

			$('.au_grid_box').addClass('fast')

			$this.addClass('active')

			// $('.n_grid_inner').removeClass('little')

			$('.n_grid_blocks, .au_grid_side_items').removeClass('audio physical')

			if(id == 1 || id == 2) {

				// $('.n_grid_inner').addClass('little')

			}

			if(id == 1) {

				$('.n_grid_blocks').addClass('physical')

			} else if(id == 2) {

				$('.n_grid_blocks, .au_grid_side_items').addClass('audio')

			}

			clearTimeout(window.transition);

			window.transition = setTimeout(function(){

				$('.au_grid_box').removeClass('fast')

			}, 400);

		}

	})

	$('.au_grid_box').on('mouseenter', function () {

		if(canHover) {

			let $this = $(this),
				i = $this.index(),
				title = $this.attr('data-title');

			if($('.au_grid_box.moved').length == 0) {

				if(sizes.width > 768 && lastHovered != i) {

					clearTimeout(window.navTimer);

					window.navTimer = setTimeout(function(){

						if(isMouseIn) {

							lastHovered = i

							if(boxTL) {boxTL.kill()}

							boxTL = new gsap.timeline()

							boxTL.set('#getCurTitle span', {autoAlpha: 1})

							.to('#getCurTitle span', 0.4, {y: '-105%', ease: 'power4.in'})

							.call(function(){

								$('#getCurTitle span').html(title)

							})

							.set('#getCurTitle span', {y: '105%'})

							.to('#getCurTitle span', 0.4, {y: '0%', ease: 'power4.out'})

						}

					}, 200);

					isMouseIn = true;

				}

			}

		}

	}).on('mousemove', function () {

		isMouseIn = true;

	}).on('mouseleave', function () {

		if(canHover) {

			if(sizes.width > 768) {

				clearTimeout(window.navTimer);

				window.navTimer = setTimeout(function(){

					if(!isMouseIn) {

						lastHovered = -1

						gsap.to('#getCurTitle span', 0.3, {autoAlpha: 0, ease: 'power3.out', onComplete: function(){

							$('#getCurTitle span').html('')

							gsap.set('#getCurTitle span', {autoAlpha: 1})

						}})

					}

				}, 400);

			}

			isMouseIn = false;

		}

	}).on('click', function () {

		let $this = $(this),
			id = $this.attr('data-id');

		bookClick($this, id)
	})

	$('.n_grid_blocks').addClass('split')

	$('.au_grid_box').append('<div class="hero_borders full_bg"> <i style="background-image:url(../../images/j_border_v.png)"></i> <i style="background-image:url(../../images/j_border_v.png)"></i> <i style="background-image:url(../../images/j_border_h.png)"></i> <i style="background-image:url(../../images/j_border_h.png)"></i> </div>')

	if(animationTL) {animationTL.kill()}

	animationTL = gsap.timeline({paused: true});

	if(val) {

		animationTL

		.call(function(){

			let $this = $('.au_grid_box').eq(dataID-1),
				id = $this.attr('data-id');

			$('body').addClass('progress')

			bookClick($this, id)

		})

		.to('.app', 1, { autoAlpha: 1, ease: 'power3.out'})

		.call(function(){

			$('body').removeClass('progress')

		})

	} else {

		animationTL

		.call(function(){

			isAnimation = true

		})

		.set('.app', {autoAlpha: 1})

		.to('.au_grid_box', 1, { x: 0, scale: 1, y: 0, ease: 'power3.out', stagger: -0.03})

		.call(function(){

			$('.au_grid_box').removeClass('no-transition')

			$('.au_grid_box').css({"transform":""})

			$('.author_nav_set').removeClass('hidden')

		})

		.to(nGridInner, 1.5, { scale: 1, ease: 'power3.inOut', onStart: function(){ canHover = true; } }, 1.9)

		.call(function(){

			$('.au_grid_box').addClass('no-transition')

			canMove = true

			isAnimation = false

		})

	}

	function tempDrag() {

		var pos1 = 0,
			pos2 = 0,
			pos3 = 0,
			pos4 = 0,
			draggableElements = document.getElementsByClassName("au_grid_box");

		for(var i = 0; i < draggableElements.length; i++){
			dragElement(draggableElements[i]);
		}

		$('.au_grid_box input').on('mousedown', function(e) {
			e.stopPropagation();
		})

		$('.au_grid_box').each(function() {
			let $this = $(this),
			w = $this[0].getBoundingClientRect().width,
			scale = (w / $this[0].offsetWidth).toFixed(2);

			$this.find('input').val(scale)
		})

		$('.au_grid_box input').on('input', function(val) {
			let $this = $(this),
				ele = $this.closest('.au_grid_box');

			gsap.set(ele, { scale: $this.val() })
			getData()
		})

		function getData() {
			console.clear()
			$('.au_grid_box').each(function(){
				let $this = $(this),
				classname = $this.attr('class'),
				result = classname.split(/\s+/).slice(1,3),
				w = $this[0].getBoundingClientRect().width,
				h = $this[0].getBoundingClientRect().height,
				top = parseInt($this.offset().top) + $('.n_grid_wrap').scrollTop(),
				left =  parseInt($this.offset().left),
				x =  (3340/2 - left - (w/2)).toFixed() * -1,
				y =  (2100/2 - top - (h/2)).toFixed() * -1,
				scale = (w / $this[0].offsetWidth).toFixed(2);
				console.log('.split .'+result[0]+'.'+result[1]+' { transform: translate('+x+'px, '+y+'px) scale('+scale+'); }')
			})
		}

		function dragElement(elmnt) {

			elmnt.onmousedown = dragMouseDown

			function dragMouseDown(e) {
				e = e || window.event;
				pos3 = parseInt(e.clientX);
				pos4 = parseInt(e.clientY);
				document.onmouseup = closeDragElement;
				document.onmousemove = elementDrag;
				return false;
			}

			function elementDrag(e) {
				e = e || window.event;
				pos1 = pos3 - parseInt(e.clientX);
				pos2 = pos4 - parseInt(e.clientY);
				pos3 = parseInt(e.clientX);
				pos4 = parseInt(e.clientY);
				gsap.set(elmnt, { left: elmnt.offsetLeft - pos1, top: elmnt.offsetTop - pos2 })
			}

			function closeDragElement() {
				document.onmouseup = null;
				document.onmousemove = null;
				getData();
			}
		}

	}

	// tempDrag()

}

function staticPage(){

	canHideHeader = false;

	var faqTL;

	$('.faq_head').click(function(){

		var box = $(this).closest('.faq_box')

		if(!box.hasClass('active')) {

			$('.faq_box').removeClass('active')

			box.addClass('active')

		} else {

			$('.faq_box').removeClass('active')
		}

		if(faqTL) {faqTL.kill()}

		faqTL = new gsap.timeline()

		faqTL

		.call(function(){

			$('.faq_box.active .faq_body').stop().slideDown(200)

			$('.faq_box:not(.active) .faq_body').stop().slideUp(200)

		})

		.to('.faq_box.active .faq_body p', 0.5, {autoAlpha: 1, ease: 'power3.Out'}, 0)

		.to('.faq_box:not(.active) .faq_body p', 0.5, {autoAlpha: 0, ease: 'power3.Out'}, 0)

		.call(function(){


		})

	})


	$('.input_check').click(function(){
		var checkBox = $(this).find('.checkbox')

		checkBox.hasClass('active') ? checkBox.removeClass('active') : checkBox.addClass('active')
	})

	if(animationTL) {animationTL.kill()}

	animationTL = gsap.timeline({paused: true});

	startScroll()

}