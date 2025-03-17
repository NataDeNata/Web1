const notesContainer = document.querySelector(".notes_Container");
const createBtn = document.querySelector(".btn");
let notes = document.querySelectorAll("#notes_area");

createBtn.addEventListener("click", ()=>{
    let notesArea = document.createElement("p");
    let img = document.createElement("img");
    notesArea.id = "notes_area";
    img.src = "trash.png";
    notesContainer.appendChild(notesArea).appendChild(img);
})

notesContainer.addEventListener("click", function(e){
    if(e.target.tagName === "IMG"){
        e.target.parentElement.remove();
    }

})