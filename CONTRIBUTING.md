# Convenciones de desarrollo de ALFI BOT

Este documento resume las reglas obligatorias del repositorio. Las decisiones de arquitectura vigentes se conservan en inglés dentro de [`/ADRs`](ADRs/).

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
| ADRs | `<N>.Decision-<Topic>.md` | `4.Decision-Authentication-RBAC.md` |

Todo JavaScript propio usa ES Modules (`import`/`export`). El código asíncrono nuevo usa `async`/`await` en lugar de cadenas de promesas cuando mejora la lectura.

## Funciones JavaScript y React

Las funciones propias se escriben como *arrow functions* cuando la sintaxis de JavaScript lo permite:

```js
export const normalizeValue = (value) => String(value || '').trim();
```

Los componentes React nuevos siguen la misma regla y se exportan después de declararlos:

```jsx
const ExampleCard = ({ title }) => <article>{title}</article>;

export default ExampleCard;
```

Las declaraciones y expresiones tradicionales con la palabra clave `function` no se usan en código propio. Los constructores y métodos de clase u objeto conservan su sintaxis cuando JavaScript la requiere. Cualquier excepción real —por ejemplo un generador— debe justificarse técnicamente junto al código y en el Pull Request.

Los refactors deben preservar contratos, comportamiento, rutas, reglas de negocio, autenticación, autorización y persistencia. No se mezclan refactors estructurales con cambios funcionales no relacionados.

## Routing, autenticación y RBAC

- Las rutas visuales separan los portales `/app`, `/auditor` y `/admin`.
- `frontend/src/auth/authStorage.js` concentra la sesión del navegador.
- El frontend protege la experiencia de navegación, pero no es una frontera de seguridad.
- El backend autentica el token y autoriza cada recurso mediante roles o permisos.
- Los roles funcionales canónicos son `usuario`, `auditor` y `administrador`.

La decisión completa está en [4.Decision-Authentication-RBAC.md](ADRs/4.Decision-Authentication-RBAC.md).

## PostgreSQL y variables de entorno

- Tablas, columnas, vistas, funciones SQL y esquemas usan `snake_case`.
- Los scripts SQL deben ser explícitos sobre esquema y ejecutarse con el mínimo privilegio necesario.
- Secretos y configuración específica del entorno nunca se incluyen en el código ni se versionan en `.env`.
- Las claves de configuración se documentan mediante archivos `.env.example` sin valores reales.

## Cuándo crear un ADR

Se crea o reemplaza un ADR cuando una decisión afecta la arquitectura, seguridad, contratos entre componentes, persistencia, despliegue o una convención transversal.

1. Reservar el siguiente número secuencial disponible dentro de `/ADRs`.
2. Nombrar el archivo como `<N>.Decision-<Topic>.md`.
3. Escribir el ADR en inglés.
4. Incluir un título, una única línea `Date: YYYY-MM-DD` y decisiones numeradas.
5. Mantener el formato simplificado vigente; no añadir secciones `Status`, `Context`, `Decision` o `Consequences`.
6. Referenciar Jira y el ADR en el Pull Request cuando corresponda.

Los ADRs aceptados no se reescriben para cambiar una decisión. Se crea un ADR nuevo que indique cuál queda reemplazado.

## Verificación antes del Pull Request

Backend:

```bash
cd backend
npm test
npm run check:conventions
npm run test:rbac
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
