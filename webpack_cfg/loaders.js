const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = () => {
  return {
    rules: [
      {
        test: /\.js?$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract(
          {
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  modules: false
                }
              }
            ],
            publicPath: '/'
          }
        )
      },
      {
        test: /\.(scss|sass)$/,
        use: ExtractTextPlugin.extract(
          {
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  modules: false
                }
              },
              {
                loader: 'sass-loader'
              }
            ],
            publicPath: '/'
          }
        )
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract(
          {
            fallback: 'style-loader',
            use: [
                {
                loader: 'css-loader',
                options: {
                  modules: false
                }
              },
                {
                loader: 'less-loader'
              }
            ],
            publicPath: '/'
          }
        )
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: './img/[name].[ext]?[hash:12]'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: './fonts/[name].[ext]?[hash:12]'
            }
          }
        ]
      }
    ]
  }
};