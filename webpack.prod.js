const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const { VueLoaderPlugin } = require('vue-loader');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './src/main.ts',
  experiments: {
    topLevelAwait: true
  },
  target: 'web',
  optimization: {
    splitChunks: false,
    minimize: true
  },
  output: {
    publicPath: 'auto',
    clean: true,
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.vue', '.json'],
    alias: {
      '@': require('path').resolve(__dirname, 'src'),
      'vue': 'vue/dist/vue.runtime.esm-bundler.js'
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
        'workflow': 'workflow@http://localhost:3001/remoteEntry.js',
        'llm_web': 'llm_web@http://localhost:3003/llm_web/remoteEntry.js'
      },
      shared: {
        vue: { 
          singleton: true, 
          requiredVersion: '^3.0.0',
          strictVersion: false,
          eager: true  // 生產環境使用 eager loading
        },
        'vue-router': { 
          singleton: true, 
          requiredVersion: '^4.2.5',
          strictVersion: false,
          eager: true
        },
        'element-plus': { 
          singleton: true, 
          requiredVersion: '^2.11.2',
          strictVersion: false,
          eager: true
        },
        'vue-i18n': { 
          singleton: true, 
          requiredVersion: '^9.8.0',
          strictVersion: false,
          eager: true
        },
        '@vue-flow/core': { 
          singleton: true, 
          requiredVersion: '^1.46.5',
          strictVersion: false,
          eager: true
        }
      }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: true,
      title: '微前端Host應用 - Vue 3 + Module Federation + Element Plus',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    })
  ]
};
