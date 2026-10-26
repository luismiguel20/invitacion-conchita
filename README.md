# Invitación Conchita

Invitación web para la celebración de Conchita.

- **Fecha:** domingo 22 de noviembre de 2026
- **Hora:** 1:00 PM
- **Lugar:** Salón Campestre Los Fresnos
- **Diseño:** mobile-first
- **Hosting previsto:** GitHub Pages

## Confirmación de asistencia

### Invitación genérica
Si la URL no contiene `?i=`, al pulsar **Confirmar asistencia** se solicita el nombre de la persona o familia y después se abre WhatsApp con un mensaje identificado.

### Invitación personalizada
Si la URL contiene un parámetro `?i=` válido en Base64URL, la invitación muestra el destinatario y el número de lugares reservados. Al confirmar, solo permite seleccionar entre 1 y el máximo asignado.

Ejemplo de payload antes de codificar:

```json
{
  "v": 1,
  "p": "Familia Hernández",
  "n": 4
}
```

## Desarrollo local
Puedes abrir `index.html` directamente o utilizar Live Server en VS Code.

## GitHub Pages
Mantén `index.html` en la raíz del repositorio y activa Pages desde la rama `main`.
