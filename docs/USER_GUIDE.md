# SignalDesk user guide / Guía de usuario

## Purpose / Propósito

SignalDesk is a private CRM and marketing operations workspace for teams that manage several websites, applications, games or services. Its operating goal is to identify which product and channel creates valuable customer opportunities, keep every next action visible and measure whether marketing effort produces business results.

SignalDesk es un CRM privado y un espacio de operaciones de marketing para equipos que administran varios sitios, aplicaciones, videojuegos o servicios. Su objetivo operativo es identificar qué producto y canal genera oportunidades valiosas, mantener visible la próxima acción y medir si el esfuerzo de marketing produce resultados comerciales.

## First-time setup / Configuración inicial

1. Sign in with the workspace account provided by an administrator.
2. Open **Products & goals / Productos y objetivos** and confirm every marketed product exists.
3. Open **Account registry / Registro de cuentas** and review which analytics, advertising and hosting services still require configuration.
4. Open **Leads & pipeline / Prospectos y embudo** and add the first real inquiry.
5. Select each product from the reporting-scope menu and verify that its records remain separated.

The Overview uses the selected product and date range. Its opportunity totals, estimated open-pipeline value, stage funnel and recent inquiries are live CRM data. A zero is a valid result: it means Supabase contains no matching leads in that scope and period. Traffic, advertising cost and monetization remain unavailable until their external connections are activated.

El Resumen utiliza el producto y período seleccionados. Los totales de oportunidades, el valor estimado del embudo abierto, las etapas y las consultas recientes son datos reales del CRM. Un cero es válido: significa que Supabase no contiene prospectos coincidentes en ese alcance y período. El tráfico, costo publicitario y monetización permanecerán pendientes hasta activar sus conexiones externas.

Never paste passwords, verification codes, private API keys, service-role keys or OAuth refresh tokens into an ordinary SignalDesk record. Administrators must configure secrets through the protected hosting environment.

Nunca guardes contraseñas, códigos de verificación, llaves API privadas, llaves de servicio ni tokens OAuth dentro de un registro normal. Los administradores deben configurar secretos mediante el entorno protegido del hosting.

## Daily workflow / Flujo diario

1. **Capture / Registrar:** add every inquiry with contact, company, service, source and estimated USD value.
2. **Qualify / Calificar:** confirm need, authority, budget and timing; move the opportunity to the correct stage.
3. **Follow up / Dar seguimiento:** update the stage after every meaningful conversation so no opportunity is forgotten.
4. **Measure / Medir:** compare products, campaigns and date ranges once live connectors are available.
5. **Decide / Decidir:** review AI evidence, confidence, expected impact and risks; a person approves consequential actions.

## Pipeline stages / Etapas del embudo

- `New inquiry / Nueva consulta`: received but not yet reviewed.
- `Discovery / Descubrimiento`: needs and context are being understood.
- `Qualified / Calificado`: a realistic fit with a defined next step.
- `Proposal / Propuesta`: scope, price or commercial terms were presented.
- `Won / Ganado`: the opportunity became paid work or an approved engagement.
- `Lost / Perdido`: the opportunity will not continue; retain an appropriate reason in a future activity note.

## Products and reporting scopes / Productos y alcances

Each website, app, game or service is a separate product. This prevents ClubGamerZone website traffic, Organify adoption, CV Enhancer acquisition and game monetization from being mixed into misleading totals. **All products / Todos los productos** provides a workspace-wide view.

Only owners and administrators may create or rename products. Product deletion is intentionally not available in this release because existing leads, metrics and integrations may depend on it.

Solo propietarios y administradores pueden crear o renombrar productos. La eliminación no está disponible en esta versión porque prospectos, métricas e integraciones existentes pueden depender del producto.

## Live versus representative data / Datos reales y demostrativos

- A connected/live banner means the module is reading or writing the private Supabase workspace.
- A demo banner means the values are examples and must not be used for business decisions.
- An unavailable banner means a connection, session or permission failed; retry and contact an administrator if it continues.

## Roles / Roles

- `Owner / Propietario`: controls the workspace, product catalog, members and integrations.
- `Admin / Administrador`: manages operations and configuration delegated by the owner.
- `Member / Miembro`: works with authorized CRM records.
- `Viewer / Consulta`: reads authorized reports without changing configuration.

## Product roadmap / Metas del producto

1. Reliable multi-product CRM and workspace isolation.
2. Automatic website-form and AI-assistant lead ingestion.
3. GA4, Google Ads, AdMob, Firebase, Meta and Netlify reporting connections.
4. Deterministic attribution and normalized marketing metrics.
5. AI recommendations with evidence and explicit human approval.
6. Multi-tenant subscription, onboarding, billing and administration suitable for external customers.

## Getting help / Obtener ayuda

Use the in-app **Guide & onboarding / Guía y configuración** page first. For access, data or configuration problems, contact the workspace owner. Include the module name and visible error, but never send a password, secret key or authentication token.
