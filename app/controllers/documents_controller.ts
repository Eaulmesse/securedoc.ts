import app from '@adonisjs/core/services/app';
import type { HttpContext } from '@adonisjs/core/http'


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

            return response.ok({ message: 'Document uploaded successfully', filePath });
        } catch (error) {
            return response.internalServerError('Failed to upload document');
        }
    }
}