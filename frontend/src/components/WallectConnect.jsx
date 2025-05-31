import React from "react";

const WalletConnect = ({ account, connectWallet, tokenBalance }) => {
  return (
    <>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div className="wallet-info">
          Connected: {account.slice(0, 8)}...{account.slice(-6)}
          <div className="token-balance">
            Creator Token Balance: {tokenBalance}
          </div>
        </div>
      )}
    </>
  );
};

export default WalletConnect;
