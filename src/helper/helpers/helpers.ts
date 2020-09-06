export function getResult(entity: any[]) {
  try {
    return entity[0];
  } catch (err) {
    throw new Error("Return null")
  }
}