module.exports = {
	// ...
	module: {
		rules: [
			// Thêm quy tắc xử lý CSS vào đây
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
			// ...
		],
	},
	// ...
};
