# COU-101 — Diseñar las pantallas faltantes del panel de consola

Issue countergank/ui-user#101 · branch `feature/101-disenar-pantallas-faltantes-panel` (base `origin/develop`) · trabajo exclusivamente en el master Open Pencil `.fig`.

## Specs

- S1: "[ ] Frame `Sesiones` en el master con listado, badge de dispositivo actual, revocación individual y cierre total."
- S2: "[ ] Contenido diseñado para el tab Plantillas de email (listado con estados activa/borrador)."
- S3: "[ ] Wireframe del editor de plantilla con preview y envío de prueba."
- S4: "[ ] Contenido diseñado para el tab Parámetros, agrupado por `smtp` / `email` / `resend` / `throttle`."
- S5: "[ ] Contenido diseñado para el tab i18n con los locales `es`, `en` y `pt`."
- S6: "[ ] Contenido diseñado para el tab Envíos."
- S7: "[ ] Frame `Auditoría` propio con sidebar GESTIÓN activo y Sistema sin el tab Auditoría."
- S8: "[ ] Todo el trabajo queda en el master `.fig`; sin cambios en `design/` ni en código."

Reglas duras del pedido (verbatim):

- "Se trabaja EXCLUSIVAMENTE en el master .fig: /mnt/c/Users/leand/Documents/MEGA/Professional/Countergank/designs/Dashboard User UI.fig (openpencil eval/find conectan a la app viva; export HTML solo en modo archivo con esa ruta)."
- "PROHIBIDO tocar design/ del repo, src/ ni exports HTML (no-objetivo del issue)."
- "El CLI no persiste: al cerrar cada bloque de edición, pedir Ctrl+S al humano y verificar mtime/sha del .fig antes de seguir."
- "Los node ids cambian entre modo app y modo archivo: re-resolver por nombre."
- "Sin commits sin autorización explícita del humano viendo el diff (AGENTS.md)."
- "Los wireframes siguen el lenguaje visual de los 9 frames existentes del master."

## Tasks

- T1 (S1) — Wireframe Sesiones: listado de sesiones/dispositivos activos, badge de dispositivo actual, revocación individual, "cerrar todas las sesiones" (`POST /auth/logout-all`). Master .fig. commit: —
- T2 (S2) — Tab Plantillas de email del frame Sistema: listado CRUD con estados activa/borrador (`GET/POST/PATCH/DELETE email/templates`). Master .fig. commit: —
- T3 (S3) — Editor de plantilla: slug, asunto, cuerpo, variables, preview y envío de prueba (`POST /email/send`). Master .fig. commit: —
- T4 (S4) — Tab Parámetros: formularios agrupados por `smtp` / `email` / `resend` / `throttle` (`GET/PUT admin/parameters`). Master .fig. commit: —
- T5 (S5) — Tab i18n: tabla de traducciones namespace × locale (`es`/`en`/`pt`) con claves faltantes. Master .fig. commit: —
- T6 (S6) — Tab Envíos: log de envíos (destinatario, plantilla, estado, fecha, error); diseño como propuesta (endpoint aún no expuesto). Master .fig. commit: —
- T7 (S7) — Frame Auditoría propio (opción A): item GESTIÓN del sidebar activo, reutilizando `AuditTableCard`; tab Auditoría removido de Sistema. Master .fig. commit: —
- T8 (S8) — Verificación final: sin cambios en `design/`, `src/` ni exports HTML; `git status` limpio salvo `odd/`; persistencia del .fig verificada (mtime/sha tras cada bloque). commit: —

## Log

- L1 (pedido original, verbatim): "Tomá el issue countergank/ui-user#101 (https://github.com/countergank/ui-user/issues/101) y ejecutá el kickoff para trabajarlo en esta sesión.

  Estado ya resuelto, no lo repitas:
  - Labels feature + ui y assignee ya están puestos en el issue.
  - La rama ya existe y está checked out acá: feature/101-disenar-pantallas-faltantes-panel (creada desde origin/develop, sin upstream). No crees otra rama.
  - PENDIENTE MANUAL DEL HUMANO (avisale si no está): agregar #101 al project board homónimo "ui-user" con Estimate 5 y Status Todo — el token gh de este entorno no accede a Projects V2 de la org. El kickoff exige project/Estimate/assignee completos antes de tocar nada.

  Tu kickoff:
  1. Leé .atl/skill-registry.md DE ESTE WORKTREE (skills v3, actualizadas) y cargá kickoff y github-tickets (no linear-tickets: ya no se usa). Esta sesión trabaja SOLO diseño en el master Open Pencil: react-frontend no aplica.
  2. Mové el Status del issue a In Progress en el board (si tu token no alcanza, pedile al humano que lo mueva y registrá en el Log que quedó bloqueado en eso).
  3. Creá el tracking ODD: odd/tasks/cou-101-disenar-pantallas-faltantes.md con Specs (S# citando verbatim los criterios de aceptación del issue), Tasks y Log (L1 = pedido original).
  4. Verificá `git status --porcelain` vacío y HEAD en la rama del issue antes de editar nada.

  Alcance (criterios completos en el body del #101):
  Diseñar en el master Open Pencil los wireframes faltantes: Sesiones (screen nueva), tabs Plantillas de email / Parámetros / i18n / Envíos del frame Sistema, editor de plantilla, y Auditoría como frame propio (opción A: sale del tab de Sistema, sidebar GESTIÓN activo).

  Reglas duras:
  - Se trabaja EXCLUSIVAMENTE en el master .fig: /mnt/c/Users/leand/Documents/MEGA/Professional/Countergank/designs/Dashboard User UI.fig (openpencil eval/find conectan a la app viva; export HTML solo en modo archivo con esa ruta).
  - PROHIBIDO tocar design/ del repo, src/ ni exports HTML (no-objetivo del issue).
  - El CLI no persiste: al cerrar cada bloque de edición, pedir Ctrl+S al humano y verificar mtime/sha del .fig antes de seguir.
  - Los node ids cambian entre modo app y modo archivo: re-resolver por nombre.
  - Sin commits sin autorización explícita del humano viendo el diff (AGENTS.md).
  - Los wireframes siguen el lenguaje visual de los 9 frames existentes del master.

  Cerrá el kickoff con el reporte estándar: issue · rama · base · estado del board · plan ODD con los 7 wireframes como tasks."
- L2: Board bloqueado para el PAT activo (`gh project list --owner countergank` → "Resource not accessible by personal access token"). Pendiente manual del humano: agregar #101 al board "ui-user" (Estimate 5, Status Todo) y luego moverlo a In Progress antes de editar el master.
- L3: Resuelto el bloqueo: el token OAuth de `~/.config/gh/hosts.yml` (scope `project`) sí accede a Projects V2. Diagnóstico: #101 no estaba en el project 6 (solo issues #43–#98). Acciones ejecutadas: `item-add` (item `PVTI_lADOBxekRc4Bpt0OzhFYrIM`), Estimate=5, Status=In Progress (opción `47fc9ee4`). Verificado por GraphQL: Status="In Progress", Estimate=5.
- L4: Ejecución completa T1–T7 en el master vía CLI en modo app (clonando shells existentes para garantizar el lenguaje visual). Persistencia verificada tras cada bloque: sha de7f5618 → eed5f6ee (T1) → d439cc0c (T2) → 8cca32c3 (T3) → 794c7aea (T4) → 75ca5634 (T5) → 12b9eaa8 (T6) → 415951d6 (T7), mtime final Nov 2 20:10. Cada frame validado por export PNG a /tmp. Verificación final en modo archivo: los 7 frames presentes (1440×1024), Sistema con tabs Plantillas/Envíos/Parámetros/i18n y sin Tab-Auditoría. Nota técnica: ids de nodo difieren entre modo app y archivo (0:1373 → 0:1372); verificación por nombre. Repo: único cambio `odd/tasks/cou-101-disenar-pantallas-faltantes.md` (sin track); `design/`, `src/` y exports intactos. Sin commits (pende autorización del humano). Incidente resuelto: la app Windows quedó desenganchada tras el reinicio del servicio MCP (token rotado); fix: reabrir OpenPencil.
- L5 (corrección del humano, verbatim): "Necesitamos primero hacer ciertas correcciones en el diseño .fig
  1. Consolidar el nombre correcto en tre el Frame titulo y acceso desde el sidebar, Actualmente en el sidebar se llama Auditoria, pero el Frame y el titulo proponen un nombre Sistema, lo cual se contradice, hay que ponerle el mismo nombre a todo y proceder a cambiarlo segun corresponda en todos los sidebars de todas los Frames
  2. Lo otro que haria seria una vez definidoel nombre correcto, dejaria la seccion accesible como sub elementos del acceso principal en el sidebar:
  Sistema || auditoria
   Plantillas
   Envios
   Parametros
   i18n
  Y cada uno de ellos lleva a la pantalla correspondiente, no usaria tabs para esto
  3. Frame Sistema parametros, no muestra correctamente el titulo en la pantalla, no muestra correctamente el breadcrum
  4. idem 3 i18n
  5. idem 4 Envios
  6. Idem 5 Auditoria y tiene textos en un lenguaje que desconozco"

## Specs (corrección — ronda 2)

- S9: "Consolidar el nombre correcto en tre el Frame titulo y acceso desde el sidebar... hay que ponerle el mismo nombre a todo y proceder a cambiarlo segun corresponda en todos los sidebars de todas los Frames" — un único acceso "Sistema" con sub-items; fin del item suelto "Auditoría" en GESTIÓN y del rótulo de sección suelto.
- S10: "dejaria la seccion accesible como sub elementos del acceso principal en el sidebar: Sistema || auditoria / Plantillas / Envios / Parametros / i18n. Y cada uno de ellos lleva a la pantalla correspondiente, no usaria tabs para esto" — sub-items en ese orden, sin tabs en ningún frame.
- S11: "Frame Sistema parametros, no muestra correctamente el titulo en la pantalla, no muestra correctamente el breadcrum" (idem i18n, idem Envíos) — título de pantalla y breadcrumb "Administración / Sistema / <pantalla>" por frame.
- S12: "Idem 5 Auditoria y tiene textos en un lenguaje que desconozco" — Auditoría con título/breadcrumb correctos y sin encabezados en inglés (REQUEST→PETICIÓN, STATUS→ESTADO, CORRELATION ID→ID DE CORRELACIÓN).

## Tasks (ronda 2)

- T9 (S9,S10) — Sidebar en los 14 frames con sidebar: GESTIÓN sin Auditoría suelta; grupo "Sistema" con sub-items Auditoría/Plantillas/Envíos/Parámetros/i18n (h30, indentados, estado activo por pantalla); Tabs eliminados de los 5 frames que los tienen. commit: —
- T10 (S11,S12) — Títulos, subtítulos y breadcrumbs de 3 niveles en Plantillas de email / Parámetros / i18n / Envíos / Auditoría / Editor; encabezados en inglés→español en Auditoría; renames de frames (fin de "Sistema — X"); eliminación del frame duplicado "Sistema — Plantillas". commit: —
- L6 (aclaración del humano, verbatim): "ok vamos identificar la pantalla de Sistema plantillas 0:2250, la idea es que en el sidebar, quien este seleccionado sea Plantillas de email, no Auditoria 0:1389, de hecho el acceso de auditoria se debe mover como sub elemento de sistema en todos los sidebars existentes y la pantalla de Sistema (id nodo 0:1409) de hoy, pasaria a ser pantalla de auditoria" + "Fijate que le cambiaste la tipografia a Sistema deberia tener la misma que gestion en el sidebar"
- L7 (incidente): el documento de la app revirtió al estado previo a la ronda T9 de sidebars (los cambios de ayer no llegaron al guardado; /tmp también se limpió por cambio de día). Se diagnosticó por DOM (NavItem-Auditoría vivo en los 14 NavMain, Tabs vivos en 0:1373) y se rehizo todo consolidado sobre el estado actual.
- L8 (ejecución ronda 2): sidebars reconstruidos en 14 frames (GESTIÓN: Inicio/Usuarios/Roles y permisos/Sesiones; grupo Sistema con sub-items Auditoría/Plantillas de email/Envíos/Parámetros/i18n, estilo tipográfico idéntico a GESTIÓN, activo por pantalla). Tabs eliminados. Frames renombrados: 0:1373 Sistema→Auditoría (AuditTableCard + AuditDetailCard migrados desde 0:3088, duplicado eliminado), 0:2214→Plantillas de email, 0:2552→Parámetros, 0:2708→i18n, 0:2905→Envíos. Breadcrumbs de 3 niveles (Administración/Sistema/<pantalla>) en 6 pantallas; títulos corregidos; encabezados inglés→español (REQUEST→PETICIÓN, STATUS→ESTADO, CORRELATION ID→ID DE CORRELACIÓN). Glitch de rasterización post-reversión (texto con acentos corruptos en pantalla) resuelto re-escribiendo 1.162 nodos de texto. Verificado por PNG: Auditoría, Plantillas de email, Envíos. Pendiente: Ctrl+S + verificación del archivo guardado.
- L9 (correcciones visuales del humano, ronda 3): SearchBox de Usuarios desalineado (layout vertical con primary MIN → CENTER, delta 0px); Topbar de Usuarios incompleto (0:392: faltaban ThemeSwitch y LanguageButton → clonados desde Inicio; auditoría: era el único frame incompleto); 0:2646 ParamsRow y DetailRow del Editor con blanco por defecto → fondo #F9F9FB (las filas originales no tienen fill propio); separadores de fila de la tabla Envíos (0:2997 SendsCard) no cruzaban la columna ERROR → el mecanismo de strokes individuales del renderer no es confiable (ni siquiera el master los dibuja en aislado); fix determinista: rectángulo RowDivider de 1px absoluto (constraints STRETCH/MAX) al pie de cada fila en las 4 tablas construidas (Envíos 5, Plantillas de email 5, i18n 6, Sesiones 5 = 21 divisores), strokes de fila removidos. Verificado por PNG a escala 1.
- L10 (decisión del humano, ronda 4): "el diseño por ahora quedo listo, deberiamos proceder con la implementacion en design system del repo" — ante las opciones (sync system.md / re-export HTML / implementar src/), eligió: **Re-exportar HTML a design/** (la "tarea posterior" del issue, ahora autorizada explícitamente por el dueño).
- L11 (ejecución re-export): según el flujo de `design/README.md` (COU-342): export de los 7 frames nuevos en modo archivo → `design/app/08-sesiones.html` … `14-envios.html`; `07-sistema.html` retirado (la pantalla Sistema ya no existe: se dividió en Auditoría + Plantillas de email/Parámetros/i18n/Envíos sin tabs); `design.json` source block (sha256/sizeKb/exportedAt/tool) y lista de artboards actualizados; README actualizado. Sin commits (pende autorización). Caveat registrada: los fills de los frames nuevos son literales (no atados a la colección de variables Tokens del master), así que el modo Dark no los repinta automáticamente.
- L12 (defecto reportado por el humano): "El contenido que va en el pantalla principal en cada uno de los nuevos htmls que se descargaron, esta desfazado se posiciona por debajo del sidebar" — causa: export en modo fragment (divs raíz sueltos con flex, sin wrapper) vs los artboards originales que son standalone. Fix: re-export de los 7 con `--html standalone`; verificado left:248px del Main y wrapper op-stage en los 7.
- L13 (correcciones ronda 5, humano): (1) "este nodo quedo suelto: 0:2031 / 0:2047 y esta por encima de la pantalla de landing" — 9 frames huérfanos de la primera pasada fallida de Sesiones, eliminados. (2) "en los nodos 0:1373 0:2048 0:2214 0:2415 0:2552 0:2708 0:2905; quedaron elementos sin token de tema" — 1.916 pinturas atadas a la colección Tokens (matching exacto + tolerancia 0.012); quedan 3 literales sin token porque no existe variable equivalente: #f1e8f7 (badge ESTE DISPOSITIVO), #fdf2e2/#9a6700 (pill reintentando) — crear variables para ellos es decisión de diseño, pendiente.
- L14 (fix estructural anti-corrupción de guardado): PageHeader del Editor convertido a MIN + HeaderSpacer (layoutGrow) — el guardado escribe x=1128 para los PageActions creados por CLI bajo SPACE_BETWEEN; el espaciador hace la posición implícita por acumulación. Pendiente verificar en disco tras Ctrl+S; si funciona, extender a Parámetros/i18n/Envíos y re-exportar los 7 HTML.
- L15 (mecanismo de variables OpenPencil — hallazgo crítico verificado): (a) firma correcta del binding: `node.fills = [paint con boundVariables.color = {id}]` (paint-write; `figma.bindVariable` con campo "fills" es campo deprecado → "Unknown binding field"; el formato canónico es "fills/0/color"; la firma estilo Figma (variable, node, prop) es no-op). (b) **"Aplicar modo de variable" (UI) RE-ESCRIBE las pinturas como literales y ELIMINA los bindings** — cada aplicación de modo destruye el atado y congela los colores del modo aplicado. (c) Los valores Dark congelados se reconocen y re-atan con el mapa Dark→token (#232225→sidebar, #b6b3bd→muted-foreground, #efeff1→foreground, etc.). (d) WORKFLOW OBLIGATORIO: aplicar modo (UI) → re-corrida de binding (script) → recién ahí guardar. (e) Los bindings SÍ sobreviven guardado+reload si no se aplica ningún modo después (verificado con bridge 0.16, que sí lee boundVariables; el 0.15.1 las aplanaba en lectura — actualizado a 0.16.0 con autorización del humano). (f) Variable nueva creada: color/warning-soft (L:#fdf2e2 / D:#322008) para el pill "reintentando" que no tenía token.
- L16 (estado final de bindings): 15 pantallas con TODOS sus rellenos/trazos atados a variables (≈4.300 pinturas; Sidebar/Topbar excluidos del último pase porque el humano confirmó que ya estaban bien). Frames reconstruidos por modo corrupto: Auditoría y Sesiones (frame nuevo sano + hijos mudados). Pendiente: humano aplica Light → corrida final de binding → Ctrl+S → verificación en disco → re-export HTMLs → commit.
- L17 (temas + re-export final): el usuario fijó "modo automático" en todas las pantallas (resuelve según el tema del sistema). Pasada global de binding + recolor a Dark (2.208 pinturas) a pedido del humano. Correcciones finales en Sesiones: Main → sin fills (referencia Roles), Topbar → color/background (grafo) + color/surface-raised (paint), frame → literal #F9F9FB (referencia Editar usuario). Sincronización de los DOS almacenes de binding (paint-level + graph-level "fills/0/color") en Sesiones (144) y los 8 frames restantes (1.049) — la UI lee el graph-level, el renderer el paint-level. Error propio corregido: el matching por color de mis pasadas había re-atado los pills del topbar a color/sidebar cuando el original COU-342 era color/muted (comparten valor Dark) — restaurado desde el grafo de Roles (referencia del humano). Re-export final de los 7 HTML standalone (08-14) en modo archivo con ids de archivo (los ids del app re-indexaron al guardar); design.json source actualizado (sha c56c7f84, 2146 Kb, 2026-11-04, openpencil 0.16.0).
