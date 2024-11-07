document.querySelector("form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevents page reload

    // Get form data
    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;

    // Send data to the server
    fetch("http://localhost:3000/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            email: email
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Your signature has already been added!") {
            alert(data.message); // Display a message if the user has already signed
        } else {
            alert(data.message); // Thank you message
            // Update the count on the page
            document.querySelector(".info h1").textContent = `Over ${data.count} People`;
        }
    })
    .catch(error => console.error("Error:", error));
});
