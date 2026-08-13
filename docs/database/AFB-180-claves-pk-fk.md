# AFB-180 — Definir claves primarias y foráneas del modelo

## Objetivo
Definir las claves primarias y foráneas necesarias para mantener la integridad referencial del modelo de ALFI BOT.

## Claves primarias

| Entidad | Clave primaria |
|---|---|
| `roles` | `rol_id` |
| `usuarios` | `usuario_id` |
| `analisis` | `analisis_id` |
| `senales_alerta` | `senal_id` |
| `recomendaciones` | `recomendacion_id` |
| `auditoria` | `auditoria_id` |
| `intereses_financieros` | `interes_id` |
| `usuario_intereses_financieros` | (`usuario_id`, `interes_id`) |

## Claves foráneas

| Tabla hija | FK | Tabla padre | PK referenciada |
|---|---|---|---|
| `usuarios` | `rol_id` | `roles` | `rol_id` |
| `analisis` | `usuario_id` | `usuarios` | `usuario_id` |
| `senales_alerta` | `analisis_id` | `analisis` | `analisis_id` |
| `recomendaciones` | `analisis_id` | `analisis` | `analisis_id` |
| `usuario_intereses_financieros` | `usuario_id` | `usuarios` | `usuario_id` |
| `usuario_intereses_financieros` | `interes_id` | `intereses_financieros` | `interes_id` |

## Reglas importantes

- `senales_alerta.analisis_id` usa `ON DELETE CASCADE`.
- `recomendaciones.analisis_id` usa `ON DELETE CASCADE`.
- La relación usuario-interés utiliza una clave primaria compuesta.
- `usuario_intereses_financieros.usuario_id` usa `ON UPDATE CASCADE` y `ON DELETE CASCADE`.
- `usuario_intereses_financieros.interes_id` usa `ON UPDATE CASCADE` y `ON DELETE RESTRICT`.

## Justificación

Las claves primarias permiten identificar de forma única cada registro. Las claves foráneas mantienen la relación entre las entidades y evitan registros huérfanos. El uso de eliminación en cascada en señales y recomendaciones permite que, al eliminar un análisis, también se eliminen sus datos dependientes.

La tabla `usuario_intereses_financieros` resuelve una relación muchos-a-muchos entre usuarios e intereses financieros mediante una clave primaria compuesta.
