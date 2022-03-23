const path = require("path");

module.exports = {
  entry: "./frontend/index.tsx",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "build"),
  },
  mode: "development",
  devServer: {
    static: [
      {
        directory: path.join(__dirname, "build"),
      },
      {
        directory: path.join(__dirname, "assets"),
      },
    ],
    compress: true,
    port: 9000,
  },
};
