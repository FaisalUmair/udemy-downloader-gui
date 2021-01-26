module.exports = function override(config) {
    return {
        ...config,
        target: "electron-renderer"
    };
}