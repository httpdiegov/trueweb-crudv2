// Para módulos CSS/SCSS
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// Para archivos de imagen
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Para archivos de fuentes
declare module '*.woff' {
  const value: string;
  export default value;
}

declare module '*.woff2' {
  const value: string;
  export default value;
}

declare module '*.ttf' {
  const value: string;
  export default value;
}

// Para archivos de audio/video
declare module '*.mp3' {
  const value: string;
  export default value;
}

declare module '*.mp4' {
  const value: string;
  export default value;
}

declare module '*.webm' {
  const value: string;
  export default value;
}

// Para archivos de datos
declare module '*.json' {
  const value: any;
  export default value;
}

// Para variables de entorno
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
    // Agrega aquí otras variables de entorno que necesites
  }
}

// Para el objeto window
declare global {
  interface Window {
    // Agrega aquí propiedades globales que necesites
    gtag?: (...args: any[]) => void;
  }
}
