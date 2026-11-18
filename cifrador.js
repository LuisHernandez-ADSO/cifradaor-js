// ================= PARTE 1: PARTES =================
// ===== Alfabetos =====
const MAYUS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
const MINUS = "abcdefghijklmnñopqrstuvwxyz";
const TILDES_MAYUS = "ÁÉÍÓÚÜ";
const TILDES_MINUS = "áéíóúü";
const GRUPOS = [MAYUS, MINUS, TILDES_MAYUS, TILDES_MINUS];
const CLAVE_ZIGZAG = 5;

function moverCaracter(caracter, k) {
    for (const alfabeto of GRUPOS) {

        const posicion = alfabeto.indexOf(caracter);
        if (posicion !== -1) {

            const n = alfabeto.length;
            const nueva = ((posicion + k) % n + n) % n;
            return alfabeto[nueva];

        }
    }
    return caracter;
}

function progresivoMitad(texto, direccion) {
    let resultado = "";
    const mitad = (texto.length - (texto.length % 2)) / 2; // Calculo la mitad de abajo del arreglo

    for (let i = 0; i < texto.length; i++) {

        let desplazamiento = i + 1 

        if (i >= mitad) desplazamiento = (i - mitad) + 1

        resultado += moverCaracter(texto[i], direccion * desplazamiento);
    }
    return resultado;
}

function zigZag(texto, k, direccion) {
    let resultado = "";
    for (let i = 0; i < texto.length; i++) {

        let signo = -1
        if (i % 2 == 0) signo = 1

        resultado += moverCaracter(texto[i], direccion * signo * k);
    }
    return resultado;
}

function cifrar(texto) {
    const paso1 = progresivoMitad(texto, 1);
    const paso2 = zigZag(paso1, CLAVE_ZIGZAG, 1);
    return paso2;
}

function descifrar(texto) {
    const paso1 = zigZag(texto, CLAVE_ZIGZAG, -1);
    const paso2 = progresivoMitad(paso1, -1);
    return paso2;
}

// ================= PARTE 2: ARCHIVOS =================
const selector = document.getElementById("archivo");

// Espera a que el usuario elija un archivo en el selector y lo lee.
// Devuelve un objeto { nombre, texto }, o null si algo salió mal.
function pedirArchivo() {
    return new Promise(function (entregar) {
        selector.value = ""; // limpia el selector para poder elegir de nuevo
        // Si el usuario cierra la ventana de selección sin elegir nada
        selector.addEventListener("cancel", function () {
            entregar(null);
        }, { once: true });
        // Cuando el usuario elige un archivo
        selector.addEventListener("change", async function () {
            const archivo = selector.files[0];
            if (!archivo) {
                entregar(null);
                return;
            }
            if (!archivo.name.toLowerCase().endsWith(".txt")) {
                alert("El archivo debe ser de texto (.txt).");
                entregar(null);
                return;
            }
            const texto = await archivo.text(); // leer el contenido
            if (texto.length === 0) {
                alert("El archivo está vacío.");
                entregar(null);
                return;
            }
            entregar({ nombre: archivo.name, texto: texto });
        }, { once: true });
    });
}
// Crea un archivo con el contenido y lo descarga con ese nombre.
function descargar(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}
// "carta.txt" + "_cifrado" -> "carta_cifrado.txt"
function nombreSalida(nombreOriginal, sufijo) {
    const sinExtension = nombreOriginal.slice(0, -4); // quita los 4 caracteres de
    ".txt"
    return sinExtension + sufijo + ".txt";
}

// ================= PARTE 3: MENÚ =================
async function menu() {
    let opcion = "";
    while (opcion !== "3") {
        opcion = prompt(
            "CIFRADOR DE ARCHIVOS\n\n" +
            "1. Cifrar un archivo\n" +
            "2. Descifrar un archivo\n" +
            "3. Salir\n\n" +
            "Elige una opción:"
        );
        if (opcion === null) { // Cancelar en el menú = salir
            opcion = "3";
        }
        opcion = opcion.trim();
        if (opcion === "1") {
            alert("Selecciona en la página el archivo .txt que quieres CIFRAR.");
            const archivo = await pedirArchivo();
            if (archivo !== null) {
                const resultado = cifrar(archivo.texto);
                // Autoverificación: descifrar lo cifrado debe devolver el original
                if (descifrar(resultado) !== archivo.texto) {
                    alert("¡Cuidado! Al descifrar no se obtiene el texto original. Revisen susistema.");
                } else {
                    const nombre = nombreSalida(archivo.nombre, "_cifrado");
                    descargar(resultado, nombre);
                    alert("Listo. Se descargó: " + nombre);
                }
            }
        } else if (opcion === "2") {
            alert("Selecciona en la página el archivo .txt que quieres DESCIFRAR.");
            const archivo = await pedirArchivo();
            if (archivo !== null) {
                const resultado = descifrar(archivo.texto);
                const nombre = nombreSalida(archivo.nombre, "_descifrado");
                descargar(resultado, nombre);
                alert("Listo. Se descargó: " + nombre);
            }
        } else if (opcion === "3") {
            alert("¡Hasta luego! Recarga la página (F5) para volver a usar el cifrador.");
        } else {
            alert("Opción no válida. Escribe 1, 2 o 3.");
        }
    }
}
menu();