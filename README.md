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

const CustomLogger = new Logger();

// init with channel configs
/*

{
  channel: {
    '<id of channel>': {
      // channel config params
      options?: {
        style?: {
          color?: '<hexa color code>', // string
          backgroundColor?: '<hexa color code>', // string
          fontWeight?: '<100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900>', // string
        },
      },
    },
  },
}

*/

CustomLogger.init({
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

// define constants for channel ids --> easier use while developing

CustomLogger.channels = {
  DEFAULT: 'default',
  auth: {
    STATE: 'auth/state',
  },
};

export default CustomLogger;
```

```javascript
// myfile.js
import CustomLogger from '../helpers/logger.helper';

CustomLogger.channel(CustomLogger.channels.auth.STATE).withPath('set').success('logged in :D');
```

And if you don't want to have logs of one channel, you can mute it and unmute it, when you need it again.

```javascript
CustomLogger.helper.channel.mute(CustomLogger.channels.auth.STATE); // mute single channel

CustomLogger.helper.channel.unmute(CustomLogger.channels.auth.STATE); // unmute single channel

CustomLogger.helper.channel.muteAll(); // mute all channels

CustomLogger.helper.channel.unmuteAll(); // unmute all channels
```

## License

This repo is licensed under the [MIT License](https://github.com/florianstahr/log-in-channel/blob/master/LICENSE).
