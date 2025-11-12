import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class UsersController {
  /**
   * Récupérer tous les utilisateurs
   */
  public async index({ response }: HttpContext) {
    try {
      const users = await User.all()
      return response.ok(users)
    } catch (error) {
      return response.internalServerError({ message: 'Erreur lors de la récupération des utilisateurs', error: error.message })
    }
  }

  /**
   * Récupérer un utilisateur par son ID
   */
  public async show({ params, response }: HttpContext) {
    try {
      const user = await User.find(params.id)
      if (!user) {
        return response.notFound({ message: 'Utilisateur non trouvé' })
      }
      return response.ok(user)
    } catch (error) {
      return response.internalServerError({ message: 'Erreur lors de la récupération de l\'utilisateur', error: error.message })
    }
  }

  /**
   * Créer un nouvel utilisateur
   */
  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['fullName', 'email', 'password'])
      
      // Vérifier si l'email existe déjà
      const existingUser = await User.findBy('email', data.email)
      if (existingUser) {
        return response.conflict({ message: 'Un utilisateur avec cet email existe déjà' })
      }

      // Hasher le mot de passe
      const hashedPassword = await hash.make(data.password)
      
      // Créer l'utilisateur
      const user = new User()
      user.fullName = data.fullName
      user.email = data.email
      user.password = hashedPassword
      
      await user.save()
      
      return response.created(user)
    } catch (error) {
      return response.internalServerError({ message: 'Erreur lors de la création de l\'utilisateur', error: error.message })
    }
  }

  /**
   * Mettre à jour un utilisateur existant
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      const user = await User.find(params.id)
      if (!user) {
        return response.notFound({ message: 'Utilisateur non trouvé' })
      }
      
      const data = request.only(['fullName', 'email', 'password'])
      
      // Vérifier si l'email existe déjà pour un autre utilisateur
      if (data.email && data.email !== user.email) {
        const existingUser = await User.findBy('email', data.email)
        if (existingUser && existingUser.id !== user.id) {
          return response.conflict({ message: 'Un utilisateur avec cet email existe déjà' })
        }
      }
      
      // Mettre à jour les champs
      if (data.fullName !== undefined) {
        user.fullName = data.fullName
      }
      
      if (data.email !== undefined) {
        user.email = data.email
      }
      
      if (data.password) {
        user.password = await hash.make(data.password)
      }
      
      await user.save()
      
      return response.ok(user)
    } catch (error) {
      return response.internalServerError({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error: error.message })
    }
  }

  /**
   * Supprimer un utilisateur
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      const user = await User.find(params.id)
      if (!user) {
        return response.notFound({ message: 'Utilisateur non trouvé' })
      }
      
      await user.delete()
      
      return response.ok({ message: 'Utilisateur supprimé avec succès' })
    } catch (error) {
      return response.internalServerError({ message: 'Erreur lors de la suppression de l\'utilisateur', error: error.message })
    }
  }
}
