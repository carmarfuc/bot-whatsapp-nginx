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
        
        provider.http.server.post('/send-message', handleCtx(async (bot, req, res)=> {
            // const phone = req.body.phone // se puede pasar por parametros del request
            const phone = '542613907179';
            console.log('body :',req.body);
            const message = req.body.message;
            const mediaUrl = req.body.mediaUrl;
            await bot.sendMessage(process.env.FRIEND_NUMBER  ,message , {
                media: mediaUrl
            }) // en lugar de la .env se puede usar directamente req.body.phone
            res.end('mensaje enviado OK')
        }));
    }

    await createBot({
        flow: flowDefault,
        database: new MemoryDB(),
        provider
    });

     
}

main()