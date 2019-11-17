
export interface Style {
  color?: string
  backgroundColor?: string | null
  fontWeight?: string
}

export interface StyleCSS {
  color?: string
  'background-color'?: string | null
  'font-weight'?: string
}

export interface StyleChalk {
  color: string
  backgroundColor: string | null
  fontWeight: string,
}

export interface PathPiece {
  label: string
  style?: Style;
}
