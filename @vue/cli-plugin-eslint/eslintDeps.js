const DEPS_MAP = {
  base: {
    eslint: '^6.7.2',
    'eslint-plugin-vue': '^6.2.2'
  },
  airbnb: {
    '@vue/eslint-config-airbnb': '^5.0.2',
    'eslint-plugin-import': '^2.20.2'
  },
  prettier: {
    '@vue/eslint-config-prettier': '^6.0.0',
    'eslint-plugin-prettier': '^3.3.1',
    prettier: '^2.2.1'
  },
  standard: {
    '@vue/eslint-config-standard': '^5.1.2',
    'eslint-plugin-import': '^2.20.2',
    'eslint-plugin-node': '^11.1.0',
    'eslint-plugin-promise': '^4.2.1',
    'eslint-plugin-standard': '^4.0.0'
  },
  typescript: {
    '@vue/eslint-config-typescript': '^7.0.0',
    '@typescript-eslint/eslint-plugin': '^4.18.0',
    '@typescript-eslint/parser': '^4.18.0'
  }
}

exports.DEPS_MAP = DEPS_MAP

exports.getDeps = function (api, preset, rootOptions = {}) {
  const deps = Object.assign({}, DEPS_MAP.base, DEPS_MAP[preset])

  if (rootOptions.vueVersion === '3') {
    Object.assign(deps, { 'eslint-plugin-vue': '^7.0.0' })
  }

  if (api.hasPlugin('typescript')) {
    Object.assign(deps, DEPS_MAP.typescript)
  }

  if (api.hasPlugin('babel') && !api.hasPlugin('typescript')) {
    Object.assign(deps, {
      'babel-eslint': '^10.1.0'
    })
  }

  return deps
}
