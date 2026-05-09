# Requirements Document

## Introduction

Este documento describe los requisitos para un videojuego completo tipo "Flappy Bird" implementado exclusivamente con HTML5, CSS3 y JavaScript ES6+ vanilla (sin frameworks ni librerías externas). El juego utiliza la Canvas API para renderizado, la Web Audio API para sonido procedural, y localStorage para persistencia. El proyecto está estructurado en módulos desacoplados siguiendo principios SOLID, con soporte para escritorio y dispositivos táctiles, modo offline completo y capacidad de exportación como APK.

## Glossary

- **Game**: El sistema principal que orquesta el game loop, los estados del juego y la coordinación entre módulos.
- **Player**: El pájaro controlado por el usuario; entidad con posición, velocidad y animación propias.
- **Pipe**: Obstáculo vertical compuesto por un segmento superior y uno inferior con una brecha entre ellos.
- **PipeManager**: Módulo responsable de generar, actualizar y eliminar tuberías proceduralmente.
- **Physics**: Módulo que aplica gravedad, velocidad y detección de colisiones usando delta time.
- **InputHandler**: Módulo que captura y normaliza eventos de teclado, ratón y táctil.
- **UI**: Módulo que renderiza pantallas (inicio, juego, pausa, game over, configuración) sobre el canvas.
- **AudioManager**: Módulo que genera y reproduce sonidos procedurales usando la Web Audio API.
- **StorageManager**: Módulo que persiste y recupera datos del juego usando localStorage.
- **ParticleSystem**: Módulo que gestiona efectos de partículas visuales.
- **Background**: Módulo que renderiza el fondo con efecto parallax en múltiples capas.
- **GameState**: Enumeración de estados posibles del juego: IDLE, PLAYING, PAUSED, GAME_OVER.
- **DeltaTime**: Tiempo transcurrido en segundos entre dos frames consecutivos del game loop.
- **HighScore**: Puntuación máxima histórica del jugador, persistida en localStorage.
- **Score**: Puntuación acumulada en la partida actual, incrementada al superar cada Pipe.
- **Difficulty**: Nivel de dificultad seleccionado por el usuario: EASY, NORMAL, HARD.
- **ServiceWorker**: Script de fondo que habilita el funcionamiento offline como PWA.
- **Canvas**: Elemento HTML5 `<canvas>` usado como superficie de renderizado principal del juego.
- **RequestAnimationFrame**: API del navegador usada para sincronizar el game loop con la tasa de refresco de la pantalla.
- **Sprite**: Representación visual animada del Player generada programáticamente sobre el Canvas.
- **DarkMode**: Modo visual alternativo con paleta de colores oscura.

---

## Requirements

### Requirement 1: Game Loop Principal

**User Story:** Como jugador, quiero que el juego se ejecute de forma fluida y consistente, para que la experiencia de juego sea agradable independientemente del dispositivo.

#### Acceptance Criteria

1. THE Game SHALL inicializar el game loop usando `requestAnimationFrame` al arrancar.
2. WHEN el Game Loop se ejecuta, THE Game SHALL calcular el DeltaTime entre el frame actual y el anterior.
3. WHILE el GameState es PLAYING, THE Game SHALL actualizar la lógica de Physics, Player, PipeManager, ParticleSystem y Background en cada frame usando DeltaTime.
4. WHILE el GameState es PLAYING, THE Game SHALL renderizar el Canvas en cada frame después de actualizar la lógica.
5. THE Game SHALL mantener una tasa de actualización lógica independiente de la tasa de refresco de la pantalla usando DeltaTime.
6. IF el DeltaTime supera 100ms en un frame, THEN THE Game SHALL limitar el DeltaTime a 100ms para evitar saltos de física.
7. THE Game SHALL cancelar el RequestAnimationFrame activo antes de iniciar uno nuevo para evitar fugas de memoria.

---

### Requirement 2: Mecánica del Player (Pájaro)

**User Story:** Como jugador, quiero controlar al pájaro con un solo botón o toque, para que la mecánica sea simple e intuitiva.

#### Acceptance Criteria

1. WHEN el GameState cambia a PLAYING, THE Player SHALL aparecer en la posición horizontal del 25% del ancho del Canvas y centrado verticalmente.
2. WHILE el GameState es PLAYING, THE Physics SHALL aplicar una aceleración gravitacional constante de 1500 píxeles/segundo² a la velocidad vertical del Player.
3. WHEN el InputHandler detecta un evento de salto válido, THE Player SHALL recibir una velocidad vertical negativa de 450 píxeles/segundo (impulso hacia arriba).
4. THE Player SHALL rotar su Sprite en función de la velocidad vertical: hacia arriba cuando sube, hacia abajo cuando cae, con una rotación máxima de 90 grados hacia abajo.
5. WHILE el GameState es PLAYING, THE Player SHALL animar sus alas ciclando entre 3 fotogramas de animación a 10 fotogramas por segundo.
6. IF el Player colisiona con el borde superior del Canvas, THEN THE Physics SHALL detener el movimiento vertical del Player en ese límite.
7. IF el Player colisiona con el borde inferior del Canvas, THEN THE Game SHALL cambiar el GameState a GAME_OVER.

---

### Requirement 3: Generación Procedural de Tuberías

**User Story:** Como jugador, quiero que los obstáculos aparezcan de forma variada y progresiva, para que el juego sea desafiante y no repetitivo.

#### Acceptance Criteria

1. WHILE el GameState es PLAYING, THE PipeManager SHALL generar un nuevo Pipe cada 1.8 segundos (ajustable por Difficulty).
2. THE PipeManager SHALL posicionar cada nuevo Pipe fuera del borde derecho del Canvas.
3. THE PipeManager SHALL calcular la posición vertical de la brecha de cada Pipe de forma aleatoria, garantizando que la brecha no esté a menos de 80 píxeles del borde superior ni inferior del Canvas.
4. THE PipeManager SHALL establecer el tamaño de la brecha entre segmentos de cada Pipe según la Difficulty: 180px en EASY, 150px en NORMAL, 120px en HARD.
5. WHILE el GameState es PLAYING, THE PipeManager SHALL mover todos los Pipes activos hacia la izquierda a la velocidad configurada por Difficulty.
6. WHEN un Pipe sale completamente por el borde izquierdo del Canvas, THE PipeManager SHALL eliminar ese Pipe de la lista activa.
7. THE PipeManager SHALL incrementar la velocidad de los Pipes en 5 píxeles/segundo por cada 10 puntos de Score acumulados, hasta un máximo de 400 píxeles/segundo.

---

### Requirement 4: Detección de Colisiones

**User Story:** Como jugador, quiero que las colisiones sean precisas y justas, para que el juego sea satisfactorio y no frustrante.

#### Acceptance Criteria

1. WHILE el GameState es PLAYING, THE Physics SHALL evaluar colisiones entre el Player y cada Pipe activo en cada frame.
2. THE Physics SHALL usar un rectángulo de colisión reducido al 70% del tamaño visual del Player para la detección de colisiones con Pipes.
3. WHEN THE Physics detecta una colisión entre el Player y un Pipe, THE Game SHALL cambiar el GameState a GAME_OVER.
4. WHEN THE Physics detecta una colisión entre el Player y el borde inferior del Canvas, THE Game SHALL cambiar el GameState a GAME_OVER.
5. THE Physics SHALL evaluar colisiones usando coordenadas en espacio de Canvas, no en espacio de pantalla.

---

### Requirement 5: Sistema de Puntuación

**User Story:** Como jugador, quiero ver mi puntuación en tiempo real y mi récord histórico, para tener un objetivo de superación.

#### Acceptance Criteria

1. THE Game SHALL inicializar el Score a 0 al comenzar cada partida.
2. WHEN el Player supera el eje X central de un Pipe sin colisionar, THE Game SHALL incrementar el Score en 1 punto.
3. WHILE el GameState es PLAYING, THE UI SHALL renderizar el Score actual en la parte superior central del Canvas.
4. WHEN el GameState cambia a GAME_OVER, THE Game SHALL comparar el Score actual con el HighScore almacenado.
5. WHEN el Score actual supera el HighScore almacenado, THE StorageManager SHALL persistir el nuevo HighScore en localStorage.
6. THE UI SHALL mostrar el Score actual y el HighScore en la pantalla de GAME_OVER.
7. THE UI SHALL mostrar el HighScore en la pantalla IDLE.

---

### Requirement 6: Dificultad Progresiva y Selector de Dificultad

**User Story:** Como jugador, quiero elegir el nivel de dificultad inicial y que el juego se vuelva más difícil con el tiempo, para que la experiencia sea desafiante y personalizable.

#### Acceptance Criteria

1. THE UI SHALL presentar un selector de Difficulty con las opciones EASY, NORMAL y HARD en la pantalla IDLE.
2. WHEN el usuario selecciona una Difficulty, THE Game SHALL configurar la velocidad inicial de los Pipes, el intervalo de generación y el tamaño de la brecha según los valores de esa Difficulty.
3. THE Game SHALL usar NORMAL como Difficulty predeterminada si el usuario no selecciona ninguna.
4. WHILE el GameState es PLAYING, THE PipeManager SHALL incrementar la velocidad de los Pipes gradualmente según el Score, independientemente de la Difficulty inicial seleccionada.
5. THE StorageManager SHALL persistir la última Difficulty seleccionada en localStorage y recuperarla al iniciar el juego.

---

### Requirement 7: Estados del Juego y Pantallas

**User Story:** Como jugador, quiero navegar entre pantallas claras de inicio, juego, pausa y game over, para entender el estado del juego en todo momento.

#### Acceptance Criteria

1. THE Game SHALL iniciar en el GameState IDLE mostrando la pantalla de inicio.
2. WHEN el InputHandler detecta un evento de salto mientras el GameState es IDLE, THE Game SHALL cambiar el GameState a PLAYING e iniciar la partida.
3. WHEN el GameState es PLAYING y el InputHandler detecta la tecla Escape o el botón de pausa, THE Game SHALL cambiar el GameState a PAUSED.
4. WHILE el GameState es PAUSED, THE Game SHALL detener la actualización de Physics, PipeManager, Player y ParticleSystem.
5. WHEN el GameState es PAUSED y el InputHandler detecta la tecla Escape o el botón de reanudar, THE Game SHALL cambiar el GameState a PLAYING.
6. WHEN el GameState cambia a GAME_OVER, THE UI SHALL mostrar la pantalla de Game Over con el Score actual, el HighScore y las opciones de reiniciar y volver al menú.
7. WHEN el usuario activa la opción de reiniciar desde la pantalla GAME_OVER, THE Game SHALL reiniciar el Score, el Player, el PipeManager y el ParticleSystem, y cambiar el GameState a PLAYING en menos de 500ms.
8. WHEN el usuario activa la opción de volver al menú desde la pantalla GAME_OVER, THE Game SHALL cambiar el GameState a IDLE.

---

### Requirement 8: InputHandler — Teclado, Ratón y Táctil

**User Story:** Como jugador, quiero controlar el juego con teclado, ratón o pantalla táctil, para poder jugar en cualquier dispositivo.

#### Acceptance Criteria

1. THE InputHandler SHALL registrar los eventos `keydown`, `mousedown` y `touchstart` al inicializarse.
2. WHEN el InputHandler detecta la tecla Espacio o la tecla ArrowUp en un evento `keydown`, THE InputHandler SHALL emitir un evento de salto.
3. WHEN el InputHandler detecta un evento `mousedown` con el botón primario, THE InputHandler SHALL emitir un evento de salto.
4. WHEN el InputHandler detecta un evento `touchstart` con al menos un punto de contacto, THE InputHandler SHALL emitir un evento de salto.
5. THE InputHandler SHALL prevenir el comportamiento predeterminado del navegador para los eventos de Espacio y ArrowUp para evitar el desplazamiento de la página.
6. THE InputHandler SHALL prevenir el comportamiento predeterminado del navegador para los eventos `touchstart` para evitar el zoom y el desplazamiento en dispositivos móviles.
7. THE InputHandler SHALL eliminar todos los event listeners registrados cuando se invoque su método `destroy` para evitar fugas de memoria.
8. THE InputHandler SHALL ignorar eventos de salto repetidos dentro de un intervalo de 100ms para evitar saltos múltiples involuntarios.

---

### Requirement 9: AudioManager — Sonidos Procedurales

**User Story:** Como jugador, quiero escuchar efectos de sonido al saltar, puntuar y perder, para que el juego sea más inmersivo, incluso sin conexión a internet.

#### Acceptance Criteria

1. THE AudioManager SHALL generar todos los sonidos usando la Web Audio API sin depender de archivos de audio externos.
2. WHEN el Player ejecuta un salto, THE AudioManager SHALL reproducir un sonido de salto de frecuencia ascendente de 400Hz a 600Hz con duración de 100ms.
3. WHEN el Score se incrementa en 1 punto, THE AudioManager SHALL reproducir un sonido de punto de frecuencia 880Hz con duración de 150ms.
4. WHEN el GameState cambia a GAME_OVER por colisión con un Pipe o el suelo, THE AudioManager SHALL reproducir un sonido de colisión de frecuencia descendente de 300Hz a 100Hz con duración de 300ms.
5. THE AudioManager SHALL crear el contexto de AudioContext en respuesta a la primera interacción del usuario para cumplir con las políticas de autoplay de los navegadores.
6. THE AudioManager SHALL exponer un método `setVolume(level)` que acepte valores entre 0.0 y 1.0 para controlar el volumen global.
7. IF el navegador no soporta la Web Audio API, THEN THE AudioManager SHALL continuar la ejecución del juego sin reproducir sonidos y sin lanzar errores.

---

### Requirement 10: StorageManager — Persistencia con localStorage

**User Story:** Como jugador, quiero que mi récord y preferencias se guarden automáticamente, para no perder mi progreso al cerrar el navegador.

#### Acceptance Criteria

1. THE StorageManager SHALL persistir el HighScore en localStorage bajo la clave `flappybird_highscore`.
2. THE StorageManager SHALL persistir la Difficulty seleccionada en localStorage bajo la clave `flappybird_difficulty`.
3. THE StorageManager SHALL persistir la preferencia de DarkMode en localStorage bajo la clave `flappybird_darkmode`.
4. THE StorageManager SHALL persistir el nivel de volumen en localStorage bajo la clave `flappybird_volume`.
5. WHEN THE StorageManager recupera un valor de localStorage y el valor no existe o es inválido, THE StorageManager SHALL retornar el valor predeterminado correspondiente sin lanzar errores.
6. IF el navegador no soporta localStorage o lanza una excepción al acceder, THEN THE StorageManager SHALL operar en modo en memoria sin persistencia y sin interrumpir la ejecución del juego.
7. THE StorageManager SHALL serializar y deserializar todos los valores usando JSON para garantizar la integridad de los tipos de datos.

---

### Requirement 11: Renderizado Visual — Sprites Animados y Fondo Parallax

**User Story:** Como jugador, quiero ver un juego visualmente atractivo con animaciones fluidas y un fondo con profundidad, para disfrutar de una experiencia visual de calidad.

#### Acceptance Criteria

1. THE Player SHALL renderizarse como un Sprite animado generado programáticamente sobre el Canvas, con al menos 3 fotogramas de animación de alas.
2. THE Background SHALL renderizar al menos 3 capas de elementos (cielo, nubes lejanas, nubes cercanas) con velocidades de desplazamiento distintas para crear el efecto parallax.
3. THE Background SHALL desplazar cada capa a una velocidad proporcional a la velocidad actual de los Pipes: la capa más lejana al 20%, la capa media al 50% y la capa más cercana al 80%.
4. THE PipeManager SHALL renderizar cada Pipe con un degradado de color verde y un borde de contraste para distinguirlo del fondo.
5. THE ParticleSystem SHALL emitir partículas de colisión en la posición del Player cuando el GameState cambia a GAME_OVER.
6. THE ParticleSystem SHALL emitir partículas de punto en la posición del Player cuando el Score se incrementa.
7. WHILE el GameState es PLAYING, THE UI SHALL renderizar el Score actual con una fuente de al menos 32px en la parte superior central del Canvas con sombra para legibilidad.

---

### Requirement 12: Modo Oscuro

**User Story:** Como jugador, quiero activar un modo oscuro, para jugar cómodamente en entornos con poca luz.

#### Acceptance Criteria

1. THE UI SHALL mostrar un botón o interruptor de DarkMode accesible desde la pantalla IDLE y desde la pantalla de configuración.
2. WHEN el usuario activa el DarkMode, THE Background SHALL cambiar su paleta de colores a tonos oscuros (cielo nocturno, elementos en escala de grises oscuros).
3. WHEN el usuario activa el DarkMode, THE UI SHALL cambiar los colores de texto y elementos de interfaz a una paleta de alto contraste sobre fondo oscuro.
4. THE StorageManager SHALL persistir el estado del DarkMode y THE Game SHALL aplicarlo automáticamente al iniciar.
5. WHEN el usuario desactiva el DarkMode, THE Background y THE UI SHALL restaurar la paleta de colores original.

---

### Requirement 13: Pantalla de Configuración

**User Story:** Como jugador, quiero acceder a una pantalla de configuración, para ajustar el volumen, la dificultad y el modo visual sin reiniciar el juego.

#### Acceptance Criteria

1. THE UI SHALL mostrar un botón de acceso a la pantalla de configuración desde la pantalla IDLE.
2. WHEN el usuario accede a la pantalla de configuración, THE UI SHALL mostrar controles para: nivel de volumen, Difficulty, DarkMode y reinicio del HighScore.
3. WHEN el usuario modifica el nivel de volumen en la pantalla de configuración, THE AudioManager SHALL aplicar el nuevo nivel de volumen inmediatamente.
4. WHEN el usuario confirma el reinicio del HighScore en la pantalla de configuración, THE StorageManager SHALL eliminar el HighScore almacenado y THE UI SHALL mostrar 0 como HighScore.
5. WHEN el usuario cierra la pantalla de configuración, THE Game SHALL retornar al GameState IDLE.

---

### Requirement 14: Sistema de Pausa

**User Story:** Como jugador, quiero pausar el juego en cualquier momento, para poder interrumpir la partida sin perderla.

#### Acceptance Criteria

1. WHILE el GameState es PLAYING, THE UI SHALL mostrar un botón de pausa visible en la esquina superior derecha del Canvas.
2. WHEN el GameState cambia a PAUSED, THE UI SHALL mostrar una superposición de pausa con las opciones de reanudar, reiniciar y volver al menú.
3. WHILE el GameState es PAUSED, THE Game SHALL continuar renderizando el estado actual del Canvas sin actualizarlo.
4. WHEN el GameState es PAUSED y el usuario activa la opción de reiniciar, THE Game SHALL reiniciar la partida y cambiar el GameState a PLAYING.
5. WHEN el GameState es PAUSED y el usuario activa la opción de volver al menú, THE Game SHALL cambiar el GameState a IDLE.

---

### Requirement 15: Diseño Responsive y Soporte Táctil Avanzado

**User Story:** Como jugador, quiero que el juego se adapte a cualquier tamaño de pantalla y funcione bien en dispositivos móviles, para jugar en cualquier dispositivo.

#### Acceptance Criteria

1. THE Game SHALL ajustar las dimensiones del Canvas al tamaño de la ventana del navegador al inicializarse y cada vez que se detecte un evento `resize`.
2. THE Game SHALL mantener una relación de aspecto de 9:16 (vertical) en dispositivos móviles y de 4:3 en escritorio, añadiendo bandas laterales o superiores si es necesario.
3. THE UI SHALL escalar todos los elementos de interfaz proporcionalmente al tamaño actual del Canvas.
4. THE InputHandler SHALL soportar gestos de deslizamiento hacia arriba (`swipe up`) en dispositivos táctiles como evento de salto alternativo.
5. THE UI SHALL mostrar indicadores visuales de los controles táctiles disponibles en la pantalla IDLE cuando se detecte un dispositivo táctil.

---

### Requirement 16: PWA y Funcionamiento Offline

**User Story:** Como jugador, quiero instalar el juego en mi dispositivo y jugarlo sin conexión a internet, para tener acceso al juego en cualquier momento.

#### Acceptance Criteria

1. THE Game SHALL incluir un archivo `manifest.json` con nombre, iconos, colores y modo de visualización `standalone` para ser instalable como PWA.
2. THE ServiceWorker SHALL registrarse al cargar la página y cachear todos los archivos estáticos del juego (HTML, CSS, JS, manifest).
3. WHEN el navegador solicita un recurso cacheado mientras está offline, THE ServiceWorker SHALL servir el recurso desde la caché sin realizar peticiones de red.
4. WHEN el ServiceWorker detecta una nueva versión de los archivos, THE ServiceWorker SHALL actualizar la caché y notificar al usuario que hay una actualización disponible.
5. IF el navegador no soporta ServiceWorker, THEN THE Game SHALL funcionar normalmente sin capacidades PWA y sin mostrar errores al usuario.

---

### Requirement 17: Estructura de Código y Calidad

**User Story:** Como desarrollador, quiero que el código esté organizado en módulos desacoplados con responsabilidades claras, para facilitar el mantenimiento y la escalabilidad del proyecto.

#### Acceptance Criteria

1. THE Game SHALL organizarse en los módulos: `game.js`, `player.js`, `pipes.js`, `physics.js`, `input.js`, `ui.js`, `audio.js` y `storage.js`, cada uno con una única responsabilidad.
2. THE Game SHALL usar clases ES6 con constructores, métodos de instancia y constantes de configuración agrupadas en un objeto `CONFIG` exportable.
3. THE Game SHALL evitar variables globales; todos los módulos se comunicarán mediante inyección de dependencias o eventos del DOM.
4. THE Game SHALL definir todas las constantes configurables (gravedad, velocidad, tamaño de brecha, intervalos) en un único objeto `CONFIG` en `game.js`.
5. THE Game SHALL manejar errores en operaciones críticas (AudioContext, localStorage, Canvas) usando bloques try/catch y degradación elegante.
6. THE Game SHALL liberar todos los recursos (event listeners, AnimationFrame, AudioContext) cuando se invoque un método `destroy` en el módulo Game.

---

### Requirement 18: Exportabilidad como APK

**User Story:** Como desarrollador, quiero que el proyecto sea exportable como APK usando Capacitor o Cordova, para distribuirlo como aplicación móvil nativa.

#### Acceptance Criteria

1. THE Game SHALL estructurar todos sus archivos estáticos bajo un directorio raíz único (`/flappy-bird`) compatible con la configuración de `webDir` de Capacitor.
2. THE Game SHALL evitar el uso de rutas absolutas en imports y referencias de recursos, usando rutas relativas en su lugar.
3. THE Game SHALL funcionar correctamente en el WebView de Capacitor sin requerir un servidor HTTP local.
4. THE Game SHALL incluir un archivo `README.md` con instrucciones para exportar el proyecto a APK usando Capacitor, incluyendo los comandos `npx cap init`, `npx cap add android` y `npx cap sync`.
