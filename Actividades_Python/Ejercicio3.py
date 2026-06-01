#Ejercicio 3: Agenda de Contactos con Diccionario
agenda = {}

def agregar_contacto():

    nombre = input("Ingrese el nombre del contacto: ")
    telefono = input("Ingrese el número de teléfono: ")

    agenda[nombre] = telefono

    print("Contacto agregado correctamente.")

def buscar_contacto():

    nombre = input("Ingrese el nombre del contacto: ")
    if nombre in agenda:
        print("El número de teléfono es:", agenda[nombre])

    else:
        print("El contacto no existe.")

def mostrar_contactos():
    if len(agenda) > 0:
        print("\n--- LISTA DE CONTACTOS ---")
        for nombre, telefono in agenda.items():
            print(nombre, ":", telefono)

    else:
        print("La agenda está vacía.")

opcion = 0

while opcion != 4:

    opcion = int(input("\n--- AGENDA DE CONTACTOS --- \n1. Añadir nuevo contacto \n2. Buscar teléfono de un contacto \n3. Mostrar todos los contactos \n4. Salir Seleccione una opción: "))

    match opcion:
        case 1:
            agregar_contacto()
        case 2:
            buscar_contacto()
        case 3:
            mostrar_contactos()
        case 4:
            print("Saliendo del programa...")
        case _:
            print("Opción no válida.")