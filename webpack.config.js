const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
    // mode: "production",
    entry: {
        main: "./src/main.js",
    },
    devtool: "inline-source-map",
    devServer: {
        static: "./demo",
    },
    output: {
        clean: true,
        path: path.resolve(__dirname, "demo"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/demo.html",
            chunks: ["main"],
        }),
    ],
};
