const rest = require('restler');
const Configstore = require('configstore');
const pkg = require('../package.json');
const files = require('./files.js');
const CLI = require('clui');
const Spinner = CLI.Spinner;
const inquirer = require('./inquirer');
const conf = new Configstore(pkg.name);
const baseUrl = pkg.baseUrl;
const APIVersion = pkg.APIVersion;
const crypto = require('crypto');

module.exports = {
  getStoredEtheruiToken: () => {
    return { authToken: conf.get('etherui.authToken'), userId: conf.get('etherui.userId'), path: conf.path };
  },
  setEtheruiCredentials: async () => {
    const credentials = await inquirer.askEtheruiCredentials();
    const status = new Spinner('Authenticating you, please wait...');
    status.start();
    const asyncWrapper = async() => {
      return new Promise(resolve => {
        rest.post(`${baseUrl}/api/${APIVersion}/login`,
          {
            data: { email: credentials.email,
                    password: crypto.createHash('sha256').update(credentials.password).digest().toString('hex'),
                    hashed: true,
            },
            timeout: 10000,
            headers: {
              Accept: '*/*',
              'User-Agent': 'Etherui-deploy',
            },
          },
        ).on('complete', (result) => {
          if (result instanceof Error) {
            console.log('Error:', result.message);
          } else {
            try {
              if (result.status === 'success' && result.data) {
                conf.set('etherui.authToken', result.data.authToken);
                conf.set('etherui.userId', result.data.userId);
                resolve(result.data);
              } else {
                throw new Error('EtherUI token was not found in the response');
              }
            } catch (err) {
              throw err;
            } finally {
              status.stop();
            }
          }
        });
      });
    };
    const wrapperResult = await asyncWrapper();
    return wrapperResult;
  },
  getSmartContractFile: async () => {
    const smartContractData = await inquirer.askTruffleSmartContractName();
    if (!files.directoryExists(smartContractData.builddirectory)) {
      throw new Error('You need to specify the right path for build directory. By default, truffle framework compiles Smart contracts in "build" directory.');
    }
    if (!files.fileExists(`${smartContractData.builddirectory}/contracts/${smartContractData.smartcontractname}.json`)) {
      throw new Error(`You need to specify the right filename for the Smart contract without an extension. For example, "MyToken". Please, check the path: ${smartContractData.builddirectory}/contracts/${smartContractData.smartcontractname}.json`);
    }
    const SCContent = files.getContent(`${smartContractData.builddirectory}/contracts/${smartContractData.smartcontractname}.json`);
    if (!SCContent) {
      throw new Error(`We could not read Smart contract truffle json. Please, check the path: ${smartContractData.builddirectory}/contracts/${smartContractData.smartcontractname}.json`);
    } else {
      return SCContent;
    }
  },
  getSmartContractAddress: async () => {
    const smartContractAddress = await inquirer.askSmartContractAddress();
    return smartContractAddress.address;
  },
};
