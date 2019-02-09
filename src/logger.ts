import merge from 'lodash/merge';
import each from 'lodash/each';
import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';
import map from 'lodash/map';
import chalk from 'chalk';

export interface PathPieceStyle {
  color?: string
  backgroundColor?: string | null
  fontWeight?: string
}

export interface PathPieceStyleCSS {
  color?: string
  'background-color'?: string | null
  'font-weight'?: string
}

export interface PathPieceStyleChalk {
  color: string
  backgroundColor: string | null
  fontWeight: string,
}

export interface PathPiece {
  label: string
  style?: PathPieceStyle
}

export interface ChannelOptionsStyle {
  color?: string
  backgroundColor?: string | null
  fontWeight?: string
}

export interface ChannelOptionsDefault {
  style: ChannelOptionsStyle
}

export interface ChannelOptions {
  style?: ChannelOptionsStyle
}

export interface Channel {
  options?: any
}

export interface Channels {
  [propName: string]: Channel;
}

export interface LoggerConfig {
  mutedChannels: Array<string>
  everythingMuted: Boolean
  channels: Channels
  colorSupportType: null | 'terminal' | 'chrome'
}

const muteChannel = (config: LoggerConfig) => (channelId: string) => {
  config.mutedChannels.push(channelId);
};

const unmuteChannel = (config: LoggerConfig) => (channelId: string) => {
  const index = config.mutedChannels.indexOf(channelId);
  if (index > -1) {
    config.mutedChannels.splice(index, 1);
  }
};

const muteAllChannels = (config: LoggerConfig) => () => {
  config.everythingMuted = true;
};

const unmuteAllChannels = (config: LoggerConfig) => () => {
  config.everythingMuted = false;
};

const defaultPathPieceStyle: PathPieceStyleChalk = {
  color: '#717171',
  fontWeight: '400',
  backgroundColor: null, // 'transparent',
};

const generatePathStyle = (style: PathPieceStyleCSS | null = null) => {
  let pathStyle: PathPieceStyleCSS = {
    color: defaultPathPieceStyle.color,
    'font-weight': '400',
    'background-color': null,
  };

  if (isPlainObject(style)) {
    pathStyle = {
      ...pathStyle,
      ...style,
    };
  }
  return map(pathStyle, (key, val) => `${val}: ${key}`).join('; ');
};

const generatePathPieceChalk = (piece: string, style: PathPieceStyle) => {
  const pathStyle: PathPieceStyleChalk = {
    color: style.color || defaultPathPieceStyle.color,
    backgroundColor: style.backgroundColor || defaultPathPieceStyle.backgroundColor,
    fontWeight: style.fontWeight || defaultPathPieceStyle.fontWeight,
  };

  let generated = chalk.hex(pathStyle.color);

  if (pathStyle.backgroundColor) {
    generated = generated.bgHex(pathStyle.backgroundColor);
  }

  if (pathStyle.fontWeight === '700') {
    return generated.bold(piece).toString();
  }

  return generated(piece).toString();
};

const logInChannel = (
  config: LoggerConfig,
  channelId: string,
  options: ChannelOptions = {},
  pathPieces: Array<PathPiece | string> = [],
) => (...messages: Array<any>) => {
  const channel = config.channels[channelId];
  if (!isPlainObject(channel)) {
    return;
  }

  const opts: ChannelOptionsDefault = {
    style: {
      color: '#7a7a7a',
      backgroundColor: null,
      fontWeight: '400',
    },
  };

  each([channel.options, options], (theoptions) => {
    if (isPlainObject(theoptions)) {
      merge(opts, theoptions);
    }
  });

  let path: string = '';
  const pathStyles: any = [];

  if (config.colorSupportType === 'chrome') {
    path = `%c[${channelId}]`;
    pathStyles.push(generatePathStyle({
      color: opts.style.color,
      'background-color': opts.style.backgroundColor,
      'font-weight': opts.style.fontWeight,
    }));

    if (isArray(pathPieces)) {
      each(pathPieces, (piece: PathPiece | string) => {
        if (typeof piece === 'object') {
          path += `%c[${piece.label}]`;
          pathStyles.push(generatePathStyle(piece.style));
        } else {
          path += `%c[${piece}]`;
          pathStyles.push(generatePathStyle());
        }
      });
    }
  } else if (config.colorSupportType === 'terminal') {
    path = generatePathPieceChalk(`[${channelId}]`, opts.style);
    each(pathPieces, (piece: PathPiece | string) => {
      if (typeof piece === 'object') {
        path += generatePathPieceChalk(`[${piece.label}]`, piece.style || {});
      } else {
        path += generatePathPieceChalk(`[${piece}]`, {});
      }
    });
  } else {
    path = `[${channelId}]`;
    each(pathPieces, (piece: PathPiece | string) => {
      if (typeof piece === 'object') {
        path += `[${piece.label}]`;
      } else {
        path += `[${piece}]`;
      }
    });
  }

  if (config.mutedChannels.indexOf(channelId) === -1 && !config.everythingMuted) {
    console.log(
      path,
      ...pathStyles,
      ...messages,
    );
  }
};

const logSpecial = (
  config: LoggerConfig,
  type: 'error' | 'warn' | 'info' | 'success',
  channelId: string,
  options: ChannelOptions,
  _path: Array<PathPiece | string>,
) => (...messages: Array<any>) => {
  const path = _path;
  switch (type) {
    case 'error':
      path.push({
        label: 'ERROR',
        style: {
          color: '#ff2400',
          fontWeight: '700',
        },
      });
      break;
    case 'warn':
      path.push({
        label: 'INFO',
        style: {
          color: '#ff8c00',
          fontWeight: '700',
        },
      });
      break;
    case 'info':
      path.push({
        label: 'INFO',
        style: {
          color: '#ffdf00',
          'background-color': '#000',
          fontWeight: '700',
        },
      });
      break;
    case 'success':
      path.push({
        label: 'SUCCESS',
        style: {
          color: '#3ce200',
          'background-color': '#000',
          fontWeight: '700',
        },
      });
      break;
    default:
  }
  logInChannel(config, channelId, options, path)(...messages);
};

const logWithOptions = (
  config: LoggerConfig,
  channelId: string,
  path: Array<PathPiece | string>,
) => (options: ChannelOptions = {}) => ({
  log: logInChannel(config, channelId, options, path),
  error: logSpecial(config, 'error', channelId, options, path),
  warn: logSpecial(config, 'warn', channelId, options, path),
  info: logSpecial(config, 'info', channelId, options, path),
  success: logSpecial(config, 'success', channelId, options, path),
});

const logWithPath = (
  config: LoggerConfig,
  channelId: string,
) => (...path: Array<PathPiece | string>) => ({
  log: logInChannel(config, channelId, {}, path),
  error: logSpecial(config, 'error', channelId, {}, path),
  warn: logSpecial(config, 'warn', channelId, {}, path),
  info: logSpecial(config, 'info', channelId, {}, path),
  success: logSpecial(config, 'success', channelId, {}, path),
  withOptions: logWithOptions(config, channelId, path),
});

const setChannel = (config: LoggerConfig) => (channelId: string) => ({
  log: logInChannel(config, channelId, {}, []),
  error: logSpecial(config, 'error', channelId, {}, []),
  warn: logSpecial(config, 'warn', channelId, {}, []),
  info: logSpecial(config, 'info', channelId, {}, []),
  success: logSpecial(config, 'success', channelId, {}, []),
  withPath: logWithPath(config, channelId),
  withOptions: logWithOptions(config, channelId, []),
});

export interface LoggerInitOptions {
  channels: Channels
  colorSupportType: null | 'terminal' | 'chrome'
}

const loggerInit = (config: LoggerConfig) => (options: LoggerInitOptions) => {
  config.channels = {
    ...config.channels,
    ...options.channels,
  };

  if (options.colorSupportType) {
    config.colorSupportType = options.colorSupportType;
  }
};

class Logger {
  public channels: any = {};

  private config: LoggerConfig = {
    mutedChannels: [],
    everythingMuted: false,
    channels: {},
    colorSupportType: null,
  };

  public channel = setChannel(this.config);

  public init = loggerInit(this.config);

  public helper = {
    channel: {
      mute: muteChannel(this.config),
      unmute: unmuteChannel(this.config),
      muteAll: muteAllChannels(this.config),
      unmuteAll: unmuteAllChannels(this.config),
    },
  };
}

export default Logger;
