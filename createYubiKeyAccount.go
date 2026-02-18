package main

import (
	vanillacrypto "crypto"
	"crypto/ecdsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"errors"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/go-piv/piv-go/piv"
)

// Config define las credenciales de la YubiKey
type Config struct {
	PIN           string
	ManagementKey [24]byte
	AlwaysReplace bool
}

func CreateYubiKeyAccount(cfg Config) (common.Address, error) {
	// 1. Manejo de valores por defecto
	pin := cfg.PIN
	if pin == "" {
		pin = piv.DefaultPIN
	}

	mgmtKey := cfg.ManagementKey
	if mgmtKey == [24]byte{} {
		mgmtKey = piv.DefaultManagementKey
	}

	// 2. Detectar y abrir YubiKey
	cards, err := piv.Cards()
	if err != nil {
		return common.Address{}, fmt.Errorf("error listando tarjetas: %v", err)
	}

	var yk *piv.YubiKey
	for _, card := range cards {
		if strings.Contains(strings.ToLower(card), "yubikey") {
			yk, err = piv.Open(card)
			if err != nil {
				return common.Address{}, err
			}
			break
		}
	}

	if yk == nil {
		return common.Address{}, errors.New("no se detectó ninguna YubiKey")
	}
	defer yk.Close()

	// 3. Verificar si el slot ya está ocupado
	existingCert, err := yk.Certificate(piv.SlotAuthentication)
	if err == nil && existingCert != nil && !cfg.AlwaysReplace {
		addr := crypto.PubkeyToAddress(*(existingCert.PublicKey.(*ecdsa.PublicKey)))
		return addr, fmt.Errorf("slot ocupado por la dirección %s. Usa AlwaysReplace=true", addr.Hex())
	}

	// 4. Generar nueva clave en el hardware
	keyOpts := piv.Key{
		Algorithm:   piv.AlgorithmEC256,
		PINPolicy:   piv.PINPolicyAlways,
		TouchPolicy: piv.TouchPolicyNever,
	}

	pubKey, err := yk.GenerateKey(mgmtKey, piv.SlotAuthentication, keyOpts)
	if err != nil {
		return common.Address{}, fmt.Errorf("error generando clave: %v", err)
	}

	ecdsaPubKey, ok := pubKey.(*ecdsa.PublicKey)
	if !ok {
		return common.Address{}, errors.New("la clave generada no es ECDSA compatible con Ethereum")
	}

	address := crypto.PubkeyToAddress(*ecdsaPubKey)

	// 5. Preparar plantilla del certificado
	template := x509.Certificate{
		SerialNumber: big.NewInt(time.Now().Unix()),
		Subject: pkix.Name{
			Organization: []string{"Geth Managed YubiKey"},
			CommonName:   address.Hex(),
		},
		NotBefore: time.Now(),
		NotAfter:  time.Now().AddDate(10, 0, 0), // 10 años de validez
		KeyUsage:  x509.KeyUsageDigitalSignature,
	}

	// 6. Obtener el firmante (Signer) de la YubiKey para la autofirma
	// Esto es crucial: la clave privada no sale de la llave, se firma internamente.
	auth := piv.KeyAuth{PIN: pin}
	priv, err := yk.PrivateKey(piv.SlotAuthentication, pubKey, auth)
	if err != nil {
		return common.Address{}, fmt.Errorf("error obteniendo interfaz de firma: %v", err)
	}

	signer, ok := priv.(vanillacrypto.Signer)
	if !ok {
		return common.Address{}, errors.New("el objeto de clave privada no implementa crypto.Signer")
	}

	// 7. Crear el certificado firmado por el propio hardware
	certBytes, err := x509.CreateCertificate(nil, &template, &template, ecdsaPubKey, signer)
	if err != nil {
		return common.Address{}, fmt.Errorf("error firmando certificado: %v", err)
	}

	newCert, err := x509.ParseCertificate(certBytes)
	if err != nil {
		return common.Address{}, fmt.Errorf("error parseando certificado generado: %v", err)
	}

	// 8. Almacenar el certificado en el slot
	if err := yk.SetCertificate(mgmtKey, piv.SlotAuthentication, newCert); err != nil {
		return common.Address{}, fmt.Errorf("error guardando certificado en slot: %v", err)
	}

	return address, nil
}

/* func main() {
	// Ejemplo de uso con valores por defecto
	config := Config{
		AlwaysReplace: true,
		// PIN: "123456", // Si se omite, usa el default
		// ManagementKey: [24]byte{...}, // Si se omite, usa la default
	}

	address, err := CreateYubiKeyAccount(config)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}

	fmt.Printf("Cuenta creada exitosamente\n")
	fmt.Printf("Dirección Ethereum: %s\n", address.Hex())
} */
