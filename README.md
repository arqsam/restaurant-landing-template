# Restaurant landing template

Plantilla de landing page para pastelerías, restaurantes y servicios de catering, hecha con **React + TypeScript + Vite**. Todo el contenido (marca, menú, horarios, pedidos) se cambia editando un único archivo tipado: `src/content/site.ts`.

La configuración de ejemplo es **Mallow & Crumb**, una marca ficticia. Sus datos, dirección, teléfono y reseñas son de muestra.

> Proyecto de portafolio desarrollado con Spec-Driven Development. Estado: en construcción (ver el tablero de Issues).

## Requisitos

- **Node.js 24 LTS** (recomendado; mínimo 22.13). Con `nvm`: `nvm use` lee la versión de `.nvmrc`.
- npm (incluido con Node).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala las dependencias |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Revisión de tipos (`tsc -b`) y build de producción |
| `npm run lint` | ESLint |
| `npm test` | Pruebas con Vitest (una sola ejecución) |
| `npm run test:watch` | Pruebas en modo observación |

## Documentación

- [PRD](docs/01-prd.md)
- [Especificación técnica](docs/02-technical-spec.md)
- [Reporte de aceptación](docs/03-acceptance-report.md)
- [Issues planeados](docs/issues.md)
- Decisiones: [ADR](docs/adr/)

## Licencia

Ver [LICENSE](LICENSE).
