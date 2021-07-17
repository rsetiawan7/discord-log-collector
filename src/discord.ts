import dotenv from 'dotenv';
import Discord from 'discord.js';
import * as _Channels from './channels.json';

dotenv.config();

let loggedIn = false;
const Channels: { [key: string]: string } = _Channels;
const isTextChannel: { [key: string]: boolean } = {};
const discordChannel: { [key: string]: Discord.Channel | Discord.TextChannel | undefined } = {};

const {
  DEBUG_ENABLED,
  DISCORD_BOT_TOKEN,
} = process.env;

const client = new Discord.Client();

export const sendLogToChannel = (message: string): void => {
  if (!loggedIn) {
    if (DEBUG_ENABLED) {
      console.log('[DEBUG] Not logged in.');
    }

    return;
  }

  for (const tag of Object.keys(Channels)) {
    if (tag === 'default') {
      continue;
    }

    const channelId = Channels[tag];
    const discordChan = discordChannel[tag];

    if (!discordChan) {
      if (DEBUG_ENABLED) {
        console.log(`[DEBUG] Channel ID "${channelId}" for env. "${tag}" not configured properly.`);
      }

      return;
    }

    const textChannel = isTextChannel[tag];

    if (!textChannel) {
      if (DEBUG_ENABLED) {
        console.log(`[DEBUG] Channel ID "${channelId}" for env. "${tag}" is not a text channel.`);
      }

      return;
    }

    if (message.indexOf(tag) >= 0) {
      const squareBracketIndex = message.indexOf(']');
    
      if (squareBracketIndex < 0) {
        if (DEBUG_ENABLED) {
          console.log(`[DEBUG] Wrong format message. Expected: any square bracket. Found: ${message}`);
        }
    
        return;
      }
    
      const content = `\`${message.substring((squareBracketIndex + 3), (message.length - 1))}\``;
    
      (discordChan as unknown as Discord.TextChannel).send({ content })
        .then((value: Discord.Message) => {
          if (DEBUG_ENABLED) {
            console.log(`[DEBUG] Message sent to channel ID ${Channels[tag]}`);
            console.log(value);
          }
        })
        .catch((reason) => {
          console.warn(`Failed to send content: ${reason}`);
        });

      return;
    }
  }

  console.warn(`[WARN] Message not classified. Message: ${message}`);
}

client.login(DISCORD_BOT_TOKEN).then(async (value: string) => {
  if (!Channels) {
    if (DEBUG_ENABLED) {
      throw Error('Channel IDs not configured properly.');
    }
  }

  for (const tag of Object.keys(Channels)) {
    if (tag === 'default') {
      continue;
    }
    
    if (DEBUG_ENABLED) {
      console.log(`[DEBUG] Checking channel ID from env. "${tag}"`);
    }

    const channelId = Channels[tag] as string;

    if (DEBUG_ENABLED) {
      console.log(`[DEBUG] Channel ID from env. "${tag}": ${JSON.stringify(channelId)}`);
    }

    const channel = await client.channels.fetch(channelId as string);

    if (DEBUG_ENABLED) {
      console.log(`[DEBUG] Fetch result env. "${tag}" from channel ID "${channelId}": ${channel}`);
    }

    if (!channel) {
      console.warn(`Channel ID "${channelId}" in env. "${tag}" not found.`);
    } else {
      if (!(channel as unknown as Discord.Channel).isText()) {
        isTextChannel[tag] = false;
        console.warn(`Channel ID "${channelId}" in env. "${tag}" is not a text channel.`);
      } else {
        discordChannel[tag] = channel;
        isTextChannel[tag] = true;
      }
    }
  }

  loggedIn = true;
  console.info(`Logged in -> ${value}`);
}).catch((reason: any) => {
  console.warn(`Failed to login -> ${reason}`);
});
