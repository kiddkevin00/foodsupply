import truffleCompiledFoodSafe from '../../build/contracts/FoodSafe.json';
import Web3 from 'web3';
import Crypto from 'crypto-js';
import SolidityCoder from 'web3/lib/solidity/coder';

import '../stylesheets/app.css';


let account;
let foodSafeContract;
let contractFunctionHashes = [];

window.app = {
  start() {
    window.web3.eth.getAccounts((error, accs) => {
      if (error) {
        window.alert('There was an error fetching your accounts.');
        return;
      }

      if (accs.length === 0) {
        window.alert('Couldn\'t get any accounts! Make sure your Ethereum client is configured ' +
          'correctly.');
        return;
      }

      account = accs[0];
      window.web3.eth.defaultAccount = account;

      window.web3.eth.getBalance(account, (err, balanceWei) => {
        if (err) {
          window.alert('There was an error fetching your account balance.');
        } else {
          const balance = window.web3.fromWei(balanceWei, 'ether');

          document.getElementById('my-current-account-balance').textContent = balance;
        }
      });

      window.web3.eth.getBlockNumber((err, blockNumber) => {
        if (err) {
          window.alert('There was an error fetching your account balance.');
        } else {
          document.getElementById('current-block-number').textContent = blockNumber;
        }
      });

      window.web3.eth.filter('latest').watch((err, result) => {
        if (err) {
          console.log(err);
        } else {
          window.web3.eth.getBlock(result, true, (e, block) => {
            if (e) {
              console.log(e);
              return;
            }

            document.getElementById('current-block-number').textContent = block.number;

            //console.log(block.transactions);

            for (const transaction of block.transactions) {
              const functionName = findFunctionByHash(contractFunctionHashes, transaction.input);
              let firstFuncParam;

              if (functionName) {
                firstFuncParam = SolidityCoder.decodeParams(['string'], transaction.input.substring(10));
              }

              const showingMessage = 'New confirmed contract execution:\n' +
                `- Block#: ${transaction.blockNumber}\n` +
                `- From: ${transaction.from}\n` +
                `- To: ${transaction.to || 'N/A'}\n` +
                `- Input: ${functionName || 'N/A'}(${firstFuncParam || 'N/A'}, ...)\n` +
                `- Gas Price: ${transaction.gasPrice}`;

              console.log(showingMessage);
              window.alert(showingMessage);
            }
          });
        }
      });

      // Create a proxy object to access the smart contract.
      foodSafeContract = window.web3.eth.contract(truffleCompiledFoodSafe.abi);

      contractFunctionHashes = getContractFunctionHashes(truffleCompiledFoodSafe.abi);
    });
  },

  createContract() {
    const foodSafeContractCreationDetail = {
      from: account,
      data: truffleCompiledFoodSafe.bytecode,
      gas: 3000000,
    };

    foodSafeContract.new('', foodSafeContractCreationDetail, (err, deployedContract) => {
      if (err) {
        console.log(err);
      } else if (deployedContract.address) {
        document.getElementById('contract-address').value = deployedContract.address;
      }
    });
  },

  addNewLocation() {
    const contractAddress = document.getElementById('contract-address').value;
    const locationId = document.getElementById('location-id').value;
    const locationName = document.getElementById('location-name').value;
    const locationSecret = document.getElementById('location-secret').value;
    const passphraseForLocationSecret = document.getElementById('location-passphrase').value;

    const deployedFoodSafe = foodSafeContract.at(contractAddress);
    const encryptedSecret = Crypto.AES.encrypt(locationSecret, passphraseForLocationSecret)
      .toString();

    deployedFoodSafe.addNewLocation(locationName, locationId, encryptedSecret, (err) => {
      if (err) {
        console.log(err);
      }
    });
  },

  getEndLocation() {
    const contractAddress = document.getElementById('contract-address').value;
    const passphraseForLocationSecret = document.getElementById('location-passphrase').value;

    const deployedFoodSafe = foodSafeContract.at(contractAddress);

    deployedFoodSafe.getTrailCount.call((error, trailCount) => {
      if (error) {
        console.log(error);
      } else {
        deployedFoodSafe.getEndLocation.call(trailCount - 1, (err, locationInfo) => {
          if (err) {
            console.log(err);
          } else {
            const locationId = locationInfo[1];
            const locationName = locationInfo[0];
            const locationEncryptedSecret = locationInfo[4];

            document.getElementById('location-id').value = locationId;
            document.getElementById('location-name').value = locationName;

            if (passphraseForLocationSecret) {
              const locationDecryptedSecret = Crypto.AES.decrypt(locationEncryptedSecret,
                passphraseForLocationSecret).toString(Crypto.enc.Utf8);

              document.getElementById('location-secret').value = locationDecryptedSecret;
            }
          }
        });
      }
    });
  },
};

window.addEventListener('load', () => {
  // Checks if `web3` has already been injected by the browser (Mist/MetaMask).
  if (window.web3) {
    console.warn('Using `web3` from external source. Ensure you\'ve configured the source ' +
      'properly. If you are using MetaMask, see the following link. http://truffleframework.com/' +
      'tutorials/truffle-and-metamask');
    // Uses Mist/MetaMask's provider.
    window.web3 = new Web3(window.web3.currentProvider);
  } else {
    console.warn('No `web3` from external source detected. Falling back to ' +
      'http://127.0.0.1:8545. You should remove this fallback when you deploy live, ' +
      'as it\'s inherently insecure. Consider switching to Metamask for development. ' +
      'More info here: http://truffleframework.com/tutorials/truffle-and-metamask');
    // Connects to a geth server over JSON-RPC.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
  }

  window.app.start();
});

function getContractFunctionHashes(abi) {
  const functionHashes = [];

  for (let i = 0; i < abi.length; i += 1) {
    const item = abi[i];

    if (item.type === 'function') {
      const signature = `${item.name}(${item.inputs.map((input) => input.type).join(',')})`;
      const hash = window.web3.sha3(signature);

      //console.log(item.name + '=' + hash);

      functionHashes.push({ name: item.name, hash });
    }
  }

  return functionHashes;
}

function findFunctionByHash(contractFuncHashes, targetFunctionHash) {
  for (let i = 0; i < contractFuncHashes.length; i += 1) {
    if (contractFuncHashes[i].hash.substring(0, 10) === targetFunctionHash.substring(0, 10)) {
      return contractFuncHashes[i].name;
    }
  }
  return null;
}
