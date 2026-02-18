package main

import (
	"bytes"
	"encoding/hex"
	"fmt"

	"github.com/ebfe/scard"
)

func main() {
	// 1. CONEXIÓN
	ctx, _ := scard.EstablishContext()
	defer ctx.Release()
	readers, _ := ctx.ListReaders()
	if len(readers) == 0 {
		panic("No YubiKey found")
	}
	client, _ := ctx.Connect(readers[0], scard.ShareShared, scard.ProtocolAny)
	defer client.Disconnect(scard.LeaveCard)

	// Seleccionar OpenPGP
	client.Transmit([]byte{0x00, 0xA4, 0x04, 0x00, 0x06, 0xD2, 0x76, 0x00, 0x01, 0x24, 0x01})

	fmt.Println("🔓 Verificando PIN Admin...")
	// PIN Admin por defecto: 12345678
	check(client, []byte{0x00, 0x20, 0x00, 0x83, 0x08, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38})

	// 2. CONFIGURAR RSA 4096 (Tag C1)
	// Si tu tarjeta es v2.1, soporta RSA 4096 pero hay que configurarlo explícitamente.
	fmt.Println("⚙️  Configurando slot de Firma a RSA 4096...")

	// Estructura Atributo RSA:
	// [ID: 01] [Len Modulus: 10 00 (4096)] [Len Exponent: 00 20 (32 bits)] [Import Format: 00]
	// Nota: Algunas tarjetas v2.1 requieren exponente length 00 11 (17 bits).
	// Probaremos el estándar primero.
	rsa4096Attr := []byte{0x01, 0x10, 0x00, 0x00, 0x20, 0x00}

	putData := append([]byte{0x00, 0xDA, 0x00, 0xC1, byte(len(rsa4096Attr))}, rsa4096Attr...)

	resp, err := client.Transmit(putData)
	if err != nil || len(resp) < 2 || resp[len(resp)-2] != 0x90 {
		fmt.Println("⚠️  Fallo RSA 4096 estándar. Intentando compatibilidad (Exponent len 17)...")
		// Intento secundario para firmwares antiguos
		rsa4096Compat := []byte{0x01, 0x10, 0x00, 0x00, 0x11, 0x00}
		putDataCompat := append([]byte{0x00, 0xDA, 0x00, 0xC1, byte(len(rsa4096Compat))}, rsa4096Compat...)
		check(client, putDataCompat)
	}
	fmt.Println("✅ Configurado a RSA 4096.")

	// 3. GENERAR LLAVE (Esta operación tarda unos 5-10 segundos en RSA 4k)
	fmt.Println("⚡ Generando llave RSA 4096 (Espere, esto tarda)...")
	// Generate en Slot Firma (B6)
	genAPDU := []byte{0x00, 0x47, 0x80, 0x01, 0x02, 0xB6, 0x00}

	respGen, err := client.Transmit(genAPDU)
	if err != nil {
		panic(err)
	}

	if respGen[len(respGen)-2] == 0x90 {
		fmt.Println("✅ ¡Llave Generada!")

		// 4. PARSEAR Y MOSTRAR LLAVE PÚBLICA
		// La respuesta contiene: [Tag 7F49] [L] [Tag 81 (Mod)] [L] [Modulus] [Tag 82 (Exp)] [L] [Exp]
		data := respGen[:len(respGen)-2]

		fmt.Println("\n--- 📜 TU LLAVE PÚBLICA (RSA 4096) ---")

		// Buscar Módulo (Tag 81)
		modIdx := bytes.Index(data, []byte{0x81, 0x82}) // 81 82... (High byte length)
		if modIdx != -1 {
			// Asumimos formato extendido de longitud para 4096 bits (2 bytes length)
			// Tag 81 (1) + Len (2) + Modulus (512)
			start := modIdx + 3
			if start+512 <= len(data) {
				modulus := data[start : start+512]
				fmt.Printf("Módulo (n) [Primeros 32 bytes]: %X...\n", modulus[:32])
				fmt.Printf("Longitud Módulo: %d bytes (%d bits)\n", len(modulus), len(modulus)*8)
			}
		} else {
			// Fallback búsqueda simple
			fmt.Println("(No pude parsear el módulo automáticamente, imprimiendo raw data)")
			fmt.Printf("Raw Data: %s\n", hex.EncodeToString(data))
		}

		// Buscar Exponente (Tag 82)
		expIdx := bytes.Index(data, []byte{0x82})
		if expIdx != -1 {
			// El exponente suele ser corto (3 o 4 bytes)
			// Saltamos Tag 82 y miramos longitud
			expLen := int(data[expIdx+1])
			if expIdx+2+expLen <= len(data) {
				exponent := data[expIdx+2 : expIdx+2+expLen]
				fmt.Printf("Exponente (e): %X\n", exponent)
			}
		}

	} else {
		fmt.Printf("❌ Error al generar: %X\n", respGen[len(respGen)-2:])
	}
}

func check(client *scard.Card, apdu []byte) {
	resp, err := client.Transmit(apdu)
	if err != nil {
		panic(err)
	}
	if len(resp) < 2 || resp[len(resp)-2] != 0x90 {
		panic(fmt.Sprintf("Fallo APDU: %X", resp[len(resp)-2:]))
	}
}
