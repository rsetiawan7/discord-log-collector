import dgram from 'dgram';
import config from '../conf.json';
import { sendLogToChannel } from './discord';
import { Logger } from './logger';

const {
  host: APP_ADDRESS,
  port: APP_PORT,
} = config;

const server = dgram.createSocket('udp4');

server.on('message', (message: Buffer, info: dgram.RemoteInfo) => {
  Logger.debug(`Receives data from client: ${message.toString()}`);
  Logger.debug(`Receives ${message.length} bytes from ${info.address}:${info.port}`);

  sendLogToChannel(message.toString());
});

server.on('listening', () => {
  const address = server.address();
  Logger.info(`Server is listening at -> ${address.address}:${address.port} (${address.port})`);
});

server.on('close', () => {
  Logger.info('Socket was closed.');
});

server.on('error', (error) => {
  Logger.error(error.message);
  server.close();
});

server.bind(APP_PORT as unknown as number, APP_ADDRESS);
