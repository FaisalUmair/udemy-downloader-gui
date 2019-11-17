require("dotenv").config();

module.exports = {
  devServer: {
    port: process.env.PORT || 8989
  },
  configureWebpack: {
    target: "electron-renderer"
  }
};
