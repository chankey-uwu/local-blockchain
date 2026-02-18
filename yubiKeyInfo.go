package main

import (
	"errors"
	"strings"

	"github.com/go-piv/piv-go/piv"
)

func YubiKeyInfo() ([]string, error) {
	cards, err := piv.Cards()
	println(cards[0])
	if err != nil {
		return nil, err
	}
	if len(cards) == 0 {
		return nil, errors.New("no YubiKey detected")
	}

	var certList []string

	for _, card := range cards {
		if strings.Contains(strings.ToLower(card), "yubikey") {
			yk, err := piv.Open(card)
			if err != nil {
				continue
			}
			defer yk.Close()

			cert, err := yk.Certificate(piv.SlotAuthentication)
			if err != nil {
				continue
			}

			certList = append(certList, cert.Subject.CommonName)
		}
	}

	if len(certList) == 0 {
		return nil, errors.New("yubikey found but no authentication certificates detected")
	}

	return certList, nil
}

func main() {
	info, err := YubiKeyInfo()
	if err != nil {
		panic(err)
	}
	for _, cert := range info {
		println(cert)
	}
}
