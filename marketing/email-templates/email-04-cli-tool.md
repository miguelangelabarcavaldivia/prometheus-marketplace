# Email 4: Deep dive - CLI AI Commit Tool

**Subject:** 📝 Nunca más escribas un commit manualmente (CLI tool)

**Preheader:** 1 comando = commit message perfecto en segundos.

---

## ¿Cansado de escribir mal los commits?

El **CLI AI Commit Tool** genera mensajes de commit perfectos en 1 segundo.

### Demo:

```bash
# 1. Haz tus cambios
git add .

# 2. Genera el commit message con IA
npx aicommit generate
# → "fix: resolve memory leak in user session handler"

# 3. Commit
git commit -m "$(cat .git/COMMIT_MESSAGE)"

# Otras funciones:
npx aicommit review     # Revisa tu último commit
npx aicommit suggest    # Sugiere mejoras al código
npx aicommit changelog  # Genera changelog automático
```

### Características:
- ✅ Mensajes de commit siguiendo Conventional Commits
- ✅ Soporte para múltiples proveedores (OpenAI, Anthropic, Groq, Google)
- ✅ Integración con VS Code (extensión disponible)
- ✅ Review automático de código
- ✅ Generación de changelogs

### Instalación:
```bash
npm install -g @miguelabarca/aicommit
```

**Precio:** Solo $14 (menos de un café ☕)

**Oferta de lanzamiento:** Usa **LAUNCH40** para 40% OFF.

---

Miguel
