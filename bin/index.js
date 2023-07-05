#!/usr/bin/env node
import chalk from 'chalk';
import { access, writeFile, readFile } from 'fs/promises';
import { checkbox, select, confirm, input } from '@inquirer/prompts';
import YAML from 'yaml';
import { exec } from 'node:child_process';
import got from 'got';
import { unlink } from 'node:fs/promises';

async function execAsync(command) {
    return new Promise(function ex(resolve, reject) {
        exec(command, (error, stdout) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(stdout);
            }
        });
    });
}

function printYellow(msg) {
    console.log('\n', chalk.underline.yellow(msg), '\n');
}
function printRed(msg) {
    console.log(chalk.red('Error ', msg));
}

async function fileExists(path) {
    try {
        await access(path);
        return true;
    }
    catch {
        return false;
    }
}

/**
 * Offers a way to add the config files to the most common config files.
 */
async function configureSoftware() {
    const msg = 'Configuring Software';
    printYellow(`Section: ${msg}`);
    const configs = getConfigs();
    const answers = await checkbox({
        message: 'Config Files (no overwrite without prompting):',
        choices: configs.map(({ choice }) => choice),
    });
    if (answers.length === 0)
        return;
    for (const item of configs) {
        try {
            const { value: filename, name } = item.choice;
            const endsWithJS = filename.endsWith('.js');
            if (!answers.includes(name))
                continue;
            if (await fileExists(filename)) {
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
        if (isJson) {
            await writeFile(filename, JSON.stringify(config, null, 2).concat('\n'));
        }
        else if (isYaml) {
            await writeFile(filename, YAML.stringify({ extends: config }));
        }
        else if (isJs) {
            await writeFile(filename, config);
        }
    }
    else if (action === 'merge') {
        const file = await readFile(filename, 'utf-8');
        if (isJson) {
            const jsonObject = JSON.parse(file);
            if (typeof jsonObject !== 'object') {
                throw new Error(`Expected ${filename} to be an object`);
            }
            await writeFile(filename, JSON.stringify({ ...jsonObject, config }, null, 2).concat('\n'));
        }
        else if (filename.endsWith('.yml')) {
            const yamlObject = YAML.parse(file);
            await writeFile(filename, YAML.stringify({ ...yamlObject, extends: config }));
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
            value: 'ts',
            checked: true,
        },
    },
    {
        command: 'eslint-config-cheminfo-typescript',
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
        try {
            const command = `npm i -D ${answers.join(' ')}`;
            await execAsync(command);
            console.log(chalk.green('Installed Software'), command);
        }
        catch (e) {
            printRed(msg);
            if (typeof e === 'string')
                throw new Error(e);
        }
    }
}

function sortByKeys(obj) {
    return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
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
    try {
        const fileContents = await readFile('package.json', 'utf8');
        const json = JSON.parse(fileContents);
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
        if (json.scripts.test) {
            json.scripts.test += ' && npm run check-types';
        }
        json.scripts = sortByKeys(json.scripts);
        await writeFile('package.json', `${JSON.stringify(json, null, 2)}\n`);
        console.log(chalk.green('updated package.json'));
    }
    catch (e) {
        printRed(msg);
        if (typeof e === 'string')
            throw new Error(e);
    }
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
    try {
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
    catch (e) {
        printRed(msg);
        if (typeof e === 'string')
            throw new Error(e);
    }
}

async function replaceWorkflow() {
    const webSource = 'https://raw.githubusercontent.com/cheminfo/.github/main/workflow-templates/nodejs-ts.yml';
    const path = '.github/workflows/nodejs.yml';
    const msg = 'Replacing workflow';
    printYellow(`Section: ${msg}`);
    const data = await got(webSource).text();
    const answer = await confirm({
        message: 'New nodejs Workflow ?',
        default: true,
    });
    if (!answer) {
        printYellow('Skipping package.json update.');
        return;
    }
    const branchName = await input({
        message: 'What is the default branch of your repository? master/main/other',
        default: '',
    });
    try {
        printYellow(msg);
        const updated = branchName
            ? data.replace('$default-branch', branchName.trim())
            : data;
        await writeFile(path, updated);
    }
    catch (e) {
        printRed(msg);
        if (typeof e === 'string')
            throw new Error(e);
    }
}

async function removeOld() {
    const msg = 'Removing Old Software';
    printYellow(`Section: ${msg}`);
    try {
        await removeOldLocal();
    }
    catch (e) {
        printRed(msg);
        if (typeof e === 'string')
            throw new Error(e);
    }
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
    console.log(answers);
    const commands = [];
    for (const { action, choice: { value }, } of removes) {
        if (!answers.includes(value))
            continue;
        switch (action) {
            case 'npmRemove':
                commands.push(value);
                break;
            case 'removeFile':
                if (await fileExists(value)) {
                    await unlink(value);
                    console.log(chalk.blue(value), ' --> ', chalk.green('removed'));
                }
                break;
        }
    }
    if (commands.length) {
        const npmCommand = commands.join(' ');
        await execAsync(`npm remove ${npmCommand}`);
        console.log(chalk.blue(npmCommand, ' --> ', chalk.green('done.')));
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
                checked: true,
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

/**
 * Please update if the guide changes.
 * https://github.com/cheminfo/generator-cheminfo/blob/main/ts-migration.md
 */
async function run() {
    console.log('\n', chalk.bgRed.yellow('Use at your own risk.'), '\n');
    if (!(await fileExists('package.json'))) {
        console.error('\npackage.json not found. Run this program in the project root.');
        process.exit(1);
    }
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
