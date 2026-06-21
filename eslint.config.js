import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import {defineConfig, globalIgnores} from 'eslint/config'
import react from 'eslint-plugin-react';
import preferArrow from "eslint-plugin-prefer-arrow";
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintPluginAstro from 'eslint-plugin-astro';
import preferSrcAlias from './eslint-rules/prefer-src-alias.js';

const localRules = {
    rules: {
        'prefer-src-alias': preferSrcAlias,
    },
};

export default defineConfig([
    globalIgnores(['dist']),
    ...eslintPluginAstro.configs.recommended,
    {
        files: ['**/*.astro'],
        plugins: {
            local: localRules,
        },
        rules: {
            "object-curly-spacing": ["error", "always"],
            "quotes": ["error", "single", { "avoidEscape": true, "allowTemplateLiterals": true }],
            "semi": ["error", "always"],
            "local/prefer-src-alias": ['error'],
        },
    },
    {
        plugins: {
            react,
            unicorn: eslintPluginUnicorn,
            "prefer-arrow": preferArrow,
            local: localRules,
        },
        files: ['**/*.{ts,tsx}'],
        extends: [
            react.configs.flat.recommended,
            react.configs.flat['jsx-runtime'],
            eslintPluginUnicorn.configs.recommended,
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        rules: {
            "react-hooks/set-state-in-effect": ['off'],
            "object-curly-spacing": ["error", "always"],
            "quotes": ["error", "single", { "avoidEscape": true, "allowTemplateLiterals": true }],
            "react/jsx-curly-brace-presence": ["error", { "props": "never", "children": "never" }],
            "unicorn/no-null": ["off"],
            "unicorn/prefer-spread": ['off'],
            "unicorn/filename-case": ['off'],
            "react/jsx-max-props-per-line": ["error", { "maximum": 1, "when": "multiline" }],
            "react/jsx-first-prop-new-line": ["error", "multiline"],
            "semi": ["error", "always"],
            "array-bracket-spacing": ["error", "never"],
            "react/jsx-tag-spacing": ["error", { "beforeSelfClosing": "always" }],
            "indent": ["error", "tab", { "SwitchCase": 1 }],
            "react/jsx-indent": ["error", "tab"],
            "react/jsx-indent-props": ["error", "tab"],
            "@typescript-eslint/no-explicit-any": ["off"],
            "unicorn/prevent-abbreviations": ["off"],
            "react-refresh/only-export-components": ["off"],
            "local/prefer-src-alias": ['error'],

            "prefer-arrow/prefer-arrow-functions": [
                "error",
                {
                    "disallowPrototype": true,
                    "singleReturnOnly": true,
                    "classPropertiesAllowed": false
                }
            ]
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            }
        },
    },
])
