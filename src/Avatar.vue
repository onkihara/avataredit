<script setup>

    import Uploader from './components/Uploader.vue'
    import Faces from './components/Faces.vue'
    import Colors from './components/Colors.vue'
    import Outfit from './components/Outfit.vue'
    import { ref, reactive, provide, onMounted, computed, nextTick } from 'vue'

         // events
    const emit = defineEmits(['done','error','cancel'])

    const props = defineProps({
        type: String,
        assetsUrl: String,
        getUrl : String,
        creatorUrl : String,
        uploadUrl : String,
        scope : String,
        workspace : Number,
        userid : Number,
        jwt :  String,
        lang : Object
    })

    const av = reactive({
        file : 0,
        template : 2,
        color : 0,
        face : 1,
        teint : 0,
        top : 0,
        left: 0,
        width : 0,
        height : 0
    })

    // position and sizes
    const pos = reactive({
        x : 0,
        y : 0,
        fleft : '25px',
        ftop : '17px',
        dleft : '23px',
        dtop : '15px',
        rleft : '16px',
        rtop : '8px',
        width : '250px',
        height : '250px',
    })

    // Constants
    const config = {
        _NUM_TEMPLATES : 6,
        _TEMPLATE_DIV : 5,
        _TEMPLATE_DELTA : 125,
        _TEMPLATE_DIV_Y : 6,
        _TEMPLATE_DELTA_Y : -125,
        _NUM_FACES : 8,
        _FACES_DIV : 5,
        _FACES_DELTA : 125,
        _FACES_DIV_Y : 6,
        _FACES_DELTA_Y : -125
    }

    // compute styles
    const imagepath = props.assetsUrl.replace(/\/$/i, '')+'/'
    const avatarpath = imagepath+props.type+'/'
    const backgrounds = computed(() => ({
        'taskcloser' : 'url('+imagepath+'closerb.png)',
        'taskbutton' : 'url('+imagepath+'save.png)',
        'arrowleft' : 'url('+imagepath+'arleft.png)',
        'arrowright' : 'url('+imagepath+'arright.png)',
        'fileupload' : 'url('+imagepath+'fileupload.png)',
        'loader' : 'url('+imagepath+'glitchmov.gif)',
        'faces' : 'url('+imagepath+'/'+props.type+'/faces.png)',
        'avatars' : 'url('+imagepath+'/'+props.type+'/outfits.png)',
    }))

    // provisions
    provide('imagepath',imagepath)
    provide('avatarpath',avatarpath)
    provide('backgrounds',backgrounds)
    provide('config',config)
    provide('av',av)
    provide('pos',pos)
    provide('jwt',props.jwt)
    provide('lang',props.lang)

    const uploadedurl = ref(null)
    const isSaving = ref(false)

    // component refs
    const faces = ref(null)
    const outfits = ref(null)
    const colors = ref(null)
    const uploader = ref(null)

    onMounted(() => {
        let jwt = props.jwt == '' ? import.meta.env.VITE_JWT_TOKEN : props.jwt
        // fetch avatardata if any available
        const params = new URLSearchParams({
            type : 'avatar',
            userid : props.userid,
            workspace : props.workspace
        });
        fetch(props.getUrl+'?'+params.toString(), { 
            method : 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization" : "Bearer "+jwt
            }
        }).then((response) => {
            if (!response.ok) {
                throw new Error(response.status + ': ' + response.statusText);
            }
            return response.json()
        }).then((data) => {
            storePos(data.av, data.file)
        }).catch((error) => {
            showError(error)
        })})

    function storePos(avdata, fileurl) {
        // Avatareinstellungen restaurieren
        if (avdata) {
            // dimensions
            pos.dleft = avdata.left + 'px'
            pos.dtop = avdata.top + 'px'
            pos.fleft = (avdata.left + 2) + 'px'
            pos.ftop = (avdata.top + 2) + 'px'
            pos.rleft = (avdata.left - 7)+ 'px'
            pos.rtop = (avdata.top - 7) + 'px'
            pos.width = avdata.width + 'px'
            pos.height = avdata.height + 'px'
            // teint
            faces.value.chTeint(avdata.teint)
            // face
            faces.value.chFace(null,0,'#af1,#af2,#af3',avdata.face - av.face)
            av.face = avdata.face
            // file
            if (avdata.file > 0) {
                uploader.value.showImage({
                    id : avdata.file,
                    url : fileurl
                })
                av.file = avdata.file
            }
            // frametemplate
            outfits.value.chFrame(null,0,'#av1,#av2,#av3',avdata.template - av.template)
            av.template = avdata.template
            // set color
            colors.value.chColor(avdata.color);
            //console.log(av)
        }
        // setting defaults
        av.top = parseInt(pos.dtop);
        av.left = parseInt(pos.dleft);
        av.width = parseInt(pos.width);
        av.height = parseInt(pos.height);
    }

    function create() {
        // creating is in progress already
        if (isSaving.value === true) {
            return
        }
        // create avatar
        isSaving.value = true
        storePos();
        try {
            fetch(props.creatorUrl, { 
                method : 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization" : "Bearer "+props.jwt 
                },   
                body : JSON.stringify({
                    avdata : JSON.stringify(av),
                    userid : props.userid,
                    workspace : props.workspace
                })
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(response.status + ': ' + response.statusText)
                }
                return response.json()
            }).then((data) => {
                emit('done')
                isSaving.value = false
            }).catch((error) => {
                isSaving.value = false;
                showError(error)
            })
        } catch(error) {
            isSaving.value = false;
            showError(error)
        }
    }

    function uploadedFace(id, url) {
        av.file = id
        uploadedurl.value = url
    }

    function showError(error) {
        isSaving.value = false
        //console.log(error)
        emit('error',error)
    }

</script>
<template>

    <div id="synavataredit">

        <a href="#" id="taskcloser" :style="{ backgroundImage : backgrounds.taskcloser }" @click.prevent="emit('cancel')" :title="props.lang.cancel"></a>

        <div id="ae-left">

            <h1>{{ props.lang.titel }}</h1>

            <Uploader
                ref="uploader"
                :api-url="props.uploadUrl"
                :scope="props.scope"
                :userid="props.userid"
                @changed="uploadedFace"
                @error="showError"
            ></Uploader>

            <Faces ref="faces" @clicked="uploadedFace(0)"></Faces>

        </div>

        <div id="ae-right">

            <p>{{ props.lang.outfit }}</p>

            <Outfit ref="outfits"></Outfit>

            <Colors
                ref="colors"
                :uploadedurl="uploadedurl"
                :assetsUrl="props.assetsUrl"
                @store="storePos"
            ></Colors>

            <div id="taskbuttons">
                <input id="tasksubmitbutton" :class="{ saving : isSaving }" :style="{ backgroundImage : isSaving ? backgrounds.loader : backgrounds.taskbutton }" type="submit" name="ok" :value="props.lang.save" @click="create();" />
            </div>

        </div>
    </div>

</template>

<style lang="scss">

    #synavataredit { 
        color: white; 
        font-family: helvetica, sans serif; 
        box-sizing:border-box; 
        width:100%; 
        min-height:690px; 
        float:right; 
        padding:0px 20px; 
        border:5px solid #5FB675; 
        border-left:none; 
        background-color:#1A1A1A;
        transition:background-color .5s, opacity 1s;

        &.fadeout {
            background-color:white;
            opacity:0;
        }

        #taskcloser { 
            display:block; 
            position:absolute; 
            right:15px; 
            width:50px; 
            height:50px; 
            background: center center no-repeat; 
            z-index:1000;
        }

        #ae-left, #ae-right { 
            float:left; 
            box-sizing:border-box; 
            width:50%;
        }

        #ae-left { 
            border-right:1px solid #4e4e4e;

            h1 {
                margin-bottom:0px;
            }
        }

        #ae-right { 
            border-left:1px solid #4e4e4e; 
            position:relative; 
            left:-1px;

            & > p {
                margin:30px 20px 0px 20px;
            }

            #taskbuttons {
                input { 
                    border:none; 
                    height:56px; 
                    padding:2px 45px 20px 15px; 
                    border-right:5px solid #5CBA76; 
                    font-size:1em; 
                    font-weight:bold; 
                    color:black; 
                    float:right; 
                    margin:25px 0px 20px 0px; 
                    line-height:56px; 
                    background: center right #5CBA76 no-repeat;
                    z-index: 130;
                    position: relative;

                    &:hover { 
                        cursor:pointer; 
                        background-color:#7CE4DC; 
                        border-color:#7CE4DC;
                    }

                    &:active { color:red; }

                    &.saving { background-size: 30px; }
                }
            }
        }

    }

    /* big */
    @media only screen and (min-width: 1380px) {
        #synavataredit {
            #ae-left { padding-right:20px; }
            #ae-right { padding-left: 20px; }
        }    
    }

    /* middle */
    @media only screen and (max-width: 1379px) {
        #synavataredit {
            #ae-left { padding-right:20px; }
            #ae-right { padding-left: 20px; }
            #ae_ofbordercont, #ae_fcbordercont { width:160px !important; }
            #av1, #av3, #af1, #af3 { display:none !important; }
        }
    }

    /* small */
    @media only screen and (max-width: 1050px) {
        #synavataredit {
            #ae-left { width:100%; border:none; padding:0; }
            #ae-right { width:100%; border:none; border-top:1px solid #4e4e4e; padding:0; }
            #ae_ofbordercont, #ae_fcbordercont { width:440px !important; }
            #av1, #av3, #af1, #af3 { display:block !important; }
        }
    }

    /* vsmall */
    @media only screen and (max-width: 850px) {
        #synavataredit {
            #ae_ofbordercont, #ae_fcbordercont { width:160px !important; }
            #av1, #av3, #af1, #af3 { display:none !important; }
        }
    }

</style>
