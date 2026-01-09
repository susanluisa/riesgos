const production1 = [
  { toy: 'car', quantity: 3 },
  { toy: 'doll', quantity: 1 },
  { toy: 'ball', quantity: 2 }
]

function manufactureGifts(arr) {
  const total = arr.reduce((sum, item) => sum + item.quantity, 0);
  const out = new Array(total);
  let pos = 0;

  arr.forEach(({ quantity, toy }) => {
    out.fill(toy, pos, pos + quantity);
    pos += quantity;
  });

  return out;
}


console.log(manufactureGifts(production1))

