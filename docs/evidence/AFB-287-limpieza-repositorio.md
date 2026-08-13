# AFB-287 — Checklist de limpieza final del repositorio

## Elementos que deben permanecer
- `backend/`
- `frontend/`
- `docs/`
- `.github/`
- `README.md`
- `CONTRIBUTING.md`
- `.gitignore`

## Verificaciones
- No versionar `.env`.
- No versionar API keys.
- No versionar contraseñas.
- No versionar `node_modules`.
- No versionar `dist`.
- No versionar respaldos con datos reales.
- No dejar archivos temporales o creados accidentalmente.
- Confirmar que el README coincida con el estado actual del proyecto.

## Archivo detectado para revisión
Se detectó previamente un archivo accidental llamado `tatus` en la rama principal. Debe eliminarse si continúa presente y no forma parte del proyecto.

## Comandos sugeridos

```bash
git status
git ls-files | findstr /I ".env node_modules dist tatus"
```

Si `tatus` aparece y es un archivo accidental:

```bash
git rm tatus
```

Después:

```bash
git status
```
