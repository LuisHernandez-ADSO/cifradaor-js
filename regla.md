# Integrante
Luis David Hernandez

# Uso del programa
- **Cómo cifra:** Abre `index.html` en el navegador, escribe `1` en el menú que aparece y acepta el aviso. Haz clic en el botón de seleccionar archivo en la página y elige el archivo `.txt` que quieres proteger. El programa procesa el contenido y descarga automáticamente un archivo nuevo terminado en `_cifrado.txt`.
- **Cómo descifra:** En el mismo menú escribe `2` y acepta el aviso. Selecciona el archivo cifrado `.txt` desde la página y el programa descargará el archivo recuperado terminado en `_cifrado_descifrado.txt`. Para cerrar el menú, escribe `3`.

# Funcionamiento

## Idea general del sistema de cifrado
El sistema transforma el texto en dos pasos seguidos sin borrar ningún carácter ni cambiar el largo del mensaje:

1. **Primer paso (desplazamiento progresivo dividido a la mitad):** El programa divide el largo total del texto en dos mitades. En la primera mitad, la primera letra avanza 1 lugar en su lista de letras, la segunda avanza 2 lugares, la tercera 3, y así sucesivamente. Al llegar a la mitad del texto, la cuenta vuelve a empezar desde 1 para la segunda mitad.
2. **Segundo paso (desplazamiento alternado en zig-zag):** Sobre el texto que salió del primer paso, se usa una clave fija de `5`. Las letras ubicadas en posiciones pares avanzan 5 lugares hacia adelante y las ubicadas en posiciones impares retroceden 5 lugares hacia atrás.

Los espacios, números, signos de puntuación y saltos de línea no se cambian, pero sí ocupan un lugar en la fila y hacen avanzar el conteo de posiciones.

## Qué hace cada función de la Parte 1
- `moverCaracter`: Busca una letra dentro de las cuatro listas permitidas (mayúsculas, minúsculas, vocales mayúsculas con tilde y vocales minúsculas con tilde). Si la encuentra, la mueve la cantidad de lugares indicada dando la vuelta si llega al final o al inicio de su lista; si no es una letra, la devuelve igual.
- `progresivoMitad`: Calcula dónde queda la mitad del texto, recorre carácter por carácter y le pide a `moverCaracter` que mueva cada letra según su turno, reiniciando la cuenta al cruzar la mitad.
- `zigZag`: Recorre el texto revisando si la posición es par o impar para decidir si avanza o retrocede 5 lugares con `moverCaracter`.
- `cifrar`: Ejecuta primero `progresivoMitad` hacia adelante y luego `zigZag` hacia adelante sobre ese resultado.
- `descifrar`: Hace el camino contrario ejecutando primero `zigZag` hacia atrás y luego `progresivoMitad` hacia atrás.

# Ejemplo a mano

## Palabra 1: `HOLA`
Tiene 4 letras, así que la mitad queda en la posición 2 (`H` y `O` en la primera mitad; `L` y `A` en la segunda).

**Paso 1 (`progresivoMitad`):**
- Posición 0 (`H`): avanza 1 lugar en mayúsculas $\rightarrow$ `I`
- Posición 1 (`O`): avanza 2 lugares en mayúsculas $\rightarrow$ `Q`
- Posición 2 (`L`, reinicia en 1): avanza 1 lugar en mayúsculas $\rightarrow$ `M`
- Posición 3 (`A`): avanza 2 lugares en mayúsculas $\rightarrow$ `C`
- Resultado del Paso 1: `IQMC`

**Paso 2 (`zigZag` con clave 5):**
- Posición 0 (par, `I`): avanza 5 lugares $\rightarrow$ `N`
- Posición 1 (impar, `Q`): retrocede 5 lugares $\rightarrow$ `M`
- Posición 2 (par, `M`): avanza 5 lugares $\rightarrow$ `Q`
- Posición 3 (impar, `C`): retrocede 5 lugares dando la vuelta $\rightarrow$ `X`
- **Resultado final cifrado:** `NMQX`

---

## Palabra 2: `Ñandú`
Tiene 5 letras; al quitarle el sobrante impar y dividir entre 2, la mitad queda en la posición 2 (`Ñ` y `a` en la primera mitad; `n`, `d` y `ú` en la segunda).

**Paso 1 (`progresivoMitad`):**
- Posición 0 (`Ñ`): avanza 1 lugar en mayúsculas $\rightarrow$ `O`
- Posición 1 (`a`): avanza 2 lugares en minúsculas $\rightarrow$ `c`
- Posición 2 (`n`, reinicia en 1): avanza 1 lugar en minúsculas $\rightarrow$ `ñ`
- Posición 3 (`d`): avanza 2 lugares en minúsculas $\rightarrow$ `f`
- Posición 4 (`ú`): avanza 3 lugares en la lista de tildes minúsculas (`áéíóúü`) $\rightarrow$ `é`
- Resultado del Paso 1: `Ocñfé`

**Paso 2 (`zigZag` con clave 5):**
- Posición 0 (par, `O`): avanza 5 lugares $\rightarrow$ `T`
- Posición 1 (impar, `c`): retrocede 5 lugares dando la vuelta $\rightarrow$ `x`
- Posición 2 (par, `ñ`): avanza 5 lugares $\rightarrow$ `s`
- Posición 3 (impar, `f`): retrocede 5 lugares $\rightarrow$ `a`
- Posición 4 (par, `é`): avanza 5 lugares en tildes minúsculas $\rightarrow$ `á`
- **Resultado final cifrado:** `Txsaá`

# Codigo (Parte 1)

```javascript
// Crea los alfabetos
const MAYUS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
const MINUS = "abcdefghijklmnñopqrstuvwxyz";
const TILDES_MAYUS = "ÁÉÍÓÚÜ";
const TILDES_MINUS = "áéíóúü";
const GRUPOS = [MAYUS, MINUS, TILDES_MAYUS, TILDES_MINUS];
const CLAVE_ZIGZAG = 5;

function moverCaracter(caracter, k) {
    for (const alfabeto of GRUPOS) {
        const posicion = alfabeto.indexOf(caracter); // Busca existencia del caracter en el arreglo
        if (posicion !== -1) {
            const n = alfabeto.length;
            const nueva = ((posicion + k) % n + n) % n; // mantiene una posicion dentro de su alfabeto ya sea si es positivo muy grande o negativo el valor de k
            return alfabeto[nueva];
        }
    }
    return caracter;
}

function progresivoMitad(texto, direccion) {
    let resultado = "";
    const mitad = (texto.length - (texto.length % 2)) / 2;

    for (let i = 0; i < texto.length; i++) {

        let desplazamiento = i + 1;

        if (i >= mitad) desplazamiento = (i - mitad) + 1;

        resultado += moverCaracter(texto[i], direccion * desplazamiento);
    }
    return resultado;
}

function zigZag(texto, k, direccion) {
    let resultado = "";
    for (let i = 0; i < texto.length; i++) {
        let signo = -1;
        if (i % 2 == 0) signo = 1;
        resultado += moverCaracter(texto[i], direccion * signo * k); // necesito direccion y signo para descifrar en sentido contrario
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
```
# Funcionamiento
## Cómo funcionan las Partes 2 y 3 del programa
- **Lectura y descarga de archivos (Parte 2):** La función pedirArchivo limpia el botón de selección y espera a que el usuario elija un archivo .txt que no esté vacío antes de leer su contenido. Después de transformar el texto, nombreSalida arma el nuevo nombre manteniendo .txt al final y descargar crea el archivo nuevo en memoria para bajarlo a la carpeta de Descargas sin tocar el original.
- **Menú principal (Parte 3):** La función menu mantiene abierta una ventana de opciones en ciclo hasta que el usuario elige salir. Antes de descargar un archivo cifrado, el programa lo descifra internamente para comprobar que coincida con el original y evitar pérdida de datos.

# Por que es reversible
El sistema no pierde información porque cada letra se reemplaza únicamente por otra de su misma lista (mayúsculas, minúsculas o vocales con tilde) sin mezclar categorías y sin agregar ni borrar caracteres. Además, el recorrido funciona de forma circular para que ninguna letra se salga de su lista ni genere errores, mientras que los espacios, números y signos quedan intactos en su mismo lugar. Como al descifrar se aplican los pasos al revés y restando exactamente los mismos movimientos que se sumaron al cifrar, cada carácter regresa sin falla a su estado original.

# Verificacion
Se probó el programa completo cifrando el archivo `original.txt` (tanto con el mensaje de 3 líneas como con un texto externo de 5 líneas que incluye mayúsculas, minúsculas, `ñ`, vocales con tilde, diéresis, números y signos). El programa descargó `original_cifrado.txt` sin mostrar alertas de error en la comprobación automática. Luego se descifró ese archivo para obtener `original_cifrado_descifrado.txt` y se comparó contra `original.txt` usando la herramienta de comparación de VS Code, confirmando que ambos archivos son idénticos sin ninguna diferencia.

# Respuestas P1
1. **¿Por qué `archivo.size` y `texto.length` dan números distintos?**
   Porque `archivo.size` mide cuánto pesa el archivo guardado en el disco en bytes, y las letras especiales como la `ñ`, las vocales con tilde o signos como `¿` y `¡` ocupan 2 bytes cada una en lugar de 1. En cambio, `texto.length` cuenta cuántos caracteres tiene el mensaje ya leído, tomando cada carácter como una sola unidad sin importar cuánto pese.

2. **¿Por qué una página web no puede leer un archivo de tu computador sin que tú lo elijas?**
   Por seguridad del navegador. Las páginas web funcionan dentro de un espacio aislado que les impide revisar carpetas o abrir archivos privados del computador por su cuenta; solo pueden leer el archivo que la persona selecciona directamente mediante el botón de carga.

3. **¿Qué quedaría guardado en la variable si escribes `archivo.text()` sin `await`?**
   No quedaría el texto del archivo, sino una promesa pendiente de resolverse. Leer un archivo del disco toma un instante, y sin `await` el programa sigue ejecutando las siguientes líneas antes de tener el contenido listo.