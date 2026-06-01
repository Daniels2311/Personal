# #Ejercicio 2: Lista de Compras Interactiva
lista_compras = []
opcion = 0

while opcion != 4:

    print("\n--- LISTA DE COMPRAS ---")
    print("1. Agregar ítem")
    print("2. Eliminar ítem")
    print("3. Ver lista completa")
    print("4. Salir")

    opcion = int(input("Seleccione una opción: "))

    match opcion:
        case 1:
            item = input("Ingrese el producto que desea agregar: ")
            lista_compras.append(item)
            print("Producto agregado correctamente.")

        case 2:
            item = input("Ingrese el producto que desea eliminar: ")
            if item in lista_compras:
                lista_compras.remove(item)
                print("Producto eliminado correctamente.")
            else:
                print("El producto no está en la lista.")

        case 3:
            if len(lista_compras) > 0:
                print("\nLista de compras:")
                for producto in lista_compras:
                    print("-", producto)
            else:
                print("La lista está vacía.")

        case 4:
            print("Saliendo del programa...")

        case _:
            print("Opción no válida. Intente nuevamente.")