module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@": "./",
          },
        },
      ],
    ],
  };
};

/**
 * This is the Babel configuration file used by Expo.
 *
 * Babel helps convert modern JavaScript and TypeScript code into code
 * that can run on older devices or environments.
 *
 * This config includes:
 * - The Expo preset: adds support for React Native with Expo.
 * - A custom "module-resolver" plugin: lets us use the "@" symbol
 *   as an alias for the project root. This makes our import paths
 *   shorter and easier to read (e.g., "@/services/api" instead of "../../../services/api").
 *
 * This file works together with tsconfig.json, which sets up the same alias
 * for TypeScript so both Babel and TypeScript understand our import paths.
 */
