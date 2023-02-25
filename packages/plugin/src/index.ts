import type { Plugin, ResolvedConfig } from 'vite';
import { dataToEsm } from '@rollup/pluginutils';

export function stripBomTag(content: string): string {
  if (content.charCodeAt(0) === 0xfeff) {
    return content.slice(1);
  }

  return content;
}

export interface JsonOptions {
  /**
   * Generate a named export for every property of the JSON object
   * @default true
   */
  namedExports?: boolean;
  /**
   * Generate performant output as JSON.parse("stringified").
   * Enabling this will disable namedExports.
   * @default false
   */
  stringify?: boolean;
}

// Custom json filter for vite
const excalidrawExtRE = /\.excalidraw(?:$|\?)(?!commonjs-(?:proxy|external))/;

const excalidrawLangs = `\\.(?:excalidraw)(?:$|\\?)`;
const excalidrawLangRE = new RegExp(excalidrawLangs);

export const isJSONRequest = (request: string): boolean => excalidrawLangRE.test(request);

export function loadExcalidrawAsJson(options: JsonOptions = {}): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'excalidraw-as-json',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    transform(json, id) {
      if (!excalidrawExtRE.test(id)) return null;

      json = stripBomTag(json);

      try {
        if (options.stringify) {
          if (config.mode === 'production') {
            return {
              // during build, parse then double-stringify to remove all
              // unnecessary whitespaces to reduce bundle size.
              code: `export default JSON.parse(${JSON.stringify(JSON.stringify(JSON.parse(json)))})`,
              map: { mappings: '' },
            };
          } else {
            return `export default JSON.parse(${JSON.stringify(json)})`;
          }
        }

        const parsed = JSON.parse(json);
        return {
          code: dataToEsm(parsed, {
            preferConst: true,
            namedExports: options.namedExports,
          }),
          map: { mappings: '' },
        };
      } catch (e) {
        const errorMessageList = /\d+/.exec((e as any).message);
        const position = errorMessageList && parseInt(errorMessageList[0], 10);
        const msg = position ? `, invalid JSON syntax found at line ${position}` : `.`;
        this.error(`Failed to parse JSON file` + msg, (e as any).idx);
      }
    },
  };
}
