document.getElementById('file-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const followingFile = document.getElementById('following-file').files[0];
    const followersFile = document.getElementById('followers-file').files[0];

    if (!followingFile || !followersFile) {
        alert('Please upload both files!');
        return;
    }

    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '<p>Processing files...</p>';

    try {
        // Read the content of both files
        const followingText = await readFileContent(followingFile);
        const followersText = await readFileContent(followersFile);

        // Parse and normalize the text
        const following = parseContent(followingText);
        const followers = parseContent(followersText);

        // Find accounts not following back
        const notFollowingBack = following.filter(account => !followers.includes(account));

        // Display the output
        outputDiv.innerHTML = `<h3>Not Following Back:</h3>`;
        if (notFollowingBack.length === 0) {
            outputDiv.innerHTML += '<p>Everyone follows back!</p>';
        } else {
            outputDiv.innerHTML += `<ul>${notFollowingBack.map(account => `<li>${account}</li>`).join('')}</ul>`;
        }
    } catch (error) {
        outputDiv.innerHTML = `<p>Error processing files: ${error.message}</p>`;
    }
});

// Function to read file content
async function readFileContent(file) {
    const fileType = file.type;

    if (fileType === 'text/plain' || fileType === '') {
        // Read .txt file
        return file.text();
    } else if (fileType === 'text/html') {
        // Read .html file
        const text = await file.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        return doc.body.textContent; // Extract plain text from the HTML body
    } else if (fileType === 'application/pdf') {
        // Read .pdf file using PDF.js
        const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.min.js');
        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;

        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join('\n');
        }
        return text;
    } else {
        throw new Error('Unsupported file type');
    }
}

// Function to parse and normalize content
function parseContent(content) {
    return content
        .split('\n')
        .map(line => line.trim().toLowerCase()) // Normalize text (trim spaces, convert to lowercase)
        .filter(Boolean); // Remove empty lines
}
