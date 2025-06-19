# Configuración del Proyecto Hive HR AI

Este documento proporciona instrucciones detalladas para configurar el proyecto Hive HR AI tanto para desarrollo local como para producción.

## Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Cuenta en GitHub
- Cuenta en Vercel (para despliegue)

## Configuración para Desarrollo Local

### 1. Sitio Web Principal

El sitio web principal es un sitio estático HTML/CSS/JS que se puede ejecutar con cualquier servidor web simple.

```bash
# Navegar al directorio del sitio web
cd "sitio web"

# Iniciar un servidor web local (opción 1: Python)
python -m http.server 8000

# Iniciar un servidor web local (opción 2: Node.js)
# Primero instalar http-server si no lo tienes
# npm install -g http-server
# Luego ejecutar
# http-server -p 8000
```

Visita `http://localhost:8000` en tu navegador para ver el sitio web.

### 2. Aplicación RecruitBot

La aplicación RecruitBot es una aplicación React/TypeScript con Vite que requiere configuración adicional.

```bash
# Navegar al directorio de la aplicación
cd RecruitAgent/recruitment-ai

# Instalar dependencias
npm install

# Configurar variables de entorno
# Copia el archivo .env.example a .env.local y edita las variables según sea necesario
cp .env.example .env.local

# Iniciar el servidor de desarrollo
npm run dev
```

Visita `http://localhost:5173` en tu navegador para ver la aplicación RecruitBot.

## Configuración para Producción

### 1. Sitio Web Principal

El sitio web principal puede desplegarse en cualquier servicio de alojamiento web estático como GitHub Pages, Netlify, Vercel, etc.

#### Despliegue en GitHub Pages:

1. Crea un repositorio en GitHub
2. Sube el código al repositorio
3. Configura GitHub Pages para servir desde la rama principal o desde la carpeta `/docs`

#### Despliegue en Netlify/Vercel:

1. Conecta tu repositorio de GitHub a Netlify o Vercel
2. Configura el directorio de publicación como `sitio web`
3. No es necesario un comando de construcción ya que es un sitio estático

### 2. Aplicación RecruitBot

La aplicación RecruitBot ya está desplegada en Vercel. Si necesitas volver a desplegarla o hacer cambios:

1. Asegúrate de tener una cuenta en Vercel y haber conectado tu repositorio de GitHub
2. Configura las variables de entorno necesarias en Vercel
3. Despliega la aplicación usando el comando:

```bash
# Navegar al directorio de la aplicación
cd RecruitAgent/recruitment-ai

# Instalar la CLI de Vercel si no la tienes
npm install -g vercel

# Desplegar a producción
vercel --prod
```

## Integración entre Sitio Web y Aplicación

El sitio web principal y la aplicación RecruitBot están integrados a través de enlaces. La página `recruit.html` del sitio web principal contiene un enlace directo a la aplicación RecruitBot desplegada en Vercel.

Si cambias la URL de despliegue de la aplicación RecruitBot, asegúrate de actualizar el enlace en `recruit.html`.

## Base de Datos y Autenticación

La aplicación RecruitBot utiliza Supabase para la base de datos y autenticación. Asegúrate de configurar correctamente las variables de entorno relacionadas con Supabase en el archivo `.env.local` para desarrollo y en las variables de entorno de Vercel para producción.
