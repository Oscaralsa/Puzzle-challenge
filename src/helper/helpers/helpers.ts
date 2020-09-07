export function getResult(entity: any[]) {
  try {
    return entity[0];
  } catch (err) {
    throw new Error("Return null")
  }
}

export function getCurrentDate() {
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, "0");
  let mm = String(today.getMonth() + 1).padStart(2, "0"); 
  let yyyy = today.getFullYear();
  let seconds = today.getSeconds();
  let minutes = today.getMinutes();
  let hour = today.getHours();

  let Hour = `${hour}:${minutes}:${seconds}`;
  let Day = mm + "/" + dd + "/" + yyyy;

  return {Hour, Day}
}