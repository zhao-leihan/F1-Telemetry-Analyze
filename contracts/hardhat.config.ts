import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        sepolia: {
            url: process.env.ALCHEMY_RPC_URL || "https://rpc.sepolia.org",
            accounts: process.env.WALLET_PRIVATE_KEY ? [process.env.WALLET_PRIVATE_KEY] : [],
            chainId: 11155111  // Sepolia Testnet
        },
        mainnet: {
            url: process.env.ALCHEMY_RPC_URL || "https://eth.llamarpc.com",
            accounts: process.env.WALLET_PRIVATE_KEY ? [process.env.WALLET_PRIVATE_KEY] : [],
            chainId: 1  // Ethereum Mainnet (for future production)
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || ""
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};

export default config;
