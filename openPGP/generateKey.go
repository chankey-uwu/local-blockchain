package main

import (
	"encoding/hex"
	"fmt"
	"log"

	"github.com/ebfe/scard"
)

func generateKey() {
	ctx, card, err := connectCard()
	if err != nil {
		log.Fatalf("hardware not available while trying to sign: %v", err)
	}
	defer ctx.Release()
	defer card.Disconnect(scard.LeaveCard)

	selectOpenPGP(card)

	adminPin := []byte("12345678")
	verifyPinApdu := append([]byte{0x00, 0x20, 0x00, 0x83, byte(len(adminPin))}, adminPin...)
	transmitAndCheck(card, verifyPinApdu, "Admin PIN verification")

	setAlgoApdu := []byte{0x00, 0xDA, 0x00, 0xC1, 0x06, 0x13, 0x2B, 0x81, 0x04, 0x00, 0x0A}
	transmitAndCheck(card, setAlgoApdu, "secp256k1 algorithm selection")

	genKeyApdu := []byte{0x00, 0x47, 0x80, 0x00, 0x02, 0xB6, 0x00}
	rsp, err := card.Transmit(genKeyApdu)
	if err != nil {
		log.Fatalf("Error transmiting APDU: %v\n", err)
	}

	if isSuccess(rsp) {
		fmt.Println("Key generated successfully.")
		extractPubKey(rsp[:len(rsp)-2])
	} else {
		log.Fatalf("Error generating key. State: %X\n", rsp[len(rsp)-2:])
	}
}

func extractPubKey(tlv []byte) {
	for i := 0; i < len(tlv)-2; i++ {
		if tlv[i] == 0x86 {
			length := int(tlv[i+1])
			if i+2+length <= len(tlv) && tlv[i+2] == 0x04 {
				pubKeyBytes := tlv[i+2 : i+2+length]
				fmt.Printf("Complete Public Key (Hex): %s\n", hex.EncodeToString(pubKeyBytes))
				fmt.Printf("X coordinate (Hex): %s\n", hex.EncodeToString(pubKeyBytes[1:33]))
				fmt.Printf("Y coordinate (Hex): %s\n", hex.EncodeToString(pubKeyBytes[33:65]))
				return
			}
		}
	}
	fmt.Println("Error: Couldn't extract public key from TLV.")
}
