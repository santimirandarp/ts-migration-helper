#!/usr/bin/env node
import chalk from 'chalk';
import { unlink, readFile as readFile$1 } from 'node:fs/promises';
import inquirer from 'inquirer';
import { access, readFile, writeFile } from 'fs/promises';
import YAML from 'yaml';
import { exec } from 'node:child_process';
import got from 'got';

const configs = {
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
};

const installs = {
    ts: {
        command: 'typescript',
        choice: {
            name: 'TypeScript',
            value: 'ts',
            checked: true,
        },
    },
    eslint: {
        command: 'eslint-config-cheminfo-typescript',
        choice: {
            name: 'cheminfo-eslint',
            value: 'eslint',
            checked: true,
        },
    },
    babel: {
        command: '@babel/preset-typescript @babel/plugin-transform-modules-commonjs',
        choice: {
            name: 'Babel',
            value: 'babel',
            checked: true,
        },
    },
    jest: {
        command: '@types/jest',
        choice: {
            name: 'Jest',
            value: 'jest',
            checked: true,
        },
    },
    rimraf: {
        command: 'rimraf',
        choice: {
            name: 'Rimraf',
            value: 'rimraf',
            checked: true,
        },
    },
};

const removes = {
    rollup: {
        npm: 'rollup',
        choice: {
            name: 'rollup',
            value: 'rollup',
            checked: true,
        },
    },
    eslint: {
        npm: 'rollup eslint-config-cheminfo',
        choice: {
            name: 'cheminfo-eslint',
            value: 'eslint',
            checked: true,
        },
    },
    babelrc: {
        file: '.babelrc',
        choice: {
            name: 'Babel',
            value: 'babelrc',
            checked: true,
        },
    },
    rollupConfig: {
        file: 'rollup.config.js',
        choice: {
            name: 'rollupConfig',
            value: 'rollupConfig',
            checked: true,
        },
    },
};

const questions = [
    {
        name: 'removes',
        message: 'Remove ...?',
        type: 'checkbox',
        choices: Object.entries(removes).map(([, value]) => {
            return value.choice;
        }),
    },
    {
        name: 'install',
        message: 'Install (dev dependencies) ?',
        type: 'checkbox',
        choices: Object.entries(installs).map(([, value]) => {
            return value.choice;
        }),
    },
    {
        name: 'configs',
        message: 'Config Files (no overwrite without prompting):',
        type: 'checkbox',
        choices: Object.entries(configs).map(([, value]) => {
            return value.choice;
        }),
    },
    {
        name: 'updateJson',
        message: 'Update package.json ?',
        type: 'confirm',
        default: true,
    },
    {
        name: 'updateGitignore',
        message: 'Update .gitignore ?',
        type: 'confirm',
        default: true,
    },
    {
        name: 'replaceWorkflow',
        message: 'New nodejs Workflow ?',
        type: 'confirm',
        default: true,
    },
];

async function fileExists(path) {
    try {
        await access(path);
        return true;
    }
    catch {
        return false;
    }
}

async function configureSoftware(configKeyName) {
    const { filename } = configs[configKeyName];
    const endsWithJS = filename.endsWith('.js');
    if (await fileExists(filename)) {
        const answer = await inquirer.prompt([
            makeConfigsPrompt(configKeyName, endsWithJS),
        ]);
        await handleAction(answer);
    }
    else {
        // @ts-expect-error problem
        await handleAction({ [configKeyName]: 'overwrite' });
    }
}
/**
 * @param action - overwrite, merge, skip
 * @param configKeyName
 * @returns
 */
async function handleAction(data) {
    const [configKeyName, action] = Object.entries(data)[0];
    const { filename, config } = configs[configKeyName];
    switch (action) {
        case 'overwrite': {
            if (filename.endsWith('.json')) {
                await writeFile(filename, JSON.stringify(config, null, 2).concat('\n'));
            }
            else if (filename.endsWith('.yml')) {
                await writeFile(filename, YAML.stringify({ extends: config }));
            }
            else if (filename.endsWith('.js')) {
                await writeFile(filename, config);
            }
            break;
        }
        case 'merge': {
            const file = await readFile(filename, 'utf-8');
            if (filename.endsWith('.json')) {
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
            break;
        }
        case 'skip':
            break;
        default:
            throw new Error(`Unknown action ${action}`);
    }
}
/**
 * Used to create the prompt for the user to select how to handle the config file.
 * @param configKeyName - The KeyName of the config file
 * @param js - Disable merge option for js files.
 * @returns The choices for the prompt.
 */
function makeConfigsPrompt(configKeyName, js = false) {
    return {
        choices: [
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
        ],
        type: 'list',
        default: 0,
        name: configKeyName,
    };
}

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

async function installSoftware(keys) {
    const command = `npm i -D ${keys
        .map((key) => installs[key].command)
        .join(' ')}`;
    await execAsync(command);
    console.log(chalk.green('Installed Software'), command);
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
async function updatePackageJson(file) {
    const json = JSON.parse(file);
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

/**
 * Asynchronously updates the .gitignore file to ensure that 'lib' and 'lib-esm' are present.
 *
 * @param fileContents - The current contents of the .gitignore file as a string.
 * @returns - A Promise that fulfills with undefined when the updated .gitignore file has been written to disk.
 *
 */
async function updateGitignore(fileContents) {
    const gitignore = fileContents.split('\n');
    const present = [];
    for (const line of gitignore) {
        if (line === 'lib')
            present.push('lib');
        else if (line === 'lib-esm')
            present.push('lib-esm');
    }
    if (!present.includes('lib')) {
        gitignore.push('lib');
    }
    if (!present.includes('lib-esm')) {
        gitignore.push('lib-esm');
    }
    return writeFile('.gitignore', gitignore.join('\n').concat('\n'));
}

async function replaceWorkflow(path, webSource) {
    const data = await got(webSource).text();
    const { branch } = await inquirer.prompt([
        {
            type: 'input',
            name: 'branch',
            message: 'What is the default branch of your repository? master/main/other',
            default: '',
        },
    ]);
    const updated = branch
        ? data.replace('$default-branch', branch.trim())
        : data;
    await writeFile(path, updated);
}

async function removeOld(name) {
    const commands = [];
    for (const key of name) {
        const item = removes[key];
        if ('npm' in item) {
            commands.push(item.npm);
        }
        else if ('file' in item) {
            try {
                await unlink(item.file);
                console.log(chalk.blue(item.file), ' --> ', chalk.green('removed'));
            }
            catch (error) {
                // @ts-expect-error unknown type
                if (error?.code === 'ENOENT') {
                    console.log(chalk.blue(item.file, ' --> ', 'skipping un-existing file.'));
                }
                else {
                    // @ts-expect-error unknown type
                    throw new Error(error);
                }
            }
        }
    }
    const npmCommand = `npm remove ${commands.join(' ')}`;
    await execAsync(npmCommand);
    console.log(chalk.blue(npmCommand, ' --> ', chalk.green('done.')));
}

function printYellow(msg) {
    console.log('\n', chalk.underline.yellow(msg), '\n');
}
function printRed(msg) {
    console.log(chalk.red('Error ', msg));
}

const workflowSources = {
    web: 'https://raw.githubusercontent.com/cheminfo/.github/main/workflow-templates/nodejs-ts.yml',
    path: '.github/workflows/nodejs.yml',
};
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
    // not sure how to automatically get the answer types
    await inquirer.prompt(questions).then(async (response) => {
        // user answers
        const { install, configs, updateJson, updateGitignore: upg, removes, replaceWorkflow: rpw, } = response;
        // remove software (first, to reduce conflicts)
        if (removes.length > 0) {
            const msg = 'Removing Old Config Files and Software';
            printYellow(msg);
            await removeOld(removes).catch((error) => {
                printRed(msg);
                throw new Error(error);
            });
        }
        // install software
        if (install.length > 0) {
            const msg = 'Installing Software';
            printYellow(msg);
            await installSoftware(install).catch((error) => {
                printRed(msg);
                throw new Error(error);
            });
        }
        // create config files
        const msg = 'Configuring Software';
        printYellow(msg);
        for (const answer of configs) {
            await configureSoftware(answer).catch((error) => {
                printRed(msg);
                throw new Error(error);
            });
        }
        // update package.json
        if (updateJson) {
            const msg = 'Updating package.json';
            printYellow(msg);
            await readFile$1('package.json', 'utf8')
                .then((file) => updatePackageJson(file))
                .catch((error) => {
                printRed(msg);
                throw new Error(error);
            });
        }
        // update .gitignore
        if (upg && (await fileExists('.gitignore'))) {
            const msg = 'Updating .gitignore';
            printYellow(msg);
            await readFile$1('.gitignore', 'utf8') // This line is correct
                .then(async (file) => {
                return updateGitignore(file);
            })
                .catch((error) => {
                printRed(msg);
                throw new Error(error);
            });
        }
        // replace workflow
        if (rpw) {
            const msg = 'Replacing Workflow';
            printYellow(msg);
            const { web, path } = workflowSources;
            await replaceWorkflow(path, web).catch((error) => {
                printRed(msg);
                throw new Error(error);
            });
        }
    });
}

run()
    .then(() => {
    console.log(chalk.green('Done!'), 'You should now be at the step: ', chalk.underline.blueBright('https://github.com/cheminfo/generator-cheminfo/blob/main/ts-migration.md#submit-your-changes'));
})
    .catch((error) => {
    console.log(error);
    process.exit(1);
});
