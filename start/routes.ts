/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import DocumentsController from '#controllers/documents_controller'
import type { HttpContext } from '@adonisjs/core/http'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('/upload-document', async ({ request, response }) => {
  const file = request.file('file')
  if (!file) {
    return response.status(400).json({ error: 'File is required' })
  }
  const controller = new DocumentsController()
  return await controller.upload({ request, response } as HttpContext)
})
