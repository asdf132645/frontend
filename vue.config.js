const path = require('path');
const glob = require('glob-all');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src/')
      }
    },
    plugins: [
      new PurgeCSSPlugin({
        paths: glob.sync([
          path.join(__dirname, './src/**/*.vue'),
          path.join(__dirname, './public/index.html'),
        ]),
        // 기타 설정 옵션
      }),
    ],
  },
  // Vue 컴파일러 설정
  // Vue 3에서 productionMode 설정 추가
  chainWebpack: (config) => {
    config.module
        .rule('vue')
        .use('vue-loader')
        .tap(options => {
          // Vue Loader 옵션에 productionMode 추가
          options.compilerOptions = {
            productionMode: true,
            ...(options.compilerOptions || {}),
          };
          return options;
        });
  },
};
