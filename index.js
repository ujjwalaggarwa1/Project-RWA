// name setting

fetch('config.json')
    .then(response => response.json())
    .then(data => {
        const name = document.getElementById('name');
        const title = document.getElementById('title')
        name.textContent = data.name;
        title.textContent = data.name;
    })
    // handle error if the file is missing
    .catch(error => {
        console.error("Error loading JSON:", error);
    });

