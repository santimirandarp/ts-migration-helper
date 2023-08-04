#!/usr/bin/env node
import chalk from 'chalk';
import { existsSync as existsSync$1, unlinkSync } from 'node:fs';
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs';
import { select, checkbox, confirm, input } from '@inquirer/prompts';
import YAML from 'yaml';
import { basename } from 'path';
import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'node:path';
import got from 'got';

function printYellow(msg) {
    console.log('\n', chalk.underline.yellow(msg), '\n');
}
function printRed(msg) {
    console.log(chalk.red('Error ', msg));
}

/**
 * Prompts to write data, overwrite, or skip.
 */
async function writeDataToFile(filePath, data) {
    if (!existsSync(filePath)) {
        return writeFileSync(filePath, data);
    }
    const action = await select({
        message: `How to handle ${basename(filePath)}?`,
        choices: getFileActions(),
    });
    return action === 'overwrite' && writeFileSync(filePath, data);
}
function getFileActions() {
    return [
        {
            key: 'o',
            name: 'overwrite',
            value: 'overwrite',
            short: 'Overwriting File',
        },
        {
            key: 's',
            name: 'skip',
            value: 'skip',
            short: 'Skipping File',
        },
    ];
}

function sortByKeys(obj) {
    return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}

/**
 * Prompts to add config files to the project.
 */
async function configureSoftware() {
    const msg = 'Configuring Software';
    printYellow(`Section: ${msg}`);
    const configs = getConfigs();
    // filenames to add
    const answers = await checkbox({
        message: 'Which config files would you like to add?',
        choices: configs.map(({ choice }) => choice),
    });
    if (answers.length === 0)
        return;
    // because the object is complex, we map over the options
    // rather than the answers/responses.
    for (const item of configs) {
        try {
            const filename = item.choice.value;
            const endsWithJS = filename.endsWith('.js');
            if (!answers.includes(filename))
                continue;
            if (existsSync(filename)) {
                const action = await select({
                    message: `How to handle ${filename}?`,
                    choices: getConfigActions(endsWithJS),
                });
                await handleAction(filename, item.config, action);
            }
            else {
                await handleAction(filename, item.config, 'overwrite');
            }
        }
        catch (e) {
            printRed(msg);
            if (typeof e === 'string')
                throw new Error(e);
        }
    }
}
/**
 * What to do with the config file.
 * @param filename - The name of the file to write to.
 * @param config - The config object or string to write to the file.
 * @param action - The action to take (overwrite, merge, skip)
 * @returns
 */
async function handleAction(filename, config, action) {
    const isJson = filename.endsWith('.json');
    const isYaml = filename.endsWith('.yml');
    const isJs = filename.endsWith('.js');
    if (action === 'overwrite') {
        return isJson
            ? writeFileSync(filename, JSON.stringify(config, null, 2).concat('\n'))
            : isYaml
                ? writeFileSync(filename, YAML.stringify({ extends: config }))
                : isJs
                    ? writeFileSync(filename, config)
                    : null;
    }
    else if (action === 'merge') {
        const file = readFileSync(filename, 'utf-8');
        if (isJson) {
            const jsonObject = JSON.parse(file);
            return writeFileSync(filename, JSON.stringify({ ...jsonObject, config }, null, 2).concat('\n'));
        }
        else if (filename.endsWith('.yml')) {
            const yamlObject = YAML.parse(file);
            return writeFileSync(filename, YAML.stringify({ ...yamlObject, extends: config }));
        }
    }
}
/**
 * Used to create the prompt for the user to select how to handle the config file.
 * @param js - Disable merge option for js files.
 * @returns The choices for the prompt.
 */
function getConfigActions(js = false) {
    return [
        {
            key: 'o',
            name: 'overwrite',
            value: 'overwrite',
            short: 'Overwriting File',
        },
        {
            key: 'm',
            name: 'merge',
            value: 'merge',
            short: 'Merging File',
            disabled: js,
        },
        {
            key: 's',
            name: 'skip',
            value: 'skip',
            short: 'Skipping File',
        },
    ];
}
function getConfigs() {
    return [
        {
            choice: {
                name: 'tsconfig',
                value: 'tsconfig.json',
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
        {
            choice: {
                name: 'tsconfigCjs',
                value: 'tsconfig.cjs.json',
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
        {
            choice: {
                value: 'tsconfig.esm.json',
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
        {
            choice: {
                value: 'babel.config.js',
                checked: true,
                name: 'babel',
            },
            config: `module.exports = { 
    presets: ['@babel/preset-typescript'], 
    plugins: ['@babel/plugin-transform-modules-commonjs'], 
   };`,
        },
        {
            choice: {
                name: 'eslint',
                value: '.eslintrc.yml',
                checked: true,
            },
            config: 'cheminfo-typescript',
        },
    ];
}

const installs = [
    {
        command: 'typescript',
        choice: {
            name: 'TypeScript',
            value: 'typescript',
            checked: true,
        },
    },
    {
        command: 'eslint-config-cheminfo-typescript eslint-plugin-jest',
        choice: {
            name: 'cheminfo-eslint',
            value: 'eslint',
            checked: true,
        },
    },
    {
        command: '@babel/preset-typescript @babel/plugin-transform-modules-commonjs',
        choice: {
            name: 'Babel',
            value: 'babel',
            checked: true,
        },
    },
    {
        command: '@types/jest',
        choice: {
            name: 'Jest',
            value: 'jest',
            checked: true,
        },
    },
    {
        command: 'rimraf',
        choice: {
            name: 'Rimraf',
            value: 'rimraf',
            checked: true,
        },
    },
];
async function installSoftware() {
    const msg = 'Installing Software';
    printYellow(`Section: ${msg}`);
    const answers = await checkbox({
        message: 'Install (dev dependencies) ?',
        choices: installs.map((install) => install.choice),
    });
    if (answers.length) {
        let commands = [];
        for (const install of installs) {
            if (answers.includes(install.choice.value)) {
                commands.push(install.command);
            }
        }
        const command = `npm i -D ${commands.join(' ')}`;
        return execSync(command);
    }
}

const SCRIPTS_TO_DELETE = ['compile', 'prePublishOnly', 'jest'];
const UPDATE_SCRIPTS = {
    'check-types': 'tsc --noEmit',
    clean: 'rimraf lib lib-esm',
    prepack: 'npm run tsc',
    tsc: 'npm run clean && npm run tsc-cjs && npm run tsc-esm',
    'tsc-cjs': 'tsc --project tsconfig.cjs.json',
    'tsc-esm': 'tsc --project tsconfig.esm.json',
};
async function updatePackageJson() {
    const msg = 'Updating package.json';
    printYellow(`Section: ${msg}`);
    const answer = await confirm({
        message: 'Update package.json ?',
        default: true,
    });
    if (!answer) {
        printYellow('Skipping package.json update.');
        return;
    }
    const json = JSON.parse(readFileSync('package.json', 'utf8'));
    json.main = './lib/index.js';
    json.module = './lib-esm/index.js';
    json.types = './lib/index.d.ts';
    json.files = ['src', 'lib', 'lib-esm'];
    json.scripts = { ...json.scripts, ...UPDATE_SCRIPTS };
    SCRIPTS_TO_DELETE.forEach((script) => {
        if (script in json.scripts) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete json.scripts[script];
        }
    });
    if (json.scripts.test && !json.scripts.test.includes('check-types')) {
        json.scripts.test += ' && npm run check-types';
    }
    json.scripts = sortByKeys(json.scripts);
    writeFileSync('package.json', `${JSON.stringify(json, null, 2)}\n`);
    console.log(chalk.green('updated package.json'));
}

/**
 * Asynchronously updates the .gitignore file to ensure that 'lib' and 'lib-esm' are present.
 *
 */
async function updateGitignore() {
    const msg = 'Updating .gitignore';
    printYellow(`Section: ${msg}`);
    const answer = await confirm({
        message: 'Update .gitignore ?',
        default: true,
    });
    if (!answer) {
        printYellow('Skipping .gitignore update.');
        return;
    }
    const fileContents = await readFile('.gitignore', 'utf8');
    const gitignore = fileContents.split('\n');
    let result = 0;
    for (const line of gitignore) {
        if (line === 'lib')
            result += 1;
        else if (line === 'lib-esm')
            result += 2;
    }
    if (!(result & 1))
        gitignore.push('lib');
    if (!(result >> 1))
        gitignore.push('lib-esm');
    await writeFile('.gitignore', gitignore.join('\n').concat('\n'));
}

const remoteBase = 'https://raw.githubusercontent.com/cheminfo/.github/main/workflow-templates/';
const localBase = '.github/workflows';
const sources = ['nodejs-ts.yml', 'typedoc.yml', 'release.yml', 'lactame.yml'];
async function replaceWorkflow() {
    const branchName = await input({
        message: 'What is the default branch name ? /main/master/other',
        default: 'main',
    });
    const msg = 'Replacing workflows...';
    printYellow(`Section: ${msg}`);
    for (const source of sources) {
        const data = await got(join(remoteBase, source)).text();
        const answer = await confirm({
            message: `Add ${source} Workflow ?`,
            default: true,
        });
        if (!answer) {
            continue;
        }
        printYellow(msg);
        const updated = branchName
            ? data.replace('$default-branch', branchName.trim())
            : data;
        if (!existsSync(join(localBase, source))) {
            mkdirSync('.github/workflows', { recursive: true });
        }
        await writeDataToFile(join(localBase, source), updated);
    }
}

async function removeOld() {
    const msg = 'Removing Old Software';
    printYellow(`Section: ${msg}`);
    return removeOldLocal();
}
/**
 * Prompts the user to remove old config files and software.
 */
async function removeOldLocal() {
    const removes = makeRemoveChoices();
    const answers = await checkbox({
        message: 'Remove ...?',
        choices: removes.map(({ choice }) => choice),
    });
    const commands = [];
    for (const { action, choice: { value }, } of removes) {
        if (!answers.includes(value))
            continue;
        switch (action) {
            case 'npmRemove':
                commands.push(value);
                break;
            case 'removeFile':
                if (existsSync$1(value))
                    unlinkSync(value);
                break;
        }
    }
    if (commands.length) {
        const npmCommand = `npm remove ${commands.join(' ')}`;
        return execSync(npmCommand);
    }
}
function makeRemoveChoices() {
    return [
        {
            action: 'npmRemove',
            choice: {
                name: 'rollup',
                value: 'rollup',
                checked: true,
            },
        },
        {
            action: 'npmRemove',
            choice: {
                name: 'cheminfo-eslint',
                value: 'eslint-config-cheminfo',
                checked: true,
            },
        },
        {
            action: 'removeFile',
            choice: {
                name: 'Babel',
                value: '.babelrc.json',
                checked: false,
            },
        },
        {
            action: 'removeFile',
            choice: {
                name: 'rollupConfig',
                value: 'rollup.config.js',
                checked: true,
            },
        },
    ];
}

// prompt to run ncu -u
async function npmCheckUpdates() {
    const msg = 'npm-check-updates';
    printYellow(`Section: ${msg}`);
    const answer = await confirm({
        message: 'Run npm-check-updates -u ?',
        default: true,
    });
    if (!answer) {
        printYellow('Skipping npm-check-updates.');
        return;
    }
    const command = 'npx npm-check-updates -u';
    return execSync(command);
}

/**
 * Please update if the guide changes.
 * https://github.com/cheminfo/generator-cheminfo/blob/main/ts-migration.md
 */
async function run() {
    if (!existsSync$1('package.json')) {
        console.error('\npackage.json not found. Run this program in the project root.');
        process.exit(1);
    }
    await npmCheckUpdates();
    await removeOld();
    await installSoftware();
    await configureSoftware();
    await updateGitignore();
    await updatePackageJson();
    await replaceWorkflow();
}

run()
    .then(() => {
    console.log(chalk.green('Done!'), 'You should now be at the step: ', chalk.underline.blueBright('https://github.com/cheminfo/generator-cheminfo/blob/main/ts-migration.md#submit-your-changes'));
})
    .catch((error) => {
    console.log(error);
    process.exit(1);
});
