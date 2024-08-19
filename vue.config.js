const path = require('path'); // path 모듈 불러오기
const Dotenv = require('dotenv-webpack');
const glob = require('glob-all');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');

module.exports = {
  devServer: {
    port: 8081, // 또는 원하는 포트 번호
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src/')
      },
      fallback: {
        "process": require.resolve("process/browser")
      }
    },
    optimization: {
      minimize: true, // 코드 최소화
      splitChunks: {
        chunks: 'all', // 코드 스플리팅
      },
    },
    plugins: [
      new PurgeCSSPlugin({
        paths: glob.sync([
          path.join(__dirname, './src/**/*.vue'),
          path.join(__dirname, './public/index.html'),
        ]),
        safelist: {
          standard: ['body', 'html'], // PurgeCSS에서 안전하게 유지할 클래스들
        },
      }),
      new Dotenv(), // .env 파일 로드를 위한 설정 추가
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
