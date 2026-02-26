package main

import (
	"fmt"

	"github.com/ebfe/scard"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

func main() {
	message := "mensaje a firmar"
	generateKey()
	// signature := SignYubiKeyTransaction()
	// valid := verifySignature(message, "04b6cc685c2b07c69d41499ea26bcee3b3cece08fd17083f642361bc0281c1307f0c947563ae1244b4f85c7a20a89dac0e7b5d3b77c28f28fddda685ad78db485d", signature)
	fmt.Println(message)
}

var YubiKeyAddress common.Address

func connectCard() (*scard.Context, *scard.Card, error) {
	ctx, err := scard.EstablishContext()
	if err != nil {
		return nil, nil, fmt.Errorf("error stablishing PC/SC connection: %v", err)
	}

	readers, err := ctx.ListReaders()
	if err != nil || len(readers) == 0 {
		ctx.Release()
		return nil, nil, fmt.Errorf("couldn't find any smart card readers: %v", err)
	}

	card, err := ctx.Connect(readers[0], scard.ShareShared, scard.ProtocolAny)
	if err != nil {
		ctx.Release()
		return nil, nil, fmt.Errorf("error connecting to card: %v", err)
	}

	return ctx, card, nil
}

func selectOpenPGP(card *scard.Card) error {
	selectApdu := []byte{0x00, 0xA4, 0x04, 0x00, 0x06, 0xD2, 0x76, 0x00, 0x01, 0x24, 0x01}
	return transmitAndCheck(card, selectApdu, "Seleccion Applet OpenPGP")
}

func transmitAndCheck(card *scard.Card, apdu []byte, stepName string) error {
	rsp, err := card.Transmit(apdu)
	if err != nil {
		return fmt.Errorf("error in %s: %v", stepName, err)
	}
	if !isSuccess(rsp) {
		return fmt.Errorf("error om %s. Code State: %X", stepName, rsp[len(rsp)-2:])
	}
	return nil
}

func isSuccess(rsp []byte) bool {
	return len(rsp) >= 2 && rsp[len(rsp)-2] == 0x90 && rsp[len(rsp)-1] == 0x00
}

func extractPubKeyBytes(tlv []byte) []byte {
	for i := 0; i < len(tlv)-2; i++ {
		if tlv[i] == 0x86 {
			length := int(tlv[i+1])
			if i+2+length <= len(tlv) && tlv[i+2] == 0x04 {
				return tlv[i+2 : i+2+length]
			}
		}
	}
	return nil
}

func InitYubiKey() error {
	ctx, card, err := connectCard()
	if err != nil {
		return err
	}
	defer ctx.Release()
	defer card.Disconnect(scard.LeaveCard)

	if err := selectOpenPGP(card); err != nil {
		return err
	}

	readKeyApdu := []byte{0x00, 0x47, 0x81, 0x00, 0x02, 0xB6, 0x00}
	rsp, err := card.Transmit(readKeyApdu)
	if err != nil || !isSuccess(rsp) {
		return fmt.Errorf("error reading public key from YubiKey: %v", err)
	}

	pubKeyBytes := extractPubKeyBytes(rsp[:len(rsp)-2])
	if pubKeyBytes == nil {
		return fmt.Errorf("couldn't extract secp256k1 key from YubiKey response")
	}

	pub, err := crypto.UnmarshalPubkey(pubKeyBytes)
	if err != nil {
		return err
	}

	YubiKeyAddress = crypto.PubkeyToAddress(*pub)
	return nil
}
