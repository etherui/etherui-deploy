#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const rest = require('restler');
const CLI = require('clui');
const Spinner = CLI.Spinner;
const pkg = require('./package.json');
const files = require('./lib/files');
const etherui = require('./lib/etherui');
const APIVersion = pkg.APIVersion;
const baseUrl = pkg.baseUrl;

clear();
console.log(
  chalk.yellow(
  figlet.textSync('ETHERUI.NET', { horizontalLayout: 'full' })
  )
);

if (!files.fileExists('truffle.js') && !files.fileExists('truffle-config.js')) {
  console.log(chalk.red('You need to run this command into truffle project folder with file truffle.js or truffle-config.js'));
  process.exit();
}

const getEtheruiToken = async () => {
  // Fetch token from config store
  const token = etherui.getStoredEtheruiToken();
  if (token.authToken && token.userId) {
    console.log(chalk.bgCyan('Reuse previous token. To reissue new token you need to delete file by path:'));
    console.log(chalk.bgCyan(token.path));
    return token;
  }

  // No token found, use credentials to access Etherui account
  const newToken = await etherui.setEtheruiCredentials();

  if (!newToken) {
    console.log(chalk.red('Unauthorized. Username or password is wrong.'));
    process.exit();
  }

  return newToken;
};

const getSmartContract = async () => {
  const smartContractFile = await etherui.getSmartContractFile();
  return smartContractFile;
};

const getSmartContractAddress = async () => {
  const smartContractAddress = await etherui.getSmartContractAddress();
  return smartContractAddress;
};

const createSmartContractNewUI = async (smartContractAddress, SCJSON, token) => {
  const asyncWrapper = async () => {
    return new Promise(resolve => {
      const status = new Spinner('We are creating new UI for your Smart Contract, please wait...');
      status.start();
      rest.post(`${baseUrl}/api/${APIVersion}/smartContractNewUI`,
        { data:
        {
          address: smartContractAddress,
          contract_name: SCJSON.contract_name,
          abi: JSON.stringify(SCJSON.abi),
          arguments: null,
        },
        headers: {
          Accept: '*/*',
          'User-Agent': 'Etherui-deploy',
          'X-Auth-Token': token.authToken,
          'X-User-Id': token.userId,
        },
        timeout: 10000,
        }
      ).on('complete', (result) => {
        if (result instanceof Error) {
          console.log('Error:', result.message);
        } else {
          try {
            if (result.status === 'success' && result.data) {
              resolve(result.data);
            } else {
              throw new Error(result.message);
            }
          } catch (err) {
            console.log(chalk.red(err.message));
          } finally {
            status.stop();
          }
        }
      });
    });
  };
  const wrapperResult = await asyncWrapper();
  return wrapperResult;
};

const run = async () => {
  try {
    // Retrieve & Set Authentication Token
    const token = await getEtheruiToken();
    // Get Smart contract content
    const smartContract = await getSmartContract();
    // Get Smart contract address
    const smartContractAddress = await getSmartContractAddress();
    // Transform to JSON
    const SCJSON = JSON.parse(smartContract);
    // Send all to create new UI
    const done = await createSmartContractNewUI(smartContractAddress, SCJSON, token);
    if (done) {
      console.log(chalk.green(`All done! You can check your new UI for Smart contract by URL: ${baseUrl}/smartcontract/${smartContractAddress}`));
    }
  } catch (err) {
    console.log(chalk.red(err.message));
  }
};

run();
