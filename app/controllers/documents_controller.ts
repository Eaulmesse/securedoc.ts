import app from '@adonisjs/core/services/app';
import type { HttpContext } from '@adonisjs/core/http'
import fs from 'fs'
import Document from '#models/document'
import { DateTime } from 'luxon';
import User from '#models/user';
import { BelongsTo } from '@adonisjs/lucid/types/relations';


export default class DocumentsController {
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

            if (!document.hasErrors) {
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