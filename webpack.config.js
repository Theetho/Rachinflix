const path = require('path')

module.exports = {
	entry: {
		app: './src/main.js',
	},
	output: {
		path: path.resolve(__dirname) + '/public/js',
		filename: 'bundle.js',
	},
	mode: 'development',
	optimization: {
		minimizer: [
			(compiler) => {
				const TerserPlugin = require('terser-webpack-plugin')
				new TerserPlugin({
					cache: true,
					parallel: true,
				}).apply(compiler)
			},
		],
		usedExports: true,
	},
}
