<template>
    <div class="container">
        <div v-if="sliderVisible && questionIndex != -1" ref="slider" class="slider" @mousedown.stop="slideReady" @touchstart.stop="slideReady"></div>
    </div>
</template>

<script>
import * as THREE from 'three';
import * as OrbitControls from  '../THREE_Helpers/OrbitControls.js'
import * as WEBGL from  '../THREE_Helpers/WebGl.js'
import TWEEN from '@tweenjs/tween.js';

let container, camera, renderer, controls;
let sceneL, sceneR;

export default {
    data: function() {
		return {
            sliderPos: window.innerWidth / 2,
            sliderMoved: false,
            sliderClicked: false,
            sliderVisible: true
		}
	},
	mounted() {
		container = document.querySelector('.container');
        sceneL = new THREE.Scene();

        sceneL.background = new THREE.Color(0xff00ff);
        sceneR = new THREE.Scene();
        sceneR.background = new THREE.Color(0x8FBCD4);
        camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 10);
        camera.position.set(2, 4, 7);
        controls = new THREE.OrbitControls(camera, container);
        this.initMeshes();
        this.initLights();
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setScissorTest(true);
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
        initMeshes() {
            let geoB = new THREE.BoxBufferGeometry(2, 2, 2);
            let matB = new THREE.MeshStandardMaterial({ color: 0x0000ff });
            let meshB = new THREE.Mesh(geoB, matB);
            sceneL.add(meshB);
            let geoA = new THREE.IcosahedronBufferGeometry(1, 0);
            let matA = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            let meshA = new THREE.Mesh(geoA, matA);
            sceneR.add(meshA);
        },
        initLights() {
            let light1 = new THREE.DirectionalLight();
            light1.position.set(20, 20, 20);
            sceneL.add(light1);
            sceneR.add(light1.clone());
            let light2 = new THREE.DirectionalLight();
            light2.position.set(- 20, 20, 20);
            sceneL.add(light2);
            sceneR.add(light2.clone());
        },
        render(time) {
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
                } else if(endSliderPose <= 0.25) {
                    endSliderPose = 0;
                } else {
                    endSliderPose = window.innerWidth / 2;
                }
                console.log(endSliderPose);
                this.tweenSliderToPose(endSliderPose)
                .then(() => {
                    if(this.sliderPos == 0 || this.sliderPos == window.innerWidth) {
                        this.sliderVisible = false;
                        this.nextQuestion(this.sliderPos == window.innerWidth);

                        this.tweenSliderToPose(window.innerWidth / 2).then(() => {
                            this.sliderVisible = true;
                        });
                    }
                });
                // let currPose = {pose: this.sliderPos};
                // let self = this;
                // let tweenSliderPosition = new TWEEN.Tween(currPose)
                // .to({'pose': endSliderPose}, 500)
                // .easing(TWEEN.Easing.Quadratic.InOut)
                // .onUpdate(() => {
                //     self.sliderPos = currPose.pose;
                // })
                // .onComplete(function () {
                //     if(self.sliderPos == 0 || self.sliderPos == window.innerWidth) {
                //         self.sliderVisible = false;
                //         self.nextQuestion(self.sliderPos == window.innerWidth);
                //     }
                // });
                
                this.sliderClicked = false;
            }
        },
        slideMove(e) {
            if (!this.sliderClicked) return false;
            e.preventDefault();
            this.sliderMoved = true;
            this.sliderPos = e.pageX || e.touches[0].pageX;
            //prevent the slider from being positioned outside the window bounds
            // if (this.sliderPos < 0) this.sliderPos = 0;
            // if (this.sliderPos > window.innerWidth) this.sliderPos = window.innerWidth;
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
        }
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
    background-color: #2196F3;
    opacity: 0.7;
    border-radius: 50%;
    top: calc(50% - 20px);
    left: calc(50% - 20px);
}
</style>
