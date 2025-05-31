import React from "react";

const MintNFT = ({
  mintFile,
  setMintFile,
  mintNFTHandler,
  mintLoading,
  txHash,
  error,
  account,
  networkCorrect,
}) => {
  return (
    <section className="card">
      <h2>Mint Your NFT</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          setMintFile(e.target.files[0]);
        }}
      />
      <button onClick={mintNFTHandler} disabled={mintLoading || !networkCorrect}>
        {mintLoading ? "Minting..." : "Mint NFT"}
      </button>
      {txHash && (
        <div className="tx-hash">
          Transaction Hash:{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {txHash}
          </a>
        </div>
      )}
      {!networkCorrect && account && (
        <div className="error">Please switch network to Lisk Sepolia!</div>
      )}
      {error && <div className="error">⚠️ {error}</div>}
    </section>
  );
};

export default MintNFT;
