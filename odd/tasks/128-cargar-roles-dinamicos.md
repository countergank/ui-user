# 128 — Cargar roles dinámicamente en filtros y formularios de usuarios

Issue countergank/ui-user#128 · branch `feature/128-cargar-roles-dinamicos` (base `origin/develop`).

## Specs

- S1: "[ ] El filtro del listado usa los roles de `GET /roles`."
- S2: "[ ] Los selectores de alta/edición usan la misma fuente."
- S3: "[ ] Fallback cacheado ante error del endpoint (la pantalla no se rompe)."
- S4: "[ ] `USER_ROLES` literal eliminado o reducido a fallback tipado."
- S5: "[ ] Los schemas zod aceptan cualquier rol del catálogo dinámico."

Objetivo del issue (verbatim): "Cargar los roles dinámicamente desde `GET /roles`."

No-objetivos (verbatim): "CRUD de roles: es #52." / "Cambios en api-user."

Contexto del issue: `USER_ROLES = ["admin","user","viewer"]` está hardcodeado (`features/users/types.ts:3`) y alimenta el filtro del listado (`users-toolbar.tsx:48`) y los selectores de alta/edición. Backend: `api-user/src/rbac/controllers/role.controller.ts:46`.

## Tasks

- T1 (S1, S3, S4) — Query de roles desde `GET /roles` con fallback cacheado; `USER_ROLES` reemplazado por `FALLBACK_ROLES` tipado. `src/features/users/roles.ts`, `hooks/use-roles.ts` + tests. commit: 0966ead
- T2 (S1) — Filtro del listado (`users-toolbar.tsx`) consume el catálogo dinámico vía prop desde `users-page.tsx`. commit: 0966ead
- T3 (S2, S5) — Selectores de alta/edición + schemas zod aceptan cualquier rol del catálogo; el edit extiende el catálogo con el rol actual del usuario. `create-schema.ts`, `edit-schema.ts`, `create-user-form.tsx`, `edit-user-form.tsx`, `types.ts`, `api.ts`. commit: 0966ead

## Log

- L1: "Usa la skill kickoff" — bootstrap de sesión; issue elegido #128 por decisión del humano entre #127/#126/#128.
- L2: "vamoss" — autoriza la implementación de #128.
- L3: Implementación completa con TDD (RED→GREEN por tarea). Gate local en verde: lint ✓, typecheck ✓, 1029 tests ✓, coverage 97.89% ✓, build ✓. Contrato `GET /roles` verificado contra `api-user` (`PaginatedResponseDTO`, `limit` máx 100). El edit-form extiende el catálogo con el rol actual del usuario para que un prefill con rol fuera de fallback no bloquee una edición no relacionada (S3).
- L4: Commit autorizado por el humano: `0966ead feat(users): load roles dynamically in filters` (T1–T3).
