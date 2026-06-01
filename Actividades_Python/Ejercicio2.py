# #Ejercicio 2: Lista de Compras Interactiva

lista_compras = []
opcion = 0

while opcion != 4:

    opcion = int(input("\n--- LISTA DE COMPRAS --- \n1. Agregar ítem \n2. Eliminar ítem \n3. Ver lista completa \n4. Salir \nSeleccione una opción: "))

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