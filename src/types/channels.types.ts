
export interface StyleOptions {
  color?: string;
  backgroundColor?: string;
  fontWeight?: string;
}

export interface DefaultOptions {
  style: StyleOptions;
}

export interface Options {
  style?: StyleOptions;
}

export interface ChannelConfig {
  options?: Options;
}
