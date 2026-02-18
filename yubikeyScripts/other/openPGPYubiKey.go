package main

import (
	"crypto/sha256"
	"fmt"

	"github.com/ebfe/scard"
)

func main() {
	// --- 1. CONEXIÓN (Lo que ya tenías) ---
	ctx, _ := scard.EstablishContext()
	defer ctx.Release()
	readers, _ := ctx.ListReaders()
	if len(readers) == 0 {
		panic("No YubiKey found")
	}
	client, _ := ctx.Connect(readers[0], scard.ShareShared, scard.ProtocolAny)
	defer client.Disconnect(scard.LeaveCard)

	// Select OpenPGP Applet
	client.Transmit([]byte{0x00, 0xA4, 0x04, 0x00, 0x06, 0xD2, 0x76, 0x00, 0x01, 0x24, 0x01})

	// --- 2. VERIFICAR PIN (OBLIGATORIO PARA FIRMAR) ---
	// Comando VERIFY (00 20)
	// P2 = 81: Verifica el PIN de Firma (PW1 mode 81).
	// Si usaras 82, sería para desencriptar/autenticar.
	pin := []byte("123456")

	// Construimos APDU: [CLA INS P1 P2 Lc Data]
	// 00 20 00 81 06 313233343536
	verifyAPDU := append([]byte{0x00, 0x20, 0x00, 0x81, byte(len(pin))}, pin...)

	resp, err := client.Transmit(verifyAPDU)
	if err != nil {
		panic(err)
	}

	if resp[len(resp)-2] != 0x90 {
		panic(fmt.Sprintf("❌ Error de PIN. Código: %X (Si es 63Cx, te quedan x intentos)", resp[len(resp)-2:]))
	}
	fmt.Println("🔓 PIN Verificado correctamente.")

	// --- 3. PREPARAR DATOS (HASHING) ---
	mensaje := "Hola YubiKey"
	fmt.Printf("📝 Firmando mensaje: '%s'\n", mensaje)

	// A. Calcular SHA-256
	hasher := sha256.New()
	hasher.Write([]byte(mensaje))
	hash := hasher.Sum(nil) // 32 bytes

	// B. Añadir Header PKCS#1 v1.5 para SHA-256 (Estándar crypto)
	// Esto le dice al verificador: "Oye, esto es un hash SHA-256"
	digestInfoPrefix := []byte{
		0x30, 0x31, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01,
		0x65, 0x03, 0x04, 0x02, 0x01, 0x05, 0x00, 0x04, 0x20,
	}

	dataToSign := append(digestInfoPrefix, hash...)

	// --- 4. FIRMAR (COMPUTE DIGITAL SIGNATURE) ---
	// Comando: 00 2A 9E 9A
	// INS 2A: Perform Security Operation
	// P1 9E: Digital Signature
	// P2 9A: Algorithm Input (Signature Key Fingerprint implicit)

	signAPDU := append([]byte{0x00, 0x2A, 0x9E, 0x9A, byte(len(dataToSign))}, dataToSign...)
	// Añadimos Le=00 al final para esperar respuesta máxima
	signAPDU = append(signAPDU, 0x00)

	signature, err := client.Transmit(signAPDU)
	if err != nil {
		panic(err)
	}

	if signature[len(signature)-2] == 0x90 {
		fmt.Println("✅ ¡DOCUMENTO FIRMADO EXITOSAMENTE!")
		fmt.Printf("📜 Firma RSA (Hex): %X\n", signature[:len(signature)-2])
		fmt.Println("(Esta firma puede ser verificada con tu clave pública)")
	} else {
		fmt.Printf("❌ Error al firmar: %X\n", signature[len(signature)-2:])
	}
}
