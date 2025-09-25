# Intelnexo Chat Widget CDN

Widget flotante para chat con IA que se puede incluir en cualquier página web.

## 🚀 Uso

### Básico

```html
<script
  src="https://tu-dominio.vercel.app/widgets/chat.js"
  data-agent-id="agent-123"
  data-primary-color="#2c3e50"
></script>
```

### Con colores personalizados

```html
<script
  src="https://tu-dominio.vercel.app/widgets/chat.js"
  data-agent-id="agent-123"
  data-primary-color="#2c3e50"
  data-user-message-color="#2c3e50"
  data-agent-message-color="#f8f9fa"
  data-header-color="#2c3e50"
  data-send-button-color="#2c3e50"
  data-input-border-color="#2c3e50"
  data-input-focus-color="#2c3e50"
  data-button-color="#2c3e50"
></script>
```

## 🎨 Colores disponibles

- `data-primary-color` - Color principal
- `data-secondary-color` - Color secundario
- `data-user-message-color` - Color mensajes usuario
- `data-agent-message-color` - Color mensajes agente
- `data-header-color` - Color del header
- `data-send-button-color` - Color botón enviar
- `data-input-border-color` - Color borde input
- `data-input-focus-color` - Color focus input
- `data-button-color` - Color botón flotante
- `data-button-text-color` - Color texto botón
- `data-button-shadow-color` - Color sombra botón

## 📦 Deployment

Este widget está deployado en Vercel y se puede usar desde cualquier sitio web.

## 🔧 Configuración

El widget se auto-inicializa cuando detecta atributos `data-` en el script.
