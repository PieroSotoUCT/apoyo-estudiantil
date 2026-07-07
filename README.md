# Plataforma de Apoyo Estudiantil Anónima

Prototipo local navegable creado para una presentación y proceso de validación de Design Thinking. Simula una plataforma universitaria de apoyo emocional y académico que permite explorar recursos, compartir experiencias y reconocer canales de ayuda sin exponer públicamente la identidad del estudiante.

## Cómo abrirlo

1. Descarga o conserva juntos los archivos `index.html`, `styles.css` y `script.js`.
2. Abre `index.html` con doble clic o arrástralo a un navegador moderno.
3. No requiere instalación, servidor, conexión a internet ni dependencias externas.
4. Las respuestas del prototipo se guardan localmente en el navegador mediante `localStorage`.

## Qué se puede testear con usuarios

- Si el propósito de la plataforma se entiende desde la pantalla inicial.
- Si el acceso anónimo transmite confianza y cómo se interpreta su explicación.
- Qué necesidad elige primero cada estudiante.
- La publicación simulada en el muro con alias automático.
- La consulta académica anónima y sus respuestas sugeridas.
- Los mensajes de apoyo entre pares y las reglas de comunidad.
- La apertura de recursos breves en ventanas informativas.
- La comprensión de los canales de derivación institucional.
- La preferencia entre la vista web y la vista dentro de un celular.
- Las respuestas de la sección final “Ayúdanos a mejorar el prototipo” y su descarga en CSV.

## Alcance

Este proyecto **no es una aplicación final**. No tiene backend, autenticación, base de datos remota, envío de mensajes ni contactos institucionales reales. Las publicaciones, consultas, respuestas de apoyo y el feedback se guardan únicamente en el navegador de cada persona usando `localStorage`; no se envían a un servidor central.

Para recopilar respuestas de varias personas, cada participante puede descargar su CSV desde la sección “Respuestas guardadas” y compartirlo manualmente. Si se necesita que todo llegue automáticamente a una base de datos común, el siguiente paso sería conectar Firebase, Supabase, Google Forms u otro backend.

En una implementación real, cada universidad deberá definir sus políticas de privacidad, moderación, seguridad de datos, protocolos de crisis y datos oficiales de contacto.
