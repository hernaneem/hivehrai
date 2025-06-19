# Hive HR AI - Plataforma de Agentes de IA para Recursos Humanos

Este repositorio contiene el código fuente para Hive HR AI, una plataforma que ofrece agentes de inteligencia artificial especializados en diferentes procesos de recursos humanos.

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
/
├── sitio web/                # Sitio web principal de Hive HR AI
│   ├── images/               # Imágenes y recursos gráficos
│   ├── index.html            # Página de inicio
│   ├── styles.css            # Estilos globales
│   ├── script.js             # JavaScript global
│   ├── agent-pages.css       # Estilos para páginas de agentes
│   ├── agent-script.js       # JavaScript para páginas de agentes
│   ├── recruit.html          # Página del agente RecruitBot
│   ├── payroll.html          # Página del agente PayrollPro
│   ├── legal.html            # Página del agente LegalMind
│   ├── hrflow.html           # Página del agente HRFlow
│   └── mindwell.html         # Página del agente MindWell
│
└── RecruitAgent/             # Aplicación de RecruitBot
    └── recruitment-ai/       # Aplicación React/TypeScript para RecruitBot
        ├── src/              # Código fuente de la aplicación
        ├── public/           # Archivos públicos
        ├── package.json      # Dependencias y scripts
        └── ...               # Otros archivos de configuración
```

## Sitio Web Principal

El sitio web principal (`sitio web/`) es una landing page estática que presenta los diferentes agentes de IA de Hive HR AI. Cada agente tiene su propia página detallada.

### Agentes Disponibles

- **RecruitBot**: Agente de IA para reclutamiento y selección de personal
- **PayrollPro**: Agente de IA para gestión de nómina
- **LegalMind**: Agente de IA especializado en normativa laboral mexicana
- **HRFlow**: Agente de IA para automatización de procesos de RH
- **MindWell**: Agente de IA para bienestar psicológico y salud mental

## Aplicación RecruitBot

La aplicación RecruitBot (`RecruitAgent/recruitment-ai/`) es una aplicación React/TypeScript que proporciona la funcionalidad completa del agente de reclutamiento. Esta aplicación está desplegada en Vercel y se integra con el sitio web principal.

### Características de RecruitBot

- Análisis de CV con IA
- Evaluaciones psicométricas (Cleaver, MOSS, Terman-Merrill, Raven)
- Dashboard para gestión de candidatos
- Autenticación de usuarios

## Integración entre Sitio Web y Aplicación

La página `recruit.html` del sitio web principal incluye enlaces a la aplicación RecruitBot desplegada en Vercel. Los usuarios pueden navegar desde la landing page hasta la aplicación completa para utilizar todas las funcionalidades del agente de reclutamiento.

## Desarrollo Local

### Sitio Web Principal

Para ejecutar el sitio web principal localmente:

```bash
cd "sitio web"
python -m http.server 8000
```

Luego visita `http://localhost:8000` en tu navegador.

### Aplicación RecruitBot

Para ejecutar la aplicación RecruitBot localmente:

```bash
cd RecruitAgent/recruitment-ai
npm install
npm run dev
```

Luego visita `http://localhost:5173` en tu navegador.

## Despliegue

- **Sitio Web Principal**: Puede desplegarse en cualquier servidor web estático.
- **Aplicación RecruitBot**: Ya está desplegada en Vercel.

## Tecnologías Utilizadas

### Sitio Web Principal
- HTML5
- CSS3
- JavaScript
- Diseño responsivo

### Aplicación RecruitBot
- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase (autenticación y base de datos)
