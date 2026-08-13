# AFB-293 — Trazabilidad de ramas, commits y Pull Requests

Fecha de verificación: 12 de agosto de 2026.

Repositorio: [natasha1569/ALFIBOT](https://github.com/natasha1569/ALFIBOT).

## Criterio de trazabilidad

- Cada rama funcional incorpora, cuando existe, la clave Jira `AFB-<número>`.
- Los commits relevantes identifican ticket y responsable.
- El Pull Request integra la rama contra `main` y conserva revisión, diff y estado de merge.
- El commit de merge permite confirmar que el cambio forma parte de la rama principal.

## Pull Requests fusionados

| PR | Jira/alcance | Rama | Commit de trabajo | Merge en `main` |
|---|---|---|---|---|
| [#1](https://github.com/natasha1569/ALFIBOT/pull/1) | AFB-309 | `feature/AFB-309-registro-usuarios` | `eafa0fe` | `e902893` |
| [#2](https://github.com/natasha1569/ALFIBOT/pull/2) | AFB-335 | `AFB-335-Natasha-landing` | `0c40f50` | `1cf56ee` |
| [#3](https://github.com/natasha1569/ALFIBOT/pull/3) | AFB-252 | `AFB-252-Natasha-documentacion` | `fd643bd` | `1b2c30a` |
| [#4](https://github.com/natasha1569/ALFIBOT/pull/4) | AFB-367 | `feature/AFB-367-escenario-seguridad-bd` | `dfe8965` | `6932b57` |
| [#5](https://github.com/natasha1569/ALFIBOT/pull/5) | AFB-368 | `feature/AFB-368-cifrado-seguridad-bd` | `8e9a9cd` | `a9748ed` |
| [#6](https://github.com/natasha1569/ALFIBOT/pull/6) | AFB-369 | `feature/AFB-369-hardening-seguridad-bd` | `89f5859` | `b15d697` |
| [#7](https://github.com/natasha1569/ALFIBOT/pull/7) | AFB-370 | `feature/AFB-370-evidencias-seguridad-bd` | `6cdd388` | `45dfa30` |
| [#8](https://github.com/natasha1569/ALFIBOT/pull/8) | AFB-371 | `feature/AFB-371-sql-seguridad-bd` | `9b5ef5d` | `fd866e9` |
| [#9](https://github.com/natasha1569/ALFIBOT/pull/9) | AFB-372 | `feature/AFB-372-plan-seguridad-bd` | `bc2d5a5` | `f9ea4db` |
| [#10](https://github.com/natasha1569/ALFIBOT/pull/10) | AFB-31, AFB-32, AFB-114 | `feature/AFB-114-analisis-imagenes-ocr-ia` | `efed260` | `0a8be89` |
| [#11](https://github.com/natasha1569/ALFIBOT/pull/11) | AFB-331 | `feature/AFB-331-github-actions` | `69957be` | `f33f811` |
| [#12](https://github.com/natasha1569/ALFIBOT/pull/12) | AFB-357, AFB-358 | `feature/AFB-336-clasificacion-fraudes` | `1a29a37` | `b0190c9` |
| [#13](https://github.com/natasha1569/ALFIBOT/pull/13) | AFB-151 | `feature/AFB-151-rbac-postgresql` | `05a4083` | `fd7c077` |
| [#14](https://github.com/natasha1569/ALFIBOT/pull/14) | AFB-335 | `AFB-335-Natasha-landing-v2` | `dd960b4` | `0a8d5a8` |
| [#15](https://github.com/natasha1569/ALFIBOT/pull/15) | AFB-311 | `feature/AFB-311-modelo-registro-postgresql` | `38a7928` | `c602957` |
| [#16](https://github.com/natasha1569/ALFIBOT/pull/16) | AFB-373 | `feature/AFB-373-home-directo-analizador` | `d1be069` | `fccfb1a` |
| [#17](https://github.com/natasha1569/ALFIBOT/pull/17) | AFB-335 | `feature/AFB-335-cierre-landing` | `11129c1` | `735dbb8` |
| [#18](https://github.com/natasha1569/ALFIBOT/pull/18) | AFB-335 | `fix/AFB-335-favicon-html` | `cf10230` | `24e16fa` |
| [#19](https://github.com/natasha1569/ALFIBOT/pull/19) | AFB-309 | `feature/AFB-309-registro-completo` | `04fae4e` | `4a73ef8` |
| [#20](https://github.com/natasha1569/ALFIBOT/pull/20) | AFB-189 | `feature/AFB-189-backup-restauracion` | `de70464` | `c0dbdfb` |
| [#21](https://github.com/natasha1569/ALFIBOT/pull/21) | AFB-253 | `feature/AFB-253-reporteria-bi` | `fe26510` | `98c7db0` |
| [#22](https://github.com/natasha1569/ALFIBOT/pull/22) | AFB-319 | `feature/AFB-319-rbac-aplicacion` | `4f02c4b` | `fbe982a` |
| [#23](https://github.com/natasha1569/ALFIBOT/pull/23) | AFB-199 | `AFB-199-Natasha-backup-documentacion` | `08bf808` | `f2516c1` |
| [#24](https://github.com/natasha1569/ALFIBOT/pull/24) | Corrección de política IA sin clave en el título | `fix-backend-ai-policy-tests` | `9dd5f74` | `93c2922` |
| [#25](https://github.com/natasha1569/ALFIBOT/pull/25) | AFB-336 | `feature/AFB-336-clasificacion-dashboard` | `a876241` | `c9d1f20` |
| [#26](https://github.com/natasha1569/ALFIBOT/pull/26) | AFB-196 | `feat/AFB-196-backup-automatico` | `f583df1` | `24ac24b` |
| [#27](https://github.com/natasha1569/ALFIBOT/pull/27) | AFB-259 | `feat/AFB-259-Natasha-matriz-pruebas` | `c3737e7` | `b4caed0` |
| [#28](https://github.com/natasha1569/ALFIBOT/pull/28) | AFB-277 | `docs/AFB-277-Natasha-guion-sustentacion` | `6e500a5` | `1dd15e1` |
| [#29](https://github.com/natasha1569/ALFIBOT/pull/29) | AFB-280 | `docs/AFB-280-Natasha-explicacion-scrum` | `d9b354e` | `c80d54d` |
| [#30](https://github.com/natasha1569/ALFIBOT/pull/30) | AFB-333 | `feature/AFB-333-usuarios-accesos` | `08f79b6` | `013b3c4` |

## Trabajo de Danny preparado en la rama actual

| Jira | Rama | Commit | Evidencia |
|---|---|---|---|
| [AFB-268](https://pucetec-el-romel.atlassian.net/browse/AFB-268) | `agent/afb-268-271-285-293-282` | `d81b34d` | Normalización del historial y pruebas |
| [AFB-271](https://pucetec-el-romel.atlassian.net/browse/AFB-271) | `agent/afb-268-271-285-293-282` | `e7e675e`, `c0a082c` | Pruebas de WhatsApp, PDF y portapapeles |
| [AFB-285](https://pucetec-el-romel.atlassian.net/browse/AFB-285) | `agent/afb-268-271-285-293-282` | `4336331` | README de instalación y operación |
| [AFB-293](https://pucetec-el-romel.atlassian.net/browse/AFB-293) | `agent/afb-268-271-285-293-282` | Commit de esta matriz | Matriz de trazabilidad |
| [AFB-282](https://pucetec-el-romel.atlassian.net/browse/AFB-282) | `agent/afb-268-271-285-293-282` | `bc34dbb` | Preguntas técnicas frecuentes |

El número del Pull Request de esta rama se añadirá después de publicarla. Los tickets no deben marcarse como finalizados hasta que el PR sea revisado, fusionado a `main` y GitHub Actions termine correctamente.

## Observación

El PR #24 es la única entrada revisada cuyo título no identifica una clave Jira concreta. Para trabajos futuros debe mantenerse la clave en rama, commit y PR, o explicar expresamente la excepción.
