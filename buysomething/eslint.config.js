// ESLint Flat Config (ESLint 9.x) - 适配 Windows
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/cloudfunctions/**/node_modules/**",
      "**/miniprogram/node_modules/**"
    ]
  },

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module"
    },
    rules: {
      "indent": ["error", 2],
      "linebreak-style": "off",  // 关闭换行符检查（Windows 用 CRLF）
      "quotes": ["error", "single"],
      "semi": ["error", "always"],
      "no-unused-vars": "warn",
      "no-console": "off",
      "no-undef": "off"
    }
  }
];
