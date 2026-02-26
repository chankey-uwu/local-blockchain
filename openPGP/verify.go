package main

import (
	"encoding/hex"
	"fmt"

	"github.com/ethereum/go-ethereum/crypto"
)

func verifySignature(mensaje string, pubKeyHex string, sigHex string) bool {
	pubKeyBytes, err := hex.DecodeString(pubKeyHex)
	if err != nil {
		fmt.Printf("Error decoding public key: %v\n", err)
		return false
	}

	sigBytes, err := hex.DecodeString(sigHex)
	if err != nil {
		fmt.Printf("Error decoding signature: %v\n", err)
		return false
	}

	if len(sigBytes) != 64 {
		fmt.Printf("Error: 64 bytes expected, got %d\n", len(sigBytes))
		return false
	}

	hash := crypto.Keccak256Hash([]byte(mensaje))

	isValid := crypto.VerifySignature(pubKeyBytes, hash.Bytes(), sigBytes)

	return isValid
}
