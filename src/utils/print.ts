import chalk from 'chalk';

export function printYellow(msg: string) {
  console.log('\n', chalk.underline.yellow(msg), '\n');
}

export function printRed(msg: string) {
  console.log(chalk.red('Error ', msg));
}
