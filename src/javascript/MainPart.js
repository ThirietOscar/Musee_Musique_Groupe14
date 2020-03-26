import { TweenLite } from 'gsap/all'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

//Import object models
import Gramophone from './Gramophone.js'
import Jukebox from './Jukebox.js'
import Radio from './Radio.js'
import Vinyl from './Vinyl.js'
import MP3 from './MP3.js'

//Import sounds
import gramophoneAudioSource from '../sounds/gramophone.mp3'
import jukeboxAudioSource from '../sounds/jukebox.mp3'
import radioAudioSource from '../sounds/radio.mp3'

export default class MainPart {
    constructor() {
        /**
        * Sizes
        */
        const sizes = {}
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        /**
        * Cursor
        */
        const cursor = {}
        cursor.x = 0
        cursor.y = 0

        /**
        * Positions
        */
        
        /**
        * Scene
        */
        const scene = new THREE.Scene()

        /**
        * Camera
        */
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)

        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener()
        camera.add(listener)

        camera.position.set(0.521, 0.0329, 0.98)
        scene.add(camera)

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI * 0.2, 0.5)
        spotLight.position.z = 3
        spotLight.position.y = 2
        scene.add(spotLight)

        spotLight.target.position.z = - 2
        scene.add(spotLight.target)

        // const cube = new THREE.Mesh(
        //     new THREE.BoxBufferGeometry(1, 1, 1),
        //     new THREE.MeshBasicMaterial( { color: 0xaaffaa, opacity: 0.5 } )
        // )
        // scene.add(cube)

        /**
         * GRAMOPHONE
         */
        const gramophone = new Gramophone()
        scene.add(gramophone.group)

        // create the PositionalAudio object (passing in the listener)
        const gramophoneSound = new THREE.PositionalAudio(listener)

        // load a sound and set it as the PositionalAudio object's buffer
        const gramophoneAudioLoader = new THREE.AudioLoader();
        gramophoneAudioLoader.load(gramophoneAudioSource, (buffer) => {
            gramophoneSound.setBuffer(buffer)
            gramophoneSound.setRefDistance(0.5)
            gramophoneSound.setDirectionalCone(180, 230, 0.1)
        })

        gramophone.group.add(gramophoneSound)

        let currentObject = gramophone

        // const gramophoneSoundHelper = new THREE.PositionalAudioHelper(gramophoneSound)
        // gramophoneSound.add(gramophoneSoundHelper)

        /**
         * Jukebox
         */

        // Jukebox
        const jukebox = new Jukebox()
        scene.add(jukebox.group)

        const jukeboxSound = new THREE.PositionalAudio(listener)

        const jukeboxAudioLoader = new THREE.AudioLoader();
        jukeboxAudioLoader.load(jukeboxAudioSource, (buffer) => {
            jukeboxSound.setBuffer(buffer)
            jukeboxSound.setRefDistance(0.5)
            jukeboxSound.setDirectionalCone(180, 230, 0.1)
        })

        jukebox.group.add(jukeboxSound)


        /**
         * Radio
         */
        const radio = new Radio()
        scene.add(radio.group)

        const radioSound = new THREE.PositionalAudio(listener)

        const radioAudioLoader = new THREE.AudioLoader();
        radioAudioLoader.load(radioAudioSource, (buffer) => {
            radioSound.setBuffer(buffer)
            radioSound.setRefDistance(0.5)
            radioSound.setDirectionalCone(180, 230, 0.1)
        })

        radio.group.add(radioSound)

        /**
         * Vinyl
         */
        const vinyl = new Vinyl()
        scene.add(vinyl.group)


        // var geometry = new THREE.PlaneGeometry( 5, 5, 20 );
        // var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
        // var plane = new THREE.Mesh( geometry, material );
        // plane.rotation.x = Math.PI / 2
        // scene.add( plane );

        /**
         * MP3
         */
        const mp3 = new MP3()
        scene.add(mp3.group)

        /**
         * SeekBar 
         */

        const $seekBarPoints = document.querySelectorAll('.seek_bar_object')
        const $backgroundobjects = document.querySelectorAll('.background_object')
        const $mainPartbackground = document.querySelector('.js-main-background')

        for (let i = 0; i < $seekBarPoints.length; i++) {
            const _element = $seekBarPoints[i];
            
            _element.addEventListener('click', () => {
                //const lastObject = currentObject

                $backgroundobjects.forEach(backgroundobject => {
                    backgroundobject.classList.remove('current_object')
                })

                $backgroundobjects[i].classList.add('current_object')

                if(i == 0) {
                    currentObject = gramophone

                } else if(i == 1) {

                    currentObject = jukebox

                } else if(i == 2) {

                    currentObject = radio

                } else if(i == 3) {

                    currentObject = vinyl

                } else if(i == 4) {

                    currentObject = mp3
                }

                //const test = Math.atan2(currentObject.scenePosition.z - camera.position.z, currentObject.scenePosition.z - camera.position.x)

                TweenLite.to(camera.position, 2, {
                    x: currentObject.cameraPosition.x,
                    y: currentObject.cameraPosition.y,
                    z: currentObject.cameraPosition.z,
                    ease: 'Power3.easeInOut'
                })

                // TweenLite.to($mainPartbackground, 1, {
                //     background: currentObject.background,
                //     ease: 'Power3.easeIn'
                // })

                $mainPartbackground.style.background = currentObject.background
            })
        }

        /**
         * Ray Caster
         */
        const raycaster = new THREE.Raycaster()

        window.addEventListener('mousewheel', (_event) => {
            const delta = Math.max(-1, Math.min(1, (_event.wheelDelta || -_event.detail)))

            if(delta > 0)
                zoomIn()
            else
                zoomOut()
        })

        const zoomIn = () => {
            if(getDistance(camera, currentObject.group) > 0.30)
                camera.position.sub(currentObject.scenePosition).multiplyScalar(0.95).add(currentObject.scenePosition)
        }

        const zoomOut = () => {
            if(getDistance(camera, currentObject.group) < 0.70)
                camera.position.sub(currentObject.scenePosition).multiplyScalar(1.05).add(currentObject.scenePosition)
        }

        //Return distance between two coordinates
        const getDistance = (mesh1, mesh2) => {
            const distanceX = mesh1.position.x - mesh2.position.x
            const distanceY = mesh1.position.y - mesh2.position.y
            const distanceZ = mesh1.position.z - mesh2.position.z

            return Math.sqrt(distanceX * distanceX, distanceY * distanceY, distanceZ * distanceZ)
        }

        /**
         * Renderer
         */
        const $mainBackground = document.querySelector('.js-main-background')
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setClearAlpha(0)
        renderer.gammaOutput = true
        renderer.gammaFactor = 2.2
        $mainBackground.appendChild(renderer.domElement)

        let mouseDown = false

        renderer.domElement.addEventListener('mousedown', (_event) => {
            mouseDown = true
        })

        renderer.domElement.addEventListener('mouseup', (_event) => {
            mouseDown = false
        })

        let mousePosX = 0
        let lastMousePosX = 0

        //Event to rotate the camera around the object
        renderer.domElement.addEventListener('mousemove', (_event) => {

            //get the value
            cursor.x = _event.clientX / sizes.width - 0.5
            cursor.y = _event.clientY / sizes.height - 0.5

            mousePosX = _event.clientX

            const rotSpeed = 0.04
            const x = camera.position.x
            const z = camera.position.z

            //If mouse is down
            if(mouseDown == true) {
                if(mousePosX - lastMousePosX > 0) {
                    camera.position.x = Math.cos(-rotSpeed) * (x - currentObject.scenePosition.x) - Math.sin(-rotSpeed) * (z-currentObject.scenePosition.z) + currentObject.scenePosition.x
                    camera.position.z = Math.sin(-rotSpeed) * (x - currentObject.scenePosition.x) + Math.cos(-rotSpeed) * (z - currentObject.scenePosition.z) + currentObject.scenePosition.z
                } else {
                    camera.position.x = Math.cos(rotSpeed) * (x - currentObject.scenePosition.x) - Math.sin(rotSpeed) * (z-currentObject.scenePosition.z) + currentObject.scenePosition.x
                    camera.position.z = Math.sin(rotSpeed) * (x - currentObject.scenePosition.x) + Math.cos(rotSpeed) * (z - currentObject.scenePosition.z) + currentObject.scenePosition.z
                }
            }

            lastMousePosX = mousePosX
        })

        let hoverGramophone = false
        let hoverJukebox = false
        let hoverRadio = false

        renderer.domElement.addEventListener('click', () => {
            if(hoverGramophone == true) {
               gramophone.audio.play()
               //gramophoneSound.play()
            }
            if(hoverJukebox == true) {
                jukebox.audio.play()
             }
            if(hoverRadio == true) {
                radio.audio.play()
            }
        })


        /**
         * Camera Controls
         */
        // const cameraControls = new OrbitControls(camera, renderer.domElement)
        // cameraControls.zoomSpeed = 0.3
        // cameraControls.enableDamping = true

        /**
         * Resize
         */
        window.addEventListener('resize', () =>
        {
            sizes.width = window.innerWidth
            sizes.height = window.innerHeight

            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()

            renderer.setSize(sizes.width, sizes.height)
        })

        /**
         * Loop
         */
        const loop = () => {
            window.requestAnimationFrame(loop)
            //console.log(camera.position)
            // Camera
            camera.lookAt(currentObject.scenePosition)

            //console.log(camera.lookAt(currentObject.scenePosition))

            // Cursor raycasting
            const raycasterCursor = new THREE.Vector2(cursor.x * 2, - cursor.y * 2)
            raycaster.setFromCamera(raycasterCursor, camera)

            const intersectsGramophone = raycaster.intersectObject(gramophone.group, true)
            if(intersectsGramophone.length) {
                hoverGramophone = true
            }
            else {
                hoverGramophone = false
            }

            const intersectsJukebox = raycaster.intersectObject(jukebox.group, true)
            if(intersectsJukebox.length) {
                hoverJukebox = true
            }
            else {
                hoverJukebox = false
            }

            const intersectsRadio = raycaster.intersectObject(radio.group, true)
            if(intersectsRadio.length) {
                hoverRadio = true
            }
            else {
                hoverRadio = false
            }

            // Render
            renderer.render(scene, camera)
        }

        loop() 
    }
}