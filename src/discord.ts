import config from '../conf.json';
import Discord from 'discord.js';
import { Logger } from './logger';

interface IConfigChannel {
  tag: string;
  contains: string;
  channelId: string;
}

let loggedIn = false;
const isTextChannel: { [key: string]: boolean } = {};
const discordChannel: { [key: string]: Discord.Channel } = {};

const {
  discordBotToken: DISCORD_BOT_TOKEN,
  collectors: DISCORD_CHANNELS,
} = config;

const client = new Discord.Client();

export const sendLogToChannel = (message: string): void => {
  if (!loggedIn) {
    Logger.warn('Not logged in.');
    return;
  }

  let selectedChannel: IConfigChannel = null as unknown as IConfigChannel;

  for (const channel of DISCORD_CHANNELS) {
    if (message.search(channel.tag) < 0) {
      continue;
    }

    const containsText = new RegExp(channel.contains, 'i').test(message);
    if (!containsText) {
      continue;
    }

    if (!discordChannel[channel.channelId]) {
      continue;
    }

    if (!isTextChannel[channel.channelId]) {
      continue;
    }

    selectedChannel = channel;
    break;
  }

  if (!selectedChannel) {
    return;
  }

  const {
    channelId,
    tag,
  } = selectedChannel;

  if (!(channelId in discordChannel)) {
    Logger.warn(`Discord channel ID ${channelId} was not found. Skipping ...`);
    return;
  }

  const discordChan = discordChannel[channelId];

  if (!isTextChannel[channelId]) {
    Logger.warn(`Channel ID "${channelId}" is not a text channel.`);
    return;
  }

  if (message.indexOf(tag) >= 0) {
    const squareBracketIndex = message.indexOf(']');

    if (squareBracketIndex < 0) {
      Logger.warn(`Wrong format message. Expected: any square bracket. Found: ${message}`);
      return;
    }

    let content = message;

    if (message.indexOf('`') >= 0) {
      content = `\`\`\`${message.substring((squareBracketIndex + 3), (message.length))}\`\`\``;
    } else {
      content = `\`${message.substring((squareBracketIndex + 3), (message.length))}\``;
    }

    Logger.debug(message);

    (discordChan as unknown as Discord.TextChannel).send({ content })
      .then((value: Discord.Message) => {
        Logger.debug(`Message sent to channel ID ${channelId}`);
        Logger.debug(value.toString());
      })
      .catch((reason) => {
        Logger.error(`Failed to send content: ${reason}`);
      });

    return;
  }
}

client.login(DISCORD_BOT_TOKEN).then(async (value: string) => {
  if (!Array.isArray(DISCORD_CHANNELS)) {
    throw Error('Discord Channel IDs not configured properly.');
  }

  Logger.log(JSON.stringify(DISCORD_CHANNELS));

  for (const channel of DISCORD_CHANNELS) {
    const {
      channelId,
      contains,
      tag,
    } = channel;

    Logger.debug(`Checking channel ID ${channelId} from config file -> tag: "${tag}" | contains: ${contains}`);

    const discordChan = await client.channels.fetch(channelId as string);
    Logger.debug(`Fetch result env. "${tag}" from channel ID "${channelId}": ${discordChan}`);

    if (!discordChan) {
      Logger.warn(`Channel ID "${channelId}" not found.`);
      continue;
    }

    if (!discordChan.isText()) {
      Logger.warn(`Channel ID "${channelId}" is not a text channel.`);
      isTextChannel[channelId] = false;
      continue;
    }

    discordChannel[channelId] = discordChan;
    isTextChannel[channelId] = true;
  }

  loggedIn = true;
  Logger.info(`Logged in -> ${value}`);
  // setInterval(() => sendLogToChannel('[ragemp_test] error hei'), 1000);
}).catch((reason: any) => {
  Logger.warn(`Failed to login -> ${reason}`);
});
