const rollup = require('rollup');
const html = require('rollup-plugin-html');
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
	input: {
		'index': './src/index.js'
	},

	output: {
		dir: './',
		format: 'umd',
		name: 'BcWebComponents'
	},

	plugins: [
		html({
			htmlMinifierOptions: {
				collapseWhitespace: true,
				collapseBooleanAttributes: true,
			}
		}),

		postcss({
			inject: false,
			plugins: [
				autoprefixer,
				cssnano
			]
		}),
	]
};
