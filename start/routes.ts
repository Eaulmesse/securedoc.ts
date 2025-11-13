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
import UsersController from '#controllers/users_controller'
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

// Routes CRUD pour les utilisateurs
const usersController = new UsersController()

// Récupérer tous les utilisateurs
router.get('/users', async (ctx) => {
  return usersController.index(ctx)
})

// Récupérer un utilisateur par son ID
router.get('/users/:id', async (ctx) => {
  return usersController.show(ctx)
})

// Créer un nouvel utilisateur
router.post('/users', async (ctx) => {
  return usersController.store(ctx)
})

// Mettre à jour un utilisateur existant
router.put('/users/:id', async (ctx) => {
  return usersController.update(ctx)
})

// Supprimer un utilisateur
router.delete('/users/:id', async (ctx) => {
  return usersController.destroy(ctx)
})

// Routes CRUD pour les documents
const documentsController = new DocumentsController()

// Récupérer tous les documents
router.get('/documents', async (ctx) => {
  return documentsController.index(ctx)
})

// Récupérer un document par son ID
router.get('/documents/:id', async (ctx) => {
  return documentsController.show(ctx)
})

// Mettre à jour un document existant
router.put('/documents/:id', async (ctx) => {
  return documentsController.update(ctx)
})

// Supprimer un document
router.delete('/documents/:id', async (ctx) => {
  return documentsController.destroy(ctx)
})
