# # Ejercicio 1: Análisis de Calificaciones en una Lista

def analizar_calificaciones(lista):

    suma = 0

    for nota in lista:
        suma = suma + nota

    promedio = suma / len(lista)
    mayor = max(lista)
    menor = min(lista)

    print("Promedio:", promedio)
    print("Calificación más alta:", mayor)
    print("Calificación más baja:", menor)

    return (promedio, mayor, menor)

# Lista de ejemplo
calificaciones = [4.5, 3.8, 5.0, 2.9, 4.2]
analizar_calificaciones(calificaciones)