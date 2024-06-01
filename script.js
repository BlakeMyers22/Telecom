const telecomContractAddress = '0x61373bF96f8dA6954158647F8c1338425dDEf471';
const telecomContractABI = [{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"uint8","name":"_decimals","type":"uint8"},{"internalType":"address","name":"_creator","type":"address"},{"internalType":"uint256","name":"_totalSupply","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"INFO","outputs":[{"internalType":"uint8","name":"decimals","type":"uint8"},{"internalType":"address","name":"creator","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TOKEN_TYPE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];

document.getElementById('connectButton').addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await ethereum.request({ method: 'eth_requestAccounts' });
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            if (chainId !== '0x38') { // 0x38 is the chain ID for BSC mainnet
                await ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x38' }],
                });
            }
            document.getElementById('status').innerText = 'MetaMask Connected!';
            document.getElementById('amountUSD').style.display = 'inline';
            document.getElementById('buyButton').style.display = 'block';
        } catch (error) {
            document.getElementById('status').innerText = 'User rejected the request or failed to switch network.';
        }
    } else {
        document.getElementById('status').innerText = 'MetaMask is not installed. Please install it to use this feature.';
    }
});

async function fetchUSDCtoBNBRate() {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,binancecoin&vs_currencies=usd');
    const data = await response.json();
    const usdcToUsd = data['usd-coin'].usd;
    const bnbToUsd = data['binancecoin'].usd;
    return usdcToUsd / bnbToUsd;
}

document.getElementById('buyButton').addEventListener('click', async () => {
    const usdcToBnbRate = await fetchUSDCtoBNBRate();
    if (usdcToBnbRate && typeof window.ethereum !== 'undefined' && window.web3) {
        const web3 = new Web3(window.ethereum);
        const usdAmount = document.getElementById('amountUSD').value;
        const usdcAmount = usdAmount; // 1 USDC = 1 USD
        const bnbAmount = usdcAmount / usdcToBnbRate;
        const valueInWei = web3.utils.toWei(bnbAmount.toString(), 'ether');

        try {
            const accounts = await web3.eth.getAccounts();
            const telecomContract = new web3.eth.Contract(telecomContractABI, telecomContractAddress);

            const transaction = await telecomContract.methods.transfer(accounts[0], web3.utils.toWei(usdcAmount.toString(), 'ether')).send({
                from: accounts[0],
                value: valueInWei,
                gas: 300000
            });
            console.log('Transaction successful: ', transaction);
            document.getElementById('status').innerText = `Transaction successful: ${transaction.transactionHash}`;
        } catch (error) {
            console.error('Transaction failed: ', error);
            document.getElementById('status').innerText = `Transaction failed: ${error.message}`;
        }
    } else {
        document.getElementById('status').innerText = 'MetaMask is not installed or the web3 instance is not available.';
    }
});
