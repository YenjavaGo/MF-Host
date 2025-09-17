const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const { VueLoaderPlugin } = require('vue-loader');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  target: 'web',
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.vue', '.json'],
    alias: {
      '@': require('path').resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true
        },
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        extensions: {
          vue: {
            enabled: true,
            compiler: '@vue/compiler-sfc'
          }
        }
      }
    }),
    new ModuleFederationPlugin({
      name: 'mf_host',
      filename: 'remoteEntry.js',
      remotes: {
        // 這裡可以添加遠程微前端應用
        'mf_remote_app1': 'vueRemote@http://localhost:3001/remoteEntry.js',
        // 'mf_remote_app2': 'mf_remote_app2@http://localhost:3002/remoteEntry.js'
      },
      exposes: {
        // Host可以暴露的組件或功能
        './HostApp': './src/App.vue',
        './Router': './src/router/index.ts',
        './I18n': './src/i18n/index.ts'
      },
      shared: ['vue', 'vue-router', 'element-plus', 'vue-i18n']
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: true,
      title: '微前端Host應用 - Vue 3 + Module Federation + Element Plus'
    })
  ]
};
