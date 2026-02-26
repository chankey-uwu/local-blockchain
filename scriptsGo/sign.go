package main

import (
	"fmt"
	"math/big"

	"github.com/ebfe/scard"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
)

func normalizeSignature(sigBytes []byte) []byte {
	if len(sigBytes) != 64 {
		return sigBytes
	}

	s := new(big.Int).SetBytes(sigBytes[32:])
	N := crypto.S256().Params().N
	halfN := new(big.Int).Div(N, big.NewInt(2))

	if s.Cmp(halfN) > 0 {
		s.Sub(N, s)
		sBytes := s.Bytes()

		paddedS := make([]byte, 32)
		copy(paddedS[32-len(sBytes):], sBytes)

		copy(sigBytes[32:], paddedS)
	}

	return sigBytes
}

func SignYubiKeyTransaction(tx *types.Transaction, chainID *big.Int, pin string) (*types.Transaction, error) {
	ctx, card, err := connectCard()
	if err != nil {
		return nil, fmt.Errorf("hardware not available: %v", err)
	}
	defer ctx.Release()
	defer card.Disconnect(scard.LeaveCard)

	selectOpenPGP(card)

	userPin := []byte(pin)
	verifyPinApdu := append([]byte{0x00, 0x20, 0x00, 0x81, byte(len(userPin))}, userPin...)
	transmitAndCheck(card, verifyPinApdu, "User PIN verification")

	signer := types.LatestSignerForChainID(chainID)
	txHash := signer.Hash(tx)

	signApdu := append([]byte{0x00, 0x2A, 0x9E, 0x9A, byte(len(txHash.Bytes()))}, txHash.Bytes()...)
	sigRsp, err := card.Transmit(signApdu)
	if err != nil || !isSuccess(sigRsp) {
		return nil, fmt.Errorf("failed to sign transaction in YubiKey: %v", err)
	}

	signature := normalizeSignature(sigRsp[:len(sigRsp)-2])

	var finalSignature []byte
	for v := 0; v < 2; v++ {
		sigWithV := append(signature, byte(v))
		recoveredPub, err := crypto.SigToPub(txHash.Bytes(), sigWithV)
		if err == nil {
			if crypto.PubkeyToAddress(*recoveredPub) == YubiKeyAddress {
				finalSignature = sigWithV
				break
			}
		}
	}

	if finalSignature == nil {
		return nil, fmt.Errorf("couldn't derive V parameter")
	}

	return tx.WithSignature(signer, finalSignature)
}
