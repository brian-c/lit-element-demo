const rollup = require('rollup');
const html = require('rollup-plugin-html');
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
	input: {
		'dialog': './src/dialog/dialog.js',
		'dialog/safe-area': './src/dialog/dialog-safe-area.js',
		'helpers/swipe-observer': './src/helpers/swipe-observer.js',
		'sidebar-layout': './src/sidebar-layout/sidebar-layout.js'
	},

	output: {
		dir: './',
		format: 'cjs'
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
