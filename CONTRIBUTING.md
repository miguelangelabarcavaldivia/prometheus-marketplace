# Contributing to Prometheus IA Dev Marketplace

¡Gracias por tu interés en contribuir! Este documento te guía por el proceso.

## Cómo contribuir

1. **Fork** el repositorio
2. **Crea una branch** para tu feature: `git checkout -b feat/nueva-funcionalidad`
3. **Commit** tus cambios: `git commit -m "feat: descripción"`
4. **Push** a tu branch: `git push origin feat/nueva-funcionalidad`
5. **Abre un Pull Request**

## Estilos de commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add AI Code Review Tool
fix: Resolve memory leak in agent pipeline
docs: Update installation guide
refactor: Simplify auth flow
```

## Estructura del proyecto

```
productos/
  PRODUCTO_01_NextJS_AI_Starter_Kit/
  PRODUCTO_02_Prompt_Engineering_Playbook/
  PRODUCTO_03_RAG_System_Template/
  PRODUCTO_04_Curso_Prompt_Engineering_Avanzado/
  PRODUCTO_05_AI_Agent_Pipeline/
  PRODUCTO_06_De_Cero_a_AI_Agent/
  PRODUCTO_07_CLI_AI_Commit_Tool/
    src/
      vscode-extension/
      .github/
marketing/
  posts/
  email-templates/
  video-scripts/
docs/
scripts/
.github/
  workflows/
  ISSUE_TEMPLATE/
```

## Productos nuevos

Para agregar un nuevo producto:

1. Crea el directorio en `productos/PRODUCTO_XX_nombre/`
2. Incluye: `src/`, `README.md`, `LICENSE`
3. Agrega el producto a `docs/product-catalog.json`
4. Agrega el producto al README principal
5. Crea un script de marketing (`marketing/posts/post-XX-nombre.md`)

## Testing

```bash
# Para el CLI tool
cd productos/PRODUCTO_07_CLI_AI_Commit_Tool
npm test

# Para el VS Code extension
cd src/vscode-extension
npm test
```

## Reportar bugs

Usa el template de [bug report](.github/ISSUE_TEMPLATE/bug_report.md).

## Preguntas

Únete a nuestra comunidad en [Discord](https://discord.gg/prometheus-ia) o abre un [issue](https://github.com/miguelabarca/Prometheus_IA_Dev_Marketplace/issues).
