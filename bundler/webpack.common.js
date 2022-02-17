const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path')
const SitemapPlugin = require('sitemap-webpack-plugin').default;

const paths = [
  {
    path: '/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/contact/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/entrepreneur/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/faq/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/monk/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/monk/expert-meditator/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/monk/unconventional-monk/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/monk/om-swami-in-own-words/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/monk/millionaire-turned-monk/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/journey/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/entrepreneur/wildr/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/entrepreneur/sri-badrika-ashram/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/entrepreneur/life-coaching/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/entrepreneur/serial-entrepreneur/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/entrepreneur/black-lotus-app/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/a-fistful-of-wisdom/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/kundalini/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/a-million-thoughts/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/if-truth-be-told/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/ancient-science-of-mantras/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/the-hidden-power-of-gayatri-mantra/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/mind-full-to-mindful/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/the-wellness-sense/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/the-children-of-tomorrow/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/the-last-gambit/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/heart-of-success/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/fistful-of-love/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/the-book-of-kindness/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/when-all-is-not-well/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/the-big-questions-of-life/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/zen-a-way-of-living/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/gayatri-sadhana-the-ultimate-power/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/kundalini-sadhana-anant-urja-ka-srota/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/dhyan-yoga-antaratma-se-milan/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/a-guide-to-stress-free-living/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/shrimad-bhagavad-geeta-voice-of-krishna/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/jeevan-ek-ghorakh-dhanda-hai/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/the-wellness-sense-audio/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/roz-ke-mantra/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  },
  {
    path: '/author/din-ki-shuruaat/',
    lastmod: '2022-02-16',
    priority: 1,
    changefreq: 'daily'
  }
];

module.exports = {
    entry: {
      main: path.resolve(__dirname, '../src/app.js'),
    },
    output:
    {
        hashFunction: 'xxhash64',
        filename: 'bundle.[contenthash].js',
        path: path.resolve(__dirname, '../dist')
    },
    devtool: 'source-map',
    plugins:
    [

        new SitemapPlugin({
          base: 'https://omswami.com/',
          paths,
          options: {
            filename: 'sitemap.xml'
          }
        }),

        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../static') }
            ]
        }),

        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html'),
            filename: 'index.html',
            chunks: ['main'],
            minify: true
        }),

        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/gl.html'),
            filename: 'gl.html',
            chunks: [''],
            minify: true
        }),

        ...['millionaire-turned-monk', 'expert-meditator', 'unconventional-monk', 'om-swami-in-own-words'].map( (page) => {
            return new HtmlWebpackPlugin({
                template: path.resolve(__dirname, `../src/monk/${page}/index.html`),
                filename: `monk/${page}/index.html`,
                chunks: ['main'],
                minify: true
            })
        }),

        ...['serial-entrepreneur', 'black-lotus-app', 'life-coaching', 'sadhana-app', 'sri-badrika-ashram', 'wildr'].map( (page) => {
            return new HtmlWebpackPlugin({
                template: path.resolve(__dirname, `../src/entrepreneur/${page}/index.html`),
                filename: `entrepreneur/${page}/index.html`,
                chunks: ['main'],
                minify: true
            })
        }),

        ...['serial-entrepreneur', 'black-lotus-app', 'life-coaching', 'sadhana-app', 'sri-badrika-ashram', 'wildr'].map( (page) => {
            return new HtmlWebpackPlugin({
                template: path.resolve(__dirname, `../src/entrepreneur/${page}/views.html`),
                filename: `entrepreneur/${page}/views.html`,
                chunks: [''],
                minify: true
            })
        }),

        ...['faq', 'contact', 'monk', 'author', 'entrepreneur', 'journey'].map( (page) => {
            return new HtmlWebpackPlugin({
                template: path.resolve(__dirname, `../src/${page}/index.html`),
                filename: `${page}/index.html`,
                chunks: ['main'],
                minify: true
            })
        }),

        ...['faq', 'contact', 'monk', 'author', 'entrepreneur', 'journey'].map( (page) => {
            return new HtmlWebpackPlugin({
                template: path.resolve(__dirname, `../src/${page}/template.html`),
                filename: `${page}/template.html`,
                chunks: [''],
                minify: true
            })
        }),

        ...['kundalini', 'a-million-thoughts', 'if-truth-be-told', 'ancient-science-of-mantras', 'the-hidden-power-of-gayatri-mantra', 'mind-full-to-mindful', 'the-wellness-sense', 'the-children-of-tomorrow', 'the-last-gambit', 'heart-of-success', 'a-fistful-of-wisdom', 'fistful-of-love', 'the-book-of-kindness', 'when-all-is-not-well', 'the-big-questions-of-life', 'zen-a-way-of-living', 'gayatri-sadhana-the-ultimate-power', 'kundalini-sadhana-anant-urja-ka-srota', 'dhyan-yoga-antaratma-se-milan', 'a-guide-to-stress-free-living', 'shrimad-bhagavad-geeta-voice-of-krishna', 'jeevan-ek-ghorakh-dhanda-hai', 'the-wellness-sense-audio', 'roz-ke-mantra', 'din-ki-shuruaat'].map( (event) => {
            return new HtmlWebpackPlugin({
                template: path.resolve(__dirname, `../src/author/${event}/index.html`),
                filename: `author/${event}/index.html`,
                chunks: ['main'],
                minify: true
            })
        }),

        new MiniCSSExtractPlugin(),

    ],
    module:
    {
        rules:
        [
            // HTML
            {
                test: /\.(html)$/,
                use:
                [
                    'html-loader'
                ]
            },

            // JS
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use:
                [
                    'babel-loader'
                ]
            },

            // CSS
            {
                test: /\.css$/,
                use:
                [
                    MiniCSSExtractPlugin.loader,
                    'css-loader'
                ]
            },

            // Images
            {
                test: /\.(jpg|png|gif|svg)$/,
                type: 'asset/resource',
                generator:
                {
                    filename: 'assets/images/[hash][ext]'
                }
            },

            // Fonts
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                type: 'asset/resource',
                generator:
                {
                    filename: 'assets/fonts/[hash][ext]'
                }
            }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin(),
            // new TerserPlugin()
        ],
    }

}
