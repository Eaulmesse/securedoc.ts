import app from '@adonisjs/core/services/app';
import type { HttpContext } from '@adonisjs/core/http'
import fs from 'fs'
import Document from '#models/document'
import { DateTime } from 'luxon';
import User from '#models/user';
import { BelongsTo } from '@adonisjs/lucid/types/relations';


export default class DocumentsController {
    /**
     * Récupérer tous les documents
     */
    public async index({ response }: HttpContext) {
        try {
            const documents = await Document.query().preload('user')
            return response.ok(documents)
        } catch (error) {
            return response.internalServerError({ 
                message: 'Erreur lors de la récupération des documents', 
                error: error.message 
            })
        }
    }

    /**
     * Récupérer un document par son ID
     */
    public async show({ params, response }: HttpContext) {
        try {
            const document = await Document.query()
                .where('id', params.id)
                .preload('user')
                .first()

            if (!document) {
                return response.notFound({ message: 'Document non trouvé' })
            }

            return response.ok(document)
        } catch (error) {
            return response.internalServerError({ 
                message: 'Erreur lors de la récupération du document', 
                error: error.message 
            })
        }
    }

    /**
     * Mettre à jour un document existant
     */
    public async update({ params, request, response }: HttpContext) {
        try {
            const document = await Document.find(params.id)
            if (!document) {
                return response.notFound({ message: 'Document non trouvé' })
            }
            
            const data = request.only(['fileName'])
            
            if (data.fileName) {
                document.fileName = data.fileName
            }
            
            await document.save()
            
            return response.ok(document)
        } catch (error) {
            return response.internalServerError({ 
                message: 'Erreur lors de la mise à jour du document', 
                error: error.message 
            })
        }
    }

    /**
     * Supprimer un document
     */
    public async destroy({ params, response }: HttpContext) {
        try {
            const document = await Document.find(params.id)
            if (!document) {
                return response.notFound({ message: 'Document non trouvé' })
            }
            
            // Supprimer le fichier physique
            await this.cleanupDocuments(document.filePath)
            
            // Supprimer l'enregistrement dans la base de données
            await document.delete()
            
            return response.ok({ message: 'Document supprimé avec succès' })
        } catch (error) {
            return response.internalServerError({ 
                message: 'Erreur lors de la suppression du document', 
                error: error.message 
            })
        }
    }
    public async upload ({ request, response }: HttpContext) {
        try {
            const document = request.file('file', {
                size: '2mb',
                extnames: ['pdf]'],
            })

            console.log(document)

            if (!document) {
                return response.badRequest('Valid document is required');
            }

            const filename = `${Date.now()}-${document.clientName}`;

            await document.move(app.tmpPath('uploads/documents'), {
                name: filename,
                overwrite: true,
            });

            if (document.hasErrors) {
                return response.internalServerError('Failed to upload document');
            }

            const filePath = app.tmpPath(`uploads/documents/${filename}`);

            await this.registerDocument(filePath);

            return response.ok({ message: 'Document uploaded successfully', filePath });
        } catch (error) {
            return response.internalServerError('Failed to upload document');
        }
    }

    public async cleanupDocuments(filePath: string) {
        try {
            fs.unlink(filePath, err => {
                if(err) {
                    console.error('Failed to delete document', err);
                }
            });
        } catch (error) {
            console.error(`Failed to cleanup document at ${filePath}`, error);
        }
    }

    public async registerDocument(filePath: string) {
        try {
            const document = new Document();
            document.filePath = filePath;
            document.fileName = filePath.split('/').pop() || '';
            const user = await User.find(1);
            if (!user) {
                throw new Error('User not found');
            }
            document.user = user as BelongsTo<typeof User>;
            document.createdAt = DateTime.now();
            document.updatedAt = DateTime.now();
            await document.save();
            return document;
        } catch (error) {
            console.error('Failed to register document', error);
            return null;
        }
    }

}