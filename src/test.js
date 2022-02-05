import * as THREE from 'three'
import * as dat from 'dat.gui'
import $ from 'jquery'
import Stats from 'three/examples/js/libs/stats.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

let container, stats;
let renderer;
let transition = [];
let loader;
let textures;

const glParams = {
	'transSceneA': 1,
	'transSceneB': 1,
	'transSceneC': 1,
};

const clock = new THREE.Clock();

init();
animate();

function init() {

	initGUI();

	container = document.getElementById( 'container' );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	stats = new Stats();
	container.appendChild( stats.dom );

	loader = new THREE.TextureLoader();
	textures = loader.load( 'images/transition.png' );

	const sceneA = new FXScene( 0x852525 );
	const sceneB = new FXScene( 0x328525 );
	const sceneC = new FXScene( 0x255185 );
	const sceneD = new FXScene( 0x852570 );

	transition[0] = new Transition( sceneA, sceneB, 0 );
	transition[1] = new Transition( sceneB, sceneC, 1 );
	transition[2] = new Transition( sceneC, sceneD, 2 );

}

function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function initGUI() {

	const gui = new dat.GUI();

	gui.add( glParams, 'transSceneA', 0, 1, 0.01 ).listen();
	gui.add( glParams, 'transSceneB', 0, 1, 0.01 ).listen();
	gui.add( glParams, 'transSceneC', 0, 1, 0.01 ).listen();

}

function render() {

	if ( glParams.transSceneA != 0 && glParams.transSceneB == 1 ) {
		transition[0].render( clock.getDelta() );
	}

	if ( glParams.transSceneB != 1 && glParams.transSceneC == 1 ) {
		transition[1].render( clock.getDelta() );
	}

	if ( glParams.transSceneC != 1 ) {
		transition[2].render( clock.getDelta() );
	}

}

function FXScene( clearColor ) {

	this.clearColor = clearColor;

	const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 2000;

	// Setup scene
	const scene = new THREE.Scene();

	this.fbo = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight );

	this.render = function ( delta, rtt ) {

		renderer.setClearColor( this.clearColor );

		if ( rtt ) {

			renderer.setRenderTarget( this.fbo );
			renderer.clear();
			renderer.render( scene, camera );

		} else {

			renderer.setRenderTarget( null );
			renderer.render( scene, camera );

		}

	};

}


function Transition( sceneA, sceneB ) {
	const scene = new THREE.Scene();
	const width = window.innerWidth;
	const height = window.innerHeight;
	const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, - 10, 10 );

	this.material = new THREE.ShaderMaterial( {
		uniforms: {
			tDiffuse1: { value: null },
			tDiffuse2: { value: null },
			mixRatio: { value: 0.0 },
			threshold: { value: 0.1 },
			useTexture: { value: 1 },
			tMixTexture: { value: textures }
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
			'		vec4 transitionTexel = texture2D( tMixTexture, vUv );',
			'		vec4 transitionTexel2 = texture2D( tMixTexture, vUv );',
			'		float r = mixRatio * (1.0 + threshold * 2.0) - threshold;',
			'		float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);',
			'		gl_FragColor = mix( texel1, texel2, mixf );',
			'}'
		].join( '\n' )
	} );

	const geometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
	const mesh = new THREE.Mesh( geometry, this.material );
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

