import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { NFTStorage, File } from 'nft.storage';
import CreatorTokenAbi from './abis/CreatorToken.json';
import ArtNFTAbi from './abis/ArtNFT.json';

const tokenAddress = import.meta.env.VITE_TOKEN_ADDRESS;
const nftAddress = import.meta.env.VITE_NFT_ADDRESS;
const nftStorageApiKey = import.meta.env.VITE_NFT_STORAGE_KEY;

function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [balance, setBalance] = useState('');
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await prov.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setProvider(prov);
      const signer = prov.getSigner();

      const token = new ethers.Contract(tokenAddress, CreatorTokenAbi.abi, signer);
      const nft = new ethers.Contract(nftAddress, ArtNFTAbi.abi, signer);
      setTokenContract(token);
      setNftContract(nft);
    }
  };

  const uploadToIPFS = async () => {
    const client = new NFTStorage({ token: nftStorageApiKey });
    const metadata = await client.store({
      name,
      description: desc,
      image: new File([image], image.name, { type: image.type }),
    });
    return metadata.url;
  };

  const mintNFT = async () => {
    const uri = await uploadToIPFS();
    const tx = await nftContract.mintNFT(uri);
    await tx.wait();
    alert("NFT Minted! TX: " + tx.hash);
  };

  const fetchBalance = async () => {
    const bal = await tokenContract.balanceOf(account);
    setBalance(ethers.utils.formatEther(bal));
  };

  useEffect(() => {
    if (tokenContract && account) {
      fetchBalance();
    }
  }, [tokenContract, account]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>NFT Reward Platform</h1>
      {account ? (
        <>
          <p>Connected: {account}</p>
          <p>CTK Balance: {balance}</p>

          <div>
            <h2>Mint NFT</h2>
            <input type="text" placeholder="Name" onChange={e => setName(e.target.value)} />
            <input type="text" placeholder="Description" onChange={e => setDesc(e.target.value)} />
            <input type="file" onChange={e => setImage(e.target.files[0])} />
            <button onClick={mintNFT}>Mint</button>
          </div>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default App;