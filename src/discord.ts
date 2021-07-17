import dotenv from 'dotenv';
import Discord from 'discord.js';

dotenv.config();

let loggedIn = false;
let isTextChannel = false;
let channel: Discord.Channel | Discord.TextChannel | undefined;

const {
  DEBUG_ENABLED,
  DISCORD_BOT_TOKEN,
  DISCORD_CHANNEL_ID,
} = process.env;

const client = new Discord.Client();

export const sendLogToChannel = (message: string): void => {
  if (!loggedIn) {
    if (DEBUG_ENABLED) {
      console.log('[DEBUG] Not logged in.');
    }

    return;
  }

  if (!DISCORD_CHANNEL_ID) {
    if (DEBUG_ENABLED) {
      console.log('[DEBUG] Channel ID not configured properly.');
    }

    return;
  }

  if (!isTextChannel) {
    if (DEBUG_ENABLED) {
      console.log(`[DEBUG] Channel ID ${DISCORD_CHANNEL_ID} is not a text channel.`);
    }

    return;
  }

  const content = {
    content: `\`${message.split(']: ')}\``, tts: false,
  };

  (channel as unknown as Discord.TextChannel).send(content)
    .then((value: Discord.Message) => {
      if (DEBUG_ENABLED) {
        console.log(`[DEBUG] Message sent to channel ID ${DISCORD_CHANNEL_ID}`);
        console.log(value);
      }
    })
    .catch((reason) => {
      console.warn(`Failed to send content: ${reason}`);
    });
}

client.login(DISCORD_BOT_TOKEN).then(async (value: string) => {
  if (!DISCORD_CHANNEL_ID) {
    if (DEBUG_ENABLED) {
      throw Error('Channel ID not configured properly.');
    }
  }

  channel = await client.channels.fetch(DISCORD_CHANNEL_ID as string);

  if (!channel) {
    console.warn(`Channel ID ${DISCORD_CHANNEL_ID} not found.`);
  } else {
    if (!(channel as unknown as Discord.Channel).isText()) {
      console.warn(`Channel ID ${DISCORD_CHANNEL_ID} is not a text channel.`);
    } else {
      loggedIn = true;
      isTextChannel = true;
      console.info(`Logged in -> ${value}`);
    }
  }
}).catch((reason: any) => {
  console.warn(`Failed to login -> ${reason}`);
});
