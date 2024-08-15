 export function loadJsonFile(event){
     var { promise, resolve, reject } = Promise.withResolvers()
     const file = event.target.files[0]
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