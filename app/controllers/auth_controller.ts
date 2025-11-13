import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { rules, schema } from '@adonisjs/validator'
import { validator } from '@adonisjs/core/services/validator'

export default class AuthController {
  /**
   * Inscription d'un nouvel utilisateur
   */
  public async register({ request, response }: HttpContext) {
    try {
      // Validation des données
      const registerSchema = schema.create({
        fullName: schema.string.optional(),
        email: schema.string([
          rules.email(),
          rules.unique({ table: 'users', column: 'email' })
        ]),
        password: schema.string([
          rules.minLength(8)
        ])
      })

      const data = await validator.validate({
        schema: registerSchema,
        data: request.all()
      })

      // Création de l'utilisateur
      const user = new User()
      user.fullName = data.fullName
      user.email = data.email
      user.password = await hash.make(data.password)
      
      await user.save()
      
      // Génération du token d'accès
      const token = await User.accessTokens.create(user)
      
      return response.created({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName
        },
        token: token.value
      })
    } catch (error) {
      if (error.messages) {
        return response.badRequest(error.messages)
      }
      
      return response.internalServerError({
        message: 'Erreur lors de l\'inscription',
        error: error.message
      })
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  public async login({ request, response }: HttpContext) {
    try {
      // Validation des données
      const loginSchema = schema.create({
        email: schema.string([rules.email()]),
        password: schema.string()
      })

      const { email, password } = await validator.validate({
        schema: loginSchema,
        data: request.all()
      })

      // Recherche de l'utilisateur
      const user = await User.verifyCredentials(email, password)
      
      // Génération du token d'accès
      const token = await User.accessTokens.create(user)
      
      return response.ok({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName
        },
        token: token.value
      })
    } catch (error) {
      if (error.code === 'E_INVALID_CREDENTIALS') {
        return response.unauthorized({ message: 'Email ou mot de passe incorrect' })
      }
      
      if (error.messages) {
        return response.badRequest(error.messages)
      }
      
      return response.internalServerError({
        message: 'Erreur lors de la connexion',
        error: error.message
      })
    }
  }

  /**
   * Déconnexion d'un utilisateur
   */
  public async logout({ auth, response }: HttpContext) {
    try {
      await auth.use('api').revoke()
      return response.ok({ message: 'Déconnexion réussie' })
    } catch (error) {
      return response.internalServerError({
        message: 'Erreur lors de la déconnexion',
        error: error.message
      })
    }
  }

  /**
   * Récupération des informations de l'utilisateur connecté
   */
  public async me({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      return response.ok({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName
        }
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Erreur lors de la récupération des informations utilisateur',
        error: error.message
      })
    }
  }
}
