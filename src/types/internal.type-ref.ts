import * as Channels from './channels.types';
import * as PathPieces from './path-pieces.types';

export interface LoggerConfig {
  mutedChannels: string[];
  everythingMuted: Boolean;
  channels: {
    [key: string]: Channels.ChannelConfig;
  };
  colorSupportType: null | 'terminal' | 'chrome';
}

export type LogCallback = (...messages: any[]) => void;

export interface LogWithOptionsResult {
  log: LogCallback;
  error: LogCallback;
  warn: LogCallback;
  info: LogCallback;
  success: LogCallback;
}

export type LogWithOptionsCallback = (options?: Channels.Options) => LogWithOptionsResult;

export interface LogWithPathResult extends LogWithOptionsResult {
  withOptions: LogWithOptionsCallback;
}

export type LogWithPathCallback = (
  ...path: (PathPieces.PathPiece | string)[]
) => LogWithPathResult;

export interface SetChannelResult extends LogWithPathResult {
  withPath: LogWithPathCallback;
}

export type SetChannelCallback = (channelId: string) => SetChannelResult;

export interface ChannelIdsObj {
  [key: string]: string | ChannelIdsObj;
}

export interface LoggerConstructorArgs<ChannelIds extends ChannelIdsObj> {
  channels: {
    [key: string]: Channels.ChannelConfig
  };
  channelIds: ChannelIds;
  colorSupportType: null | 'terminal' | 'chrome'
}

export interface LogEvent {
  channelId: string;
  path: (PathPieces.PathPiece | string)[];
  messages: string[];
}

export type LogEventListener = (event: LogEvent) => void;

export {
  Channels,
  PathPieces,
};
