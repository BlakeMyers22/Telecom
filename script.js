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

const contractAddress = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';
const contractABI = [
    {
        "constant": false,
        "inputs": [],
        "name": "buyTokens",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    }
];

async function fetchBNBRate() {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=USD');
    const data = await response.json();
    return data.binancecoin.usd;
}

document.getElementById('buyButton').addEventListener('click', async () => {
    const bnbRate = await fetchBNBRate();
    if (bnbRate && typeof window.ethereum !== 'undefined' && window.web3) {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const usdAmount = document.getElementById('amountUSD').value;
        const bnbAmount = usdAmount / bnbRate;
        const valueInWei = web3.utils.toWei(bnbAmount.toString(), 'ether');

        try {
            const accounts = await web3.eth.getAccounts();
            const receipt = await contract.methods.buyTokens().send({
                from: accounts[0],
                value: valueInWei,
                gas: 300000 // Adjust the gas limit as needed
            });
            console.log('Transaction successful: ', receipt);
        } catch (error) {
            console.error('Transaction failed: ', error);
            document.getElementById('status').innerText = `Transaction failed: ${error.message}`;
        }
    } else {
        console.log('MetaMask is not installed or the web3 instance is not available.');
        document.getElementById('status').innerText = 'MetaMask is not installed or the web3 instance is not available.';
    }
});
