async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  // Deploy CreatorToken with initialOwner
  const CreatorToken = await ethers.getContractFactory("CreatorToken");
  const creatorToken = await CreatorToken.deploy(deployer.address);
  await creatorToken.waitForDeployment();
  console.log("CreatorToken deployed to:", await creatorToken.getAddress());

  // Deploy ArtNFT with creatorToken address and initialOwner
  const ArtNFT = await ethers.getContractFactory("ArtNFT");
  const artNFT = await ArtNFT.deploy(await creatorToken.getAddress(), deployer.address);
  await artNFT.waitForDeployment();
  console.log("ArtNFT deployed to:", await artNFT.getAddress());

  // Transfer ownership of CreatorToken to ArtNFT contract
  console.log("Transferring ownership of CreatorToken to ArtNFT contract...");
  const tx = await creatorToken.transferOwnership(await artNFT.getAddress());
  await tx.wait();
  console.log("Ownership transferred.");

  console.log("Deployment complete.");
  console.log("CreatorToken Address:", await creatorToken.getAddress());
  console.log("ArtNFT Address:", await artNFT.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
 