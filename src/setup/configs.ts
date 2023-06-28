export const configs = {
  tsconfig: {
    choice: {
      name: 'tsconfig.json',
      value: 'tsconfig',
      checked: true,
    },
    config: {
      compilerOptions: {
        allowJs: true,
        esModuleInterop: true,
        moduleResolution: 'node',
        outDir: 'lib',
        sourceMap: true,
        strict: true,
        target: 'es2020',
      },
      include: ['./src/**/*'],
    },
  },
  tsconfigCjs: {
    choice: {
      name: 'tsconfig.cjs.json',
      value: 'tsconfigCjs',
      checked: true,
    },
    config: {
      extends: './tsconfig.json',
      compilerOptions: {
        module: 'commonjs',
        declaration: true,
        declarationMap: true,
      },
      exclude: ['./src/**/__tests__'],
    },
  },
  tsconfigEsm: {
    choice: {
      name: 'tsconfig.esm.json',
      value: 'tsconfigEsm',
      checked: true,
    },
    config: {
      extends: './tsconfig.cjs.json',
      compilerOptions: {
        module: 'es2020',
        outDir: 'lib-esm',
      },
    },
  },
  babel: {
    choice: {
      name: 'babel.config.js',
      value: 'babel',
      checked: true,
    },
    config: `module.exports = { 
    presets: ['@babel/preset-typescript'], 
    plugins: ['@babel/plugin-transform-modules-commonjs'], 
   };`,
  },
  eslint: {
    choice: {
      name: '.eslintrc.yml',
      value: 'eslint',
      checked: true,
    },
    config: 'cheminfo-typescript',
  },
} as const;
