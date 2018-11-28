<template>
    <div>
        <div  class="camera">
            <video style="display: none;" ref="video">Video stream not available.</video>
            <button @click.stop="captureImage" ref="startbutton">Take photo</button>
        </div>
        <canvas style="display: none;" ref="canvas"></canvas>
        <canvas style="display: none;" ref="webglCanvas"></canvas>
        <img ref="photo" alt="The screen capture will appear in this box.">
    </div>
</template>

<script>
import shaderPass from '../utils/shader-pass.js';

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
	computed: {
		currentQuestion() {
			return this.$store.getters.getCurrentQuestion;
		}
	},
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
            } else {
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
        this.$refs.video.removeEventListener('canplay', (data) => console.log(data));
		console.log('destroyed');
	}
};



</script>