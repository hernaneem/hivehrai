# Guía de Contribución para Hive HR AI

¡Gracias por tu interés en contribuir al proyecto Hive HR AI! Esta guía te ayudará a entender cómo puedes colaborar de manera efectiva.

## Estructura del Proyecto

Antes de comenzar, familiarízate con la estructura del proyecto:

- `sitio web/`: Contiene el sitio web estático principal de Hive HR AI
- `RecruitAgent/recruitment-ai/`: Contiene la aplicación React/TypeScript para el agente de reclutamiento

## Proceso de Contribución

1. **Fork del Repositorio**: Crea un fork del repositorio en tu cuenta de GitHub.

2. **Clona el Repositorio**: Clona tu fork a tu máquina local.
   ```bash
   git clone https://github.com/tu-usuario/HR_Hub.git
   cd HR_Hub
   ```

3. **Crea una Rama**: Crea una rama para tu contribución.
   ```bash
   git checkout -b feature/nombre-de-tu-caracteristica
   ```

4. **Realiza tus Cambios**: Implementa tus cambios siguiendo las convenciones de código del proyecto.

5. **Prueba tus Cambios**: Asegúrate de que tus cambios funcionen correctamente.
   - Para el sitio web estático, prueba localmente usando un servidor web.
   - Para la aplicación RecruitBot, ejecuta las pruebas incluidas.

6. **Commit y Push**: Haz commit de tus cambios y súbelos a tu fork.
   ```bash
   git add .
   git commit -m "Descripción clara de los cambios"
   git push origin feature/nombre-de-tu-caracteristica
   ```

7. **Crea un Pull Request**: Abre un Pull Request desde tu rama a la rama principal del repositorio original.

## Convenciones de Código

### Sitio Web Estático
- Utiliza HTML5 semántico
- Mantén el CSS organizado y siguiendo la estructura existente
- Comenta el código JavaScript cuando sea necesario
- Asegúrate de que el diseño sea responsive

### Aplicación RecruitBot
- Sigue las convenciones de React y TypeScript
- Utiliza componentes funcionales y hooks
- Mantén la lógica de negocio separada de la UI
- Escribe pruebas para nuevas funcionalidades

## Reportar Problemas

Si encuentras un bug o tienes una sugerencia:

1. Revisa primero si el problema ya ha sido reportado
2. Utiliza la plantilla de issues para reportar bugs o solicitar nuevas características
3. Proporciona toda la información necesaria para reproducir el problema

## Proceso de Revisión

Una vez que hayas enviado tu Pull Request:

1. Los mantenedores revisarán tu código
2. Es posible que se soliciten cambios o mejoras
3. Una vez aprobado, tu código será fusionado con la rama principal

## Licencia

Al contribuir a este proyecto, aceptas que tus contribuciones estarán bajo la misma licencia que el proyecto.

¡Gracias por contribuir a Hive HR AI!
