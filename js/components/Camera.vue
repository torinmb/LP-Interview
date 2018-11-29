<template>
    <div>
        <div  class="camera">
            <video style="display: none;" ref="video">Video stream not available.</video>
            <button @click.stop="captureImage" ref="startbutton">Take photo</button>
        </div>
        <canvas style="display: none;" ref="canvas"></canvas>
        <canvas  ref="webglCanvas"></canvas>
        <img id='shader-img' style="display: none;" ref="photo" alt="The screen capture will appear in this box.">
    </div>
</template>

<script>
import shaderPass from '../utils/shader-pass.js';
import Hermite_class from 'hermite-resize';
let HERMITE = new Hermite_class();

export default {
	data: function() {
		return {
            width: 420,
            height: 0,
            streaming: false
		}
	},
	mounted() {
        this.$nextTick(function () {
            const videoEl = this.$refs.video;
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then(function(stream) {
                    videoEl.srcObject = stream;
                    videoEl.play();
                })
                .catch(function(err) {
                    console.error("An error occurred! " + err);
                });

            const canvasEl = this.$refs.canvas;
            const webglEl = this.$refs.webglCanvas;
            videoEl.addEventListener('canplay', (ev) => {
                if (!this.streaming) {
                    this.height = videoEl.videoHeight / (videoEl.videoWidth/this.width);
                    videoEl.setAttribute('width', this.width);
                    videoEl.setAttribute('height', this.height);
                    canvasEl.setAttribute('width', this.width);
                    canvasEl.setAttribute('height', this.height);
                    webglEl.setAttribute('width', this.width);
                    webglEl.setAttribute('height', this.height);
                    this.streaming = true;
                }
            }, false);

        });
        console.log('mounted');
	},
	// computed: {
	// 	currentQuestion() {
	// 		return this.$store.getters.getCurrentQuestion;
	// 	}
	// },
	methods: {
		captureImage() {
            let canvasEl = this.$refs.canvas;
            const videoEl = this.$refs.video;
            const webglEl = this.$refs.webglCanvas;
            let context = canvasEl.getContext('2d');
            if (this.width && this.height) {
                canvasEl.width = this.width;
                canvasEl.height = this.height;
                context.drawImage(videoEl, 0, 0, this.width, this.height);
                shaderPass(canvasEl, webglEl);
                let data = webglEl.toDataURL('image/jpeg');
                this.$refs.photo.setAttribute('src', data);
                this.$store.dispatch('saveImage', data);
                // HERMITE.resize_image('shader-img', this.width/2, this.height/2);
                // HERMITE.resample(webglEl, this.width/2, this.height/2, true, (data) => {
                //     console.log('resized');
                //     console.log(data);
                // });
            } else {
                console.log('clearnign image');
                this.clearImage();
            }
        },
        clearImage() {
            let canvasEl = this.$refs.canvas;
            let context = canvasEl.getContext('2d');
            context.fillStyle = "#AAA";
            context.fillRect(0, 0, canvasEl.width, canvasEl.height);
            let data = canvasEl.toDataURL('image/jpeg');
            this.$refs.photo.setAttribute('src', data);
        }
	},
	destroyed() {
        // document.querySelector('.video').removeEventListener('canplay', (data) => console.log(data));
		console.log('destroyed');
	}
};



</script>