// --- CONFIGURACIÓN BASE DEL UNIVERSO 3D ---
const canvas = document.querySelector('#universo-canvas');
const scene = new THREE.Scene();

// Añadir niebla cósmica para que el fondo se vea profundo
scene.fog = new THREE.FogExp2(0x020208, 0.015);

// Cámara
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 28);

// Renderizador
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controles de Cámara (OrbitControls)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 60; 
controls.minDistance = 5;  

// --- ILUMINACIÓN ---
const luzAmbiental = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(luzAmbiental);

// Luz central que tiñe los planetas
const luzPuntual = new THREE.PointLight(0xff7597, 2.5, 100);
luzPuntual.position.set(0, 0, 0);
scene.add(luzPuntual);

// --- FONDO DE PARTICULAS (Estrellas del Video) ---
const estrellasGeometria = new THREE.BufferGeometry();
const estrellasCount = 3000; // Muchos puntos brillantes
const posicionesEstrellas = new Float32Array(estrellasCount * 3);

for (let i = 0; i < estrellasCount * 3; i++) {
    posicionesEstrellas[i] = (Math.random() - 0.5) * 180;
}

estrellasGeometria.setAttribute('position', new THREE.BufferAttribute(posicionesEstrellas, 3));

// Material de estrella pequeña y brillante
const estrellasMaterial = new THREE.PointsMaterial({
    color: 0xfff0f5,
    size: 0.18,
    transparent: true,
    opacity: 0.9
});

const sistemaEstrellas = new THREE.Points(estrellasGeometria, estrellasMaterial);
scene.add(sistemaEstrellas);


// --- CONFIGURA TUS MUNDOS/RECUERDOS INTERACTIVOS ---
// Cambia las rutas de las imágenes por las tuyas reales en tu carpeta (ej. imagenes/foto1.jpg)
const recuerdosData = [
    {
        titulo: "Nuestro primer instante juntos",
        descripcion: "Desde este día supe que mi universo entero iba a girar alrededor de tu sonrisa.",
        imagen: "imagenes/foto1.jpg", 
        color: 0xff7597, // Rosa brillante
        posicion: { x: -9, y: 3, z: 6 }
    },
    {
        titulo: "El momento más feliz",
        descripcion: "No importa dónde estemos o qué hagamos, si es contigo, es mi lugar favorito del mundo.",
        imagen: "imagenes/foto2.jpg",
        color: 0x7597ff, // Azul galáctico
        posicion: { x: 9, y: -2, z: -5 }
    },
    {
        titulo: "Nuestra promesa cósmica",
        descripcion: "Te amo hoy, mañana y en cada una de las dimensiones y universos existentes.",
        imagen: "imagenes/foto3.jpg",
        color: 0xcc75ff, // Violeta brillante
        posicion: { x: 1, y: 7, z: -8 }
    },
    {
        titulo: "El momento más feliz",
        descripcion: "No importa dónde estemos o qué hagamos, si es contigo, es mi lugar favorito del mundo.",
        imagen: "imagenes/foto2.jpg",
        color: 0x7597ff, // Azul galáctico
        posicion: { x: 9, y: -2, z: -5 }
    },
    {
        titulo: "El momento más feliz",
        descripcion: "No importa dónde estemos o qué hagamos, si es contigo, es mi lugar favorito del mundo.",
        imagen: "imagenes/foto2.jpg",
        color: 0x7597ff, // Azul galáctico
        posicion: { x: 9, y: -2, z: -5 }
    },
];

const esferasRecuerdos = [];

// --- CREAR LAS ESFERAS BRILLANTES (MUNDOS) ---
recuerdosData.forEach((recuerdo, index) => {
    const geometria = new THREE.SphereGeometry(2, 32, 32);
    
    // Usamos MeshStandardMaterial con "emissive" para lograr el efecto de orbe brillante de tus capturas
    const material = new THREE.MeshStandardMaterial({
        color: recuerdo.color,
        emissive: recuerdo.color, // La esfera brilla por sí misma
        emissiveIntensity: 0.6,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.95
    });

    const esfera = new THREE.Mesh(geometria, material);
    esfera.position.set(recuerdo.posicion.x, recuerdo.posicion.y, recuerdo.posicion.z);
    
    // Guardamos los datos personalizados directamente en el objeto 3D
    esfera.userData = {
        titulo: recuerdo.titulo,
        descripcion: recuerdo.descripcion,
        imagen: recuerdo.imagen
    };

    scene.add(esfera);
    esferasRecuerdos.push(esfera);
});


// --- ANIMACIÓN PRINCIPAL ---
const reloj = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const tiempo = reloj.getElapsedTime();

    // El sistema de estrellas gira lentamente
    sistemaEstrellas.rotation.y = tiempo * 0.015;
    sistemaEstrellas.rotation.x = tiempo * 0.005;

    // Movimiento flotante y suave de los mundos (como si flotaran en gravedad cero)
    esferasRecuerdos.forEach((esfera, index) => {
        esfera.position.y += Math.sin(tiempo + index * 2) * 0.004;
        esfera.rotation.y += 0.008;
    });

    controls.update();
    renderer.render(scene, camera);
}


// --- INTERACCIONES DE INTERFAZ (DOM) ---
const btnExplorar = document.querySelector('#btn-explorar');
const pantallaBienvenida = document.querySelector('#pantalla-bienvenida');
const instrucciones = document.querySelector('#instrucciones');

// Al dar clic en Explorar, desvanecer pantalla de bienvenida
btnExplorar.addEventListener('click', () => {
    pantallaBienvenida.classList.add('desvanecer');
    
    // Mostrar el cartel de instrucciones después de que se quite la pantalla
    setTimeout(() => {
        instrucciones.classList.remove('oculto');
    }, 1500);
});


// --- DETECTOR DE CLIC EN LOS MUNDOS (RAYCASTER) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (e) => {
    // Si la pantalla de bienvenida todavía está visible, no permitir hacer clics en el fondo
    if (!pantallaBienvenida.classList.contains('desvanecer')) return;

    // Normalizar coordenadas del mouse
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersecciones = raycaster.intersectObjects(esferasRecuerdos);

    if (intersecciones.length > 0) {
        const mundoClickeado = intersecciones[0].object;
        abrirCartaRecuerdo(mundoClickeado.userData);
    }
});


// --- MANEJO DEL MODAL ---
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

// Cerrar si se hace clic fuera de la caja del modal
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('modal-oculto');
    }
});


// --- REDIMENSIONADO DE VENTANA ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Arrancar bucle de renderizado
animate();