import { ethers } from "hardhat";

/**
 * Deploy F1TelemetryRegistry contract to Ethereum
 * 
 * Usage:
 *   Testnet: npx hardhat run scripts/deploy.ts --network sepolia
 *   Mainnet: npx hardhat run scripts/deploy.ts --network mainnet
 */
async function main() {
    const network = await ethers.provider.getNetwork();
    const isSepolia = network.chainId === 11155111n;
    const isMainnet = network.chainId === 1n;

    console.log(`🏎️  Deploying F1TelemetryRegistry to ${isSepolia ? 'Sepolia Testnet' : isMainnet ? 'Ethereum MAINNET' : 'Unknown Network'}...\n`);

    if (isMainnet) {
        console.log("⚠️  WARNING: Deploying to MAINNET! Real ETH will be spent!");
        console.log("⚠️  Make sure your wallet has enough ETH for gas fees.\n");
    } else if (isSepolia) {
        console.log("✅ Deploying to Sepolia Testnet - FREE test ETH!");
        console.log("Get test ETH from: https://sepoliafaucet.com/\n");
    }

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

    if (balance === 0n) {
        console.log("⚠️  WARNING: Account has no ETH!");
        if (isMainnet) {
            console.log("You need ETH to deploy on mainnet. Please add funds to your wallet.\n");
        } else {
            console.log("Get free test ETH from:");
            console.log("  - https://sepoliafaucet.com/");
            console.log("  - https://www.alchemy.com/faucets/ethereum-sepolia");
            console.log("  - https://faucet.quicknode.com/ethereum/sepolia\n");
        }
        process.exit(1);
    }

    // Deploy contract
    console.log("Deploying contract...");
    const F1TelemetryRegistry = await ethers.getContractFactory("F1TelemetryRegistry");
    const registry = await F1TelemetryRegistry.deploy();

    await registry.waitForDeployment();
    const contractAddress = await registry.getAddress();

    console.log("\n✅ F1TelemetryRegistry deployed!");
    console.log("📍 Contract address:", contractAddress);

    const explorerUrl = isMainnet
        ? `https://etherscan.io/address/${contractAddress}`
        : `https://sepolia.etherscan.io/address/${contractAddress}`;

    console.log("🔗 View on Etherscan:");
    console.log(`   ${explorerUrl}`);

    console.log("\n📝 Save this address to your .env files:");
    console.log(`   Backend: CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`   Frontend: NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);

    const networkName = isSepolia ? "sepolia" : "mainnet";
    console.log("\n🔍 Verify contract (optional):");
    console.log(`   npx hardhat verify --network ${networkName} ${contractAddress}`);

    console.log("\n🎉 Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
