/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

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
  return {
    success: true,
    fileName: file.clientName,
    size: file.size,
    type: file.type,
  }
})
