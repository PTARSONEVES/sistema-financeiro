@echo off
echo Instalando Tailwind CSS...

REM Remover node_modules e reinstalar do zero
rmdir /s /q node_modules
del package-lock.json

REM Instalar dependências principais
call npm install

REM Instalar Tailwind e dependências
call npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

REM Inicializar Tailwind
call npx tailwindcss init -p

echo.
echo Configurando tailwind.config.js...
(
echo /** @type {import('tailwindcss').Config} */
echo export default {
echo  darkMode: 'class',
echo  content: [
echo  "./index.html",
echo  "./src/**/*.{js,ts,jsx,tsx}",
echo  ],
echo  theme: {
echo  extend: {},
echo  },
echo  plugins: [],
echo }
) > tailwind.config.js

echo Configurando postcss.config.js...
(
echo export default {
echo  plugins: {
echo  tailwindcss: {},
echo  autoprefixer: {},
echo  },
echo }
) > postcss.config.js

echo.
echo Testando processamento...
call npx tailwindcss -i ./src/index.css -o ./src/output.css

echo.
echo Instalação concluída!
pause
