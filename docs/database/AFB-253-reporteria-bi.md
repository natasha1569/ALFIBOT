# AFB-253 — Reportería / BI de ALFI BOT

## Separación conceptual

ALFI BOT mantiene tres responsabilidades distintas:

- **Análisis de IA:** determina nivel de riesgo y, cuando corresponde, categoría de fraude.
- **Reportería / BI:** identifica patrones agregados de uso y fraude.
- **Auditoría técnica:** registra quién modificó qué, cuándo y mediante qué operación.

## Taxonomía vigente

La taxonomía analítica queda limitada a:

- crédito falso;
- esquema Ponzi;
- esquema piramidal;
- inversión fraudulenta.

Un contenido puede seguir obteniendo un nivel de riesgo aunque no corresponda
a ninguna de las cuatro categorías vigentes. En ese caso `fraudCategory` y
`categoria_fraude` permanecen `NULL`; no se inventa una categoría residual.

## `aiPolicy.js`

La lista de temas rechazados se expresa de forma general. ALFI BOT no necesita
mantener una enumeración de deportes, música, recetas u otros dominios ajenos
a su función.

## Persistencia

`alfi.analisis.categoria_fraude` almacena una de las cuatro categorías cuando
corresponde.

La columna admite `NULL` para análisis válidos que solo requieran nivel de
riesgo.

## Vista `vw_reporte_fraude_riesgo`

Integra:

- `analisis`;
- `senales_alerta`;
- `recomendaciones`.

Agrupa por:

- mes;
- categoría;
- nivel de riesgo;
- tipo de contenido.

`categoria_fraude = NULL` representa análisis que no pertenecen a la taxonomía
vigente, sin forzarlos a una categoría ficticia.

## Vista `vw_reporte_contenido_perfil`

Integra:

- `analisis`;
- `usuarios`;
- `usuario_intereses_financieros`;
- `intereses_financieros`;
- `senales_alerta`.

Agrupa por atributos generales:

- mes;
- tipo de contenido;
- riesgo;
- categoría;
- provincia;
- rango de edad;
- intereses financieros.

No expone nombre, correo, celular, hash de contraseña, contenido analizado ni
vista previa.

## Acceso

Las nuevas vistas se revocan de `PUBLIC`.

La migración alinea automáticamente el propietario de ambas vistas con el
propietario real del esquema `alfi`. Por ejemplo, si el esquema pertenece a
`sakila` pero la migración se ejecuta administrativamente como `postgres`, las
vistas no quedan accidentalmente propiedad de `postgres`.

Cuando existen los roles RBAC:

- `rol_alfi_admin`: SELECT;
- `rol_alfi_auditor`: SELECT;
- `rol_alfi_usuario`: sin acceso BI.

## Ejecución

Ejecutar en pgAdmin:

```text
backend/sql/AFB-253-reporteria-bi.sql
```

Después, desde `backend`:

```powershell
node test-reporting.js
```

Resultado esperado:

```text
AFB-253 OK: taxonomía reducida, persistencia nullable, dos vistas BI y privacidad estructural validadas.
```

## Consultas para sustentación

```sql
SELECT *
FROM alfi.vw_reporte_fraude_riesgo
ORDER BY mes DESC, total_analisis DESC;
```

```sql
SELECT *
FROM alfi.vw_reporte_contenido_perfil
ORDER BY mes DESC, total_analisis DESC;
```

La reportería se mantiene agregada y separada de la auditoría técnica.
