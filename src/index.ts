import dgram from 'dgram';
import dotenv from 'dotenv';
import { sendLogToChannel } from './discord';

dotenv.config();

const {
  APP_ADDRESS,
  APP_PORT,
  DEBUG_ENABLED,
} = process.env;

const server = dgram.createSocket('udp4');

server.on('message', (message: Buffer, info: dgram.RemoteInfo) => {
  if (DEBUG_ENABLED) {
    // tslint:disable-next-line: no-console
    console.log(`[DEBUG] Receives data from client: ${message.toString()}`);
    // tslint:disable-next-line: no-console
    console.log(`[DEBUG] Receives ${message.length} bytes from ${info.address}:${info.port}`);
  }

  sendLogToChannel(message.toString());
});

server.on('listening', () => {
  const address = server.address();
  // tslint:disable-next-line: no-console
  console.info(`Server is listening at -> ${address.address}:${address.port} (${address.port})`);
});

server.on('close', () => {
  // tslint:disable-next-line: no-console
  console.info('Socket was closed.');
});

server.on('error', (error) => {
  // tslint:disable-next-line: no-console
  console.error(error);
  server.close();
});

server.bind(APP_PORT as unknown as number, APP_ADDRESS);
