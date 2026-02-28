import { execSync } from 'child_process'
import fs from 'fs'

console.log('🔍 TESTANDO INSTALAÇÃO DO TAILWIND\n')

try {
  // Testar se o tailwind está instalado
  const version = execSync('npx tailwindcss --version', { encoding: 'utf8' })
  console.log('✅ Tailwind instalado. Versão:', version.trim())
} catch (error) {
  console.log('❌ Tailwind NÃO está instalado ou não encontrado')
  console.log('   Execute: npm install -D tailwindcss@latest')
  process.exit(1)
}

// Verificar node_modules
if (fs.existsSync('node_modules/tailwindcss')) {
  console.log('✅ Tailwind encontrado em node_modules')
} else {
  console.log('❌ Tailwind não encontrado em node_modules')
}

// Verificar configurações
const configs = [
  { file: 'tailwind.config.js', required: true },
  { file: 'postcss.config.js', required: true },
  { file: 'src/index.css', required: true },
  { file: 'vite.config.js', required: true }
]

configs.forEach(({ file, required }) => {
  const exists = fs.existsSync(file)
  console.log(`${exists ? '✅' : '❌'} ${file} ${exists ? '' : '(faltando)'}`)
})

// Testar processamento
console.log('\n📌 Testando processamento...')
try {
  execSync('npx tailwindcss -i ./src/index.css -o ./src/output.css', { stdio: 'inherit' })
  console.log('✅ Processamento concluído!')
} catch (error) {
  console.log('❌ Erro no processamento')
}