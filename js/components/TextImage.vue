<template>
    <div></div>
</template>

<script>
import * as THREE from 'three';
import {noVerticies, yesVerticies} from  '../THREE_Helpers/TextVerticies.js'
import TWEEN from '@tweenjs/tween.js';

export default {
    data: function() {
		return {
            updateYesPoints: false,
            updateNoPoints: false,
            imagePointsPosition: [],
            yesColor: 0xffffff,
            noColor: 0x000000
		}
	},
	mounted() {
        this.initMeshes();
        this.initLights();
        let self = this;
        document.body.onkeyup = function (e) { //animate the drawing when space bar is pressed
			if (e.keyCode == 32) {
                e.preventDefault();
                console.log(self.extrude);
                console.log('keyDown');
				self.extrude = !self.extrude;
			}
		}
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
        },
        imageData() {
            return this.$store.getters.getImageData;
        },

    },
    watch: {
        imageData(img) {
            console.log('state image updated ');
            if(img) {
                console.log('found Image data');
                let index = 0;
                for (var y = 0, y2 = img.height; y < y2; y += 2) {
                    for (var x = 0, x2 = img.width; x < x2; x += 2) {
                        let imgIndex = (x * 4 + y * 4 * img.width);
                        let color = new THREE.Color(img.data[imgIndex], img.data[imgIndex + 1], img.data[imgIndex + 2]);
                        // this.yesPoints.geometry.colors[index].destinationColor = color;
                        // this.noPoints.geometry.colors[index].destinationColor = color;
                        this.yesPoints.geometry.colors[index] = color;
                        this.noPoints.geometry.colors[index] = color;
                        index += 1;
                    }
                }
            }
            this.yesPoints.geometry.colorsNeedUpdate = true;
            this.noPoints.geometry.colorsNeedUpdate = true;
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
                // console.log(mesh.geometry.colors[i]);
                // mesh.geometry.colors[i].lerp(mesh.geometry.colors.destinationColor, point.speed);
                // mesh.geometry.colors[i] = tempColor.setRGB(mesh.geometry.colors[i]).lerp(point.destinationColor, point.speed);
                // mesh.geometry.colors[i].lerp(point.destinationColor, point.speed);
            }
        },
        setYesPointsDestinationToImage() {
            this.resetPointDestination(this.yesPoints, this.imagePointsPosition);
        },
        setNoPointsDestinationToImage() {
            this.resetPointDestination(this.noPoints, this.imagePointsPosition);
        },
        setYesPointsDestinationToText() {
            this.resetPointDestination(this.yesPoints, yesVerticies, this.yesColor);
        },
        setNoPointsDestinationToText() {
            this.resetPointDestination(this.noPoints, noVerticies, this.noColor);
        },
        tweenMeshOpacity(mesh, endOpacity) {
            let self = this;
            return new Promise(function (resolve, reject) {
                let currState = {opacity: mesh.material.opacity};
                let tweenSliderPosition = new TWEEN.Tween(currState)
                .to({'opacity': endOpacity}, 500)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => mesh.material.opacity = currState.opacity)
                .onComplete(()  => resolve());
                tweenSliderPosition.start();
            });
        },
        animateYes() {
            this.updateYesPoints = true;
            this.yesText.material.opacity = 0;
        },
        animateNo() {
            this.updateNoPoints = true;
            this.noText.material.opacity = 0;
        },
        stopYesAnimation() {
            this.updateYesPoints = false;
            this.tweenMeshOpacity(this.yesText, 1);
            // this.yesText.material.opacity = 1;
        },
        stopNoAnimation() {
            this.updateNoPoints = false;
            this.tweenMeshOpacity(this.noText, 1);
            // this.noText.material.opacity = 1;
        },
        resetPointDestination(mesh, destinationVerticies, color) {
            // let img = this.imageData;
            // let index = 0;
            // console.log(img);
            // console.log('AHHH IMG');
            // for (var y = 0, y2 = img.height; y < y2; y += 2) {
            //     for (var x = 0, x2 = img.width; x < x2; x += 2) {
            //         let point = mesh.geometry.vertices[index];
            //         //set position
            //         point.destination = destinationVerticies[index];
            //         if(color) {
            //             point.destinationColor = new THREE.Color(color);
            //         } else {
            //             let imgIndex = (x * 4 + y * 4 * img.width);
            //             let color = new THREE.Color(img.data[imgIndex], img.data[imgIndex + 1], img.data[imgIndex + 2]);
            //             point.destinationColor = color;
            //         }
            //         this.yesPoints.geometry.colors[index] = color;
            //         this.noPoints.geometry.colors[index] = color;
            //         index += 1;
            //     }
            // }
            if(color) {
                color = new THREE.Color(color);
            }
            for (let i = 0; i < mesh.geometry.vertices.length; i++) {
                let point = mesh.geometry.vertices[i];
                point.destination = destinationVerticies[i];
                if(color) {
                    mesh.geometry.colors[i].destinationColor = color;
                }
                
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
                let material = new THREE.MeshStandardMaterial({ color: this.yesColor, transparent: true });
                this.yesText = new THREE.Mesh( geomB, material );
                this.yesText.renderOrder = 1;
                this.yesText.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
                this.yesText.position.set(1, 0, -0.05);
                window.sceneL.add(this.yesText);
                this.yesPoints = this.initParticles({width: 420, height: 315}, yesVerticies, this.yesColor, 1);
                this.yesPoints.position.set(1, 0, 0);
                window.sceneL.add(this.yesPoints);
                
                let geomA = this.initTextGeometry('No', font, 3, 20);
                let matA = new THREE.MeshStandardMaterial({ color: this.noColor, transparent: true });
                this.noText = new THREE.Mesh( geomA, matA );
                this.noText.renderOrder = 1;
                this.noText.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
                this.noText.position.set(0, 0, -0.05);
                window.sceneR.add(this.noText);
                this.noPoints = this.initParticles({width: 420, height: 315}, noVerticies, this.noColor);
                window.sceneR.add(this.noPoints);

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
                    let destination = {
                        x: (x - imageData.width / 2)/imageData.width * 4 - offsetX,
                        y: (-y + imageData.height / 2)/imageData.height * 4,
                        z: 0
                    };
                    vertex.destination = destination;
                    this.imagePointsPosition.push(destination);
                    vertex.speed = Math.random() / 400 + 0.023;
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
            window.sceneL.add(light1);
            window.sceneR.add(light1.clone());
            let light2 = new THREE.DirectionalLight();
            light2.position.set(- 20, 20, 20);
            window.sceneL.add(light2);
            window.sceneR.add(light2.clone());
        },
        update() {
            //called by every frame in webGL render
            if(this.updateYesPoints) {
                this.updatePoints(this.yesPoints);
                this.yesPoints.geometry.verticesNeedUpdate = true;
                // this.yesPoints.geometry.colorsNeedUpdate = true;
            }
            if(this.updateNoPoints) {
                this.updatePoints(this.noPoints);
                this.noPoints.geometry.verticesNeedUpdate = true;
                // this.noPoints.geometry.colorsNeedUpdate = true;
            }
        }
	},
	destroyed() {
		console.log('destroyed')
	}
};
</script>

<style>

</style>