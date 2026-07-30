# 📋 Prometheus IA Dev Marketplace — Next Steps

> **Last updated:** 2026-07-30
> **Status:** 7 products published, 2/4 bundles created, 33 files committed to GitHub (excluding workflow files)

---

## 🔴 Critical — Do First Tomorrow

### 1. Complete Bundles (midnight UTC completed or pending)
- [ ] Verify background bundle creation process ran successfully at midnight UTC
- [ ] Check Gumroad API for the 2 new bundles (RAG+Curso, Prompt Pro)
- [ ] Enable all 4 bundles via API: PUT /v2/products/:id/enable
- [ ] If bundles were not created (rate limit issue), recreate them manually via API

### 2. Attach Products to Bundles (MUST DO via Gumroad web UI)
- [ ] Full Stack AI Bundle → Add: Next.js AI Starter Kit, RAG System Template, AI Agent Pipeline
- [ ] AI Agent Mastery Bundle → Add: AI Agent Pipeline, De Cero a AI Agent, Prompt Engineering Avanzado
- [ ] RAG+Curso Bundle → Add: RAG System Template, Prompt Engineering Avanzado
- [ ] Prompt Pro Bundle → Add: Prompt Engineering Playbook, Prompt Engineering Avanzado

### 3. Upload Product Files
- [ ] Get presigned upload URLs from Gumroad API for each product
- [ ] Upload ZIP files to S3 and attach to each product
- [ ] Upload cover images for each product

### 4. Push GitHub Workflow Files
- [ ] Get a GitHub PAT with workflow scope
- [ ] Push .github/workflows/ files to repository
- [ ] Verify CI workflows run correctly

---

## 🟡 Important — Do This Week

### 5. Marketing Execution
- [ ] Publish Notion posts (7 product posts already written)
- [ ] Schedule LinkedIn posts (14-day content calendar ready)
- [ ] Schedule Twitter/X posts
- [ ] Record/produce demo videos (7 scripts ready)
- [ ] Send launch email sequence (6 templates ready)

### 6. LemonSqueezy Setup
- [ ] Register LemonSqueezy account
- [ ] Create product listings as Gumroad backup
- [ ] Configure payment routing

### 7. Product Files Preparation
- [ ] Compile/distribute all product deliverable files
- [ ] Create ZIP packages for each product
- [ ] Test download links on Gumroad

### 8. Community Building
- [ ] Set up Discord community server
- [ ] Create Twitter/X profile with marketplace link
- [ ] Set up Google Analytics / Plausible tracking
- [ ] Create Google Search Console sitemap

### 9. VS Code Extension
- [ ] Package the VS Code extension (.vsix)
- [ ] Test extension locally
- [ ] Publish to VS Code Marketplace

---

## 🟢 Backlog — Nice to Have

### 10. Additional Products
- [ ] AI Code Review Tool (Q4 2026 roadmap)
- [ ] AI Documentation Generator
- [ ] AI Test Generator
- [ ] AI Product Manager Agent

### 11. Automation
- [ ] Auto-schedule social media posts
- [ ] Set up email automation for new customers
- [ ] Create affiliate tracking dashboard

---

## 📁 Key File Locations

| File | Location |
|------|----------|
| Repository | D:\Prometheus_IA_Dev_Marketplace |
| GitHub | https://github.com/miguelangelabarcavaldivia/prometheus-marketplace |
| Gumroad Store | https://gumroad.com/miguelabarca |
| Gumroad Token | D:\Proyectos Opencode\Content Multiplier\.env |
| Bundles Script | scripts/create-bundles-at-midnight.ps1 |
| Presign Upload | scripts/gumroad-presign-upload.mjs |
| Email Templates | marketing/email-templates/ |
| Video Scripts | marketing/video-scripts/ |
| Content Calendar | marketing/content-calendar.md |
| Launch Checklist | LAUNCH-CHECKLIST.md |
| Product Catalog | docs/product-catalog.json |
| Roadmap | ROADMAP.md |
| FAQ | docs/FAQ.md |
| VS Code Extension | productos/PRODUCTO_07_CLI_AI_Commit_Tool/src/vscode-extension/ |
| Product 07 CLI Source | productos/PRODUCTO_07_CLI_AI_Commit_Tool/ |

## 📞 Gumroad API Notes
- Rate limit: 10 product creates/day (resets at midnight UTC)
- Token: Same token used throughout the session
- Bundle attachment: Not supported via API (must use web UI)
