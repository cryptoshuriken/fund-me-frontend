import { ethers } from './ethers-5.6.esm.min.js'
import { abi, contractAddress } from './constants.js'

const connectButton = document.getElementById('connectButton')
const fundButton = document.getElementById('fundButton')
const balanceButton = document.getElementById('balanceButton')
const withdrawButton = document.getElementById('withdrawButton')

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log(ethers)

// connect Metamask
async function connect() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' }) // automatically connect to Metamask
    } catch (error) {
      console.log(error)
    }
    connectButton.innerHTML = 'Connected!'
  } else {
    connectButton.innerHTML = 'Please install Metamask!'
  }
}

// balance button function
async function getBalance() {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance)) // make eth balance easier to read
  }
}

// fund function
async function fund() {
  const ethAmount = document.getElementById('ethAmount').value
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== 'undefined') {
    // in order to execute function, we need thse things
    // 1 - provider/ connection to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    console.log(provider)
    // 2 - signer/ wallet
    const signer = provider.getSigner()
    console.log(signer)
    // 3 - smart contract to interact with
    //    ^ to interact with contract: we need: ABI and Address
    const contract = new ethers.Contract(contractAddress, abi, signer)

    // now that we have the contract object, we can start making txns
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      // wait for this txn to finish
      await listenForTransactionMined(transactionResponse, provider) // wait until this function is completely done
    } catch (error) {
      console.log(error)
    }
  }
}

// listen for tx to be mined
function listenForTransactionMined(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`)
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      )
      resolve() // only finish once this transactionResponse.hash is found
    })
  })
  // reason why we return a Promise is because we want to create a listener for the blockchain
}

// withdraw button function
async function withdraw() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('Withdrawing...💰')
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

    try {
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMined(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  }
}
