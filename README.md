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

El creador incluye selectores de raza/ascendencia, fondo, clase, kit, complicación y cinco características. **El catálogo de las páginas 21–283 de Draw Steel Heroes v1.01b está pendiente de importar:** el adjunto excede el límite de transferencia de 32 MiB y no pudo leerse. Hasta recibir una copia accesible, los selectores permiten introducir opciones propias y reutilizar las de los borradores del mismo perfil. No se han inventado listas del manual ni se valida la distribución de características o las restricciones de creación. Los registros se identifican como borradores y se pueden seleccionar y consultar en la mesa.

Para completar el creador es necesaria una versión comprimida del PDF o las páginas indicadas divididas en archivos de menos de 32 MiB. Campañas compartidas, progresión, tablero y combate siguen pendientes.

## GitHub Pages

La navegación utiliza fragmentos (`#personajes`) para funcionar sin redirecciones en alojamiento estático. La base de Vite es `/DrawSteel/`. Para otro nombre de repositorio o un dominio propio, ajusta `base` en `vite.config.ts`.

En GitHub, selecciona **Settings → Pages → Build and deployment → Source: GitHub Actions**. El workflow `.github/workflows/pages.yml` instala con `npm ci`, compila y publica `dist/` cuando se envían cambios a `main`; también permite ejecución manual. El despliegue requiere Pages habilitado y los permisos correspondientes.
