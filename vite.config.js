/** 
 * @type {import ('vite').UserConfig}
*/

export default {
    build: {
        sourcemap: true,
    },
    server: {
        host: '0.0.0.0', // Listen on all IPs
        port: 5173,      // Ensure the port is correct
      }
}  


