<script setup>

    import { ref, inject, onMounted, computed } from 'vue'

    // injections
    const backgrounds = inject('backgrounds')
    const config = inject('config')
    const av = inject('av')
    const lang = inject('lang')
    const clickable = ref('auto')

    defineExpose({
        chFrame
    })

    let teintpos = computed(() => {
        return (av.teint * config._TEMPLATE_DELTA_Y + config._TEMPLATE_DIV_Y) + 'px'
    })

    function chFrame(obj,direction,objs,position) {
        let bgpos, x, y, n, newx
        // avoid to heavy clicking
        clickable.value = 'none'
        // direkt ansteuern
        if (position === 0 || position) {
            direction = position
            av.template = position
        } else {
            // rauf oder runter
            if (direction == 1) {
                av.template++
                if (av.template == config._NUM_TEMPLATES) {
                    av.template = 0
                }
            } else {
                av.template--
                if (av.template < 0) {
                    av.template = config._NUM_TEMPLATES - 1
                }
            }
        }
        // backgrounds anpassen
        document.querySelectorAll(objs).forEach(function(el) {
            bgpos = window.getComputedStyle(el)['background-position'].split(' ')
            //bgpos = el.css('background-position').split(' ');
            x = parseInt(bgpos[0],10)
            y = bgpos[1]
            n = ~~((x - config._TEMPLATE_DIV) / config._TEMPLATE_DELTA) // ~~ schneidet die Kommastellen ab
            newx = ((n - direction) * config._TEMPLATE_DELTA) + config._TEMPLATE_DIV
            el.style.backgroundPosition = newx.toString() + 'px ' + y
        })
        // activate pointer events
        setTimeout(() => clickable.value = 'auto', 500)
    }


</script>

<template>

    <div id="ae-outfcont">
        <a class="ae-oflink left" :style="{ backgroundImage : backgrounds.arrowright, pointerEvents : clickable }" href="" @click.prevent="chFrame(this,1,'#av1,#av2,#av3')" :title="lang.previous"></a>
        <div id="ae_ofbordercont">
            <div id="av1" class="ae-ofborder" :style="{ backgroundImage : backgrounds.avatars, pointerEvents : clickable, backgroundPositionY : teintpos }" @click="chFrame(this,-1,'#av1,#av2,#av3')"></div>
            <div id="ae-ofgborder">
                <div id="av2" class="ae-ofborder" :style="{ backgroundImage : backgrounds.avatars, backgroundPositionY : teintpos }"></div>
            </div>
            <div id="av3" class="ae-ofborder" :style="{ backgroundImage : backgrounds.avatars, pointerEvents : clickable, backgroundPositionY : teintpos }" @click="chFrame(this,1,'#av1,#av2,#av3')"></div>
        </div>
        <a class="ae-oflink right" :style="{ backgroundImage : backgrounds.arrowleft, pointerEvents : clickable }" href="" @click.prevent="chFrame(this,-1,'#av1,#av2,#av3')" :title="lang.next"></a>
    </div>

</template>

<style lang="scss">

    #ae-outfcont { box-sizing:border-box; position:relative; width:100%; height:200px; background-color:#4D4D4D; z-index: 100;}
    .ae-oflink { position:absolute; top:0px; display:block; width:50px; height:100%; background-position:center; background-repeat:no-repeat; }
    #ae_ofbordercont { width:430px; margin:auto; overflow:hidden; padding-top:35px; }
    .ae-oflink.left { left:0px;  }
    .ae-oflink.right { right:0px; }

    .ae-ofborder { box-sizing:border-box; width:125px; height:130px; border:2px solid black; float:left; margin:0px 7px; overflow:hidden; background: center repeat-x; }
    #av1 { background-position:-120px center; cursor:pointer; }
    #av2 { margin-top:25px; background-position:-245px center; }
    #av3 { background-position:-370px center; cursor:pointer; }
    .ae-ofborder { transition: background-position .5s; }
    #ae-ofgborder { float:left; width:140px; height:180px; border:5px solid #5FB675; position:relative; top:-30px; box-sizing:content-box; }

</style>