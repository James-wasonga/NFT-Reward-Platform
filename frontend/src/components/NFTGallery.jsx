import React from "react";

const NFTGallery = ({ mintedNFTs }) => {
  return (
    <section className="card" style={{ overflowY: "auto", maxHeight: "600px" }}>
      <h2>Gallery</h2>
      {mintedNFTs.length === 0 && <p>No NFTs minted yet.</p>}
      <div className="nft-list">
        {mintedNFTs.map((nft) => (
          <div key={nft.tokenId} className="nft-card">
            <div
              className="nft-image"
              style={{ backgroundImage: `url(${nft.metadata.image || ""})` }}
              title={nft.metadata.description || ""}
            />
            <div className="nft-info">
              <div>
                <strong>ID:</strong> #{nft.tokenId}
              </div>
              <div>{nft.metadata.name || "Unnamed"}</div>
              <div className="creator-info">
                Creator: {nft.creator.slice(0, 8)}...{nft.creator.slice(-6)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NFTGallery;
