import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    base: "/PerfectWorld-Interactive-Map-Website/",
    plugins: [plugin()],
    server: {
        port: 62332,
    }
})