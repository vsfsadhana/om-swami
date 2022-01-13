import './global.css'
import './inners.css'
import * as THREE from 'three'
import $ from 'jquery'
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
    isClicked = false,
    canHideHeader = false,
    isButtonLoaded = false,
    isButtonHidden = false,
    canSwitch = true,
    isClosed = true,
    imagesLoaded = false,
    nonCarousel = [],
    contentTL,
    splitWords,
    splitLines,
    ts,
    curX,
    curY,
    scroll,
    isScroll,
    scrollVal,
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

		console.log('ii')

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

	onWindowResize()

	document.addEventListener( 'mousemove', onDocumentMouseMove );
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

		isDragging = false;

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

	let prx = $(document).find('.prx')

	if(prx.length != 0) {

		let rect = $('.prx')[0].getBoundingClientRect();
		let xPos = ((curX - rect.left) - rect.width / 2) / rect.width * -0.01;
		let yPos = ((curY - rect.top) - rect.height / 2) / rect.height * -0.01;
		gsap.to('.prx', 0.6, {transform: `rotateX(${yPos}deg) rotateY(${xPos}deg)`, ease: 'power3.out', transformPerspective:800, transformOrigin:"center"});

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

function fire(){

	buildScroll(true);

	globalFunc()

	$('.siteLoader').remove();

	gsap.set('main, header', {autoAlpha: 1})

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

			if(canHideHeader) {
				pageScroll(func);
			}

		});

	}

};

function pageScroll(val){

	let eleWrap = $('._eleWrap');

	scrollVal = 0

	if(val != 0 ) {

		scrollVal = val.scroll.y;

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
					gsap.set(eleY, { y: 100, autoAlpha: 0})
					gsap.to(eleY, 1, { y: 0, autoAlpha: 1, ease: "power3.out", delay: 0.4, stagger: 0.15 })
				}

				if(eleX.length != 0) {

					gsap.set(eleX, { x: 100, autoAlpha: 0})
					gsap.to(eleX, 1, { x: 0, autoAlpha: 1, ease: "power3.out", delay: 0.4, stagger: 0.15 })
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
					gsap.set(splitWords.words, { y: 20, autoAlpha: 0})
					gsap.to(splitWords.words, 0.5, { y: 0, autoAlpha: 1, ease: "power3.out", delay: 0.2, stagger: 0.1 })
				}

				if(getLines.length != 0) {
					splitLines = new SplitText(getLines, {type:"lines", linesClass:"SplitClass"});
					gsap.set(splitLines.lines, { y: 20, autoAlpha: 0})
					gsap.to(splitLines.lines, 0.5, { y: 0, autoAlpha: 1, ease: "power3.out", delay: 0.5, stagger: 0.1 })
				}

			}

		})

	}

	if(scrollVal > 100) {

		if(canHideHeader) {

			if(val.direction == 'down') {

				$('header').addClass('invisble')

			} else {

				$('header').removeClass('invisble')

			}
		}

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

		if(!$('body').hasClass('wait')) {

			$('body').addClass('wait')

			if(!$this.attr('target') && !isDragging) {

				openLink(link, $this.hasClass('main_logo'))

				return false;
			}

		} else {

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

	$('body').removeClass('hidden')

	scroll.start()

}

function monkPage(){

	var $imgs1 = $('.monk_visuals i.a'),
		$imgs2 = $('.monk_visuals i.b'),
		slidesTotal = $('.monk_slide').length,
		slidesTL,
		activeSection = 0,
		getActive = $('.monk_slide').eq(0);

	stopScroll()

	getActive.find('.monk_text').addClass('prx')

	gsap.set(getActive, {autoAlpha: 1})

	gsap.from(getActive.find('.monk_text ._ele.alt_h2 i'), 0.5, {autoAlpha: 0, ease: 'power3.in', delay: 1})

	gsap.from(getActive.find('.monk_text ._ele:not(.alt_h2) i'), 0.7, {y: '150%', ease: 'power3.out', delay: 1, stagger: 0.1})

	gsap.fromTo(getActive.find($imgs1), 1, {x: -100, autoAlpha: 1}, {x: 0, autoAlpha: 1, ease: 'power3.out', delay: 1})

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

	var navCarousel = new Flickity( '.monk_nav_items', {
		prevNextButtons: false,
		accessibility: true,
		pageDots: false,
		contain: true,
		cellAlign: 'left',
		selectedAttraction: 0.08,
		friction:  1
	});

	navCarousel.on( 'scroll', function( event, progress ) {

		isDragging = true;

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

	$('a, .menu_button, .monk_nav_set').click(function(e){

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

		.call(function(){

			$('.monk_slide.active').removeClass('active').find('.monk_text').removeClass('prx')

			newSlide.addClass('active').find('.monk_text').addClass('prx')

			canScroll = true

		})

		.set('.monk_slide.active', {autoAlpha: 0})

	}

	$(document).on('click', function(){

		if(!isMobile && !isClicked && !isMenu) {

			canScroll = false;

			isClicked = true;

			gsap.to('.explore_btn', 0.3, { autoAlpha: 0})

			$('.getContent').show()

			startScroll()

			loadContent();

		}

	})

	$('a, .menu_button, .monk_nav_set').on('mouseenter', function(){

		if(!isButtonHidden && !isClicked && !isMenu) {

			isButtonHidden = true;

			gsap.to('.explore_btn', 0.3, { autoAlpha: 0})
		}

	}).on('mouseleave', function(){

		if(isButtonHidden && !isClicked && !isMenu) {

			isButtonHidden = false;

			gsap.to('.explore_btn', 0.3, { autoAlpha: 1})
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

		siteIntrvl = setInterval(function () {

			if(imagesLoaded) {

				clearInterval(siteIntrvl);

				excute()
			};

		}, 50);


		function excute() {

			scroll.scrollTo('.getContent', {
				duration: val ? 0 : 400,
				disableLerp: val ? true : false,
				callback: function(){

					canScroll = false;

					stopScroll()

					pageScroll(0)

					setTimeout(function(){

						if(val) {

							gsap.to('.getContent', 0.5, {autoAlpha: 1, ease: 'power3.out' })

						}

						$('#monkSlides').remove();

						scroll.scrollTo(0, {duration: 0, disableLerp: true})

						scroll.update()

						setTimeout(function(){

							startScroll()

							$('body').removeClass('wait')

							canHideHeader = true

						}, 500)

					}, 1000)

				}

			})

		}

	}

}


























