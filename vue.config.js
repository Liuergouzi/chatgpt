const { defineConfig } = require('@vue/cli-service')
const CompressionWebpackPlugin = require('compression-webpack-plugin');
module.exports = defineConfig({
  assetsDir: 'static',
  parallel: false,
  publicPath: './',
    // 配置webpack 打包压缩
    configureWebpack: config => {
        config.plugins.push(
          new CompressionWebpackPlugin({
            test: /\.js$|\.html$|\.css$/,
            // 超过4kb压缩
            threshold: 4096
          })
        );
    }    
})

