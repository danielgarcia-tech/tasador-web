import express from 'express'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3001

// Middleware
app.use(express.json())

// Importar el handler
import('./api/baremo-rag.ts').then(module => {
  const handler = module.default

  // Montar la ruta
  app.post('/api/baremo-rag', async (req, res) => {
    try {
      // Convertir Express request/response a Vercel format
      const mockReq = {
        method: 'POST',
        body: req.body,
      }
      const mockRes = {
        status: (code) => {
          res.statusCode = code
          return mockRes
        },
        json: (data) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        }
      }

      await handler(mockReq, mockRes)
    } catch (error) {
      console.error('API Error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`)
    console.log(`📍 Endpoint: POST /api/baremo-rag`)
  })
})
