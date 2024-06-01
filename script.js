document.getElementById('connectButton').addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await ethereum.request({ method: 'eth_requestAccounts' });
            document.getElementById('status').innerText = 'MetaMask Connected!';
            document.getElementById('amountUSD').style.display = 'inline'; // Show the amount input
            document.getElementById('buyButton').style.display = 'block'; // Show the buy button
        } catch (error) {
            document.getElementById('status').innerText = 'User rejected the request.';
        }
    } else {
        document.getElementById('status').innerText = 'MetaMask is not installed. Please install it to use this feature.';
    }
});

const contractAddress = '0x61373bf96f8da6954158647f8c1338425ddef471';
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

// Function to fetch BNB/USD exchange rate
async function fetchBNBRate() {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=USD');
    const data = await response.json();
    return data.binancecoin.usd; // Return the BNB to USD rate
}

document.getElementById('buyButton').addEventListener('click', async () => {
    const bnbRate = await fetchBNBRate(); // Fetch the latest BNB/USD rate
    if (bnbRate && typeof window.ethereum !== 'undefined' && window.web3) {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const usdAmount = document.getElementById('amountUSD').value; // Get user-specified amount in USD
        const bnbAmount = usdAmount / bnbRate; // Convert USD to BNB
        const valueInWei = web3.utils.toWei(bnbAmount.toString(), 'ether'); // Convert BNB to Wei

        try {
            const accounts = await web3.eth.getAccounts();
            const receipt = await contract.methods.buyTokens().send({ from: accounts[0], value: valueInWei });
            console.log('Transaction successful: ', receipt);
        } catch (error) {
            console.error('Transaction failed: ', error);
        }
    } else {
        console.log('MetaMask is not installed or the web3 instance is not available.');
    }
});
