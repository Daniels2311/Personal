// --- ESCENA Y CONFIGURACIÓN BASE ---
const canvas = document.querySelector('#universo-canvas');
const scene = new THREE.Scene();

scene.fog = new THREE.FogExp2(0x020208, 0.008);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 42);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 85; 
controls.minDistance = 6;  

// --- ILUMINACIÓN DIFUSA ---
const luzAmbiental = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(luzAmbiental);

const luzCentral = new THREE.PointLight(0xff7597, 1.5, 150);
luzCentral.position.set(0, 0, 0);
scene.add(luzCentral);

// --- CAMPO DE ESTRELLAS DE FONDO DENSO Y MULTICOLOR ---
const estrellasGeometria = new THREE.BufferGeometry();
const estrellasCount = 8500;
const posicionesEstrellas = new Float32Array(estrellasCount * 3);
const coloresEstrellas = new Float32Array(estrellasCount * 3);

const tonosEstrellas = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xffb3c1),
    new THREE.Color(0x80d8ff),
    new THREE.Color(0xcc99ff),
    new THREE.Color(0xffff99)
];

for (let i = 0; i < estrellasCount; i++) {
    posicionesEstrellas[i * 3] = (Math.random() - 0.5) * 280;
    posicionesEstrellas[i * 3 + 1] = (Math.random() - 0.5) * 280;
    posicionesEstrellas[i * 3 + 2] = (Math.random() - 0.5) * 280;

    const tono = tonosEstrellas[Math.floor(Math.random() * tonosEstrellas.length)];
    coloresEstrellas[i * 3] = tono.r;
    coloresEstrellas[i * 3 + 1] = tono.g;
    coloresEstrellas[i * 3 + 2] = tono.b;
}

estrellasGeometria.setAttribute('position', new THREE.BufferAttribute(posicionesEstrellas, 3));
estrellasGeometria.setAttribute('color', new THREE.BufferAttribute(coloresEstrellas, 3));

const estrellasMaterial = new THREE.PointsMaterial({
    size: 0.28,
    vertexColors: true,
    transparent: true,
    opacity: 0.85
});

const sistemaEstrellas = new THREE.Points(estrellasGeometria, estrellasMaterial);
scene.add(sistemaEstrellas);

// --- SISTEMA DE ESTRELLAS FUGACES ---
let estrellaFugazMesh = null;
let fugazActiva = false;
let fugazProgreso = 0;
let fugazDir = new THREE.Vector3();
let fugazInicio = new THREE.Vector3();

function crearEstrellaFugaz() {
    if (fugazActiva) return;

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(6);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });

    estrellaFugazMesh = new THREE.Line(geo, mat);
    scene.add(estrellaFugazMesh);

    fugazInicio.set(
        (Math.random() - 0.5) * 140,
        Math.random() * 40 + 20,
        (Math.random() - 0.5) * 60
    );

    fugazDir.set(
        (Math.random() - 0.5) * 90,
        -Math.random() * 60 - 30,
        (Math.random() - 0.5) * 50
    );

    fugazProgreso = 0;
    fugazActiva = true;
}

function animarEstrellaFugaz(delta) {
    if (!fugazActiva || !estrellaFugazMesh) return;

    fugazProgreso += delta * 1.8;

    const pActual = fugazInicio.clone().addScaledVector(fugazDir, fugazProgreso);
    const pCola = fugazInicio.clone().addScaledVector(fugazDir, Math.max(0, fugazProgreso - 0.18));

    const positions = estrellaFugazMesh.geometry.attributes.position.array;
    positions[0] = pActual.x;
    positions[1] = pActual.y;
    positions[2] = pActual.z;
    positions[3] = pCola.x;
    positions[4] = pCola.y;
    positions[5] = pCola.z;

    estrellaFugazMesh.geometry.attributes.position.needsUpdate = true;

    if (fugazProgreso >= 1) {
        scene.remove(estrellaFugazMesh);
        estrellaFugazMesh.geometry.dispose();
        estrellaFugazMesh.material.dispose();
        estrellaFugazMesh = null;
        fugazActiva = false;
    }
}

setInterval(() => {
    if (Math.random() > 0.25) {
        crearEstrellaFugaz();
    }
}, 2500);

// --- GENERADOR DE TEXTURAS PLANETARIAS CON CONTINENTES / VETAS ---
function crearTexturaPlaneta(colorBaseHex, colorDetalleHex) {
    const canvasTex = document.createElement('canvas');
    canvasTex.width = 512;
    canvasTex.height = 256;
    const ctx = canvasTex.getContext('2d');

    ctx.fillStyle = colorBaseHex;
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = colorDetalleHex;
    for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const rx = 40 + Math.random() * 90;
        const ry = 15 + Math.random() * 40;
        const angulo = Math.random() * Math.PI;

        ctx.ellipse(x, y, rx, ry, angulo, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let j = 0; j < 8; j++) {
        ctx.fillRect(0, Math.random() * 256, 512, 12 + Math.random() * 20);
    }

    const textura = new THREE.CanvasTexture(canvasTex);
    textura.wrapS = THREE.RepeatWrapping;
    textura.wrapT = THREE.ClampToEdgeWrapping;
    return textura;
}

// --- GENERADOR DE DEGRADÉ NEÓN PARA EL AURA ---
function crearTexturaAura(colorBordeHex) {
    const canvasTex = document.createElement('canvas');
    canvasTex.width = 256;
    canvasTex.height = 256;
    const ctx = canvasTex.getContext('2d');

    const gradiente = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradiente.addColorStop(0, colorBordeHex);
    gradiente.addColorStop(0.5, colorBordeHex);
    gradiente.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradiente;
    ctx.fillRect(0, 0, 256, 256);

    return new THREE.CanvasTexture(canvasTex);
}

// --- ETIQUETA DE NÚMERO FLOTANTE ---
function crearEtiquetaNumero(numero) {
    const canvasTexto = document.createElement('canvas');
    canvasTexto.width = 128;
    canvasTexto.height = 128;
    const ctx = canvasTexto.getContext('2d');

    ctx.font = 'Bold 65px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(numero, 64, 64);

    const textura = new THREE.CanvasTexture(canvasTexto);
    const spriteMaterial = new THREE.SpriteMaterial({ map: textura, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3.2, 3.2, 1);
    return sprite;
}

// --- CONFIGURACIÓN DE LOS 12 MESES ---
const recuerdosData = [
    { mesNum: 1, radio: 1.6, colorBase: "#d81b60", colorDetalle: "#ff80ab", pos: { x: -16, y: 8, z: 10 }, tipo: "nebulosa", titulo: "Mes 1: El Comienzo", descripcion: "Aquí empezó nuestra increíble historia.", imagen: "imagenes/mes1.jpg" },
    { mesNum: 2, radio: 1.8, colorBase: "#00897b", colorDetalle: "#80cbd3", pos: { x: 12, y: -6, z: 15 }, tipo: "particulas", titulo: "Mes 2: Primeras Risas", descripcion: "Descubriendo lo bien que la pasamos juntos.", imagen: "imagenes/mes2.jpg" },
    { mesNum: 3, radio: 1.7, colorBase: "#8e24aa", colorDetalle: "#ea80fc", pos: { x: -8, y: -12, z: -8 }, tipo: "satelite", titulo: "Mes 3: Momentos Inolvidables", descripcion: "Cada lugar a tu lado es mágico.", imagen: "imagenes/mes3.jpg" },
    { mesNum: 4, radio: 1.5, colorBase: "#00acc1", colorDetalle: "#80deea", pos: { x: 18, y: 10, z: -12 }, tipo: "anillo", titulo: "Mes 4: Detalles Especiales", descripcion: "Pequeños momentos que se quedan para siempre.", imagen: "imagenes/mes4.jpg" },
    { mesNum: 5, radio: 1.3, colorBase: "#fdd835", colorDetalle: "#fff59d", pos: { x: -20, y: -4, z: -18 }, tipo: "nebulosa", titulo: "Mes 5: Creciendo Juntos", descripcion: "Un mes lleno de complicidad.", imagen: "imagenes/mes5.jpg" },
    { mesNum: 6, radio: 2.0, colorBase: "#f4511e", colorDetalle: "#ffab91", pos: { x: 4, y: 14, z: 6 }, tipo: "satelite", titulo: "Mes 6: Medio Año", descripcion: "Medio año demostrándonos lo mucho que nos queremos.", imagen: "imagenes/mes6.jpg" },
    { mesNum: 7, radio: 1.7, colorBase: "#5e35b1", colorDetalle: "#b388ff", pos: { x: 15, y: -10, z: 2 }, tipo: "particulas", titulo: "Mes 7: Nuevas Aventuras", descripcion: "Cada día es una nueva oportunidad para sonreír.", imagen: "imagenes/mes7.jpg" },
    { mesNum: 8, radio: 1.9, colorBase: "#00bfa5", colorDetalle: "#a7ffeb", pos: { x: -12, y: 12, z: -22 }, tipo: "anillo", titulo: "Mes 8: Abrazo Cálido", descripcion: "Donde las palabras sobran.", imagen: "imagenes/mes8.jpg" },
    { mesNum: 9, radio: 1.6, colorBase: "#e64a19", colorDetalle: "#ff9e80", pos: { x: 22, y: 2, z: -6 }, tipo: "nebulosa", titulo: "Mes 9: Magia Cósmica", descripcion: "Gracias por llenar mi mundo de alegría.", imagen: "imagenes/mes9.jpg" },
    { mesNum: 10, radio: 2.2, colorBase: "#aa00ff", colorDetalle: "#f50057", pos: { x: -6, y: -8, z: 20 }, tipo: "anillo", titulo: "Mes 10: Mi Lugar Seguro", descripcion: "Contigo la vida se siente pacífica.", imagen: "imagenes/mes10.jpg" },
    { mesNum: 11, radio: 1.6, colorBase: "#64dd17", colorDetalle: "#ccff90", pos: { x: -22, y: 6, z: 4 }, tipo: "satelite", titulo: "Mes 11: Casi un Año", descripcion: "Mirando todo lo hermoso que hemos recorrido.", imagen: "imagenes/mes11.jpg" },
    { mesNum: 12, radio: 3.2, colorBase: "#d50000", colorDetalle: "#ff80ab", pos: { x: 0, y: 0, z: 0 }, tipo: "gran_sol", titulo: "¡Un Año Juntos! ❤️", descripcion: "365 días amándote. ¡Y esto apenas empieza!", imagen: "imagenes/mes12.jpg" }
];

const esferasRecuerdos = [];

// --- CONSTRUCCIÓN DE PLANETAS ---
recuerdosData.forEach((data) => {
    const geoEsfera = new THREE.SphereGeometry(data.radio, 32, 32);
    const texPlaneta = crearTexturaPlaneta(data.colorBase, data.colorDetalle);

    const matEsfera = new THREE.MeshStandardMaterial({
        map: texPlaneta,
        emissive: new THREE.Color(data.colorBase),
        emissiveIntensity: 0.45,
        roughness: 0.85,
        metalness: 0.0
    });

    const esfera = new THREE.Mesh(geoEsfera, matEsfera);
    esfera.position.set(data.pos.x, data.pos.y, data.pos.z);

    const texAura = crearTexturaAura(data.colorDetalle);
    const matAura = new THREE.SpriteMaterial({
        map: texAura,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const auraSprite = new THREE.Sprite(matAura);
    const escalaAura = data.radio * 3.2;
    auraSprite.scale.set(escalaAura, escalaAura, 1);
    esfera.add(auraSprite);

    const satelites = [];

    if (data.tipo === "anillo" || data.tipo === "gran_sol") {
        const radioAnilloInt = data.radio + 0.6;
        const radioAnilloExt = data.radio + (data.tipo === "gran_sol" ? 2.2 : 1.3);
        const ringGeo = new THREE.RingGeometry(radioAnilloInt, radioAnilloExt, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(data.colorDetalle),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.3;
        esfera.add(ring);
    }

    if (data.tipo === "satelite") {
        const numSatelites = Math.random() > 0.5 ? 2 : 1;
        for (let s = 0; s < numSatelites; s++) {
            const satGeo = new THREE.SphereGeometry(0.35, 16, 16);
            const satMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: new THREE.Color(data.colorDetalle),
                emissiveIntensity: 0.8,
                roughness: 0.8
            });
            const satMesh = new THREE.Mesh(satGeo, satMat);
            esfera.add(satMesh);

            satelites.push({
                mesh: satMesh,
                distancia: data.radio + 1.8 + (s * 0.8),
                velocidad: 1.4 + (s * 0.4),
                inclinacion: Math.random() * Math.PI
            });
        }
    }

    if (data.tipo === "nebulosa" || data.tipo === "gran_sol") {
        const nebGeo = new THREE.SphereGeometry(data.radio * 2.0, 24, 24);
        const nebMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(data.colorDetalle),
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        const nebMesh = new THREE.Mesh(nebGeo, nebMat);
        esfera.add(nebMesh);
    }

    if (data.tipo === "particulas" || data.tipo === "gran_sol") {
        const partGeo = new THREE.BufferGeometry();
        const partCount = 55;
        const partPos = new Float32Array(partCount * 3);
        for (let p = 0; p < partCount * 3; p += 3) {
            partPos[p] = (Math.random() - 0.5) * (data.radio * 3.8);
            partPos[p+1] = (Math.random() - 0.5) * (data.radio * 3.8);
            partPos[p+2] = (Math.random() - 0.5) * (data.radio * 3.8);
        }
        partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
        const partMat = new THREE.PointsMaterial({ 
            color: new THREE.Color(data.colorDetalle), 
            size: 0.18, 
            transparent: true, 
            opacity: 0.85,
            blending: THREE.AdditiveBlending 
        });
        const nubePart = new THREE.Points(partGeo, partMat);
        esfera.add(nubePart);
    }

    const etiqueta = crearEtiquetaNumero(data.mesNum);
    etiqueta.position.set(0, data.radio + 1.4, 0);
    esfera.add(etiqueta);

    esfera.userData = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        imagen: data.imagen,
        desfase: Math.random() * 10,
        auraSprite: auraSprite,
        escalaAuraBase: escalaAura,
        satelites: satelites
    };

    scene.add(esfera);
    esferasRecuerdos.push(esfera);
});

// --- BUCLE DE ANIMACIÓN ---
const reloj = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = reloj.getDelta();
    const tiempo = reloj.getElapsedTime();

    sistemaEstrellas.rotation.y = tiempo * 0.004;

    animarEstrellaFugaz(delta);

    esferasRecuerdos.forEach((esfera) => {
        const u = esfera.userData;

        esfera.rotation.y += 0.005;
        esfera.position.y += Math.sin(tiempo * 1.5 + u.desfase) * 0.004;

        const pulso = 0.4 + Math.sin(tiempo * 2.8 + u.desfase) * 0.18;
        esfera.material.emissiveIntensity = pulso;

        if (u.auraSprite) {
            const factorRespiracion = 1 + Math.sin(tiempo * 2.2 + u.desfase) * 0.08;
            u.auraSprite.scale.set(
                u.escalaAuraBase * factorRespiracion,
                u.escalaAuraBase * factorRespiracion,
                1
            );
        }

        if (u.satelites && u.satelites.length > 0) {
            u.satelites.forEach((sat) => {
                const tSat = tiempo * sat.velocidad;
                sat.mesh.position.x = Math.cos(tSat) * sat.distancia;
                sat.mesh.position.z = Math.sin(tSat) * sat.distancia;
                sat.mesh.position.y = Math.sin(tSat * 0.8 + sat.inclinacion) * 0.8;
            });
        }
    });

    controls.update();
    renderer.render(scene, camera);
}

// --- INTERACCIÓN DOM Y REPRODUCCIÓN DE MÚSICA ---
const btnExplorar = document.querySelector('#btn-explorar');
const pantallaBienvenida = document.querySelector('#pantalla-bienvenida');
const instrucciones = document.querySelector('#instrucciones');
const musicaFondo = document.querySelector('#musica-fondo');

btnExplorar.addEventListener('click', () => {
    // Reprodcir música de fondo al presionar Explorar
    if (musicaFondo) {
        musicaFondo.play().catch(e => console.log("Permiso de audio requerido:", e));
    }

    pantallaBienvenida.classList.add('desvanecer');
    setTimeout(() => {
        instrucciones.classList.remove('oculto');
    }, 1200);
});

// --- CLIC EN OBJETOS (RAYCASTER) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (e) => {
    if (!pantallaBienvenida.classList.contains('desvanecer')) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersecciones = raycaster.intersectObjects(esferasRecuerdos);

    if (intersecciones.length > 0) {
        const objetoClickeado = intersecciones[0].object;
        abrirCartaRecuerdo(objetoClickeado.userData);
    }
});

// --- MODAL DE RECUERDOS ---
const modal = document.querySelector('#modal-recuerdo');
const modalImagen = document.querySelector('#modal-imagen');
const modalTitulo = document.querySelector('#modal-titulo');
const modalDescripcion = document.querySelector('#modal-descripcion');
const botonCerrar = document.querySelector('#cerrar-modal');

function abrirCartaRecuerdo(datos) {
    modalTitulo.innerText = datos.titulo;
    modalDescripcion.innerText = datos.descripcion;
    modalImagen.src = datos.imagen;
    modal.classList.remove('modal-oculto');
}

botonCerrar.addEventListener('click', () => {
    modal.classList.add('modal-oculto');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('modal-oculto');
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();