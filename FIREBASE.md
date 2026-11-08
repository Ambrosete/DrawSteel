# Mesa compartida sin Authentication

La aplicación utiliza Cloud Firestore del proyecto `tyranny-ae3d2`, con los identificadores web en `src/firebase-config.ts`. No utiliza Firebase Authentication, ni siquiera acceso anónimo. No se necesita configurar proveedores de acceso ni dominios autorizados de Authentication.

## Activar Firestore

1. Abre el proyecto `tyranny-ae3d2` en [Firebase Console](https://console.firebase.google.com/).
2. Crea una base de datos **Cloud Firestore Standard / Native**, con ID `(default)`, en modo producción. Elige la ubicación apropiada para tu grupo.
3. En **Firestore → Rules**, sustituye el contenido por el archivo `firestore.rules` de este repositorio y pulsa **Publish**. Si habías publicado la versión anterior con Authentication, debes sustituirla también.

Las reglas se han actualizado en el código local; no se publican automáticamente al compilar la web. La configuración web no concede permisos administrativos para publicarlas.

Esta mesa es pública: cualquier persona puede consultar, crear y eliminar campañas y personajes y editar notas y fichas. Los perfiles son etiquetas y cualquiera puede elegir cualquiera de ellos. Esto también se aplica a quien acceda mediante el SDK o la API, fuera de la interfaz. Las reglas limitan las rutas accesibles a campañas y personajes, validan su estructura y revisiones y deniegan el acceso a otras colecciones. No proporcionan privacidad, identidad ni protección contra el borrado por visitantes.

Documentación oficial: [reglas de Firestore](https://firebase.google.com/docs/firestore/security/get-started), [listeners en tiempo real](https://firebase.google.com/docs/firestore/query-data/listen).

## Desarrollo y publicación

```sh
npm ci
npm run dev
```

No necesitas variables para utilizar `tyranny-ae3d2`. Para otro proyecto, copia `.env.example` a `.env.local`, completa las cuatro variables `VITE_FIREBASE_*` y reinicia Vite. Son identificadores públicos de la app web; no añadas cuentas de servicio ni claves privadas a variables `VITE_*`.

GitHub Pages utiliza la configuración incluida por defecto. Para publicar los cambios envíalos a `main`. Si necesitas otro entorno, el workflow acepta las cuatro variables desde **Settings → Secrets and variables → Actions → Variables**. Cambiarlas requiere volver a compilar.

También puedes publicar las reglas con tu sesión administrativa de la CLI oficial:

```sh
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project tyranny-ae3d2
```

Ese inicio de sesión corresponde a la herramienta de administración en tu ordenador, no a los jugadores ni a Firebase Authentication dentro de la web. Puedes usar únicamente la consola web para publicar las reglas.

## Utilizar la mesa

1. Cada visitante elige Gabriel, David, Mateo, Adrián, Andrés o Quique, sin contraseña.
2. Crea o abre una campaña. Todos los perfiles ven las mismas campañas; no hay invitaciones ni membresías.
3. Los personajes se etiquetan con el perfil que los crea. Todas las fichas de la campaña se pueden consultar y editar; su perfil de origen se conserva al editar desde otro perfil.
4. Las notas del cuaderno se comparten con todos los visitantes.
5. Cada campaña mantiene su colección de personajes y sus notas independientes.
6. En la lista de campañas, **Eliminar campaña** abre un diálogo que identifica la campaña y pide confirmación. Al confirmar se borran todos sus personajes, sus notas y la campaña. No hay recuperación automática.
7. En la lista de personajes o en una ficha, **Transferir personaje** permite moverlo a otra campaña disponible. Se conservan todos sus datos y deja de aparecer en origen. El destino no puede contener ya una ficha con el mismo identificador. El movimiento es atómico y comprueba que ambas campañas siguen disponibles y que el personaje no ha cambiado desde que se abrió el diálogo. No requiere cambios adicionales en las reglas.
8. **Cambiar nombre** está disponible junto a cada campaña y en la barra superior de la mesa abierta. El diálogo permite introducir entre 1 y 80 caracteres y guardar o cancelar. El nombre se actualiza para todos los jugadores y en la selección recordada por el navegador, conservando el identificador y los datos de la campaña. Para activar esta opción hay que volver a publicar `firestore.rules`: la lista de campos editables de una campaña incluye ahora `name`. Se siguen rechazando cambios concurrentes y nombres vacíos o demasiado largos.
9. **Combate** muestra las habilidades elegidas y de kit del personaje seleccionado, junto a un contador propio de esa ficha que empieza en 0. Sumar, restar y resetear se guardan mediante transacciones; el contador se conserva al recargar y transferir. También hay que publicar las reglas actuales para admitir el campo opcional `combatCounter` en los personajes. Los valores se validan como enteros entre -1000000000 y 1000000000.

Para activar este botón debes volver a publicar la versión actual de `firestore.rules`: las reglas anteriores rechazaban la eliminación de campañas. La aplicación marca primero la campaña con `deleting: true`, lo que bloquea nuevas fichas y ediciones. Después elimina los personajes por lotes de hasta 400 y, al terminar, elimina el documento de campaña con sus notas. Si se interrumpe, aparece **Reintentar eliminación** para completar la limpieza; la campaña no puede abrirse mientras está marcada. No se modifican datos de otras campañas.

El modo local del prototipo sigue disponible mediante **Consultar mis datos locales**. Conserva su almacenamiento y su control de entrada anteriores; no sube automáticamente esos datos a Firestore.

## Datos y conflictos

- `campaigns/{id}`: nombre, perfil creador (`ownerId`, solo metadato), notas, revisión y fecha del servidor. El antiguo campo `memberIds` se tolera en documentos anteriores, pero no se utiliza para controlar acceso.
- `campaigns/{id}/characters/{id}`: ficha, perfil de origen (`owner`, solo metadato), campaña, revisión y fecha del servidor.
- Los listeners reciben cambios mientras la mesa está abierta. Las transacciones verifican la revisión de notas y progresión para rechazar guardados obsoletos.
- Una transferencia lee la ficha actual en el servidor y la guarda en destino con revisión 1; el identificador y su perfil se conservan. Se evita sobrescribir otra ficha y una transferencia obsoleta falla sin borrar el original. Ambas listas reciben el cambio mediante sus listeners.
- Ante un conflicto de notas, copia tu borrador y utiliza **Cargar versión compartida**. En progresión, cancela y vuelve a abrir la mejora para partir de la ficha actual.
- Las transacciones necesitan conexión al servidor. Un error mantiene el formulario abierto; la barra indica si los datos proceden de caché.
- Todavía no hay notas privadas, tablero ni automatización de tiradas o encuentros. La pestaña Combate ofrece cartas de habilidades y un contador manual.

## Verificación

El contador **Recoveries** guarda `recoveriesSpent` por ficha. Publica la versión actual de `firestore.rules` para admitir este campo opcional entero no negativo. Las transacciones calculan el gasto sobre la clase, nivel, subclase y contador actuales del servidor, sin perder cambios simultáneos. El máximo se deriva del manual y las fichas antiguas tienen cero gastadas. Comprueba con dos sesiones que gastar, devolver y descansar se comparte; recargar, subir de nivel o transferir conserva el gasto. Sin publicar las reglas, la web muestra el error de permisos y no confirma el cambio.

Ejecuta `npm test`, `npm run typecheck` y `npm run build`. Para pruebas sin datos reales, usa Java compatible con Firebase Emulator Suite y:

```sh
npx firebase-tools emulators:start --only firestore --project demo-drawsteel
```

En `.env.local`, usa `VITE_FIREBASE_PROJECT_ID=demo-drawsteel`, `VITE_FIREBASE_API_KEY=demo-key`, `VITE_FIREBASE_AUTH_DOMAIN=demo-drawsteel.firebaseapp.com`, `VITE_FIREBASE_APP_ID=demo-app` y `VITE_FIREBASE_EMULATORS=true`; reinicia Vite. El emulador solo se conecta en desarrollo.

Comprueba en dos sesiones sin iniciar sesión: crear y recibir campañas, crear una ficha y editarla desde otro perfil, recibir la progresión y las notas, recargar y comprobar persistencia, detectar conflictos al editar desde ambas sesiones y comprobar separación entre campañas. Para el borrado utiliza una campaña de prueba: cancelar no cambia datos; confirmar elimina sus fichas y notas y la retira de ambas sesiones. Verifica también la reanudación tras una interrupción y que no se admiten nuevas fichas ni ediciones durante la eliminación. Las reglas deben rechazar fichas inválidas, revisiones incorrectas, cambios de propietario, borrado de campañas sin marcar y acceso a otras colecciones. Las pruebas unitarias no sustituyen esta verificación de las reglas y sincronización con el servidor.
