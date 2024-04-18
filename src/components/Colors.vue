<script setup>

    import { reactive, inject, computed } from 'vue'

     const props = defineProps({
        uploadedurl: String,
        assetsUrl : String,
    })

    // events
    const emit = defineEmits(['store'])

    // injections
    const backgrounds = inject('backgrounds')
    const av = inject('av')
    const avatarpath = inject('avatarpath')
    const pos = inject('pos')

    defineExpose({
        chColor
    })

    let bgface = computed(() => {
        return av.file !== 0 ? 'url('+props.uploadedurl+')' : 'url('+avatarpath+'face_'+av.teint+'_'+av.face+'.png)'
    })
    let bgoutfit = computed(() => {
        // no color
        if (av.color == -1) {
            return ""
        }
        // normal color
        return 'url('+avatarpath+'av_'+av.teint+'_'+av.template+'_'+av.color+'.png)'
    })

    function chColor(color) {
        av.color = color
    }

    function dragging(e) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        // relative position to previous event
        let dx = e.pageX - pos.x
        let dy = e.pageY - pos.y
        pos.x = e.pageX
        pos.y = e.pageY
        // follow with resizer
        pos.rleft = (dx + parseInt(pos.rleft)) + 'px'
        pos.rtop = (dy + parseInt(pos.rtop)) + 'px'
        // follow with face/image
        pos.fleft = (dx + parseInt(pos.fleft)) + 'px'
        pos.ftop = (dy + parseInt(pos.ftop)) + 'px'
        // follow with changer
        pos.dleft = (dx + parseInt(pos.dleft)) + 'px'
        pos.dtop = (dy + parseInt(pos.dtop)) + 'px'
        // resizing
        if (e.srcElement.id === 'ae-resizer') {
            // resize border and image
            pos.width = (-dx + parseInt(pos.width)) + 'px'
            pos.height = (-dy + parseInt(pos.height)) + 'px'
        }
    }

    function dragStart(e) {
        pos.x = e.pageX
        pos.y = e.pageY
    }

    function resizeStart(e) {
        pos.x = e.pageX
        pos.y = e.pageY
    }

    function dragEnd(e) {
        emit('store')
        pos.x = 0
        pos.y = 0
    }

</script>

<template>

    <div id="ae-choosercont" @dragover="dragging">
        <div id="ae-chooser">
            <div id="ae-chconnector"></div>
            <div id="ae-colorbar">
                <a href="" id="ae-c_0" class="ae-chcolor" :class="{ active : (av.color == 0)}" @click.prevent="chColor(0)"></a>
                <a href="" id="ae-c_1" class="ae-chcolor" :class="{ active : (av.color == 1)}" @click.prevent="chColor(1)"></a>
                <a href="" id="ae-c_2" class="ae-chcolor" :class="{ active : (av.color == 2)}" @click.prevent="chColor(2)"></a>
                <a href="" id="ae-c_3" class="ae-chcolor" :class="{ active : (av.color == 3)}" @click.prevent="chColor(3)"></a>
                <a href="" id="ae-c_4" class="ae-chcolor" :class="{ active : (av.color == 4)}" @click.prevent="chColor(4)"></a>
                <a href="" id="ae-c_5" class="ae-chcolor" :style="{ backgroundImage : 'url(' + props.assetsUrl + '/nocolor.png)'}" :class="{ active : (av.color == -1)}" @click.prevent="chColor(-1)"></a>
            </div>
            <div id="ae-chimgback" :style="{ backgroundImage : bgface, left : pos.fleft, top : pos.ftop, width : pos.width, height : pos.height }"></div>
            <div id="ae-chimg" :style="{ backgroundImage : bgoutfit }"></div>
            <div id="ae-chchanger" :style="{ left : pos.dleft, top : pos.dtop, width : pos.width, height : pos.height }" draggable="true" @dragstart="dragStart" @dragend="dragEnd">
            </div>
            <div id="ae-resizer" :style="{ left : pos.rleft, top : pos.rtop }" class="ui-resizable-handle ui-resizable-nw" draggable="true" @dragstart.stop="resizeStart" @dragend.stop="dragEnd"></div>
        </div>
    </div>

</template>

<style lang="scss">

    #ae-choosercont { box-sizing:border-box; width:100%; height:350px; background-color:#4D4D4D; margin-top:30px; }
    #ae-chooser { width:300px; height:300px; margin:auto; position:relative; top:20px; box-sizing: content-box; }
    #ae-chconnector { width:5px; height:60px; background-color:#5FB675; position:absolute; left:145px; top:-60px; z-index: 100; }
    #ae-colorbar { width:48px; position:absolute; left:320px; top:0px; background-color:#1A1A1A; z-index:130; box-sizing: content-box; }
    #ae-chimg { z-index:100; position:absolute; width:300px; height:300px; background-repeat:no-repeat; background-position:center center; transition: background-image 0.5s ease-in-out; border:5px solid #5FB675; }
    #ae-chimgback { z-index:90; position:absolute; top:15px; left:15px; width:250px; height:250px; overflow:hidden; background-size:100% 100%; background-repeat:no-repeat; background-position:center top; }
    .ae-chcolor { display:block; width:32px; height:32px; margin:5px auto; border:3px solid #1A1A1A; box-sizing: content-box; }
    .ae-chcolor.active { border:3px solid white; }
    #ae-c_0 { background-color:#439A78; }
    #ae-c_1 { background-color:#00A79B; }
    #ae-c_2 { background-color:#BD9EAC; }
    #ae-c_3 { background-color:#E9DF9D; }
    #ae-c_4 { background-color:#A6494C; }
    #ae-chchanger { z-index:110; position:absolute; top:15px; left:15px; width:250px; height:250px; border:2px solid #7CE4DC; cursor:move; }
    #ae-resizer { position:absolute; top:-8px; left:-8px; width:15px; height:15px; background-color:#7CE4DC; cursor:nwse-resize; z-index: 111; }

</style>