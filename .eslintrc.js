module.exports = {
    extends: [
        'eslint-config-qiwi',
        'prettier',
        'prettier/@typescript-eslint',
    ],
    rules: {
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/no-identical-functions': 'off'
    }
};
