# Ejercicio 4: Conversor de Unidades

proporciones = {
    "distancia": { 
        "metros": 1.0, "kilometros": 1000.0, "centimetros": 0.01, "milimetros": 0.001
    },
    "masa": {
        "gramos": 1.0, "kilogramos": 1000.0, "miligramos": 0.001, "libra": 453.592
    }
}

def conversor_unidades(valor, unidad_origen, unidad_destino, categoria):
    valor_base = valor * proporciones[categoria][unidad_origen]    
    return valor_base / proporciones[categoria][unidad_destino]

print("--- Sistema de Conversión de Unidades ---")

while True:
    categoria = input("\nSeleccione una categoría \n1.Distancia \n2.Masa \n3.Salir \nSeleccione una opcion: ").lower()
    
    match categoria:
        case "distancia":
            print("Unidades disponibles: metros, kilometros, centimetros, milimetros")
        case "masa":
            print("Unidades disponibles: gramos, kilogramos, miligramos, libra")
        case "salir":
            print("Saliendo del sistema...")
            break
        case _:
            print("Categoría no válida.")
            continue

    origen = input("Unidad origen: ").lower()
    destino = input("Unidad destino: ").lower()

    if origen not in proporciones[categoria] or destino not in proporciones[categoria]:
        print("Unidades no válidas para esta categoría.")
        continue
    
    valor = float(input("Valor a convertir: "))
    resultado = conversor_unidades(valor, origen, destino, categoria)
    print(f"-> {valor} {origen} equivalen a {resultado} {destino}")

    if input("\n¿Desea otra conversión? (si/no): ").lower() != "si":
        print("Saliendo del sistema...")
        break