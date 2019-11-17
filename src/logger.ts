import merge from 'lodash/merge';
import each from 'lodash/each';
import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';
import map from 'lodash/map';
import { Chalk } from 'chalk';
import InternalTypeRef from './types/index.type-ref';

let loadedChalk: any;

const loadChalk = (): Chalk => {
  if (!loadedChalk) {
    // eslint-disable-next-line global-require
    loadedChalk = require('chalk');
  }
  return loadedChalk;
};

const defaultPathPieceStyle: InternalTypeRef.PathPieces.StyleChalk = {
  color: '#717171',
  fontWeight: '400',
  backgroundColor: null, // 'transparent',
};

const generatePathStyle = (style: InternalTypeRef.PathPieces.StyleCSS | null = null) => {
  let pathStyle: InternalTypeRef.PathPieces.StyleCSS = {
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

const generatePathPieceChalk = (piece: string, style: InternalTypeRef.PathPieces.Style) => {
  const pathStyle: InternalTypeRef.PathPieces.StyleChalk = {
    color: style.color || defaultPathPieceStyle.color,
    backgroundColor: style.backgroundColor || defaultPathPieceStyle.backgroundColor,
    fontWeight: style.fontWeight || defaultPathPieceStyle.fontWeight,
  };

  let generated = loadChalk().hex(pathStyle.color);

  if (pathStyle.backgroundColor) {
    generated = generated.bgHex(pathStyle.backgroundColor);
  }

  if (pathStyle.fontWeight === '700') {
    return generated.bold(piece).toString();
  }

  return generated(piece).toString();
};

class Logger<ChannelIds extends InternalTypeRef.ChannelIdsObj = InternalTypeRef.ChannelIdsObj> {
  public channels: ChannelIds;

  protected _config: InternalTypeRef.LoggerConfig = {
    mutedChannels: [],
    everythingMuted: false,
    channels: {},
    colorSupportType: null,
  };

  public constructor(args: InternalTypeRef.LoggerConstructorArgs<ChannelIds>) {
    this.channels = args.channelIds;
    this._config.channels = args.channels;
    this._config.colorSupportType = args.colorSupportType;
  }

  public channel: InternalTypeRef.SetChannelCallback = channelId => ({
    ...this._logWithPath(channelId)(),
    withPath: this._logWithPath(channelId),
  });

  public muteChannel = (channelId: string) => {
    this._config.mutedChannels.push(channelId);
  };

  public unmuteChannel = (channelId: string) => {
    const index = this._config.mutedChannels.indexOf(channelId);
    if (index > -1) {
      this._config.mutedChannels.splice(index, 1);
    }
  };

  public muteAllChannels = () => {
    this._config.everythingMuted = true;
  };

  public unmuteAllChannels = () => {
    this._config.everythingMuted = false;
  };

  protected _logWithPath = (
    channelId: string,
  ): InternalTypeRef.LogWithPathCallback => (...path) => ({
    ...this._logWithOptions(channelId, path)({}),
    withOptions: this._logWithOptions(channelId, path),
  });

  protected _logWithOptions = (
    channelId: string,
    path: Array<InternalTypeRef.PathPieces.PathPiece | string>,
  ): InternalTypeRef.LogWithOptionsCallback => (options = {}) => ({
    log: this._log(channelId, options, path),
    error: this._logSpecial('error', channelId, options, path),
    warn: this._logSpecial('warn', channelId, options, path),
    info: this._logSpecial('info', channelId, options, path),
    success: this._logSpecial('success', channelId, options, path),
  });

  protected _logSpecial = (
    type: 'error' | 'warn' | 'info' | 'success',
    channelId: string,
    options: InternalTypeRef.Channels.Options,
    _path: Array<InternalTypeRef.PathPieces.PathPiece | string>,
  ): InternalTypeRef.LogCallback => (...messages: Array<any>) => {
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
    this._log(channelId, options, path)(...messages);
  };

  protected _log = (
    channelId: string,
    options: InternalTypeRef.Channels.Options = {},
    pathPieces: Array<InternalTypeRef.PathPieces.PathPiece | string> = [],
  ): InternalTypeRef.LogCallback => (...messages: Array<any>): void => {
    const channel = this._config.channels[channelId];
    if (!isPlainObject(channel)) {
      return;
    }

    const opts: InternalTypeRef.Channels.DefaultOptions = {
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

    if (this._config.colorSupportType === 'chrome') {
      path = `%c[${channelId}]`;
      pathStyles.push(generatePathStyle({
        color: opts.style.color,
        'background-color': opts.style.backgroundColor,
        'font-weight': opts.style.fontWeight,
      }));

      if (isArray(pathPieces)) {
        each(pathPieces, (piece: InternalTypeRef.PathPieces.PathPiece | string) => {
          if (typeof piece === 'object') {
            path += `%c[${piece.label}]`;
            pathStyles.push(generatePathStyle(piece.style));
          } else {
            path += `%c[${piece}]`;
            pathStyles.push(generatePathStyle());
          }
        });
      }
    } else if (this._config.colorSupportType === 'terminal') {
      path = generatePathPieceChalk(`[${channelId}]`, opts.style);
      each(pathPieces, (piece: InternalTypeRef.PathPieces.PathPiece | string) => {
        if (typeof piece === 'object') {
          path += generatePathPieceChalk(`[${piece.label}]`, piece.style || {});
        } else {
          path += generatePathPieceChalk(`[${piece}]`, {});
        }
      });
    } else {
      path = `[${channelId}]`;
      each(pathPieces, (piece: InternalTypeRef.PathPieces.PathPiece | string) => {
        if (typeof piece === 'object') {
          path += `[${piece.label}]`;
        } else {
          path += `[${piece}]`;
        }
      });
    }

    if (this._config.mutedChannels.indexOf(channelId) === -1 && !this._config.everythingMuted) {
      console.log(
        path,
        ...pathStyles,
        ...messages,
      );
    }
  };
}

export default Logger;
