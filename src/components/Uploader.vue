<script setup>

    // useing: https://docs.dropzone.dev/
    import Dropzone from "dropzone";
    import { ref, reactive, inject, onMounted, computed, nextTick } from 'vue'

    const emit = defineEmits(['changed','error'])

    defineExpose({
        showImage
    })

    const props = defineProps({
        apiUrl: String,
        scope : String,
        userid : Number,
        video : { type : Object, default : () => ({
            width : 300,
            height : 300,
            type : "image/jpeg",
            quality : 0.95,
            extension : ".jpg"                
        })}
    })

    const jwt = inject('jwt')
    const lang = inject('lang')
    const backgrounds = inject('backgrounds')
    const loading = ref(false)
    const upload = reactive({
        background : backgrounds.value.fileupload,
        size : 'auto',
        id : 0,
        url : ''
    })
    let hasImage = ref(false)

    let pictureOn = ref(false)
    let captured = ref(false)
    const player = ref(null)
    const canvas = ref(null)
    const clipping = ref(null)
    const video = reactive({
        width : 0,
        height : 0,
        top : 0,
        left : 0
    })

    let canTakePicture = computed(() => {
        return 'mediaDevices' in navigator
    })

    onMounted(() => {
        const myDropzone = new Dropzone("#ae-media-dropzone", {
            createImageThumbnails : false,
            disablePreviews : true,
            clickable : ['#ae-media-btnbrowse'],
            headers : { 'Authorization' : 'Bearer ' + jwt },
            init : function() {
                this.on('sending',() => {
                    loading.value=true 
                    upload.size = 'auto'
                })
                this.on('uploadprogress', (file, progress, bytesSent) => {
                    if (progress < 100) {
                        console.log(progress)
                    }
                })
                this.on('complete', (file) => {
                    loading.value = false
                })
                this.on('error',(file, message) => {
                    loading.value = false
                    console.log('error: '+message)
                })
            },
            success : function(result) {
                //console.log(result.xhr.response)
                showImage(JSON.parse(result.xhr.response))
            }
        })
    })

    function showImage(updata) {
        if (updata.url) {
            upload.size = 'contain'
            upload.background = 'url('+updata.url+')'
            upload.id = updata.id
            upload.url = updata.url
            hasImage.value = true;
        } else {
            hasImage.value = false;
        }
        emit('changed',upload.id, upload.url)
    }

    function openCamera() {

        player.value.addEventListener('play',() => {
            // get video size
            const aspect = player.value.videoWidth / player.value.videoHeight
            pictureOn.value = true
            captured.value = false

            nextTick(() => {
                
                const c_w = clipping.value.clientWidth
                const c_h = clipping.value.clientHeight

                // calculate size
                if (aspect >= 1) {
                    // adjust height
                    video.height = c_h + 'px'
                    video.width = (c_h * aspect) + 'px'
                    video.left = ((c_h * aspect - c_w ) / -2) + 'px'
                    video.top = '-4px'
                } else {
                    // adjust width
                    video.width = c_w + 'px'
                    video.height = (c_w * aspect) + 'px'
                    video.top = (video.top + ((c_w * aspect - c_h) / -2)) + 'px'
                }
            })
        })

        navigator.mediaDevices.getUserMedia({video : true}).then((stream) => {
            // Attach the video stream to the video element and autoplay.
            player.value.srcObject = stream;
        });
    }

    function abortPicture() {
        stopVideo()
        captured.value = false
        pictureOn.value = false
    }

    function takePicture() {
        const context = canvas.value.getContext('2d')
        captured.value = true
        nextTick(() => {
            // calc size
            const dWidth = canvas.value.clientWidth
            const dHeight = canvas.value.clientHeight
            const aspect = player.value.videoWidth / player.value.videoHeight 
            let sx, sy, sWidth, sHeight
            if (aspect >= 1) {
                // adjust width
                sHeight = sWidth = player.value.videoHeight
                sx = (player.value.videoWidth - sHeight) / 2
                sy = 0
            } else {
                // adjust height
                sWidth = sWidth = player.value.videoWidth
                sx = 0
                sy = (player.value.videoHeight - sWidth) / 2
            }
            //console.log(sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight)
            context.drawImage(player.value, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight)
            // stop video playing
            stopVideo()
            // get blob and File-Object
            canvas.value.toBlob((blob) => uploadBlob(blob),props.video.type,props.video.quality)
        })
    }

    function stopVideo() {
        player.value.srcObject.getVideoTracks().forEach(track  => track.stop())
    }

    function uploadBlob(blob) {
        // create form
        const file = new File([blob], Date.now()+props.video.extension,{type:props.video.type})
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userid", props.userid);
        formData.append("scope", props.scope); 
        // send data
        try {
            pictureOn.value = false
            upload.size = 'auto'
            loading.value=true 
            fetch(props.apiUrl,{
                body : formData,
                method : 'POST',
                headers : { 'Authorization' : 'Bearer ' + jwt },
            }).then((response) => {
                if ( ! response.ok) {
                    throw new Error('Video upload network error!')
                }
                return response.json()
            }).then(result => {
                showImage(result)
                loading.value = false
            }).catch(error => {
                loading.value = false
                emit('error',error)
            })
        } catch (error) {
            loading.value = false
            emit('error',error)
            console.log(error)
        }
    } 


</script>

<template>

    <div id="ae-uploadcontainer">
        <form id="ae-media-dropzone" class="ae-media-dropzone" :action="apiUrl">

            <div v-if=" ! pictureOn" id="ae-media-filelist" class="ae-media-filelist">
                <div class="previews"></div>
                <a id="ae-media-fileentry" :class="{ empty : ! hasImage }" href="" class="ae-media-fileentry" :style="{ backgroundImage : (loading ? backgrounds.loader : upload.background), backgroundSize : upload.size }" @click.prevent="showImage"></a>
            </div>

            <div ref="clipping" id="ae-media-video" class="ae-media-filelist" v-show="pictureOn">
                <video id="player" ref="player" autoplay :style="{ width : video.width, height : video.height, left : video.left, top : video.top }"></video>
            </div>
            <canvas v-show="captured" id="ae-canvas" ref="canvas" :width="props.video.width" :height="props.video.height"></canvas>
            <div  v-if="pictureOn && ! captured">
                <a href="" id="ae-media-btncameracloser" class="ae-media-btnbrowse" @click.prevent="abortPicture"></a>
                <a href="" id="ae-media-btncamera" class="ae-media-btnbrowse" @click.prevent="takePicture"></a>
            </div>
            <div v-if=" ! pictureOn" class="ae-media-text">{{ lang.upload_desc }}</div>
            <div v-if=" ! pictureOn" class="ae-media-buttons">
                <a  id="ae-media-btnbrowse" class="ae-media-btnbrowse">{{ lang.upload }}</a>
                <a v-if="canTakePicture" id="ae-media-btnpicture" class="ae-media-btnbrowse" @click.prevent="openCamera">{{ lang.picture }}</a>
            </div>

            <input type="hidden" name="userid" :value="props.userid" />
            <input type="hidden" name="scope" :value="props.scope" />
        </form>
    </div>

</template>

<style lang="scss">

    .dz-preview { display: none; }
    #ae-uploadcontainer { box-sizing:border-box; width:100%; height:350px; background-color:#4D4D4D; margin-bottom:30px; text-align:center; z-index: 100; position: relative;}
    .ae-media-text span:last-child { display:none; }
    #ae-uploadcontainer input[type=file] { display:none; }
    #ae-uploadcontainer > div { box-sizing:border-box; width:100%; background-color:#4D4D4D; margin-top:5px; text-align:center; }
    #ae-uploadcontainer .ae-media-dropzone { background:#4D4D4D center 80px no-repeat; padding:20px 4px 4px 4px; position:relative; }
    .ae-media-btnbrowse { height:27px; cursor:pointer; line-height:27px; background-color:#5cba76; padding:2px 15px 0px; color:black; margin:10px 5px; display:inline-block; }
    .ae-media-btnbrowse:hover { text-decoration:none; color:white; }
    .ae-media-filelist { border: 5px solid #333333; padding:4px; height:180px; width:180px; margin:20px auto; box-sizing:content-box; }
    .ae-media-filelist.selected { border: 5px solid #5FB675; }
    .ae-media-fileentry { display: block; position:relative; box-sizing: border-box; height: 180px; margin:auto; width: 180px; background: center no-repeat; background-size: auto; }
    .ae-media-fileentry.done { background-size:contain; }
    .ae-media-fileentry p { display:none; position:absolute; z-index:1000; font-weight:bold; top:80px; text-align:center; padding:20px; overflow:hidden; height:50%; }
    .ae-media-fileentry.working span { display:inline-block; position:absolute; top:-4px; right:-4px; height:40px; width:40px; background: center center no-repeat; cursor:pointer; z-index:1000; }
    .ae-media-fileentry span { display:none; }
    .ae-media-fileentry div { display:none; position:relative; top:0px; left:0px; width:180px; height:180px; box-sizing:border-box; background-color:#B5B3B3; overflow:hidden; }
    .ae-media-fileentry.working div { display:block; }

    #ae-media-video {

        width: 200px;
        height: 200px;
        position : relative;
        margin: 25px auto 5px;
        overflow:hidden;

        #player {
            position: relative;
        }
    }

    #ae-canvas {
        opacity: 0;
        position:absolute;
        top:0px;
        left:0px;
    }

    #ae-media-btncamera { 
        display:inline-block;
        width: 24px;
        height: 24px;
        border-radius:14px;
        border:2px solid grey;
        background-color: red;
        padding: 0;
        margin:9px 10px;
    }

    #ae-media-btncameracloser { 
        display: inline-block;
        background-color: black; 
        padding:0; 
        border: 2px solid grey;
        width:24px;
        height:24px;
        margin:8px 10px;
    }

</style>