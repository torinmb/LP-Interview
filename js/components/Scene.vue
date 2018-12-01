<template>
    <div class="container">
        <div v-if="sliderVisible && questionIndex != -1" 
            ref="slider" class="slider" 
            @mousedown.stop="slideReady" 
            @touchstart.stop="slideReady"></div>
        <textimage ref="textImage" v-if="sceneIsInitialized"></textimage>
    </div>
</template>

<script>
import * as THREE from 'three';
import * as OrbitControls from  '../THREE_Helpers/OrbitControls.js'
import * as WEBGL from  '../THREE_Helpers/WebGl.js'
import TWEEN from '@tweenjs/tween.js';
import TextImage from './TextImage.vue';

let container, camera, renderer, controls;
let sceneL, sceneR; //don't store in VueX, any change in scene is tracked and slows performence

export default {
    data: function() {
		return {
            sceneIsInitialized: false,
            sliderPos: window.innerWidth / 2,
            sliderMoved: false,
            sliderClicked: false,
            sliderVisible: true,
            renderExposure: 1.0,
            updatingPoints: false
		}
    },
    components :{
        textimage: TextImage
    },
	mounted() {
		container = document.querySelector('.container');
        sceneL = new THREE.Scene();
        window.sceneL = sceneL;
        sceneL.background = new THREE.Color(0x3F4C78);
        sceneR = new THREE.Scene();
        window.sceneR = sceneR;
        
        sceneR.background = new THREE.Color(0x7ACB71);
        camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 0);
        controls = new THREE.OrbitControls(camera, container);
        camera.position.set(0, 0, 10);
        controls.update();
        window.controls = controls;
        this.sceneIsInitialized = true;

        renderer = new THREE.WebGLRenderer({ antialias: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setScissorTest(true);
        renderer.sortObjects = false;
        container.appendChild(renderer.domElement);
        renderer.setAnimationLoop(() => {
            this.render();
        });

        window.addEventListener('mouseup', this.slideFinish);
        window.addEventListener('touchend', this.slideFinish);
        window.addEventListener('mousemove', this.slideMove);
        window.addEventListener('touchmove', this.slideMove);
        window.addEventListener('resize', this.onWindowResize);
	},
	computed: {
		currentQuestion() {
			return this.$store.getters.getCurrentQuestion;
		},
		questionIndex() {
			return this.$store.state.currentQuestionIndex;
		},
		tokens() {
			return this.$store.getters.getTokens;
		}
    },
    watch : {
        sliderPos(val) {
            let slider = this.$refs.slider;
            if(slider) {
                slider.style.left = this.sliderPos - (slider.offsetWidth / 2) + "px";
            }
        }
    },
	methods: {
        resetPointDestination(mesh, destinationVerticies) {
            for (let i = 0; i < mesh.geometry.vertices.length; i++) {
                let point = mesh.geometry.vertices[i];
                point.destination = destinationVerticies[i];
            }
        },
        render(time) {
            this.$refs.textImage.update();
            if(this.updatingPoints) {
                renderer.toneMappingExposure = 0.004;
            } else {
                renderer.toneMappingExposure = 1.0;
            }
            // renderer.toneMappingExposure = this.renderExposure;
            renderer.setScissor(0, 0, this.sliderPos, window.innerHeight);
            renderer.render(sceneL, camera);
            renderer.setScissor(this.sliderPos, 0, window.innerWidth, window.innerHeight);
            renderer.render(sceneR, camera);
            TWEEN.update(time);
        },
        onWindowResize() {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
            if (!this.sliderMoved) this.sliderPos = window.innerWidth / 2;
        },
        slideReady() {
            this.sliderClicked = true;
            controls.enabled = false;
        },
        slideFinish() {
            controls.enabled = true;
            if(this.sliderClicked) {
                let endSliderPose = (this.sliderPos / window.innerWidth);
                console.log(endSliderPose);
                if(endSliderPose >= 0.75){
                    endSliderPose = window.innerWidth;
                    // this.$store.state.captureImageToggle = this.$store.state.captureImageToggle? false: true;
                    this.$refs.textImage.setYesPointsDestinationToImage();
                } else if(endSliderPose <= 0.25) {
                    endSliderPose = 0;
                    // this.$store.state.captureImageToggle = this.$store.state.captureImageToggle? false: true;
                    this.$refs.textImage.setNoPointsDestinationToImage();
                } else {
                    endSliderPose = window.innerWidth / 2;
                }
                this.tweenObjectToValue(this.sliderPos, endSliderPose, (currVal) => this.sliderPos = currVal)
                .then(() => {
                    if(this.sliderPos == 0 || this.sliderPos == window.innerWidth) {
                        this.updatingPoints = true;
                        this.tweenObjectToValue(this.renderExposure, 0.004, (currVal) => this.renderExposure = currVal);
                        this.sliderVisible = false;
                        this.$store.state.captureImageToggle = this.$store.state.captureImageToggle? false: true;
                        
                        if(this.sliderPos == window.innerWidth) {
                            
                            this.$refs.textImage.animateYes();
                            
                        } else {
                            this.$refs.textImage.animateNo();
                        }
                        setTimeout(() => {
                            if(this.sliderPos == window.innerWidth) {
                                this.$refs.textImage.setYesPointsDestinationToText();
                            } else {
                                this.$refs.textImage.setNoPointsDestinationToText();
                            }
                            setTimeout(() => {
                                if(this.sliderPos == window.innerWidth) {
                                    this.updatingPoints = false;
                                }
                                this.tweenObjectToValue(this.renderExposure, 1.0, (currVal) => this.renderExposure = currVal);
                                this.$refs.textImage.stopYesAnimation();
                                this.$refs.textImage.stopNoAnimation();
                                this.nextQuestion(this.sliderPos == window.innerWidth);
                                this.tweenObjectToValue(this.sliderPos, window.innerWidth / 2, (currVal) => this.sliderPos = currVal).then(() => {
                                    this.updatingPoints = false;
                                    this.sliderVisible = true;
                                });
                            }, 4000);
                        }, 5000);
                    }
                });
                this.sliderClicked = false;
            }
        },
        slideMove(e) {
            if (!this.sliderClicked) return false;
            e.preventDefault();
            this.sliderMoved = true;
            this.sliderPos = e.pageX || e.touches[0].pageX;
        },
        nextQuestion(response) {
			this.$store.commit('nextQuestion', response);
        },
        tweenSliderToPose(endPose) {
            let self = this;
            return new Promise(function (resolve, reject) {
                let currPose = {pose: self.sliderPos};
                let tweenSliderPosition = new TWEEN.Tween(currPose)
                .to({'pose': endPose}, 500)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => self.sliderPos = currPose.pose)
                .onComplete(()  => resolve());
                tweenSliderPosition.start();
            });
        },
        tweenObjectToValue(obj, endValue, updateCallback, time = 500) {
            return new Promise(function (resolve, reject) {
                let currState = {state: obj};
                let tweenSliderPosition = new TWEEN.Tween(currState)
                .to({'state': endValue}, time)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => {
                    updateCallback(currState.state);
                    // console.log(obj);
                    // console.log(currState);
                    // obj = currState.state
                    })
                .onComplete(()  => resolve());
                tweenSliderPosition.start();
            });
        },
	},
	destroyed() {
		console.log('destroyed')
	}
};
</script>

<style>
.center {
	text-align: center;
}

body {
    margin: 0px;
    overflow: hidden;
    text-align: center;
}

.container {
    position: absolute;
    width: 100%;
    height: 100%;
}

.slider {
    z-index: 2;
    position: absolute;
    cursor: ew-resize;
    width: 40px;
    height: 40px;
    background-color: #ffffff;
    opacity: 0.7;
    border-radius: 50%;
    top: calc(50% - 20px);
    left: calc(50% - 20px);
}
</style>