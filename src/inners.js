import './global.css'
import './inners.css'
import * as THREE from 'three'
import $ from 'jquery'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import LocomotiveScroll from 'locomotive-scroll';
import gsap from 'gsap'

var Flickity = require('flickity');

gsap.config({
    nullTargetWarn: false,
})

let container, fov, controls, scene, camera2, renderer2, loadingManager, textureLoader;
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
    lastWindowWidth,
    isPageReady = false,
    isColsFlickity = false,
    isDragging = false,
    canScroll = false,
    canSwitch = true,
    isClosed = true,
    nonCarousel = [],
    contentTL,
    splitWords,
    splitLines,
    ts,
    curX,
    curY,
    scroll,
    isScroll,
    scrollStopped,
    siteIntrvl,
    vh,
    isMobile;

(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? isMobile = true : isMobile = false

$(window).on('load', function(){

    $.ready.then(function(){

        if (isMobile == true) {

            $('body').addClass('isMobile');

        } else {

            $('body').addClass('isDesktop');

        };

        init();

        animate();

        appendImgs();

    });

})

$.fn.isInViewport = function() {
	var elementTop = $(this).offset().top;
	var elementBottom = elementTop + $(this).outerHeight();
	var viewportTop = $(window).scrollTop();
	var viewportBottom = viewportTop + $(window).height();
	return elementBottom > viewportTop && elementTop < viewportBottom;
}

function appendImgs(){

	var appendBGs = $('body').find('.load_bg'),
		altBGs = $('body').find('.load_bg_alt'),
		iMGs = $('body').find('.load_img'),
		loaded = 0;

	altBGs.each(function(i){

		var t = $(this),
			s = t.attr('data-src');

		t.css({ 'background-image': 'url('+ support_format_webp(s) +')' })

		t.removeClass('load_bg')

	});

	iMGs.each(function(i){

		var t = $(this),
			s = t.attr('data-src');

		t.removeAttr('data-src').attr("src", support_format_webp(s)).removeClass('load_img');

		t.removeClass('load_img')

		$('<img src="'+ support_format_webp(s) +'">').on('load',function(){

			clearTimeout(window.scrollUpdate);

			window.scrollUpdate = setTimeout(function(){

				if(isScroll) { scroll.update(); };

			}, 500);

		})

	});

	appendBGs.each(function(i){

		var t = $(this),
		s = t.attr('data-src');

		t.css({ 'background-image': 'url('+ support_format_webp(s) +')' })

		$('<img src="'+ support_format_webp(s) +'">').on('load',function(){

			if(loaded == appendBGs.length - 1) {

				gsap.to(transitionParams, 2, {transition2: 0, ease: "power3.inOut"}, 0)

				$('body').addClass('loaded')

				fire()

				clearTimeout(window.scrollUpdate);

				window.scrollUpdate = setTimeout(function(){

					if(isScroll) { scroll.update(); };

				}, 500);

			}

			loaded ++

		})

	});

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

	onWindowResize()

	window.addEventListener( 'resize', onWindowResize );
	window.addEventListener( 'orientationchange', onOrientationChange);

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

	if(splitWords) { splitWords.revert() }

	if(splitLines) { splitLines.revert() }

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

	clearTimeout(window.scrollUpdate);

	window.scrollUpdate = setTimeout(function(){

		if(isScroll){scroll.update()};

	}, 500);

	function setH(){

		document.documentElement.style.setProperty('--vh', `${vh}px`);

	}

	clearTimeout(window.resizedFinished);

	window.resizedFinished = setTimeout(function(){

		$('body').removeClass('progress');

		setH();

	}, 500);

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

}

function fire(){

	buildScroll(false);

	globalFunc()

	$('.siteLoader').remove();

	siteIntrvl = setInterval(function () {

		if($('body').hasClass('loaded')) {

			clearInterval(siteIntrvl);

			gsap.set('main, header', {autoAlpha: 1})

			gsap.set('header', {className: '+=loaded', delay: 2})

			pageScroll(0);

		};

	}, 50);

}

function openLink(url, isMain){

	$('body').append('<div class="siteLoader" style="background: #040404; position: fixed; width: 100vw; height: 100vh; top: 0; z-index: 99999;visibility: hidden;"></div>')

	if(isMain) {
		$('.siteLoader').css('background', '#1F1F1F')
	}

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
		smooth: true,
		lerp: 0
	},
		tablet: {
			smooth: true,
			lerp: 0
		}
	});

	isScroll = true;

	if(val) {

		scroll.on('scroll', (func, speed) => {

			pageScroll(func);

		});

	}

};

function pageScroll(val){

	let eleWrap = $('._eleWrap'),
		lazy = $('.lazy');

	if(lazy.length != 0) {

		lazy.each(function(){

			var $this = $(this),
				src = $this.attr('data-src');

			if($this.isInViewport() && !$this.hasClass('inview')) {

				$this.addClass('inview');

				gsap.set($this.find('.spinner'), {autoAlpha: 1, ease: "power3.out"});

				$this.removeClass('lazy').css({ 'background-image': 'url('+ src +')' });

				$('<img src="'+ src +'">').on('load', function() {

					gsap.to($this.find('._temp'), 1, {autoAlpha: 0, ease: "power3.out", onComplete: function(){
						$this.find('._temp').remove()
					}})

				});

			}

		})

	}

	if( eleWrap.length != 0 ) {

		eleWrap.each(function(i){

			let $this = $(this),
				eleY = $this.find('._eleY'),
				eleX = $this.find('._eleX');

			if($this.isInViewport() && !$this.hasClass('inview') ) {

				$this.addClass('inview');

				gsap.set($this, {autoAlpha: 1}, 0)

				if(eleY.length != 0) {

					// gsap.staggerFrom(eleY, 1, { y: 100, autoAlpha: 0, ease: "power3.out", delay: 0.4 }, 0.15)
				}

				if(eleX.length != 0) {

					// gsap.staggerFrom(eleX, 1, { x: 100, autoAlpha: 0, ease: "power3.out", delay: 0.4 }, 0.15)
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

			if($this.isInViewport() && !$this.hasClass('inview') ) {

				$this.addClass('inview');

				gsap.set($this, {autoAlpha: 1}, 0)

				if(getWords.length != 0) {
					splitWords = new SplitText(getWords, {type:"words", wordsClass:"SplitClass"});

					gsap.staggerFrom(splitWords.words, 0.5, { y: 20, autoAlpha: 0, ease: "power3.out", delay: 0.2 }, 0.1, function(){
					})
				}

				if(getLines.length != 0) {
					splitLines = new SplitText(getLines, {type:"lines", linesClass:"SplitClass"});

					gsap.staggerFrom(splitLines.lines, 0.5, { y: 20, autoAlpha: 0, ease: "power3.out", delay: 0.5 }, 0.1, function(){
					})
				}

			}

		})

	}

}

function globalFunc(){

	// Menu

	var menuTL = new gsap.timeline({paused: true});

	menuTL

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

	.staggerFrom('.menu_items li a', 0.8, {x: 200, autoAlpha: 0, ease: "power3.out"}, 0.1, 0.8)

	.staggerFrom('.menu_items li ._ele', 0.8, {y: 50, autoAlpha: 0, ease: "power3.out"}, 0.1, 0.8)


	$('.menu_button').click(function(){

	if(!isMenu) {

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

	menuCur.on( 'scroll', function( event, progress ) {

		isDragging = true;

	});

	menuCur.on( 'dragStart', function( event, pointer ) {

		isDragging = true;

	});

	menuCur.on( 'settle', function( event, index ) {

		isDragging = false;

	})

	$('a').on('click', function () {

		let $this = $(this),
			link = $this.attr('href');

		if(!$this.attr('target') && !isDragging) {

			openLink(link, $this.hasClass('main_logo'))

			return false;
		}

	})

	if(page == 'monk') {

		monkPage()

	}

};

function stopScroll(){

	scrollStopped = true;

	$('body').addClass('hidden')

	scroll.stop()

}

function startScroll(){

	scrollStopped = false;

	$('body').addClass('hidden')

	scroll.stop()

}


function monkPage(){

	var $imgs1 = $('.monk_visuals i.a'),
		$imgs2 = $('.monk_visuals i.b'),
		slidesTotal = $('.monk_slide').length,
		slidesTL,
		activeSection = 0;

	gsap.set($('.monk_slide').eq(0), {autoAlpha: 1})

	stopScroll()

	canScroll = true

	var navCarousel = new Flickity( '.monk_nav_items', {
		prevNextButtons: false,
		accessibility: true,
		pageDots: false,
		contain: true,
		cellAlign: 'left',
		selectedAttraction: 0.08,
		friction:  1
	});

	$('.explore_btn').click(function(){

		if(!$('body').hasClass('hidden')) {

			let $this = $(this);

			gsap.to($this, 0.5, {autoAlpha: 0, ease: "power3.out"})

			stopScroll()

			// $('.getContent').show().html('').load($('body').attr('data-page') + '?id=' + $('body').attr('data-id'), function(){

			// 	appendImgs()

			// 	$('body').removeClass('hidden')

			// 	scroll.update()

			// 	scroll.scrollTo('.getContent', {
			// 		duration: 400,
			// 		offset: 2,
			// 		callback: function(){

			// 			pageScroll(0);

			// 			setTimeout(function(){

			// 				$('#monkSlides').remove();

			// 				scroll.scrollTo(0, {duration: 0, disableLerp: true})

			// 				if(isScroll){ scroll.destroy() }

			// 				gsap.set('header', {autoAlpha: 0})

			// 				gsap.to('header', 1, {autoAlpha: 1, delay: 0.5, ease: "power3.out"})

			// 				if(isScroll){ buildScroll(true); }

			// 			}, 700)

			// 		}

			// 	})

			// })
		}

	})

	$('.arrow').on( 'click', function() {

		if($(this).hasClass('next')) {

			nextSlide()

		} else {

			prevSlide()

		}

	});

	$('.monk_nav_item').click(function(){

		var index = $(this).index()

		setSlide(index)

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

	function nextSlide(){

		let currentSlide = $('.monk_slide.active').index(),
			newSlide;

		currentSlide == slidesTotal - 1 ? newSlide = 0 : newSlide = currentSlide + 1

		setSlide(newSlide)

	}

	function prevSlide(){

		let currentSlide = $('.monk_slide.active').index(),
			newSlide;

		currentSlide == 0 ? newSlide = slidesTotal - 1 : newSlide = currentSlide - 1

		setSlide(newSlide)

	}

	function setSlide(newSlideIndex){

		let curSlide = $('.monk_slide.active'),
			curVis1 = curSlide.find($imgs1),
			curVis2 = curSlide.find($imgs2),
			newSlide = $('.monk_slide').eq(newSlideIndex),
			newVis1 = newSlide.find($imgs1),
			newVis2 = newSlide.find($imgs2);

		canScroll = false

		navCarousel.select(newSlideIndex);

		$('.monk_nav_item.is-selected').removeClass('is-selected')

		$('.monk_nav_item').eq(newSlideIndex).addClass('is-selected')

		if(slidesTL) { slidesTL.kill() }

		slidesTL = new gsap.timeline()

		slidesTL

		.to('.monk_nav_progress i', 1, {scaleX: ( ( (sizes.width / (slidesTotal - 1) ) * newSlideIndex) ) / sizes.width, ease: 'power3.out'}, 0)

		.staggerTo(curSlide.find('.monk_text ._ele'), 0.7, {autoAlpha: 0, y: -200, ease: 'power3.in'}, 0.1, 0)

		.to(curVis1, 0.7, {x: -200, autoAlpha: 0, ease: 'power3.in'}, 0)

		.to(curVis2, 0.7, {
			x: function(index, target){
				let val;
				sizes.width > 768 || newSlideIndex == 3 ? val = 200 : val = 0;
				return val;
			},
			y: function(index, target){
				let val;
				sizes.width <= 768 && newSlideIndex != 3 ? val = -200 : val = 0;
				return val;
			},
			autoAlpha: 0, ease: 'power3.in'
		}, 0)

		.set(newSlide.find('.monk_text ._ele'), {autoAlpha: 0}, 0)

		.set(newSlide, {autoAlpha: 1}, 0.7)

		.fromTo(newVis1, 0.7, {x: -200, autoAlpha: 1}, {x: 0, autoAlpha: 1, ease: 'power3.out'}, 0.7)

		.fromTo(newVis2, 0.7, {
			x: function(index, target){
				let val;
				sizes.width > 768 || newSlideIndex == 3 ? val = 200 : val = 0;
				return val;
			},
			y: function(index, target){
				let val;
				sizes.width <= 768 && newSlideIndex != 3 ? val = 200 : val = 0;
				return val;
			},
			autoAlpha: 0}, {x: 0, y: 0, autoAlpha: 1, ease: 'power3.out'
		}, 0.7)

		.staggerFromTo(newSlide.find('.monk_text ._ele'), 0.7, {autoAlpha: 0, y: 200}, {autoAlpha: 1, y: 0, ease: 'power3.out'}, 0.1, 0.7)

		.call(function(){

			$('.monk_slide.active').removeClass('active')

			newSlide.addClass('active')

			canScroll = true

		})

		.set('.monk_slide.active', {autoAlpha: 0})


		// .to(newSlide, 0.5, {autoAlpha: 1, ease: 'power3.out'})

		// .call(function(){


		// 	canScroll = true

		// })



	}

}


























