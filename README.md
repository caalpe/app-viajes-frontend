# app-viajes-frontend
Proyecto frontend para aplicación de viajes.

# PASOS UTILIZACION FLOWBITE

# 1) Crear proyecto Angular (standalone, routing)
npm create @angular@latest my-users-app
cd my-users-app

# 2) Instalar Tailwind
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

tailwind.config.js → añade las rutas de templates y Flowbite
content: ["./src/**/*.{html,ts}", "./node_modules/flowbite/**/*.js"]
plugins: [require('flowbite/plugin')]

# 3) Importar Tailwind en src/styles.css
@tailwind base;
@tailwind components;
@tailwind utilities;

# 4) Instalar Flowbite (CSS + JS de componentes)
npm i flowbite

Importa el JS en main.ts
import 'flowbite';

# 5) Instalar HttpClient si no venía por defecto
npm i
