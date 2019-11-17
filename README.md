# log-in-channel

[![npm](https://img.shields.io/npm/v/log-in-channel.svg)](https://npmjs.com/package/log-in-channel) [![GitHub](https://img.shields.io/github/license/florianstahr/log-in-channel.svg?colorB=brightgreen)](https://github.com/florianstahr/log-in-channel)

No messy console.log's anymore! Log things in specific channels you can mute, unmute and give specific colors.

![https://i.imgur.com/VKxwRQO.png](https://i.imgur.com/VKxwRQO.png)

## Install

```
$ npm install log-in-channel
```
or
```
$ yarn add log-in-channel
```

## Usage

Define your own instance of `Logger` in one file and use it in all other files!

```javascript
// logger.helper.js
import Logger from 'log-in-channel';

// define constants for channel ids --> easier use while developing

const ChannelIds = {
  DEFAULT: 'default',
  auth: {
    STATE: 'auth/state',
  },
};

// init with channel configs
/*

{
  colorSupportType?: null | 'terminal' | 'chrome', // Define here in which environment you are
  // null --> no colored logs
  // 'terminal' --> colored logs where chalk (npm package) works
  // 'chrome' --> colored logs where css styled logs work

  channel: {
    '<id of channel>': {
      // channel config params
      options?: {
        style?: {
          color?: '<hexa color code>', // string
          backgroundColor?: '<hexa color code>', // string
          fontWeight?: '<400 | 700>', // string
        },
      },
    },
  },
}

*/


const CustomLogger = new Logger<typeof ChannelIds>({
  colorSupportType: 'terminal',
  channelIds: ChannelIds,
  channels: {
    'default': {},
    'auth/state': {
      options: {
        style: {
          color: '#009aff',
        },
      },
    },

    ...
 },
});

export default CustomLogger;
```

```javascript
// myfile.js
import CustomLogger from '../helpers/logger.helper';

CustomLogger.channel(CustomLogger.channels.auth.STATE).withPath('set').success('logged in :D');
```

And if you don't want to have logs of one channel, you can mute it and unmute it, when you need it again.

```javascript
CustomLogger.muteChannel(CustomLogger.channels.auth.STATE); // mute single channel

CustomLogger.unmuteChannel(CustomLogger.channels.auth.STATE); // unmute single channel

CustomLogger.muteAllChannels(); // mute all channels

CustomLogger.unmuteAllChannels(); // unmute all channels
```

## Example

You can find an example in the [`example`](https://github.com/florianstahr/log-in-channel/tree/master/example) directory.

Run with `ts-node example/example.ts` or `yarn run:example` or `npm run run:example`!

## License

This repo is licensed under the [MIT License](https://github.com/florianstahr/log-in-channel/blob/master/LICENSE).
