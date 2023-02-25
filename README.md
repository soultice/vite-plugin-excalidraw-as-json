# vite-plugin-load-excalidraw-as-json

Loads `.excalidraw` extension as JSON files, useful if you want to process them yourself e.g. with the `@excalidraw/excalidraw` package

## Usage 

in `vite.config.ts`
```typescript
import { loadExcalidrawAsJson } from 'vite-plugin-excalidraw-as-json'

export default defineConfig{
  ...
  plugins: [excalidrawAsJson()]
  ...
}
```





