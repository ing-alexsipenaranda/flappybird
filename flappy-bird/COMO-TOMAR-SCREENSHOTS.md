# 📸 Guía Rápida: Cómo Tomar Screenshots para el README

## 🚀 Inicio Rápido

### 1. Asegúrate de que el juego esté corriendo

```bash
cd /Users/ingalexsi/FLAPPYBIRD/flappy-bird
python3 -m http.server 8080
```

Abre en tu navegador: **http://localhost:8080**

### 2. Prepara tu navegador

- Presiona **F11** para pantalla completa (oculta barras)
- O usa el modo "Responsive Design" (Cmd+Opt+M en Mac, F12 → Toggle device toolbar)
- Ajusta el tamaño de ventana a **1280x720px** para consistencia

### 3. Toma las 6 capturas necesarias

#### Screenshot 1: `idle-screen.png`
1. Carga el juego
2. Espera en la pantalla inicial
3. **Captura**: Cmd+Shift+4 (Mac) o Win+Shift+S (Windows)
4. Guarda como `screenshots/idle-screen.png`

#### Screenshot 2: `gameplay.png`
1. Presiona ESPACIO para jugar
2. Juega hasta tener 2-3 tuberías en pantalla
3. **Captura** mientras el pájaro está volando
4. Guarda como `screenshots/gameplay.png`

#### Screenshot 3: `gameover-screen.png`
1. Choca con una tubería
2. Espera la pantalla de Game Over
3. **Captura**
4. Guarda como `screenshots/gameover-screen.png`

#### Screenshot 4: `settings-screen.png`
1. Vuelve al menú principal
2. Haz clic en "⚙ Ajustes"
3. **Captura**
4. Guarda como `screenshots/settings-screen.png`

#### Screenshot 5: `dark-mode.png`
1. En ajustes, activa el modo oscuro
2. Vuelve al juego y juega un poco
3. **Captura** durante el gameplay
4. Guarda como `screenshots/dark-mode.png`

#### Screenshot 6 (Opcional): `logo.png`
1. Captura solo el título "FLAPPY BIRD" de la pantalla inicial
2. O crea un logo personalizado
3. Guarda como `screenshots/logo.png`

## 🎯 Atajos de Teclado

### macOS
- **Captura de área**: `Cmd + Shift + 4`
- **Captura de ventana**: `Cmd + Shift + 4` + `Espacio`
- **Captura completa**: `Cmd + Shift + 3`

### Windows
- **Recortes**: `Win + Shift + S`
- **Captura completa**: `PrtScn`

### Linux
- **GNOME**: `Shift + PrtScn`
- **Captura de área**: `Shift + PrtScn` + seleccionar

## ✅ Verificación Rápida

Después de tomar las capturas:

```bash
# Verifica que todas las imágenes existan
ls -lh screenshots/*.png

# Deberías ver:
# idle-screen.png
# gameplay.png
# gameover-screen.png
# settings-screen.png
# dark-mode.png
# logo.png (opcional)
```

## 🎨 Optimización (Opcional pero Recomendado)

### Opción Rápida: TinyPNG
1. Ve a https://tinypng.com/
2. Arrastra todas tus imágenes
3. Descarga las optimizadas
4. Reemplaza las originales

### Opción CLI (Mac):
```bash
# Instalar ImageOptim
brew install imageoptim

# Optimizar
imageoptim screenshots/*.png
```

## 📝 Checklist Final

- [ ] 5-6 imágenes en `screenshots/`
- [ ] Nombres de archivo correctos (sin espacios, minúsculas)
- [ ] Formato PNG
- [ ] Resolución mínima 1280x720px
- [ ] Imágenes optimizadas (< 200 KB cada una)
- [ ] Se ven bien en el README

## 🔍 Previsualizar el README

```bash
# Si tienes VS Code
code README.md

# O abre en GitHub después de hacer commit
git add .
git commit -m "Add screenshots"
git push
```

## 🆘 Problemas Comunes

### "El juego no carga"
- Verifica que el servidor esté corriendo en puerto 8080
- Abre la consola del navegador (F12) para ver errores

### "Las imágenes no se ven en el README"
- Verifica que los nombres de archivo coincidan exactamente
- Asegúrate de que las imágenes estén en `screenshots/`
- Revisa que la ruta en el README sea correcta

### "Las imágenes son muy pesadas"
- Usa TinyPNG para optimizarlas
- Reduce la resolución si es necesario
- Convierte a PNG si están en otro formato

---

## 🎉 ¡Listo!

Una vez que tengas todas las capturas:

1. Colócalas en `screenshots/`
2. Verifica que el README se vea bien
3. Haz commit y push
4. ¡Tu README profesional está completo!

**Tiempo estimado**: 5-10 minutos para todas las capturas.
