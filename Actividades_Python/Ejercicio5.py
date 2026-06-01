# Ejercicio 5: Mini Sistema de Gestion de Inventario
inventario = []

def agregar_producto():
    nombre = input("Ingrese el nombre del producto: ")
    precio = float(input("Ingrese el precio del producto: "))
    cantidad = int(input("Ingrese la cantidad del producto: "))

    producto = {
        "nombre": nombre,
        "precio": precio,
        "cantidad": cantidad
    }

    inventario.append(producto)
    print("Producto agregado correctamente.")

def realizar_venta():
    nombre = input("Ingrese el nombre del producto vendido: ")
    cantidad_vendida = int(input("Ingrese la cantidad vendida: "))

    for producto in inventario:
        if producto["nombre"].lower() == nombre.lower():

            if producto["cantidad"] >= cantidad_vendida:
                producto["cantidad"] = producto["cantidad"] - cantidad_vendida
                print("Venta realizada correctamente.")
            else:
                print("No hay suficiente cantidad disponible.")
            return

    print("Producto no encontrado.")

def mostrar_inventario():

    if len(inventario) == 0:
        print("El inventario esta vacio.")
    else:
        print("\n--- INVENTARIO ---")

        for producto in inventario:
            print(f"Nombre: {producto['nombre']}")
            print(f"Precio: ${producto['precio']}")
            print(f"Cantidad: {producto['cantidad']}")
            print("-" * 30)

while True:

    opcion = int(input("\n----- MENU ----- \n1. Agregar producto \n2. Realizar venta \n3. Mostrar inventario \n4. Salir \nSeleccione una opcion: "))

    match opcion:
        case 1: 
            agregar_producto()
        case 2:
            realizar_venta()
        case 3:
            mostrar_inventario()
        case 4:
            print("Programa finalizado.")
            break
        case _:
            print("Opcion no valida")