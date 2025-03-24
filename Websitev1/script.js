function createNote() {
    const notesList = document.getElementById("notesList");
    const button = document.querySelector(".btn");
    const welcomeNote = document.getElementById("welcome_Note");



    if (!notesList) {
        console.error("Notes list container not found!");
        return;
    }

    //  note container
    const noteContainer = document.createElement("div");
    noteContainer.className = "notes_Container";

    // delete icon 
    const deleteIcon = document.createElement("img"); //creation of delete icon
    deleteIcon.src = "trash.png";
    deleteIcon.alt = "Delete";
    deleteIcon.id = "delete_icon";
    deleteIcon.style.cursor = "pointer";

    const saveIcon = document.createElement("img"); //creation of save icon
    saveIcon.src = "save.png";
    saveIcon.alt = "Save";
    saveIcon.id = "save_icon";
    saveIcon.style.cursor = "pointer";  


    //  delete function
    deleteIcon.addEventListener("click", () => {
        notesList.removeChild(noteContainer);
    });

    //  editable textarea
    const textarea = document.createElement("textarea");
    textarea.className = "notes_area";

    // Append elements
    noteContainer.appendChild(saveIcon);
    noteContainer.appendChild(deleteIcon);
    noteContainer.appendChild(textarea);
    notesList.appendChild(noteContainer);

    //button repositions
    button.style.right = "45%";
    
    // hides welcome note
    welcomeNote.style.display = "none";


//tooltip container
const tooltip = document.createElement("div");
tooltip.className = "tooltip";

//tooltip text
const tooltipText = document.createElement("span");
tooltipText.className = "tooltiptext";
tooltipText.textContent = "Click to save the note";

tooltip.appendChild(saveIcon); 
tooltip.appendChild(tooltipText);
noteContainer.appendChild(tooltip);


    // Only proceed if the user clicks "OK"
    saveIcon.addEventListener("click", () => {
        //if note is empty

        // sk for user confirmation
        const userConfirmation = confirm("Do you want to save and download your note?");
        
        if (userConfirmation) {
            const content = textarea.value;
            if (!content.trim()) {
                alert("Cannot save an empty note!"); 
                return;
            }
    
            // Create a Blob object with the content
            const blob = new Blob([content], { type: "text/plain" });
    
            // Create a temporary download link
            const link = document.createElement("a");
            link.download = "note.txt"; // Specify the file name
            link.href = URL.createObjectURL(blob);
    
            // Trigger the download
            link.click();
    
            // Clean up the URL object
            URL.revokeObjectURL(link.href);
    
            // Retrieve existing notes from local storage
            let savedNotes = JSON.parse(localStorage.getItem("savedNotes")) || [];
            
            
            // Add the current note to the saved notes array
            savedNotes.push(content); // Corrected here
    
            // Update local storage with the new notes list
            localStorage.setItem("savedNotes", JSON.stringify(savedNotes));
    
            alert("Your note has been saved successfully!");

        
        } else {
            console.log("File download canceled by the user.");
        }
        
    });

    
}

