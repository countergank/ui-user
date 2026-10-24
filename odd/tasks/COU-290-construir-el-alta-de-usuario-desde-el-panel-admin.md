# COU-290 — Construir el alta de usuario desde el panel admin

Linear: https://linear.app/countergank/issue/COU-290/construir-el-alta-de-usuario-desde-el-panel-admin
Branch: `feature/cou-290-construir-el-alta-de-usuario-desde-el-panel-admin` (desde `develop` @ `c50b7a8`)

## Specs

**S1 — Ruta**, verbatim: "Ruta `/admin/users/new`." → **desviación**: `/app/users/new` (ADR-13 y el
manifiesto; ver L3).

**S2 — Formulario**, verbatim: "Formulario completo con validación espejo del API."

**S3 — Duplicados**, verbatim: "Manejo de duplicados de email y userName en el campo correspondiente."

**S4 — Diseño**, verbatim: "`Card` con `Form` (react-hook-form + zod) y campos agrupados." · "`Select`
para el rol." · "Botones guardar/cancelar."

**S5 — i18n**, verbatim: "`users.create.title`,
`users.create.fields.name|lastName|email|userName|password|role`, `users.create.submit`,
`users.create.cancel`, `users.create.success`,
`users.create.errors.emailTaken|userNameTaken|weakPassword`."

**S6 — AC validación**: "La validación del cliente coincide con la del API."

**S7 — AC duplicados**: "Email o userName duplicado → error en **ese** campo."

**S8 — AC éxito**: "Éxito → toast y vuelta al listado con la fila nueva visible."

**S9 — AC activo**: "El usuario se crea activo."

**S10 — AC permisos**: "Cuando A9 esté listo, el formulario permite asignar permisos." (fuera de
alcance hasta A9; el API ya acepta `permissions`).

**S11 — AC tests**: "Test con MSW y test axe." · "Claves presentes en los tres idiomas."

**S12 — Contrato verificado con el equipo del API** (leído en su código, no supuesto). El contrato
completo queda transcripto acá para que este repo no dependa de un puntero externo:
- `POST /admin/users` con permiso `user:create`.
- Body: `name`, `lastName`, `email`, `userName`, `password`, `role?` (`admin|user|viewer`, default
  `user`), `permissions?`.
- Reglas de contraseña (`PASSWORD_RULES` + `PasswordStrengthValidator`): 8–64 caracteres; ≥1
  minúscula, ≥1 mayúscula, ≥1 dígito, ≥1 especial de `@$!%*?&`; **sin caracteres repetidos
  consecutivos**; sin secuencias comunes (`123`, `abc`, `qwe`, `asd`, `zxc`).
- Respuesta `CreateUserResponseDTO`: `name`, `lastName`, `email`, `userName`, `role`, `createdAt`,
  `updatedAt`, `isActive` — **no incluye `id`**.
- Errores: `UA-COM-003` userName duplicado, `UA-COM-004` email duplicado, `UA-COM-005` permisos
  inválidos, `PASSWORD_*` contraseña débil.

## Tasks

| ID | Task | Specs | Commit |
|---|---|---|---|
| T1 | `create-schema.ts`: zod espejo de las reglas del API | S2, S6 | pendiente |
| T2 | `api.ts` + `createUser` con zod de respuesta; hook de mutación que invalida el listado | S8, S12 | pendiente |
| T3 | Página y formulario en `/app/users/new` con `Card`, campos agrupados y `Select` de rol | S1, S4 | pendiente |
| T4 | Duplicados mapeados al campo (UA-COM-003/004) y contraseña débil | S3, S7 | pendiente |
| T5 | CTA del listado con handler (deja de estar `disabled`) | S8 | pendiente |
| T6 | i18n `users.create.*` en en/es/pt + paridad | S5, S11 | pendiente |
| T7 | Tests: schema, MSW de éxito y duplicados, axe | S11 | pendiente |
| T8 | Gate completo | S11 | pendiente |

## Log

**L1 — Pedido original**, verbatim: "merged con que seguimos usa kickoff"

**L2 — Elección (kickoff)**: COU-290 por valor — primera mutación real de la consola y la deuda más
visible (el CTA "Nuevo usuario" está `disabled`). Estimación 3 confirmada.

**L3 — Desviación de ruta**: el ticket dice `/admin/users/new`; ADR-13 fija la consola en `/app/*` y
el manifiesto ya declara `/app/users`, que es de donde `RequireSection` saca el permiso. Se
implementa en `/app/users/new`.

**L4 — Contrato leído en el repositorio del API** con permiso de lectura, no inventado: ver S12, que
lo transcribe completo. Este repo no referencia rutas de otros repos: un puntero que no se puede
abrir desde acá no es documentación. La respuesta **no trae `id`**, así que el formulario no puede navegar a un
detalle inexistente; vuelve al listado e invalida la query.
