# 59-mi-perfil — Pantalla Mi perfil (ver y editar nombre y apellido)

Implementa #59 (COU-285): ruta `/profile` con GET/PATCH `/users/profile`, más el acceso
directo desde el botón de usuario (sidebar + topbar). Diseño: `design/app/07-mi-perfil.html`
(master `Dashboard User UI.fig`, frame "Mi perfil").

## Specs

- S1: «Contrato: `GET /users/profile` y `PATCH /users/profile`. El perfil devuelve
  `{ name, lastName, email }`; el email es de solo lectura en esta pantalla.»
- S2: «Ruta `/profile` dentro del layout autenticado.»
- S3: «Ver y editar `name` y `lastName`.»
- S4: «Estado sucio que habilita/deshabilitar el guardado.» → guardar deshabilitado sin cambios.
- S5: «Fuera de alcance: cambio de contraseña (U17) y de email (U18).»
- S6: «`Card` con `CardHeader` y `Form` + `Input` + `Label`. Botones guardar/cancelar;
  guardar deshabilitado sin cambios.» Título del card: «Datos personales».
- S7: «Toast al guardar (éxito y error).» Éxito: «Perfil actualizado».
- S8: i18n namespace `profile`: `profile.view.title`, `profile.fields.name`,
  `profile.fields.lastName`, `profile.fields.email`, `profile.actions.edit`,
  `profile.actions.save`, `profile.actions.cancel`, `profile.success.updated`
  (más los textos de error de guardado), presentes en los tres idiomas (paridad CI).
- S9: «Precarga los valores actuales del perfil.»
- S10: «El email se muestra pero no es editable.» Pill de diseño «Solo lectura».
- S11: «Invalida el perfil en caché tras guardar.»
- S12: «Test con MSW y test axe.»
- S13: «Claves presentes en los tres idiomas.»
- S14 (rescindido en L12): la navegación a `/profile` ya existe vía el item "Mi perfil"
  del menú de usuario; el botón mantiene su comportamiento de hoy (dropdown).
- S15: avatar de la pantalla con iniciales del usuario logueado (L5: iniciales al 40% del
  círculo). El badge de lápiz usa el slot canónico `AvatarBadge` de shadcn (hijo del
  Avatar, `absolute bottom-0 right-0`, recorte `ring-2 ring-card`) y es un botón real
  con `aria-label` `profile.actions.edit`. Su acción (diálogo de carga, L14) queda
  bloqueada por el ticket backend api-user#539.
- S16: al guardar con éxito se actualiza el usuario de la sesión (`sessionStore`)
  para que el nombre reflejado en sidebar/topbar cambie sin re-login.

## Tasks

- T1 (S1,S9,S12) `src/features/profile/api.ts` + schema zod del perfil + tests. commit: —
- T2 (S8,S13) namespace `profile` en es/en/pt + `resources.ts`. commit: —
- T3 (S3,S4,S6,S7,S10,S12) `profile-form.tsx` + `profile-page.tsx` (estado sucio, toasts,
  email readonly) + tests MSW/axe. commit: —
- T4 (S11) invalidación de caché del perfil tras guardar. commit: —
- T5 (S2) ruta `/profile` lazy bajo `consoleRoute` (`src/routes/index.tsx:60-64`). commit: —
- T6 (S14) ~~navegación directa + segundo trigger~~ REVERTIDO: `user-menu.tsx` y
  `dashboard-layout.test.tsx` vuelven a la versión de `origin/develop`. commit: —
- T7 (S16) acción de actualización de usuario en `session-store.ts` + persistencia + test. commit: —
- T8 (S15) bloque avatar (iniciales desde `sessionStore`, badge lápiz sin acción). commit: —

## Log

- L1 (usuario): «analiocemos 59 y le damos un estimate» → Estimate 2, ticket en In Progress
  en board #6.
- L2 (usuario): «Lo hacemos en este mismo ticket, primero el diseño y luego la
  implementacion basandonos en el. Conecta con el mcp de openpencil» → diseño hecho en el
  master OpenPencil (frame "Mi perfil", reutiliza sistema de variables Light/Dark).
- L3 (usuario): «Creo que estaria faltando alguna edicion de foto de perfil, ademas los
  botones del card de perfil no tienen los tamaños habituales y el badge de solo lectura
  esta mal posicionado» → avatar + badge de lápiz; botones del sistema (33px); badge al
  final del input.
- L4 (usuario): «en lugar de tener un boton de texto, podriamos añadirle al mismo circulo
  de imagen, el clasico boton de edicion, el lapicito sobre la misma imagen» → lápiz sobre
  el avatar.
- L5 (usuario): «las letras debian abarcar el 75%» → luego «bajemoslo a un 40%» → iniciales
  a 18px sobre avatar 56px.
- L6 (usuario): «centrar los textos de los botones y usar los mismos tamaños» → botones
  de Parámetros, HUG + padding 12/9, label centrado.
- L7 (usuario): «no usar mi nombre personal, usemos otro nombre random» → fixtures del
  diseño: «Martina Cabrera» / inicciales MC / `mcabrera@countergank.com`.
- L8 (usuario): «si toco el boton de usuario en el sidebar o en el topbar no entra a mi
  perfil, falta eso» → S14 (comentado en #59).
- L9 (usuario): «cerrar sesión queda en dropdown de hoy» → S14, segundo trigger.
- L10 export a repo: `design/app/07-mi-perfil.html` + `postfix_export.py` (inyecta
  fonts.css y medidas del layout para render fiel en navegador) + índice y design.json.
  Commits pendientes de autorización.
- L11 (usuario, verbatim): «No, pero porque cambiaste el boton a dropdown con flecha,
  era un button menu asi ya estaba bien, no hacia falta ese cambio» → S14 resindido:
  se revierte `user-menu.tsx` y `dashboard-layout.test.tsx` a su original; el acceso a
  `/profile` es el item "Mi perfil" del dropdown (que ahora renderiza la página real).
- L12 (usuario): «el circulo de imagen con el boton de lapiz… habitualmente son
  componentes ya hechos que permiten establecer hijos como botones» → `AvatarBadge`
  portado al primitivo y `ProfileAvatar` reescrito con el patrón oficial de shadcn.
- L13 (usuario, verbatim): «Creo que es este el boton correcto, pero en lugar de icono de
  + es un lapiz» (ejemplo `AvatarBadge` + `PencilIcon`) → implementado tal cual.
- L14 (usuario): «[el botón] debería abrir el dialogo para cargar imagen según su formato
  y enviarla al backend... hay que ver si el backend tiene la funcionalidad» → backend no
  tiene la feature: ticket creado en api-user countergank/api-user#539 (board, Todo); la
  carga de fotos queda fuera de este ticket y bloqueada por ese issue.
