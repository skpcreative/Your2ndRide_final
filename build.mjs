import { build } from 'vite'

console.log('Starting Vite build...')

try {
  await build({
    configFile: './vite.config.js'
  })
  console.log('Build completed successfully!')
} catch (error) {
  console.error('Build failed:', error)
  process.exit(1)
}
