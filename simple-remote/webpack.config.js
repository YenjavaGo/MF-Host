const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = {
  mode: 'production', // 直接設為 production 模式
  entry: './src/main.ts',
  
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.vue'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // 使用 runtime 版本以與 Host 保持一致
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
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  
  plugins: [
    new VueLoaderPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new ModuleFederationPlugin({
      name: 'workflow', // 與 Host 期望的名稱一致
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.vue',
        './FlowManager': './src/components/FlowManager.vue',
        './CustomNode': './src/components/CustomNode.vue'
      },
      shared: {
        vue: {
          singleton: true,
          requiredVersion: '^3.5.21',
          strictVersion: false,
          eager: false // 明確設為 false 避免 eager consumption
        },
        'element-plus': {
          singleton: true,
          requiredVersion: '^2.11.2',
          strictVersion: false,
          eager: false // 明確設為 false 避免 eager consumption
        }
      }
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'Simple Remote App'
    })
  ],
  
  devServer: {
    port: 3001,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    }
  },
  
  // 確保 publicPath 設為 auto 以支援不同部署環境
  output: {
    publicPath: 'auto'
  }
}
