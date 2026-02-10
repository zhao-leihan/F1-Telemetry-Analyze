/**
 * Wallet Connect Component
 * 
 * MetaMask wallet connection for blockchain features
 */

'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WalletConnect() {
    return (
        <div className="flex items-center">
            <ConnectButton
                chainStatus="icon"
                showBalance={false}
                accountStatus={{
                    smallScreen: 'avatar',
                    largeScreen: 'full',
                }}
            />
        </div>
    );
}
