# AFB-304 — Arquitectura de la solución

## Tecnologías
- Frontend: ReactJS + Vite + JavaScript + CSS.
- Backend: Node.js + Express.js.
- API: REST.
- Base de datos: PostgreSQL.
- IA: OpenAI API.
- Gestión: Jira + Confluence.
- Versionado: Git + GitHub.

## Flujo
`Usuario → React → Express REST → Servicios/OpenAI → PostgreSQL → React`

React gestiona la interfaz. Express procesa y valida las solicitudes. OpenAI participa en el análisis inteligente. PostgreSQL almacena usuarios, análisis, señales, recomendaciones y auditoría.

La arquitectura incorpora autenticación, autorización por roles y separación de responsabilidades.
