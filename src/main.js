//import AuthABI from "./contracts/Auth.json";

fetch('./contracts/Auth.json')
  .then(response => response.json())
  .then(async AuthABI => {
    try {
      // Check if MetaMask is installed and available
      if (window.ethereum) {
        await window.ethereum.enable(); // Request user's permission to connect MetaMask
        const web3 = new Web3(window.ethereum);

        let authContract = new web3.eth.Contract(AuthABI.abi, '0x16C36b54A6E2862298CFB1882747a2370F021F2f');

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = AuthABI.networks[networkId];
        
        if (!deployedNetwork) {
          throw new Error('Contract not deployed on the current network');
        }

        async function register() {
          let userAddress = (await web3.eth.getAccounts())[0]; // Get the connected account
          let device = document.getElementById('device').value;
          let ip = document.getElementById('ip').value;

          try {
            const transaction = await authContract.methods.register(userAddress, device, ip).send({ from: userAddress });
            console.log('Transaction:', transaction);
          } catch (error) {
            console.error('Error registering:', error);
          }
        }

      async function login() {
        let userAddress = document.getElementById('userAddress').value;
        let ip = document.getElementById('ip').value;
        await authContract.methods.login(userAddress, ip).call({from: userAddress});
      }

      async function logout() {
        let userAddress = document.getElementById('userAddress').value;
        await authContract.methods.logout(userAddress).send({from: userAddress});
      }

      async function displayLogs() {
        let userAddress = document.getElementById('userAddress').value;
        let logs = await authContract.methods.loginAttempts(userAddress).call({from: userAddress});
        console.log(logs);
      }

      document.getElementById('registerButton').addEventListener('click', register);
      document.getElementById('loginButton').addEventListener('click', login);
      document.getElementById('logoutButton').addEventListener('click', logout);
      document.getElementById('displayLogsButton').addEventListener('click', displayLogs);
    } else {
      console.error('MetaMask not available in this browser');
    }
    } catch (error) {
      console.error('Error initializing contract:', error);
    }
  })
  .catch(error => console.error('Error loading Auth.json:', error));
