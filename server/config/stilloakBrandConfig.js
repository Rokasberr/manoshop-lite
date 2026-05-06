const path = require("path");

const stilloakBrandConfig = {
  name: "Stilloak Studio",
  website: "stilloak-studio.com",
  colors: {
    darkGreen: "#061f18",
    deepGreen: "#0b2a20",
    gold: "#b9823a",
    bronze: "#9f6b2d",
    white: "#ffffff",
    mutedText: "#d8e1dc",
  },
  borderRadius: {
    card: 28,
    pill: 999,
  },
  logoPath: path.join(__dirname, "..", "..", "client", "public", "favicon.svg"),
  generatedDirectory: path.join(__dirname, "..", "generated", "instagram"),
};

module.exports = stilloakBrandConfig;
