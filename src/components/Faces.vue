<script setup>

    import { ref, inject, onMounted, computed } from 'vue'

     // events
    const emit = defineEmits(['clicked'])

    // injections
    const backgrounds = inject('backgrounds')
    const config = inject('config')
    const av = inject('av')
    const lang = inject('lang')
    const clickable = ref('auto')

    defineExpose({
        chFace,
        chTeint
    })

    let teintpos = computed(() => {
        return (av.teint * config._FACES_DELTA_Y + config._FACES_DIV_Y) + 'px'
    })

    function chFace(obj,direction,objs,position) {
        let bgpos, x, y, n, newx
        // avoid to heavy clicking
        clickable.value = 'none'
        // direkt ansteuern
        if (position === 0 || position) {
            direction = position
        } else {
            av.file = 0
            if (direction == 1) {
                av.face++
                if (av.face == config._NUM_FACES) {
                    av.face = 0
                }
            } else {
                av.face--;
                if (av.face < 0) {
                    av.face = config._NUM_FACES - 1
                }
            }
        }
        // backgrounds anpassen
        document.querySelectorAll(objs).forEach(function(el) {
            bgpos = window.getComputedStyle(el)['background-position'].split(' ')
            x = parseInt(bgpos[0])
            y = bgpos[1]
            n = ~~((x - config._FACES_DIV) / config._FACES_DELTA) // ~~ schneidet die Kommastellen ab
            newx = ((n - direction) * config._FACES_DELTA) + config._FACES_DIV
            el.style.backgroundPosition = newx.toString() + 'px ' + y
        });
        // activate pointer events
        setTimeout(() => clickable.value = 'auto', 500)

    }

    function chTeint(teint) {
        av.teint = teint
    }

</script>

<template>

    <div id="ae-facescont">

        <a class="ae-fclink left" :style="{ backgroundImage : backgrounds.arrowright, pointerEvents : clickable }" href="" @click.prevent="chFace(this,1,'#af1,#af2,#af3')" :title="lang.previous"></a>
        <div id="ae_fcbordercont">
            <div id="af1" class="ae-fcborder" :style="{ backgroundImage : backgrounds.faces, pointerEvents : clickable, backgroundPositionY : teintpos }" @click="chFace(this,-1,'#af1,#af2,#af3')" ></div>
            <div id="ae-fcgborder" class="selected">
                <div id="af2" class="ae-fcborder" :style="{ backgroundImage : backgrounds.faces, backgroundPositionY : teintpos }" @click="emit('clicked')"></div>
            </div>
            <div id="af3" class="ae-fcborder" :style="{ backgroundImage : backgrounds.faces, pointerEvents : clickable, backgroundPositionY : teintpos }" @click="chFace(this,1,'#af1,#af2,#af3')"></div>
        </div>
        <a class="ae-fclink right" :style="{ backgroundImage : backgrounds.arrowleft, pointerEvents : clickable  }" href="" @click.prevent="chFace(this,-1,'#af1,#af2,#af3')" :title="lang.next"></a>

        <div id="ae-teintbar">
            <a href="" id="ae-c_0" class="ae-chteint" :class="{ active : (av.teint == 0)}" @click.prevent="chTeint(0)"></a>
            <a href="" id="ae-c_1" class="ae-chteint" :class="{ active : (av.teint == 1)}" @click.prevent="chTeint(1)"></a>
            <a href="" id="ae-c_2" class="ae-chteint" :class="{ active : (av.teint == 2)}" @click.prevent="chTeint(2)"></a>
        </div>

    </div>



</template>

<style lang="scss">

    #ae-facescont { box-sizing:border-box; position:relative; width:100%; height:260px; background-color:#4D4D4D; margin-bottom:40px; z-index: 100; }
    .ae-fclink { position:absolute; top:0px; display:block; width:50px; height:100%; background-position:center; background-repeat:no-repeat; }
    .ae-fclink.left { left:0px;  }
    .ae-fclink.right { right:0px; }
    #ae_fcbordercont { box-sizing:border-box; height:200px; width:440px; margin:auto; overflow:hidden; padding-top:35px; }
    .ae-fcborder { box-sizing:border-box; width:125px; height:130px; border:2px solid black; float:left; margin:0px 9px; overflow:hidden; background: center repeat-x; cursor:pointer; }
    #af1 { background-position:5px 6px; }
    #af2 { margin-top:25px; background-position:-120px 6px; }
    #af3 { background-position:-245px 6px; }
    .ae-fcborder { transition: background-position .5s; }
    #ae-fcgborder { float:left; border:5px solid transparent; width:140px; height:180px; position:relative; top:-30px; box-sizing: content-box; }
    #ae-fcgborder.selected { border:5px solid #5FB675; }
    #ae-teintbar {
        height:48px;
        width:135px;
        position:relative;
        background-color:#1A1A1A;
        z-index:130;
        margin:auto;

        .ae-chteint {
            display:inline-block;
            width:32px;
            height:32px;
            margin:5px 0 5px 5px;
            border:3px solid #1A1A1A;
            box-sizing: content-box;

            &.active { border:3px solid white; }
        }

        #ae-c_0 { background-color: #E6C6B3; }
        #ae-c_1 { background-color: #89542D; }
        #ae-c_2 { background-color: #5F3218; }
    }


</style>