# Kokok-Pot Slot Machine Game

Un juego de tragamonedas interactivo desarrollado con HTML, CSS y JavaScript.

## 🎮 Características del Juego

### Lógica Simplificada
- **Siempre 3 símbolos iguales**: El juego ahora **siempre** genera 3 símbolos idénticos en cada giro
- **Resultado garantizado**: Cada giro siempre produce un resultado (ganar o perder puntos)
- **Sin giros sin resultado**: Se eliminó la posibilidad de giros sin combinación ganadora
- **Sistema de puntuación claro**: Cada símbolo tiene un valor específico cuando se obtienen 3 iguales

### Símbolos y Puntuaciones
- 🎰 **7️⃣ x3** = 300 puntos (Jackpot)
- ⭐ **⭐ x3** = 270 puntos (Wild)
- 💎 **💎 x3** = 150 puntos (Diamante)
- 🔔 **🔔 x3** = 100 puntos (Campana)
- 🍒 **🍒 x3** = 40 puntos (Cereza)
- 💀 **💀 x3** = -25 puntos (Negativo)
- ☠️ **☠️ x3** = -10 puntos (Negativo)

### Giros Extra
- **3 diamantes** = +1 giro extra
- **3 wilds** = +2 giros extra
- Máximo 10 giros extra por partida

### Control de Audio
- **Botón de mute**: Nuevo botón flotante para silenciar/activar música y efectos de sonido
- **Preferencias guardadas**: El estado de mute se guarda en localStorage
- **Posicionamiento responsive**: El botón se adapta a diferentes tamaños de pantalla

## 🎨 Mejoras de Diseño

### Responsividad Mejorada
- **Medidas en vh/vw**: Optimizado para monitores desktop con mejor proporción de pantalla
- **Ajustes específicos**: Tamaños y posiciones optimizados para diferentes resoluciones
- **Compatibilidad**: Funciona bien en la mayoría de monitores desktop

### Interfaz de Usuario
- **Botón de mute flotante**: Posicionado en la esquina superior derecha
- **Animaciones suaves**: Transiciones mejoradas para una mejor experiencia
- **Feedback visual**: Mensajes claros para cada resultado del juego

## 🚀 Cómo Jugar

1. **Inicia sesión** con tu nombre de usuario
2. **Haz clic en "Play"** para comenzar el juego
3. **Gira los carretes** haciendo clic en el botón SPIN o jalando la palanca
4. **Obtén 3 símbolos iguales** para ganar puntos
5. **Usa los giros extra** estratégicamente
6. **Intenta conseguir el mejor puntaje** en 30 giros

## 📁 Estructura del Proyecto

```
Kokokpot1/
├── public/
│   ├── css/
│   │   ├── style.css      # Estilos principales
│   │   └── game.css       # Estilos específicos del juego
│   ├── js/
│   │   ├── game.js        # Lógica del juego
│   │   ├── sound.js       # Sistema de audio
│   │   ├── auth.js        # Autenticación
│   │   └── ui.js          # Interfaz de usuario
│   ├── images/            # Assets gráficos
│   ├── soundtrack/        # Archivos de audio
│   ├── index.html         # Página principal
│   ├── login.html         # Página de login
│   ├── menu.html          # Menú principal
│   ├── game.html          # Página del juego
│   └── leaderboard.html   # Tabla de puntuaciones
└── server/                # Backend (opcional)
```

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos y animaciones
- **JavaScript ES6+**: Lógica del juego
- **LocalStorage**: Persistencia de datos
- **Responsive Design**: Adaptable a diferentes pantallas

## 🎵 Sistema de Audio

- **Música de fondo**: Reproducción automática con fallback para interacción del usuario
- **Efectos de sonido**: Para giros, victorias y derrotas
- **Control de mute**: Botón para silenciar/activar todo el audio
- **Persistencia**: El estado de mute se guarda entre sesiones

## 📱 Compatibilidad

- **Desktop**: Optimizado para monitores de escritorio
- **Tablets**: Interfaz adaptativa para pantallas medianas
- **Móviles**: Diseño responsive para dispositivos móviles
- **Navegadores**: Compatible con Chrome, Firefox, Safari, Edge

## 🔧 Instalación y Uso

1. Clona o descarga el proyecto
2. Abre `public/index.html` en tu navegador
3. ¡Disfruta del juego!

## 📝 Notas de Desarrollo

### Cambios Recientes
- **Lógica simplificada**: Siempre se generan 3 símbolos iguales en cada giro
- **Resultado garantizado**: Cada giro siempre produce un resultado (ganar o perder)
- **Botón de mute**: Control de audio mejorado
- **Responsividad**: Optimización para desktop
- **Instrucciones actualizadas**: Reflejan la nueva lógica del juego

### Balance del Juego
- **Probabilidades ajustadas**: Para un juego más equilibrado
- **Puntuaciones claras**: Sistema de puntos simplificado
- **Dificultad moderada**: Desafiante pero justo
- **Experiencia consistente**: Siempre hay un resultado en cada giro

---

¡Disfruta jugando Kokok-Pot! 🎰✨

