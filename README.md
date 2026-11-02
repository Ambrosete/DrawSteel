# DrawSteel

Plataforma web de aficionados para gestionar campañas de Draw Steel con React, TypeScript y Vite.

## Campañas compartidas con Firebase

La mesa compartida funciona sin Firebase Authentication: se elige un perfil sin cuenta ni contraseña. Todos los visitantes pueden consultar las campañas, crear personajes, editar sus fichas y modificar el cuaderno compartido. La lista incluye **Eliminar campaña**, con confirmación y borrado de sus fichas y notas; requiere publicar la versión actual de `firestore.rules`. El perfil organiza los personajes, pero no acredita identidad ni limita permisos. Firestore distribuye las ediciones en tiempo real y las transacciones detectan conflictos de edición.

El proyecto configurado por defecto es `tyranny-ae3d2`. Para activar los servicios sigue [FIREBASE.md](FIREBASE.md): crea Firestore y publica `firestore.rules`. No se necesita activar Authentication ni autorizar dominios de acceso. Las variables de `.env.example` son opcionales y permiten seleccionar otro entorno (también en GitHub Actions para Pages). El modo local sigue disponible desde la entrada.

En las tarjetas de personajes y en la ficha, **Transferir personaje** permite elegir otra campaña. El movimiento conserva el identificador, el perfil, el nivel, la progresión y el resto de la ficha; una transacción crea la ficha en destino y la retira del origen sin sobrescribir personajes existentes. No se permiten transferencias a campañas eliminándose. Esta opción utiliza las reglas actuales y no requiere otra modificación de permisos.

Las habilidades se muestran en cartas con todo su texto visible. Al crear o subir de nivel, cada elección presenta todas sus opciones en una cuadrícula: pulsa una carta o utiliza sus controles de selección con el teclado. Las elecciones anteriores permanecen visibles y bloqueadas; las habilidades repetidas no pueden elegirse en otra posición. Las nuevas elecciones se guardan al confirmar.

El texto de las cartas se centra y redistribuye al ancho disponible, sin conservar los saltos de línea del PDF. Las citas ornamentales aparecen en un recuadro blanco con cursiva gris. Cada Power Roll y sus resultados ≤11, 12–16 y ≥17 se agrupan en un recuadro blanco independiente; los efectos posteriores conservan su propio párrafo. Se han normalizado etiquetas de tirada con glifos dañados en tres habilidades, sin cambiar los valores ni efectos.

El navegador recuerda el perfil, la campaña y el personaje seleccionados. F5 recupera esa selección y mantiene la sección indicada por la URL. La última ficha recibida se muestra inmediatamente mientras Firebase reconecta, con las acciones de edición deshabilitadas hasta confirmar los datos actuales. Salir o cambiar de perfil limpia la selección compartida. Si el servidor confirma que una campaña o personaje ha desaparecido, se vuelve a la lista disponible. La selección local se conserva por separado; no se guardan contraseñas ni formularios sin confirmar.

## Desarrollo

Requiere Node.js 24 y npm 11.

```sh
npm ci
npm run dev
```

- `npm test`: pruebas de perfiles, recuperación de borradores y separación de personajes.
- `npm run typecheck`: comprueba los tipos.
- `npm run build`: comprueba TypeScript y genera la aplicación estática en `dist/`.
- `npm run preview`: sirve la compilación localmente.

## Entrada y personajes en modo local

El modo local mantiene el flujo **perfil → campaña Tyranny → elegir o crear personaje → mesa de juego**. Se ofrecen Gabriel, David, Mateo, Adrián, Andrés y Quique. Gabriel tiene la contraseña local del prototipo; los demás perfiles entran sin contraseña. El navegador recuerda el perfil y la selección al recargar. En modo compartido todos los perfiles entran sin contraseña y utilizan las campañas de Firestore.

El control de entrada local se ejecuta en el navegador: no constituye autenticación segura. La contraseña está en el código cliente. Los perfiles separan las listas en la interfaz, pero cualquier usuario con acceso al navegador puede leer o modificar el almacenamiento. Este modo no sincroniza datos. La mesa compartida tampoco autentica a los visitantes; sus reglas permiten acceso público a las campañas y personajes, con validación de datos.

En modo local se utiliza la colección `drawsteel.characters.v2`. Cada borrador queda vinculado a su perfil y a Tyranny, y se guarda en `localStorage`. Si no se puede guardar, la aplicación avisa de que los cambios solo durarán la sesión. No se borra la colección anterior ni se importan automáticamente datos locales a Firebase.

El creador utiliza el catálogo de **Draw Steel Heroes v1.01b**, extraído del PDF comprimido aportado por el usuario: 12 ascendencias, 18 carreras, 9 clases, 21 kits y 100 complicaciones. Los nombres permanecen en inglés y cada selección muestra la página impresa y su posición en el PDF completo. El archivo recortado contiene 263 páginas: corresponde a las páginas 21–283 del PDF completo, numeradas 6–268 en el libro. El catálogo está en `src/rules-catalog.ts`; el PDF no se distribuye con la aplicación.

El fondo combina carrera y cultura: se eligen entorno, organización, crianza e idioma cultural (además de Caelian). Las características de nivel 1 se eligen entre las permutaciones válidas para la clase, respetando sus valores fijos de 2 y los conjuntos del apartado Basics. Censor, Fury (con kit especial en Stormwight), Shadow y Troubadour tienen un kit; Tactician elige dos; Conduit, Elementalist, Null y Talent no utilizan kit inicialmente. Las bonificaciones de dos kits no se suman automáticamente. La complicación es opcional.

## Habilidades, progresión y eliminación

El catálogo incluye 427 habilidades de elección transcritas del manual: habilidades distintivas, heroicas, de subclase y 25 habilidades de kit (21 kits generales y 4 de Stormwight). El selector muestra costes, acciones, alcance, objetivos, tiradas, efectos y páginas del libro en inglés. Los símbolos de los tres resultados se muestran como ≤11, 12–16 y ≥17.

Al crear un personaje se elige su subclase (dos dominios diferentes en Conduit), las habilidades distintivas que le correspondan y una habilidad de coste 3 y otra de coste 5. Tactician obtiene sus habilidades distintivas de sus dos kits. Fury/Stormwight utiliza Boren, Corven, Raden o Vuken.

La ficha permite avanzar de uno en uno hasta nivel 10, previa confirmación del hito o experiencia con el Director. Se añaden elecciones en los niveles 2, 3, 5, 6, 8 y 9: Elementalist obtiene elecciones heroicas adicionales donde otras clases obtienen habilidades de subclase. Las elecciones anteriores se conservan; las nuevas excluyen duplicados y opciones de otras clases, subclases o niveles. Los aumentos de características de los niveles 4, 7 y 10 se aplican al confirmar; las clases con una única característica principal requieren elegir la mejora adicional en 4 y 10. El nivel y las habilidades se conservan al recargar.

Los borradores antiguos se mantienen. Su botón **Completar habilidades** añade elecciones de nivel 1 sin borrar datos ni subir de nivel. Los borradores con una clase propia ajena al catálogo se pueden consultar y eliminar, pero no tienen progresión automática.

Hay botones **Eliminar personaje** en cada tarjeta y en la ficha. Un diálogo nativo permite cancelar (también con Escape) o confirmar el borrado permanente del personaje del perfil actual. Al borrar el personaje seleccionado se vuelve a la lista; los personajes de otros perfiles se conservan.

Las fichas siguen siendo borradores: no se automatizan el gasto de recursos, el combate, la compra de rasgos de ascendencia, ventajas/perks, habilidades de pruebas/skills, rasgos pasivos de cada nivel ni efectos de las complicaciones. La selección detallada de habilidades de combate no equivale a una ficha completamente automatizada. El Director revisa estas otras mejoras con el manual. Los nombres de habilidades propias guardados antes del catálogo se conservan.

`npm test` comprueba datos, perfiles, catálogo, distribuciones de características, las elecciones de todas las subclases en niveles 1–10, compatibilidad de borradores, borrado por propietario, modelos compartidos y detección de revisiones obsoletas. El workflow de Pages ejecuta las pruebas antes de compilar. Tablero y combate siguen pendientes. Consulta en `FIREBASE.md` la verificación con dos sesiones y emuladores.

## GitHub Pages

La navegación utiliza fragmentos (`#personajes`) para funcionar sin redirecciones en alojamiento estático. La base de Vite es `/DrawSteel/`. Para otro nombre de repositorio o un dominio propio, ajusta `base` en `vite.config.ts`.

En GitHub, selecciona **Settings → Pages → Build and deployment → Source: GitHub Actions**. El workflow `.github/workflows/pages.yml` instala con `npm ci`, compila y publica `dist/` cuando se envían cambios a `main`; también permite ejecución manual. El despliegue requiere Pages habilitado y los permisos correspondientes.
