const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path')

module.exports = {
    entry: {
      main: path.resolve(__dirname, '../src/home.js'),
      inners: path.resolve(__dirname, '../src/inners.js')
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
            template: path.resolve(__dirname, '../src/monk/index.html'),
            filename: 'monk/index.html',
            chunks: ['inners'],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/monk/template.html'),
            filename: 'monk/template.html',
            chunks: [''],
            minify: true
        }),


        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/journey/index.html'),
            filename: 'journey/index.html',
            chunks: ['inners'],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/journey/template.html'),
            filename: 'journey/template.html',
            chunks: [''],
            minify: true
        }),


        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/author/index.html'),
            filename: 'author/index.html',
            chunks: ['inners'],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/author/template.html'),
            filename: 'author/template.html',
            chunks: [''],
            minify: true
        }),

        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/entrepreneur/index.html'),
            filename: 'entrepreneur/index.html',
            chunks: ['inners'],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/entrepreneur/template.html'),
            filename: 'entrepreneur/template.html',
            chunks: [''],
            minify: true
        }),

        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/entrepreneur/serial-entrepreneur/index.html'),
            filename: 'entrepreneur/serial-entrepreneur/index.html',
            chunks: ['inners'],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/entrepreneur/serial-entrepreneur/views.html'),
            filename: 'entrepreneur/serial-entrepreneur/views.html',
            chunks: [''],
            minify: true
        }),


        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/entrepreneur/black-lotus-app/index.html'),
            filename: 'entrepreneur/black-lotus-app/index.html',
            chunks: ['inners'],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/entrepreneur/black-lotus-app/views.html'),
            filename: 'entrepreneur/black-lotus-app/views.html',
            chunks: [''],
            minify: true
        }),


        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/entrepreneur/life-coaching/index.html'),
            filename: 'entrepreneur/life-coaching/index.html',
            chunks: ['inners'],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/entrepreneur/life-coaching/views.html'),
            filename: 'entrepreneur/life-coaching/views.html',
            chunks: [''],
            minify: true
        }),


        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/entrepreneur/sadhana-app/index.html'),
            filename: 'entrepreneur/sadhana-app/index.html',
            chunks: ['inners'],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/entrepreneur/sadhana-app/views.html'),
            filename: 'entrepreneur/sadhana-app/views.html',
            chunks: [''],
            minify: true
        }),


        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/entrepreneur/sri-badrika-ashram/index.html'),
            filename: 'entrepreneur/sri-badrika-ashram/index.html',
            chunks: ['inners'],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/entrepreneur/sri-badrika-ashram/views.html'),
            filename: 'entrepreneur/sri-badrika-ashram/views.html',
            chunks: [''],
            minify: true
        }),


        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/entrepreneur/wildr/index.html'),
            filename: 'entrepreneur/wildr/index.html',
            chunks: ['inners'],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/entrepreneur/wildr/views.html'),
            filename: 'entrepreneur/wildr/views.html',
            chunks: [''],
            minify: true
        }),





       new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/contact/index.html'),
            filename: 'contact/index.html',
            chunks: ['inners'],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/contact/template.html'),
            filename: 'contact/template.html',
            chunks: [''],
            minify: true
        }),

        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/faq/index.html'),
            filename: 'faq/index.html',
            chunks: ['inners'],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/faq/template.html'),
            filename: 'faq/template.html',
            chunks: [''],
            minify: true
        }),

        ...['kundalini', 'a-million-thoughts', 'if-truth-be-told', 'ancient-science-of-mantras', 'the-hidden-power-of-gayatri-mantra', 'mind-full-to-minful', 'the-wellness-sense', 'the-children-of-tomorrow', 'the-last-gambit', 'heart-of-success', 'a-fistful-of-wisdom', 'fistful-of-love', 'the-book-of-kindness', 'when-all-is-not-well', 'the-big-questions-of-life', 'zen-a-way-of-living', 'gayatri-sadhana-the-ultimate-power', 'kundalini-sadhana-anant-urja-ka-srota', 'dhyan-yoga-antaratma-se-milan', 'a-guide-to-stress-free-living', 'shrimad-bhagavad-geeta-voice-of-krishna', 'jeevan-ek-ghorakh-dhanda-hai', 'the-wellness-sense-audio', 'roz-ke-mantra', 'din-ki-shuruaat'].map( (event) => {
            return new HtmlWebpackPlugin({
                template: path.resolve(__dirname, `../src/author/${event}/index.html`),
                filename: `author/${event}/index.html`,
                chunks: ['inners'],
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
