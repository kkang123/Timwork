import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'
import type { Plugin } from 'vite'

const serveDataPlugin = (): Plugin => ({
  name: 'serve-data-directory',
  configureServer(server) {
    server.middlewares.use('/data', (req, res, next) => {
      try {
        const decodedUrl = decodeURIComponent(req.url ?? '/')
        const filePath = path.join(process.cwd(), 'data', decodedUrl)

        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
          next()
          return
        }

        const ext = path.extname(filePath).toLowerCase()
        const contentTypeMap: Record<string, string> = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.json': 'application/json',
        }
        const contentType = contentTypeMap[ext] ?? 'application/octet-stream'

        res.setHeader('Content-Type', contentType)
        fs.createReadStream(filePath).pipe(res)
      } catch {
        next()
      }
    })
  },
})

export default defineConfig({
  plugins: [react(), tailwindcss(), serveDataPlugin()],
})
