# Plataforma de Apoyo Estudiantil Anónima

Prototipo local navegable creado para una presentación y proceso de validación de Design Thinking. Simula una plataforma universitaria de apoyo emocional y académico que permite explorar recursos, compartir experiencias y reconocer canales de ayuda sin exponer públicamente la identidad del estudiante.

## Cómo abrirlo

1. Descarga o conserva juntos los archivos `index.html`, `styles.css` y `script.js`.
2. Abre `index.html` con doble clic o arrástralo a un navegador moderno.
3. No requiere instalación, servidor, conexión a internet ni dependencias externas.
4. Las respuestas del prototipo se guardan localmente en el navegador mediante `localStorage`.
5. Si se configura Google Apps Script, las respuestas también pueden llegar automáticamente a Google Sheets.

## Cómo conectarlo a Google Sheets

1. Crea una Google Sheet nueva.
2. En la hoja, entra a **Extensiones > Apps Script**.
3. Borra el contenido inicial del editor y pega todo el contenido de `google-apps-script.gs`.
4. Guarda el proyecto.
5. Ve a **Implementar > Nueva implementación**.
6. En tipo de implementación, elige **Aplicación web**.
7. Configura:
   - **Ejecutar como:** tú mismo.
   - **Quién tiene acceso:** cualquier usuario.
8. Autoriza los permisos que te pida Google.
9. Copia la URL que termina en `/exec`.
10. En `script.js`, pega esa URL en esta línea:

```js
const GOOGLE_SHEETS_WEB_APP_URL = "";
```

Debe quedar así:

```js
const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/TU_URL/exec";
```

11. Guarda, sube el cambio a GitHub y prueba enviando una respuesta desde el sitio publicado.

El script crea automáticamente estas pestañas en la hoja: `Feedback`, `Desahogos`, `Consultas` y `Apoyos`.

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

Este proyecto **no es una aplicación final**. No tiene backend propio, autenticación ni contactos institucionales reales. Las publicaciones, consultas, respuestas de apoyo y el feedback se guardan en el navegador de cada persona usando `localStorage`; si se configura Google Apps Script, también se envían a una Google Sheet central.

Para recopilar respuestas de varias personas sin pedirles archivos CSV, configura la integración de Google Sheets. Si se necesita una app más robusta, con autenticación, permisos, moderación y panel administrativo, el siguiente paso sería conectar Firebase, Supabase u otro backend.

En una implementación real, cada universidad deberá definir sus políticas de privacidad, moderación, seguridad de datos, protocolos de crisis y datos oficiales de contacto.
