# 📸 Instrucciones para Capturas de Pantalla

Para completar el README, necesitas tomar las siguientes capturas de pantalla del juego:

## 🎯 Capturas Requeridas

### 1. `logo.png` (Opcional)
- **Descripción**: Logo del juego o banner principal
- **Dimensiones recomendadas**: 800x200px
- **Contenido**: Título "Flappy Bird" con el pájaro

### 2. `idle-screen.png`
- **Descripción**: Pantalla de inicio del juego
- **Cómo obtenerla**: 
  1. Abre el juego en http://localhost:8080
  2. Espera a que cargue la pantalla inicial
  3. Toma captura de pantalla (Cmd+Shift+4 en Mac)
- **Debe mostrar**:
  - Título "FLAPPY BIRD"
  - Récord actual
  - Selector de dificultad (EASY/NORMAL/HARD)
  - Toggle de modo oscuro
  - Botón de ajustes
  - Instrucción "Presiona ESPACIO para empezar"

### 3. `gameplay.png`
- **Descripción**: Juego en acción
- **Cómo obtenerla**:
  1. Presiona ESPACIO para iniciar el juego
  2. Juega unos segundos hasta tener algunas tuberías en pantalla
  3. Toma captura mientras el pájaro está en el aire
- **Debe mostrar**:
  - Pájaro volando
  - Varias tuberías verdes
  - Puntuación en la parte superior
  - Botón de pausa (esquina superior derecha)
  - Fondo con nubes y parallax

### 4. `gameover-screen.png`
- **Descripción**: Pantalla de Game Over
- **Cómo obtenerla**:
  1. Juega hasta chocar con una tubería o el suelo
  2. Espera a que aparezca la pantalla de Game Over
  3. Toma captura
- **Debe mostrar**:
  - Texto "GAME OVER" en rojo
  - Puntuación final
  - Récord (con "¡Nuevo récord!" si aplica)
  - Botones "Reiniciar" y "Menú"
  - Fondo semi-transparente

### 5. `settings-screen.png`
- **Descripción**: Pantalla de configuración
- **Cómo obtenerla**:
  1. Desde la pantalla inicial, haz clic en "⚙ Ajustes"
  2. Toma captura
- **Debe mostrar**:
  - Título "AJUSTES"
  - Slider de volumen
  - Selector de dificultad
  - Toggle de modo oscuro
  - Botón "Reiniciar récord"
  - Botón "Cerrar"

### 6. `dark-mode.png`
- **Descripción**: Juego en modo oscuro
- **Cómo obtenerla**:
  1. Activa el modo oscuro desde la pantalla inicial o ajustes
  2. Inicia el juego
  3. Toma captura durante el gameplay
- **Debe mostrar**:
  - Fondo oscuro (cielo nocturno)
  - Pájaro y tuberías con buen contraste
  - UI adaptada al modo oscuro

## 🛠️ Herramientas Recomendadas

### macOS
- **Captura de pantalla**: `Cmd + Shift + 4` (seleccionar área)
- **Captura de ventana**: `Cmd + Shift + 4` + `Espacio` (clic en ventana)

### Windows
- **Recortes**: `Win + Shift + S`
- **Herramienta de recortes**: Buscar "Recortes" en el menú inicio

### Linux
- **GNOME**: `Shift + PrtScn`
- **KDE**: `Spectacle`

## 📐 Especificaciones Técnicas

- **Formato**: PNG (preferido) o JPG
- **Resolución mínima**: 1280x720px
- **Relación de aspecto**: Mantener la original del juego
- **Calidad**: Alta (sin compresión excesiva)
- **Nombres de archivo**: Exactamente como se indica arriba

## ✅ Checklist

Después de tomar las capturas, verifica:

- [ ] Todas las imágenes están en la carpeta `screenshots/`
- [ ] Los nombres de archivo coinciden exactamente con los del README
- [ ] Las imágenes tienen buena resolución y claridad
- [ ] No hay información personal visible
- [ ] Las capturas muestran el juego funcionando correctamente
- [ ] El modo oscuro se ve claramente diferente del modo claro

## 🎨 Consejos para Mejores Capturas

1. **Limpia el navegador**: Oculta barras de herramientas y extensiones
2. **Usa modo pantalla completa**: F11 en la mayoría de navegadores
3. **Buena iluminación**: Asegúrate de que los colores se vean bien
4. **Momento adecuado**: Captura en momentos interesantes del juego
5. **Consistencia**: Usa el mismo navegador y resolución para todas

## 🔄 Actualizar el README

Una vez que tengas todas las capturas:

1. Coloca todas las imágenes en la carpeta `screenshots/`
2. Verifica que los nombres coincidan con los del README.md
3. Abre el README.md en un visor de Markdown para verificar que las imágenes se muestren correctamente
4. Si usas GitHub, las imágenes se mostrarán automáticamente

---

**¿Necesitas ayuda?** Revisa que el servidor esté corriendo en http://localhost:8080
