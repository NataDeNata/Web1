window.addEventListener("DOMContentLoaded", () => {
    const savedNotesContainer = document.getElementById("savedNotesContainer"); // Add this container to your HTML
    
    // Retrieve saved notes from local storage
    const savedNotes = JSON.parse(localStorage.getItem("savedNotes")) || [];
    
    // Loop through saved notes and display them
    savedNotes.forEach((note, index) => {
        const noteElement = document.createElement("div");
        noteElement.className = "saved_note";
        
        const noteContent = document.createElement("p");
        noteContent.textContent = note;

        // Optionally add delete functionality
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            savedNotes.splice(index, 1); // Remove note from array
            localStorage.setItem("savedNotes", JSON.stringify(savedNotes)); // Update local storage
            noteElement.remove(); // Remove note element from the page
        });

        // Append elements to the saved note container
        noteElement.appendChild(noteContent);
        noteElement.appendChild(deleteButton);
        savedNotesContainer.appendChild(noteElement);
    });
});