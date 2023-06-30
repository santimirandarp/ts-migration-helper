export const configs = {
  tsconfig: {
    filename: 'tsconfig.json',
    choice: {
      name: 'tsconfig',
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
    filename: 'tsconfig.cjs.json',
    choice: {
      name: 'tsconfigCjs',
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
    filename: 'tsconfig.esm.json',
    choice: {
      value: 'tsconfigEsm',
      checked: true,
      name: 'tsconfigEsm',
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
    filename: 'babel.config.js',
    choice: {
      value: 'babel',
      checked: true,
      name: 'babel',
    },
    config: `module.exports = { 
    presets: ['@babel/preset-typescript'], 
    plugins: ['@babel/plugin-transform-modules-commonjs'], 
   };`,
  },
  eslint: {
    filename: '.eslintrc.yml',
    choice: {
      name: 'eslint',
      value: 'eslint',
      checked: true,
    },
    config: 'cheminfo-typescript',
  },
} as const;
