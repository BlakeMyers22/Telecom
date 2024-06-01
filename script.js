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

const usdcContractAddress = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';
const usdcContractABI = [
    // Insert the full ABI here
];

async function fetchBNBRate() {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
    const data = await response.json();
    return data.binancecoin.usd;
}

document.getElementById('buyButton').addEventListener('click', async () => {
    const bnbRate = await fetchBNBRate();
    if (bnbRate && typeof window.ethereum !== 'undefined' && window.web3) {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(usdcContractABI, usdcContractAddress);
        const usdAmount = document.getElementById('amountUSD').value;
        const bnbAmount = usdAmount / bnbRate;
        const valueInWei = web3.utils.toWei(bnbAmount.toString(), 'ether');

        try {
            const accounts = await web3.eth.getAccounts();
            const transaction = await web3.eth.sendTransaction({
                from: accounts[0],
                to: usdcContractAddress,
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
