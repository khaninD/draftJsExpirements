const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const env = process.env.NODE_ENV.trim();
const isDevelopBuild = env === 'dev';
const config = isDevelopBuild ? require('./webpack_cfg/webpack.dev') : require('./webpack_cfg/webpack.prod');
let printInfo;
/**
 * Flag indicating whether webpack compiled for the first time.
 * @type {boolean}
 */
let isInitialCompilation = true;

if (isDevelopBuild) {
  const options = config.devServer;
  port = options.port;
  webpackDevServer.addDevServerEntrypoints(config, options);
  new webpackDevServer(webpack(config), config.devServer)
    .listen(port, 'localhost', (err) => {
      if (err) {
        console.log(err);
      }
      console.log('Listening at localhost:' + port);
    });
  printInfo = () => {
    console.log('\n✓ The bundle is now ready for serving!\n');
    console.log('  Open in iframe mode:\t\x1b[33m%s\x1b[0m',  'http://localhost:' + port + '/webpack-dev-server/');
    console.log('  Open in inline mode:\t\x1b[33m%s\x1b[0m', 'http://localhost:' + port + '/\n');
    console.log('  \x1b[33mHMR is active\x1b[0m. The bundle will automatically rebuild and live-update on changes.')
  }
} else {
  printInfo = () => console.log('\n✓ The bundle is now ready!\n');
}
webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    // Handle errors here
  }
  if (isInitialCompilation) {
    // Ensures that we log after webpack printed its stats (is there a better way?)
    setTimeout(printInfo, 350);
  }
  isInitialCompilation = false;
});