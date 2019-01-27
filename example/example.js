const Logger = require('../dist/logger').default;

const CustomLogger = new Logger();

CustomLogger.init({
  channels: {
    'auth/state': {
      options: {
        style: {
          color: '#009aff',
        },
      },
    },
  },
});

CustomLogger.channels = {
  DEFAULT: 'default',
  auth: {
    STATE: 'auth/state',
  },
};

// export your logger to use in your application
// export default CustomLogger

// in another file

CustomLogger.channel(CustomLogger.channels.auth.STATE).withPath('set').error('An error happened somewhere...');
CustomLogger.channel(CustomLogger.channels.auth.STATE).withPath('set').success('signed in :D');
CustomLogger.channel(CustomLogger.channels.auth.STATE).withPath('user').log({
  user: {
    email: 'pete568g@gmail.com',
    givenName: 'Pete',
  },
});
CustomLogger.channel(CustomLogger.channels.auth.STATE).info('signed in on another device!');
