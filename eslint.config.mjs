import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**", "uploads/**"],
    rules: {
      "react-hooks/purity": "off"
    }
  }
];

export default eslintConfig;
