import express from 'express'
import bodyParser from 'body-parser'
import deleteUserHandler from './api/admin/delete-user.js'
import wipePasswordHandler from './api/admin/wipe-password.js'

const app = express()
app.use(bodyParser.json())

app.post('/api/admin/delete-user', (req, res) => deleteUserHandler(req, res))
app.post('/api/admin/wipe-password', (req, res) => wipePasswordHandler(req, res))

const port = process.env.DEV_API_PORT || 5175
app.listen(port, () => console.log(`Dev API server listening on http://localhost:${port}`))
