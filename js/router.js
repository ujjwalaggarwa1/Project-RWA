

function page(file, parent_id) {
    return fetch(`./pages/${file}.html`)
        .then(response => {
            if (!response.ok) throw new Error(`${file}.html: ${response.status}`);
            return response.text();
        })
        .then(html => {
            document.getElementById(parent_id).innerHTML = html;
        })
        .catch(error => {
            console.error("Error loading page:", error);
        });
}

