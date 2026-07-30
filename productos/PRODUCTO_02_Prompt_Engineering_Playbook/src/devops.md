# DevOps

> 22 prompts para CI/CD, infraestructura, contenedores, cloud y monitoreo.

---

## 1. Dockerfile Optimizado

**[DevOps]**

```
Genera un Dockerfile optimizado para {aplicación} en {lenguaje}.

Requisitos:
- Base image: {imagen_base_oficial} específica (no :latest)
- Multi-stage build para reducir tamaño final
- Capas: instalar dependencias -> copiar código -> build -> runtime
- Cache de dependencias: ordenar para máximo cache hit
- No ejecutar como root (crear usuario no-root)
- Variables de entorno: {lista_vars_con_defaults}
- Puerto expuesto: {puerto}
- Healthcheck: {curl / wget / custom command en intervalo}
- Entrypoint: {comando_de_inicio}
- Labels: {maintainer, version, description}
- Copy only production files (usar .dockerignore)
- Tamaño objetivo: < {X}MB
- Security scanning: evitar vulnerabilidades conocidas

Incluye .dockerignore completo.
```

**Formato de salida:** Dockerfile multi-stage + .dockerignore + docker-compose.yml de ejemplo.

**Ejemplo:** `{API Node.js}`, `{node:20-alpine}`, `{puerto: 3000}`, `{target: < 150MB}`

---

## 2. Pipeline CI/CD Completo

**[DevOps]**

```
Diseña un pipeline CI/CD completo para {proyecto} en {plataforma_CI}.

Stack: {lenguaje} + {framework} + {base_datos} + {cloud}
Repositorio: {GitHub / GitLab / Bitbucket}

Pipeline stages:

1. **Code Quality**:
   - Lint: {comando_lint}
   - Type check: {comando_typecheck}
   - Format check: {comando_format}
   - Security scan: {trivy / snyk / sonar}

2. **Test**:
   - Unit: {comando_test_unit}
   - Integration: {comando_test_integration}
   - Coverage gate: `{X}%`
   - Parallel test splitting: {sí / no}

3. **Build**:
   - Compile: {comando_build}
   - Docker image: {build_args, tags}
   - SBOM generation: {sí / no}

4. **Deploy Staging**:
   - Env: {URL_staging}
   - Smoke tests: {comando_smoke}
   - E2E tests: {comando_e2e}

5. **Deploy Production**:
   - Approval gate: {manual / automático}
   - Canary: {X}% por {Y} minutos
   - Full rollout: {porcentaje_incremental}
   - Rollback: {comando_rollback}

Variables de entorno y secrets organizados por stage.
Caché de dependencias, Docker layers, node_modules.
Notificaciones: Slack/Teams en cada stage.
```

**Formato de salida:** Pipeline YAML completo + scripts auxiliares + docs de operación.

**Ejemplo:** `{API REST + React SPA}`, `{GitHub Actions}`, `{Node.js + PostgreSQL + AWS ECS}`

---

## 3. Docker Compose para Desarrollo

**[DevOps]**

```
Crea un docker-compose.yml para el entorno de desarrollo de {proyecto}.

Servicios necesarios:
- {app}: {imagen_o_build_local, puerto, variables, volúmenes}
- {db}: {imagen_oficial, versión, puerto, volumen_datos, init_script}
- {cache}: {Redis/Memcached, versión, configuración}
- {queue}: {RabbitMQ/Redis, management UI}
- {mail}: {MailHog / Mailpit para testing de emails}
- {storage}: {MinIO para S3-compatible local}

Características:
- Hot reload: montar código fuente como volumen
- Base de datos: volumen persistente para datos
- Seed data: script que se ejecuta al iniciar
- Redes: red interna para comunicación entre servicios
- Healthchecks: para cada servicio que dependa de otro
- Profiles: servicios opcionales (monitoreo, herramientas)
- Extensiones: docker-compose.override.yml para personalización local
- Logging: driver json-file con rotación
- Límites de recursos: memoria y CPU por servicio
- wait-for-it o depends_on condition para orden de inicio
```

**Formato de salida:** docker-compose.yml + docker-compose.override.yml + scripts de inicialización.

**Ejemplo:** `{App Node.js + PostgreSQL + Redis + MailHog + MinIO}`, `{5 servicios, hot reload, seed data automática}`

---

## 4. Kubernetes Manifiestos

**[DevOps]**

```
Genera los manifiestos Kubernetes para desplegar {aplicación}.

Aplicación: {nombre_app}
Imagen: {registry/repo:tag}
Puerto: {puerto_container}
Réplicas: {mínimo} - {máximo}
Recursos: request {CPU} / limit {CPU}, request {RAM} / limit {RAM}
Entorno: {staging / producción}

Manifiestos necesarios:
1. **Deployment**: replicas, strategy (rolling update), pod template, probes (liveness, readiness, startup), resource limits, anti-affinity, topology spread constraints, terminationGracePeriodSeconds

2. **Service**: type (ClusterIP / NodePort / LoadBalancer), ports, selector

3. **ConfigMap**: variables de entorno no sensibles, archivos de configuración

4. **Secret**: variables sensibles (no en git, usar External Secrets o SOPS)

5. **HPA** (Horizontal Pod Autoscaler): target CPU % y/o memory, custom metrics

6. **Ingress**: host, TLS, annotations (nginx/alb, cors, rate limiting)

7. **PDB** (Pod Disruption Budget): minAvailable o maxUnavailable

8. **ServiceAccount**: RBAC roles mínimos necesarios

9. **NetworkPolicy**: qué pods pueden comunicarse

Labels y annotations estándar: app, version, managed-by, environment, team.
```

**Formato de salida:** Manifiestos Kubernetes separados por archivo + kustomization.yaml o Helm chart values.

**Ejemplo:** `{user-service}`, `{ghcr.io/team/user-service:v1.2.3}`, `{2-10 réplicas, 256m/512m CPU, 512Mi/1Gi RAM}`

---

## 5. Helm Chart

**[DevOps]**

```
Crea un Helm chart para desplegar {aplicación} en Kubernetes.

Chart name: {nombre_chart}
Descripción: {descripción}
App version: {versión_app}
Kubernetes: {versión_mínima}

Estructura:
```
{nombre_chart}/
  Chart.yaml
  values.yaml
  values-{env}.yaml (staging, producción)
  templates/
    _helpers.tpl (helpers reutilizables)
    deployment.yaml
    service.yaml
    ingress.yaml
    configmap.yaml
    secret.yaml (template)
    hpa.yaml
    pdb.yaml
    serviceaccount.yaml
    tests/ (helm test)
  charts/ (dependencias)
```

values.yaml must have:
- `replicaCount`, `image` (repository, tag, pullPolicy), `imagePullSecrets`
- `nameOverride`, `fullnameOverride`
- `serviceAccount` (create, name, annotations)
- `podAnnotations`, `podSecurityContext`, `securityContext`
- `service` (type, port)
- `ingress` (enabled, className, annotations, hosts, tls)
- `resources` (requests, limits)
- `autoscaling` (enabled, minReplicas, maxReplicas, targetCPUUtilizationPercentage, targetMemoryUtilizationPercentage)
- `env` (configmap, secret refs)
- `probes` (liveness, readiness, startup)
- `nodeSelector`, `tolerations`, `affinity`

Incluye helm test y CI integración.
```

**Formato de salida:** Helm chart completo + values por entorno + documentación de configuración.

**Ejemplo:** `{payment-service}`, `{v2.1.0}`, `{min K8s 1.24}`, `{environments: dev, staging, production}`

---

## 6. Script de Backup Automatizado

**[DevOps]**

```
Crea un script de backup automatizado para {recurso} en {entorno}.

Recurso: {base_de_datos / archivos / PV_volumes / configuración}
Destino: {S3 / GCS / Azure Blob / NFS / local cifrado}
Frecuencia: {horaria / diaria / semanal}
Retención: {N} días, {M} semanas, {K} meses

El script debe:
1. Ejecutar backup (pg_dump, mysqldump, tar, rsync, Velero)
2. Comprimir (gzip, zstd, bzip2) con nivel {X}
3. Cifrar (age, gpg, openssl AES-256-GCM) con clave rotable
4. Checksum (SHA-256) y verificación
5. Subir a {S3} con versionado
6. Limpiar backups antiguos según política de retención
7. Notificar ({Slack / Email}) resultado
8. Logging estructurado (JSON) de cada operación
9. Lock file para evitar ejecución concurrente
10. Pausar/resumir (SIGSTOP/SIGCONT)

Incluye script de restauración con confirmación y dry-run.
```

**Formato de salida:** Script de backup + script de restauración + systemd timer/cron + documentación.

**Ejemplo:** `{PostgreSQL 16}`, `{S3 con versionado}`, `{diario, retención 30d 12s 6m}`

---

## 7. Terraform / IaC Module

**[DevOps]**

```
Crea un módulo de Terraform para provisionar {recurso_infra}.

Provider: {AWS / Azure / GCP / Kubernetes}
Recurso: {tipo_de_recurso}

El módulo debe incluir:

1. **variables.tf**: todas las variables documentadas con tipo, descripción, default, sensitive, validation blocks

2. **main.tf**: recurso(s) principal(es) con:
   - Tags obligatorios: Name, Environment, Project, ManagedBy, Owner, CostCenter
   - Lifecycle: create_before_destroy / prevent_destroy para recursos críticos
   - Dependencias explícitas
   - Count / for_each para multi-instancia

3. **outputs.tf**: outputs útiles (ARNs, IDs, endpoints, DNS names)

4. **versions.tf**: Terraform version, provider version constraints

5. **examples/**: ejemplo completo de uso del módulo

6. **README.md**: documentación del módulo

Buenas prácticas:
- Mínimo privilegio (IAM policies granulares)
- Encriptación por defecto (EBS, S3, RDS, ASG)
- Backup habilitado (RDS automated backups, EBS snapshots)
- Monitoring (CloudWatch metrics, alarms sugeridas)
- Cost optimization (usar spot cuando sea posible, right-sizing defaults)
- Security groups mínimos (principio de least access)
```

**Formato de salida:** Módulo Terraform completo + ejemplo de uso + documentación.

**Ejemplo:** `{AWS RDS PostgreSQL}`, `{variables: engine_version, instance_class, storage_size, multi_az, backup_retention_period, deletion_protection}`

---

## 8. Script de Monitoreo y Alertas

**[DevOps]**

```
Configura monitoreo y alertas para {sistema/infraestructura}.

Stack: {Prometheus + Alertmanager / Datadog / CloudWatch / Grafana Cloud}

Métricas a monitorear:

1. **Infraestructura**:
   - CPU: alert si > {X}% por {Y} minutos
   - Memory: alert si > {X}% por {Y} minutos
   - Disk: alert si < {X}% libre
   - Network: alert si throughput > {X} Mbps
   - Connection count: alert si > {X} conexiones simultáneas

2. **Aplicación**:
   - HTTP 5xx rate: alert si > {X}% en {Y} minutos
   - HTTP latency p99: alert si > {X}ms
   - Health check: alert si endpoint no responde
   - Error log rate: alert si > {X} errores/minuto

3. **Base de datos**:
   - Connections: alert si > {X}
   - Slow queries: alert si > {X} queries > {Y}s en {Z} minutos
   - Replication lag: alert si > {X} segundos

4. **Custom**:
   - Business metrics: {transacciones_fallidas, usuarios_afectados}

Configuración de Alertmanager:
- Grouping: group_by ['alertname', 'severity', 'service']
- Inhibition: critical inhibe warning del mismo servicio
- Routes: severities a diferentes canales (Slack, PagerDuty, Email)
- Receivers: Slack webhook, email, PagerDuty

Incluye runbooks enlazados desde las alertas.
```

**Formato de salida:** Configuración de métricas + reglas de alerta + routing + runbooks.

**Ejemplo:** `{Microservicios en K8s}`, `{Prometheus + Grafana + Alertmanager + Slack}`, `{20 reglas de alerta, 3 receivers}`

---

## 9. Configuración de NGINX / Reverse Proxy

**[DevOps]**

```
Genera la configuración de NGINX para {aplicación/servicio}.

Modo: {reverse proxy / load balancer / static file server / API gateway}

Configuración necesaria:

1. **server block**: dominio, listen 80/443, SSL config

2. **SSL/TLS**:
   - Certificados: Let's Encrypt / custom
   - Protocols: TLS 1.2, 1.3
   - Ciphers: modern / intermediate / old
   - HSTS: max-age={X}, includeSubDomains

3. **Location blocks**:
   - /: proxy_pass a {backend_url}
   - /static/: root local, cache control, gzip
   - /api/: proxy_pass, headers, rate limiting
   - /health: return 200

4. **Rate limiting**: zone definition, limit_req, limit_conn, burst, nodelay

5. **Caching**: proxy_cache, cache_bypass, purge

6. **Security headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Content-Security-Policy, Referrer-Policy

7. **Optimizaciones**:
   - Gzip: tipos, level, min_length
   - Client max body size: {X}M
   - Keepalive: timeout, requests
   - Buffer sizes: proxy_buffers, proxy_buffer_size

8. **Logging**: JSON format, access_log, error_log, log_not_found

9. **Upstream**: load balancing method (least_conn / ip_hash / random), health checks, max_fails, fail_timeout
```

**Formato de salida:** Configuración NGINX completa + snippets + script de verificación.

**Ejemplo:** `{API REST + SPA frontend}`, `{SSL con certbot, proxy_pass a Node.js :3000, static files a /var/www/build}`

---

## 10. GitHub Actions Workflows

**[DevOps]**

```
Crea workflows de GitHub Actions para {proyecto}.

Repositorio: {org/repo}
Stack: {lenguaje} + {framework} + {DB} + {cloud}

Workflows:

1. **CI** (push a branches, PRs):
   - Checkout + cache de dependencias
   - Lint, typecheck, format check
   - Unit tests + integration tests
   - Coverage report
   - Build
   - Docker image build + scan (trivy)
   - Timeout: {10} min

2. **CD Staging** (push a main/develop):
   - Build + push Docker image (tag: {commit-sha}, {branch})
   - Deploy a staging cluster
   - Smoke tests
   - E2E tests
   - Notify Slack

3. **CD Production** (release tag v*):
   - Manual approval gate
   - Build + push Docker image (tag: semver)
   - Deploy canary {10%} for {5} min
   - Verify metrics (error rate, latency)
   - Rollout to {100%}
   - Post-deploy smoke tests
   - Rollback on failure
   - Notify Slack + create GitHub Release

4. **Security Scan** (weekly schedule):
   - Dependency audit
   - SAST (CodeQL / Semgrep)
   - DAST (OWASP ZAP)
   - Secret scanning (Gitleaks / TruffleHog)
   - Report + open issues

5. **Dependency Update** (monthly):
   - Dependabot / Renovate config
   - Auto-merge patch updates
```

**Formato de salida:** Workflows YAML completos + scripts auxiliares + documentación.

**Ejemplo:** `{team/api-platform}`, `{Node.js + PostgreSQL + Docker + AWS ECS}`, `{workflows: ci.yml, cd-staging.yml, cd-production.yml, security-scan.yml}`

---

## 11. Script de Health Check / Readiness

**[DevOps]**

```
Crea un script de health check para {sistema/aplicación}.

Endpoint de health: {GET /health o similar}
Formato de respuesta: JSON con status, timestamp, version, checks individuales

Checks a implementar:
1. **HTTP check**: el servidor responde en {puerto}
2. **Database check**: conexión a DB + query simple (SELECT 1)
3. **Cache check**: Redis/Memcached PING
4. **Queue check**: RabbitMQ/SQS accessible
5. **Storage check**: S3 bucket accesible, write test file
6. **External dependency**: API externa responde (con timeout corto {3}s)
7. **Disk space**: check espacio libre > {X}%
8. **Memory**: check memory usage < {X}%
9. **Certificate**: check SSL cert expira > {X} días
10. **Queue length**: check backlog < {X} mensajes
11. **Replication**: check replica lag < {X} segundos

Formato de respuesta:
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "version": "1.2.3",
  "timestamp": "2024-01-01T00:00:00Z",
  "checks": {
    "database": { "status": "pass", "latency_ms": 5 },
    "redis": { "status": "pass", "latency_ms": 2 },
    "disk": { "status": "warn", "detail": "75% used" }
  },
  "uptime_seconds": 123456
}
```

Exit code: 0 si healthy, 1 si degraded, 2 si unhealthy.
```

**Formato de salida:** Endpoint de health check + script CLI + configuración de probe K8s.

**Ejemplo:** `{API Gateway}`, `{Node.js}`, `{checks: HTTP, DB, Redis, Queue, Disk, uptime, version}`

---

## 12. Ansible Playbook

**[DevOps]**

```
Crea un playbook de Ansible para configurar {servidor/servicio} en {SO}.

Hosts: {grupo_de_hosts_en_inventario}
SO: {Ubuntu 22.04 / Rocky Linux 9 / Windows Server}
Función: {web server / base de datos / worker / load balancer}

Playbook tasks:

1. **System updates**: apt update && upgrade / yum update
2. **Usuarios**:
   - Crear user: {deploy, monitoreo}
   - SSH keys: {lista_de_claves_públicas}
   - Sudo access: {configured per user/group}
   - Shell: /bin/bash
3. **Security**:
   - Firewall: ufw/iptables rules
   - Fail2ban: SSH protection
   - SSH hardening: no root login, key-only, custom port
   - Automatic security updates
   - Auditd: configure logging rules
4. **Dependencias**:
   - Instalar: {paquetes_necesarios}
   - Versiones específicas
5. **Aplicación**:
   - Crear directorios, permisos
   - Copiar archivos de configuración (templates)
   - Variables de entorno
6. **Servicios**:
   - Systemd service unit
   - Enable + start service
   - Health check después de start
7. **Monitoreo**:
   - Instalar node_exporter (Prometheus)
   - Configurar log rotation (logrotate)
   - Instalar agente de monitoreo

Usar roles para organización, vault para secrets, tags para subsets de tasks.
```

**Formato de salida:** Playbook Ansible + roles + inventario + vault + documentación.

**Ejemplo:** `{Servidor web Node.js}`, `{Ubuntu 22.04}`, `{playbook: setup-webserver.yml, roles: common, nodejs, nginx, monitoreo}`

---

## 13. Script de Migración de Cloud / Provider

**[DevOps]**

```
Crea un plan y script de migración desde {cloud_origen} a {cloud_destino}.

Origen: {AWS / Azure / GCP / On-premise}
Destino: {AWS / Azure / GCP / On-premise}
Recursos a migrar:
{lista_de_recursos_con_cantidades}

Fases de migración:

1. **Assessment**:
   - Inventario completo de recursos
   - Dependencias entre servicios
   - Costos actuales vs proyectados
   - Riesgos y plan de contingencia

2. **Preparación**:
   - Crear infraestructura en destino (Terraform)
   - Probar conectividad de red (VPN / Direct Connect / Peering)
   - Configurar DNS para failover
   - Sync inicial de datos (base de datos, almacenamiento)

3. **Migración** (por grupo de recursos):
   - **Base de datos**: replicación continua, cutover en ventana de mantenimiento
   - **Almacenamiento**: S3 sync / rsync / Storage Transfer Service
   - **Cómputo**: AMI/images -> nueva región, ASG + ALB nuevo
   - **DNS**: cambiar TTL a 60s, actualizar registros, esperar propagación

4. **Cutover**:
   - Verificar sync completo
   - Cambiar DNS
   - Monitorear tráfico y errores
   - Rollback plan si errores > threshold

5. **Post-migración**:
   - Descomisionar recursos origen (después de {N} días)
   - Reporte final
   - Optimización de costos en destino
```

**Formato de salida:** Plan de migración + scripts de automatización + rollback plan + timeline.

**Ejemplo:** `{AWS us-east-1 -> AWS eu-west-1}`, `{RDS 5TB, S3 20TB, EC2 50 instancias, ECS 10 servicios}`

---

## 14. Configuración de VPC / Red

**[DevOps]**

```
Diseña la configuración de red para {entorno} en {cloud_provider}.

Entorno: {producción / staging / multi-region}

Componentes:
1. **VPC**:
   - CIDR: {10.0.0.0/16}
   - Subnets públicas: {N} en diferentes AZs
   - Subnets privadas: {N} en diferentes AZs
   - Subnets de base de datos: {N} en diferentes AZs (aisladas)
   - NAT Gateways: {N} (uno por AZ o compartido)
   - Internet Gateway: sí
   - VPC Endpoints: {S3, DynamoDB, ECR, CloudWatch}

2. **Security**:
   - Security Groups por servicio (principio de mínimo acceso)
   - Network ACLs: stateless rules para subredes
   - Flow logs: a S3 + CloudWatch Logs

3. **Conectividad**:
   - VPN site-to-site: {descripción}
   - Direct Connect: {ancho_de_banda}
   - VPC Peering / Transit Gateway para multi-account
   - PrivateLink para servicios internos

4. **DNS**:
   - Route53 private hosted zone
   - Internal domain: {service.internal}

5. **Políticas**:
   - No subnets públicas para base de datos
   - No 0.0.0.0/0 en subnets privadas (solo NAT)
   - Egress filtering: dominios permitidos
   - Network segmentation por entorno (VPC separadas)
```

**Formato de salida:** Terraform para VPC + diagrama de red + security group matrix + cost estimate.

**Ejemplo:** `{AWS producción}`, `{3 AZs, 6 subnets (2 públicas, 2 privadas, 2 DB), NAT Gateway por AZ}`

---

## 15. Log Management Configuration

**[DevOps]**

```
Configura el sistema de gestión de logs para {sistema/infraestructura}.

Stack: {ELK / Loki + Grafana / Datadog / CloudWatch Logs / Splunk}

Agentes de recolección:
- {Fluentd / Fluent Bit / Logstash / Promtail}
- Configuración: inputs, parsers, filters, outputs
- Multi-line log handling (stack traces, excepciones)
- Buffer y retry policy

Estructura de log (JSON structured):
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "service": "user-service",
  "environment": "production",
  "trace_id": "abc123def456",
  "user_id": "user_789",
  "message": "User profile updated",
  "metadata": {
    "duration_ms": 45,
    "changed_fields": ["email", "name"],
    "source_ip": "192.168.1.1"
  }
}
```

Pipeline:
1. **Collect**: sidecar container / daemonset / agent
2. **Parse**: JSON / regex / grok
3. **Filter**: redact sensitive data (PII, tokens, passwords)
4. **Transform**: enrich, rename fields, add metadata
5. **Route**: different indices per service/environment
6. **Store**: retention policy {N} días para hot, {M} para warm, {K} para cold
7. **Alert**: based on log patterns (error rate, keywords)

Visualización: dashboards por servicio, nivel de log, tendencias.
```

**Formato de salida:** Configuración completa del pipeline de logs + parsers + dashboards + retention policies.

**Ejemplo:** `{Kubernetes cluster}`, `{Fluent Bit -> Loki -> Grafana}`, `{20 servicios, retención 7d hot 30d cold}`

---

## 16. Estrategia de Disaster Recovery

**[DevOps]**

```
Diseña un plan de Disaster Recovery para {sistema/aplicación}.

RPO objetivo: {X} minutos (pérdida máxima de datos aceptable)
RTO objetivo: {X} minutos (tiempo máximo de recuperación)

Componentes del sistema:
- {app_server}: {cantidad/descripción}
- {base_datos}: {tamaño, replicación}
- {almacenamiento}: {volumen_de_datos}
- {cache}: {redis_cluster}
- {colas}: {rabbitmq / sqs}
- {CDN / DNS}

Estrategias por componente:

1. **Base de datos**:
   - Replicación cross-region: síncrona/asíncrona
   - Automated backups: cada {X} horas, retención {N} días
   - Point-in-time recovery: ventana {N} días
   - Read replicas en región secundaria

2. **Aplicación**:
   - Multi-AZ deployment
   - Active-Passive cross-region (warm standby)
   - Active-Active (multi-region) si la app lo soporta
   - Auto-scaling en failover

3. **Almacenamiento**:
   - S3 cross-region replication
   - Glacier para backups de largo plazo
   - Versionado habilitado

4. **DR Plan**:
   - Runbook de failover: pasos exactos, comandos, screenshots
   - Runbook de failback: cómo volver a región primaria
   - DR test: schedule trimestral
   - Comunicación: stakeholders, usuarios, soporte
   - Post-DR: validación de datos, reconciliación
```

**Formato de salida:** Plan DR completo + runbooks + scripts de failover/failback + schedule de pruebas.

**Ejemplo:** `{SaaS de pagos}`, `{RPO: 5 min, RTO: 15 min}`, `{AWS us-east-1 -> us-west-2, Multi-AZ RDS, S3 CRR}`

---

## 17. Script de Rotación de Secrets

**[DevOps]**

```
Crea un script de rotación automática de secrets para {sistema}.

Secrets a rotar:
{lista_de_secrets_y_dónde_se_usan}

Frecuencia: {cada_X_días / on-demand}
Herramienta: {Vault / AWS Secrets Manager / Azure Key Vault / SOPS + git}

Proceso de rotación:

1. **Generar nuevo secret**:
   - Longitud: {X} caracteres (mínimo {Y})
   - Complejidad: mayúsculas, minúsculas, números, símbolos
   - Formato: base64url / alfanumérico / hex
   - Entropía: > {X} bits

2. **Actualizar almacenamiento**:
   - Crear nueva versión en Secrets Manager
   - Mantener versión anterior (para rollback)
   - Etiquetar versión: `previous`, `current`, `pending`

3. **Actualizar aplicaciones**:
   - Reinicio gradual de pods/servicios
   - Verificar que usan nuevo secret
   - Grace period: mantener old secret {X} minutos

4. **Rollback** (si algo falla):
   - Revertir a versión anterior
   - Reiniciar servicios
   - Notificar al equipo

5. **Auditoría**:
   - Log de cada rotación (quién, cuándo, qué secret)
   - Alerta si rotación falla
   - Compliance: asegurar rotación periódica

Notificar Slack al completar o fallar.
```

**Formato de salida:** Script de rotación + configuración + documentación de emergency rollback.

**Ejemplo:** `{JWT secret, DB password, API keys de 3 proveedores}`, `{AWS Secrets Manager}`, `{rotación cada 90 días}`

---

## 18. Configuración de Service Mesh

**[DevOps]**

```
Configura un service mesh para {aplicación} usando {mesh_provider}.

Provider: {Istio / Linkerd / Consul Connect / Kuma}

Requisitos:
1. **Instalación**: {istioctl / helm / operator} version {X}
2. **Sidecar injection**: namespace selector, revision-based

3. **Traffic management**:
   - VirtualService: routing rules, header-based, weight-based
   - DestinationRule: subsets, load balancer, circuit breaker, connection pool
   - Gateway: ingress/egress, TLS termination
   - ServiceEntry: external services

4. **Observabilidad**:
   - Métricas: Prometheus (istio metrics)
   - Tracing: Jaeger / Zipkin (100% sampling para troubleshooting)
   - Access logs: structured JSON, enriquecidos con metadata
   - Dashboards: Grafana (service graph, traffic, error rate, latency)

5. **Seguridad**:
   - mTLS: STRICT mode entre servicios
   - PeerAuthentication: mesh-level + namespace-level
   - RequestAuthentication: JWT validation a nivel mesh
   - AuthorizationPolicy: RBAC por namespace, servicio, método, path
   - SPIFFE identities para cada workload

6. **Resiliencia**:
   - Retries: {2} intentos, timeout por intento {X}s
   - Circuit breaker: consecutive errors {X}, ejection time {X}s
   - Timeouts: por ruta
   - Fault injection: para testing (delay, abort)
```

**Formato de salida:** Configuración completa del mesh + policies + dashboards + tests de resiliencia.

**Ejemplo:** `{Microservicios en K8s}`, `{Istio 1.22}`, `{mTLS STRICT, 15 servicios, retry + circuit breaker + canary deployments}`

---

## 19. Performance Benchmarking Script

**[DevOps]**

```
Crea un script de benchmarking de rendimiento para {sistema}.

Tipo de benchmark:
- {HTTP API: throughput y latencia}
- {Base de datos: queries concurrentes}
- {Procesamiento batch: items/segundo}
- {File I/O: read/write speed}

Herramientas: {k6 / hey / wrk / ab / sysbench / fio}

Script debe:
1. **Setup**: preparar datos de prueba, warm up cache
2. **Ejecución**:
   - {Escenario 1}: {X} conexiones concurrentes, {Y} segundos
   - {Escenario 2}: {X} conexiones, {Y} segundos
   - {Escenario 3}: ramp-up de {X} a {Y} conexiones en {Z} segundos

3. **Métricas recolectadas**:
   - Latency: min, avg, max, p50, p75, p90, p95, p99
   - Throughput: requests/segundo
   - Error rate: %
   - Tiempo de conexión, TTFB, tiempo de transferencia

4. **Reporte**:
   - Tabla comparativa entre escenarios
   - Historial (guardar resultados anteriores)
   - Comparación con baseline
   - Recomendaciones de optimización
   - Límites identificados (CPU-bound, IO-bound, network-bound)

5. **Cleanup**: eliminar datos de prueba, restaurar estado

Resultado en JSON para CI y en markdown para PR comment.
```

**Formato de salida:** Script de benchmark + scripts de análisis + dashboard + comparativa histórica.

**Ejemplo:** `{API REST GET /api/products}`, `{k6}`, `{escenarios: 50 conn/30s, 200 conn/60s, ramp 10-500 conn/120s}`

---

## 20. Autoscaling Configuration

**[DevOps]**

```
Configura autoscaling para {aplicación} en {entorno}.

Tipo: {K8s HPA / AWS ASG / Azure VMSS / KEDA}

Métricas de autoscaling:
1. **CPU**: target {X}% utilization
2. **Memory**: target {X}% utilization
3. **Custom metrics**:
   - {RPS: target X requests/second/pod}
   - {Queue depth: target X messages/worker}
   - {Concurrent connections: target X}
   - {Latency: scale up if p95 > Xms}

Configuración:
- Mínimo: {X} réplicas
- Máximo: {X} réplicas
- Scale up: cooldown {X} segundos, evaluación cada {X} segundos
- Scale down: cooldown {X} segundos, estabilización {X} minutos
- Scale up policy: {X} unidades adicionales cada {Y} segundos
- Scale down policy: máximo {X}% reducción cada {Y} segundos
- Comportamiento: prioritario (scale up rápido, scale down lento)

Pruebas:
- Test de escalado: subir carga gradualmente, verificar scale up
- Test de desescalado: bajar carga, verificar scale down
- Test de pico repentino: verificar respuesta rápida
- Test de estabilidad: carga fluctuante, verificar estabilidad

Alertas:
- HPA at max replicas: notificar
- Scale up frecuente: revisar configuración
- Scale down fallido: pods stuck
```

**Formato de salida:** Configuración HPA/ASG + pruebas de escalado + dashboards + alertas.

**Ejemplo:** `{API Gateway}`, `{K8s HPA + KEDA}`, `{métricas: CPU 70%, RPS 1000/pod, escala 2-20 réplicas}`

---

## 21. Script de Post-Deploy Verification

**[DevOps]**

```
Crea un script de verificación post-deploy para {aplicación}.

Entorno: {staging / canary / producción}
Versión desplegada: {vX.Y.Z}

Verificaciones automáticas:

1. **HTTP Checks**:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" {url}  # Espera 200
   ```

2. **Health endpoint**: {GET /health}
   ```json
   { "status": "healthy", "version": "{vX.Y.Z}" }
   ```

3. **API Smoke Tests**:
   - {GET /api/status}: esperar 200 + versión correcta
   - {POST /api/auth/login}: esperar token
   - {GET /api/critical-resource}: esperar datos

4. **Database migration check**:
   - Versión de migración actual: {esperada}
   - Conteo de registros en tablas críticas: {rango_esperado}
   - Consulta de humo: SELECT 1

5. **Metrics verification**:
   - Error rate en últimos {X} min: < {Y}%
   - p95 latency: < {X}ms
   - Active connections: dentro de rango

6. **Background jobs**:
   - Workers están conectados
   - Queue depth normal
   - Último job ejecutado exitosamente

7. **External integrations**:
   - {API_externa}: responde correctamente
   - {Webhook}: callback recibido

8. **Rollback decision**:
   - Si algún check crítico falla: trigger rollback automático
   - Si checks no críticos fallan: alertar pero no rollback

Email/Slack report con resumen: ✅ o ❌ por cada check.
```

**Formato de salida:** Script de verificación + informe de resultados + integración CI/CD.

**Ejemplo:** `{API REST}`, `{Node.js + PostgreSQL}`, `{checks: health, auth, DB migration, error rate, latency, cache, queue}`

---

## 22. Cost Optimization Analysis

**[DevOps]**

```
Analiza y optimiza los costos de infraestructura para {proyecto/entorno}.

Cloud provider: {AWS / Azure / GCP / Multi-cloud}
Período de análisis: {últimos 3 meses}
Gasto mensual actual: ${X}

Categorías de análisis:

1. **Compute** ({X}% del gasto):
   - Instancias reservadas vs on-demand: {ahorro_potencial}
   - Spot instances: workloads compatibles ({workers, batch, stateless})
   - Right-sizing: instancias sobre-provisionadas
   - Auto-scaling: fuera de horas pico
   - Savings Plans: compute, EC2 instance

2. **Storage** ({X}% del gasto):
   - Lifecycle policies: mover datos fríos a tiers más baratos
   - Snapshots antiguos: eliminar no referenciados
   - S3 Intelligent-Tiering: para datos de acceso impredecible
   - EBS gp3 vs io1/io2: solo usar IOPS provisionadas si necesario
   - Delete unused volumes, old EBS snapshots

3. **Data Transfer** ({X}% del gasto):
   - CloudFront / CDN: reducir transferencia directa
   - NAT Gateway: usar VPC endpoints para AWS services
   - Cross-region traffic: consolidar en misma región
   - Compresión: habilitar gzip

4. **Database** ({X}% del gasto):
   - Right-sizing RDS instances
   - Read replicas solo si necesarias
   - Reserved instances para DB primaria
   - Aurora Serverless para cargas variables
   - Delete old manual snapshots

Recomendaciones priorizadas por impacto/effort.
```

**Formato de salida:** Reporte de costos + recomendaciones priorizadas + scripts de optimización + tracking mensual.

**Ejemplo:** `{AWS producción}`, `{$15,000/mes}`, `{ahorro estimado: 35% ($5,250/mes) con Savings Plans + spot + right-sizing}`
