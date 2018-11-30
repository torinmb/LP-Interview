<template>
    <div class="container">
        <div v-if="sliderVisible && questionIndex != -1" ref="slider" class="slider" @mousedown.stop="slideReady" @touchstart.stop="slideReady"></div>
    </div>
</template>

<script>
import * as THREE from 'three';
import * as OrbitControls from  '../THREE_Helpers/OrbitControls.js'
import * as WEBGL from  '../THREE_Helpers/WebGl.js'
import * as TessellateModifier from  '../THREE_Helpers/TessellateModifier.js'
import {noVerticies, yesVerticies} from  '../THREE_Helpers/TextVerticies.js'
import TWEEN from '@tweenjs/tween.js';

let container, camera, renderer, controls;
let sceneL, sceneR;

export default {
    data: function() {
		return {
            sliderPos: window.innerWidth / 2,
            sliderMoved: false,
            sliderClicked: false,
            sliderVisible: true,
            updateYesPoints: false,
            updateNoPoints: false,
            imagePointsPosition: []
		}
	},
	mounted() {
		container = document.querySelector('.container');
        sceneL = new THREE.Scene();
        sceneL.background = new THREE.Color(0x3F4C78);
        sceneR = new THREE.Scene();
        sceneR.background = new THREE.Color(0x7ACB71);
        camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 0);
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
        let self = this;
        document.body.onkeyup = function (e) { //animate the drawing when space bar is pressed
			if (e.keyCode == 32) {
                e.preventDefault();
                console.log(self.extrude);
                console.log('keyDown');
				self.extrude = !self.extrude;
			}
		}

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
        updatePoints(mesh) {
            let tempColor = new THREE.Color();
            for (let i = 0; i < mesh.geometry.vertices.length; i++) {
                let point = mesh.geometry.vertices[i];
                if (this.extrude) {
                    point.destination.z = tempColor.getHSL(mesh.geometry.colors[i]).l * 5 - 5 ;
                    // point.speed = Math.random() / 800 + params.speed;
                    // point.speed = Math.random() / 1000 + 0.1;
                } else {
                    point.destination.z = 0;
                    // point.speed = Math.random() / 400 + params.speed;
                }
                point.lerp(point.destination, point.speed);
            }
        },
        resetPointDestination(mesh, destinationVerticies) {
            for (let i = 0; i < mesh.geometry.vertices.length; i++) {
                let point = mesh.geometry.vertices[i];
                point.destination = destinationVerticies[i];
            }
        },
        initTextGeometry(text, font, size, detail) {
            let geometry = new THREE.TextGeometry( text, {
                font: font,
                size: size,
                height: 0.12,
                curveSegments: detail,
                bevelThickness: 0,
                bevelSize: 0,
                bevelEnabled: false
            });
            // let tessellateModifier = new THREE.TessellateModifier( 20 );
            // for ( let i = 0; i < 6; i ++ ) {
            //     tessellateModifier.modify( geometry );
            // }
            let t = new THREE.BufferGeometry().fromGeometry( geometry );
            t.computeBoundingBox();
            t.computeVertexNormals();
            t.center();
            return t;
            // return geometry;
        },
        initMeshes() {
            let loader = new THREE.FontLoader();
            loader.load( '/SharpSansNo1Medium_Regular.json', ( font ) => {
                let geomB = this.initTextGeometry('Yes', font, 3, 20);
                let material = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true });
                this.yesText = new THREE.Mesh( geomB, material );
                this.yesText.position.set(1, 0, -0.05);
                sceneL.add(this.yesText);
                this.yesPoints = this.initParticles({width: 420, height: 315}, yesVerticies, 0xffffff, 1);
                this.yesPoints.position.set(1, 0, 0);
                sceneL.add(this.yesPoints);
                
                let geomA = this.initTextGeometry('No', font, 3, 20);
                let matA = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true });
                this.noText = new THREE.Mesh( geomA, matA );
                this.noText.position.set(0, 0, -0.05);
                sceneR.add(this.noText);
                this.noPoints = this.initParticles({width: 420, height: 315}, noVerticies, 0x000000);
                sceneR.add(this.noPoints);
                // console.log(pointsB);
			});
        },
        initParticles(imageData, vertices, color, offsetX = 0) {
            let geometry = new THREE.Geometry();
            let material = new THREE.PointsMaterial({
                size: 1,
                //map: this.tex,
                vertexColors: THREE.VertexColors,
                sizeAttenuation: false
            });
            const raycaster = new THREE.Raycaster();
            const rayCasterVertex = new THREE.Vector3(0,0,1);
            // let boundingBox = mesh.geometry.boundingBox;
            // console.log(mesh.geometry);
            let index = 0;
            for (let y = 0, y2 = imageData.height; y < y2; y += 2) {
                for (let x = 0, x2 = imageData.width; x < x2; x += 2) {
                    /*
                    let vertex = new THREE.Vector3();
                    vertex.x = Math.random() * boundingBox.max.x*2 - boundingBox.max.x + 1.0;
                    vertex.y = Math.random() * boundingBox.max.y*2 - boundingBox.max.y;
                    vertex.z = Math.random() * boundingBox.max.z*2 - boundingBox.max.z*2;
                    let particleIsOutsideMesh = true;
                    while(particleIsOutsideMesh) {
                        raycaster.set(vertex, rayCasterVertex);
                        const intersects = raycaster.intersectObject(mesh)
                        if(intersects.length % 2 === 1) { // Points is in objet
                            particleIsOutsideMesh = false;
                        } else {
                            vertex.x = Math.random() * boundingBox.max.x*2 - boundingBox.max.x;
                            vertex.y = Math.random() * boundingBox.max.y*2 - boundingBox.max.y;
                            vertex.z = Math.random() * boundingBox.max.z*2 - boundingBox.max.z*2;
                        }
                    }
                    */
                   let vertex = new THREE.Vector3(vertices[index].x, vertices[index].y, vertices[index].z);
                //    let vertex = vertices[index];
                    let destination = {
                        x: (x - imageData.width / 2)/imageData.width * 4 - offsetX,
                        y: (-y + imageData.height / 2)/imageData.height * 4,
                        z: 0
                    };
                    vertex.destination = destination;
                    this.imagePointsPosition.push(destination);
                    vertex.speed = Math.random() / 400 + 0.015;
                    geometry.vertices.push(vertex);
                    let imgIndex = (x * 4 + y * 4 * imageData.width);
                    // let color = new THREE.Color(imageData.data[imgIndex], imageData.data[imgIndex + 1], imageData.data[imgIndex + 2]);
                    // geometry.colors[index] = color;
                    geometry.colors[index] = new THREE.Color(color);
                    index++;
                }
            }
            let particles = new THREE.Points(geometry, material);
            return particles;
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
            if(this.updateYesPoints) {
                this.updatePoints(this.yesPoints);
                this.yesPoints.geometry.verticesNeedUpdate = true;
            }
            if(this.updateNoPoints) {
                this.updatePoints(this.noPoints);
                this.noPoints.geometry.verticesNeedUpdate = true;
            }
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
                    this.resetPointDestination(this.yesPoints, this.imagePointsPosition);
                } else if(endSliderPose <= 0.25) {
                    endSliderPose = 0;
                    this.resetPointDestination(this.noPoints, this.imagePointsPosition);
                } else {
                    endSliderPose = window.innerWidth / 2;
                }
                console.log(endSliderPose);
                this.tweenSliderToPose(endSliderPose)
                .then(() => {
                    if(this.sliderPos == 0 || this.sliderPos == window.innerWidth) {
                        this.sliderVisible = false;
                        if(this.sliderPos == window.innerWidth) {
                            this.updateYesPoints = true;
                            this.yesText.material.opacity = 0;
                        } else {
                            this.updateNoPoints = true;
                            this.noText.material.opacity = 0;
                        }
                        setTimeout(() => {
                            if(this.sliderPos == window.innerWidth) {
                                this.resetPointDestination(this.yesPoints, yesVerticies);
                            } else {
                                this.resetPointDestination(this.noPoints, noVerticies);
                            }

                            setTimeout(() => {
                                this.updateYesPoints = false;
                                this.updateNoPoints = false;
                                this.noText.material.opacity = 1;
                                this.yesText.material.opacity = 1;
                                this.nextQuestion(this.sliderPos == window.innerWidth);
                                this.tweenSliderToPose(window.innerWidth / 2).then(() => {
                                    this.sliderVisible = true;
                                });
                            }, 5000);
                            
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
    background-color: #ffffff;
    opacity: 0.7;
    border-radius: 50%;
    top: calc(50% - 20px);
    left: calc(50% - 20px);
}
</style>