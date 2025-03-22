# Simulación Interactiva del Experimento de la Doble Rendija Cuántica

Esta aplicación web proporciona una simulación interactiva y visual del famoso experimento de la doble rendija, 
permitiendo explorar los conceptos fundamentales de la mecánica cuántica como la dualidad onda-partícula, 
la superposición y el fenómeno del colapso de la función de onda.

## 🔍 Características Principales

- **Visualización 3D interactiva** del experimento completo: emisor, barrera con rendijas y pantalla de detección
- **Simulación física precisa** de la propagación de ondas y el patrón de interferencia
- **Dos modos de operación**: sin observador (patrón de interferencia) y con observador (colapso de la función de onda)
- **Controles interactivos** para ajustar parámetros como el número y ancho de las rendijas
- **Implementación con shaders GLSL** para visualización de ondas en tiempo real

## 🚀 Tecnologías Utilizadas

- **React + TypeScript + Vite**: Framework y herramientas de desarrollo
- **Three.js + React-Three-Fiber**: Motor 3D para visualización
- **Zustand**: Gestión de estado
- **Leva**: Paneles de control interactivos
- **Tailwind CSS**: Estilizado y diseño responsivo
- **GLSL**: Shaders para visualización de ondas y efectos

## ⚙️ Instalación y Ejecución

### Requisitos Previos

- Node.js (v14 o superior)
- npm (v7 o superior)

### Pasos de Instalación

1. Clonar este repositorio:
```bash
git clone https://github.com/tu-usuario/experimento-doble-rendija.git
cd experimento-doble-rendija
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

4. Para compilar para producción:
```bash
npm run build
```

## 📖 Guía de Uso

### Controles Principales

- **Modo de Observación**: Alterna entre el modo "Sin Observador" (comportamiento ondulatorio) y "Con Observador" (comportamiento corpuscular).
- **Rendijas**: Ajusta el número (1-3), ancho y separación de las rendijas.
- **Partículas**: Selecciona el tipo de partícula (fotón, electrón, neutrón) y ajusta su velocidad y longitud de onda.

### Navegación 3D

- **Rotación**: Clic izquierdo + arrastrar
- **Paneo**: Clic derecho + arrastrar
- **Zoom**: Rueda del ratón

## 🧪 Fundamentos Físicos

La simulación se basa en principios fundamentales de la mecánica cuántica:

- **Ecuación de Schrödinger (2D)**: Describe la evolución de la función de onda
- **Principio de superposición**: Las ondas pueden superponerse creando interferencia
- **Dualidad onda-partícula**: Las partículas subatómicas exhiben tanto propiedades de onda como de partícula
- **Observación y colapso**: El acto de observación causa el colapso de la función de onda

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes, abra primero un issue para discutir lo que le gustaría cambiar.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - vea el archivo LICENSE para más detalles.

## 🙏 Agradecimientos

- Inspirado en los experimentos clásicos de física cuántica
- Basado en los fundamentos establecidos por científicos como Richard Feynman, Niels Bohr y Erwin Schrödinger
