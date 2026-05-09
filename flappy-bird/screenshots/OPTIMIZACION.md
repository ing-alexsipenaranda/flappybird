# 🎨 Optimización de Imágenes para README

## ¿Por qué optimizar?

Las imágenes optimizadas:
- ✅ Cargan más rápido en GitHub
- ✅ Reducen el tamaño del repositorio
- ✅ Mejoran la experiencia del usuario
- ✅ Mantienen buena calidad visual

## 🛠️ Herramientas de Optimización

### Opción 1: TinyPNG (Online - Recomendado)
1. Ve a https://tinypng.com/
2. Arrastra tus imágenes PNG
3. Descarga las versiones optimizadas
4. **Reducción típica**: 50-70% sin pérdida visible

### Opción 2: ImageOptim (Mac)
```bash
# Instalar con Homebrew
brew install imageoptim

# Optimizar todas las imágenes
imageoptim screenshots/*.png
```

### Opción 3: Squoosh (Online)
1. Ve a https://squoosh.app/
2. Arrastra tu imagen
3. Ajusta la calidad (recomendado: 85-90)
4. Descarga la versión optimizada

### Opción 4: CLI con pngquant
```bash
# Instalar
brew install pngquant

# Optimizar
pngquant --quality=65-80 screenshots/*.png --ext .png --force
```

## 📏 Dimensiones Recomendadas

| Imagen | Ancho Recomendado | Alto Recomendado |
|--------|-------------------|------------------|
| logo.png | 800px | 200px |
| idle-screen.png | 1280px | 720px |
| gameplay.png | 1280px | 720px |
| gameover-screen.png | 1280px | 720px |
| settings-screen.png | 1280px | 720px |
| dark-mode.png | 1280px | 720px |

## 🎯 Objetivos de Tamaño

- **Logo**: < 50 KB
- **Capturas de pantalla**: < 200 KB cada una
- **Total del repositorio**: < 1 MB para todas las imágenes

## 🔧 Script de Optimización Automática

Crea un archivo `optimize-images.sh`:

```bash
#!/bin/bash

echo "🎨 Optimizando imágenes..."

# Verificar que pngquant esté instalado
if ! command -v pngquant &> /dev/null; then
    echo "❌ pngquant no está instalado"
    echo "Instálalo con: brew install pngquant"
    exit 1
fi

# Optimizar todas las imágenes PNG
for img in screenshots/*.png; do
    if [ -f "$img" ]; then
        echo "Optimizando: $img"
        pngquant --quality=65-80 "$img" --ext .png --force
    fi
done

echo "✅ Optimización completada!"
echo ""
echo "📊 Tamaños finales:"
du -h screenshots/*.png
```

Hazlo ejecutable y ejecútalo:
```bash
chmod +x optimize-images.sh
./optimize-images.sh
```

## 📊 Verificar Tamaños

```bash
# Ver tamaño de cada imagen
ls -lh screenshots/*.png

# Ver tamaño total
du -sh screenshots/
```

## ✅ Checklist de Optimización

Antes de hacer commit:

- [ ] Todas las imágenes están en formato PNG
- [ ] Cada imagen es menor a 200 KB
- [ ] Las imágenes mantienen buena calidad visual
- [ ] El tamaño total de screenshots/ es menor a 1 MB
- [ ] Las imágenes se ven bien en el README

## 🎨 Alternativa: Usar Placeholders

Si no quieres incluir imágenes pesadas en el repo, puedes usar placeholders:

```markdown
![Pantalla de Inicio](https://via.placeholder.com/1280x720/70c5ce/ffffff?text=Idle+Screen)
```

O crear SVG placeholders ligeros que se vean profesionales.

## 📝 Notas Adicionales

- **GitHub tiene límite de 100 MB por archivo**
- **Repositorios grandes son más lentos de clonar**
- **Las imágenes optimizadas mejoran el SEO**
- **Considera usar un CDN para imágenes muy grandes**

---

**Recuerda**: La optimización es un balance entre calidad y tamaño. Apunta a imágenes que se vean bien pero sean ligeras.
