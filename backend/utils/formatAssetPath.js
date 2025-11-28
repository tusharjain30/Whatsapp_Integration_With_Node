require("dotenv").config();

const formatAssetPath = (filePath) => {
    if (!filePath) return null;

    const cleaned = filePath
        .replace(/^.*?public[\\/]/, "") // remove "public/"
        .replace(/\\/g, "/");

        return `${process.env.SERVER_URL}/${cleaned}`;
};

module.exports = { formatAssetPath };