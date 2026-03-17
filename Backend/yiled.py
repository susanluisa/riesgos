# def bloques(lista, tamaño):
#     for i in range(0, len(lista), tamaño):
#         yield lista[i : i + tamaño]


# for bloque in bloques([1, 2, 3, 4, 5, 6, 7], 3):
#     print(bloque)

gifts = ["ball", "car", "hfhdh#"]


def non_defective_gift():
    item = []

    for gift in gifts:
        if "#" not in gift:
            item.append(gift)
    return item


print(non_defective_gift())
