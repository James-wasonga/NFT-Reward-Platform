// export default App;
import React, { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
// import { ethers } from "ethers";
import { create } from "ipfs-http-client";

import WalletConnect from "./components/WallectConnect";
import MintNFT from "./components/MintNFT";
import NFTGallery from "./components/NFTGallery";

// Import your contract ABI JSON files accordingly
import CreatorTokenABI from "./abis/CreatorToken.json";
import ArtNFTABI from "./abis/ArtNFT.json";

const projectId = import.meta.env.VITE_PROJECTID;
const projectSecret = import.meta.env.VITE_PROJECTSECRET;
const auth = "Basic " + btoa(projectId + ":" + projectSecret);

// const ipfsClient = create("https://ipfs.infura.io:5001/api/v0");

const ipfsClient = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});


const App = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [creatorTokenContract, setCreatorTokenContract] = useState(null);
  const [artNFTContract, setArtNFTContract] = useState(null);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [mintLoading, setMintLoading] = useState(false);
  const [mintFile, setMintFile] = useState(null);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [networkCorrect, setNetworkCorrect] = useState(false);

  // Replace with your actual deployed contract addresses on Lisk Sepolia
  const CREATOR_TOKEN_ADDRESS = "0x1AA4A48F764fd43FD94158e4d18583fe2b409f1F";
  const ART_NFT_ADDRESS = "0xC507AC5c83f48635D7A3290f8A4C9532bE3268e0";

  const connectWallet = async () => {
    setError("");
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed. Please install it.");
        return;
      }
      const _provider = new BrowserProvider(window.ethereum);
      const { chainId } = await _provider.getNetwork();
      // 11155111 is Sepolia testnet chainId; replace if needed
      // if (chainId !== 4202) {
      //   setError("Please switch your wallet to Lisk Sepolia network.");
      //   setNetworkCorrect(false);
      //   return;
      // } else {
        setNetworkCorrect(true);
      // }

      await _provider.send("eth_requestAccounts", []);
      const _signer = await _provider.getSigner();
      const userAddress = await _signer.getAddress();

      const creatorToken = new Contract(
        CREATOR_TOKEN_ADDRESS,
        CreatorTokenABI.abi,
        _signer
      );
      const artNFT = new Contract(ART_NFT_ADDRESS, ArtNFTABI.abi, _signer);

      setProvider(_provider);
      setSigner(_signer);
      setAccount(userAddress);
      setCreatorTokenContract(creatorToken);
      setArtNFTContract(artNFT);
    } catch (err) {
      setError("Failed to connect wallet: " + err.message);
      // alert("Failed to connect wallet: " + err.message);

    }
  };

  // Fetch Creator Token Balance
  const fetchTokenBalance = useCallback(async () => {
    if (creatorTokenContract && account) {
      try {
        const bal = await creatorTokenContract.balanceOf(account);
        setTokenBalance(formatUnits(bal, 18));
      } catch (e) {
        console.error("Error fetching token balance:", e);
      }
    }
  }, [creatorTokenContract, account]);

  // Fetch Minted NFTs
  const fetchMintedNFTs = useCallback(async () => {
    if (!artNFTContract) return;
    try {
      const filter = artNFTContract.filters.NFTMinted();
      const events = await artNFTContract.queryFilter(filter, 0, "latest");

      console.log("Events fetched:", events);
      
      const nfts = await Promise.all(
        events.map(async (event) => {
          // const tokenId = event.args.tokenId.toNumber();
          const tokenId = Number(event.arg.tokenId);
          const creator = event.args.creator;
          let tokenURI = "";
          try {
            tokenURI = await artNFTContract.tokenURI(tokenId);
          } catch {
            tokenURI = "";
          }
          let metadata = { name: "", image: "", description: "" };
          if (tokenURI) {
            try {
              const resp = await fetch(tokenURI);
              if (resp.ok) {
                metadata = await resp.json();
              }
            } catch {}
          }
          return {
            tokenId,
            creator,
            metadata,
          };
        })
      );
      setMintedNFTs(nfts.reverse());
    } catch (err) {
      console.error("Error fetching minted NFTs:", err);
    }
  }, [artNFTContract]);

  useEffect(() => {
    if (account) {
      fetchTokenBalance();
    }
  }, [account, fetchTokenBalance]);

  useEffect(() => {
    if (artNFTContract) {
      fetchMintedNFTs();
    }
  }, [artNFTContract, fetchMintedNFTs]);

  // Upload file to IPFS
  const uploadFileToIPFS = async (file) => {
    try {
      const added = await ipfsClient.add(file);
      return `https://ipfs.infura.io/ipfs/${added.path}`;
    } catch (err) {
      setError("File upload failed: " + err.message);
      return null;
    }
  };

  // Upload metadata JSON to IPFS
  const uploadMetadataToIPFS = async (metadata) => {
    try {
      const added = await ipfsClient.add(JSON.stringify(metadata));
      return `https://ipfs.infura.io/ipfs/${added.path}`;
    } catch (err) {
      setError("Metadata upload failed: " + err.message);
      return null;
    }
  };

  // Mint NFT handler
  const mintNFTHandler = async () => {
    setError("");
    setTxHash("");
    if (!mintFile) {
      setError("Please select an image file.");
      return;
    }
    if (!artNFTContract) {
      setError("Connect your wallet first.");
      return;
    }
    try {
      setMintLoading(true);
      const imageUrl = await uploadFileToIPFS(mintFile);
      if (!imageUrl) {
        setMintLoading(false);
        return;
      }

      const metadata = {
        name: "Art NFT #" + Date.now(),
        description: "Unique digital artwork",
        image: imageUrl,
      };

      const metadataURI = await uploadMetadataToIPFS(metadata);
      if (!metadataURI) {
        setMintLoading(false);
        return;
      }

      const tx = await artNFTContract.mint(metadataURI);
      await tx.wait();
      setTxHash(tx.hash);

      fetchTokenBalance();
      fetchMintedNFTs();
      setMintFile(null);
    } catch (err) {
      setError("Minting failed: " + err.message);
    } finally {
      setMintLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Token Powered NFT Platform</h1>
        <WalletConnect
          account={account}
          connectWallet={connectWallet}
          tokenBalance={tokenBalance}
        />
      </header>

      <main>
        <MintNFT
          mintFile={mintFile}
          setMintFile={setMintFile}
          mintNFTHandler={mintNFTHandler}
          mintLoading={mintLoading}
          txHash={txHash}
          error={error}
          account={account}
          networkCorrect={networkCorrect}
        />

        <NFTGallery mintedNFTs={mintedNFTs} />
      </main>

      <footer>
        Developed for Token-Powered NFT Platform Assignment &mdash; &copy; 2024
      </footer>
    </div>
  );
};

export default App;
