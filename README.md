# DrawSteel

Plataforma web de aficionados para gestionar campañas de Draw Steel con React, TypeScript y Vite.

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

## Entrada y personajes

El flujo es **perfil → campaña Tyranny → elegir o crear personaje → mesa de juego**. Se ofrecen Gabriel, David, Mateo, Adrián, Andrés y Quique. Gabriel tiene la contraseña local solicitada; los demás perfiles entran sin contraseña. Se vuelve a elegir perfil al recargar.

Este control de entrada se ejecuta en el navegador: no constituye autenticación segura. La contraseña está en el código cliente. Los perfiles separan las listas en la interfaz, pero cualquier usuario con acceso al navegador puede leer o modificar el almacenamiento. No hay backend, sincronización entre dispositivos ni permisos de Director.

Los personajes antiguos y de ejemplo se eliminan de la colección `drawsteel.characters.v1` al abrir esta versión. La nueva colección `drawsteel.characters.v2` comienza vacía. Cada borrador queda vinculado a su perfil y a Tyranny, y se guarda en `localStorage`. Si no se puede guardar, la aplicación avisa de que los cambios solo durarán la sesión.

El creador utiliza el catálogo de **Draw Steel Heroes v1.01b**, extraído del PDF comprimido aportado por el usuario: 12 ascendencias, 18 carreras, 9 clases, 21 kits y 100 complicaciones. Los nombres permanecen en inglés y cada selección muestra la página impresa y su posición en el PDF completo. El archivo recortado contiene 263 páginas: corresponde a las páginas 21–283 del PDF completo, numeradas 6–268 en el libro. El catálogo está en `src/rules-catalog.ts`; el PDF no se distribuye con la aplicación.

El fondo combina carrera y cultura: se eligen entorno, organización, crianza e idioma cultural (además de Caelian). Las características de nivel 1 se eligen entre las permutaciones válidas para la clase, respetando sus valores fijos de 2 y los conjuntos del apartado Basics. Censor, Fury, Shadow y Troubadour tienen un kit; Tactician elige dos; Conduit, Elementalist, Null y Talent no utilizan kit inicialmente. Las bonificaciones de dos kits no se suman automáticamente. La complicación es opcional.

Los personajes siguen siendo **borradores**: faltan subclases, compra de rasgos de ascendencia, habilidades, habilidades de clase, ventajas y efectos mecánicos de las complicaciones. El catálogo y las validaciones anteriores no equivalen a una ficha completamente automatizada. Los borradores propios guardados anteriormente se mantienen y se pueden consultar, aunque sus opciones no procedan del catálogo.

`npm test` comprueba la recuperación de personajes, perfiles, integridad del catálogo, distribuciones de las nueve clases y restricciones de kits. Campañas compartidas, progresión, tablero y combate siguen pendientes.

## GitHub Pages

La navegación utiliza fragmentos (`#personajes`) para funcionar sin redirecciones en alojamiento estático. La base de Vite es `/DrawSteel/`. Para otro nombre de repositorio o un dominio propio, ajusta `base` en `vite.config.ts`.

En GitHub, selecciona **Settings → Pages → Build and deployment → Source: GitHub Actions**. El workflow `.github/workflows/pages.yml` instala con `npm ci`, compila y publica `dist/` cuando se envían cambios a `main`; también permite ejecución manual. El despliegue requiere Pages habilitado y los permisos correspondientes.
