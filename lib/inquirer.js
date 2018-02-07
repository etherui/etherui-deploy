const inquirer = require('inquirer');

module.exports = {
  askEtheruiCredentials: () => {
    const questions = [
      {
        name: 'email',
        type: 'input',
        message: 'Enter your EtherUI email:',
        validate: (value) => {
          return value.length ? true : 'Please enter your email.';
        },
      },
      {
        name: 'password',
        type: 'password',
        message: 'Enter your password:',
        validate: (value) => {
          return value.length ? true : 'Please enter your password.';
        },
      },
    ];
    return inquirer.prompt(questions);
  },
  askTruffleSmartContractName: () => {
    const questions = [
      {
        name: 'builddirectory',
        type: 'input',
        message: 'Enter the build directory for truffle framework:',
        default: 'build',
      },
      {
        name: 'smartcontractname',
        type: 'input',
        message: 'Enter the Smart contract filename from the build directory, without an extension:',
        validate: (value) => {
          return value.length ? true : 'Please enter the Smart contract filename. For example, "MyToken".';
        },
      },
    ];
    return inquirer.prompt(questions);
  },
  askSmartContractAddress: () => {
    const questions = [
      {
        name: 'address',
        type: 'input',
        message: 'Enter the address for your Smart contract:',
        validate: (value) => {
          return value.length ? true : 'Please, specify address or deploy your smart contract before this step.';
        },
      },
    ];
    return inquirer.prompt(questions);
  },
};
