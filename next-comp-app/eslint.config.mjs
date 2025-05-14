// eslint.config.mjs
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginNext from "@next/eslint-plugin-next";

export default tseslint.config(
  // Global ignores
  {
    ignores: ["node_modules/", ".next/", ".vercel/", "dist/", "eslint.config.mjs"], // Add eslint.config.mjs to global ignores for type-aware linting pass
  },

  // Base ESLint recommended rules (applies to all files not ignored)
  // tseslint.configs.eslintRecommended, // This is now part of tseslint.configs.recommendedTypeChecked

  // Configuration for JS/MJS files (including eslint.config.mjs itself)
  // This block should NOT include parserOptions.project
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node, // For CJS/MJS config files
        ...globals.es2021,
      },
    },
    rules: {
      // Add any specific rules for JS/MJS files if needed
      // For example, if you want to allow console.log in config files:
      // "no-console": "off",
    }
  },
  
  // TypeScript configurations (for .ts, .tsx files)
  // This is where type-aware linting is enabled
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      ...tseslint.configs.recommendedTypeChecked, // Includes recommended, eslintRecommended, and type-aware rules
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json", // Essential for type-aware linting on TS/TSX files
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser, // For client-side TS/TSX
        ...globals.es2021,
        React: "readonly",
      }
    },
    plugins: { // Plugins are defined where they are used or globally if applicable to all files in the config object
      "@typescript-eslint": tseslint.plugin, // tseslint.plugin is the actual plugin object
      // React and Next plugins will be in their own config object below
    },
    rules: {
      // TypeScript specific rules can go here, or override from recommendedTypeChecked
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "@typescript-eslint/explicit-module-boundary-types": "off",
    }
  },

  // React specific configurations (for .ts, .tsx, .js, .jsx files)
  {
    files: ["**/*.{ts,tsx,js,jsx}"], 
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReact.configs["jsx-runtime"].rules, 
      ...pluginReactHooks.configs.recommended.rules,
      "react/prop-types": "off", // Disable for TypeScript projects
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    languageOptions: { // languageOptions can also be specified per config object
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Ensure JSX is enabled for JS/JSX files too if they contain JSX
        },
      },
       globals: { // Ensure browser globals for React components
        ...globals.browser,
      }
    }
  },
  
  // Next.js specific configurations (for .ts, .tsx, .js, .jsx files)
  {
    files: ["**/*.{ts,tsx,js,jsx}"], 
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },

  // A final global rules object if needed, or custom rules applied to specific file sets
  // This example primarily relies on the rules within the typed and React/Next sections.
  // If you had global rules in your previous last object, they can be merged into
  // a relevant section or a new one. For instance, common JS/TS rules not type-dependent.
  {
    rules: {
        // Example of a global rule if needed, but most are now in specific blocks
        // "no-console": "warn", 
    }
  }
);
