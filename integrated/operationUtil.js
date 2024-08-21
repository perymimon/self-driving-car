 export function loadJsonFile(event, memoName){
     var { promise, resolve, reject } = Promise.withResolvers()
     const file = event.target.files[0]
     localStorage.setItem(memoName, file.name)
     if (!file) {
         reject('No File selected')
         alert('No File selected')
         return
     }
     let reader = new FileReader()
     reader.onload = (evt) => {
         let fileContent = evt.target.result
         let jsonData = JSON.parse(fileContent)

         resolve(jsonData)

     }
     reader.readAsText(file)
     return promise
 }

 export async function fetchFile(fileName){
    var res = await fetch(fileName)
     debugger
 }

 export async function loadLastFile(memoName){
    var filename = localStorage.getItem(memoName);
    if(filename)
        return fetchFile(filename)
 }