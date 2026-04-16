import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { version } from '../package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.m4a"],
  define: {
    __LIB_VERSION__: JSON.stringify(version),
  },
})
