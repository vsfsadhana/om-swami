import './global.css'
import './inners.css'
import * as THREE from 'three'
import $ from 'jquery'
// import Stats from 'three/examples/js/libs/stats.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import LocomotiveScroll from 'locomotive-scroll';
import {gsap} from 'gsap'
import { SplitText } from "gsap/dist/SplitText";
import monkContent1 from './monk1.html'
import monkContent2 from './monk2.html'
import monkContent3 from './monk3.html'
import monkContent4 from './monk4.html'

var Flickity = require('flickity');

gsap.config({
    nullTargetWarn: false,
})

gsap.registerPlugin(SplitText);

let container, fov, controls, scene, camera2, renderer2, loadingManager, textureLoader, stats;
let transition2;
let isMenu = false;
let ratio = {
	width: 1680,
	height: 946
}
let transitionParams = {
    'transition2': 1,
};
let clock = new THREE.Clock();
let perspective = 800
let isMuted = true;
let isAudio = false;
let isFocus;
let audio;
let foucsTO;
let audioLevel = {
	val: 1
}
let sizes = {
	width: window.innerWidth,
	height: window.innerHeight
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
	width = window.innerWidth,
	height = window.innerHeight,
	lastWindowWidth = 0,
	isPageReady = false,
	isColsFlickity = false,
	isDragging = false,
	canScroll = false,
	isClicked = false,
	canHideHeader = false,
	isButtonLoaded = false,
	isButtonHidden = false,
	imagesLoaded = false,
	splitWords = [],
	splitLines = [],

	enCarousel,
	isEntrepreneurActive = false,

	ts,
	curX,
	curY,
	scroll,
	isScroll,
	scrollVal = 0,
	scrollStopped,
	cerchio,
	siteIntrvl,
	vh,
	isSafari,
	isMobile;


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

		init();

		animate();

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
		loaded = 0;

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

			clearTimeout(window.scrollUpdate);

			window.scrollUpdate = setTimeout(function(){

				if(scroll) { scroll.update(); };

			}, 500);

		})

	});

	appendBGs.each(function(i){

		var t = $(this),
		s = t.attr('data-src');

		t.css({ 'background-image': 'url('+ support_format_webp(s) +')' })

		$('<img src="'+ support_format_webp(s) +'">').on('load',function(){

			if(loaded == appendBGs.length - 1) {

				appendBGs.removeClass('load_bg')

				if(val) {

					pageReady();

				} else {

					imagesLoaded = true

				}

			}

			loaded ++

		})

	});

	if(appendBGs.length == 0 && val) {

		pageReady()

	}

}

function pageReady() {

	gsap.to(transitionParams, 2, {transition2: 0, ease: "power3.inOut", onComplete: function(){

		isPageReady = true

		$('body').removeClass('wait')

		gsap.set('header', {className: '+=loaded'})

	}}, 0)

	fire()

}

function support_format_webp(img) {

	var elem = document.createElement('canvas')

	if (!!(elem.getContext && elem.getContext('2d'))) { return img.substr(0, img.lastIndexOf(".")) + ".webp" } else { return img}
}

function init() {

	loadingManager = new THREE.LoadingManager()
	textureLoader = new THREE.TextureLoader(loadingManager)

	container = document.querySelector( '.container' );

	renderer2 = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer2.setPixelRatio( window.devicePixelRatio );
	renderer2.setSize( ratio.width, ratio.height );
	container.appendChild( renderer2.domElement );

	fov = (180 * (2 * Math.atan(ratio.height / 2 / perspective))) / Math.PI

	const sceneEmpty = new FXScene2( 0x000000, '1' );
	const sceneMenu = new FXScene2( 0x000000, '2' );
	transition2 = new Transition2( sceneEmpty, sceneMenu );

	// stats = new Stats();
	// document.body.appendChild( stats.dom );

	onWindowResize()

	document.addEventListener( 'mousemove', onDocumentMouseMove );
	window.addEventListener( 'resize', onWindowResize );
	window.addEventListener( 'orientationchange', onOrientationChange);

	music()

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

	curX = event.clientX
	curY = event.clientY

}

function onWindowResize() {

	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	if((sizes.width / sizes.height) > (ratio.width/ratio.height)){
		renderer2.setSize( sizes.width, sizes.width / (ratio.width/ratio.height) );
		camera2.aspect = sizes.width/ (sizes.width / (ratio.width/ratio.height));
	} else {
		renderer2.setSize( sizes.width, sizes.height );
		camera2.aspect = sizes.width/ sizes.height;
	}

	camera2.updateProjectionMatrix();

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


	clearTimeout(window.scrollUpdate);

	window.scrollUpdate = setTimeout(function(){

		if(scroll){scroll.update()};

	}, 500);

	function setH(){

		document.documentElement.style.setProperty('--vh', `${vh}px`);

	}

	if(nGridWrap.length != 0) {

		nGridReset();

		if(isMobile) {

			if(isFirstMove) {

				isFirstMove = false;

			}

		}

	}

	clearTimeout(window.resizedFinished);

	window.resizedFinished = setTimeout(function(){

		$('body').removeClass('progress');

		if(!isMobile) { setH(); }

		isDragging = false;

	}, 500);

	if(page == 'entrepreneur') {

		if(!isEntrepreneurActive){
			enColsFlic()
		}

	} else if(page == 'journey') {

		journeyScroll()

	} else if(page == 'author'){

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

		authorFlic();

		if(!authorStarted) {

			fillWrap(nGridInner)

			setBooks()

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

	lastWindowWidth = sizes.width

}

function onOrientationChange(){

	clearTimeout(window.resizedFinished);

	window.resizedFinished = setTimeout(function(){

		onWindowResize();

	}, 250);

};

function animate() {

	requestAnimationFrame( animate );

	// stats.update();

	render();

}

function render() {

	transition2.render( clock.getDelta() );

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

function fire(){

	if(page != 'journey') { buildScroll(true); }

	globalFunc()

	$('.siteLoader').remove();

	gsap.set('main, header', {autoAlpha: 1})

}

function openLink(url, isMain){

	$('body').append('<div class="siteLoader" style="background: #040404; position: fixed; width: 100vw; height: 100vh; top: 0; z-index: 99999;visibility: hidden;"></div>')

	if(isMain) {
		$('.siteLoader').css('background', '#1F1F1F')
	}

	gsap.to(audioLevel, 0.5, {val: 0, onUpdate: function(){
		if(isAudio && !isMuted) {
			audio.volume = audioLevel.val
		}
	} });

	gsap.to('.siteLoader', 0.5, {autoAlpha: 1, ease: "power3.out", onComplete: function(){ setTimeout(function(){ location.href = url; }, 500) } });

}

function buildScroll(val){

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

	isScroll = true;

	if(val) {

		scroll.on('scroll', (func, speed) => {

			if(canHideHeader) {
				pageScroll(func);
			}

		});

	}

};

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

	if(page == 'journey') {

		if(isHorizontal == false) {

			scrollVal = 0

			if(val != 0 ) {

				scrollVal = val.scroll.y;

			}
		}

	} else {

		scrollVal = 0

		if(val != 0 ) {

			scrollVal = val.scroll.y;

		}

		if(page == 'author') {

			if($('.au_grid_box.moved').length != 0) {

				$('.au_grid_box').each(function(){

					var $this = $(this)

					if(!$this.hasClass('active')) {

						if(sizes.width > 1000) {
							matchBoxes($this, true);
						}

					} else {
						setActive(false)
					}

				})

			}

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
			gsap.set(getWords, {autoAlpha: 1, delay: 0.3})
			if(getWords.hasClass('dirX')) {
				gsap.set(splitWords[i].words, { x: 20, autoAlpha: 0})
				gsap.to(splitWords[i].words, 0.5, { x: 0, autoAlpha: 1, ease: "power3.out", delay: 0.3, stagger: 0.1, onComplete: function(){
					splitWords[i].revert()
				} })
			} else {
				gsap.set(splitWords.words, { y: 20, autoAlpha: 0})
				gsap.to(splitWords.words, 0.5, { y: 0, autoAlpha: 1, ease: "power3.out", delay: 0.3, stagger: 0.1, onComplete: function(){
					splitWords[i].revert()
				} })
			}
		}

		if(getLines.length != 0) {
			gsap.set(getLines, {autoAlpha: 1, delay: 0.5})
			splitLines[i] = new SplitText(getLines, {type:"lines", linesClass:"SplitClass"});
			gsap.set(splitLines[i].lines, { y: 20, autoAlpha: 0})
			gsap.to(splitLines[i].lines, 0.5, { y: 0, autoAlpha: 1, ease: "power3.out", delay: 0.5, stagger: 0.1, onComplete: function(){
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
			gsap.to(eleY, 1, { y: 0, autoAlpha: 1, ease: "power3.out", delay: 0.4, stagger: 0.15 })
		}

		if(eleX.length != 0) {

			gsap.set(eleX, { x: 100, autoAlpha: 0})
			gsap.to(eleX, 1, { x: 0, autoAlpha: 1, ease: "power3.out", delay: 0.4, stagger: 0.15 })
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

function globalFunc(){

	// Menu

	var menuTL = new gsap.timeline({paused: true});

	menuTL

	.call(function(){

		$('.menu_items').removeClass('ready')

	})

	.set('.menu_wrap', {autoAlpha: 1}, 0)

	.to(transitionParams, 2, {transition2: 1, ease: "power3.inOut", onStart: function(){

	}, onUpdate:function(val){

		if(this.progress() <= 0.5 ) {

			$('header').removeClass('active')

		} else {

			$('header').addClass('active')

		}

	}}, 0)

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

		if(!isMenu && !$('body').hasClass('wait')) {

			isMenu = true
			menuTL.timeScale(1).play()
			if(scroll) { scroll.stop() }
			$('header').addClass('opened')
			$('body').addClass('hidden')

		} else {

			isMenu = false
			menuTL.timeScale(1.3).reverse()
			if(!scrollStopped) {
				if(scroll) { scroll.start() }
				$('body').removeClass('hidden')
			}
			$('header').removeClass('opened')

		}

	})

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

		} else {

			if(page == 'author') {
				if(inBound && sizes.width <= 1000) {
					flickity_handle_wheel_event(e, authorCarousel);
				}
			}

		}

	}

	menuCur.on( 'dragStart', function( event, pointer ) {

		isDragging = true;

	});

	menuCur.on( 'settle', function( event, index ) {

		isDragging = false;

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

	if(!isMobile){

		cerchio = document.querySelectorAll('.mg');

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

	if(page == 'monk') {

		monkPage()

	} else if(page == 'entrepreneur') {

		entrepreneurPage()

	} else if(page == 'journey') {

		journeyPage()

	} else if(page == 'author') {

		authorPage()

	}

}

function stopScroll(){

	scrollStopped = true;

	$('body').addClass('hidden')

	scroll.stop()

}

function startScroll(){

	scrollStopped = false;

	$('body').removeClass('hidden')

	scroll.start()

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

function monkPage(){

	var $imgs1 = $('.monk_visuals i.a'),
		$imgs2 = $('.monk_visuals i.b'),
		slidesTotal = $('.monk_slide').length,
		slidesTL,
		activeSection = 0,
		getActive = $('.monk_slide').eq(0),
		navCarousel;

	stopScroll()

	getActive.find('.monk_visuals').addClass('prx')

	gsap.set(getActive, {autoAlpha: 1})

	gsap.from(getActive.find('.monk_text ._ele.alt_h2 i'), 0.5, {autoAlpha: 0, ease: 'power3.in', delay: 1})

	gsap.from(getActive.find('.monk_text ._ele:not(.alt_h2) i'), 0.7, {y: '150%', ease: 'power3.out', delay: 1, stagger: 0.1})

	gsap.from(getActive.find('.monk_text .mobile_explore'), 0.7, {y: 20, autoAlpha: 0, ease: 'power3.out', delay: 1.5})

	gsap.fromTo(getActive.find($imgs1), 1, {x: -100, autoAlpha: 0}, {x: 0, autoAlpha: 1, ease: 'power3.out', delay: 1})

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
		autoAlpha: 0}, {x: 0, y: 0, autoAlpha: 1, ease: 'power3.out', delay: 1
	})

	canScroll = true

	navCarousel = new Flickity( '.monk_nav_items', {
		prevNextButtons: false,
		accessibility: true,
		pageDots: false,
		contain: true,
		cellAlign: 'left',
		selectedAttraction: 0.08,
		friction:  1
	});

	navCarousel.on( 'dragStart', function( event, pointer ) {

		isDragging = true;

	});

	navCarousel.on( 'settle', function( event, index ) {

		isDragging = false;

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

	if(!isMobile) {

		$(window).on('mousewheel DOMMouseScroll', function (e) {

			if(canScroll) {

				var direction = (function () {

					var delta = (e.type === 'DOMMouseScroll' ? e.originalEvent.detail * -40 : e.originalEvent.wheelDelta);

					return delta > 0 ? 0 : 1;

				}());

				direction == 1 ? nextSlide() : prevSlide()

			}

		});

	} else {

		$(window).on('touchstart', function (e){

			if(canScroll) {

				ts = e.originalEvent.touches[0].clientX;

			}

		});

		$(window).on('touchend', function (e){

			if(canScroll) {

				var te = e.originalEvent.changedTouches[0].clientX;

				if(ts > te + 25){

					nextSlide()

				} else if(ts < te - 25){

					prevSlide()

				}

			}

		});


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

		.staggerFromTo(newSlide.find('.monk_text ._ele:not(.alt_h2) i'), 0.7, {y: 150 * -dir + '%'}, {y: '0%', ease: 'power3.out'}, 0.1 * -dir, 1)

		.fromTo(newSlide.find('.monk_text .mobile_explore'), 0.7, {y: 20 * -dir, autoAlpha: 0}, {y: 0, autoAlpha: 1, ease: 'power3.out'}, 1.5)

		.call(function(){

			$('.monk_slide.active').removeClass('active').find('.monk_visuals').removeClass('prx')

			newSlide.addClass('active').find('.monk_visuals').addClass('prx')

			canScroll = true

		})

	}

	$(document).on('click', function(){

		if(sizes.width > 768) {
			clicked()
		}

	})

	$('.mobile_explore').on('click', function(){

		clicked()

	})

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

	$('a, .header_side, .monk_nav_set').on('mouseenter', function(){

		if(!isButtonHidden && !isClicked && !isMenu) {

			isButtonHidden = true;

			gsap.to('.explore_btn', 0.5, { scale: 0, ease: 'back.inOut'})
		}

	}).on('mouseleave', function(){

		if(isButtonHidden && !isClicked && !isMenu) {

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

	function loadContent(index, val){

		imagesLoaded = false;

		var activeIndex = index

		if(val) {

			$('.monk_nav_item.active').removeClass('active')

			$('.monk_nav_item').eq(index).addClass('active')

		}

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

			if(imagesLoaded) {

				imagesLoaded = false;

				clearInterval(siteIntrvl);

				excute()
			};

		}, 50);


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

}

let lastActive,
	isFirstHover = true,
	labTL;

function entrepreneurPage(){

	stopScroll()

	if(!isEntrepreneurActive){
		if(!isSafari && !isMobile) {
			$('.en_col_set').find('.en_col').append('<div class="en_mask has-svg full_bg"><svg viewBox="0 0 264 652" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><defs><clipPath id="maskRect1" clipPathUnits="objectBoundingBox" transform="scale(0.003787878787879, 0.001533742331288)"><path fill="none" stroke="#373636" stroke-width="1.9845" d="M260.6,616.6v-45.3v-64.2v-30.2v-73.6l-2.4-73.6l-1.4-99.8 c-0.8-34.6-2-104.8-2-106.3c0-1.9,1-31.8,1-52.6c0-20.8-2.4-30.2-2.4-41.5c0-9.1,2.7-21.4,1.1-26.4c-6.4,0-27.4,0-37,0 c-12,0-33.5,1.9-35.9,1.9c-2.4,0-7.2-1.9-12-1.9h-33.5c-4.8,0-38.3,1.9-50.3,0c-12-1.9-12,0-14.4,0h-24c-3.8,0-30.3-1.3-43.1-1.9 v28.3l2.4,56.6V102v25.7l2.8,37.2l-2.8,99.7v10.3l-2.4,17L1.9,393.9L0.5,510.5v12.9v21.4l1,33.2c-0.8,10.1,0.4,22,0.4,31.1 s1.6,32.1,0,37.8c4.8-0.6,7.2,0,16.8,0c9.6,0,25.9,0.3,33.1,0.9c3.2,0.6,9.5,1,12.4,1c2.4,0,18.4,0.6,26.4,1.9 c4.8,0,17.7-0.4,31.1-1.9c13.4-1.5,32.7-0.6,40.7,0l19.2,1.9l19.2-1.9l43.1,1.9l16.9-0.1L260.6,616.6z"/></clipPath></defs></svg></div>')
			$('.en_borders').append('<svg width="264" height="652" viewBox="0 0 264 652" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M47.434 3.11371C43.6012 3.11371 17.0906 1.85525 4.31438 1.22601L4.31438 29.5415L6.70992 86.1724L6.70991 102.028L6.70991 127.702L9.47704 164.858L6.70991 264.597L6.70991 274.942L4.31437 291.931L1.91883 393.867L0.518677 510.465L0.518654 523.376L0.518653 544.728L1.50865 577.965C0.710134 588.032 1.91882 600.004 1.91882 609.065C1.91882 618.126 3.51592 641.156 1.9189 646.819C6.70997 646.189 9.10543 646.819 18.6876 646.819C28.2697 646.819 44.5938 647.121 51.7804 647.75C54.9745 648.379 61.2365 648.706 64.2028 648.706C66.6448 648.706 82.5685 649.336 90.5537 650.594C95.3447 650.594 108.281 650.216 121.696 648.706C135.111 647.196 154.435 648.077 162.42 648.706L181.584 650.594L200.748 648.706L243.868 650.594L260.809 650.496L260.637 616.615L260.637 571.311L260.637 507.129L260.637 476.926L260.637 403.306L258.241 329.685L256.827 229.907C256.029 195.3 254.837 125.153 254.837 123.643C254.837 121.755 255.846 91.8355 255.846 71.0709C255.846 50.3062 253.45 40.8677 253.45 29.5415C253.45 20.4805 256.102 8.15451 254.505 3.12065C248.117 3.12065 227.099 3.11372 217.517 3.11372C205.539 3.11372 183.98 5.00142 181.584 5.00142C179.189 5.00142 174.397 3.11372 169.606 3.11372L136.069 3.11372C131.278 3.11372 97.7403 5.00141 85.7626 3.11371C73.7849 1.22602 73.7849 3.11371 71.3894 3.11371L47.434 3.11371Z" stroke="#373636" stroke-width="1.98448"/><path fill-rule="evenodd" clip-rule="evenodd" d="M3.06166 564.789C3.26751 542.412 3.4633 521.128 3.4633 497.312C3.4633 476.378 3.66321 455.533 4.64366 434.672C5.18715 423.109 5.00603 411.352 4.82519 399.613C4.73494 393.755 4.64475 387.9 4.64475 382.077C4.64475 368.769 4.93983 355.402 5.23524 342.039L5.23654 341.98C5.53143 328.64 5.8262 315.306 5.8262 302.064C5.8262 296.45 6.40803 290.803 6.99831 285.074L7.00243 285.034C7.59231 279.308 8.1891 273.502 8.1891 267.669C8.1891 261.349 7.89247 255.018 7.59728 248.734L7.59495 248.685C7.30018 242.41 7.00765 236.183 7.00766 230.015L7.00766 189.134C8.41333 180.698 8.30767 177.505 8.13235 172.208C8.06241 170.095 7.98138 167.646 7.9808 164.397C8.86759 151.956 8.39145 137.638 7.69786 122.657C7.57785 120.065 7.45132 117.453 7.3241 114.827C6.71473 102.246 6.0895 89.3389 6.08876 76.7351C7.02187 56.1878 7.01704 48.9366 7.00918 37.1692C7.00844 36.052 7.00766 34.8941 7.00766 33.6803L7.00767 0.992239C7.00767 0.44424 6.56343 2.60308e-07 6.01543 2.36354e-07C5.46743 2.124e-07 5.02319 0.44424 5.02319 0.992238L5.02319 33.6803C5.02319 34.8957 5.02396 36.0548 5.02471 37.1729C5.03259 48.9265 5.03742 56.1476 4.1053 76.6676L4.10428 76.6901L4.10428 76.7126C4.10428 89.3762 4.73278 102.349 5.34264 114.938C5.46969 117.56 5.59593 120.166 5.71551 122.749C6.41005 137.751 6.87968 151.973 5.99885 164.29L5.99632 164.326L5.99632 164.361C5.99632 167.74 6.07927 170.24 6.14993 172.37C6.32347 177.599 6.42283 180.594 5.03675 188.888L5.02318 188.97L5.02318 230.015C5.02318 236.23 5.31753 242.496 5.61156 248.754L5.61499 248.827C5.91053 255.118 6.20462 261.403 6.20462 267.669C6.20462 273.383 5.61997 279.088 5.0284 284.83L5.01904 284.921C4.43234 290.615 3.84173 296.348 3.84173 302.064C3.84173 315.284 3.54736 328.6 3.25231 341.947L3.25124 341.995C2.95592 355.354 2.66028 368.744 2.66028 382.077C2.66028 387.967 2.75114 393.855 2.84179 399.73C3.02235 411.43 3.20207 423.075 2.66137 434.579C1.67872 455.486 1.47882 476.368 1.47882 497.312C1.47882 521.119 1.28311 542.394 1.07725 564.772L1.04358 568.436C0.82593 592.17 0.608249 617.348 0.608248 648.224C0.608248 648.772 1.05249 649.216 1.60049 649.216C2.14848 649.216 2.59272 648.772 2.59272 648.224C2.59273 617.358 2.81033 592.187 3.02797 568.454L3.06166 564.789Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M0.76118 481.282C1.09127 485.844 1.30408 490.336 0.852552 494.748C0.381985 499.346 0.408209 503.896 0.536746 508.406C0.57155 509.628 0.613722 510.844 0.655802 512.058C0.769788 515.345 0.883099 518.613 0.847475 521.911C0.770378 529.05 0.793238 535.203 0.818843 542.096C0.832726 545.833 0.847417 549.788 0.847417 554.235C0.847417 558.385 0.86426 562.475 0.881092 566.532L0.881469 566.623C0.898177 570.65 0.914749 574.644 0.914749 578.636C0.914749 584.852 0.818026 591.095 0.720457 597.393L0.718365 597.528C0.620131 603.869 0.521743 610.265 0.521743 616.73C0.521743 617.278 0.965984 617.722 1.51398 617.722C2.06198 617.722 2.50622 617.278 2.50622 616.73C2.50622 610.283 2.60434 603.902 2.7026 597.559L2.70481 597.416C2.8023 591.124 2.89923 584.868 2.89923 578.636C2.89923 574.64 2.88264 570.642 2.86594 566.617L2.86555 566.524C2.84872 562.466 2.83189 558.38 2.83189 554.235C2.83189 549.771 2.81716 545.809 2.80326 542.07C2.77767 535.188 2.75488 529.058 2.83184 521.933C2.86799 518.586 2.75233 515.25 2.63782 511.948C2.59606 510.744 2.55445 509.544 2.52042 508.35C2.39251 503.861 2.36967 499.416 2.82672 494.95C3.29702 490.355 3.07169 485.716 2.74048 481.139C2.67442 480.226 2.60426 479.316 2.53435 478.41C2.2518 474.747 1.97322 471.136 1.98482 467.554C2.0013 462.464 2.31903 457.452 2.63884 452.408L2.65059 452.223C2.97372 447.126 3.29515 441.995 3.29515 436.774C3.29515 436.226 2.85091 435.782 2.30291 435.782C1.75491 435.782 1.31067 436.226 1.31067 436.774C1.31067 441.922 0.993735 446.992 0.670093 452.097L0.656707 452.308C0.338008 457.335 0.017028 462.397 0.000355745 467.547C-0.011525 471.217 0.275032 474.929 0.55838 478.599C0.62764 479.496 0.696709 480.391 0.76118 481.282Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.08852 53.5721C5.22317 40.2537 5.05255 27.0593 7.77094 14.6529C7.88823 14.1176 7.54937 13.5886 7.01407 13.4713C6.47877 13.354 5.94974 13.6929 5.83245 14.2282C3.0521 26.9174 3.24017 40.3408 4.10822 53.7008C4.3826 57.9237 4.72399 62.1331 5.06299 66.3128C5.80059 75.4073 6.52686 84.362 6.52686 93.0137L6.52685 172.682C6.52685 191.58 5.89713 211.805 5.26671 232.051L5.26643 232.06C4.63632 252.295 4.00561 272.549 4.00561 291.481C4.00561 292.029 4.44985 292.473 4.99785 292.473C5.54585 292.473 5.99009 292.029 5.99009 291.481C5.99009 272.583 6.61981 252.357 7.25023 232.112L7.25051 232.103C7.88062 211.868 8.51133 191.613 8.51133 172.682L8.51133 93.0137C8.51133 84.2804 7.77436 75.1903 7.03356 66.053C6.69628 61.8927 6.3582 57.7227 6.08852 53.5721Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M1.82166 523.787C2.36957 523.797 2.82179 523.361 2.83172 522.813C4.23636 445.333 5.65135 367.271 5.65135 289.761C5.65135 289.213 5.20711 288.769 4.65911 288.769C4.11112 288.769 3.66688 289.213 3.66688 289.761C3.66687 367.25 2.25227 445.294 0.847568 522.777C0.837635 523.325 1.27375 523.777 1.82166 523.787Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M254.552 4.00989C255.099 3.98474 255.564 4.40814 255.589 4.95557C257.849 54.1932 258.636 105.391 258.636 155.614C258.636 176.549 258.836 197.394 259.817 218.254C260.36 229.818 260.179 241.574 259.998 253.313C259.908 259.172 259.818 265.026 259.818 270.85C259.818 284.157 260.113 297.525 260.408 310.888L260.41 310.947C260.705 324.286 260.999 337.621 260.999 350.863C260.999 356.477 261.581 362.124 262.171 367.853L262.176 367.893C262.765 373.619 263.362 379.425 263.362 385.258C263.362 391.578 263.066 397.909 262.77 404.192L262.768 404.242C262.473 410.517 262.181 416.743 262.181 422.911L262.181 463.875C262.181 466.851 262.049 469.956 261.917 473.067C261.824 475.258 261.731 477.452 261.683 479.607C261.567 484.886 261.717 490.077 262.75 494.961L262.772 495.063L262.772 495.166C262.772 510.777 262.394 523.677 262.016 536.353L262.001 536.878C261.629 549.346 261.264 561.629 261.262 576.117C262.642 583.107 262.868 590.414 262.754 597.683C262.703 600.896 262.588 604.069 262.474 607.208C262.326 611.274 262.181 615.283 262.181 619.246C262.181 624.703 262.086 629.923 261.991 635.133L261.991 635.137C261.896 640.351 261.801 645.555 261.801 650.992C261.801 651.54 261.357 651.984 260.809 651.984C260.261 651.984 259.817 651.54 259.817 650.992C259.817 645.535 259.912 640.315 260.007 635.105L260.007 635.101C260.102 629.888 260.196 624.684 260.196 619.246C260.196 615.288 260.345 611.181 260.493 607.057C260.607 603.913 260.721 600.759 260.77 597.652C260.884 590.397 260.653 583.221 259.297 576.408L259.277 576.312L259.277 576.214C259.277 561.655 259.645 549.319 260.017 536.827L260.033 536.294C260.409 523.646 260.785 510.801 260.787 495.27C259.726 490.191 259.583 484.855 259.699 479.563C259.749 477.31 259.844 475.09 259.937 472.897C260.068 469.841 260.196 466.839 260.196 463.875L260.196 422.911C260.196 416.697 260.491 410.431 260.785 404.172L260.788 404.099C261.084 397.808 261.378 391.524 261.378 385.258C261.378 379.543 260.793 373.838 260.202 368.096L260.192 368.006C259.606 362.311 259.015 356.579 259.015 350.863C259.015 337.643 258.721 324.327 258.425 310.98L258.424 310.932C258.129 297.573 257.833 284.183 257.833 270.85C257.833 264.959 257.924 259.071 258.015 253.197C258.196 241.497 258.375 229.851 257.835 218.347C256.852 197.441 256.652 176.559 256.652 155.614C256.652 105.41 255.864 54.2444 253.606 5.04657C253.581 4.49915 254.005 4.03503 254.552 4.00989Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M254.242 141.729C254.501 137.958 254.755 134.246 254.716 130.605C254.675 126.881 254.714 123.477 254.752 120.107C254.827 113.445 254.9 106.919 254.362 98.331L254.356 98.2389L254.367 98.1474C255.353 90.155 256.087 82.2808 256.087 74.2904C256.087 71.5315 256.115 68.7796 256.142 66.0335C256.24 56.2372 256.338 46.5156 255.18 36.8191C255.115 36.275 255.503 35.7812 256.047 35.7162C256.591 35.6512 257.085 36.0396 257.15 36.5837C258.325 46.4203 258.225 56.3112 258.126 66.1273C258.099 68.855 258.072 71.577 258.072 74.2904C258.072 82.3677 257.333 90.3037 256.348 98.2989C256.885 106.911 256.811 113.538 256.736 120.22C256.698 123.575 256.661 126.943 256.7 130.584C256.74 134.311 256.479 138.121 256.22 141.898C256.16 142.773 256.1 143.646 256.044 144.516C255.745 149.167 255.554 153.75 256.009 158.194C256.936 167.251 257.128 176.329 257.157 185.373C257.18 192.36 257.172 200.253 257.164 207.829C257.161 211.502 257.157 215.101 257.157 218.486C257.157 219.034 256.713 219.478 256.165 219.478C255.617 219.478 255.173 219.034 255.173 218.486C255.173 215.097 255.176 211.496 255.18 207.821C255.187 200.248 255.195 192.363 255.173 185.379C255.143 176.352 254.952 167.354 254.035 158.396C253.562 153.776 253.764 149.051 254.064 144.389C254.121 143.499 254.182 142.613 254.242 141.729Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M261.262 599.354C260.396 612.672 260.226 625.867 262.944 638.273C263.061 638.808 262.722 639.338 262.187 639.455C261.652 639.572 261.123 639.233 261.006 638.698C258.225 626.009 258.413 612.585 259.281 599.225C259.556 595.002 259.897 590.793 260.236 586.613C260.974 577.519 261.7 568.564 261.7 559.912L261.7 480.244C261.7 461.343 261.23 443.61 260.759 425.862L260.758 425.857C260.288 408.114 259.817 390.357 259.817 371.428C259.817 370.88 260.261 370.435 260.809 370.435C261.357 370.435 261.801 370.88 261.801 371.428C261.801 390.329 262.272 408.062 262.742 425.81L262.743 425.815C263.213 443.558 263.684 461.315 263.684 480.244L263.684 559.912C263.684 568.646 262.947 577.736 262.207 586.873C261.869 591.033 261.531 595.203 261.262 599.354Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M256.312 127.617C256.86 127.607 257.312 128.043 257.322 128.591C257.659 147.221 258.037 165.974 258.417 184.792C259.614 244.222 260.825 304.294 260.825 363.165C260.825 363.713 260.38 364.158 259.832 364.158C259.284 364.158 258.84 363.713 258.84 363.165C258.84 304.316 257.63 244.272 256.433 184.846C256.053 166.025 255.675 147.266 255.338 128.627C255.328 128.079 255.764 127.626 256.312 127.617Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M255.581 4.44211C255.511 4.98555 255.013 5.36897 254.47 5.29849C240.772 3.52201 224.647 3.69161 209.752 3.84828C205.637 3.89156 201.615 3.93386 197.765 3.93386C196.373 3.93386 194.966 4.24794 193.454 4.59513L193.342 4.62068C191.905 4.95092 190.357 5.30673 188.822 5.30673C188.073 5.30673 187.248 5.33409 186.366 5.36338C186.291 5.36586 186.216 5.36836 186.14 5.37085C185.18 5.40252 184.163 5.43357 183.149 5.4283C181.145 5.41788 179.046 5.26753 177.334 4.63503C177.206 4.58782 177.003 4.57231 176.6 4.5939C176.552 4.59647 176.499 4.59982 176.442 4.60342C176.115 4.62416 175.655 4.65328 175.237 4.59007C174.688 4.50712 174.154 4.39503 173.661 4.29156C173.466 4.2508 173.278 4.21137 173.098 4.17559C172.439 4.04444 171.819 3.94608 171.148 3.93369C169.053 3.89498 166.943 3.74323 164.863 3.59359C164.693 3.58141 164.524 3.56924 164.355 3.55715C162.1 3.39574 159.879 3.24742 157.683 3.24742L144.888 3.24742C141.201 3.24742 137.627 3.54071 133.992 3.83899C132.163 3.989 130.32 4.14027 128.439 4.25613C127.107 4.33819 125.774 4.42438 124.441 4.51063C118.296 4.90813 112.134 5.30672 105.906 5.30672C101.813 5.30672 97.8003 4.78577 93.858 4.27394L93.8185 4.26881C89.8431 3.75267 85.9378 3.24742 81.9672 3.24742L81.8522 3.24741C78.5515 3.24726 75.8734 3.24714 72.9982 4.37964C72.2577 4.67134 71.3038 4.74439 70.3615 4.73688C69.3919 4.72917 68.3105 4.63281 67.2515 4.51265C66.593 4.43793 65.9191 4.35098 65.2802 4.26854C64.9003 4.21952 64.5328 4.17209 64.1883 4.12979C63.2341 4.01264 62.4492 3.93385 61.8992 3.93385C60.2005 3.93385 58.8576 4.08835 57.5444 4.23945C57.0854 4.29225 56.6301 4.34464 56.1645 4.38987C54.3712 4.56406 52.5509 4.61134 50.1343 4.08252C49.2041 3.87898 48.252 3.89814 47.1825 3.91967C46.8365 3.92664 46.4781 3.93385 46.1043 3.93385C43.735 3.93385 41.304 3.7216 38.9402 3.51522C37.8006 3.41572 36.6766 3.31759 35.5827 3.24525C25.9816 2.6104 16.429 2.33913 6.78938 2.21768C6.24142 2.21078 5.80281 1.76097 5.80972 1.21302C5.81662 0.665066 6.26642 0.226457 6.81438 0.233361C16.4734 0.355058 26.0643 0.627057 35.7136 1.2651C36.8984 1.34345 38.0689 1.44593 39.2306 1.54764C41.5422 1.75004 43.8189 1.94937 46.1043 1.94937C46.3816 1.94937 46.6767 1.94302 46.984 1.93641C48.0984 1.91242 49.3751 1.88494 50.5585 2.14392C52.7101 2.61474 54.3097 2.57622 55.9726 2.41469C56.3819 2.37494 56.8027 2.32646 57.2409 2.27598C58.5779 2.12197 60.0762 1.94937 61.8992 1.94937C62.5872 1.94937 63.4859 2.04417 64.4301 2.1601C64.8009 2.20564 65.179 2.25445 65.5627 2.304C66.1872 2.38465 66.8268 2.46725 67.4753 2.54083C68.5134 2.65862 69.5129 2.74559 70.3773 2.75247C71.269 2.75957 71.9022 2.6785 72.271 2.53324C75.5004 1.2612 78.5128 1.26202 81.715 1.26289L81.9672 1.26294C86.0798 1.26294 90.1046 1.78548 94.0531 2.29813L94.0741 2.30085C98.0498 2.81703 101.949 3.32225 105.906 3.32225C112.063 3.32225 118.148 2.92878 124.291 2.53161C125.63 2.44504 126.971 2.35829 128.317 2.2754C130.111 2.16488 131.912 2.01741 133.72 1.86928C137.405 1.56745 141.123 1.26294 144.888 1.26294L157.683 1.26294C159.959 1.26294 162.245 1.41657 164.497 1.57774C164.663 1.58964 164.829 1.60158 164.995 1.61351C167.087 1.76387 169.145 1.91186 171.184 1.94955C172.028 1.96514 172.782 2.08929 173.486 2.22923C173.708 2.27341 173.919 2.31786 174.127 2.36134C174.597 2.46008 175.043 2.55379 175.533 2.6279C175.724 2.65671 175.932 2.64457 176.263 2.62528C176.334 2.62116 176.411 2.61671 176.493 2.61227C176.886 2.59124 177.468 2.56883 178.022 2.77361C179.389 3.2789 181.194 3.43363 183.16 3.44385C184.131 3.4489 185.114 3.41916 186.075 3.38745C186.152 3.3849 186.23 3.38232 186.307 3.37976C187.18 3.35074 188.038 3.32225 188.822 3.32225C190.129 3.32225 191.488 3.01025 193.01 2.66098C194.487 2.32173 196.111 1.94938 197.765 1.94938C201.565 1.94938 205.55 1.90729 209.642 1.86407C224.554 1.70658 240.875 1.53422 254.725 3.33049C255.269 3.40097 255.652 3.89866 255.581 4.44211Z" fill="#373636"/><path fill-rule="evenodd" clip-rule="evenodd" d="M261.801 650.992C261.801 651.54 261.357 651.984 260.809 651.984C249.335 651.984 237.631 651.444 226.512 650.905C225.91 650.876 225.309 650.847 224.711 650.818C214.245 650.309 204.352 649.828 195.671 649.828C194.174 649.828 192.739 650.04 191.246 650.265L191.154 650.279C189.712 650.497 188.205 650.725 186.654 650.725L174.598 650.725L174.414 650.648C174.294 650.598 174.098 650.579 173.681 650.604C173.633 650.607 173.579 650.611 173.52 650.615C173.181 650.639 172.691 650.675 172.247 650.599C171.945 650.547 171.288 650.506 170.376 650.479C169.489 650.453 168.426 650.441 167.354 650.437C166.392 650.434 165.414 650.436 164.559 650.438C163.531 650.44 162.681 650.442 162.246 650.433C160.03 650.387 158.587 650.248 157.217 650.116C157.127 650.107 157.038 650.098 156.948 650.09C155.512 649.952 154.094 649.828 151.815 649.828C149.628 649.828 147.773 649.922 145.894 650.017L145.886 650.018C144.011 650.113 142.112 650.209 139.871 650.209C137.843 650.209 135.966 650.162 134.144 650.116C130.664 650.028 127.382 649.946 123.632 650.207C116.164 650.727 109.521 650.726 102.132 650.725C101.773 650.725 101.413 650.725 101.051 650.725C96.8362 650.725 92.8212 650.5 88.8339 650.276L88.8124 650.275C84.8108 650.051 80.8366 649.828 76.6648 649.828C75.2012 649.828 74.4809 649.897 73.4369 649.997C73.2866 650.012 73.1295 650.027 72.9626 650.042C71.6389 650.166 69.7604 650.316 65.8412 650.428C65.0935 650.708 64.1739 650.78 63.271 650.772C62.2586 650.763 61.1311 650.649 60.0298 650.508C59.345 650.42 58.6432 650.318 57.9786 650.221C57.584 650.163 57.2025 650.107 56.8456 650.058C55.8534 649.92 55.0429 649.828 54.4776 649.828C52.0417 649.828 50.7083 649.679 49.3657 649.529L49.2536 649.516C47.9075 649.366 46.5059 649.216 43.8175 649.216L43.6965 649.216L43.579 649.187C43.0025 649.044 41.8723 648.991 40.5927 648.986C39.9748 648.984 39.3536 648.993 38.7909 649.002C38.6898 649.004 38.5902 649.005 38.4926 649.007C38.0532 649.014 37.6552 649.021 37.3475 649.021C36.1754 649.021 35.0483 649.051 33.9311 649.081C31.7144 649.141 29.5367 649.199 27.123 649.018C22.1763 648.648 18.3271 648.731 14.4492 648.891C13.774 648.919 13.097 648.949 12.4127 648.979C9.16734 649.124 5.75667 649.276 1.58682 649.216C1.03888 649.208 0.601013 648.758 0.608826 648.21C0.616638 647.662 1.06714 647.224 1.61508 647.232C5.72173 647.29 9.06779 647.141 12.3101 646.997C12.9985 646.967 13.6823 646.936 14.3676 646.908C18.2802 646.747 22.2152 646.661 27.2711 647.039C29.5903 647.213 31.5946 647.158 33.7444 647.1C34.8819 647.069 36.0603 647.037 37.3475 647.037C37.6367 647.037 38.0125 647.03 38.451 647.023C38.5504 647.021 38.6529 647.019 38.7583 647.018C39.3233 647.008 39.9612 647 40.6001 647.002C41.7751 647.006 43.077 647.047 43.9307 647.232C46.6439 647.236 48.1022 647.39 49.4741 647.544L49.5903 647.557C50.9025 647.704 52.1521 647.844 54.4776 647.844C55.1989 647.844 56.1379 647.956 57.1186 648.092C57.5051 648.146 57.8984 648.203 58.2974 648.262C58.9457 648.356 59.609 648.453 60.2824 648.54C61.3604 648.678 62.3954 648.78 63.2889 648.788C64.2111 648.796 64.8568 648.701 65.2301 648.535L65.4098 648.455L65.6064 648.449C69.6093 648.338 71.4815 648.188 72.778 648.067C72.9408 648.051 73.0955 648.037 73.245 648.022C74.3034 647.921 75.1042 647.844 76.6648 647.844C80.8997 647.844 84.9272 648.07 88.9207 648.293L88.9235 648.294C92.9253 648.518 96.8929 648.74 101.051 648.74C101.407 648.74 101.761 648.74 102.113 648.741C109.517 648.742 116.097 648.743 123.494 648.227C127.332 647.96 130.775 648.046 134.318 648.134C136.121 648.179 137.951 648.225 139.871 648.225C142.059 648.225 143.914 648.131 145.793 648.036L145.801 648.035C147.675 647.94 149.574 647.844 151.815 647.844C154.183 647.844 155.671 647.974 157.138 648.114C157.227 648.123 157.315 648.132 157.404 648.14C158.766 648.271 160.147 648.404 162.288 648.449C162.707 648.458 163.512 648.456 164.507 648.454C165.361 648.452 166.355 648.449 167.361 648.453C168.439 648.457 169.522 648.468 170.434 648.495C171.322 648.521 172.119 648.563 172.581 648.643C172.77 648.675 172.975 648.661 173.318 648.639C173.392 648.634 173.473 648.629 173.561 648.623C173.921 648.601 174.446 648.577 174.968 648.74L186.654 648.74C188.055 648.74 189.435 648.532 190.923 648.307L190.95 648.303C192.426 648.08 194.003 647.844 195.671 647.844C204.402 647.844 214.341 648.327 224.788 648.835C225.393 648.864 226 648.893 226.608 648.923C237.731 649.462 249.389 650 260.809 650C261.357 650 261.801 650.444 261.801 650.992Z" fill="#373636"/><path d="M253.921 3.99796C253.921 8.51124 253.921 13.0245 253.921 17.5378C253.921 19.5703 253.881 21.9323 254.311 23.9183C255 27.1041 254.753 30.2382 255.06 33.4441C255.352 36.5009 255.809 39.4643 255.809 42.5505C255.809 44.5047 256.02 46.5326 256.093 48.4967C256.239 52.4229 256.23 56.3542 256.363 60.2841C256.497 64.2504 256.73 68.212 256.872 72.1764C256.95 74.3713 256.844 76.5711 256.887 78.7666C256.927 80.8202 255.809 88.2195 255.809 90.2941" stroke="#373636" stroke-width="2.97671" stroke-linecap="round"/><path d="M2.00854 620.149C4.48914 576.49 2.50466 535.238 2.50466 493.398" stroke="#373636" stroke-width="2.97671" stroke-linecap="round"/></svg>')
		}
	}

	$('.en_wrap').on('mouseleave', function(){

		if(!isEntrepreneurActive && !$('body').hasClass('wait')) {

			$(this).removeClass('mouseenter')	

			if(!isColsFlickity) {

				$('.en_col_set').removeClass('hover')

				lastActive = -1

				gsap.to('.en_lab_set', 0.5, { autoAlpha: 0, ease: "power3.out", onComplete: function(){ isFirstHover = true } })

			}

		}

	})

	$('.en_col_set').each(function(){

		let color = $(this).attr('data-color')

		$(this).find('.en_col > i').css('background-color', hexToRgbA(color, 0.7))

	})


	$('.en_col_set').on('mouseenter', function(){

		if(!isColsFlickity && !isEntrepreneurActive) {

			let title = $(this).attr('data-title'),
				index = $(this).index();

			if(lastActive != index) {

				lastActive = index

				updateLab(title, index)

			}

			$('.en_wrap').addClass('mouseenter')	

			$('.en_col_set').removeClass('hover')

			$(this).addClass('hover')
		}

	}).on('click', function(){

		if(!isDragging && !isEntrepreneurActive && !$('body').hasClass('wait')) {

			isEntrepreneurActive = true;

			$(this).addClass('no-tranist')

			$('.en_col_set').each(function(i){

				let $this = $(this);

				if(!$this.hasClass('no-tranist')) {

					$this.addClass('hide')

				} else {

					$this.addClass('target')

				}

			})

			gsap.to('.en_lab_set', 0.5, { autoAlpha: 0, ease: "power3.out" })

			gsap.to('.hide', 0.5, {opacity: 0, ease: 'power3.out', onComplete: function(){

				let $this = $('.target'),
					width = $this.outerWidth(),
					posX = $this.offset().left,
					posY = $this.offset().top;

				if(isColsFlickity) {

					isColsFlickity = false;

					enCarousel.destroy();

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

	})

	function showContent(){

		// appendImgs(false)

		// siteIntrvl = setInterval(function () {

		// 	if(imagesLoaded) {

		// 		imagesLoaded = false;

		// 		clearInterval(siteIntrvl);

		// 		excute()
		// 	};

		// }, 50);

		$('.en_scroll').click(function(){

			scroll.scrollTo('.scroll_to', {
				duration: 400,
				disableLerp: false,
			})

		})

		$('#epSection').remove();

		$('.getContent').show();

		canHideHeader = true;

		let contentTL = new gsap.timeline({ delay: 0 })

		var split1 = new SplitText('._sp1', {type:"chars", charsClass:"SplitClass"}),
			target1 = split1.chars,
			split2 = new SplitText('._sp2', {type:"lines", linesClass:"SplitClass"}),
			target2 = split2.lines;

		contentTL.set('.en_head', {autoAlpha: 1}, 0)

		.from('.en_shape', 0.5, {x: 400, autoAlpha: 0, ease: 'power3.Out', stagger: 0.5}, 0)

		.from('.en_head .alt_h1', 0.5, {x: 100, autoAlpha: 0, ease: 'power3.out'}, 0)

		.from(target1, 0.5, {x: 100, autoAlpha: 0, ease: 'power3.out', stagger: 0.07}, 0)

		.from(target2, 0.5, {y: 50, autoAlpha: 0, ease: 'power3.out', stagger: 0.1}, 0.5)

		.set('.en_scroll', {autoAlpha: 1}, 1)

		.from('.en_scroll span', 1, {x: 30, autoAlpha: 0, ease: 'power3.out'}, 1)

		.from('.en_scroll i', 1, {scaleX: 0, ease: 'power3.out'}, 1.2)

		.call(function(){

			$('body').removeClass('add-transit');

			startScroll()

			split1.revert()

			split2.revert()

			if(scroll) {
				scroll.update()
			}

		})

	}

}

function updateLab(title, index){

	if(labTL) {
		labTL.kill()
		labTL = new gsap.timeline()
	} else {
		labTL = new gsap.timeline()
	}

	var labWords = new SplitText('.en_lab > span', {type:"words", wordsClass:"SplitClass"});

	labTL

	.to(labWords.words, 0.5, { y: '-110%', ease: "power3.in", stagger: 0.06 })

	.call(function(){

		$('.en_lab > span').html(title)

		labWords = new SplitText('.en_lab > span', {type:"words", wordsClass:"SplitClass"});

		if(isFirstHover){

			isFirstHover = false;

			gsap.to('.en_lab_set', 1, { autoAlpha: 1, ease: "power3.out" })

		}

		gsap.from(labWords.words, 0.5, { y: '110%', ease: "power3.out", stagger: 0.06 })

	})

}


function enColsFlic() {

	if((sizes.width / sizes.height) < (3/2)){

		if ( isColsFlickity == false ) {

			build();

		};

	} else {

		if ( isColsFlickity == true ) {

			lastActive = -1

			$('.en_col_set').removeClass('bigger').css('width', '')

			gsap.to('.en_lab_set', 0.5, { autoAlpha: 0, ease: "power3.out", onComplete: function(){ isFirstHover = true } })

			isColsFlickity = false;

			enCarousel.destroy();

		};

	};


	function build(){

		isColsFlickity = true;

		lastActive = -1;

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

		gsap.to('.en_lab_set', 0.5, { autoAlpha: 0, ease: "power3.out", onComplete: function(){ isFirstHover = true } })

		$('.en_col_set').removeClass('hover')

		enCarousel.on( 'dragStart', function( event, pointer ) {

			isDragging = true;

		});


		enCarousel.on( 'settle', function( index ) {

			let selected = $('.en_col_set').eq(index),
				title = selected.attr('data-title');

			isDragging = false;

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

			gsap.to(selected, 0.3, {width: parseFloat(40 * sizes.height) / 100, ease: 'power3.out', onUpdate: function(){enCarousel.resize()}, onComplete: function(){
				$('.en_col_set').removeClass('bigger').css('width', '')
				selected.addClass('bigger')
				enCarousel.resize()
			} })

			

		})

	}

};

var isHorizontal = -1,
	isFirstBuild = true,
	resizing = false;

function journeyScroll(){

	if(sizes.width > 768) {

		if(isHorizontal == false || isFirstBuild) {

			isHorizontal = true

			canHideHeader = false

			$('.jus_text ._splitWords').addClass('dirX')

			if(scroll) { 
				scroll.stop();
				scroll.destroy();
			}

			$('.journey_bg').attr('data-scroll-direction', 'horizontal')

			scroll = new LocomotiveScroll(
			{
				el: document.querySelector('[data-scroll-container]'),
				smooth: true,
				direction: 'horizontal',
				scrollFromAnywhere: true,
				lerp: 0.08,
				smartphone: {
					breakpoint: 0,
					smooth: true
				},
				tablet: {
					breakpoint: 0,
					smooth: true
				},
			});

			if(isFirstBuild) {

				pageScroll(0);
			}

			scroll.on('scroll', (func, speed) => {

				scrollVal = func.scroll.x

				gsap.set('.monk_nav_progress i', {scaleX: scrollVal / ( ( ( $('.ju_wrap').innerWidth() - sizes.width ) )) })

				if(!isClicked) {tagsAdj()}

				pageScroll(func);

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
				scroll.stop();
				scroll.destroy();
			}

			$('.journey_bg').attr('data-scroll-direction', 'vertical')

			if(isFirstBuild) {

				clearTimeout(window.menuTimer);

				window.menuTimer = setTimeout(function(){

					pageScroll(0);

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

			scroll.on('scroll', (func, speed) => {

				scrollVal = func.scroll.y

				gsap.set('.monk_nav_progress i', {scaleX: scrollVal / ( ( ( $(document).height() - sizes.height ) )) })

				if(!isClicked) {tagsAdj()}

				pageScroll(func);

			});

		}

	}

	isFirstBuild = false

}



let tagSection = $('.jus_tab'),
	tabsCarousel,
	current = false;

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

var isMouseDown = false;

function journeyPage(){

	if(sizes.width > 768) {

		$('.jus_text ._splitWords').addClass('dirX')

	}

	let pos = { left: 0, x: 0 };

	gsap.from('._in', 1, {x: 100, autoAlpha: 0, ease: 'power3.out', stagger: 0.2, delay: 1})

	const mouseDownHandler = function (e) {

		if(isHorizontal && !isMenu) {

			pos = { left: scrollVal, x: (e.clientX * 1.5) }

			isMouseDown = true

		}


    }

	const mouseMoveHandler = function (e) {

		if(isHorizontal && !isMenu) {

			if(isMouseDown) {
				const dx = pos.left - ( (e.clientX * 1.5) - pos.x)

				scroll.scrollTo(dx, { duration: 1 })
			}

		}

	}

    const mouseUpHandler = function () {

		isMouseDown = false

    }

	document.addEventListener('mousemove', mouseMoveHandler)
    document.addEventListener('mousedown', mouseDownHandler);
	document.addEventListener('mouseup', mouseUpHandler)

	tabsCarousel = new Flickity( '.monk_nav_items', {
		prevNextButtons: false,
		accessibility: true,
		pageDots: false,
		contain: true,
		cellAlign: 'left',
	});

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
			offset = scrollVal + $('#' + id).offset().top - (sizes.width/2) + ($('#' + id).innerHeight()/2) + 5
		}

		$('.monk_nav_item').removeClass('active')

		$(this).addClass('active')

		scroll.scrollTo(offset, { duration: resizing ? 0 : 200, disableLerp: resizing ? true : false })

		resizing = false

	})

	$('.anchor_btn').on('click', function(){

		$('.monk_nav_item').eq(0).click()

	})

	$('.line_v').append('<span><svg width="4" height="14" viewBox="0 0 4 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.57579 17.5335C2.57579 5.75526 3.00003 1.60612 3.00003 1.3009e-08L1.00003 3.68579e-08C1.00003 1.60612 1.48488 5.75526 1.48488 17.5335C1.48488 29.2447 1.00003 33.3939 1.00003 35L3.00004 35C3.00004 33.3939 2.57579 29.2447 2.57579 17.5335Z" fill="#373636"/></svg></span><span><svg viewBox="0 0 4 1" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M2.57579 4.59656C2.57579 -29.392 3.00003 -41.3652 3.00003 -46L1.00003 -46C1.00003 -41.3652 1.48488 -29.392 1.48488 4.59656C1.48488 38.392 1.00003 50.3652 1.00003 55L3.00004 55C3.00004 50.3652 2.57579 38.392 2.57579 4.59656Z" fill="#373636"/></svg></span><span><svg width="4" height="14" viewBox="0 0 4 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.57579 17.5335C2.57579 5.75526 3.00003 1.60612 3.00003 1.3009e-08L1.00003 3.68579e-08C1.00003 1.60612 1.48488 5.75526 1.48488 17.5335C1.48488 29.2447 1.00003 33.3939 1.00003 35L3.00004 35C3.00004 33.3939 2.57579 29.2447 2.57579 17.5335Z" fill="#373636"/></svg></span>')
	$('.jus_year').append('<i class="line line_h before"><span><svg width="10" height="4" viewBox="0 0 10 4" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.5335 1.42421C5.75526 1.42421 1.60612 0.999965 1.30094e-08 0.999965L1.30085e-08 2.99997C1.60612 2.99997 5.75526 2.51512 17.5335 2.51512C29.2447 2.51512 33.3939 2.99997 35 2.99997V0.999965C33.3939 0.999965 29.2447 1.42421 17.5335 1.42421Z" fill="#373636"/></svg></span><span><svg viewBox="0 0 1 4" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M2.09656 1.42421C-31.892 1.42421 -43.8652 0.999965 -48.5 0.999965L-48.5 2.99997C-43.8652 2.99997 -31.892 2.51512 2.09656 2.51512C35.892 2.51512 47.8652 2.99997 52.5 2.99997V0.999965C47.8652 0.999965 35.892 1.42421 2.09656 1.42421Z" fill="#373636"/></svg></span></i><i class="line line_h after"><span><svg width="10" height="4" viewBox="0 0 10 4" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.5335 1.42421C5.75526 1.42421 1.60612 0.999965 1.30094e-08 0.999965L1.30085e-08 2.99997C1.60612 2.99997 5.75526 2.51512 17.5335 2.51512C29.2447 2.51512 33.3939 2.99997 35 2.99997V0.999965C33.3939 0.999965 29.2447 1.42421 17.5335 1.42421Z" fill="#373636"/></svg></span><span><svg viewBox="0 0 1 4" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M2.09656 1.42421C-31.892 1.42421 -43.8652 0.999965 -48.5 0.999965L-48.5 2.99997C-43.8652 2.99997 -31.892 2.51512 2.09656 2.51512C35.892 2.51512 47.8652 2.99997 52.5 2.99997V0.999965C47.8652 0.999965 35.892 1.42421 2.09656 1.42421Z" fill="#373636"/></svg></span></i>')

}

var nGridWrap = $('.n_grid_wrap'),
	nGrid = $('.n_grid'),
	nGridInner = $('.n_grid_inner'),
	nGridSide= $('.au_grid_side_items'),
	sideBox,
	sideBoxLeft,
	sideBoxTop,
	authorCarousel,
	contentTL,
	fluid = true,
	isFirstMove = true,
	isStep = false,
	canMove = false,
	authorStarted = false,
	canSwitch = true,
	isClosed = true,
	canClose = false,
	inBound = false,
	mPadd = 60,
	damp = 20,
	mX = 0,
	mX2 = 0,
	posX = 0,
	mY = 0,
	mY2 = 0,
	posY = 0,
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
	authorTL;


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

	sizes.width > 1000 ? getW = 135 : getW = 50

	if($this.hasClass('sizeA')){
		sideBox = $('.au_side_box.sizeA[data-id='+id+']');
		sizes.width > 1000 ? getH = 135 : getH = 50
	} else {
		sideBox = $('.au_side_box.sizeB[data-id='+id+']');
		sizes.width > 1000 ? getH = 175 : getH = 65
	}

	sideBoxLeft = sideBox.offset().left;
	sideBoxTop = sideBox.offset().top;

	var currentWidth = $this.outerWidth();
	var currentHeight = $this.outerHeight();

	var scaleX = getW / currentWidth;
	var scaleY = getH / currentHeight;

	scaleY = Math.min(scaleX, scaleY);
	scaleX = scaleX;

	var translationX = Math.round((getW - (currentWidth * scaleX)) / 2);
	var translationY = Math.round((getH - (currentHeight * scaleY)) / 2);

	gsap.set($this, {x: 0 - (sizes.width/2) + (getW/2) + sideBoxLeft, y: 0 - (sizes.height/2) + (getH/2) + sideBoxTop, scale: scaleY, rotate: 0 })

	setActive(false)

}

function authorFlic(argument) {

	if(sizes.width <= 1000) {

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

			if(scroll) { scroll.start() }

			$('body').removeClass('hidden')

		});

		authorCarousel.on( 'dragStart', function( event, pointer ) {

			isDragging = true;

			if(scroll) { scroll.stop() }

			$('body').addClass('hidden')

		});


	}


}

function setActive(reposition){

	let $this = $('.au_grid_box.active');

	if($this.length != 0) {

		let W = $('.au_current_cover').innerWidth(),
			H = $('.au_current_cover').innerHeight();

		gsap.set($this, {width: W, height: H })

		var offsetLeft = $this.offset().left,
			offsetLeft = $this.offset().left,
			offsetTop = $this.offset().top,
			getX = $('.au_current_cover').offset().left,
			getY = $('.au_current_cover').offset().top;

		gsap.set($this, {x: 0 - (sizes.width/2) + (W/2) + getX, y: 0 - (sizes.height/2) + (H/2) + getY, scale: 1, rotate: 0 })

		if(sizes.width <= 1000) {

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
	scaleX = scaleX;

	var translationX = Math.round((availableWidth - (currentWidth * scaleX)) / 2);
	var translationY = Math.round((availableHeight - (currentHeight * scaleY)) / 2);

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
			return - (getWidth/getScale) - getOffset + (((wrapWidth - width)/2) / getScale)
		},
		scale: 0.5,
		y: 300
	})
}


function authorPage(){

	var coords = [0,0],
		box_area = {x1:0, y1:0, x2:0, y2:0},
		buttonArea = {x1:0, y1:0, x2:0, y2:0};

	canHideHeader = true

	if(scroll) { scroll.stop() }

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
	};


	if(!isMobile) {

		$(window).on('mousemove', function(e) {

			var C = coords;

			C[0] = e.pageX;
			C[1] = e.pageY;

			if(!isClosed) {

				store_boundary()

				if(sizes.width > 1000) {
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

						gsap.to('.fluid_close', 0.5, { scale: 0, ease: 'back.inOut'})

						inBound = true

						if(sizes.width <= 1000) {
							stopScroll()
						}

					}

				} else {

					if(!fluid) {

						fluid = true

						canClose = true

						gsap.to('.fluid_close', 0.5, { scale: 1, ease: 'back.inOut' })

						inBound = false

						if(sizes.width <= 1000) {
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

		});

		function step() {

			if(!$('body').hasClass('progress')) {

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

	function closeBox(){

		if(!isClosed && canClose) {

			canClose = false;

			isClosed = true;

			$('body').removeClass('opened')

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
				}

			}, 800);

		}

	}

	function clearBoxes(){

		clearTimeout(window.boxTimer);

		window.boxTimer = setTimeout(function(){

			$('.au_grid_box').addClass('no-transition')

			if(scroll){scroll.start()}

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
			split1,
			target1,
			split2,
			target2;

		if(isClosed) {

			nGridReset();

			canMove = false;

			contentTL = new gsap.timeline({delay: 0.5});

			isClosed = false;

			$('#getYear').html(getYear);

			$('#getTitle').html(getTitle).attr('aria-label', getTitleLong)

			$('#getText').html(getText);

			$('.au_btn').attr('href', getURL);

			split1 = new SplitText('#getTitle', {type:"words", wordsClass:"SplitClass"})
			target1 = split1.words
			split2 = new SplitText('#getText', {type:"lines", linesClass:"SplitClass"})
			target2 = split2.lines

			contentTL.set('.au_content', {autoAlpha: 1}, 0)

			.from(target1, 0.5, {y: '40%', autoAlpha: 0, ease: 'power3.out', stagger: 0.05 }, 0)

			.call(function(){

				split1.revert()

				if(scroll) {
					scroll.update();
				};

			})

			.from(target2, 0.5, {y: '40', autoAlpha: 0, ease: 'power3.out', stagger: 0.05}, 0)

			.call(function(){

				canSwitch = true

				split2.revert()

				if(scroll) {
					scroll.update();
				};

			})

			.fromTo('#getYear', 1, {autoAlpha: 0}, {autoAlpha: 1, ease: 'power3.out'}, 0)

			.fromTo('#bookURL', 1, {y: '40', autoAlpha: 0}, {y: '0', autoAlpha: 1, ease: 'power3.out'}, 0)


		} else {

			split1 = new SplitText('#getTitle', {type:"words", wordsClass:"SplitClass"})
			target1 = split1.words
			split2 = new SplitText('#getText', {type:"lines", linesClass:"SplitClass"})
			target2 = split2.lines
			contentTL = new gsap.timeline();

			contentTL

			.to('#getYear', 0.5, {autoAlpha: 0, ease: 'power3.in'}, 0)

			.to(target1, 0.5, {y: '-40', autoAlpha: 0, ease: 'power3.in', stagger: 0.05}, 0)

			.to('.au_btn', 1, {y: '-40', autoAlpha: 0, ease: 'power3.in'}, 0)

			.call(function(){

				$('#getYear').html(getYear);

				$('#getTitle').html(getTitle).attr('aria-label', getTitleLong)

				$('.au_btn').attr('href', getURL);

				split1 = new SplitText('#getTitle', {type:"words", wordsClass:"SplitClass"})
				target1 = split1.words

				gsap.from(target1, 0.5, {y: '40%', autoAlpha: 0, ease: 'power3.out', stagger: 0.05, onComplete: function(){

					split1.revert()

					if(scroll) {
						scroll.update();
					};

				}})

			})

			.to(target2, 0.5, {y: '-40', autoAlpha: 0, ease: 'power3.in'}, 0.05, 0)

			.call(function(){

				$('#getText').html(getText);

				split2 = new SplitText('#getText', {type:"lines", linesClass:"SplitClass"})
				target2 = split2.lines

				gsap.from(target2, 0.5, {y: '40', autoAlpha: 0, ease: 'power3.out', stagger: 0.05, onComplete: function(){

					canSwitch = true

					split2.revert()

					if(scroll) {
						scroll.update();
					};

				}})


				gsap.fromTo('#getYear', 1, {autoAlpha: 0}, {autoAlpha: 1, ease: 'power3.out'})

				gsap.fromTo('.au_btn', 1, {y: '40', autoAlpha: 0}, {y: '0', autoAlpha: 1, ease: 'power3.out'})
			})

		}

	}


	$('body').on('click', function () {

		if(sizes.width > 1000) {

			if(is_mouse_in_area(buttonArea)){

				let url = $('.au_link a').attr('href')

				window.open(url, '_blank').focus();

			}

		}

	})

	authorTL = gsap.timeline({delay: 2});

	authorTL.set('.au_grid_wrap', {autoAlpha: 1})

	.to('.au_grid_box', 0.5, { x: 0, scale: 1, y: 0, ease: 'power3.out', stagger: -0.01})

	.call(function(){

		clearTimeout(window.authorTimer);

		window.authorTimer = setTimeout(function(){

			$('.au_grid_box').css({"transform":""})
			$('.n_grid_blocks').addClass('split')

		}, 500);

	})

	.to(nGridInner, 1.5, { scale: 1, ease: 'power3.inOut'}, 1.7)

	.call(function(){

		canMove = true

	})

	$('.au_side_box').on('click', function () {

		let $this = $(this),
			id = $this.attr('data-id');

		if(sizes.width <= 1000 && !isDragging) {

			if($this.hasClass('sizeA')) {
			
				$('.au_grid_box.sizeA[data-id='+id+']').click()

			} else {

				$('.au_grid_box.sizeB[data-id='+id+']').click()

			}

		}

	})

	$('.close').on('click', function () {

		lastHovered = -1

		isMouseIn = false;

		closeBox();

	})

	let boxTL,
		isMouseIn = false,
		lastHovered = -1

	$('.author_nav_item').on('click', function () {

		let $this = $(this),
			id = $this.attr('data-id');

		if(!$('body').hasClass('wait') && !$this.hasClass('active')) {

				$('.author_nav_item').removeClass('active')

				$this.addClass('active')

				gsap.set('.au_grid_box', {autoAlpha: 1})

			if(id == 1) {

				gsap.set('.au_grid_box.sizeA', {autoAlpha: 0.2})

			} else if(id == 2) {

				gsap.set('.au_grid_box.sizeB', {autoAlpha: 0.2})

			}

		}

	})

	$('.au_grid_box').on('mouseenter', function () {

		let $this = $(this),
			i = $this.index(),
			title = $this.attr('data-title');

		if($('.au_grid_box.moved').length == 0) {

			if(sizes.width > 768 && lastHovered != i) {

				lastHovered = i

				console.log(lastHovered, i)

				clearTimeout(window.navTimer);

				window.navTimer = setTimeout(function(){

					if(isMouseIn) {

						if(boxTL) {boxTL.kill()}

						boxTL = new gsap.timeline()

						boxTL.set('#getCurTitle span', {autoAlpha: 1})

						.to('#getCurTitle span', 0.3, {y: '-100%', ease: 'power3.in'})

						.call(function(){

							$('#getCurTitle span').html(title)

						})

						.set('#getCurTitle span', {y: '100%'})

						.to('#getCurTitle span', 0.3, {y: '0%', ease: 'power3.out'})

					}

				}, 300);

				isMouseIn = true;

			}

		}

	}).on('mousemove', function () {

		isMouseIn = true;

	}).on('mouseleave', function () {

		if(sizes.width > 768) {

			clearTimeout(window.navTimer);

			window.navTimer = setTimeout(function(){

				if(!isMouseIn) {

					lastHovered = -1

					gsap.to('#getCurTitle span', 0.5, {autoAlpha: 0, ease: 'power3.out', onComplete: function(){

						$('#getCurTitle span').html('')

						gsap.set('#getCurTitle span', {autoAlpha: 1})

					}})

				}

			}, 300);

			isMouseIn = false;

		}

	}).on('click', function () {

		let $this = $(this),
			id = $this.attr('data-id');

		if(canSwitch) {

			canSwitch = false

			if(scroll) { scroll.stop() }

			if(!$this.hasClass('moved')) {

				canClose = true

				if(!$this.hasClass('active')) {

					isClosed = true;

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

				setContent($this)

				setActive(true)

				$('.au_grid_box').each(function(i){

					var $this = $(this);

					if(!$this.hasClass('active')) {

						matchBoxes($this, true)

					}

					if(i == 16) {
						clearBoxes()
					}

				})

			}

		}

	})

	$('.n_grid_blocks').addClass('split')

}


















