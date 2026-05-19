const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const sharp = require("sharp");
const { renderTransparentBrandMark } = require("./scripts/brand-mark-image");

const isProduction = process.env.NODE_ENV === "production";
const target = process.env.TARGET || "chrome"; // 'chrome' or 'firefox'
const defaultApiBaseUrl =
  process.env.SLOTHING_EXTENSION_API_BASE_URL ||
  (isProduction ? "https://slothing.work" : "http://localhost:3000");

// Select manifest based on target
const manifestFile =
  target === "firefox" ? "manifest.firefox.json" : "manifest.json";
const outputDir = target === "firefox" ? "dist-firefox" : "dist";

module.exports = {
  entry: {
    background: "./src/background/index.ts",
    sharedUi: ["react", "react-dom"],
    content: {
      import: "./src/content/index.ts",
      dependOn: "sharedUi",
    },
    popup: {
      import: "./src/popup/index.tsx",
      dependOn: "sharedUi",
    },
    options: {
      import: "./src/options/index.tsx",
      dependOn: "sharedUi",
    },
  },
  output: {
    path: path.resolve(__dirname, outputDir),
    filename: "[name].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        // Tests live in tests/ and use node modules (fs, path) — they are
        // run by Playwright with its own TS setup, not bundled into the
        // extension. Exclude from webpack to avoid TS2307 (Cannot find
        // module 'fs') in the production build.
        exclude: [/node_modules/, /tests\//],
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "../../packages/shared/src"),
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: [path.resolve(__dirname, "../../node_modules"), "node_modules"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.BUILD_TARGET": JSON.stringify(target),
      "process.env.SLOTHING_EXTENSION_API_BASE_URL":
        JSON.stringify(defaultApiBaseUrl),
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new HtmlWebpackPlugin({
      template: "./src/popup/index.html",
      filename: "popup.html",
      chunks: ["sharedUi", "popup"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/options/index.html",
      filename: "options.html",
      chunks: ["sharedUi", "options"],
    }),
    new CopyPlugin({
      patterns: [
        { from: manifestFile, to: "manifest.json" },
        { from: "src/assets/icons", to: "icons", noErrorOnMissing: true },
        {
          from: path.resolve(
            __dirname,
            "../web/public/brand/slothing-mark.png",
          ),
          to: "brand/slothing-mark.png",
          transform: (content) => renderTransparentBrandMark(content, 64),
        },
        {
          from: path.resolve(
            __dirname,
            "../web/public/brand/slothing-logo.png",
          ),
          to: "brand/slothing-logo.png",
          transform: (content) =>
            sharp(content)
              .resize({ width: 180, withoutEnlargement: true })
              .png({ compressionLevel: 9 })
              .toBuffer(),
        },
      ],
    }),
  ],
  optimization: {
    minimize: isProduction,
  },
  devtool: isProduction ? false : "inline-source-map",
};
