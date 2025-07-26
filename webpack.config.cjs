const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
  const browser = env.browser || 'chrome';
  const outpath = path.resolve(__dirname, 'dist', browser)

  return {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: {
      background: path.resolve(__dirname, 'src', 'scripts', 'background.js'),
      content: path.resolve(__dirname, 'src', 'scripts', 'content.js'),
      popup: path.resolve(__dirname, 'src', 'popup', 'popup.js'),
      options: path.resolve(__dirname, 'src', 'options', 'router.js'),
    },
    output: {
      path: outpath,
      filename: '[name].js',
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: 'src/manifest.json',
            to: 'manifest.json',
            transform: (content) => {
              const manifest = JSON.parse(content.toString());
              if (browser === 'firefox') {
                manifest.background = {
                  scripts: ['background.js'],
                };
                manifest.browser_specific_settings = {
                  gecko: {
                    id: 'ai-detox@example.com',
                  },
                };
              }
              return JSON.stringify(manifest, null, 2);
            },
          },
          { from: 'src/images', to: 'images' },
          { from: 'src/popup/popup.html', to: 'popup.html' },
          { from: 'src/popup/popup.css', to: 'popup.css' },
          { from: 'src/options', to: 'options' },
          { from: 'src/resources', to: 'resources' },
        ],
      }),
    ],
  };
};