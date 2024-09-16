import {createBot, createProvider, createFlow, MemoryDB, addKeyword} from '@bot-whatsapp/bot';
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';
import dotenv from 'dotenv';

dotenv.config();

const flowBienvenida = addKeyword('hola').addAnswer('Buenas!! bienvenido');


const main = async () => {
    
    const flowDefault = createFlow([flowBienvenida]);
    
    const provider = createProvider(BaileysProvider); // O el proveedor que estés utilizando
    provider.initHttpServer(3002);

    if (provider.http && provider.http.server) {
        
        provider.http.server.get('/send-message', (req, res) => { // chequeo de respuesta del http.server
            res.end('esto es del server de polka');
        });
        
        // provider.http.server.post('/send-message', handleCtx(async (bot, req, res)=> {
        //     // const phone = req.body.phone // se puede pasar por parametros del request
        //     // const phone = '542613907179';
        //     // en lugar de la .env se puede usar directamente req.body.phone

        //     console.log('body :',req.body);
        //     const message = req.body.message;
        //     const mediaUrl = req.body.mediaUrl;
        //     await bot.sendMessage(process.env.FRIEND_NUMBER  ,message , {
        //         media: mediaUrl
        //     }) 
        //     res.end('mensaje enviado OK')
        // }));

        provider.http.server.post('/send-message', handleCtx(async (bot, req, res) => {
            try {
                const phone = req.body.phone || '542613907179'; // Usa el número predeterminado si no se proporciona uno
                const message = req.body.message;
                const mediaUrl = req.body.mediaUrl;
        
                if (!message || !phone) {
                    return res.status(400).json({ error: 'Phone number and message are required' });
                }
        
                console.log('Sending message to:', phone);
                console.log('Message:', message);
                if (mediaUrl) {
                    console.log('Media URL:', mediaUrl);
                }
        
                await bot.sendMessage(phone, message, {
                    media: mediaUrl 
                });
        
                res.status(200).send('Message sent successfully');
            } catch (error) {
                console.error('Error sending message:', error);
        
                // Verifica si el error está relacionado con un archivo bloqueado
                if (error.code === 'EBUSY' && error.syscall === 'unlink') {
                    console.error('File is busy or locked, unable to unlink:', error.path);
                }
        
                res.status(500).json({ error: 'Failed to send message' });
            }
        }));
    }

    await createBot({
        flow: flowDefault,
        database: new MemoryDB(),
        provider
    });

     
}

main()