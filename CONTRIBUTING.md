# Convenciones de desarrollo de ALFI BOT

Este documento resume las reglas obligatorias para cambios nuevos. Las decisiones y sus motivos se conservan en inglés dentro de [`docs/adr`](docs/adr/README.md).

## Convenciones generales

| Elemento | Convención | Ejemplo |
|---|---|---|
| Variables y funciones JavaScript | `camelCase` | `normalizeRiskLevel` |
| Componentes React | `PascalCase` | `FraudTrendsDashboard` |
| Rutas web | `kebab-case` | `/password-recovery` |
| Archivos de rutas web | sufijo `.routes.js` | `analysis.routes.js` |
| Identificadores PostgreSQL | `snake_case` | `fraud_category` |
| Variables de entorno | `UPPER_SNAKE_CASE` | `AUTH_TOKEN_SECRET` |
| Constantes globales | `UPPER_SNAKE_CASE` | `ROLE_PERMISSIONS` |
| ADRs | `ADR-NNNN-kebab-case.md` | `ADR-0003-routing-authentication-rbac.md` |

Todo JavaScript propio usa ES Modules (`import`/`export`). El código asíncrono nuevo usa `async`/`await` en lugar de cadenas de promesas cuando mejora la lectura.

## Funciones JavaScript y React

Las funciones propias nuevas se escriben como *arrow functions*:

```js
export const normalizeValue = (value) => String(value || '').trim();
```

Los componentes React nuevos siguen la misma regla y se exportan después de declararlos:

```jsx
const ExampleCard = ({ title }) => <article>{title}</article>;

export default ExampleCard;
```

Una declaración `function` solo se acepta cuando existe una razón técnica concreta, por ejemplo una función generadora o una necesidad real de *hoisting*. La excepción debe explicarse junto al código y en el Pull Request.

El código anterior se migra de forma incremental. Una conversión es segura y razonable cuando no depende de `this`, `arguments`, `new`, *hoisting* o semántica de generador, y está cubierta por pruebas o por una compilación verificable. No se mezclan refactors masivos con cambios funcionales.

## Routing, autenticación y RBAC

- Las rutas visuales separan los portales `/app`, `/auditor` y `/admin`.
- `frontend/src/auth/authStorage.js` concentra la sesión del navegador.
- El frontend protege la experiencia de navegación, pero no es una frontera de seguridad.
- El backend autentica el token y autoriza cada recurso mediante roles o permisos.
- Los roles funcionales canónicos son `usuario`, `auditor` y `administrador`.

La decisión completa está en [ADR-0003](docs/adr/ADR-0003-routing-authentication-rbac.md).

## PostgreSQL y variables de entorno

- Tablas, columnas, vistas, funciones SQL y esquemas usan `snake_case`.
- Los scripts SQL deben ser explícitos sobre esquema y ejecutarse con el mínimo privilegio necesario.
- Secretos y configuración específica del entorno nunca se incluyen en el código ni se versionan en `.env`.
- Las claves de configuración se documentan mediante archivos `.env.example` sin valores reales.

## Cuándo crear un ADR

Se crea o reemplaza un ADR cuando una decisión afecta la arquitectura, seguridad, contratos entre componentes, persistencia, despliegue o una convención transversal.

1. Copiar la estructura descrita en [`docs/adr/README.md`](docs/adr/README.md).
2. Reservar el siguiente identificador secuencial de cuatro dígitos.
3. Escribir el ADR en inglés.
4. Indicar estado, contexto, decisión y consecuencias.
5. Actualizar el índice de ADRs.
6. Referenciar Jira y el ADR en el Pull Request cuando corresponda.

Los ADRs aceptados no se reescriben para cambiar una decisión. Se crea un ADR nuevo que indique cuál queda reemplazado.

## Verificación antes del Pull Request

Backend:

```bash
cd backend
npm test
npm run check:conventions
node test-rbac.js
```

Frontend:

```bash
cd frontend
npm test
npm run build
```

Además:

- Revisar `git diff --check` y el diff completo.
- Confirmar que no existan secretos, `.env`, `node_modules` ni artefactos de compilación.
- Incluir la clave Jira en la rama, commits y Pull Request.
- Documentar pruebas, riesgos y excepciones técnicas.
