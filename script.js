document.getElementById('connectButton').addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await ethereum.request({ method: 'eth_requestAccounts' });
            document.getElementById('status').innerText = 'MetaMask Connected!';
            document.getElementById('amountUSD').style.display = 'inline';
            document.getElementById('buyButton').style.display = 'block';
        } catch (error) {
            document.getElementById('status').innerText = 'User rejected the request.';
        }
    } else {
        document.getElementById('status').innerText = 'MetaMask is not installed. Please install it to use this feature.';
    }
});

const usdcContractAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48';
const usdcContractABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    // ... more entries
];

async function fetchETHUSDPrice() {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    return data.ethereum.usd;
}

document.getElementById('buyButton').addEventListener('click', async () => {
    const ethUsdPrice = await fetchETHUSDPrice();
    if (ethUsdPrice && typeof window.ethereum !== 'undefined' && window.web3) {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(usdcContractABI, usdcContractAddress);
        const usdAmount = document.getElementById('amountUSD').value;
        const ethAmount = usdAmount / ethUsdPrice;
        const valueInWei = web3.utils.toWei(ethAmount.toString(), 'ether');

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
