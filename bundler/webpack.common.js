const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path')

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

        ...['kundalini', 'a-million-thoughts', 'if-truth-be-told', 'ancient-science-of-mantras', 'the-hidden-power-of-gayatri-mantra', 'mind-full-to-minful', 'the-wellness-sense', 'the-children-of-tomorrow', 'the-last-gambit', 'heart-of-success', 'a-fistful-of-wisdom', 'fistful-of-love', 'the-book-of-kindness', 'when-all-is-not-well', 'the-big-questions-of-life', 'zen-a-way-of-living', 'gayatri-sadhana-the-ultimate-power', 'kundalini-sadhana-anant-urja-ka-srota', 'dhyan-yoga-antaratma-se-milan', 'a-guide-to-stress-free-living', 'shrimad-bhagavad-geeta-voice-of-krishna', 'jeevan-ek-ghorakh-dhanda-hai', 'the-wellness-sense-audio', 'roz-ke-mantra', 'din-ki-shuruaat'].map( (event) => {
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
