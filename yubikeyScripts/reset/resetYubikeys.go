package main

import (
	"fmt"

	"github.com/ebfe/scard"
)

func main() {
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

	fmt.Println("☢️  INICIANDO FACTORY RESET DEL MÓDULO OPENPGP...")

	// 1. BLOQUEAR PIN DE USUARIO (PW1)
	// Intentamos verificar '000000' hasta que de error 69 83 (Blocked)
	fmt.Println("   -> Bloqueando PIN de Usuario...")
	blockPIN(client, 0x81) // 81 = User PIN

	// 2. BLOQUEAR PIN DE ADMIN (PW3)
	fmt.Println("   -> Bloqueando PIN de Admin...")
	blockPIN(client, 0x83) // 83 = Admin PIN

	// 3. TERMINATE (Borrado lógico) - 00 E6 00 00
	fmt.Println("   -> Ejecutando TERMINATE...")
	resp, _ := client.Transmit([]byte{0x00, 0xE6, 0x00, 0x00})
	if len(resp) < 2 || resp[len(resp)-2] != 0x90 {
		panic(fmt.Sprintf("Fallo al terminar: %X", resp))
	}

	// 4. ACTIVATE (Reactivación limpia) - 00 44 00 00
	fmt.Println("   -> Ejecutando ACTIVATE...")
	resp, _ = client.Transmit([]byte{0x00, 0x44, 0x00, 0x00})
	if len(resp) < 2 || resp[len(resp)-2] != 0x90 {
		panic(fmt.Sprintf("Fallo al activar: %X", resp))
	}

	fmt.Println("✅ ¡RESET COMPLETADO! La tarjeta está limpia y lista para ECC.")
}

func blockPIN(client *scard.Card, pinType byte) {
	// PIN incorrecto dummy
	wrongPIN := []byte("00000000")

	for {
		// Comando VERIFY
		apdu := append([]byte{0x00, 0x20, 0x00, pinType, byte(len(wrongPIN))}, wrongPIN...)
		resp, _ := client.Transmit(apdu)

		sw1 := resp[len(resp)-2]
		sw2 := resp[len(resp)-1]

		if sw1 == 0x69 && sw2 == 0x83 {
			// 69 83 = Authentication method blocked
			return // ¡Éxito! Está bloqueado
		}

		if sw1 == 0x63 {
			// 63 CX = Quedan X intentos. Seguimos intentando.
			continue
		}

		// Cualquier otro error inesperado
		fmt.Printf("   (Estado extraño: %X %X) \n", sw1, sw2)
	}
}
