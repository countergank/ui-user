# Feature: Migrar secrets de Doppler a Infisical Cloud (#140)

GitHub: https://github.com/countergank/ui-user/issues/140
Board: ui-user (Project #6) · Estimate 3 · Branch `feature/140-migrar-secrets-infisical`

## Specs

- S1: "Proyecto creado en Infisical Cloud con entornos (development, production) y todas las variables de los `.env.example`."
- S2: "El dev local levanta con `infisical run` sin `.env` manual."
- S3: "El build/runtime consume las variables desde Infisical sin Doppler."
- S4: "Los workflows de GitHub Actions obtienen sus credenciales sin Doppler."
- S5: "Sin referencias residuales a Doppler en Makefile, `scripts/`, Dockerfile, docker-compose, CI y docs."

## Tasks

| ID | Specs | Ruta | Commit |
|----|------|------|--------|
| T1 | S1 | Infra fuera del repo: crear proyecto+entornos en Infisical Cloud y migrar variables (manual, requiere humano con cuenta) | — |
| T2 | S2, S5 | `Makefile` + `README.md`: reemplazar `doppler run` por `infisical run` (targets `dev`, `build`, `build-staging`, `docker-up`; eliminar `doppler-setup`/`doppler-secrets`; nueva doc de setup con Infisical) | 82ff63c |
| T3 | S3, S5 | `docker-compose.yml` + `Dockerfile` + `docs/adr.md` (ADR-11): runtime/build sin Doppler (build-args se mantienen, se documenta fuente Infisical) | 82ff63c |
| T4 | S4, S5 | `.github/workflows/ci.yml`: comentarios Doppler → Infisical (CI ya usa env dummy `https://ci.invalid`, sin consumo real de Doppler) | 82ff63c |
| T5 | S5 | Barrido final: grep Doppler sin residuos en archivos activos (excluye openspec/archive, odd/, CHANGELOG históricos) — .env.example editado por el humano | 82ff63c |

## Log

- L1: "vamos" (tras proponer kickoff + explore de #140; autoriza continuidad del flujo ODD)
- L2: Usuario eligió Estimate 3 para #140 (consistencia con api-user#531)
- L3: Explore completado. Mapa Doppler: Makefile (DOPPLER var, targets dev/build/build-staging/docker-up, doppler-setup, doppler-secrets), docker-compose.yml (comentarios), Dockerfile (comentarios), ci.yml (comentarios; e2e usa VITE_API_BASE_URL dummy, no consume Doppler real), README.md (~10 refs doc), docs/adr.md ADR-11. `.env.example`/`.env.test` no pudieron leerse por política del harness (paths sensibles) — T1 los cubre vía Infisical export/manual del humano.
- L4: Kickoff: #140 en In Progress, rama `feature/140-migrar-secrets-infisical` desde origin/develop. #127 pausado a Todo con comentario.
- L5: T1 cerrado por el humano: proyecto y entornos creados en Infisical Cloud, slugs reales dev/staging/prod, login hecho.
- L6: T2–T4 implementados: Makefile (INFISICAL var, infisical run --env dev/staging, target infisical-login reemplaza doppler-setup/doppler-secrets), README (sección env reescrita), docker-compose.yml y Dockerfile (comentarios), docs/adr.md (ADR-11 retitulado a Infisical/Vite, decisión y consecuencias actualizadas), ci.yml (1 comentario). Verificados con grep: 0 residuos en esos archivos.
- L7: T5 bloqueado solo por .env.example: la política del harness bloquea leer/editar paths .env* (hard block, la autorización humana no lo levanta). Bloque de reemplazo entregado. openspec/changes/cou-251-zustand/proposal.md queda fuera de alcance (artefacto histórico de cambio cerrado).
- L8: .env.example editado por el humano; grep final de residuos: 0 hits en archivos activos. S2 verificado funcionalmente por el humano (`make dev` levanta con infisical run).
- L9: Corrección de raíz: el CLI no resuelve el proyecto por directorio — requiere `infisical init`, que escribe `.infisical.yaml` (solo project id, commiteado). Agregado target `infisical-init` al Makefile y doc corregida. Error de documentación inicial: asumí `.infisical.json`; el archivo real es `.infisical.yaml`.
- L10: Commit autorizado y ejecutado: 82ff63c `chore(infra): migrar gestión de entorno de Doppler a Infisical Cloud` (9 archivos, 98+/67-). El humano stageó .env.example manualmente (guard del harness bloquea hasta el git add del path).
