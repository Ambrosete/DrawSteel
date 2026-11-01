# DrawSteel

Plataforma web de aficionados para gestionar campañas de Draw Steel. Primera versión con React, TypeScript y Vite.

## Desarrollo

Requiere Node.js 24 y npm 11.

```sh
npm ci
npm run dev
```

- `npm run typecheck`: comprueba los tipos.
- `npm run build`: comprueba TypeScript y genera la aplicación estática en `dist/`.
- `npm run preview`: sirve la compilación localmente.

La navegación utiliza fragmentos (`#personajes`) para funcionar en alojamiento estático sin configurar redirecciones. La pantalla de personajes permite buscar y crear registros de nivel 1, inicialmente con datos de ejemplo. Los cambios se guardan en `localStorage` del navegador; no se sincronizan entre dispositivos. No hay autenticación ni backend. Las fichas no validan todavía las reglas oficiales. Campañas, combate y reglas tienen pantallas informativas pendientes de implementación.

## GitHub Pages

La base de Vite es `/DrawSteel/`, correspondiente al nombre de este repositorio. Para otro nombre o un dominio propio, ajusta `base` en `vite.config.ts`.

En GitHub, selecciona **Settings → Pages → Build and deployment → Source: GitHub Actions**. El workflow `.github/workflows/pages.yml` instala con `npm ci`, compila y publica `dist/` cuando se envían cambios a `main`; también permite ejecución manual. El despliegue requiere que Pages esté habilitado y los permisos del repositorio permitan el workflow. No se ha publicado automáticamente durante el desarrollo inicial.

## Alcance futuro

Fichas y progresión de personajes, campañas compartidas, tiradas de dados, tablero interactivo y combates semiautomáticos supervisados por el Director.
